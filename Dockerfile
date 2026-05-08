FROM python:3.11-slim

# Tizim kutubxonalarini o'rnatish (Playwright uchun)
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc-s1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libpango-1.0-0 \
    libcairo2 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Fayllarni nusxalash
COPY . .

# Python kutubxonalarini o'rnatish
RUN pip install --no-cache-dir -r requirements.txt
RUN playwright install chromium

# Railway uchun PORT o'zgaruvchisi
ENV PORT=8080

# Botni ishga tushirish
CMD ["sh", "-c", "python migrate.py && python main.py"]
