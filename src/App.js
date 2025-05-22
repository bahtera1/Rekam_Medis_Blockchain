import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import web3 from "./web3";
import contract from "./contract";
import "./App.css";

import AdminPage from "./admin/AdminPage.jsx";
import DoctorPage from "./dokter/DokterPage.jsx";
import PasienPage from "./pasien/PasienPage.jsx";

function App() {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("");

  const loginWithMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask dan coba lagi.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts();
      const active = accounts[0];
      setAccount(active);

      // Ambil role user dari smart contract
      let userRole = await contract.methods.getUserRole(active).call();

      // Jika belum terdaftar, treat sebagai pasien baru,
      // role di-set "Pasien" agar diarahkan ke halaman pasien
      if (userRole === "Unknown") {
        userRole = "Pasien";
      }

      setRole(userRole);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      alert("Gagal login menggunakan MetaMask.");
    }
  };

  const handleLogout = () => {
    setAccount("");
    setRole("");
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case "Admin":
        return "/admin";
      case "Dokter":
        return "/dokter";
      case "Pasien":
        return "/pasien";
      default:
        return "/";
    }
  };

  return (
    <Router>
      <div className="App">
        {!account ? (
          <div className="login-page">
            <div className="card-wrapper">
              <div className="card-left">
                <h1>SISTEM</h1>
                <h1>REKAM MEDIS</h1>
              </div>
              <div className="card-right">
                <button className="metamask-login" onClick={loginWithMetaMask}>
                  LOGIN WITH METAMASK
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="main-page">
            <Routes>
              <Route path="/" element={<Navigate to={getRedirectPath(role)} replace />} />
              <Route
                path="/admin"
                element={
                  role === "Admin" ? (
                    <AdminPage account={account} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/dokter"
                element={
                  role === "Dokter" ? (
                    <DoctorPage account={account} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/pasien"
                element={
                  role === "Pasien" ? (
                    <PasienPage account={account} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;
