  import React from 'react';
  import { motion } from 'framer-motion';
  import { FaTimes } from 'react-icons/fa';
  import '../../styles/components/Modal.css';

  interface Props {
    imageUrl: string;
    onClose: () => void;
  }

  const VisualViewerModal = ({ imageUrl, onClose }: Props) => {
    return (
      <motion.div
        className="visual-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // Ferme en cliquant en dehors de l'image
      >
        <motion.div
          className="visual-modal-container"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: "tween" }}
          onClick={(e) => e.stopPropagation()} // Empêche la fermeture au clic sur l'image
        >
          <button className="modal-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
          <img src={imageUrl} alt="Visuel de la campagne" className="visual-modal-image" />
        </motion.div>
      </motion.div>
    );
  };

  export default VisualViewerModal;