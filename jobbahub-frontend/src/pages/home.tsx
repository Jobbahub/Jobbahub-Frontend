import React from 'react';
import { Link } from 'react-router-dom';

const Home: React.FC = () => {
  return (
    <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: 'var(--shadow)' }}>
      <h1 style={{ color: 'var(--primary-color)', marginBottom: '20px' }}>Welkom bij Jobbahub</h1>
      <p style={{ marginBottom: '30px' }}>
        Dit is de homepagina. We gebruiken nu standaard CSS in plaats van Tailwind!
      </p>
      <Link to="/login" className="btn btn-primary">
        Naar Login
      </Link>
    </div>
  );
};

export default Home;