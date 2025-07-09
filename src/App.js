// App.js
import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import web3 from "./web3";
import contract from "./contract";
import queryString from 'query-string';

import SuperAdminPage from "./superadmin/SuperAdminPage.jsx";
import AdminPage from "./admin/AdminPage.jsx";
import DokterPage from "./dokter/DokterPage.jsx";
import PasienPage from "./pasien/PasienPage.jsx";
import BackgroundImage from './background.jpg';

// BARU: Detail Jaringan yang Diharapkan (mengambil dari process.env)
const EXPECTED_CHAIN_ID = process.env.REACT_APP_EXPECTED_CHAIN_ID;
const NETWORK_DETAILS = {
  chainId: process.env.REACT_APP_EXPECTED_CHAIN_ID,
  chainName: process.env.REACT_APP_NETWORK_NAME,
  rpcUrls: [process.env.REACT_APP_RPC_URL], // RPC URL dari node blockchain Anda
  nativeCurrency: {
    name: process.env.REACT_APP_NATIVE_CURRENCY_NAME,
    symbol: process.env.REACT_APP_NATIVE_CURRENCY_SYMBOL,
    decimals: parseInt(process.env.REACT_APP_NATIVE_CURRENCY_DECIMALS, 10), // Pastikan ini di-parse sebagai angka
  },
};


function App() {
  const [account, setAccount] = useState("");
  const [role, setRole] = useState("");
  const [accountChangedMessage, setAccountChangedMessage] = useState(null);
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
        console.log("Izin dicabut dari MetaMask.");
      } catch (err) {
        console.warn("Gagal mencabut izin MetaMask, atau pengguna membatalkan:", err);
      }
    }

    setAccount("");
    setRole("");
    setAccountChangedMessage(null);
    navigate('/');
    window.location.reload();
  }, [navigate]);

  const checkAccountAndRole = useCallback(async (currentAccount) => {
    if (!currentAccount) {
      setAccount("");
      setRole("");
      return;
    }

    try {
      const userRole = await contract.methods.getUserRole(currentAccount).call();

      if (userRole === "InactiveAdminRS") {
        setAccount("");
        setRole("");
        setAccountChangedMessage("Akun Admin RS Anda saat ini tidak aktif. Silakan hubungi Super Admin untuk aktivasi.");
        if (window.location.pathname !== '/') {
          navigate('/');
        }
        return;
      }
      if (userRole === "InactiveDokter") {
        setAccount("");
        setRole("");
        setAccountChangedMessage("Akun Dokter Anda saat ini tidak aktif. Silakan hubungi Admin Rumah Sakit Anda.");
        if (window.location.pathname !== '/') {
          navigate('/');
        }
        return;
      }

      setAccount(currentAccount);
      setRole(userRole === "Unknown" ? "Pasien" : userRole);
    } catch (error) {
      console.error("Error checking account role:", error);
      setAccount("");
      setRole("");
      setAccountChangedMessage("Gagal memverifikasi status akun Anda di blockchain. Coba lagi.");
    }
  }, [navigate]);

  const switchNetwork = useCallback(async () => {
    if (!window.ethereum) {
      setAccountChangedMessage("MetaMask tidak terdeteksi. Silakan pasang MetaMask.");
      return false;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: EXPECTED_CHAIN_ID }],
      });
      console.log(`Berhasil beralih ke jaringan: ${NETWORK_DETAILS.chainName}`);
      return true;
    } catch (switchError) {
      if (switchError.code === 4902) { // Kode error 4902 berarti jaringan belum ditambahkan
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [NETWORK_DETAILS],
          });
          console.log(`Berhasil menambahkan dan beralih ke jaringan: ${NETWORK_DETAILS.chainName}`);
          return true;
        } catch (addError) {
          console.error("Gagal menambahkan jaringan kustom:", addError);
          setAccountChangedMessage(`Gagal menambahkan jaringan '${NETWORK_DETAILS.chainName}' ke MetaMask. Error: ${addError.message}`);
          return false;
        }
      } else {
        console.error("Gagal beralih jaringan:", switchError);
        setAccountChangedMessage(`Gagal beralih ke jaringan '${NETWORK_DETAILS.chainName}'. Error: ${switchError.message}`);
        return false;
      }
    }
  }, []);

  useEffect(() => {
    const loadInitialAccount = async () => {
      setAccountChangedMessage(null);
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (currentChainId !== EXPECTED_CHAIN_ID) {
          const switched = await switchNetwork();
          if (!switched) {
            return;
          }
        }

        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          await checkAccountAndRole(accounts[0]);
        } else {
          setAccount("");
          setRole("");
        }
      } catch (error) {
        console.error("No accounts found or error connecting:", error);
        setAccount("");
        setRole("");
        if (error.code === -32002 || (error.message && error.message.includes("already pending"))) {
          setAccountChangedMessage("MetaMask request sudah tertunda. Silakan buka kunci dompet Anda atau setujui permintaan.");
        } else if (error.message && error.message.includes("No 'ethereum' provider was found")) {
          setAccountChangedMessage("MetaMask tidak terdeteksi di browser ini. Silakan instal MetaMask.");
        } else {
          setAccountChangedMessage(`Terjadi kesalahan saat memuat akun: ${error.message}.`);
        }
      }
    };

    loadInitialAccount();

    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          handleLogout();
          setAccountChangedMessage("Akun MetaMask terputus. Silakan login kembali.");
        } else if (account !== accounts[0]) {
          setAccountChangedMessage(`Akun MetaMask berganti ke ${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}. Memuat ulang data...`);
          await checkAccountAndRole(accounts[0]);
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      const handleChainChanged = async (chainId) => {
        console.log("Jaringan berubah ke:", chainId);
        if (chainId !== EXPECTED_CHAIN_ID) {
          setAccountChangedMessage("Jaringan MetaMask berubah. Memuat ulang aplikasi.");
          const switchedBack = await switchNetwork();
          if (!switchedBack) {
            handleLogout();
          } else {
            const accounts = await web3.eth.getAccounts();
            if (accounts.length > 0) {
              await checkAccountAndRole(accounts[0]);
            } else {
              handleLogout();
            }
          }
        } else {
          const accounts = await web3.eth.getAccounts();
          if (accounts.length > 0) {
            await checkAccountAndRole(accounts[0]);
          }
        }
      };
      window.ethereum.on('chainChanged', handleChainChanged);

      const handlePopState = () => {
        // ... (tetap seperti kode Anda)
      };
      window.addEventListener('popstate', handlePopState);

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [handleLogout, checkAccountAndRole, account, switchNetwork]);

  const loginWithMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask dan coba lagi.");
      return;
    }

    setAccountChangedMessage(null);

    try {
      const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
      if (currentChainId !== EXPECTED_CHAIN_ID) {
        const switched = await switchNetwork();
        if (!switched) {
          return;
        }
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const active = accounts[0];

      await checkAccountAndRole(active);

      const finalRoleAfterLogin = await contract.methods.getUserRole(active).call();
      if (active && !['InactiveAdminRS', 'InactiveDokter'].includes(finalRoleAfterLogin)) {
        navigate(getRedirectPath(finalRoleAfterLogin));
      }

    } catch (err) {
      console.error("Terjadi kesalahan saat menghubungkan wallet:", err);
      if (err.code === 4001) {
        alert("Koneksi MetaMask ditolak. Silakan setujui koneksi untuk melanjutkan.");
      } else {
        alert("Gagal login menggunakan MetaMask. Coba lagi atau periksa konsol untuk detail.");
      }
      setAccount("");
      setRole("");
    }
  };

  const getRedirectPath = useCallback((currentRole) => {
    switch (currentRole) {
      case "SuperAdmin":
        return "/superadmin";
      case "AdminRS":
        return "/admin";
      case "Dokter":
        return "/dokter";
      case "Pasien":
      case "Unknown":
        return "/pasien";
      default:
        return "/";
    }
  }, []);

  return (
    <div className="min-h-screen w-full font-sans">
      {!account || !role ? (
        <div
          className="login-page flex h-screen items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
          <div className="card-wrapper flex w-[800px] max-w-[95%] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl border border-gray-100">
            <div className="card-left flex-1 p-10 text-white bg-gradient-to-br from-blue-800/70 to-indigo-900/70 backdrop-blur-md flex flex-col justify-center text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl uppercase tracking-wider mb-3 font-light">Sistem Informasi</h1>
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">Rekam Medis Elektronik</h2>
              <p className="mt-4 text-blue-100 text-sm sm:text-base">
                Platform terdesentralisasi untuk pengelolaan rekam medis.
              </p>
            </div>

            <div className="card-right flex-1 bg-white p-10 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Masuk ke Beranda</h3>
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
                  <span>HUBUNGKAN DENGAN</span>
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
            <Route path="/superadmin" element={role === "SuperAdmin" ? <SuperAdminPage account={account} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
            <Route path="/admin" element={role === "AdminRS" ? <AdminPage account={account} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
            <Route path="/dokter" element={role === "Dokter" ? <DokterPage account={account} onLogout={handleLogout} /> : <Navigate to="/" replace />} />
            <Route path="/pasien" element={role === "Pasien" ? <PasienPage account={account} onLogout={handleLogout} setAccount={setAccount} /> : <Navigate to="/" replace />} />
            <Route path="/pasien-dashboard" element={role === "Pasien" ? <PasienPage account={account} onLogout={handleLogout} setAccount={setAccount} /> : <Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;