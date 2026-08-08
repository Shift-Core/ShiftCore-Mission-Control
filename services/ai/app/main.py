import os

from fastapi import FastAPI


app = FastAPI(
    title="ShiftCore AI/Data API",
    version="0.1.0",
    description=(
        "R24-05 container-ready AI/Data scaffold. "
        "The weekly-summary preview HTTP endpoint is implemented in R24-12."
    ),
)


@app.get("/health", tags=["health"])
def health() -> dict[str, str]:
    return {
	"status": "ok",
	"service": "ai",
	"mode": os.getenv("AI_PROVIDER", "deterministic"),
    }
