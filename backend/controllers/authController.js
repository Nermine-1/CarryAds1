const User = require('../models/User'); // Your MySQL User model
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
    try {
        // Destructure all possible fields from the frontend payload
        const { 
            username, 
            email, 
            password, 
            userType, // 'annonceur', 'distributeur', 'commercial', 'admin'
            phone, 
            companyName, 
            adress, // Use 'adress' to correctly capture the address field from the frontend
            city, 
            postalCode, 
            country, 
            latitude, 
            longitude 
        } = req.body;
        
        console.log('Données reçues pour l\'inscription:', req.body); // For debugging

        // Check if user already exists using MySQL User model method
        const existingUser = await User.findByEmail(email); 
        if (existingUser) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Map frontend userType to backend ROLE format for DB storage
        let roles = ['ROLE_' + userType.toUpperCase()];
        
        // Create the main user entry in carryads_user table using MySQL User model method
        const userId = await User.createUser(username, email, hashedPassword, roles, phone); 

        // Conditionally create entries in customer or distributer tables with the correct 'adress'
        if (userType === 'annonceur') {
            await User.createCustomer(userId, companyName, adress, city, postalCode, country, latitude, longitude);
        } else if (userType === 'distributeur') {
            // Note: The 'adress' variable from the payload is passed here directly
            await User.createDistributer(userId, adress, city, postalCode, country, latitude, longitude);
        }

        res.status(201).json({ message: 'Inscription réussie !' });
    } catch (error) {
        console.error("Erreur lors de l'inscription:", error);
        res.status(500).json({ message: 'Erreur lors de l\'inscription.', error: error.message, details: error });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Tentative de connexion pour l\'email:', email);

        // Find user by email (using MySQL User model method)
        const user = await User.findByEmail(email); 
        if (!user) {
            console.log('Échec de connexion : Utilisateur non trouvé.');
            return res.status(400).json({ message: 'Identifiants invalides.' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Échec de connexion : Mot de passe incorrect.');
            return res.status(400).json({ message: 'Identifiants invalides.' });
        }

        // Check if JWT_SECRET is defined
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not defined');
            return res.status(500).json({ message: 'Erreur de configuration serveur.' });
        }

        // Parse roles from JSON string stored in DB
        const roles = JSON.parse(user.roles);
        const userType = roles[0]; // Get the primary role from the DB

        let profileName = user.username; // Default to username
        let companyName = null; // Default to null

        // Fetch additional profile data based on role
        if (userType === 'ROLE_ANNONCEUR') {
            const customerProfile = await User.findCustomerDetails(user.id);
            if (customerProfile) {
                profileName = customerProfile.company_name || user.username; // Prefer company name
                companyName = customerProfile.company_name;
            }
        } else if (userType === 'ROLE_DISTRIBUTEUR') {
            const distributerProfile = await User.findDistributerDetails(user.id);
            if (distributerProfile) {
                profileName = user.username; 
            }
        }
        // For Commercial and Admin, username from carryads_user is sufficient

        console.log('Connexion réussie pour l\'utilisateur:', user.email, 'Rôles:', roles);

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, roles: roles }, 
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Return the primary role (e.g., 'ROLE_ANNONCEUR') and profile data to the frontend for redirection/display
        res.status(200).json({ 
            message: 'Connexion réussie.', 
            token, 
            userType: userType, 
            username: user.username, 
            profileName: profileName, 
            companyName: companyName,
            userId: user.id // Renvoie l'ID de l'utilisateur
        });

    } catch (error) {
        console.error('Erreur serveur lors de la connexion:', {
            message: error.message,
            stack: error.stack,
        });
        res.status(500).json({ message: 'Erreur interne du serveur lors de la connexion.', error: error.message });
    }
};


// ... (previous imports and functions remain unchanged)

exports.getStocks = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT s.id, s.name, s.price, s.image_name, s.updated_at,
             COALESCE(SUM(cs.nbr_support_int), 0) AS total_int,
             COALESCE(SUM(cs.nbr_support_distributed), 0) AS total_distributed
      FROM carryads_supports s
      LEFT JOIN carryads_campaigns_supports cs ON s.id = cs.support_id
      GROUP BY s.id, s.name, s.price, s.image_name, s.updated_at
      ORDER BY s.updated_at DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching stocks:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des stocks.', details: error.message });
  }
};

exports.createDelivery = async (req, res) => {
  let connection;
  try {
    const { support_id, quantity, destination } = req.body; // delivery_date removed as not in existing schema
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check if support exists and get available stock
    const [supportRows] = await connection.execute(
      `SELECT s.id, s.name, COALESCE(SUM(cs.nbr_support_int - cs.nbr_support_distributed), 0) AS available
       FROM carryads_supports s
       LEFT JOIN carryads_campaigns_supports cs ON s.id = cs.support_id
       WHERE s.id = ?
       GROUP BY s.id, s.name`,
      [support_id]
    );

    if (supportRows.length === 0) {
      throw new Error('Support not found.');
    }

    const availableStock = supportRows[0].available;
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
    }

    // Update the first campaign_support record for simplicity (you may need to specify campaign_id in req.body)
    const [campaignSupportRows] = await connection.execute(
      `SELECT id, campaign_id, nbr_support_int, nbr_support_distributed
       FROM carryads_campaigns_supports
       WHERE support_id = ? LIMIT 1`,
      [support_id]
    );

    if (campaignSupportRows.length === 0) {
      throw new Error('No campaign associated with this support.');
    }

    const { id: cs_id, nbr_support_int, nbr_support_distributed } = campaignSupportRows[0];
    const newDistributed = nbr_support_distributed + quantity;

    if (newDistributed > nbr_support_int) {
      throw new Error('Delivery quantity exceeds available stock for this campaign.');
    }

    await connection.execute(
      `UPDATE carryads_campaigns_supports
       SET nbr_support_distributed = ?
       WHERE id = ?`,
      [newDistributed, cs_id]
    );

    await connection.commit();
    res.status(201).json({ message: 'Livraison créée avec succès.', id: support_id });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating delivery:', error);
    res.status(500).json({ message: 'Erreur lors de la création de la livraison.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

