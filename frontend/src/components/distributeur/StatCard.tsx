import React from 'react';
import { motion } from 'framer-motion';

interface StatProps {
  title: string;
  value: string | number;
  icon: string;
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const StatCard: React.FC<StatProps> = ({ title, value, icon }) => {
  return (
    <motion.div className="stat-card" variants={itemVariants}>
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-300">
      <div className="text-4xl text-blue-500 mb-2">{icon}</div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase">{title}</h3>
      <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
    </div>
    </motion.div>
  );
};

export default StatCard;
