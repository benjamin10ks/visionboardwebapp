

# Figma Clone with Real-time Collaboration

**Currently not live**
if you would like to try this out for yourself follow the steps below.

A collaborative design tool similar to Figma with real-time collaboration through WebSockets.

## Features

- Shape, text, and image placement
- Real-time collaboration with multiple users
- Shareable room links
- User cursor tracking

## Deployment Instructions

### 1. Deploy the Socket.io Server

The Socket.io server needs to be deployed separately from the Next.js frontend. Options include:

- **Heroku**:
  ```
  git init
  heroku create your-socket-server-name
  git add server.js package.json
  git commit -m "Initial commit for socket server"
  git push heroku main
  ```

- **Railway**:
  Connect your GitHub repository and deploy the server.js file.

- **DigitalOcean App Platform**:
  Create a new app and select your repository.

### 2. Set Environment Variables

In your Vercel project settings, add an environment variable:
```
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server-url.herokuapp.com
```

### 3. Deploy the Next.js Frontend

Deploy to Vercel through your GitHub repository or using the Vercel CLI:
```
vercel
```

### 4. Local Development

To run locally:

1. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

2. Run both the Next.js app and Socket.io server:
   ```
   npm start
   ```

## Troubleshooting

If you encounter port conflicts (EADDRINUSE errors), modify the port in server.js or start.js.

