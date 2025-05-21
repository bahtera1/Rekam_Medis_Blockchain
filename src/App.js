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
    if (window.ethereum) {
      try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        const active = accounts[0];
        setAccount(active);

        let userRole = await contract.methods.getUserRole(active).call();
        if (userRole === "Unknown") {
          await contract.methods.selfRegisterPasien().send({ from: active });
          userRole = await contract.methods.getUserRole(active).call();
          alert("Anda telah terdaftar sebagai Pasien otomatis.");
        }
        setRole(userRole);
      } catch (err) {
        console.error("Error connecting wallet:", err);
      }
    } else {
      alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask dan coba lagi.");
    }
  };

  const handleLogout = () => {
    setAccount("");
    setRole("");
  };

  const getRedirectPath = (role) => {
    switch (role) {
      case "Admin": return "/admin";
      case "Dokter": return "/dokter";
      case "Pasien": return "/pasien";
      default: return "/";
    }
  };

  return (
    <Router>
      <div className="App">
        {!account ? (
          <div className="login-page">
            <div className="card-wrapper">
              <div className="card-left">
                <h2>Get Ready!</h2>
                <h1>Your Adventure Is Here</h1>
              </div>
              <div className="card-right">
                <h2>Login</h2>
                <button className="metamask-login" onClick={loginWithMetaMask}>
                  Login with MetaMask
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
                element={role === "Dokter" ? <DoctorPage /> : <Navigate to="/" replace />}
              />
              <Route
                path="/pasien"
                element={role === "Pasien" ? <PasienPage /> : <Navigate to="/" replace />}
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
