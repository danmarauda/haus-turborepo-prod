# HAUS Voice Agent Dockerfile
# For deployment to LiveKit Cloud

FROM python:3.12-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for fast package installation
RUN pip install uv

# Copy project files
COPY pyproject.toml ./
COPY agent.py ./

# Install dependencies
RUN uv sync --frozen

# Download model files (VAD, turn detector)
RUN uv run agent.py download-files

# Set environment variables (set at runtime)
ENV LIVEKIT_API_KEY=""
ENV LIVEKIT_API_SECRET=""
ENV LIVEKIT_URL=""
ENV CONVEX_URL=""
ENV OPENAI_API_KEY=""
ENV ELEVENLABS_API_KEY=""

# Expose health check port
EXPOSE 8080

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Run the agent
CMD ["uv", "run", "agent.py", "start"]
