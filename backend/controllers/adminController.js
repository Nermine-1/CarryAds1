const pool = require('../config/db');
const bcrypt = require('bcryptjs'); 
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, username, email, roles, phone FROM carryads_user');
    // Parse the JSON roles back into an array for the frontend
    const users = rows.map(user => ({
      ...user,
      roles: JSON.parse(user.roles)
    }));
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs.', details: error.message });
  }
};

exports.createUser = async (req, res) => {
  let connection;
  try {
    const { username, email, password, roles, phone } = req.body;
    const hashedPassword = await hashPassword(password);
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      'INSERT INTO carryads_user (username, email, password, roles, phone) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, JSON.stringify(roles), phone]
    );

    await connection.commit();
    res.status(201).json({ message: 'Utilisateur créé avec succès.', id: result.insertId });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// --- Updated: Update a user, optionally hashing the password ---
exports.updateUser = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { username, email, password, roles, phone } = req.body;
    
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Flatten the roles array if it's nested
    let finalRoles = Array.isArray(roles[0]) ? roles[0] : roles;

    // 1. Prepare and execute the SQL statement for carryads_user
    let sql;
    let params;

    if (password) {
      const hashedPassword = await hashPassword(password);
      sql = 'UPDATE carryads_user SET username = ?, email = ?, password = ?, roles = ?, phone = ? WHERE id = ?';
      params = [username, email, hashedPassword, JSON.stringify(finalRoles), phone, id];
    } else {
      sql = 'UPDATE carryads_user SET username = ?, email = ?, roles = ?, phone = ? WHERE id = ?';
      params = [username, email, JSON.stringify(finalRoles), phone, id];
    }
    
    await connection.execute(sql, params);

    // Get the new role from the roles array (assuming only one role per user)
    const newRole = finalRoles[0];

    // 2. Manage entries in related tables based on the new role
    const [existingCustomer] = await connection.execute(
      'SELECT id FROM carryads_customers WHERE user_id = ?',
      [id]
    );
    const isCustomer = existingCustomer.length > 0;

    const [existingDistributor] = await connection.execute(
      'SELECT id FROM carryads_distributers WHERE user_id = ?',
      [id]
    );
    const isDistributor = existingDistributor.length > 0;

    if (newRole === 'ROLE_CUSTOMER') {
      if (!isCustomer) {
        await connection.execute('INSERT INTO carryads_customers (user_id) VALUES (?)', [id]);
      }
      if (isDistributor) {
        await connection.execute('DELETE FROM carryads_distributers WHERE user_id = ?', [id]);
      }
    } else if (newRole === 'ROLE_DISTRIBUTER') {
      if (!isDistributor) {
        await connection.execute('INSERT INTO carryads_distributers (user_id) VALUES ( ?)', [id]);
      }
      if (isCustomer) {
        await connection.execute('DELETE FROM carryads_customers WHERE user_id = ?', [id]);
      }
    } else {
      if (isCustomer) {
        await connection.execute('DELETE FROM carryads_customers WHERE user_id = ?', [id]);
      }
      if (isDistributor) {
        await connection.execute('DELETE FROM carryads_distributers WHERE user_id = ?', [id]);
      }
    }

    await connection.commit();
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating user and roles:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};


exports.deleteUser = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute('DELETE FROM carryads_user WHERE id = ?', [id]);

    await connection.commit();
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.createDistributor = async (req, res) => {
  let connection;
  try {
    const { user_id, campaign_id, adress, city, postal_code, country, latitude, longitude } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      'INSERT INTO carryads_distributers (user_id, campaign_id, adress, city, postal_code, country, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [user_id, campaign_id, adress, city, postal_code, country, latitude, longitude]
    );

    await connection.commit();
    res.status(201).json({ message: 'Distributeur créé avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error creating distributor:', error);
    res.status(500).json({ message: 'Erreur lors de la création du distributeur.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.updateDistributor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { user_id, campaign_id, adress, city, postal_code, country, latitude, longitude } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      'UPDATE carryads_distributers SET user_id = ?, campaign_id = ?, adress = ?, city = ?, postal_code = ?, country = ?, latitude = ?, longitude = ? WHERE id = ?',
      [user_id, campaign_id, adress, city, postal_code, country, latitude, longitude, id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Distributeur mis à jour avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating distributor:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du distributeur.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.validateDistributor = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      'UPDATE carryads_distributers SET status = 1 WHERE id = ?', // Assume status 1 = validated
      [id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Distributeur validé avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error validating distributor:', error);
    res.status(500).json({ message: 'Erreur lors de la validation du distributeur.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM carryads_campaigns');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des campagnes.', details: error.message });
  }
};

exports.getCampaignPerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute(
      `SELECT c.name, d.nbr_support_int, d.nbr_support_distributed
       FROM carryads_campaigns c
       LEFT JOIN carryads_ads_distributions d ON c.id = d.campaign_id
       WHERE c.id = ?`,
      [id]
    );
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching campaign performance:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des performances.', details: error.message });
  }
};

exports.createContract = async (req, res) => {
  // Placeholder: Implement contract generation logic
  res.status(200).json({ message: 'Contrat créé avec succès.' });
};

exports.getInvoices = async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM carryads_ads_distributions WHERE price IS NOT NULL');
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des factures.', details: error.message });
  }
};


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
    const { support_id, quantity, destination } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check available stock
    const [supportRows] = await connection.execute(
      `SELECT s.id, COALESCE(SUM(cs.nbr_support_int - cs.nbr_support_distributed), 0) AS available
       FROM carryads_supports s
       LEFT JOIN carryads_campaigns_supports cs ON s.id = cs.support_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [support_id]
    );

    if (supportRows.length === 0) {
      throw new Error('Support not found.');
    }

    const availableStock = supportRows[0].available;
    if (availableStock < quantity) {
      throw new Error(`Insufficient stock. Available: ${availableStock}, Requested: ${quantity}`);
    }

    // Update the first campaign_support record (you may want to specify campaign_id)
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
       SET nbr_support_distributed = ?, updated_at = NOW()
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

exports.updateStock = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    const { name, price } = req.body;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    await connection.execute(
      `UPDATE carryads_supports
       SET name = ?, price = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, price, id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Stock mis à jour avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error updating stock:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du stock.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

exports.deleteStock = async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // First, delete associated campaign supports
    await connection.execute(
      `DELETE FROM carryads_campaigns_supports WHERE support_id = ?`,
      [id]
    );

    // Then delete the support
    await connection.execute(
      `DELETE FROM carryads_supports WHERE id = ?`,
      [id]
    );

    await connection.commit();
    res.status(200).json({ message: 'Stock supprimé avec succès.' });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Error deleting stock:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du stock.', details: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// New: Get support distribution stats
exports.getSupportDistribution = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        s.name AS support_name,
        SUM(cs.nbr_support_int) AS total_int,
        SUM(cs.nbr_support_distributed) AS total_distributed
      FROM carryads_campaigns_supports cs
      JOIN carryads_supports s ON cs.support_id = s.id
      GROUP BY s.name
      ORDER BY total_distributed DESC
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching support distribution data:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données de distribution de supports.', details: error.message });
  }
};
exports.getMonthlyCampaignsCreated = async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS total_campaigns
            FROM carryads_campaigns
            GROUP BY month
            ORDER BY month
        `);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching monthly campaign creation data:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des données de création de campagnes.', details: error.message });
    }
};
// Add this to the getDashboard function as well for a single call
// New: Get user counts by role
exports.getUsersByRole = async (req, res) => {
    try {
        // Count annonceurs (users who exist in carryads_customers)
        const [annonceurRows] = await pool.execute(`
            SELECT COUNT(*) AS count FROM carryads_customers
        `);

        // Count distributeurs (users who exist in carryads_distributers)
        const [distributeurRows] = await pool.execute(`
            SELECT COUNT(*) AS count FROM carryads_distributers
        `);

        const usersByRole = {
            ANNONCEUR: annonceurRows[0].count,
            DISTRIBUTEUR: distributeurRows[0].count
        };

        res.status(200).json(usersByRole);
    } catch (error) {
        console.error('Error fetching users by role:', error);
        res.status(500).json({
            message: 'Erreur lors de la récupération des utilisateurs par rôle.',
            details: error.message
        });
    }
};


// And also update your main getDashboard function to fetch this data in one go
exports.getDashboard = async (req, res) => {
    try {
        const [users] = await pool.execute('SELECT COUNT(*) as total FROM carryads_user');
        const [distributors] = await pool.execute('SELECT COUNT(*) as total FROM carryads_distributers');
        const [customers] = await pool.execute('SELECT COUNT(*) as total FROM carryads_customers');
        const [campaigns] = await pool.execute('SELECT COUNT(*) as total FROM carryads_campaigns');
        const [campaignStatuses] = await pool.execute('SELECT status, COUNT(*) as count FROM carryads_campaigns GROUP BY status');
        const [monthlyCampaignsCreated] = await pool.execute(`
            SELECT
                DATE_FORMAT(created_at, '%Y-%m') AS month,
                COUNT(*) AS total_campaigns
            FROM carryads_campaigns
            GROUP BY month
            ORDER BY month
        `);
        const [supportDistribution] = await pool.execute(`
            SELECT
                s.name AS support_name,
                SUM(cs.nbr_support_int) AS total_int,
                SUM(cs.nbr_support_distributed) AS total_distributed
            FROM carryads_campaigns_supports cs
            JOIN carryads_supports s ON cs.support_id = s.id
            GROUP BY s.name
            ORDER BY total_distributed DESC
        `);
        
        // New Query: Get users by role
        const [usersByRoleRaw] = await pool.execute(`
            SELECT 
                roles,
                COUNT(*) AS count
            FROM carryads_user
            GROUP BY roles
        `);
        
        const usersByRole = usersByRoleRaw.reduce((acc, row) => {
            const roleArray = JSON.parse(row.roles);
            if (roleArray && roleArray.length > 0) {
                const roleName = roleArray[0].replace('ROLE_', '');
                acc[roleName] = row.count;
            }
            return acc;
        }, {});

        res.status(200).json({
            users: users[0].total,
            distributors: distributors[0].total,
            customers: customers[0].total,
            campaigns: campaigns[0].total,
            campaignStatuses: campaignStatuses,
            monthlyCampaignsCreated: monthlyCampaignsCreated,
            supportDistribution: supportDistribution,
            usersByRole: usersByRole, // Add the new data here
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des données du tableau de bord.', details: error.message });
    }
};

exports.getNotifications = async (req, res) => {
  // Placeholder: Implement notification logic
  res.status(200).json({ message: 'Notifications récupérées avec succès.', notifications: [] });
};
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT
        DATE_FORMAT(start_date, '%Y-%m') AS month,
        SUM(price) AS total_revenue
      FROM carryads_ads_distributions
      WHERE price IS NOT NULL
      GROUP BY month
      ORDER BY month
    `);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching monthly revenue:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des données de revenus mensuels.', details: error.message });
  }
};
