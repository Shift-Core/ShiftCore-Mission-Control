import os
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

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
)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(
    request: Request,
    _exc: RequestValidationError,
) -> JSONResponse:
    trace_id = (
        request.headers.get("x-request-id")
        or f"req_{uuid4()}"
    )

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
        "mode": os.getenv("AI_PROVIDER", "deterministic"),
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
) -> SummaryPreviewResponse:
    return build_deterministic_summary(request)
