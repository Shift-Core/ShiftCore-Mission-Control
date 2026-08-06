# Nginx Gateway

**Owner:** Mohamed Sameh

## Purpose
This directory contains the Nginx gateway configuration. It is the single public entry point for all browser traffic, routing requests to the frontend and backend services.

## Container Contract
- **Build Context:** `./gateway`
- **Internal Port:** 80
- **Health Endpoint:** `/health/frontend`
