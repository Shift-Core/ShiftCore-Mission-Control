#!/usr/bin/env bash
set -e

echo "Starting local environment initialization..."

if [ -f .env ]; then
  echo ".env file already exists. Skipping copy to avoid overwriting your secrets."
else
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "Successfully created .env from .env.example."
  else
    echo "Error: .env.example not found!"
    exit 1
  fi
fi

echo "Initialization complete. You can now run 'docker compose up -d' or configure your .env file as needed."
