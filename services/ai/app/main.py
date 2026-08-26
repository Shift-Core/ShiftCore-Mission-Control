import hmac
import os
import secrets
from pathlib import Path
from typing import Annotated, Any
from uuid import uuid4

from fastapi import (
    Cookie,
    FastAPI,
    Header,
    HTTPException,
    Query,
    Request,
    Security,
)
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse

from .auth import (
    AuthenticationRequired,
    require_auth,
)
from .deterministic import build_deterministic_summary
from .models import (
    ErrorResponse,
    SummaryPreviewRequest,
    SummaryPreviewResponse,
)


app = FastAPI(
    title="ShiftCore AI/Data API",
    version="0.1.0",
    description=(
        "ShiftCore AI/Data deterministic weekly-summary service."
    ),
    docs_url=None,
    redoc_url=None,
    openapi_url=None,
)

DOCS_ACCESS_KEY_ENV = "AI_DOCS_ACCESS_KEY"
DOCS_ACCESS_HEADER = "X-ShiftCore-Docs-Key"
DOCS_SESSION_COOKIE = "sc_ai_docs"
DOCS_SESSION_CONTEXT = b"shiftcore-ai-docs-session-v1"
DOCS_RESPONSE_HEADERS = {
    "Cache-Control": "no-store",
    "Referrer-Policy": "no-referrer",
}
AI_OPENAPI_CONTRACT_PATHS = (
    Path(__file__).resolve().parent.parent.parent.parent
    / "contracts"
    / "ai.openapi.yaml",
    Path("/app/contracts/ai.openapi.yaml"),
)


def _docs_access_denied() -> HTTPException:
    return HTTPException(
        status_code=404,
        detail="Not Found",
    )


def _constant_time_matches(
    candidate: str | None,
    expected: str,
) -> bool:
    try:
        return secrets.compare_digest(
            (candidate or "").encode("utf-8"),
            expected.encode("utf-8"),
        )
    except UnicodeEncodeError:
        return False


def _docs_session_token(access_key: str) -> str:
    return hmac.digest(
        access_key.encode("utf-8"),
        DOCS_SESSION_CONTEXT,
        "sha256",
    ).hex()


def _require_docs_access(
    query_key: str | None,
    gateway_key: str | None,
    session_token: str | None,
) -> str:
    configured_key = os.getenv(DOCS_ACCESS_KEY_ENV)

    if configured_key is None or not configured_key.strip():
        raise _docs_access_denied()

    try:
        expected_session_token = _docs_session_token(configured_key)
    except UnicodeEncodeError:
        raise _docs_access_denied() from None

    query_key_is_valid = _constant_time_matches(
        query_key,
        configured_key,
    )
    gateway_key_is_valid = _constant_time_matches(
        gateway_key,
        configured_key,
    )
    session_is_valid = _constant_time_matches(
        session_token,
        expected_session_token,
    )

    if not (
        query_key_is_valid
        or gateway_key_is_valid
        or session_is_valid
    ):
        raise _docs_access_denied()

    return configured_key


def _ai_openapi_contract_path() -> Path:
    for contract_path in AI_OPENAPI_CONTRACT_PATHS:
        if contract_path.is_file():
            return contract_path

    raise HTTPException(
        status_code=503,
        detail="Documentation unavailable",
    )


def _request_trace_id(request: Request) -> str:
    return (
        request.headers.get("x-request-id")
        or f"req_{uuid4()}"
    )


@app.exception_handler(AuthenticationRequired)
async def authentication_required_handler(
    request: Request,
    _exc: AuthenticationRequired,
) -> JSONResponse:
    trace_id = _request_trace_id(request)

    response = ErrorResponse(
        message="Authentication required.",
        errorCode="AUTH_REQUIRED",
        traceId=trace_id,
    )

    return JSONResponse(
        status_code=401,
        content=response.model_dump(),
        headers={
            "X-Request-Id": trace_id,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    _exc: RequestValidationError,
) -> JSONResponse:
    trace_id = _request_trace_id(request)

    response = ErrorResponse(
        message="Validation failed",
        errorCode="VALIDATION_ERROR",
        traceId=trace_id,
    )

    return JSONResponse(
        status_code=422,
        content=response.model_dump(),
        headers={
            "X-Request-Id": trace_id,
        },
    )


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {
        "status": "ok",
        "service": "ai",
        "mode": os.getenv(
            "AI_PROVIDER",
            "deterministic",
        ),
    }


@app.post(
    "/api/ai/v1/summaries/weekly/preview",
    response_model=SummaryPreviewResponse,
    responses={
        401: {
            "model": ErrorResponse,
            "description": (
                "Missing, invalid, or expired authenticated session"
            ),
        },
        422: {
            "model": ErrorResponse,
            "description": "Request validation failed",
        },
    },
    tags=["summaries"],
)
def preview_weekly_summary(
    request: SummaryPreviewRequest,
    _claims: Annotated[
        dict[str, Any],
        Security(require_auth),
    ],
) -> SummaryPreviewResponse:
    return build_deterministic_summary(request)


@app.get(
    "/api/docs",
    include_in_schema=False,
)
def protected_docs(
    request: Request,
    query_key: Annotated[
        str | None,
        Query(alias="key"),
    ] = None,
    gateway_key: Annotated[
        str | None,
        Header(alias=DOCS_ACCESS_HEADER),
    ] = None,
    docs_session: Annotated[
        str | None,
        Cookie(alias=DOCS_SESSION_COOKIE),
    ] = None,
) -> HTMLResponse:
    configured_key = _require_docs_access(
        query_key,
        gateway_key,
        docs_session,
    )

    response = get_swagger_ui_html(
        openapi_url="/api/docs/openapi.yaml",
        title=f"{app.title} - Swagger UI",
    )
    response.headers.update(DOCS_RESPONSE_HEADERS)
    response.set_cookie(
        key=DOCS_SESSION_COOKIE,
        value=_docs_session_token(configured_key),
        httponly=True,
        samesite="strict",
        secure=(
            request.url.scheme == "https"
            or request.headers.get("x-forwarded-proto") == "https"
        ),
        path="/api/docs",
    )
    return response


@app.get(
    "/api/docs/openapi.yaml",
    include_in_schema=False,
)
def protected_openapi_contract(
    query_key: Annotated[
        str | None,
        Query(alias="key"),
    ] = None,
    gateway_key: Annotated[
        str | None,
        Header(alias=DOCS_ACCESS_HEADER),
    ] = None,
    docs_session: Annotated[
        str | None,
        Cookie(alias=DOCS_SESSION_COOKIE),
    ] = None,
) -> FileResponse:
    _require_docs_access(
        query_key,
        gateway_key,
        docs_session,
    )

    return FileResponse(
        path=_ai_openapi_contract_path(),
        media_type="application/yaml",
        headers=DOCS_RESPONSE_HEADERS,
    )
