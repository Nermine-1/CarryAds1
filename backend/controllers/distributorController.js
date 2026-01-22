// const pool = require('../config/db');

// exports.getStats = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }

//         const distributorQuery = `SELECT id FROM carryads_distributers WHERE user_id = ?`;
//         const [distributorRows] = await pool.execute(distributorQuery, [userId]);

//         if (distributorRows.length === 0) {
//             return res.status(404).json({ message: "Distributor not found." });
//         }

//         const distributorId = distributorRows[0].id;

//         const statsQuery = `
//             SELECT
//                 COALESCE(SUM(ad.nbr_support_int), 0) AS totalImpressions,
//                 COALESCE(SUM(cs.nbr_support_distributed), 0) AS totalDistributed,
//                 COALESCE(SUM(CASE WHEN ad.status = 1 THEN 1 ELSE 0 END), 0) AS activeCampaigns,
//                 COALESCE(SUM(CASE WHEN c.status = 2 THEN cs.nbr_support_distributed * 0.5 ELSE 0 END), 0) AS estimatedRevenue
//             FROM
//                 carryads_ads_distributions ad
//             JOIN
//                 carryads_campaigns c ON ad.campaign_id = c.id
//             JOIN
//                 carryads_campaigns_supports cs ON c.id = cs.campaign_id AND ad.support_id = cs.support_id
//             WHERE
//                 ad.distributer_id = ?;
//         `;

//         const [statsRows] = await pool.execute(statsQuery, [distributorId]);

//         const stats = [
//             { title: 'Impressions Totales', value: statsRows[0].totalImpressions.toLocaleString(), icon: '👁️' },
//             { title: 'Sacs Distribués', value: statsRows[0].totalDistributed.toLocaleString(), icon: '🛍️' },
//             { title: 'Campagnes Actives', value: statsRows[0].activeCampaigns.toString(), icon: '📢' },
//             { title: 'Revenu Estimé', value: `€${parseFloat(statsRows[0].estimatedRevenue).toFixed(2)}`, icon: '💰' },
//         ];

//         res.status(200).json(stats);
//     } catch (error) {
//         console.error("Error fetching distributor stats:", error);
//         res.status(500).json({ message: "Erreur lors de la récupération des statistiques.", details: error.message });
//     }
// };

// exports.getProfile = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }

//         const query = `
//             SELECT u.username
//             FROM carryads_user u
//             JOIN carryads_distributers d ON u.id = d.user_id
//             WHERE d.user_id = ?;
//         `;

//         const [rows] = await pool.execute(query, [userId]);

//         if (rows.length === 0) {
//             return res.status(404).json({ message: "User not found." });
//         }

//         res.status(200).json({ username: rows[0].username });
//     } catch (error) {
//         console.error("Error fetching distributor profile:", error);
//         res.status(500).json({ message: "Erreur lors de la récupération du profil.", details: error.message });
//     }
// };

// exports.getPendingCampaigns = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         console.log(`[${new Date().toISOString()}] Fetching pending campaigns for user_id: ${userId}`);

//         const [distributorRows] = await pool.execute(
//             "SELECT id, city FROM carryads_distributers WHERE user_id = ?",
//             [userId]
//         );
//         if (distributorRows.length === 0) {
//             console.error(`[${new Date().toISOString()}] Distributor profile not found for user_id: ${userId}`);
//             return res.status(404).json({ message: "Profil distributeur introuvable." });
//         }
//         const { id: distributorId, city: distributorCity } = distributorRows[0];
//         console.log(`[${new Date().toISOString()}] Distributor ID: ${distributorId}, city: ${distributorCity}`);

//         const cityForQuery = distributorCity.toLowerCase();

//         const query = `
//             SELECT
//                 c.id,
//                 c.name,
//                 cu.company_name AS clientName,
//                 SUM(cs.nbr_support_int) AS bags,
//                 c.description,
//                 c.image_name
//             FROM
//                 carryads_campaigns c
//             JOIN
//                 carryads_customers cu ON c.customers_id = cu.id
//             JOIN
//                 carryads_campaigns_supports cs ON c.id = cs.campaign_id
//             WHERE
//                 c.status = 0
//                 AND c.id NOT IN (
//                     SELECT campaign_id
//                     FROM carryads_ads_distributions
//                     WHERE distributer_id = ?
//                 )
//                 AND JSON_CONTAINS(LOWER(c.regions), ?)
//             GROUP BY
//                 c.id, c.name, cu.company_name, c.description, c.image_name
//         `;
//         const [rows] = await pool.execute(query, [distributorId, JSON.stringify(cityForQuery)]);
//         console.log(`[${new Date().toISOString()}] Pending campaigns found: ${rows.length}`);
//         console.log(`[${new Date().toISOString()}] Campaigns:`, rows);
//         res.status(200).json(rows);
//     } catch (error) {
//         console.error(`[${new Date().toISOString()}] Error fetching pending campaigns:`, error);
//         res.status(500).json({ message: "Erreur lors de la récupération des campagnes en attente." });
//     }
// };

// exports.getActiveCampaigns = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }
        
//         const distributorQuery = `SELECT id FROM carryads_distributers WHERE user_id = ?`;
//         const [distributorRows] = await pool.execute(distributorQuery, [userId]);

//         if (distributorRows.length === 0) {
//             return res.status(404).json({ message: "Distributor not found." });
//         }
        
//         const distributorId = distributorRows[0].id;

//         const query = `
//             SELECT
//                 ad.id,
//                 ad.start_date AS startDate,
//                 ad.end_date AS endDate,
//                 c.name AS campaignName,
//                 c.description,
//                 c.image_name,
//                 cs.nbr_support_int AS impressionsTotal,
//                 cs.nbr_support_distributed AS impressionsRealisees,
//                 CASE WHEN cs.nbr_support_int > 0 THEN (cs.nbr_support_distributed / cs.nbr_support_int) * 5 ELSE 0 END AS performance,
//                 CASE
//                     WHEN ad.status = 1 THEN 'Ongoing'
//                     WHEN ad.status = 2 THEN 'Completed'
//                     WHEN ad.status = 3 THEN 'Annulée'
//                     ELSE 'En attente'
//                 END AS status,
//                 us.username AS clientName
//             FROM
//                 carryads_ads_distributions ad
//             JOIN
//                 carryads_campaigns c ON ad.campaign_id = c.id
//             JOIN
//                 carryads_customers ca ON c.customers_id = ca.id
//             JOIN
//                 carryads_user us ON ca.user_id = us.id
//             JOIN
//                 carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
//             WHERE
//                 ad.distributer_id = ? AND ad.status = 1
//             ORDER BY
//                 ad.start_date DESC;
//         `;
//         const [rows] = await pool.execute(query, [distributorId]);

//         const campaignsData = rows.map(row => ({
//             id: row.id,
//             name: row.campaignName,
//             status: row.status,
//             clientName: row.clientName,
//             description: row.description,
//             image_name: row.image_name,
//             startDate: new Date(row.startDate).toLocaleDateString(),
//             impressionsTotal: row.impressionsTotal,
//             impressionsRealisees: row.impressionsRealisees || 0,
//             bagsRemaining: row.impressionsTotal - (row.impressionsRealisees || 0),
//             performance: (parseFloat(row.performance) || 0).toFixed(1)
//         }));

//         res.status(200).json(campaignsData);
//     } catch (error) {
//         console.error("Error fetching distributor's campaigns:", error);
//         res.status(500).json({ message: "Erreur lors de la récupération de vos campagnes.", details: error.message });
//     }
// };

// exports.getAllCampaigns = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }
        
//         const distributorQuery = `SELECT id FROM carryads_distributers WHERE user_id = ?`;
//         const [distributorRows] = await pool.execute(distributorQuery, [userId]);

//         if (distributorRows.length === 0) {
//             return res.status(404).json({ message: "Distributor not found." });
//         }
        
//         const distributorId = distributorRows[0].id;

//         const query = `
//             SELECT
//                 ad.id,
//                 ad.start_date AS startDate,
//                 ad.end_date AS endDate,
//                 c.name AS campaignName,
//                 c.description,
//                 c.image_name,
//                 cs.nbr_support_int AS impressionsTotal,
//                 cs.nbr_support_distributed AS impressionsRealisees,
//                 CASE WHEN cs.nbr_support_int > 0 THEN (cs.nbr_support_distributed / cs.nbr_support_int) * 5 ELSE 0 END AS performance,
//                 CASE
//                     WHEN ad.status = 1 THEN 'Ongoing'
//                     WHEN ad.status = 2 THEN 'Completed'
//                     WHEN ad.status = 3 THEN 'Annulée'
//                     ELSE 'En attente'
//                 END AS status,
//                 us.username AS clientName
//             FROM
//                 carryads_ads_distributions ad
//             JOIN
//                 carryads_campaigns c ON ad.campaign_id = c.id
//             JOIN
//                 carryads_customers ca ON c.customers_id = ca.id
//             JOIN
//                 carryads_user us ON ca.user_id = us.id
//             JOIN
//                 carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
//             WHERE
//                 ad.distributer_id = ? AND ad.status IN (1, 2)
//             ORDER BY
//                 ad.start_date DESC;
//         `;
//         const [rows] = await pool.execute(query, [distributorId]);

//         const campaignsData = rows.map(row => ({
//             id: row.id,
//             name: row.campaignName,
//             status: row.status,
//             clientName: row.clientName,
//             description: row.description,
//             image_name: row.image_name,
//             startDate: new Date(row.startDate).toLocaleDateString(),
//             impressionsTotal: row.impressionsTotal,
//             impressionsRealisees: row.impressionsRealisees || 0,
//             bagsRemaining: row.impressionsTotal - (row.impressionsRealisees || 0),
//             performance: (parseFloat(row.performance) || 0).toFixed(1)
//         }));

//         res.status(200).json(campaignsData);
//     } catch (error) {
//         console.error("Error fetching distributor's campaigns:", error);
//         res.status(500).json({ message: "Erreur lors de la récupération de vos campagnes.", details: error.message });
//     }
// };

// exports.distributeBags = async (req, res) => {
//     const { campaignId, bagsToDistribute } = req.body;
//     const userId = req.user.id;

//     if (!userId) {
//         return res.status(401).json({ message: "Unauthorized: User ID not found." });
//     }

//     if (!campaignId || !bagsToDistribute || bagsToDistribute <= 0) {
//         return res.status(400).json({ message: "campaignId et bagsToDistribute (un nombre positif) sont requis." });
//     }

//     const connection = await pool.getConnection();
//     try {
//         await connection.beginTransaction();

//         const [adRows] = await connection.execute(
//             `SELECT
//                 ad.campaign_id,
//                 ad.support_id,
//                 ad.nbr_support_int,
//                 cs.nbr_support_distributed,
//                 d.user_id AS distributorUserId
//             FROM carryads_ads_distributions ad
//             JOIN carryads_distributers d ON ad.distributer_id = d.id
//             JOIN carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
//             WHERE ad.id = ? AND d.user_id = ?
//             FOR UPDATE`,
//             [campaignId, userId]
//         );

//         if (adRows.length === 0) {
//             throw new Error("Distribution non trouvée ou non autorisée.");
//         }
        
//         const { campaign_id, support_id, nbr_support_int, nbr_support_distributed } = adRows[0];
//         const currentDistributed = nbr_support_distributed || 0;
//         const newDistributed = currentDistributed + bagsToDistribute;

//         if (newDistributed > nbr_support_int) {
//             throw new Error(`Le nombre de sacs à distribuer dépasse le stock alloué (${nbr_support_int - currentDistributed} sacs restants).`);
//         }

//         await connection.execute(
//             `UPDATE carryads_campaigns_supports
//              SET nbr_support_distributed = ?
//              WHERE campaign_id = ? AND support_id = ?`,
//             [newDistributed, campaign_id, support_id]
//         );

//         const bagsRemaining = nbr_support_int - newDistributed;

//         if (newDistributed === nbr_support_int) {
//             await connection.execute(
//                 `UPDATE carryads_ads_distributions
//                  SET status = 2, end_date = NOW()
//                  WHERE id = ?`,
//                 [campaignId]
//             );

//             const [totalDistributions] = await connection.execute(
//                 `SELECT SUM(ad.nbr_support_int) AS total_int, SUM(cs.nbr_support_distributed) AS total_distributed
//                  FROM carryads_ads_distributions ad
//                  JOIN carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
//                  WHERE ad.campaign_id = ?`,
//                 [campaign_id]
//             );

//             if (totalDistributions[0].total_int === totalDistributions[0].total_distributed) {
//                 await connection.execute(
//                     `UPDATE carryads_campaigns
//                      SET status = 2
//                      WHERE id = ?`,
//                     [campaign_id]
//                 );
//             }
//         }

//         await connection.commit();
//         res.status(200).json({ 
//             message: `Distribution enregistrée avec succès. Total distribué: ${newDistributed}`, 
//             bagsRemaining 
//         });

//     } catch (error) {
//         await connection.rollback();
//         console.error(`[${new Date().toISOString()}] Erreur lors de la distribution des sacs:`, error);
//         res.status(500).json({ message: "Erreur lors de la distribution des sacs.", details: error.message });
//     } finally {
//         connection.release();
//     }
// };

// exports.acceptCampaign = async (req, res) => {
//     try {
//         const { campaignId } = req.body;
//         const userId = req.user.id;

//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }

//         const [distributorRows] = await pool.execute(
//             "SELECT id FROM carryads_distributers WHERE user_id = ?",
//             [userId]
//         );
//         if (distributorRows.length === 0) {
//             return res.status(404).json({ message: "Distributor not found." });
//         }
//         const distributorId = distributorRows[0].id;

//         const [campaignRows] = await pool.execute(
//             `SELECT id, customers_id, regions
//              FROM carryads_campaigns
//              WHERE id = ? AND status = 0`,
//             [campaignId]
//         );
//         if (campaignRows.length === 0) {
//             return res.status(404).json({ message: "Campagne introuvable ou non en attente." });
//         }

//         const [supportRows] = await pool.execute(
//             `SELECT support_id, nbr_support_int
//              FROM carryads_campaigns_supports
//              WHERE campaign_id = ?`,
//             [campaignId]
//         );
//         if (supportRows.length === 0) {
//             return res.status(400).json({ message: "Aucun support associé à la campagne." });
//         }
//         const { support_id, nbr_support_int } = supportRows[0];

//         await pool.execute(
//             `INSERT INTO carryads_ads_distributions
//              (campaign_id, distributer_id, support_id, nbr_support_int, status, start_date)
//              VALUES (?, ?, ?, ?, 1, NOW())`,
//             [campaignId, distributorId, support_id, nbr_support_int]
//         );

//         res.status(200).json({ message: "Campagne acceptée avec succès." });
//     } catch (error) {
//         console.error("Error accepting campaign:", error);
//         res.status(500).json({ message: "Erreur lors de l'acceptation de la campagne." });
//     }
// };

// exports.declineCampaign = async (req, res) => {
//     try {
//         const { campaignId } = req.body;
//         const userId = req.user.id;

//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }

//         const [distributorRows] = await pool.execute(
//             "SELECT id FROM carryads_distributers WHERE user_id = ?",
//             [userId]
//         );
//         if (distributorRows.length === 0) {
//             return res.status(404).json({ message: "Distributor not found." });
//         }
//         const distributorId = distributorRows[0].id;

//         await pool.execute(
//             `INSERT INTO carryads_ads_distributions
//              (campaign_id, distributer_id, status)
//              VALUES (?, ?, 3)`,
//             [campaignId, distributorId]
//         );

//         res.status(200).json({ message: "Campagne refusée avec succès." });
//     } catch (error) {
//         console.error("Error declining campaign:", error);
//         res.status(500).json({ message: "Erreur lors du refus de la campagne." });
//     }
// };

// exports.getPayments = async (req, res) => {
//     try {
//         const userId = req.user.id;

//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }

//         const query = `
//             SELECT
//                 c.id,
//                 CONCAT('INV-', YEAR(c.created_at), '-', LPAD(c.id, 6, '0')) AS invoiceNumber,
//                 c.name AS campaignName,
//                 c.created_at AS issueDate,
//                 COALESCE(cs.nbr_support_distributed * 0.5, 0) AS amountReceived
//             FROM
//                 carryads_campaigns c
//             JOIN
//                 carryads_ads_distributions ad ON c.id = ad.campaign_id
//             JOIN
//                 carryads_campaigns_supports cs ON c.id = cs.campaign_id AND ad.support_id = cs.support_id
//             JOIN
//                 carryads_distributers d ON ad.distributer_id = d.id
//             WHERE
//                 d.user_id = ? AND c.status = 2
//             ORDER BY
//                 c.created_at DESC;
//         `;

//         const [rows] = await pool.execute(query, [userId]);

//         const paymentsData = rows.map(row => ({
//             id: row.id,
//             invoiceNumber: row.invoiceNumber,
//             campaignName: row.campaignName,
//             issueDate: new Date(row.issueDate).toLocaleDateString('fr-FR'),
//             amountReceived: parseFloat(row.amountReceived).toFixed(2)
//         }));

//         res.status(200).json(paymentsData);

//     } catch (error) {
//         console.error("Error fetching distributor payments:", error);
//         res.status(500).json({ message: "Erreur lors de la récupération des paiements.", details: error.message });
//     }
// };

// exports.getPaymentDetails = async (req, res) => {
//     try {
//         const userId = req.user.id;
//         const paymentId = req.params.id;

//         if (!userId) {
//             return res.status(401).json({ message: "Unauthorized: User ID not found." });
//         }

//         const query = `
//             SELECT
//                 c.id,
//                 CONCAT('INV-', YEAR(c.created_at), '-', LPAD(c.id, 6, '0')) AS invoiceNumber,
//                 c.name AS campaignName,
//                 c.created_at AS issueDate,
//                 COALESCE(cs.nbr_support_distributed * 0.5, 0) AS amountReceived
//             FROM
//                 carryads_campaigns c
//             JOIN
//                 carryads_ads_distributions ad ON c.id = ad.campaign_id
//             JOIN
//                 carryads_campaigns_supports cs ON c.id = cs.campaign_id AND ad.support_id = cs.support_id
//             JOIN
//                 carryads_distributers d ON ad.distributer_id = d.id
//             WHERE
//                 c.id = ? AND d.user_id = ? AND c.status = 2;
//         `;

//         const [rows] = await pool.execute(query, [paymentId, userId]);

//         if (rows.length === 0) {
//             return res.status(404).json({ message: "Payment not found or unauthorized." });
//         }

//         const payment = rows[0];

//         res.status(200).json({
//             invoiceNumber: payment.invoiceNumber,
//             campaignName: payment.campaignName,
//             issueDate: new Date(payment.issueDate).toLocaleDateString('fr-FR'),
//             amountReceived: parseFloat(payment.amountReceived).toFixed(2)
//         });

//     } catch (error) {
//         console.error("Error fetching payment details:", error);
//         res.status(500).json({ message: "Erreur lors de la récupération des détails du paiement.", details: error.message });
//     }
// };

const pool = require('../config/db');

exports.getStats = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const distributorQuery = `SELECT id FROM carryads_distributers WHERE user_id = ?`;
        const [distributorRows] = await pool.execute(distributorQuery, [userId]);

        if (distributorRows.length === 0) {
            return res.status(404).json({ message: "Distributor not found." });
        }

        const distributorId = distributorRows[0].id;

        const statsQuery = `
            SELECT
                COALESCE(SUM(ad.nbr_support_int), 0) AS totalImpressions,
                COALESCE(SUM(cs.nbr_support_distributed), 0) AS totalDistributed,
                COALESCE(SUM(CASE WHEN ad.status = 1 THEN 1 ELSE 0 END), 0) AS activeCampaigns,
                COALESCE(SUM(CASE WHEN c.status = 2 THEN cs.nbr_support_distributed * 0.5 ELSE 0 END), 0) AS estimatedRevenue
            FROM
                carryads_ads_distributions ad
            JOIN
                carryads_campaigns c ON ad.campaign_id = c.id
            JOIN
                carryads_campaigns_supports cs ON c.id = cs.campaign_id AND ad.support_id = cs.support_id
            WHERE
                ad.distributer_id = ?;
        `;

        const [statsRows] = await pool.execute(statsQuery, [distributorId]);

        const stats = [
            { title: 'Bags to Distribute', value: statsRows[0].totalImpressions.toLocaleString(), icon: '👁️' },
            { title: 'Bags Distributed', value: statsRows[0].totalDistributed.toLocaleString(), icon: '🛍️' },
            { title: 'Active Campaigns', value: statsRows[0].activeCampaigns.toString(), icon: '📢' },
            { title: 'Estimated Revenue', value: `DT${parseFloat(statsRows[0].estimatedRevenue).toFixed(2)}`, icon: '💰' },
        ];

        res.status(200).json(stats);
    } catch (error) {
        console.error("Error fetching distributor stats:", error);
        res.status(500).json({ message: "Error fetching statistics.", details: error.message });
    }
};
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const query = `
            SELECT u.username
            FROM carryads_user u
            JOIN carryads_distributers d ON u.id = d.user_id
            WHERE d.user_id = ?;
        `;

        const [rows] = await pool.execute(query, [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ username: rows[0].username });
    } catch (error) {
        console.error("Error fetching distributor profile:", error);
        res.status(500).json({ message: "Erreur lors de la récupération du profil.", details: error.message });
    }
};

exports.getPendingCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(`[${new Date().toISOString()}] Fetching pending campaigns for user_id: ${userId}`);

        const [distributorRows] = await pool.execute(
            "SELECT id, city FROM carryads_distributers WHERE user_id = ?",
            [userId]
        );
        if (distributorRows.length === 0) {
            console.error(`[${new Date().toISOString()}] Distributor profile not found for user_id: ${userId}`);
            return res.status(404).json({ message: "Profil distributeur introuvable." });
        }
        const { id: distributorId, city: distributorCity } = distributorRows[0];
        console.log(`[${new Date().toISOString()}] Distributor ID: ${distributorId}, city: ${distributorCity}`);

        const cityForQuery = distributorCity.toLowerCase();

        const query = `
            SELECT
                c.id,
                c.name,
                cu.company_name AS clientName,
                SUM(cs.nbr_support_int) AS bags,
                c.description,
                c.image_name
            FROM
                carryads_campaigns c
            JOIN
                carryads_customers cu ON c.customers_id = cu.id
            JOIN
                carryads_campaigns_supports cs ON c.id = cs.campaign_id
            WHERE
                c.status = 0
                AND c.id NOT IN (
                    SELECT campaign_id
                    FROM carryads_ads_distributions
                    WHERE distributer_id = ?
                )
                AND JSON_CONTAINS(LOWER(c.regions), ?)
            GROUP BY
                c.id, c.name, cu.company_name, c.description, c.image_name
        `;
        const [rows] = await pool.execute(query, [distributorId, JSON.stringify(cityForQuery)]);
        console.log(`[${new Date().toISOString()}] Pending campaigns found: ${rows.length}`);
        console.log(`[${new Date().toISOString()}] Campaigns:`, rows);
        res.status(200).json(rows);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching pending campaigns:`, error);
        res.status(500).json({ message: "Erreur lors de la récupération des campagnes en attente." });
    }
};

exports.getActiveCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }
        
        const distributorQuery = `SELECT id FROM carryads_distributers WHERE user_id = ?`;
        const [distributorRows] = await pool.execute(distributorQuery, [userId]);

        if (distributorRows.length === 0) {
            return res.status(404).json({ message: "Distributor not found." });
        }
        
        const distributorId = distributorRows[0].id;

        const query = `
            SELECT
                ad.id,
                ad.start_date AS startDate,
                ad.end_date AS endDate,
                c.name AS campaignName,
                c.description,
                c.image_name,
                cs.nbr_support_int AS impressionsTotal,
                cs.nbr_support_distributed AS impressionsRealisees,
                CASE WHEN cs.nbr_support_int > 0 THEN (cs.nbr_support_distributed / cs.nbr_support_int) * 5 ELSE 0 END AS performance,
                CASE
                    WHEN ad.status = 1 THEN 'Ongoing'
                    WHEN ad.status = 2 THEN 'Completed'
                    WHEN ad.status = 3 THEN 'Cancelled'
                    ELSE 'En attente'
                END AS status,
                us.username AS clientName
            FROM
                carryads_ads_distributions ad
            JOIN
                carryads_campaigns c ON ad.campaign_id = c.id
            JOIN
                carryads_customers ca ON c.customers_id = ca.id
            JOIN
                carryads_user us ON ca.user_id = us.id
            JOIN
                carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
            WHERE
                ad.distributer_id = ? AND ad.status = 1
            ORDER BY
                ad.start_date DESC;
        `;
        const [rows] = await pool.execute(query, [distributorId]);

        const campaignsData = rows.map(row => ({
            id: row.id,
            name: row.campaignName,
            status: row.status,
            clientName: row.clientName,
            description: row.description,
            image_name: row.image_name,
            startDate: new Date(row.startDate).toLocaleDateString(),
            impressionsTotal: row.impressionsTotal,
            impressionsRealisees: row.impressionsRealisees || 0,
            bagsRemaining: row.impressionsTotal - (row.impressionsRealisees || 0),
            performance: (parseFloat(row.performance) || 0).toFixed(1)
        }));

        res.status(200).json(campaignsData);
    } catch (error) {
        console.error("Error fetching distributor's campaigns:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de vos campagnes.", details: error.message });
    }
};

exports.getAllCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }
        
        const distributorQuery = `SELECT id FROM carryads_distributers WHERE user_id = ?`;
        const [distributorRows] = await pool.execute(distributorQuery, [userId]);

        if (distributorRows.length === 0) {
            return res.status(404).json({ message: "Distributor not found." });
        }
        
        const distributorId = distributorRows[0].id;

        const query = `
            SELECT
                ad.id,
                ad.start_date AS startDate,
                ad.end_date AS endDate,
                c.name AS campaignName,
                c.description,
                c.image_name,
                cs.nbr_support_int AS impressionsTotal,
                cs.nbr_support_distributed AS impressionsRealisees,
                CASE WHEN cs.nbr_support_int > 0 THEN (cs.nbr_support_distributed / cs.nbr_support_int) * 5 ELSE 0 END AS performance,
                CASE
                    WHEN ad.status = 1 THEN 'Ongoing'
                    WHEN ad.status = 2 THEN 'Completed'
                    WHEN ad.status = 3 THEN 'Cancelled'
                    ELSE 'En attente'
                END AS status,
                us.username AS clientName
            FROM
                carryads_ads_distributions ad
            JOIN
                carryads_campaigns c ON ad.campaign_id = c.id
            JOIN
                carryads_customers ca ON c.customers_id = ca.id
            JOIN
                carryads_user us ON ca.user_id = us.id
            JOIN
                carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
            WHERE
                ad.distributer_id = ? AND ad.status IN (1, 2)
            ORDER BY
                ad.start_date DESC;
        `;
        const [rows] = await pool.execute(query, [distributorId]);

        const campaignsData = rows.map(row => ({
            id: row.id,
            name: row.campaignName,
            status: row.status,
            clientName: row.clientName,
            description: row.description,
            image_name: row.image_name,
            startDate: new Date(row.startDate).toLocaleDateString(),
            impressionsTotal: row.impressionsTotal,
            impressionsRealisees: row.impressionsRealisees || 0,
            bagsRemaining: row.impressionsTotal - (row.impressionsRealisees || 0),
            performance: (parseFloat(row.performance) || 0).toFixed(1)
        }));

        res.status(200).json(campaignsData);
    } catch (error) {
        console.error("Error fetching distributor's campaigns:", error);
        res.status(500).json({ message: "Erreur lors de la récupération de vos campagnes.", details: error.message });
    }
};

exports.distributeBags = async (req, res) => {
    const { campaignId, bagsToDistribute } = req.body;
    const userId = req.user.id;

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User ID not found." });
    }

    if (!campaignId || !bagsToDistribute || bagsToDistribute <= 0) {
        return res.status(400).json({ message: "campaignId et bagsToDistribute (un nombre positif) sont requis." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [adRows] = await connection.execute(
            `SELECT
                ad.campaign_id,
                ad.support_id,
                ad.nbr_support_int,
                cs.nbr_support_distributed,
                d.user_id AS distributorUserId
            FROM carryads_ads_distributions ad
            JOIN carryads_distributers d ON ad.distributer_id = d.id
            JOIN carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
            WHERE ad.id = ? AND d.user_id = ?
            FOR UPDATE`,
            [campaignId, userId]
        );

        if (adRows.length === 0) {
            throw new Error("Distribution non trouvée ou non autorisée.");
        }
        
        const { campaign_id, support_id, nbr_support_int, nbr_support_distributed } = adRows[0];
        const currentDistributed = nbr_support_distributed || 0;
        const newDistributed = currentDistributed + bagsToDistribute;

        if (newDistributed > nbr_support_int) {
            throw new Error(`Le nombre de sacs à distribuer dépasse le stock alloué (${nbr_support_int - currentDistributed} sacs restants).`);
        }

        await connection.execute(
            `UPDATE carryads_campaigns_supports
             SET nbr_support_distributed = ?
             WHERE campaign_id = ? AND support_id = ?`,
            [newDistributed, campaign_id, support_id]
        );

        const bagsRemaining = nbr_support_int - newDistributed;

        if (newDistributed === nbr_support_int) {
            await connection.execute(
                `UPDATE carryads_ads_distributions
                 SET status = 2, end_date = NOW()
                 WHERE id = ?`,
                [campaignId]
            );

            const [totalDistributions] = await connection.execute(
                `SELECT SUM(ad.nbr_support_int) AS total_int, SUM(cs.nbr_support_distributed) AS total_distributed
                 FROM carryads_ads_distributions ad
                 JOIN carryads_campaigns_supports cs ON cs.campaign_id = ad.campaign_id AND cs.support_id = ad.support_id
                 WHERE ad.campaign_id = ?`,
                [campaign_id]
            );

            if (totalDistributions[0].total_int === totalDistributions[0].total_distributed) {
                await connection.execute(
                    `UPDATE carryads_campaigns
                     SET status = 2
                     WHERE id = ?`,
                    [campaign_id]
                );
            }
        }

        await connection.commit();
        res.status(200).json({ 
            message: `Distribution enregistrée avec succès. Total distribué: ${newDistributed}`, 
            bagsRemaining 
        });

    } catch (error) {
        await connection.rollback();
        console.error(`[${new Date().toISOString()}] Erreur lors de la distribution des sacs:`, error);
        res.status(500).json({ message: "Erreur lors de la distribution des sacs.", details: error.message });
    } finally {
        connection.release();
    }
};

exports.acceptCampaign = async (req, res) => {
    try {
        const { campaignId } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const [distributorRows] = await pool.execute(
            "SELECT id FROM carryads_distributers WHERE user_id = ?",
            [userId]
        );
        if (distributorRows.length === 0) {
            return res.status(404).json({ message: "Distributor not found." });
        }
        const distributorId = distributorRows[0].id;

        const [campaignRows] = await pool.execute(
            `SELECT id, customers_id, regions
             FROM carryads_campaigns
             WHERE id = ? AND status = 0`,
            [campaignId]
        );
        if (campaignRows.length === 0) {
            return res.status(404).json({ message: "Campagne introuvable ou non en attente." });
        }

        const [supportRows] = await pool.execute(
            `SELECT support_id, nbr_support_int
             FROM carryads_campaigns_supports
             WHERE campaign_id = ?`,
            [campaignId]
        );
        if (supportRows.length === 0) {
            return res.status(400).json({ message: "Aucun support associé à la campagne." });
        }
        const { support_id, nbr_support_int } = supportRows[0];

        await pool.execute(
            `INSERT INTO carryads_ads_distributions
             (campaign_id, distributer_id, support_id, nbr_support_int, status, start_date)
             VALUES (?, ?, ?, ?, 1, NOW())`,
            [campaignId, distributorId, support_id, nbr_support_int]
        );

        await pool.execute(
            `UPDATE carryads_campaigns
             SET status = 1
             WHERE id = ?`,
            [campaignId]
        );

        res.status(200).json({ message: "Campagne acceptée avec succès." });
    } catch (error) {
        console.error("Error accepting campaign:", error);
        res.status(500).json({ message: "Erreur lors de l'acceptation de la campagne." });
    }
};

exports.declineCampaign = async (req, res) => {
    try {
        const { campaignId } = req.body;
        const userId = req.user.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const [distributorRows] = await pool.execute(
            "SELECT id FROM carryads_distributers WHERE user_id = ?",
            [userId]
        );
        if (distributorRows.length === 0) {
            return res.status(404).json({ message: "Distributor not found." });
        }
        const distributorId = distributorRows[0].id;

        // Verify the campaign exists and is in pending status
        const [campaignRows] = await pool.execute(
            `SELECT id, customers_id, regions
             FROM carryads_campaigns
             WHERE id = ? AND status = 0`,
            [campaignId]
        );
        if (campaignRows.length === 0) {
            return res.status(404).json({ message: "Campagne introuvable ou non en attente." });
        }

        // Retrieve support_id from carryads_campaigns_supports
        const [supportRows] = await pool.execute(
            `SELECT support_id
             FROM carryads_campaigns_supports
             WHERE campaign_id = ?`,
            [campaignId]
        );
        if (supportRows.length === 0) {
            return res.status(400).json({ message: "Aucun support associé à la campagne." });
        }
        const { support_id } = supportRows[0];

        // Insert into carryads_ads_distributions with support_id
        await pool.execute(
            `INSERT INTO carryads_ads_distributions
             (campaign_id, distributer_id, support_id, status)
             VALUES (?, ?, ?, 3)`,
            [campaignId, distributorId, support_id]
        );

        res.status(200).json({ message: "Campagne refusée avec succès." });
    } catch (error) {
        console.error("Error declining campaign:", error);
        res.status(500).json({ message: "Erreur lors du refus de la campagne.", details: error.message });
    }
};

exports.getPayments = async (req, res) => {
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
                COALESCE(cs.nbr_support_distributed * 0.5, 0) AS amountReceived
            FROM
                carryads_campaigns c
            JOIN
                carryads_ads_distributions ad ON c.id = ad.campaign_id
            JOIN
                carryads_campaigns_supports cs ON c.id = cs.campaign_id AND ad.support_id = cs.support_id
            JOIN
                carryads_distributers d ON ad.distributer_id = d.id
            WHERE
                d.user_id = ? AND c.status = 2
            ORDER BY
                c.created_at DESC;
        `;

        const [rows] = await pool.execute(query, [userId]);

        const paymentsData = rows.map(row => ({
            id: row.id,
            invoiceNumber: row.invoiceNumber,
            campaignName: row.campaignName,
            issueDate: new Date(row.issueDate).toLocaleDateString('fr-FR'),
            amountReceived: parseFloat(row.amountReceived).toFixed(2)
        }));

        res.status(200).json(paymentsData);

    } catch (error) {
        console.error("Error fetching distributor payments:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des paiements.", details: error.message });
    }
};

exports.getPaymentDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const paymentId = req.params.id;

        if (!userId) {
            return res.status(401).json({ message: "Unauthorized: User ID not found." });
        }

        const query = `
            SELECT
                c.id,
                CONCAT('INV-', YEAR(c.created_at), '-', LPAD(c.id, 6, '0')) AS invoiceNumber,
                c.name AS campaignName,
                c.created_at AS issueDate,
                COALESCE(cs.nbr_support_distributed * 0.5, 0) AS amountReceived
            FROM
                carryads_campaigns c
            JOIN
                carryads_ads_distributions ad ON c.id = ad.campaign_id
            JOIN
                carryads_campaigns_supports cs ON c.id = cs.campaign_id AND ad.support_id = cs.support_id
            JOIN
                carryads_distributers d ON ad.distributer_id = d.id
            WHERE
                c.id = ? AND d.user_id = ? AND c.status = 2;
        `;

        const [rows] = await pool.execute(query, [paymentId, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Payment not found or unauthorized." });
        }

        const payment = rows[0];

        res.status(200).json({
            invoiceNumber: payment.invoiceNumber,
            campaignName: payment.campaignName,
            issueDate: new Date(payment.issueDate).toLocaleDateString('fr-FR'),
            amountReceived: parseFloat(payment.amountReceived).toFixed(2)
        });

    } catch (error) {
        console.error("Error fetching payment details:", error);
        res.status(500).json({ message: "Erreur lors de la récupération des détails du paiement.", details: error.message });
    }
};