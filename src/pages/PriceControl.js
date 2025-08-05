import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import styles from './Styles/PriceControl.module.css';
import api from '../Services/Api'; // assuming Axios instance

const PriceControl = () => {
  const [pricing, setPricing] = useState({
    TE: 0,
    deliveryFee: 0,
    margin: 0,
    weightRateTrain: 0,
    weightRateAirplane: 0,
    distanceRateTrain: 0,
    distanceRateAirplane: 0,
    baseFareTrain: 0,
    baseFareAirplane: 0,
  });
  const [modalInputs, setModalInputs] = useState({ ...pricing });
  const [status, setStatus] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch pricing data on mount
  useEffect(() => {
    const fetchPricing = async () => {
      try {
        const response = await api.get('/admin/getFareDetails', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
  
        const config = response.data;
        
        const newPricing = {
          TE: config.TE || 112,
          deliveryFee: config.deliveryFee || 0,
          margin: config.margin || 0.2,
          weightRateTrain: config.weightRateTrain || 100,
          weightRateAirplane: config.weightRateAirplane || 200,
          distanceRateTrain: config.distanceRateTrain || 0,
          distanceRateAirplane: config.distanceRateAirplane || 0.2,
          baseFareTrain: config.baseFareTrain || 0,
          baseFareAirplane: config.baseFareAirplane || 0,
        };
        
        setPricing(newPricing);
        setModalInputs(newPricing);

      } catch (error) {
        console.error('Failed to fetch pricing:', error);
      }
    };
  
    fetchPricing();
  }, []);

  // Handle input changes in modal
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (value >= 0) {
      setModalInputs(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Submit updated pricing
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      TE: parseFloat(modalInputs.TE),
      deliveryFee: parseFloat(modalInputs.deliveryFee),
      margin: parseFloat(modalInputs.margin),
      weightRateTrain: parseFloat(modalInputs.weightRateTrain),
      weightRateAirplane: parseFloat(modalInputs.weightRateAirplane),
      distanceRateTrain: parseFloat(modalInputs.distanceRateTrain),
      distanceRateAirplane: parseFloat(modalInputs.distanceRateAirplane),
      baseFareTrain: parseFloat(modalInputs.baseFareTrain),
      baseFareAirplane: parseFloat(modalInputs.baseFareAirplane),
    };
  
    try {
      const res = await api.put('/admin/updateFareDetails', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
  
      if (res.data?.success) {
        setPricing(modalInputs);
        setStatus('Pricing updated successfully!');
        setIsModalOpen(false);
      } else {
        setStatus('Update failed. Please try again.');
      }
  
    } catch (error) {
      console.error('Error updating pricing:', error);
      setStatus('Error updating pricing.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalInputs(pricing);
  };

  // Helper function to format field names for display
  const formatFieldName = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('T E', 'TE')
      .replace('Delivery Fee', 'Delivery Fee')
      .replace('Weight Rate Train', 'Weight Rate (Train)')
      .replace('Weight Rate Airplane', 'Weight Rate (Airplane)')
      .replace('Distance Rate Train', 'Distance Rate (Train)')
      .replace('Distance Rate Airplane', 'Distance Rate (Airplane)')
      .replace('Base Fare Train', 'Base Fare (Train)')
      .replace('Base Fare Airplane', 'Base Fare (Airplane)');
  };

  return (
    <div className={styles.adminWrapper}>
      <Sidebar />
      <main className={styles.mainContent}>
        <header className={styles.headerBody}>
          <h1 className={styles.header}>Fare Configuration</h1>
        </header>

        <section className={styles.pricingSection}>
          <div className={styles.pricingGrid}>
            {Object.entries(pricing).map(([key, value]) => (
              <div key={key} className={styles.pricingItem}>
                <span className={styles.pricingLabel}>{formatFieldName(key)}</span>
                <span className={styles.pricingValue}>
                  {key === 'margin' ? `${(parseFloat(value) * 100).toFixed(1)}%` : parseFloat(value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <button className={styles.editButton} onClick={() => setIsModalOpen(true)}>Edit Pricing</button>
        </section>

        {isModalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <header className={styles.modalHeader}>
                <h2>Edit Pricing</h2>
                <button className={styles.closeButton} onClick={handleCloseModal}>×</button>
              </header>
              <form onSubmit={handleSubmit} className={styles.formGrid}>
                {Object.entries(modalInputs).map(([key, value]) => (
                  <div key={key} className={styles.formGroup}>
                    <label htmlFor={key}>{formatFieldName(key)}</label>
                    <input
                      type="number"
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      min="0"
                      step={key === 'margin' ? "0.01" : "0.01"}
                      required
                    />
                    {key === 'margin' && <small>Enter as decimal (e.g., 0.2 for 20%)</small>}
                  </div>
                ))}
                <button type="submit">Update Pricing</button>
                {status && <p className={styles.statusMsg}>{status}</p>}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PriceControl;
