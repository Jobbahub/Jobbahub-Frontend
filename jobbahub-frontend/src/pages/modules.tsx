import React from 'react';
import { mockModules } from '../data/modulesData';

const ElectiveModules: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>Beschikbare Keuzemodules</h1>
      <p style={{ marginBottom: '2rem', color: 'var(--text-muted)' }}>
        Kies uit een breed aanbod van modules om je skills te verbeteren.
      </p>

      <div className="grid-container">
        {mockModules.map((module) => (
          <div key={module._id} className="card">
            
            {module.image && (
              <img 
                src={module.image} 
                alt={module.name} 
                className="card-image"
              />
            )}
            
            <div className="card-body">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div className="badge-container">
                  {module.tags.map(tag => (
                    <span key={tag.id} className="badge">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <span className="credits">
                  {module.studycredit} EC
                </span>
              </div>

              <h3 className="card-title">{module.name}</h3>
              
              <p className="card-text">
                {module.shortdescription || module.description}
              </p>

              <button className="btn btn-secondary" style={{ width: '100%' }}>
                Bekijk Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ElectiveModules;