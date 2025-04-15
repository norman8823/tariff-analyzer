// src/pages/AnalysisDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';

const AnalysisDetail = () => {
  const { id } = useParams();
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analysis Detail</h1>
      <p>Details for analysis ID: {id}</p>
    </div>
  );
};

export default AnalysisDetail;