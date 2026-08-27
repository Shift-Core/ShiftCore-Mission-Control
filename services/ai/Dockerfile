FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY services/ai/requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY services/ai/app ./app
COPY services/ai/fixtures ./fixtures
COPY contracts/ai.openapi.yaml ./contracts/ai.openapi.yaml
RUN chmod 0444 ./contracts/ai.openapi.yaml

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
