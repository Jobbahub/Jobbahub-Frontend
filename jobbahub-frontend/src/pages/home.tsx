import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded shadow-sm">
      <h1 className="text-3xl font-bold text-primary mb-4">Welkom bij Jobbahub</h1>
      <p className="mb-4 text-gray-700">
        Dit is homepagina.
      </p>
    </div>
  );
};

export default Home;