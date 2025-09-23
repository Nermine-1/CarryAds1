const pool = require('../config/db');

exports.getAnnonceurDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the customer ID
    const [customerRows] = await pool.execute('SELECT id, company_name FROM carryads_customers WHERE user_id = ?', [userId]);
    if (customerRows.length === 0) {
      console.error('Error: Advertiser profile not found for userId:', userId);
      return res.status(404).json({ message: 'Advertiser profile not found.' });
    }
    const customerId = customerRows[0].id;
    const companyName = customerRows[0].company_name || 'Advertiser';

    // Get global stats
    const [statsData] = await pool.execute(
      `SELECT 
        COUNT(CASE WHEN c.status = 1 THEN 1 END) AS activeCampaigns,
        COALESCE(SUM(cs.nbr_support_int), 0) AS totalImpressions,
        COALESCE(SUM(c.total_price), 0) AS totalBudgetSpent,
        COALESCE(cs.nbr_support_distributed * 0.5, 0) AS amount_to_pay 
      FROM carryads_campaigns c
      LEFT JOIN carryads_campaigns_supports cs ON c.id = cs.campaign_id
      WHERE c.customers_id = ?`,
      [customerId]
    );
    const stats = statsData[0] || { activeCampaigns: 0, totalImpressions: 0, totalBudgetSpent: 0 ,amount_to_pay:0};

    // Get recent campaigns with corrected status mapping
    const [recentCampaignsData] = await pool.execute(
      `SELECT c.name, c.status, COALESCE(cs.nbr_support_int, 0) AS impressions, c.total_price AS budget 
      FROM carryads_campaigns c
      LEFT JOIN carryads_campaigns_supports cs ON c.id = cs.campaign_id
      WHERE c.customers_id = ? 
      ORDER BY c.created_at DESC 
      LIMIT 3`,
      [customerId]
    );

    // Get campaign names for the dropdown
    const [campaignNamesData] = await pool.execute(
      `SELECT name 
      FROM carryads_campaigns 
      WHERE customers_id = ?`,
      [customerId]
    );
    const campaignNames = campaignNamesData.map((row) => row.name);

    const getCampaignsByDate = async (days) => {
        const [rows] = await pool.execute(
            `SELECT DATE(created_at) as date, COUNT(*) as count 
             FROM carryads_campaigns
             WHERE customers_id = ?
             AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
             GROUP BY date
             ORDER BY date ASC`,
            [customerId, days]
        );
        return rows;
    };

    const last30DaysData = await getCampaignsByDate(30);
    const last7DaysData = await getCampaignsByDate(7);

    const generateChartData = (data, days) => {
        const chart = {};
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
            });
            chart[dateString] = 0;
        }

        data.forEach(row => {
            const date = new Date(row.date);
            const dateString = date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
            });
            chart[dateString] = row.count;
        });

        return Object.keys(chart).map(date => ({
            name: date,
            campaigns: chart[date],
        }));
    };

    const chartData = [
      {
        campaign: 'all-campaigns',
        period: '30-days',
        data: generateChartData(last30DaysData, 30),
      },
      {
        campaign: 'all-campaigns',
        period: '7-days',
        data: generateChartData(last7DaysData, 7),
      },
    ];

    // Format data for the frontend
    const dashboardStats = [
      { title: 'Current Campaigns', value: stats.activeCampaigns || 0, icon: '📝' },
      { title: 'Total Stocks', value: (stats.totalImpressions || 0).toLocaleString(), icon: '📈' },
      { title: 'Total Budget', value: `${((stats.totalBudgetSpent ) || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'TND' })}`, icon: '💰' },
      { title: 'Performance ', value: 'N/A', icon: '⭐' },
    ];

    const dashboardRecentCampaigns = recentCampaignsData.map((campaign) => ({
      name: campaign.name,
      // 🆕 Corrected status mapping
      status: campaign.status === 0 ? 'Pending' : (campaign.status === 1 ? 'Ongoing' : (campaign.status === 2 ? 'Completed' : 'Inconnu')),
      impressions: (campaign.impressions || 0).toLocaleString(),
      budget: `${(campaign.budget || 0).toLocaleString('fr-FR', { style: 'currency', currency: 'TND' })}`,
    }));

    res.status(200).json({
      userName: companyName,
      stats: dashboardStats,
      recentCampaigns: dashboardRecentCampaigns,
      campaignNames,
      chartData,
    });
  } catch (error) {
    console.error('Error fetching advertiser dashboard data:', error);
    res.status(500).json({ message: 'Server error fetching dashboard data.', error: error.message });
  }
};