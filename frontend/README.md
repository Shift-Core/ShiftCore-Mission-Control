# React Web Frontend

**Owner:** Augesta Antar

## Purpose
This directory contains the React frontend application for ShiftCore Mission Control. It owns the user interface and interacts with the backend services through the Nginx gateway.

## Container Contract
- **Build Context:** `./frontend`
- **Internal Port:** 3000
- **Health Endpoint:** `/health/frontend` (handled by Gateway) or `/` internally.
