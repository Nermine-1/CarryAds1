import { motion } from 'framer-motion';
import '../../styles/components/StatCard.css';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
}

const StatCard = ({ title, value, icon }: StatCardProps) => {
  return (
    <motion.div
      className="stat-card"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <div>
        <h3 className="stat-card-title">{title}</h3>
        <p className="stat-card-value">{value}</p>
      </div>
      <div className="stat-card-icon">
        {icon}
      </div>
    </motion.div>
  );
};

export default StatCard;