import React, { useState, useEffect } from 'react';
import Sidebar from '../Components/Sidebar';
import styles from './Styles/PriceControl.module.css';
import api from '../Services/Api'; // assuming Axios instance

const PriceControl = () => {
  const [pricing, setPricing] = useState({
    TE: 0,
    DeliveryFee: 0,
    Margin: 0,
    WeightRateTrain: 0,
    WeightRateAirplane: 0,
    DistanceRateAirplane: 0,
    DistanceRateTrainBase: 0,
    DistanceRateTrainMid: 0,
    DistanceRateTrainHigh: 0
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
        
        const newPricing = {TE: config.TE, DeliveryFee: config.deliveryFee, Margin: config.margin, WeightRateTrain: config.weightRateTrain, WeightRateAirplane: config.weightRateAirplane, DistanceRateAirplane: config.distanceRateAirplane, DistanceRateTrainBase: config.distanceRateTrain.base, DistanceRateTrainMid: config.distanceRateTrain.mid, DistanceRateTrainHigh: config.distanceRateTrain.high};
        
        setPricing(newPricing);

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
      setModalInputs({ ...modalInputs, [name]: value });
    }
  };

  // Submit updated pricing
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const payload = {
      TE: parseFloat(modalInputs.TE),
      deliveryFee: parseFloat(modalInputs.DeliveryFee),
      margin: parseFloat(modalInputs.Margin),
      weightRateTrain: parseFloat(modalInputs.WeightRateTrain),
      weightRateAirplane: parseFloat(modalInputs.WeightRateAirplane),
      distanceRateAirplane: parseFloat(modalInputs.DistanceRateAirplane),
      distanceRateTrain: {
        base: parseFloat(modalInputs.DistanceRateTrainBase),
        mid: parseFloat(modalInputs.DistanceRateTrainMid),
        high: parseFloat(modalInputs.DistanceRateTrainHigh)
      }
    };
  
    try {
      const res = await api.put('/admin/updateFareDetails', payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        }
      });
  
      if (res.data?.success) {
        setPricing(modalInputs); // reflect changes in the UI
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
                <span className={styles.pricingLabel}>{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className={styles.pricingValue}>₹ {parseFloat(value).toFixed(2)}</span>
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
                    <label htmlFor={key}>{key.replace(/([A-Z])/g, ' $1')}</label>
                    <input
                      type="number"
                      id={key}
                      name={key}
                      value={value}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                    />
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
