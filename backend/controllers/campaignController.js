const pool = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

exports.createCampaign = async (req, res) => {
  console.log('Données de la campagne reçues:', req.body);
  console.log('Fichier visuel reçu:', req.file);

  try {
    // Vérification et création du dossier 'Uploads'
    const uploadDir = path.join(__dirname, '..', 'Uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      console.log(`Dossier Uploads vérifié/créé: ${uploadDir}`);
    } catch (mkdirError) {
      console.error('Erreur lors de la création du dossier Uploads:', mkdirError);
      return res.status(500).json({ message: 'Erreur serveur: Impossible de créer le dossier Uploads.' });
    }

    // Vérification du fichier visuel
    let image_name = null;
    const needDesigner = req.body.needDesigner === 'true';
    if (!needDesigner) {
      if (!req.file) {
        return res.status(400).json({ message: 'Un fichier visuel est requis si aucun designer n\'est demandé.' });
      }
      const filePath = path.join(uploadDir, req.file.filename);
      try {
        await fs.access(filePath);
        image_name = req.file.filename;
      } catch (fileError) {
        console.error(`Fichier introuvable: ${filePath}`, fileError);
        return res.status(500).json({ message: 'Erreur serveur: Le fichier téléchargé est introuvable.' });
      }
    }

    const userId = req.user.id;

    // Trouver l'ID du client
    const [customerRows] = await pool.execute('SELECT id FROM carryads_customers WHERE user_id = ?', [userId]);
    if (customerRows.length === 0) {
      console.error('Erreur: Profil annonceur introuvable pour userId:', userId);
      return res.status(404).json({ message: 'Profil annonceur introuvable.' });
    }
    const customerId = customerRows[0].id;

    // Préparer les données
    const {
      nomCampagne,
      description,
      dateDebut,
      supportName,
      supportUnitPrice,
      numberOfSupports,
      totalPrice,
      distributeurs,
    } = req.body;

    if (!nomCampagne || !dateDebut) {
      return res.status(400).json({ message: 'Les champs nomCampagne et dateDebut sont requis.' });
    }
    if (!supportName || !supportUnitPrice || !numberOfSupports) {
      return res.status(400).json({ message: 'Les champs supportName, supportUnitPrice et numberOfSupports sont requis.' });
    }

   let regionsJson = '[]';
if (distributeurs) {
  try {
    const parsedDistributeurs = JSON.parse(distributeurs);
    console.log('Parsed distributeurs:', parsedDistributeurs);
    if (!Array.isArray(parsedDistributeurs) || parsedDistributeurs.length === 0) {
      console.warn('distributeurs n\'est pas un tableau JSON valide:', distributeurs);
      return res.status(400).json({ message: 'Format des distributeurs invalide.' });
    }

    // Define static distributors list to match frontend
    const distributorsList = [
      { id: '1', name: 'Monastir' },
      { id: '2', name: 'Tunis' },
      { id: '3', name: 'Sousse' },
      { id: '4', name: 'Nabeul' },
      { id: '5', name: 'Sfax' },
    ];

    // Try to fetch distributor names from the database
    let regionNames = [];
    const placeholders = parsedDistributeurs.map(() => '?').join(', ');
    const [distributorRows] = await pool.execute(
      `SELECT id, city FROM carryads_distributers WHERE id IN (${placeholders})`,
      parsedDistributeurs
    );
    console.log('Distributor rows retrieved:', distributorRows);

    if (distributorRows.length > 0) {
      // Use database results if available
      regionNames = distributorRows.map(row => row.city);
    } else {
      // Fallback to static distributorsList
      console.warn('No distributors found in database, using fallback distributorsList');
      regionNames = parsedDistributeurs
        .map(id => distributorsList.find(dist => dist.id === id)?.name)
        .filter(name => name); // Remove undefined values
    }

    console.log('Region names to save:', regionNames);
    regionsJson = JSON.stringify(regionNames);
  } catch (parseError) {
    console.error('Erreur de parsing JSON pour distributeurs:', parseError);
    return res.status(400).json({ message: 'Format des distributeurs invalide.', error: parseError.message });
  }
}
    const parsedSupportUnitPrice = parseFloat(supportUnitPrice) || 0;
    const parsedNumberOfSupports = parseInt(numberOfSupports) || 0;
    const parsedTotalPrice = parseFloat(totalPrice) || 0;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insérer dans carryads_campaigns
      const [campaignResult] = await connection.execute(
    `INSERT INTO carryads_campaigns (
        customers_id, name, description, status, regions, created_at,
        need_designer, image_name, total_price
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        customerId,
        nomCampagne,
        description || '',
        0,
        regionsJson ,
        dateDebut,
        needDesigner ? 1 : 0,
        image_name,
        parsedTotalPrice,
    ]
);
      const campaignId = campaignResult.insertId;

      // Insérer dans carryads_supports
      if (supportName && parsedSupportUnitPrice > 0 && parsedNumberOfSupports > 0) {
        const [supportResult] = await connection.execute(
          `INSERT INTO carryads_supports (name, price, image_name) VALUES (?, ?, ?)`,
          [supportName, parsedSupportUnitPrice, image_name]
        );
        const supportId = supportResult.insertId;

        // Insérer dans carryads_campaigns_supports
        await connection.execute(
          `INSERT INTO carryads_campaigns_supports (campaign_id, support_id, nbr_support_int, nbr_support_distributed) VALUES (?, ?, ?, ?)`,
          [campaignId, supportId, parsedNumberOfSupports, 0]
        );
      } else {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ message: 'Informations sur le support incomplètes.' });
      }

      await connection.commit();
      connection.release();

      res.status(201).json({ message: 'Campagne créée avec succès !', campaignId });
    } catch (dbError) {
      await connection.rollback();
      connection.release();
      console.error('Erreur de base de données:', dbError);
      return res.status(500).json({ message: 'Erreur de base de données lors de la création de la campagne.', error: dbError.message });
    }
  } catch (error) {
    console.error('Erreur générale:', error);
    res.status(500).json({ message: 'Erreur serveur interne.', error: error.message });
  }
};


