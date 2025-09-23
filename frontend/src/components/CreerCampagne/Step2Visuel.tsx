import React, { useState, useEffect } from 'react';
import type { CampaignFormData } from '../../pages/annonceur/CreerCampagne';
import '../../styles/components/step2Visuel.css';

interface Props {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const Step2Visuel = ({ formData, setFormData }: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (formData.visuel) {
      const url = URL.createObjectURL(formData.visuel);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [formData.visuel]);

  useEffect(() => {
    const unitPrice = formData.prixUnitaireSupport || 0;
    const numSupports = formData.nombreSupports || 0;
    const calculatedTotalPrice = unitPrice * numSupports;
    setFormData(prev => ({ ...prev, prixTotal: calculatedTotalPrice }));
  }, [formData.prixUnitaireSupport, formData.nombreSupports, setFormData]);

  const handleFileChange = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      alert('The file is too large (max 5 MB).');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image (JPEG, PNG, etc.).');
      return;
    }
    setFormData({ ...formData, visuel: file });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileChange(file);
    } else {
      alert('Please drop a valid image (JPEG, PNG, etc.).');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="form-step">
      <h2 className="section-title">Advertising Visual and Supports</h2>

      {!formData.besoinDesigner && (
        <div
          className={`drag-drop-area ${isDragging ? 'dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p>Drag and drop your visual here, or click to select it (max 5 MB, JPEG/PNG).</p>
          <input
            type="file"
            onChange={handleFileSelect}
            className="file-input"
            accept="image/*"
          />
        </div>
      )}

      {previewUrl && (
        <div className="preview-container">
          <h3 className="preview-title">Visual Preview</h3>
          <img
            src={previewUrl}
            alt="Visual Preview"
            className="visuel-preview-image small-preview"
            style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
          />
          <p className="image-specs">Selected file: {formData.visuel?.name}</p>
        </div>
      )}

      <div className="support-info-section">
        <h3 className="section-subtitle">Advertising Support Information</h3>
        <div className="form-group">
          <label htmlFor="nomSupport" className="form-label">Support Name</label>
          <input
            type="text"
            id="nomSupport"
            name="nomSupport"
            value={formData.nomSupport}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>
        <div className="form-group-row">
          <div className="form-group">
            <label htmlFor="prixUnitaireSupport" className="form-label">Unit Price (DT)</label>
            <input
              type="number"
              id="prixUnitaireSupport"
              name="prixUnitaireSupport"
              value={formData.prixUnitaireSupport === 0 ? '' : formData.prixUnitaireSupport}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="nombreSupports" className="form-label">Number of Supports</label>
            <input
              type="number"
              id="nombreSupports"
              name="nombreSupports"
              value={formData.nombreSupports === 0 ? '' : formData.nombreSupports}
              onChange={handleInputChange}
              className="form-input"
              min="0"
              required
            />
          </div>
        </div>
        <div className="form-group total-price">
          <label className="form-label">Calculated Total Price</label>
          <p className="calculated-price">
            {formData.prixTotal.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Step2Visuel;
