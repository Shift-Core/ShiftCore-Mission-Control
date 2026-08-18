from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path
from typing import Annotated, Any

import jwt
from fastapi import Security
from fastapi.security import APIKeyCookie


DEFAULT_ISSUER = "shiftcore-identity"
DEFAULT_AUDIENCE = "shiftcore-api"
DEFAULT_PUBLIC_KEY_PATH = "/run/secrets/jwt_public"
DEFAULT_COOKIE_NAME = "sc_token"

REQUIRED_CLAIMS = (
    "iss",
    "aud",
    "sub",
    "email",
    "name",
    "role",
    "teamId",
    "iat",
    "nbf",
    "exp",
    "jti",
)

session_cookie = APIKeyCookie(
    name=os.getenv(
        "SC_TOKEN_COOKIE_NAME",
        DEFAULT_COOKIE_NAME,
    ),
    scheme_name="SessionCookie",
    auto_error=False,
)


class AuthenticationRequired(Exception):
    """Raised when a release session cannot be authenticated."""


@lru_cache(maxsize=4)
def _read_public_key(path: str) -> str:
    try:
        return Path(path).read_text(encoding="utf-8")
    except OSError as exc:
        raise AuthenticationRequired from exc


def require_auth(
    sc_token: Annotated[
        str | None,
        Security(session_cookie),
    ],
) -> dict[str, Any]:
    if not sc_token:
        raise AuthenticationRequired

    public_key_path = os.getenv(
        "JWT_PUBLIC_KEY_PATH",
        DEFAULT_PUBLIC_KEY_PATH,
    )
    issuer = os.getenv(
        "JWT_ISSUER",
        DEFAULT_ISSUER,
    )
    audience = os.getenv(
        "JWT_AUDIENCE",
        DEFAULT_AUDIENCE,
    )

    try:
        return jwt.decode(
            sc_token,
            _read_public_key(public_key_path),
            algorithms=["RS256"],
            issuer=issuer,
            audience=audience,
            leeway=30,
            options={
                "require": list(REQUIRED_CLAIMS),
            },
        )
    except (
        jwt.PyJWTError,
        ValueError,
        TypeError,
    ) as exc:
        raise AuthenticationRequired from exc
