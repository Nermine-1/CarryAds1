import React from 'react';
import { motion } from 'framer-motion';

interface VisualViewerModalProps {
    imageUrl: string;
    onClose: () => void;
}

const overlayAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
};

const modalAnimation = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

const VisualViewerModal: React.FC<VisualViewerModalProps> = ({ imageUrl, onClose }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = 'https://via.placeholder.com/800x600.png?text=Visuel+non+disponible';
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70"
            variants={overlayAnimation}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
        >
            <motion.div
                className="bg-white rounded-xl shadow-2xl p-4 w-full max-w-3xl transform transition-all"
                variants={modalAnimation}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end mb-4">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                        aria-label="Close modal"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="max-h-[80vh] overflow-auto rounded-lg">
                    <img
                        src={imageUrl}
                        alt="Visual de la campagne"
                        className="w-full h-auto rounded-lg"
                        onError={handleImageError}
                    />
                </div>
            </motion.div>
        </motion.div>
    );
};

export default VisualViewerModal;
