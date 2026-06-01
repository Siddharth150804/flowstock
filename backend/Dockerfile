# Build using lightweight official Python base image
FROM python:3.11-slim

# Set environment system variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establish working directory
WORKDIR /app

# Copy dependency mappings
COPY requirements.txt .

# Install dependencies without local pip cache overhead
RUN pip install --no-cache-dir -r requirements.txt

# Copy source repository
COPY . .

# Expose API runtime port
EXPOSE 8000

# Execute server using uvicorn production flags
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
