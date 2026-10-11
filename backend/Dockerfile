FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2 and SSL
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Ensure uploads directory exists
RUN mkdir -p uploads

EXPOSE 8000

ENV PORT=8000

# Start script executes migrations, seeds initial data if missing, and boots Uvicorn
CMD ["sh", "-c", "alembic upgrade head && python seed.py && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
