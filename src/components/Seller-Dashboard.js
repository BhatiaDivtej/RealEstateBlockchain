// src/components/BuyerRegistration.js

import React, { useState, useEffect } from "react";
import LandContract from "../artifacts/Land.json"; // Update with the correct path to your Truffle artifact
import getWeb3 from "../getWeb3"; // Assuming you have a utility function to provide web3
import { useNavigate } from "react-router-dom";

const SellerDashboard = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  // ... (Keep the rest of your state variables here)
  //   const [lands, setLands] = useState([]);
  //   const [requestedLands, setRequestedLands] = useState(new Set()); // Tracks IDs of requested lands
  const [buyersCount, setBuyersCount] = useState(0); // State to store the number of sellers
  //   const [ownedLands, setOwnedLands] = useState([]); // State to store the lands owned by the buyer
  const [sellerDetails, setSellerDetails] = useState(null);
  const [landAddress, setLandAddress] = useState(""); // New state for storing land address
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [country, setCountry] = useState("");
  const [landPrice, setLandPrice] = useState("");
  const [propertyPID, setPropertyPID] = useState("");
  //   const [ownedLands, setOwnedLands] = useState([]);
  const [landRequests, setLandRequests] = useState([]); // New state for storing land requests

  let navigate = useNavigate();

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        const web3Instance = await getWeb3(); // Your method to get the web3 instance
        const accounts = await web3Instance.eth.getAccounts();
        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = LandContract.networks[networkId];
        const contractInstance = new web3Instance.eth.Contract(
          LandContract.abi,
          deployedNetwork && deployedNetwork.address
        );

        setWeb3(web3Instance);
        setAccounts(accounts);
        setContract(contractInstance);
        console.log(accounts);
        console.log(contractInstance);

        const details = await contractInstance.methods
          .getSellerDetails(accounts[1])
          .call();
        console.log("Seller details:", details);
        setSellerDetails({
          name: details[0],
          age: details[1].toString(), // Convert BigNumber to string
          HKID: details[2],
        });

        // Fetch the number of sellers
        const buyerscount = await contractInstance.methods
          .getBuyersCount()
          .call();
        // console.log("Sellers count:", sellersCount);
        setBuyersCount(buyerscount);

        const landsCount = await contractInstance.methods
          .getLandsCount()
          .call();
        const _lands = [];
        for (let i = 1; i <= parseInt(landsCount); i++) {
          // Fetch details for each land
          let land = await contractInstance.methods.getLandDetails(i).call();
          // Check if the land has been requested
          let requested = await contractInstance.methods.isRequested(i).call();
          // Fetch the land owner's address
          let owner = await contractInstance.methods.getLandOwner(i).call();
          let approved = await contractInstance.methods.isApproved(i).call();

          // Combine the land details with its requested status and owner's address, and push to the _lands array
          _lands.push({
            id: land[0],
            landAddress: land[1],
            area: land[2],
            city: land[3],
            district: land[4],
            country: land[5],
            landPrice: land[6],
            propertyPID: land[7],
            owner: owner, // Add the land owner's address
            requested: requested,
            approved: approved,
          });
        }

        // Filter the lands owned by the buyer
        const ownedLands = _lands.filter((land) => land.owner === accounts[1]);
        setLandRequests(ownedLands);

        // Fetch the lands owned by the buyer
        // const owned = _lands.filter((land) => land.owner === accounts[1]);
        // setOwnedLands(owned);
        // const ownedLands = []; // Array to store lands owned by the seller
        // for (let i = 1; i <= parseInt(landsCount); i++) {
        //   const landOwner = await contractInstance.methods.getLandOwner(i).call();
        //   if (landOwner === accounts[1]) {
        //     // Check if the seller owns the land
        //     const land = await contractInstance.methods.getLandDetails(i).call();
        //     const requested = await contractInstance.methods.isRequested(i).call();
        //     const approved = await contractInstance.methods.isApproved(i).call();
        //     if (requested) {
        //       ownedLands.push({ ...land, requested, approved });
        //     }
        //   }
        // }

        // const landsCount = await contractInstance.methods
        //   .getLandsCount()
        //   .call();
        // const _lands = [];
        // for (let i = 1; i <= parseInt(landsCount); i++) {
        //   let land = await contractInstance.lands(i);
        //   let requested = await contractInstance.methods.isRequested(i).call(); // Call isRequested for each land
        //   _lands.push({ ...land, requested });
        //   if (requested) {
        //     setRequestedLands((prev) => new Set(prev.add(i))); // Add to local state if requested
        //   }
        //   _lands.push(land);
        // }
        // setLands(_lands);

        // // Fetch the lands owned by the buyer
        // const owned = _lands.filter((land) => land.id === accounts[0]);
        // setOwnedLands(owned);
      } catch (error) {
        alert(
          "Failed to load web3, accounts, or contract. Check console for details."
        );
        console.error(error);
      }
    };

    initWeb3();
  }, []);

  const handleAddLand = async (e) => {
    e.preventDefault();

    try {
      // Use the first account to register the buyer
      console.log(accounts[1]);
      await contract.methods
        .addLand(landAddress, area, city, district, country, landPrice, propertyPID)
        .send({ from: accounts[1], gas: "6721975" });

      console.log("Land added successfully");
      const landCount = await contract.methods.getLandsCount().call();
      console.log("Land count:", landCount);
    } catch (error) {
      console.error("Error registering seller:", error);
    }
  };

  // Method to approve land requests
  const approveLandRequest = async (landId) => {
    try {
      await contract.methods.approveRequest(landId).send({ from: accounts[1] });
      console.log("Land request approved successfully");
      // Update the local state to reflect the change
      //   setLandRequests(
      //     landRequests.map((land) =>
      //       land.id === landId ? { ...land, approved: true } : land
      //     )
      //   );
    } catch (error) {
      console.error("Error approving land request:", error);
    }
  };

  return (
    <div>
      <h2>Seller Dashboard</h2>
      <p>Welcome, {accounts[1]}</p>

      {sellerDetails && (
        <div>
          <h3>Your Details</h3>
          <p>Name: {sellerDetails.name}</p>
          <p>Age: {sellerDetails.age}</p>
          <p>HKID: {sellerDetails.HKID}</p>
        </div>
      )}

      <h3>Number of Buyers: {buyersCount}</h3>

      <h2>Add Land</h2>
      <form onSubmit={handleAddLand}>
        <div>
          <label>Address:</label>
          <input
            type="text"
            value={landAddress}
            onChange={(e) => setLandAddress(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Area:</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />
        </div>
        <div>
          <label>City:</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          />
        </div>
        <div>
          <label>District:</label>
          <input
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Country:</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Price:</label>
          <input
            type="number"
            value={landPrice}
            onChange={(e) => setLandPrice(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Property ID:</label>
          <input
            type="text"
            value={propertyPID}
            onChange={(e) => setPropertyPID(e.target.value)}
            required
          />
        </div>
        <button type="submit" onSubmit={handleAddLand}>
          Add Land
        </button>
      </form>

      <h3>Owned Lands</h3>
      <div>
        {landRequests.length === 0 ? (
          <p>You do not own any lands.</p>
        ) : (
          <ul>
            {landRequests.map((land, index) => (
              <li key={index}>
                <p>ID: {land.id}</p>
                <p>Address: {land.landAddress}</p>
                <p>Area: {land.area}</p>
                <p>City: {land.city}</p>
                <p>District: {land.district}</p>
                <p>Country: {land.country}</p>
                <p>Price: {land.landPrice}</p>
                <p>Property ID: {land.propertyPID}</p>
                <p>
                  Status:{" "}
                  {land.requested
                    ? land.approved
                      ? "Approved"
                      : "Pending Approval"
                    : "Not Requested"}
                </p>
                {land.requested ? (
                  !land.approved && (
                    <button onClick={() => approveLandRequest(land.id)}>
                      Approve Request
                    </button>
                  )
                ) : (
                  <button disabled>No Action Required</button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
