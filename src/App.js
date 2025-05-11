// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; //
import web3 from "./web3";
import contract from "./contract";

// Import halaman terpisah
import AdminPage from "./admin/AdminPage.jsx";
import DoctorPage from "./dokter/DokterPage.jsx";
import PatientPage from "./pasien/PasienPage.jsx";

function App() {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("");

  // Login dan ambil role dari smart contract
  const loginWithMetaMask = async () => {
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const active = accounts[0];
        setAccount(active);

        // Memanggil kontrak untuk mendapatkan role
        const userRole = await contract.methods.getUserRole(active).call();
        setRole(userRole);

        console.log("Connected account:", active);
        console.log("User role:", userRole);
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    } else {
      alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask dan coba lagi.");
    }
  };

  // Daftarkan user dengan role tertentu (Admin saja)
  const registerRole = async (address, newRole) => {
    try {
      if (newRole === "Dokter") {
        await contract.methods.registerDokter(address)
          .send({ from: account });
      } else if (newRole === "Pasien") {
        await contract.methods.registerPasien(address)
          .send({ from: account });
      }
      alert(`Alamat ${address} berhasil didaftarkan sebagai ${newRole}`);
    } catch (err) {
      console.error("Error registering role:", err);
    }
  };

  return (
    <Router>
      <div className="App">
        <h1>Rekam Medis Blockchain</h1>

        {!account ? (
          <button onClick={loginWithMetaMask}>Login with MetaMask</button>
        ) : (
          <div>
            <p>Account: <strong>{account}</strong></p>
            <p>Role: <strong>{role}</strong></p>

            {/* Routing berdasarkan role */}
            <Routes>
              {/* Jika role adalah Admin */}
              {role === "Admin" && (
                <Route path="/admin" element={<AdminPage account={account} onRegister={registerRole} />} />
              )}

              {/* Jika role adalah Dokter */}
              {role === "Dokter" && (
                <Route path="/dokter" element={<DoctorPage />} />
              )}

              {/* Jika role adalah Pasien */}
              {role === "Pasien" && (
                <Route path="/pasien" element={<PatientPage />} />
              )}

              {/* Jika belum login, arahkan ke halaman login */}
              <Route path="/" element={<Navigate to="/" />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
