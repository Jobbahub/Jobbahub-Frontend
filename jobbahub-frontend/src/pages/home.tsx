import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div className="bg-white p-8 rounded shadow-sm">
      <h1 className="text-3xl font-bold text-primary mb-4">Welkom bij Jobbahub</h1>
      <p className="mb-4 text-gray-700">
        Dit is de homepagina.
      </p>
      <Link 
        to="/login" 
        className="bg-primary text-white px-6 py-2 rounded hover:bg-opacity-90 transition inline-block"
      >
        Naar Login
      </Link>
    </div>
  );
};

export default Home;