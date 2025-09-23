import React, { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import type { CampaignFormData } from '../../pages/annonceur/CreerCampagne';

interface Props {
  formData: CampaignFormData;
  setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
}

const distributorsList = [
  { id: '1', name: 'Monastir'},
  { id: '2', name: 'Tunis'},
  { id: '3', name: 'Sousse'},
  { id: '4', name: 'Nabeul'},
  { id: '5', name: 'Sfax'},
];

const staticMapData = {
  map_url: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3388599.574374932!2d6.920652742287174!3d33.96223142621844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x125595448316a4e1%3A0x3a84333aaa019bef!2sTunisie!5e0!3m2!1sfr!2stn!4v1756818597407!5m2!1sfr!2stn',
  places: [
    { name: 'Boulangerie Utopie', address: '20 Rue Jean-Pierre Timbaud, 75011 Paris, France' },
    { name: 'Boulangerie Du Pain et Des Idées', address: '34 Rue Yves Toudic, 75010 Paris, France' },
    { name: 'Pink Mamma', address: '20bis Rue de Douai, 75009 Paris, France' },
    { name: 'Restaurant PURETÉ', address: '79 Rue de la Monnaie, 59800 Lille, France' },
    { name: 'Table N9uf', address: '9 Pl. du Concert, 59800 Lille, France' },
  ],
};

const Step3Distributeurs = ({ formData, setFormData }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDistributors, setFilteredDistributors] = useState(distributorsList);
  const [mapUrl, setMapUrl] = useState('');

  useEffect(() => {
    // Use static data here to simulate an API call
    setMapUrl(staticMapData.map_url);
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = distributorsList.filter(dist =>
      dist.name.toLowerCase().includes(term)
    );

    setFilteredDistributors(filtered);
  };

  const handleSelectDistributor = (id: string) => {
    const isSelected = formData.distributeurs.includes(id);
    const newDistributors = isSelected
      ? formData.distributeurs.filter((distId: string) => distId !== id)
      : [...formData.distributeurs, id];
    setFormData({ ...formData, distributeurs: newDistributors });
  };

  return (
    <div className="form-step">
      <h2 className="section-title">Select Your Distributors</h2>
      <div className="distributors-container">
        <div className="distributors-list-panel">
          <div className="search-bar">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search for a distributor..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <ul className="distributors-list">
            {filteredDistributors.map(dist => (
              <li
                key={dist.id}
                className={`distributor-item ${formData.distributeurs.includes(dist.id) ? 'selected' : ''}`}
                onClick={() => handleSelectDistributor(dist.id)}
              >
                <strong>{dist.name}</strong> 
              </li>
            ))}
          </ul>
        </div>
        <div className="distributors-map">
          {mapUrl ? (
             <iframe title="Distribution Map" src={mapUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" ></iframe>
          ) : (
            <p>Loading map...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Step3Distributeurs;
// import React, { useState, useEffect, useRef } from 'react';
// import { FaSearch } from 'react-icons/fa';
// import { Map, Marker, Popup } from '@maptiler/sdk';
// import '@maptiler/sdk/dist/maptiler-sdk.css';
// import '../../styles/layouts/Step3Distributors.css';
// import type { CampaignFormData } from '../../pages/annonceur/CreerCampagne';

// interface Props {
//   formData: CampaignFormData;
//   setFormData: React.Dispatch<React.SetStateAction<CampaignFormData>>;
// }

// const distributorsList = [
//   { id: '1', name: 'Monastir', coordinates: [35.7833, 10.8333] },
//   { id: '2', name: 'Tunis', coordinates: [36.8065, 10.1815] },
//   { id: '3', name: 'Sousse', coordinates: [35.8256, 10.6412] },
//   { id: '4', name: 'Nabeul', coordinates: [36.4561, 10.7376] },
//   { id: '5', name: 'Sfax', coordinates: [34.7406, 10.7603] },
// ];

// const Step3Distributors = ({ formData, setFormData }: Props) => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filteredDistributors, setFilteredDistributors] = useState(distributorsList);
//   const [mapError, setMapError] = useState<string | null>(null);
//   const mapContainer = useRef<HTMLDivElement>(null);
//   const map = useRef<Map | null>(null);
//   const markers = useRef<{ [key: string]: Marker }>({});

//   useEffect(() => {
//     if (!mapContainer.current) {
//       setMapError('Map container not found');
//       return;
//     }

//     try {
//       map.current = new Map({
//         container: mapContainer.current,
//         apiKey: '7Kgw7CIEk3qX7KLqJYiR', // Replace with your API key
//         center: [10.1815, 36.8065], // Center on Tunis
//         zoom: 7,
//         style: 'streets-v2',
//       });

//       map.current.on('load', () => {
//         distributorsList.forEach((dist) => {
//           const isSelected = formData.distributeurs.includes(dist.id);
//           const marker = new Marker({ color: isSelected ? '#00FF00' : '#FF5733' })
//             .setLngLat([dist.coordinates[1], dist.coordinates[0]])
//             .setPopup(
//               new Popup({ offset: 25, closeButton: false }).setHTML(
//                 `<div style="font-family: Arial; padding: 5px; text-align: center;">
//                    <strong>${dist.name}</strong>
//                    <p style="margin: 2px 0;">${isSelected ? 'Selected' : 'Click to select'}</p>
//                  </div>`
//               )
//             )
//             .addTo(map.current!);

//           marker.getElement().addEventListener('click', () => {
//             handleSelectDistributor(dist.id);
//           });

//           markers.current[dist.id] = marker;
//         });
//       });

//       map.current.on('error', (e) => {
//         setMapError(`Map failed to load: ${e.error.message}`);
//       });
//     } catch (error) {
//       setMapError(`Failed to initialize map: ${error}`);
//     }

//     return () => {
//       if (map.current) {
//         map.current.remove();
//         map.current = null;
//       }
//     };
//   }, []);

//   // Update marker colors when distributors change
//   useEffect(() => {
//     if (!map.current) return;

//     Object.keys(markers.current).forEach((id) => {
//       const oldMarker = markers.current[id];
//       const isSelected = formData.distributeurs.includes(id);
//       const dist = distributorsList.find((d) => d.id === id);

//       if (dist) {
//         oldMarker.remove();
//         const newMarker = new Marker({ color: isSelected ? '#00FF00' : '#FF5733' })
//           .setLngLat([dist.coordinates[1], dist.coordinates[0]])
//           .setPopup(
//             new Popup({ offset: 25, closeButton: false }).setHTML(
//               `<div style="font-family: Arial; padding: 5px; text-align: center;">
//                  <strong>${dist.name}</strong>
//                  <p style="margin: 2px 0;">${isSelected ? 'Selected' : 'Click to select'}</p>
//                </div>`
//             )
//           )
//           .addTo(map.current!);

//         newMarker.getElement().addEventListener('click', () => {
//           handleSelectDistributor(dist.id);
//         });

//         markers.current[id] = newMarker;
//       }
//     });
//   }, [formData.distributeurs]);

//   const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const term = e.target.value.toLowerCase();
//     setSearchTerm(term);
//     const filtered = distributorsList.filter((dist) =>
//       dist.name.toLowerCase().includes(term)
//     );
//     setFilteredDistributors(filtered);
//   };

//   const handleSelectDistributor = (id: string) => {
//     const isSelected = formData.distributeurs.includes(id);
//     const newDistributors = isSelected
//       ? formData.distributeurs.filter((distId: string) => distId !== id)
//       : [...formData.distributeurs, id];
//     setFormData({ ...formData, distributeurs: newDistributors });

//     const dist = distributorsList.find((d) => d.id === id);
//     if (dist && map.current && !isSelected) {
//       map.current.flyTo({
//         center: [dist.coordinates[1], dist.coordinates[0]],
//         zoom: 10,
//         duration: 1000,
//       });
//     }
//   };

//   return (
//     <div className="form-step">
//       <h2 className="section-title">Select Your Distributors</h2>
//       {mapError && <p style={{ color: 'red', textAlign: 'center' }}>{mapError}</p>}
//       <div className="distributors-container">
//         <div className="distributors-list-panel">
//           <div className="search-bar">
//             <FaSearch className="search-icon" />
//             <input
//               type="text"
//               placeholder="Search for a distributor..."
//               value={searchTerm}
//               onChange={handleSearch}
//               className="search-input"
//             />
//           </div>
//           <ul className="distributors-list">
//             {filteredDistributors.map((dist) => (
//               <li
//                 key={dist.id}
//                 className={`distributor-item ${formData.distributeurs.includes(dist.id) ? 'selected' : ''}`}
//                 onClick={() => handleSelectDistributor(dist.id)}
//               >
//                 <strong>{dist.name}</strong>
//               </li>
//             ))}
//           </ul>
//         </div>
//         <div className="distributors-map">
//           <div ref={mapContainer} className="map-container" />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Step3Distributors;
