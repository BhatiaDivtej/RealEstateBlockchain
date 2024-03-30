import React, { useState, useEffect } from "react";
import LandContract from "../artifacts/Land.json"; // Update with the correct path to your Truffle artifact
import getWeb3 from "../getWeb3"; // Assuming you have a utility function to provide web3
import { useNavigate } from "react-router-dom";

const Seller = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  let navigate = useNavigate();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [HKID, setHKID] = useState('');

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
      } catch (error) {
        alert(
          "Failed to load web3, accounts, or contract. Check console for details."
        );
        console.error(error);
      }
    };

    initWeb3();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Use the first account to register the buyer
      console.log(accounts[1])
      await contract.methods.registerSeller(name, age, HKID).send({ from: accounts[1], gas: '6721975' });

      console.log('Seller registered successfully');
        navigate('/seller-dashboard');
      const sellerCount = await contract.methods.getSellersCount().call();
        console.log('Seller count:', sellerCount);
    } catch (error) {
      console.error('Error registering seller:', error);
    }
  };

  return (
    <div>
      <h2>Seller Registration</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label>Name:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>
        <div>
          <label>HKID:</label>
          <input
            type="text"
            value={HKID}
            onChange={(e) => setHKID(e.target.value)}
            required
          />
        </div>
        <button type="submit" onSubmit={handleRegister}>Register</button>
      </form>
    </div>
  );
};

export default Seller;
