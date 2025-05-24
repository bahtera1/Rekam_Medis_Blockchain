import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import web3 from "./web3";
import contract from "./contract";
import "./App.css"; // Tetap impor App.css jika ada styling tambahan yang masih diperlukan

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
      <div className="min-h-screen w-full bg-transparent">
        {!account ? (
          <div
            className="login-page flex h-screen items-center justify-center bg-login-bg bg-center bg-cover"
            style={{ backgroundImage: "url('/bakground.jpg')" }}
          >
            <div className="card-wrapper flex w-[700px] max-w-[90%] rounded-lg overflow-hidden shadow-lg">
              <div className="card-left flex-2 p-10 text-white bg-black/40 backdrop-blur-md flex flex-col justify-center font-mono">
                <h1 className="text-lg uppercase tracking-wide mb-2">Sistem</h1>
                <h1 className="text-4xl leading-tight">Rekam Medis</h1>
              </div>
              <div className="card-right flex-1 bg-gray-400 p-10 flex flex-col justify-center">
                <button
                  className="metamask-login relative w-full px-4 py-3 bg-gray-200 text-black rounded-lg text-sm cursor-pointer flex items-center justify-center transition-all duration-200 hover:bg-blue-700 hover:-translate-y-2 font-serif"
                  onClick={loginWithMetaMask}
                >
                  LOGIN WITH METAMASK
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 w-16 h-16 bg-[url('./logo.png')] bg-contain bg-no-repeat bg-center"></span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="main-page w-full min-h-screen block">
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