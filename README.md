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


## Firebase setup

The app stores everything in **Firebase Realtime Database** (project `aj-clothing-e8477`) and signs staff in with **email + password**. There is no other backend.

1. **Enable sign-in**: Firebase console → Authentication → Sign-in method → enable *Email/Password*. Disable *Anonymous*.
2. **Create staff accounts**: Authentication → Users → *Add user*.
3. **Allow each staff account to use the database**: Realtime Database → Data → add `staff/<user UID>` with the value `true` (the UID is shown in the Users list). Only people listed here can read or write data.
4. **Deploy the security rules** in `database.rules.json`:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only database
   ```
   (or paste the file into Realtime Database → Rules → Publish).

### What the rules enforce
- Only listed staff can read or write anything.
- Sales and stock-movement records can be created but never edited or deleted.
- Stock cannot go below zero; prices cannot be negative; the bill counter can only go up.

### Billing
Checkout deducts stock per product in a transaction (restoring it if anything fails), takes the next bill number from `counters/bills`, recomputes prices and totals from the live product records, and writes the sale and its stock movements in a single update.
