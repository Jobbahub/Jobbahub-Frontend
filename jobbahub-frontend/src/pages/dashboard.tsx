import React from 'react';
import { useAuth } from '../context/authContext';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-white rounded shadow-sm border-l-4 border-primary">
      <h2 className="text-2xl font-bold mb-2">Persoonlijk Dashboard</h2>
      <p className="text-gray-800">
        Welkom terug, <span className="font-semibold">{user?.name}</span>!
      </p>
      <p className="mt-2 text-gray-600">
        Dit is een beveiligde pagina die alleen zichtbaar is voor ingelogde gebruikers.
      </p>
    </div>
  );
};

export default Dashboard;