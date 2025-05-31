import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import web3 from "./web3";
import contract from "./contract";

import SuperAdminPage from "./superadmin/SuperAdminPage.jsx";
import AdminPage from "./admin/AdminPage.jsx";
import DoctorPage from "./dokter/DokterPage.jsx";
import PasienPage from "./pasien/PasienPage.jsx";
import BackgroundImage from './background.jpg';

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
      case "SuperAdmin":
        return "/superadmin";
      case "AdminRS":
      case "Admin": // fallback if still pakai role lama
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
      <div className="min-h-screen w-full font-sans">
        {!account ? (
          <div
            className="login-page flex h-screen items-center justify-center bg-cover bg-center"
            style={{ backgroundImage: `url(${BackgroundImage})` }} // Tetap menggunakan style prop untuk background utama
          >
            <div className="card-wrapper flex w-[800px] max-w-[95%] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl border border-gray-100">
              {/* Left Section: Branding/Title */}
              <div className="card-left flex-1 p-10 text-white bg-gradient-to-br from-blue-800/70 to-indigo-900/70 backdrop-blur-md flex flex-col justify-center text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl uppercase tracking-wider mb-3 font-light">Sistem Informasi</h1>
                <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">Rekam Medis Digital</h2>
                <p className="mt-4 text-blue-100 text-sm sm:text-base">
                  Platform terdesentralisasi untuk pengelolaan rekam medis yang aman dan transparan.
                </p>
              </div>

              {/* Right Section: Login Button */}
              <div className="card-right flex-1 bg-white p-10 flex flex-col justify-center items-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">Masuk ke Dashboard</h3>
                <button
                  className="metamask-login relative w-full px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-base font-semibold cursor-pointer flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-orange-300 focus:ring-opacity-75"
                  onClick={loginWithMetaMask}
                >
                  <div className="flex items-center space-x-2">
                    <span>LOGIN WITH</span>
                    <span className="w-20 h-20 bg-[url('./logo-metamask.png')] bg-contain bg-no-repeat bg-center"></span>
                  </div>
                </button>
                <p className="text-gray-500 text-sm mt-4">
                  Pastikan MetaMask Anda sudah terhubung ke jaringan yang benar.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="main-page w-full min-h-screen block">
            <Routes>
              <Route path="/" element={<Navigate to={getRedirectPath(role)} replace />} />
              <Route
                path="/superadmin"
                element={
                  role === "SuperAdmin" ? (
                    <SuperAdminPage account={account} onLogout={handleLogout} />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />
              <Route
                path="/admin"
                element={
                  role === "AdminRS" || role === "Admin" ? (
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