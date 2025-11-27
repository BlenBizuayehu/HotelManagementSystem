# Admin Features Documentation

## Complete Admin Panel Features

The Haile Hotels and Resorts admin panel includes comprehensive management capabilities:

### 🔐 Authentication & Authorization
- Admin login system with JWT tokens
- Role-based access control (super-admin, admin, manager)
- Permission-based feature access
- Secure session management

### 📊 Dashboard
- Real-time statistics overview
- Total bookings, rooms, employees, inventory counts
- Recent bookings display
- Quick access to all management sections

### 👥 Employee Management
- **Create Employees**: Add new employees with full details
- **View Employees**: List all employees with filters
- **Update Employees**: Edit employee information
- **Delete Employees**: Remove employees from system
- **Employee Fields**:
  - Employee ID (auto-generated)
  - Personal information (name, email, phone)
  - Role (admin, manager, receptionist, housekeeping, etc.)
  - Department (front-desk, housekeeping, restaurant, etc.)
  - Position and salary
  - Status (active, on-leave, terminated, suspended)
  - Emergency contacts
  - Document management

### 📅 Schedule Management
- **Assign Schedules**: Create schedules for employees
- **View Schedules**: See all employee schedules
- **Bulk Scheduling**: Assign multiple schedules at once
- **Schedule Features**:
  - Date selection
  - Shift types (morning, afternoon, evening, night, full-day)
  - Start and end times
  - Department assignment
  - Status tracking (scheduled, confirmed, completed, cancelled)
  - Break duration management

### 🛏️ Room Management
- **Create Rooms**: Add new rooms with full details
- **Update Rooms**: Modify room information
- **Delete Rooms**: Remove rooms from system
- **Room Features**:
  - Room name and slug
  - Description and short description
  - Pricing
  - Capacity and size
  - Category (standard, deluxe, suite, presidential)
  - Amenities list
  - Availability status
  - Image management

### 📋 Booking Management
- **View All Bookings**: Complete booking list with filters
- **Update Booking Status**: Change booking status (pending, confirmed, cancelled, completed)
- **Cancel Bookings**: Cancel bookings with refund options
- **Booking Filters**:
  - By status
  - By guest email
  - By room
  - By check-in/check-out dates
- **Booking Details**:
  - Booking reference
  - Guest information
  - Room details
  - Dates and duration
  - Total price
  - Payment status

### 📦 Inventory Management
- **Add Items**: Create new inventory items
- **View Inventory**: List all items with status indicators
- **Update Items**: Modify item details
- **Restock Items**: Add quantity to existing items
- **Delete Items**: Remove items from inventory
- **Inventory Features**:
  - Item code (auto-generated)
  - Name and description
  - Category (furniture, electronics, linens, etc.)
  - Quantity and unit
  - Unit price
  - Stock levels (min/max)
  - Status (in-stock, low-stock, out-of-stock)
  - Location tracking
  - Supplier information
  - Last restocked date

### 🔒 Security Features
- JWT token authentication
- Password hashing with bcrypt
- Role-based permissions
- Protected API routes
- Admin activity tracking

### 📱 User Interface
- Responsive design for all devices
- Intuitive navigation
- Real-time updates
- Modal forms for data entry
- Table views with sorting and filtering
- Status indicators and badges

## API Endpoints

### Admin Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile
- `GET /api/admin/dashboard/stats` - Get dashboard statistics

### Employees
- `GET /api/admin/employees` - List all employees
- `GET /api/admin/employees/:id` - Get employee details
- `POST /api/admin/employees` - Create employee
- `PUT /api/admin/employees/:id` - Update employee
- `DELETE /api/admin/employees/:id` - Delete employee

### Schedules
- `GET /api/admin/schedules` - List schedules
- `GET /api/admin/schedules/:id` - Get schedule details
- `POST /api/admin/schedules` - Create schedule
- `POST /api/admin/schedules/bulk` - Bulk create schedules
- `PUT /api/admin/schedules/:id` - Update schedule
- `DELETE /api/admin/schedules/:id` - Delete schedule

### Bookings (Admin)
- `GET /api/admin/bookings` - List all bookings
- `PUT /api/admin/bookings/:id/status` - Update booking status
- `POST /api/admin/bookings/:id/cancel` - Cancel booking

### Rooms (Admin)
- `GET /api/admin/rooms` - List all rooms
- `POST /api/admin/rooms` - Create room
- `PUT /api/admin/rooms/:id` - Update room
- `DELETE /api/admin/rooms/:id` - Delete room

### Inventory
- `GET /api/admin/inventory` - List inventory items
- `GET /api/admin/inventory/:id` - Get item details
- `POST /api/admin/inventory` - Create item
- `PUT /api/admin/inventory/:id` - Update item
- `DELETE /api/admin/inventory/:id` - Delete item
- `POST /api/admin/inventory/:id/restock` - Restock item

## Getting Started

1. **Create Admin Account**: Use MongoDB to create an admin user or add a seeder script
2. **Login**: Access `/admin/login` with admin credentials
3. **Navigate**: Use the sidebar to access different management sections
4. **Manage**: Use the interface to manage all aspects of the hotel

## Default Admin Credentials

You'll need to create an admin account. You can do this by:
1. Using MongoDB directly
2. Creating a seeder script
3. Using the API to create an admin (requires super-admin privileges)

Example admin creation:
```javascript
{
  username: "admin",
  email: "admin@hailehotels.com",
  password: "hashed_password",
  role: "super-admin",
  permissions: ["manage-employees", "manage-bookings", "manage-rooms", "manage-inventory", "manage-schedules"]
}
```
