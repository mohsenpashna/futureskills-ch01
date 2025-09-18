# Product Rating System - Setup Guide

## Overview
A complete Node.js web application for product rating and review with admin dashboard, user authentication, and modern responsive UI.

## Features
- ✅ User Registration & Authentication (bcrypt password hashing)
- ✅ Product Rating System (1-5 stars)
- ✅ Real-time Average Rating Display
- ✅ Admin Dashboard with Interactive Charts (D3.js)
- ✅ Comments & Feedback System
- ✅ Admin Panel for Comment Management
- ✅ Responsive Modern UI Design
- ✅ Session Management
- ✅ MySQL Database Integration
- ✅ Organized CSS Architecture with External Stylesheets
- ✅ Reusable EJS Components (Navbar Partial)

## Prerequisites
- Node.js (v14 or higher)
- MySQL Server
- npm (Node Package Manager)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
1. Start your MySQL server
2. Create the database and tables by running the SQL script:
```bash
mysql -u root -p < database_setup.sql
```

Or manually execute the SQL commands in `database_setup.sql` in your MySQL client.

### 3. Database Configuration
Update the database connection settings in `db.js`:
```javascript
var conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',           // Your MySQL username
    password: '',           // Your MySQL password
    database: 'ch-01'       // Database name
});
```

### 4. Start the Application
```bash
node app.js
```

The server will start on port 3000. Open your browser and navigate to:
```
http://localhost:3000
```

## Default Admin Account
- **Username:** `admin`
- **Password:** `admin123`

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Bcrypt hashed password
- `is_admin` - Admin flag (0/1)
- `created_at` - Timestamp

### Products Table
- `id` - Primary key
- `name` - Product name
- `description` - Product description
- `image_url` - Product image URL
- `created_at` - Timestamp

### Ratings Table
- `id` - Primary key
- `product_id` - Foreign key to products
- `user` - Username who rated
- `rating` - Rating value (1-5)
- `created_at` - Timestamp
- Unique constraint on (product_id, user)

### Comments Table
- `id` - Primary key
- `title` - Comment title (optional)
- `message` - Comment message
- `email` - User email
- `date` - Timestamp

## Application Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/register` - Registration page

### Authenticated Routes
- `/product` - Product rating page
- `/comments` - Comments submission page
- `/logout` - Logout

### Admin Routes
- `/dashboard` - Analytics dashboard (admin only)
- `/admin` - Admin panel for comments (admin only)

## API Endpoints
- `POST /auth` - User authentication
- `POST /reg` - User registration
- `POST /submit_ratings` - Submit product ratings
- `POST /addcomments` - Submit comments

## Features in Detail

### Product Rating System
- Users can rate 3 products (Wireless Headphones, Smart Watch, Bluetooth Speaker)
- Ratings are on a 1-5 scale
- Users can update their existing ratings
- Average ratings and total rating counts are displayed
- Visual star ratings with product images

### Admin Dashboard
- Interactive pie charts showing rating distribution per product
- Real-time statistics (total ratings, average rating, most popular product)
- Responsive chart design with D3.js
- Admin-only access control

### Admin Panel
- View all user comments and feedback
- Search and filter functionality
- Responsive table design
- Comment management interface

### Security Features
- Password hashing with bcrypt
- Session-based authentication
- Admin role-based access control
- SQL injection prevention with parameterized queries

## Customization

### Adding New Products
1. Insert new products into the `products` table
2. Update the rating submission logic in `app.js`
3. Update the dashboard charts in `dashboard.ejs`

### Styling & Architecture
The application uses modern CSS architecture with:
- **Organized CSS Structure:**
  - `public/css/main.css` - Core styles and components
  - `public/css/dashboard.css` - Dashboard-specific styles
  - `public/css/admin.css` - Admin panel styles
- **Design Features:**
  - Gradient backgrounds
  - Card-based layouts
  - Responsive grid systems
  - Smooth animations and transitions
  - Mobile-friendly design
- **Static Assets:**
  - `public/css/` - Stylesheets
  - `public/js/` - JavaScript files (ready for future use)
  - `public/images/` - Image assets (ready for future use)
- **EJS Components:**
  - `views/partials/navbar.ejs` - Reusable navigation component
  - Consistent navigation across all authenticated pages
  - Dynamic admin badge and role-based menu items

## Troubleshooting

### Common Issues
1. **Database Connection Error**
   - Check MySQL server is running
   - Verify database credentials in `db.js`
   - Ensure database `ch-01` exists

2. **Port Already in Use**
   - Change port in `app.js` (line 294)
   - Or stop the process using port 3000

3. **Missing Dependencies**
   - Run `npm install` to install all required packages

4. **Admin Access Issues**
   - Ensure you're logged in with the admin account
   - Check `is_admin` flag in the users table

## Development
- The application uses EJS templating engine
- Express.js for server framework
- MySQL for database
- D3.js for data visualization
- Modern ES6+ JavaScript features

## Production Deployment
For production deployment:
1. Set environment variables for database credentials
2. Use a process manager like PM2
3. Set up proper SSL certificates
4. Configure reverse proxy (nginx)
5. Enable database connection pooling
6. Add proper error logging

## License
This project is for educational purposes as part of the MCSD51 Challenge.
