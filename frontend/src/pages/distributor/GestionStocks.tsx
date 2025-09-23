import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios, { isAxiosError } from "axios";
import { FaInfoCircle, FaRegImage } from "react-icons/fa";
import CampaignDetailsModal from "../../components/annonceur/CampaignDetailsModal";
import VisualViewerModal from "../../components/annonceur/VisualViewerModal";
import '../../styles/components/Modal.css';

type Notification = {
  id: number;
  message: string;
  type: "info" | "warning" | "success" | "error";
};

type PendingCampaign = {
  id: number;
  name: string;
  clientName: string;
  bags: number;
  description: string;
  image_name: string | null;
};

type ActiveCampaign = {
  id: number;
  name: string;
  clientName: string;
  bagsRemaining: number;
  totalBags: number;
};

const api = axios.create({
  baseURL: "http://localhost:4242/api/distributeur",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(`[Frontend ${new Date().toISOString()}] Token in request: ${token ? `Present (${token.substring(0, 10)}...)` : "Missing"}`);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    console.error("[Frontend] No token found in localStorage for request:", config.url);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (isAxiosError(error)) {
      console.error(`[Frontend ${new Date().toISOString()}] Request error:`, {
        url: error.config?.url,
        status: error.response?.status,
        message: error.response?.data?.message || "Unknown error",
      });
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log(`[Frontend ${new Date().toISOString()}] Unauthorized, clearing token and redirecting to login`);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      console.error(`[Frontend ${new Date().toISOString()}] Non-Axios error:`, error);
    }
    return Promise.reject(error);
  }
);

export default function StockManagement() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [pendingCampaigns, setPendingCampaigns] = useState<PendingCampaign[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [bagsToDistribute, setBagsToDistribute] = useState<Record<number, number>>({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVisualModal, setShowVisualModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<PendingCampaign | null>(null);

  const fetchData = async () => {
    try {
      console.log(`[Frontend ${new Date().toISOString()}] Fetching pending and active campaigns`);
      const [pendingRes, activeRes] = await Promise.all([
        api.get("/pending"),
        api.get("/active"),
      ]);

      setPendingCampaigns(pendingRes.data);
      setActiveCampaigns(activeRes.data);
      console.log(`[Frontend ${new Date().toISOString()}] Campaigns loaded:`, {
        pending: pendingRes.data,
        active: activeRes.data,
      });
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error(`[Frontend ${new Date().toISOString()}] Error fetching campaigns:`, {
          message: error.response?.data?.message,
          status: error.response?.status,
          url: error.config?.url,
        });
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: error.response?.data?.message || "Unable to load campaigns.",
            type: "warning",
          },
        ]);
      } else {
        console.error(`[Frontend ${new Date().toISOString()}] Non-Axios error fetching campaigns:`, error);
        setNotifications((prev) => [
          ...prev,
          {
            id: Date.now(),
            message: "Unexpected error while loading campaigns.",
            type: "warning",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.log(`[Frontend ${new Date().toISOString()}] No token in localStorage, redirecting to login`);
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: "Please log in.", type: "warning" },
      ]);
      window.location.href = "/login";
    } else {
      console.log(`[Frontend ${new Date().toISOString()}] Token found in localStorage: ${token.substring(0, 10)}...`);
      fetchData();
    }
  }, []);

  const handleAcceptCampaign = async (campaignId: number) => {
    try {
      console.log(`[Frontend ${new Date().toISOString()}] Accepting campaign ID: ${campaignId}`);
      await api.post("/accept-campaign", { campaignId });
      setPendingCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: `You have accepted campaign ${campaignId}`, type: "success" },
      ]);
      await fetchData();
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("[Frontend] Error accepting campaign:", {
          message: error.response?.data?.message,
          status: error.response?.status,
        });
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: error.response?.data?.message || "Error while accepting the campaign.", type: "warning" },
        ]);
      } else {
        console.error("[Frontend] Non-Axios error accepting campaign:", error);
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: "Unexpected error while accepting the campaign.", type: "warning" },
        ]);
      }
    }
  };

  const handleDeclineCampaign = async (campaignId: number) => {
    try {
      console.log(`[Frontend ${new Date().toISOString()}] Declining campaign ID: ${campaignId}`);
      await api.post("/decline-campaign", { campaignId });
      setPendingCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: `You have declined campaign ${campaignId}`, type: "info" },
      ]);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("[Frontend] Error declining campaign:", {
          message: error.response?.data?.message,
          status: error.response?.status,
        });
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: error.response?.data?.message || "Error while declining the campaign.", type: "warning" },
        ]);
      } else {
        console.error("[Frontend] Non-Axios error declining campaign:", error);
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: "Unexpected error while declining the campaign.", type: "warning" },
        ]);
      }
    }
  };

  const handleViewDetails = (campaign: PendingCampaign) => {
    setSelectedCampaign(campaign);
    setShowDetailsModal(true);
  };

  const handleViewVisual = (campaign: PendingCampaign) => {
    if (!campaign.image_name) {
      setNotifications((prev) => [
        ...prev,
        { id: Date.now(), message: "No visual available for this campaign.", type: "warning" },
      ]);
      return;
    }
    setSelectedCampaign(campaign);
    setShowVisualModal(true);
  };

  const handleDistributeBags = async (campaignId: number) => {
    const bags = bagsToDistribute[campaignId];
    const campaign = activeCampaigns.find(c => c.id === campaignId);

    if (!campaign) {
      setNotifications(prev => [...prev, { id: Date.now(), message: "Campaign not found.", type: "warning" }]);
      return;
    }

    if (!bags || bags <= 0 || bags > campaign.bagsRemaining) {
      setNotifications(prev => [...prev, { id: Date.now(), message: "Please enter a valid number of bags to distribute.", type: "warning" }]);
      return;
    }

    try {
      console.log(`[Frontend ${new Date().toISOString()}] Distributing ${bags} bags for campaign ID: ${campaignId}`);
      const response = await api.post("/distribute", { campaignId, bagsToDistribute: bags });
      if (bags === campaign.bagsRemaining) {
        setNotifications(prev => [...prev, { id: Date.now(), message: `Stock for campaign ${campaign.name} is finished.`, type: "error" }]);
      } else {
        setNotifications((prev) => [
          ...prev,
          { id: Date.now(), message: `${bags} bags distributed for campaign ${campaign.name}`, type: "success" },
        ]);
      }
      setBagsToDistribute(prev => ({ ...prev, [campaignId]: 0 }));
      await fetchData();
      const updatedBagsRemaining = response.data.bagsRemaining;
      setActiveCampaigns(prev =>
        prev.map(c =>
          c.id === campaignId ? { ...c, bagsRemaining: updatedBagsRemaining } : c
        )
      );
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        console.error("[Frontend] Error distributing bags:", {
          message: error.response?.data?.message,
          status: error.response?.status,
        });
        setNotifications(prev => [...prev, { id: Date.now(), message: error.response?.data?.message || "Distribution error.", type: "warning" }]);
      } else {
        console.error("[Frontend] Non-Axios error distributing bags:", error);
        setNotifications(prev => [...prev, { id: Date.now(), message: "Unexpected distribution error.", type: "warning" }]);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "info": return "bg-blue-100 text-blue-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "success": return "bg-green-100 text-green-800";
      case "error": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
        <h1 className="text-2xl font-bold text-gray-700">Loading page...</h1>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6 font-sans antialiased">
      <div className="max-w-7xl mx-auto py-8">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Stock Management</h1>
        <p className="text-lg text-gray-600 mb-8">
          Manage advertising campaigns and your bag stock.
        </p>

        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Notifications</h2>
          <div className="space-y-3">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-lg ${getNotificationColor(notif.type)}`}
                >
                  <p>{notif.message}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No new notifications.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">New Campaigns (Pending)</h2>
          {pendingCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingCampaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  variants={itemVariants}
                  className="p-6 bg-gray-50 rounded-lg shadow"
                >
                  <h3 className="text-xl font-bold mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 mb-2">Client: {campaign.clientName}</p>
                  <p className="text-gray-600 mb-4">
                    Bags to distribute:{" "}
                    <span className="font-semibold text-gray-800">{campaign.bags.toLocaleString()}</span>
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleViewDetails(campaign)}
                      className="action-btn"
                      title="View details"
                    >
                      <FaInfoCircle />
                    </button>
                    <button
                      onClick={() => handleViewVisual(campaign)}
                      className={`action-btn ${!campaign.image_name ? 'disabled' : ''}`}
                      title={campaign.image_name ? 'View visual' : 'No visual available'}
                      disabled={!campaign.image_name}
                    >
                      <FaRegImage />
                    </button>
                    <button
                      onClick={() => handleAcceptCampaign(campaign.id)}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleDeclineCampaign(campaign.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending campaigns.</p>
          )}
        </motion.div>

        <motion.div
          className="bg-white rounded-xl shadow-lg p-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Active Campaigns</h2>
          {activeCampaigns.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeCampaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  variants={itemVariants}
                  className="p-6 bg-blue-50 rounded-lg shadow"
                >
                  <h3 className="text-xl font-bold mb-2">{campaign.name}</h3>
                  <p className="text-gray-600 mb-2">Client: {campaign.clientName}</p>
                  <p className="text-gray-600 mb-4">
                    Remaining bags:{" "}
                    <span className="font-semibold text-gray-800">{campaign.bagsRemaining}</span> /{" "}
                    {campaign.totalBags}
                  </p>
                  <div className="relative w-full bg-gray-200 rounded-full h-8 mb-4">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{ width: `${(campaign.bagsRemaining / campaign.totalBags) * 100}%` }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                      {campaign.bagsRemaining} / {campaign.totalBags} bags
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={bagsToDistribute[campaign.id] || ''}
                        onChange={(e) =>
                          setBagsToDistribute({ ...bagsToDistribute, [campaign.id]: parseInt(e.target.value) || 0 })
                        }
                        placeholder="Number of bags"
                        className="w-2/3 p-2 rounded-lg border-gray-300 border focus:ring-blue-500 focus:border-blue-500"
                        min="1"
                        max={campaign.bagsRemaining}
                      />
                      <button
                        onClick={() => handleDistributeBags(campaign.id)}
                        className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Distribute
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No active campaigns.</p>
          )}
        </motion.div>

        <AnimatePresence>
          {showDetailsModal && selectedCampaign && (
            <CampaignDetailsModal
              campaign={{
                id: selectedCampaign.id,
                name: selectedCampaign.name,
                clientName: selectedCampaign.clientName,
                status: 'Pending' as const,
                description: selectedCampaign.description || '',
                image_name: selectedCampaign.image_name,
                startDate: '',
                endDate: '',
                impressionsTotal: selectedCampaign.bags,
                impressionsRealisees: 0,
                performance: '0.0',
                budgetTotal: 0,
                budgetRestant: 0,
                distributeurs: [],
              }}
              onClose={() => setShowDetailsModal(false)}
            />
          )}
          {showVisualModal && selectedCampaign && selectedCampaign.image_name && (
            <VisualViewerModal
              imageUrl={`https://storage.googleapis.com/carryad-images/${selectedCampaign.image_name}`}
              onClose={() => setShowVisualModal(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
