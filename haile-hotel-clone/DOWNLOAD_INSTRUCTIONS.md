# How to Download This Project to Your Local Machine

## Option 1: Download as ZIP (Easiest)

1. **If you're using Cursor/VS Code:**
   - Right-click on the `haile-hotel-clone` folder
   - Select "Download..." or "Export..."
   - Save the ZIP file to your computer

2. **Or use terminal to create a ZIP:**
   ```bash
   cd /workspace
   zip -r haile-hotel-clone.zip haile-hotel-clone/
   ```
   Then download the `haile-hotel-clone.zip` file

## Option 2: Git Clone (If you have repository access)

If this is in a Git repository:

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd haile-hotel-clone
```

## Option 3: Manual Copy via Terminal

If you have SSH access:

```bash
# From your local machine, use SCP
scp -r user@remote-server:/workspace/haile-hotel-clone ~/Desktop/haile-hotel-clone
```

## After Downloading - Setup Instructions

1. **Extract the ZIP file** (if downloaded as ZIP)

2. **Navigate to the project:**
   ```bash
   cd haile-hotel-clone
   ```

3. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env file with your MongoDB URI and other settings
   ```

4. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

5. **Create Admin Account:**
   ```bash
   cd ../backend
   node seeders/adminSeeder.js
   ```

6. **Start the servers:**
   
   Terminal 1 (Backend):
   ```bash
   cd backend
   npm run dev
   ```
   
   Terminal 2 (Frontend):
   ```bash
   cd frontend
   npm run dev
   ```

7. **Access the application:**
   - Website: http://localhost:5173
   - Admin Panel: http://localhost:5173/admin/login
   - API: http://localhost:5000

## Prerequisites

Make sure you have installed:
- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MongoDB** (local or MongoDB Atlas account) - [Download here](https://www.mongodb.com/try/download/community)
- **npm** (comes with Node.js)

## Environment Variables

Edit `backend/.env` file with your settings:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hailehotel
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRE=30d
FRONTEND_URL=http://localhost:5173

# Email Configuration (optional, for contact forms)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

## Troubleshooting

- **Port already in use**: Change PORT in `.env` file
- **MongoDB connection error**: Make sure MongoDB is running or update MONGODB_URI
- **npm install fails**: Make sure you have Node.js v16+ installed
- **Admin login doesn't work**: Run the seeder script first: `node backend/seeders/adminSeeder.js`
