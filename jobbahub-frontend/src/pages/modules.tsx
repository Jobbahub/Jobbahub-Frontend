import React from 'react';
import { mockModules } from '../data/modulesData';

const ElectiveModules: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-primary mb-6">Beschikbare Keuzemodules</h1>
      <p className="text-gray-600 mb-8">
        Kies uit een breed aanbod van modules om je skills te verbeteren.
      </p>

      {/* Grid Layout voor de kaarten */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockModules.map((module) => (
          <div key={module._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100 flex flex-col">
            
            {/* Afbeelding */}
            {module.image && (
              <img 
                src={module.image} 
                alt={module.name} 
                className="w-full h-48 object-cover"
              />
            )}
            
            <div className="p-5 flex flex-col flex-grow">
              {/* Tags en Punten */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex flex-wrap gap-1">
                  {module.tags.map(tag => (
                    <span key={tag.id} className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">
                      {tag.name}
                    </span>
                  ))}
                </div>
                <span className="text-primary font-bold text-sm whitespace-nowrap ml-2">
                  {module.studycredit} EC
                </span>
              </div>

              {/* Titel en Beschrijving */}
              <h3 className="text-xl font-bold text-gray-800 mb-2">{module.name}</h3>
              
              <div className="text-sm text-gray-500 mb-2 italic">
                {module.location && <span>📍 {module.location}</span>}
                {module.location && module.level && <span> • </span>}
                {module.level && <span>📶 {module.level}</span>}
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                {module.shortdescription || module.description}
              </p>

              {/* Knop */}
              <button className="w-full bg-secondary text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors mt-auto">
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