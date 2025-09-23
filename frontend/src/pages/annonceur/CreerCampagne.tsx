import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/pages/CreerCampagne.css';
import Step1Informations from '../../components/CreerCampagne/Step1Informations';
import Step2Visuel from '../../components/CreerCampagne/Step2Visuel';
import Step3Distributeurs from '../../components/CreerCampagne/Step3Distributeurs';
import Step4Resume from '../../components/CreerCampagne/Step4Resume';

export interface CampaignFormData {
  nomCampagne: string;
  description: string;
  dateDebut: string;
  besoinDesigner: boolean;
  visuel: File | null;
  nomSupport: string;
  prixUnitaireSupport: number;
  nombreSupports: number;
  prixTotal: number;
  distributeurs: string[];
  conditionsAcceptees: boolean;
}

const steps = [
  'Information',
  'Visual & Supports',
  'Distributors',
  'Summary',
];

const CreerCampagne = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<CampaignFormData>({
    nomCampagne: '',
    description: '',
    dateDebut: '',
    besoinDesigner: false,
    visuel: null,
    nomSupport: '',
    prixUnitaireSupport: 0,
    nombreSupports: 0,
    prixTotal: 0,
    distributeurs: [],
    conditionsAcceptees: false,
  });
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNext = () => {
    setErrorMessage(null);
    if (currentStep === 0) {
      if (!formData.nomCampagne || !formData.dateDebut) {
        setErrorMessage('Please fill in the campaign name and start date.');
        return;
      }
    } else if (currentStep === 1) {
      if (!formData.visuel && !formData.besoinDesigner) {
        setErrorMessage('Please select a visual for the campaign or check "Need a designer".');
        return;
      }
      if (!formData.nomSupport || formData.prixUnitaireSupport <= 0 || formData.nombreSupports <= 0) {
        setErrorMessage('Please fill in the support name, unit price, and number of supports.');
        return;
      }
    } else if (currentStep === 2) {
      if (formData.distributeurs.length === 0) {
        setErrorMessage('Please select at least one distributor.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setErrorMessage(null);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrorMessage(null);
  if (!formData.conditionsAcceptees) {
    setErrorMessage('Please accept the terms and conditions.');
    setSubmissionStatus('error');
    return;
  }

  console.log('Distributeurs before submission:', formData.distributeurs); // Add this
  const data = new FormData();
  data.append('nomCampagne', formData.nomCampagne);
  data.append('description', formData.description);
  data.append('dateDebut', formData.dateDebut);
  data.append('needDesigner', String(formData.besoinDesigner));
  data.append('supportName', formData.nomSupport);
  data.append('supportUnitPrice', String(formData.prixUnitaireSupport));
  data.append('numberOfSupports', String(formData.nombreSupports));
  data.append('totalPrice', String(formData.prixTotal));
  data.append('distributeurs', JSON.stringify(formData.distributeurs));
  data.append('conditionsAcceptees', String(formData.conditionsAcceptees));

  if (formData.visuel) {
    console.log('File to upload:', formData.visuel.name, formData.visuel.size, formData.visuel.type);
    data.append('visuel', formData.visuel);
  }

  const token = localStorage.getItem('token');
  if (!token) {
    setErrorMessage('Authentication required. Please log in again.');
    setSubmissionStatus('error');
    navigate('/login/annonceur');
    return;
  }

  try {
    const response = await axios.post('http://localhost:4242/api/annonceur/creer-campagne', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    console.log('Campaign submitted successfully:', response.data);
    setSubmissionStatus('success');
  } catch (error) {
    console.error('Submission error:', error);
    if (axios.isAxiosError(error) && error.response) {
      setErrorMessage(error.response.data.message || 'Failed to create campaign.');
    } else {
      setErrorMessage('An unexpected error occurred. Please try again.');
    }
    setSubmissionStatus('error');
  }
};

  const handleGoToDashboard = () => {
    navigate('/annonceur/dashboard'); // matches routing in App.tsx
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <Step1Informations formData={formData} setFormData={setFormData} />;
      case 1:
        return <Step2Visuel formData={formData} setFormData={setFormData} />;
      case 2:
        return <Step3Distributeurs formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step4Resume formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="creer-campagne-container">
      {submissionStatus === 'success' ? (
        <div className="success-message">
          <h2 className="success-title">🎉 Campaign created successfully!</h2>
          <p className="success-text">Your campaign has been submitted for approval. You can view it on your dashboard.</p>
          <button onClick={handleGoToDashboard} className="nav-button">
            Go to Dashboard
          </button>
        </div>
      ) : (
        <>
          <h1 className="creer-campagne-title">Create a New Advertising Campaign</h1>
          <div className="progress-bar-container">
            {steps.map((step, index) => (
              <div key={step} className={`progress-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}>
                <span className="step-number">{index + 1}</span>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="form-content"
            >
              {errorMessage && <div className="error-message">{errorMessage}</div>}
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>

          <div className="navigation-buttons">
            <button onClick={handlePrev} disabled={currentStep === 0} className="nav-button prev">
              Previous
            </button>
            {currentStep < steps.length - 1 ? (
              <button onClick={handleNext} className="nav-button next">
                Next
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} className="nav-button submit">
                Confirm and Submit
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CreerCampagne;
