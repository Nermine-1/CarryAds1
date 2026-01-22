# CarryAds - Advertising Campaign Management Platform

CarryAds is a comprehensive platform for managing advertising campaigns, connecting advertisers (annonceurs) with distributors (distributeurs) to manage, track, and optimize advertising campaigns.

## 🚀 Features

- **Multi-User System**: Support for Advertisers, Distributors, Sales, and Administrators
- **Campaign Management**: Create, manage, and track advertising campaigns
- **Dashboard Analytics**: Real-time statistics and performance metrics
- **Billing & Invoicing**: Automated invoice generation and payment tracking
- **Stock Management**: Track advertising materials and inventory
- **Geographic Mapping**: Location-based distributor management with MapTiler integration
- **Secure Authentication**: JWT-based authentication with role-based access control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v8 or higher)
- npm or yarn package manager

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
cd carryads
```

### 2. Backend Setup

```bash
cd backend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the backend directory (use `.env.example` as template):

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=carryads_db
DB_PORT=3306
JWT_SECRET=your_jwt_secret_key
PORT=4242
```

#### Setup Database

1. Create the MySQL database:

```bash
mysql -u root -p
```

2. Run the schema file:

```sql
source database/schema.sql
```

Or import using:

```bash
mysql -u root -p carryads_db < database/schema.sql
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

#### Configure Environment Variables

Create a `.env` file in the frontend directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://localhost:4242/api
```

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

The backend will run on `http://localhost:4242`

### Start Frontend Development Server

Open a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173`

## 📱 Access the Application

- **Homepage**: http://localhost:5173
- **Advertiser Login**: http://localhost:5173/login/annonceur
- **Distributor Login**: http://localhost:5173/login/distributeur
- **Admin Login**: http://localhost:5173/login/admin

## 👥 Default Users

After setting up the database, you can create users through the signup page or use:

- **Admin Email**: admin@carryads.com
- **Password**: admin123 (change after first login)

## 🏗️ Project Structure

```
carryads/
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Authentication middleware
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── Uploads/        # File uploads directory
│   ├── database/       # SQL schema
│   └── server.js       # Express server
│
└── frontend/
    ├── src/
    │   ├── components/ # React components
    │   ├── pages/      # Page components
    │   ├── styles/     # CSS styles
    │   ├── types/      # TypeScript types
    │   ├── utils/      # Utility functions
    │   └── App.tsx     # Main app component
    └── public/         # Static assets
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Advertiser (Annonceur)
- `GET /api/annonceur/mes-campagnes` - Get campaigns
- `GET /api/annonceur/facturation` - Get billing info
- `GET /api/annonceur/profile` - Get profile
- `PUT /api/annonceur/profile` - Update profile

### Distributor (Distributeur)
- `GET /api/distributeur/mes-campagnes` - Get campaigns
- `GET /api/distributeur/stocks` - Get stock information

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/campaigns` - Get all campaigns
- `GET /api/admin/distributors` - Get all distributors

## 🛡️ Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Protected API routes with middleware
- CORS configured for frontend domain

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Building for Production

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

The build output will be in the `frontend/dist` directory.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 📧 Support

For support, email support@carryads.com or open an issue in the repository.

## 🙏 Acknowledgments

- Express.js for backend framework
- React + Vite for frontend
- MySQL for database
- Tailwind CSS for styling
- Chart.js for analytics visualization
