FROM python:3.12-slim

WORKDIR /app

# Install system deps for Playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

# Install Chromium binaries for both Playwright and rebrowser-playwright (Scrapling)
RUN python -m playwright install --with-deps chromium
RUN python -m rebrowser_playwright install chromium

COPY . .

EXPOSE 8000

CMD ["python", "main.py"]
