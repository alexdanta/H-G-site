import React from 'react';

const ExportButton = ({ onExport }) => {
    return (
        <button className="export-btn" onClick={onExport}>
            📊 Export Results
        </button>
    );
};

export default ExportButton;