import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      <h1>Welcome to the Land Marketplace</h1>
      <p>Please select your role:</p>
      <div>
        <Link to="/buyer"><button>Buyer</button></Link>
        <Link to="/seller"><button>Seller</button></Link>
      </div>
    </div>
  );
};

export default LandingPage;