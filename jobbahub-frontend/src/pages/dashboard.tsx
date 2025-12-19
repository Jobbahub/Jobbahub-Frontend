import React from 'react';
import { useAuth } from '../context/authContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="page-wrapper">
      {/* Hero Section */}
      <div className="page-hero">
        <h1 className="page-hero-title">Persoonlijk Dashboard</h1>
      </div>

      {/* Main Content */}
      <div className="container" style={{ marginTop: '40px' }}>
        <div className="p-4 bg-white rounded shadow-sm border-l-4 border-primary">
          <p className="text-gray-800">
            Welkom terug, <span className="font-semibold">{user?.name}</span>!
          </p>
          <p className="mt-2 text-gray-600">
            Dit is een beveiligde pagina die alleen zichtbaar is voor ingelogde gebruikers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;