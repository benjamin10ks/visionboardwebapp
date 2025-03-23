

# Figma Clone with Real-time Collaboration

**Live at Vercel link**
if you would like to try this out for yourself follow the steps below.

A collaborative design tool similar to Figma with real-time collaboration through WebSockets.

## Features

- Shape, text, and image placement
- Real-time collaboration with multiple users
- Shareable room links
- User cursor tracking

# Bugs/Future fixes

- Zoom is very broken
- Icon colors are wrong
- Window movement is shared

To run locally:

1. Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   ```

2. Run both the Next.js app and Socket.io server:
   ```
   npm start
   ```
Have fun!


