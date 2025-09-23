const pool = require('../config/db');



exports.getAdvertiserCampaigns = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    const query = `
      SELECT
        c.id,
        c.name,
        c.description,
        c.image_name,
        c.total_price AS budgetTotal,
        ccs.nbr_support_int AS impressionsTotal,
        ccs.nbr_support_distributed AS impressionsRealisees,
        ca.company_name AS clientName,
        CASE
          WHEN c.status = 0 THEN 'Pending'
          WHEN c.status = 1 THEN 'Ongoing'
          WHEN c.status = 2 THEN 'Completed'
          WHEN c.status = 3 THEN 'Cancelled'
        END AS status,
        ad.start_date AS startDate,
        ad.end_date AS endDate,
        CASE WHEN ccs.nbr_support_int > 0 THEN (ccs.nbr_support_distributed / ccs.nbr_support_int) * 5 ELSE 0 END AS performance,
        GROUP_CONCAT(u.username) AS distributeurs
      FROM
        carryads_campaigns c
      LEFT JOIN
        carryads_customers ca ON c.customers_id = ca.id
      LEFT JOIN
        carryads_ads_distributions ad ON c.id = ad.campaign_id
      LEFT JOIN
        carryads_campaigns_supports ccs ON c.id = ccs.campaign_id
      LEFT JOIN
        carryads_distributers d ON ad.distributer_id = d.id
      LEFT JOIN
        carryads_user u ON d.user_id = u.id
      WHERE
        ca.user_id = ?
      GROUP BY
        c.id, ca.company_name, ccs.nbr_support_int, ccs.nbr_support_distributed, ad.start_date, ad.end_date, c.status
      ORDER BY
        c.created_at DESC;
    `;

    const [rows] = await pool.execute(query, [userId]);

    const campaignsData = rows.map(row => ({
      id: row.id,
      name: row.name,
      status: row.status,
      clientName: row.clientName,
      startDate: row.startDate ? new Date(row.startDate).toLocaleDateString() : 'N/A',
      endDate: row.endDate ? new Date(row.endDate).toLocaleDateString() : 'N/A',
      budgetTotal: parseFloat(row.budgetTotal),
      budgetRestant: parseFloat(row.budgetTotal),
      impressionsTotal: row.impressionsTotal || 0,
      impressionsRealisees: row.impressionsRealisees || 0,
      performance: !isNaN(parseFloat(row.performance)) ? parseFloat(row.performance).toFixed(2) : '0.00',
      description: row.description,
      image_name: row.image_name || null,
      distributeurs: row.distributeurs ? row.distributeurs.split(',') : [],
    }));

    res.status(200).json(campaignsData);
  } catch (error) {
    console.error("Error fetching advertiser's campaigns:", error);
    res.status(500).json({ message: "Erreur lors de la récupération de vos campagnes.", details: error.message });
  }
};


exports.getInvoices = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const query = `
            SELECT
                c.id,
                CONCAT('INV-', YEAR(c.created_at), '-', LPAD(c.id, 6, '0')) AS invoiceNumber,
                c.name AS campaignName,
                c.created_at AS issueDate,
                c.total_price AS amount,
                COALESCE(ccs.nbr_support_distributed * 0.5, 0) AS amount_to_pay
            FROM
                carryads_campaigns c
            JOIN
                carryads_customers ca ON c.customers_id = ca.id
            LEFT JOIN
                carryads_campaigns_supports ccs ON c.id = ccs.campaign_id
            WHERE
                ca.user_id = ?
                AND c.status = 2
            ORDER BY
                c.created_at DESC;
        `;

        const [rows] = await pool.execute(query, [userId]);

        const invoicesData = rows.map(row => ({
            id: row.id,
            invoiceNumber: row.invoiceNumber,
            campaignName: row.campaignName,
            issueDate: new Date(row.issueDate).toLocaleDateString(),
            amount: parseFloat(row.amount),
            amountToPay: parseFloat(row.amount_to_pay) || 0,
            status: 'Pending'
        }));

        res.status(200).json(invoicesData);

    } catch (error) {
        console.error("Error fetching invoices:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des factures.", details: error.message });
    }
};

// Fetch billing info (unchanged)
exports.getBillingInfo = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const query = `
            SELECT
                COALESCE(SUM(c.total_price), 0) AS totalDue,
                COALESCE (SUM(cs.nbr_support_distributed * 0.5)) AS totalPaid
            FROM
                carryads_campaigns c
            JOIN
                carryads_customers ca ON c.customers_id = ca.id
            JOIN
                carryads_campaigns_supports cs ON c.id = cs.campaign_id
            WHERE
                ca.user_id = ?
                AND c.status = 2;
        `;

        const [rows] = await pool.execute(query, [userId]);
        
        res.status(200).json({
            totalDue: parseFloat(rows[0].totalDue),
            totalPaid: parseFloat(rows[0].totalPaid)
        });

    } catch (error) {
        console.error("Error fetching billing info:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des informations de facturation.", details: error.message });
    }
};

// Fetch invoice details for display
exports.downloadInvoice = async (req, res) => {
    try {
        const userId = req.user.id;
        const invoiceId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const query = `
            SELECT
                c.id,
                CONCAT('INV-', YEAR(c.created_at), '-', LPAD(c.id, 6, '0')) AS invoiceNumber,
                c.name AS campaignName,
                c.created_at AS issueDate,
                c.total_price AS amount,
                COALESCE(ccs.nbr_support_distributed * 0.5, 0) AS amount_to_pay
            FROM
                carryads_campaigns c
            JOIN
                carryads_customers ca ON c.customers_id = ca.id
            LEFT JOIN
                carryads_campaigns_supports ccs ON c.id = ccs.campaign_id
            WHERE
                c.id = ? AND ca.user_id = ? AND c.status = 2;
        `;

        const [rows] = await pool.execute(query, [invoiceId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Invoice not found or unauthorized." });
        }

        const invoice = rows[0];

        // Return invoice data as JSON
        res.status(200).json({
            invoiceNumber: invoice.invoiceNumber,
            campaignName: invoice.campaignName,
            issueDate: new Date(invoice.issueDate).toLocaleDateString('fr-FR'),
            amount: parseFloat(invoice.amount).toFixed(2),
            amountToPay: parseFloat(invoice.amount_to_pay).toFixed(2)
        });

    } catch (error) {
        console.error("Error fetching invoice details:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails de la facture.", details: error.message });
    }
};
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT u.username, u.email, u.phone, c.company_name, c.adress, c.city, c.postal_code, c.country
      FROM carryads_user u
      LEFT JOIN carryads_customers c ON u.id = c.user_id
      WHERE u.id = ?;
    `;
    const [rows] = await pool.execute(query, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ message: "Erreur lors de la récupération du profil.", details: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  let connection;
  try {
    const userId = req.user.id;
    const { username, phone, company_name, adress, city, postal_code, country } = req.body;
    connection = await pool.getConnection(); // Acquire connection
    await connection.beginTransaction();

    // Update carryads_user
    await connection.execute(
      `UPDATE carryads_user SET username = ?, phone = ? WHERE id = ?`,
      [username, phone, userId]
    );

    // Insert or update carryads_customers
    await connection.execute(
      `INSERT INTO carryads_customers (user_id, company_name, adress, city, postal_code, country)
       ON DUPLICATE KEY UPDATE company_name = VALUES(company_name), adress = VALUES(adress), city = VALUES(city), postal_code = VALUES(postal_code), country = VALUES(country)`,
      [userId, company_name, adress, city, postal_code, country]
    );

    await connection.commit();
    res.status(200).json({ message: "Profil mis à jour avec succès." });
  } catch (error) {
    if (connection) {
      await connection.rollback(); // Rollback only if connection exists
    }
    console.error("Error updating customer profile:", error);
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil.", details: error.message });
  } finally {
    if (connection) {
      connection.release(); // Release connection only if it exists
    }
  }
};