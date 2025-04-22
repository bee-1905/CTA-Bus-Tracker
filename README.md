# 🚌 CTA Bus Tracking API

A RESTful API for tracking CTA bus data, including routes, stops, directions, patterns, and vehicles. Built with **Node.js**, **Express**, and **MongoDB**, and tested using **Thunder Client** in VS Code.

## 🚀 Features

- Retrieve and manage CTA bus data
- Organized into modular routes and controllers
- MongoDB for persistent data storage
- Thunder Client-compatible for quick testing
- Clean and scalable folder structure

## 📁 Project Structure

```
BUS-TRACKER-API/
│
├── config/              # Database configuration
│   └── db.js
│
├── controllers/         # (You can add business logic here)
│
├── models/              # Mongoose data models
│   ├── Bus.js
│   ├── Direction.js
│   ├── Pattern.js
│   ├── Route.js
│   ├── Stop.js
│   └── Vehicle.js
│
├── routes/              # Express route handlers
│   ├── busRoutes.js
│   ├── directionRoutes.js
│   ├── patternRoutes.js
│   ├── routeRoutes.js
│   ├── stopRoutes.js
│   └── vehicleRoutes.js
│
├── .env                 # Environment variables
├── .gitignore
├── package.json
├── server.js            # Entry point
└── README.md
```

## 🛠️ Technologies Used

- **Node.js** & **Express.js** — Backend and API logic
- **MongoDB** with **Mongoose** — NoSQL database for storing bus data
- **Thunder Client** — API testing directly inside VS Code

## ⚙️ Setup Instructions

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/bus-tracker-api.git
   cd bus-tracker-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```
   MONGO_URI=your_mongodb_connection_string
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

   Server will run on: [http://localhost:5000](http://localhost:5000)

## 📬 API Endpoints Overview

| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/buses`           | Get all bus data             |
| GET    | `/api/directions`      | Get directions               |
| GET    | `/api/patterns`        | Get route patterns           |
| GET    | `/api/routes`          | Get available routes         |
| GET    | `/api/stops`           | Get all stops                |
| GET    | `/api/vehicles`        | Get all vehicle info         |

> ⚡ All endpoints are Thunder Client ready – just import the workspace or test directly.

## 🔍 Thunder Client Setup (Optional)

If you're using VS Code:
1. Install [Thunder Client Extension](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)
2. Open any route file or use `server.js` base URL
3. Create test requests and hit "Send"

## 📌 TODO

- Add controller logic for better separation of concerns
- Add data validation using `express-validator`
- Implement authentication for admin routes (optional)
- Add Swagger or Postman documentation

## 📄 License

MIT © Abeerah Aamir