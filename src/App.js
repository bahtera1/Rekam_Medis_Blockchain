import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import web3 from "./web3";
import contract from "./contract";

import AdminPage from "./admin/AdminPage.jsx";
import DoctorPage from "./dokter/DokterPage.jsx";
import PatientPage from "./pasien/PasienPage.jsx";

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

  const registerRole = async (address, newRole) => {
    try {
      if (newRole === "Dokter") {
        await contract.methods.registerDokter(address).send({ from: account });
      } else if (newRole === "Pasien") {
        await contract.methods.registerPasien(address).send({ from: account });
      }
      alert(`Alamat ${address} berhasil didaftarkan sebagai ${newRole}`);
    } catch (err) {
      console.error("Error registering role:", err);
    }
  };

  // Tentukan route tujuan berdasarkan role
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
        {/* <h1>Rekam Medis Blockchain</h1> */}

        {!account ? (
          <button onClick={loginWithMetaMask}>Login with MetaMask</button>
        ) : (
          <>
            {/* <p>Account: <strong>{account}</strong></p>
            <p>Role: <strong>{role}</strong></p> */}

            <Routes>
              {/* Route default: redirect ke halaman sesuai role */}
              <Route path="/" element={<Navigate to={getRedirectPath(role)} replace />} />

              <Route path="/admin" element={role === "Admin" ? <AdminPage account={account} onRegister={registerRole} /> : <Navigate to="/" replace />} />
              <Route path="/dokter" element={role === "Dokter" ? <DoctorPage /> : <Navigate to="/" replace />} />
              <Route path="/pasien" element={role === "Pasien" ? <PatientPage /> : <Navigate to="/" replace />} />

              {/* Optional: route fallback jika route tidak ditemukan */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;
