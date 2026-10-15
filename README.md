# AJ-clothing-frontend

Frontend application for AJ Clothing built with React and Vite.

## Project Structure

The React project is located in the `frontend/` directory.

## Getting Started

1. **Navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```


## How it fits together

```
React app (this repo)  ──Firebase ID token──▶  AJ Clothing API (Django)  ──Admin SDK──▶  Realtime Database
```

- **Sign-in / Create account** use Firebase Authentication (email + password). New users get a verification email and can sign in once it is verified. The app sends the user's ID token with every API call.
- **All data** (products, stock, bills) goes through the API in the `AJ-clothing-backend` repo, which does the billing and stock logic on the server.
- The database rules (`database.rules.json`) **deny all direct access**. The API uses the Admin SDK, which is not affected by the rules.

## Firebase setup

1. **Enable sign-in**: Firebase console → Authentication → Sign-in method → enable *Email/Password*. Disable *Anonymous*.
2. **Accounts**: people register themselves with *Create account* and receive a verification email, or you can add them under Authentication → Users → *Add user*.
3. **No approval step**: anyone who creates an account and verifies their email can use the app. To require approval instead, set `AUTO_APPROVE_VERIFIED_USERS=False` on the backend (then add `staff/<user UID>` = `true` in Realtime Database for each person you approve; see the backend README).
4. **Deploy the rules** in `database.rules.json` (deny all):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only database
   ```
   (or paste the file into Realtime Database → Rules → Publish).
5. **Backend**: set up and deploy `AJ-clothing-backend` (needs a service-account key). Then point this app at it with `VITE_API_URL` (defaults to `https://aj-clothing-backend.vercel.app/api/v1` in production and `http://localhost:8000/api/v1` in development).
