import React from 'react';
import { ChaosSimulator } from '../components/ChaosSimulator';

export const ChaosSimulatorPage: React.FC = () => {
  return (
    <div className="p-4 sm:p-8 space-y-6">
      <ChaosSimulator onLogMessage={(msg) => console.log(msg)} />
    </div>
  );
};

export default ChaosSimulatorPage;
