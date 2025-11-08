# How to Start the Backend Server

## Quick Start

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Start the server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

3. **Verify the server is running:**
   - You should see: `Server is running on port 5001`
   - Check: http://localhost:5001/api/health

## Troubleshooting

### Port Already in Use

If you get an error that port 5001 is already in use:

**On macOS/Linux:**
```bash
# Find and kill the process
lsof -ti:5001 | xargs kill -9
```

**On Windows:**
```bash
# Find the process
netstat -ano | findstr :5001
# Kill it (replace PID with the process ID)
taskkill /PID <PID> /F
```

### Environment Variables Not Loading

Make sure you have a `.env` file in the `backend/` directory:
```bash
cd backend
ls -la .env
```

If it doesn't exist, create it:
```bash
echo "GEMINI_API_KEY=your_key_here" > .env
# Add other environment variables as needed
```

### MongoDB Connection Issues

Make sure your MongoDB connection string is set in `.env`:
```env
MONGODB_URI=your_mongodb_connection_string
```

### Firebase Admin SDK Issues

Make sure your Firebase credentials are configured:
```env
FIREBASE_ADMIN_SDK_PATH=path/to/serviceAccountKey.json
```

## Running in Background

### Using PM2 (Recommended for Production)

```bash
npm install -g pm2
pm2 start src/server.js --name hivefive-backend
pm2 logs hivefive-backend
```

### Using nohup (Linux/macOS)

```bash
nohup npm start > server.log 2>&1 &
```

### Using screen (Linux/macOS)

```bash
screen -S backend
npm run dev
# Press Ctrl+A then D to detach
# Reattach with: screen -r backend
```

## Check Server Status

```bash
# Check if server is running
curl http://localhost:5001/api/health

# Check server logs
# If using npm run dev, logs appear in terminal
# If using PM2: pm2 logs hivefive-backend
```

## Common Issues

1. **Connection Refused**: Server is not running - start it with `npm run dev`
2. **Port in Use**: Kill the existing process or change the port in `.env`
3. **Module Not Found**: Run `npm install` in the backend directory
4. **MongoDB Connection Failed**: Check your `MONGODB_URI` in `.env`

## Development vs Production

- **Development**: `npm run dev` (auto-restarts on file changes)
- **Production**: `npm start` (runs once, no auto-restart)

