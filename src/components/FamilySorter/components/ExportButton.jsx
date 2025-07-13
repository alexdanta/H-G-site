import React from 'react';
import styles from '../FamilySorter.module.css';

const ExportButton = ({ onExport }) => {
  return (
    <button 
      className={styles.exportBtn}
      onClick={onExport}
      title="Export results to CSV"
    >
      📊 Export Results
    </button>
  );
};

export default ExportButton;