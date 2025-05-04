// src/App.js
import React, { useState } from "react";
import web3 from "./web3";
import contract from "./contract";

function App() {
  const [account, setAccount] = useState("");
  const [nama, setNama] = useState("");
  const [umur, setUmur] = useState("");
  const [diagnosa, setDiagnosa] = useState("");

  // Fungsi untuk login dengan MetaMask
  const loginWithMetaMask = async () => {
    if (window.ethereum) {
      try {
        // Meminta akses ke wallet
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        setAccount(accounts[0]);
        console.log("Connected account:", accounts[0]);

        // Cek jika wallet terhubung ke jaringan yang benar
        const networkId = await web3.eth.net.getId();
        console.log("Network ID:", networkId);

        // Optionally, check if the network is correct, e.g., Rinkeby, Ganache, etc.
        // You can add more checks here depending on the network you're working with.
      } catch (err) {
        console.log("User denied account access or error:", err);
      }
    } else {
      console.log("MetaMask is not installed!");
    }
  };

  // Fungsi untuk menambahkan rekam medis
  const addRecord = async () => {
    if (!account) {
      console.log("Please connect your MetaMask wallet first.");
      return;
    }

    try {
      // Meminta akun dari MetaMask
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const fromAddress = accounts[0];

      // Memanggil fungsi tambahRekamMedis dari kontrak
      await contract.methods
        .tambahRekamMedis(fromAddress, nama, umur, diagnosa)
        .send({ from: fromAddress })
        .on("transactionHash", (hash) => {
          console.log("Transaction Hash:", hash);
        })
        .on("receipt", (receipt) => {
          console.log("Transaction Receipt:", receipt);
        })
        .on("error", (error) => {
          console.log("Error:", error);
        });

      console.log("Rekam medis berhasil ditambahkan!");
    } catch (err) {
      console.log("Error adding record:", err);
    }
  };

  return (
    <div className="App">
      <h1>Rekam Medis Blockchain</h1>
      {account ? (
        <div>
          <h2>Connected Account: {account}</h2>
          <div>
            <label>Nama:</label>
            <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} />
          </div>
          <div>
            <label>Umur:</label>
            <input type="number" value={umur} onChange={(e) => setUmur(e.target.value)} />
          </div>
          <div>
            <label>Diagnosa:</label>
            <input type="text" value={diagnosa} onChange={(e) => setDiagnosa(e.target.value)} />
          </div>
          <button onClick={addRecord}>Tambah Rekam Medis</button>
        </div>
      ) : (
        <button onClick={loginWithMetaMask}>Login with MetaMask</button>
      )}
    </div>
  );
}

export default App;
