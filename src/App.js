import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/Landing-Page";
import Buyer from "./components/Buyer-Registration";
import Seller from "./components/Seller-Registration";
import BuyerDashboard from "./components/Buyer-Dashboard";
import SellerDashboard from "./components/Seller-Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<LandingPage/>} />
        <Route path="/buyer" element= {<Buyer />} />
        <Route path="/seller" element= {<Seller />} />
        <Route path="/buyer-dashboard" element= {<BuyerDashboard />} />
        <Route path="/seller-dashboard" element= {<SellerDashboard />} />
      </Routes>
    </Router>
  );
};

export default App;
