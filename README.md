#  Homez Server

Backend API server for **Homez**, a modern real estate management platform.
This server provides secure REST APIs for property management, authentication, wishlist functionality, and user management.

🚀 Live API: https://homez-server-olive.vercel.app/

---

## 📌 Overview

Homez Server is a Node.js + Express.js backend application built with TypeScript. It powers the Homez real estate platform by handling:

* Property listing management
* Property approval workflow
* User authentication & authorization
* Wishlist system
* Protected API routes
* MongoDB database operations

The API is designed with scalability, security, and maintainability in mind.

---

# ✨ Features

## 🔐 Authentication & Authorization

* JWT based authentication
* Better Auth integration support
* Protected API routes using middleware
* Secure token verification with JWKS
* Role-based access control ready

## 🏡 Property Management

* Get all active properties
* Search properties by title
* Filter properties by category/type
* Sort properties by price
* Pagination support
* Property details API
* Add new property
* Approve pending properties
* Reject properties
* Delete properties

## ❤️ Wishlist System

Users can:

* Add properties to wishlist
* Remove properties from wishlist
* Get user's wishlist
* Fetch wishlist property details

## 👥 User Management

* Get all users
* Secure user APIs
* Protected admin operations

---

# 🛠️ Technologies Used

### Backend

* Node.js
* Express.js
* TypeScript
* MongoDB
* MongoDB Driver

### Authentication

* JWT
* JOSE
* Better Auth

### Tools

* Git
* GitHub
* Postman
* Vercel

---

# 📂 Project Structure

```
HOMEZ_SERVER

├── index.ts              # Main Express server
├── verifyJwt.ts          # JWT authentication middleware
├── package.json
├── tsconfig.json
├── vercel.json
├── .env
└── README.md
```

---

# ⚙️ Installation & Setup

Clone the repository:

```bash
git clone https://github.com/tfshorifulislam/homez-server
```

Go to project directory:

```bash
cd homez-server
```

Install dependencies:

```bash
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file:

```env
PORT=5000

MONGODB_CONNECTION=your_mongodb_connection_string

BETTER_AUTH_URL=your_auth_url
```

---

# ▶️ Running the Project

### Development Mode

```bash
npm run dev
```

Server will run:

```
http://localhost:5000
```

### Production Build

Create production build:

```bash
npm run build
```

Start server:

```bash
npm start
```

---

# 🔗 API Endpoints

## Home

```
GET /
```

Response:

```json
{
  "message": "Server is running!"
}
```

---

## Properties

### Get all properties

```
GET /api/all-properties
```

Query parameters:

```
?page=1
&limit=12
&search=house
&type=apartment
&sort=low-high
&featured=true
```

---

### Get property details

```
GET /api/properties/:id
```

---

### Add property

```
POST /api/addproperty
```

Protected route.

---

### Delete property

```
DELETE /api/property/:id
```

Protected route.

---

## Wishlist

### Add wishlist

```
POST /api/wishlist
```

Protected route.

### Get wishlist

```
GET /api/wishlist/:email
```

Protected route.

### Remove wishlist

```
DELETE /api/wishlist
```

Protected route.

---

## Admin Property Approval

### Accept property

```
PATCH /api/property/accept/:id
```

### Reject property

```
DELETE /api/property/reject/:id
```

---

# 🗄️ Database Collections

MongoDB Database:

```
homez
```

Collections:

```
all-property
inActive
wishlist
user
```

---

# 🔒 Security

Implemented:

✅ JWT verification middleware
✅ Protected routes
✅ Environment variable configuration
✅ MongoDB secure connection
✅ Token validation using JWKS

---

# 🚀 Deployment

This API is deployed using:

* Vercel Serverless Functions

Live:

https://homez-server-olive.vercel.app/

---

# 👨‍💻 Developer

**Shoriful Islam**

Full Stack Developer

Skills:

* React.js
* Next.js
* Node.js
* Express.js
* MongoDB
* TypeScript
* Tailwind CSS

---

# 📄 License

This project is created for learning and portfolio purposes.

```
MIT License
```

---

⭐ If you find this project useful, consider giving it a star.
