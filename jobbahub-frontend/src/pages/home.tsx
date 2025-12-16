import React from 'react';

const Home: React.FC = () => {
  return (
    <div style={{ 
      margin: '0 -20px', // Negative margin to break out of container padding
      padding: '0'
    }}>
      {/* Hero Section with HOME PAGE title - Box for future image */}
      <div style={{
        background: 'white',
        padding: '80px 40px',
        marginBottom: '0',
        textAlign: 'center',
        minHeight: '350px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 'bold',
          letterSpacing: '2px'
        }}>
          HOME PAGE
        </h1>
      </div>

      {/* Subtitle */}
      <div style={{
        textAlign: 'center',
        margin: '40px 0',
        padding: '0 20px'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          color: '#6b7280',
          fontWeight: 'normal'
        }}>
          A Subtitle
        </h2>
      </div>

      {/* Main Content Area */}
      <div style={{
        background: 'white',
        padding: '40px',
        margin: '0 20px 30px 20px' // Add back the side margins only for content
      }}>
        <p style={{ marginBottom: '20px', lineHeight: '1.8' }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
        </p>
        <p style={{ marginBottom: '20px', lineHeight: '1.8' }}>
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
        </p>
        <p style={{ marginBottom: '20px', lineHeight: '1.8' }}>
          At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
        </p>
        <p style={{ lineHeight: '1.8' }}>
          Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
        </p>
      </div>
    </div>
  );
};

export default Home;