# ShiftCore React Web - Placeholder Dockerfile (R24-04)
# Owner: Web owner (to be confirmed)
# Stack: React

FROM node:20-alpine AS placeholder
WORKDIR /app
RUN echo "Web Frontend Dockerfile placeholder - owned by Web owner" > /app/PLACEHOLDER.txt
RUN printf '%s\n' '{"status":"ok","service":"frontend","version":"0.1.0"}' > /app/health
RUN npm install -g http-server
CMD ["http-server", "-p", "3000"]
