import React from 'react';
import { useAuth } from '../context/authContext';

const Favorieten: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-4 bg-white rounded shadow-sm border-l-4 border-primary">
      <h2 className="text-2xl font-bold mb-2">Mijn Favorieten</h2>
      <p className="text-gray-800 mb-4">
        Welkom <span className="font-semibold">{user?.name}</span>!
      </p>
      <p className="mt-2 text-gray-600">
        Hier kun je al je favoriete modules bekijken en beheren.
      </p>
      
      {/* TODO: Add favorite modules list here */}
      <div className="mt-6 text-gray-500">
        <p>Je hebt nog geen favoriete modules toegevoegd.</p>
      </div>
    </div>
  );
};

export default Favorieten;