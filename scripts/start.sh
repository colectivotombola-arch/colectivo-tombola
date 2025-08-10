#!/bin/bash

echo "🚀 Iniciando Proyectos Flores..."

# Start MongoDB
echo "📦 Starting MongoDB..."
sudo service mongod start

# Start backend
echo "⚙️ Starting backend..."
cd /app/backend
pip install -r requirements.txt
nohup python server.py > backend.log 2>&1 &

# Start frontend
echo "🎨 Starting frontend..."
cd /app/frontend
yarn install
yarn start

echo "✅ Proyectos Flores iniciado correctamente!"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8001"