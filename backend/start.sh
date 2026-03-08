#!/bin/bash
# Backend startup script - runs FastAPI on port 8000

# Change to backend directory
cd "$(dirname "$0")"

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install fastapi uvicorn httpx python-dotenv
else
    source venv/bin/activate
fi

# Start the FastAPI server on port 8000
echo "Starting FastAPI server on http://localhost:8000"
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
