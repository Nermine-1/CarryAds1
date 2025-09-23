import React from 'react';
import type { CampaignFormData } from '../../pages/annonceur/CreerCampagne';

interface Props {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const Step1Informations = ({ formData, setFormData }: Props) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement; // Type assertion
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  return (
    <div className="form-step">
      <h2 className="section-title">General Information</h2>

      <div className="form-group">
        <label htmlFor="nomCampagne" className="form-label">Campaign Name</label>
        <input 
          type="text" 
          id="nomCampagne" 
          name="nomCampagne" 
          value={formData.nomCampagne} 
          onChange={handleChange} 
          className="form-input" 
          required 
        />
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">Description</label>
        <textarea 
          id="description" 
          name="description" 
          value={formData.description} 
          onChange={handleChange} 
          className="form-textarea" 
          rows={4} 
        />
      </div>
      
      {/* "Need a designer" field */}
      <div className="form-group">
        <label className="form-label">Need a designer?</label>
        <div className="radio-group">
          <label htmlFor="needDesignerYes">
            <input 
              type="radio" 
              id="needDesignerYes" 
              name="needDesigner" 
              checked={formData.besoinDesigner === true} 
              onChange={() => setFormData(prev => ({ ...prev, needDesigner: true }))} 
            />
            Yes
          </label>
          <label htmlFor="needDesignerNo">
            <input 
              type="radio" 
              id="needDesignerNo" 
              name="needDesigner" 
              checked={formData.besoinDesigner === false} 
              onChange={() => setFormData(prev => ({ ...prev, needDesigner: false }))} 
            />
            No
          </label>
        </div>
      </div>

      <div className="form-group-row">
        <div className="form-group">
          <label htmlFor="dateDebut" className="form-label">Start Date</label>
          <input 
            type="date" 
            id="dateDebut" 
            name="dateDebut" 
            value={formData.dateDebut} 
            onChange={handleChange} 
            className="form-input" 
            required 
          />
        </div>
      </div>
    </div>
  );
};

export default Step1Informations;
