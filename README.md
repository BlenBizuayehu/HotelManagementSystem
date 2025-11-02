# Elysian Hotel Management System

Welcome to the Elysian Hotel Management System, a comprehensive, full-stack application designed to streamline hotel operations. It features a customer-facing booking portal and a powerful internal dashboard for managing bookings, HR, inventory, schedules, and spa & gym facilities, enhanced with AI-powered insights from the Gemini API.

## Core Features

- **Customer Booking Portal**: A sleek, user-friendly interface for guests to check room availability and make bookings.
- **Management Dashboard**: A centralized hub for hotel staff to manage all operational aspects.
- **AI Assistant**: An integrated tool powered by the Google Gemini API to provide data-driven insights and generate reports.
- **Modular System**: Separate, well-organized modules for Bookings, HR, Inventory, Rooms, Schedules, and Spa & Gym management.
- **Real-time Notifications**: An intuitive notification system to keep staff updated on important events.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express
- **Database**: MongoDB (with Mongoose)
- **AI Integration**: Google Gemini API

---

## Getting Started: Running the Full Application

To run this application, you need to have both the backend server and the frontend development server running simultaneously. Follow these steps carefully.

### Prerequisites

1.  **Node.js**: Ensure you have Node.js (version 16 or later) installed. You can download it from [nodejs.org](https://nodejs.org/).
2.  **MongoDB**: You must have a running MongoDB instance. You can install it locally or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

---

### **Step 1: Set Up and Run the Backend Server**

The backend is the heart of the application; it connects to the database and serves data to the frontend.

1.  **Open a new terminal window.**
2.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
3.  Install the necessary dependencies:
    ```bash
    npm install
    ```
4.  **Configure your environment variables.** The server needs to know how to connect to your database.
    -   In the `backend` directory, find the file named `.env.example`.
    -   Create a **copy** of this file in the same directory and rename the copy to **`.env`**.
    -   Open the new `.env` file and fill in your details:
        -   `MONGO_URI`: Your MongoDB connection string.
        -   `API_KEY`: Your Google Gemini API key (optional, for AI features).
5.  **Start the backend server in development mode:**
    ```bash
    npm run dev
    ```
6.  If successful, you will see messages like:
    ```
    [nodemon] starting `node server.js`
    Server running on port 5000
    MongoDB Connected: your_database_host
    ```
**Leave this terminal window open!** `nodemon` will now watch for changes and restart the server automatically.

---

### **Step 2: Run the Frontend Application**

Now that the backend is running, you can start the frontend.

1.  **Open a second, separate terminal window.** (Do not close the backend terminal).
2.  Make sure you are in the **root directory** of the project (the one that contains this `README.md` file).
3.  Install the project's dependencies:
    ```bash
    npm install
    ```
4.  **Start the frontend development server:**
    ```bash
    npm run dev
    ```
5.  Your terminal will give you a URL (like `http://localhost:5173`) to open in your web browser.

---

### **Step 3: Access the Application**

-   Once the frontend server is running, open your web browser and navigate to the URL it provides.
-   The application should now load without any "Failed to fetch" errors. All data will be fetched from your running backend server."# HotelManagementSystem" 
