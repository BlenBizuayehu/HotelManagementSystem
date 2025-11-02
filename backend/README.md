# Elysian Hotel Backend Server

This directory contains the Node.js, Express, and MongoDB backend for the Elysian Hotel Management System.

## Quick Start Guide

Follow these steps to get the backend server running locally.

### Step 1: Install Dependencies

Navigate into the `backend` directory and install the required npm packages.

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

The server requires a `.env` file to store your database connection string and your Google Gemini API key.

1.  In the `backend` directory, find the file named **`.env.example`**.
2.  **Create a copy** of this file and rename the copy to **`.env`**.
3.  **Open the new `.env` file** and update the placeholder values:
    -   **`MONGO_URI`**: Replace `mongodb://localhost:27017/elysian_hotel` with your actual MongoDB connection string. For production, use a cloud service like MongoDB Atlas.
    -   **`API_KEY`**: Replace `"YOUR_GEMINI_API_KEY_HERE"` with your actual Google Gemini API key.

**Note:** The server will not start if `MONGO_URI` is not provided.

### Step 2.5: Seed the Database (Create Default Users)

To log in to the management portal, you first need to create users in the database. A seeder script is provided for this purpose.

Run the following command from the `backend` directory:

```bash
npm run seed
```

This will create two default users with different roles:
*   **Admin**: `username: admin`, `password: password123` (Full access)
*   **Manager**: `username: manager`, `password: password123` (Restricted access)

### Step 3: Start the Server (with auto-reload)

For development, it's crucial to run the server in a way that it automatically restarts when you make changes to the code. We use `nodemon` for this, which is configured in the `dev` script.

**To start the server, use the `dev` script:**

```bash
npm run dev
```

You should see messages like this in your terminal:

```
[nodemon] starting `node server.js`
Server running on port 5000
MongoDB Connected: <your_mongodb_host>
```

**The backend is now running!** `nodemon` will watch for any file changes in the `backend` directory and automatically restart the server, ensuring your new routes and logic are always loaded. Keep this terminal window open.