import React from 'react';
import type { CampaignFormData } from '../../pages/annonceur/CreerCampagne';

interface Props {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const distributorsList = [ 
  { id: '1', name: 'Monastir' },
  { id: '2', name: 'Tunis' },
  { id: '3', name: 'Sousse' },
  { id: '4', name: 'Nabeul' },
  { id: '5', name: 'Sfax' },
];

const Step4Resume = ({ formData, setFormData }: Props) => {
  const getDistributorNames = (ids: string[]) => {
    return ids
      .map(id => {
        const dist = distributorsList.find(d => d.id === id);
        return dist ? dist.name : 'Unknown';
      })
      .join(', ');
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, conditionsAcceptees: e.target.checked });
  };

  return (
    <div className="form-step">
      <h2 className="section-title">Campaign Summary</h2>
      <div className="summary-box">
        <p><strong>Campaign Name:</strong> {formData.nomCampagne}</p>
        <p><strong>Description:</strong> {formData.description || 'Not provided'}</p>
        <p><strong>Start Date:</strong> {formData.dateDebut}</p>
        <p><strong>Designer Required:</strong> {formData.besoinDesigner ? 'Yes' : 'No'}</p>
        
        <p><strong>Visual:</strong> {formData.visuel ? formData.visuel.name : 'Not selected'}</p>
        <p><strong>Support Name:</strong> {formData.nomSupport}</p>
       <p>
            <strong>Unit Price:</strong>{' '}
            {formData.prixUnitaireSupport.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}
          </p>
          <p><strong>Number of Supports:</strong> {formData.nombreSupports}</p>
          <p>
            <strong>Calculated Total Price:</strong>{' '}
{formData.prixTotal.toLocaleString('fr-FR', { minimumFractionDigits: 3 })} TND
          </p>

        
        <p>
          <strong>Selected Distributors:</strong>{' '}
          {formData.distributeurs.length > 0
            ? getDistributorNames(formData.distributeurs)
            : 'No distributors selected'}
        </p>
      </div>

      <div className="terms-checkbox">
        <input 
          type="checkbox" 
          id="terms" 
          checked={formData.conditionsAcceptees} 
          onChange={handleCheckboxChange} 
          required 
        />
        <label htmlFor="terms">I accept the terms and conditions</label>
      </div>
    </div>
  );
};

export default Step4Resume;
