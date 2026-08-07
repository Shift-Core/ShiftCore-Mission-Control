# ShiftCore AI/Data API - Placeholder Dockerfile (R24-04)
# Owner: Peter
# Stack: FastAPI
# Non-persisted deterministic preview. No database schema required.

FROM python:3.12-slim AS placeholder
WORKDIR /app
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
RUN echo "AI/Data API Dockerfile placeholder - owned by Peter" > /app/PLACEHOLDER.txt
RUN pip install fastapi uvicorn
RUN echo "from fastapi import FastAPI\napp = FastAPI()\n@app.get('/health')\ndef health(): return 'OK'\n" > main.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
