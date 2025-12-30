# Use exact Python version
FROM python:3.10.13-slim

# Set working directory inside container
WORKDIR /app

# Copy all backend files into container
COPY fyp-backend/ ./

# Upgrade pip and install dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Expose default port
EXPOSE 8000

# Command to run your app
CMD ["gunicorn", "app:app", "--bind", "0.0.0.0:8000"]
