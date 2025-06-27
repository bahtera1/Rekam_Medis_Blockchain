import React, { useState, useEffect, useCallback } from "react"; // Tambahkan useCallback
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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
  const [accountChangedMessage, setAccountChangedMessage] = useState(null);
  const navigate = useNavigate();

  // Fungsi untuk proses logout (dibungkus useCallback)
  const handleLogout = useCallback(async () => { // <--- Tambahkan 'async' dan 'useCallback'
    // Coba putuskan koneksi MetaMask (ini akan memunculkan konfirmasi di MetaMask)
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }], // Mencabut izin untuk eth_accounts
        });
        console.log("Permissions revoked from MetaMask.");
      } catch (err) {
        console.warn("Failed to revoke MetaMask permissions, or user cancelled:", err);
      }
    }

    // Bersihkan state aplikasi
    setAccount("");
    setRole("");
    setAccountChangedMessage(null);

    // Arahkan ke halaman login dan paksa reload
    navigate('/');
    window.location.reload();
  }, [navigate]); // navigate sebagai dependency useCallback

  // Efek untuk memuat akun saat aplikasi dimuat pertama kali dan mengatur event listeners
  useEffect(() => {
    const loadAccount = async () => {
      setAccountChangedMessage(null);
      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          const active = accounts[0];
          setAccount(active);
          const userRole = await contract.methods.getUserRole(active).call();
          setRole(userRole === "Unknown" ? "Pasien" : userRole);
        } else {
          setAccount("");
          setRole("");
        }
      } catch (error) {
        console.error("No account found or error connecting on load:", error);
        setAccount("");
        setRole("");
      }
    };

    loadAccount();

    // Event listener untuk perubahan akun di MetaMask (diganti atau terputus)
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          // Akun terputus dari MetaMask
          handleLogout(); // Panggil logout penuh
          setAccountChangedMessage("MetaMask account disconnected. Please log in again.");
        } else {
          // Akun diganti: paksa aplikasi kembali ke halaman login
          setAccount("");
          setRole("");
          setAccountChangedMessage(`MetaMask account changed to ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}. Please click 'LOGIN WITH METAMASK' again.`);
          navigate('/');
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Event listener untuk tombol back/forward browser (popstate)
      const handlePopState = () => {
        // PENTING: Hanya panggil logout jika pengguna sedang login.
        // Jika tidak ada akun (sudah logout atau di halaman login), jangan panggil.
        if (account) { // Cek state `account` yang terbaru
          console.log("Browser back/forward button pressed while logged in. Triggering logout.");
          handleLogout();
        }
      };
      window.addEventListener('popstate', handlePopState);

      // Cleanup: Hapus event listeners saat komponen di-unmount
      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [handleLogout, navigate, account]); // handleLogout dan account sebagai dependency

  const loginWithMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask dan coba lagi.");
      return;
    }

    setAccountChangedMessage(null);

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const active = accounts[0];
      setAccount(active);

      let userRole = await contract.methods.getUserRole(active).call();
      if (userRole === "Unknown") {
        userRole = "Pasien";
      }
      setRole(userRole);

      navigate(getRedirectPath(userRole));

    } catch (err) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        alert("Koneksi MetaMask ditolak. Silakan setujui koneksi untuk melanjutkan.");
      } else {
        alert("Gagal login menggunakan MetaMask. Coba lagi atau periksa konsol untuk detail.");
      }
      setAccount("");
      setRole("");
    }
  };

  const getRedirectPath = (currentRole) => {
    switch (currentRole) {
      case "SuperAdmin":
        return "/superadmin";
      case "AdminRS":
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
    <div className="min-h-screen w-full font-sans">
      {!account ? (
        <div
          className="login-page flex h-screen items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${BackgroundImage})` }}
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
              {accountChangedMessage && (
                <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded" role="alert">
                  <p className="font-bold">Perhatian!</p>
                  <p>{accountChangedMessage}</p>
                </div>
              )}
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
  );
}

export default App;