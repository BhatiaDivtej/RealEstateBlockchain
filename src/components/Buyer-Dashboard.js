// src/components/BuyerRegistration.js

import React, { useState, useEffect } from "react";
import LandContract from "../artifacts/Land.json"; // Update with the correct path to your Truffle artifact
import getWeb3 from "../getWeb3"; // Assuming you have a utility function to provide web3
import { useNavigate } from "react-router-dom";

const BuyerRegistration = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  // ... (Keep the rest of your state variables here)
  const [lands, setLands] = useState([]);
  //   const [requestedLands, setRequestedLands] = useState(new Set()); // Tracks IDs of requested lands
  const [sellersCount, setSellersCount] = useState(0); // State to store the number of sellers
  const [ownedLands, setOwnedLands] = useState([]); // State to store the lands owned by the buyer
  const [buyerDetails, setBuyerDetails] = useState(null);

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
          .getBuyerDetails(accounts[0])
          .call();
        console.log("Buyer details:", details);
        setBuyerDetails({
          name: details[0],
          city: details[1],
          email: details[2],
          age: details[3].toString(), // Convert BigNumber to string
          HKID: details[4],
        });

        // Fetch the number of sellers
        const sellersCount = await contractInstance.methods
          .getSellersCount()
          .call();
        // console.log("Sellers count:", sellersCount);
        setSellersCount(sellersCount);

        // const landsCount = await contractInstance.methods
        //   .getLandsCount()
        //   .call();
        // const _lands = [];
        // for (let i = 1; i <= parseInt(landsCount); i++) {
        //   let land = await contractInstance.methods.getLandDetails(i).call();
        //   let requested = await contractInstance.methods.isRequested(i).call(); // Call isRequested for each land
        //   _lands.push({ ...land, requested });
        //   if (requested) {
        //     setRequestedLands((prev) => new Set(prev.add(i))); // Add to local state if requested
        //   }
        //   _lands.push(land);
        // }
        // setLands(_lands);

        // Assuming contractInstance is an instance of your TruffleContract or web3 contract
        // const landsCount = await contractInstance.methods
        //   .getLandsCount()
        //   .call();
        // const _lands = [];
        // for (let i = 1; i <= parseInt(landsCount); i++) {
        //   // Fetch details for each land
        //   let land = await contractInstance.methods.getLandDetails(i).call();
        //   // Check if the land has been requested
        //   let requested = await contractInstance.methods.isRequested(i).call();

        //   // Combine the land details with its requested status and push to the _lands array
        //   _lands.push({
        //     id: land[0],
        //     area: land[1],
        //     city: land[2],
        //     state: land[3],
        //     landPrice: land[4],
        //     propertyPID: land[5],
        //     requested: requested,
        //   });

        //   // If the land has been requested, add it to the set of requested lands
        //   if (requested) {
        //     setRequestedLands((prev) => new Set(prev).add(land[0])); // Use land ID for the set
        //   }
        // }
        // // Update the state with the fetched land details
        // setLands(_lands);

        // uint id;
        //     string landAddress;
        //     string area;
        //     string city;
        //     string district;
        //     string country;
        //     uint landPrice;
        //     string propertyID;

        // Assuming contractInstance is an instance of your TruffleContract or web3 contract
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

          // If the land has been requested, add it to the set of requested lands
          //   if (requested) {
          //     setRequestedLands((prev) => new Set(prev).add(land[0])); // Use land ID for the set
          //   }
        }
        // Update the state with the fetched land details
        setLands(_lands);

        // Fetch the lands owned by the buyer
        const owned = _lands.filter((land) => land.owner === accounts[0]);
        setOwnedLands(owned);
      } catch (error) {
        alert(
          "Failed to load web3, accounts, or contract. Check console for details."
        );
        console.error(error);
      }
    };

    initWeb3();
  }, []);

  const handleRequestLand = async (sellerId, landId) => {
    try {
      await contract.methods
        .requestLand(sellerId, landId)
        .send({ from: accounts[0], gas: "6721975" });
      console.log(`Request sent for land ID: ${landId}`);
    } catch (error) {
      console.error("Error requesting to buy land:", error);
    }
  };

  const makePayment = async (landId, price) => {
    try {
      // Retrieve the seller's address from the smart contract
      const sellerAddress = await contract.methods.getLandOwner(landId).call();

      // Then, make the payment to that address
      await contract.methods
        .payment(sellerAddress, landId)
        .send({ from: accounts[0], value: price, gas: "6721975" });
      console.log(`Payment for land with ID ${landId} was successful.`);
      // Update UI to reflect the payment status, re-fetch land requests, etc.
      // Filter out the land that has been paid for
      const updatedLands = lands.filter((land) => land.id !== landId);
      setLands(updatedLands);
      // Update UI to reflect the payment status, re-fetch land requests, etc.
    } catch (error) {
      console.error("Payment failed:", error);
    }
  };

  return (
    <div>
      <h2>Buyer Dashboard</h2>
      <p>Welcome, {accounts[0]}</p>

      {buyerDetails && (
        <div>
          <h3>Your Details</h3>
          <p>Name: {buyerDetails.name}</p>
          <p>Age: {buyerDetails.age}</p>
          <p>City: {buyerDetails.city}</p>
          <p>HKID: {buyerDetails.HKID}</p>
          <p>Email: {buyerDetails.email}</p>
        </div>
      )}

      <h3>Number of Sellers: {sellersCount}</h3>

      <h3>Owned Lands</h3>
      <div>
        {ownedLands.length === 0 ? (
          <p>You do not own any lands.</p>
        ) : (
          <ul>
            {ownedLands.map((land, index) => (
              <li key={index}>
                <p>ID: {land.id}</p>
                <p>Address: {land.landAddress}</p>
                <p>Area: {land.area}</p>
                <p>City: {land.city}</p>
                <p>District: {land.district}</p>
                <p>Country: {land.country}</p>
                <p>Price: {land.landPrice}</p>
                <p>Property ID: {land.propertyPID}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <h3>Available Lands</h3>
      <div>
        {lands.length === 0 ? (
          <p>No lands available.</p>
        ) : (
          <ul>
            {lands.map(
              (
                land // Use the land object directly, no need for index
              ) => (
                <li key={land.id.toString()}>
                  {" "}
                  {/* Convert the land ID to a string for the key */}
                  <p>ID: {land.id}</p>
                  <p>Address: {land.landAddress}</p>
                  <p>Area: {land.area}</p>
                  <p>City: {land.city}</p>
                  <p>District: {land.district}</p>
                  <p>Country: {land.country}</p>
                  <p>Price: {land.landPrice}</p>
                  <p>Property ID: {land.propertyPID}</p>
                  <p>Owner: {land.owner}</p>{" "}
                  {/* Display the land owner's address */}
                  <button
                    onClick={() => handleRequestLand(land.owner, land.id)}
                    disabled={land.requested} // Convert land.id to a string if needed
                  >
                    {land.requested ? "Requested" : "Request to Buy"}
                  </button>
                </li>
              )
            )}
          </ul>
        )}
      </div>

      <h3>Your Land Requests</h3>
      {/* <ul>
        {Array.from(requestedLands).map((request, index) => (
          <li key={index}>
            <p>Land ID: {request.landId}</p>
            <p>Status: {request.isApproved ? "Approved" : "Pending"}</p>
            {request.isApproved && !request.isPaid && (
              <button
                onClick={() => makePayment(request.landId, request.landPrice)}
              >
                Pay
              </button>
            )}
          </li>
        ))}
      </ul> */}
      <ul>
        {lands
          .filter((land) => land.requested) // Only include lands that have been requested
          .map((land, index) => (
            <li key={index}>
              <p>Land ID: {land.id}</p>
              <p>Land Address: {land.landAddress}</p>
              <p>Area: {land.area}</p>
              <p>City: {land.city}</p>
              <p>District: {land.district}</p>
              <p>Country: {land.country}</p>
              <p>Price: {land.landPrice}</p>
              <p>Property PID: {land.propertyPID}</p>
              <p>Status: {land.approved ? "Approved" : "Pending Approval"}</p>
              <button
                onClick={() => makePayment(land.id, land.landPrice)}
                disabled={!land.approved} // The button is disabled if the request is not approved
              >
                {land.approved ? "Pay" : "Awaiting Approval"}
              </button>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default BuyerRegistration;
