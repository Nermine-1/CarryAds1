
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4242;

// Create Uploads directory on server startup
const setupUploadsDirectory = async () => {
  const uploadDir = path.join(__dirname, 'Uploads');
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Dossier Uploads créé ou déjà existant: ${uploadDir}`);
  } catch (error) {
    console.error('Erreur lors de la création du dossier Uploads:', error);
    process.exit(1);
  }
};

setupUploadsDirectory().then(() => {
  // CORS configuration
  const corsOptions = {
    origin: 'http://localhost:5173',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));

  // Serve static files from Uploads
  app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));

  // Built-in body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Import and use routes after directory setup
  const authRoutes = require('./routes/authRoutes');
  const dashboardRoutes = require('./routes/dashboardRoutes');
  const campaignRoutes = require('./routes/campaignRoutes');
  const customerRoutes = require('./routes/customerRoutes');
  const distributorRoutes = require('./routes/distributorRoutes');
  const adminRoutes = require('./routes/adminRoutes');

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/annonceur', campaignRoutes, customerRoutes);
  app.use('/api/distributeur', distributorRoutes);
  app.use('/api/admin', adminRoutes); 


  // Handle favicon.ico to prevent 404
  app.get('/favicon.ico', (req, res) => res.status(204).end());

  // Catch-all route for 404 errors
  app.use((req, res) => {
    console.error(`[${new Date().toISOString()}] Route non trouvée: ${req.method} ${req.url}`);
    res.status(404).json({ message: 'Route non trouvée.' });
  });

  // Global error handler
  app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Error:`, err.stack);
    res.status(500).json({ message: 'Erreur serveur.' });
  });

  // Database connection
  const db = require('./config/db');
  db.getConnection()
    .then(connection => {
      console.log('Connecté à la base de données MySQL');
      connection.release();
    })
    .catch(err => {
      console.error('Erreur de connexion à la base de données MySQL:', err);
    });

  // Start server
  app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
  });
});