import React, { useState, useEffect, useCallback } from "react";
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
  const [accountChangedMessage, setAccountChangedMessage] = useState(null); // State untuk pesan notifikasi
  const navigate = useNavigate(); // Hook untuk navigasi programatik

  // Fungsi untuk proses logout (dibungkus useCallback)
  const handleLogout = useCallback(async () => {
    // Coba putuskan koneksi MetaMask (ini akan memunculkan konfirmasi di MetaMask)
    if (window.ethereum && window.ethereum.isMetaMask) {
      try {
        await window.ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }], // Mencabut izin untuk eth_accounts
        });
        console.log("Izin dicabut dari MetaMask."); // Teks di konsol
      } catch (err) {
        console.warn("Gagal mencabut izin MetaMask, atau pengguna membatalkan:", err); // Teks di konsol
      }
    }

    // Bersihkan state aplikasi
    setAccount("");
    setRole("");
    setAccountChangedMessage(null);

    // Arahkan ke halaman login dan paksa reload
    navigate('/');
    window.location.reload();
  }, [navigate]);

  // Efek untuk memuat akun saat aplikasi dimuat pertama kali dan mengatur event listeners
  useEffect(() => {
    const loadAccount = async () => {
      setAccountChangedMessage(null);
      try {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          const active = accounts[0];
          const userRole = await contract.methods.getUserRole(active).call();

          // PENANGANAN BARU: Jika AdminRS non-aktif saat load awal
          if (userRole === "InactiveAdminRS") {
            setAccount(""); // Jangan set akun jika tidak aktif
            setRole("");    // Jangan set role
            setAccountChangedMessage("Akun Admin RS Anda saat ini tidak aktif. Silakan hubungi Super Admin untuk aktivasi."); // Teks disesuaikan
            navigate('/'); // Langsung ke halaman login
            return; // Hentikan eksekusi lebih lanjut
          }
          // PENANGANAN BARU: Jika Dokter non-aktif saat load awal
          if (userRole === "InactiveDokter") {
            setAccount("");
            setRole("");
            setAccountChangedMessage("Akun Dokter Anda saat ini tidak aktif. Silakan hubungi Admin Rumah Sakit Anda."); // Teks disesuaikan
            navigate('/');
            return;
          }

          setAccount(active); // Set akun hanya jika aktif
          setRole(userRole === "Unknown" ? "Pasien" : userRole);
        } else {
          setAccount("");
          setRole("");
        }
      } catch (error) {
        console.error("Tidak ada akun yang ditemukan atau error saat terhubung:", error); // Teks di konsol
        setAccount("");
        setRole("");
      }
    };

    loadAccount();

    // Event listener untuk perubahan akun di MetaMask (diganti atau terputus)
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length === 0) {
          handleLogout(); // Akun terputus
          setAccountChangedMessage("Akun MetaMask terputus. Silakan login kembali."); // Teks disesuaikan
        } else {
          // Akun diganti: Ambil role untuk akun baru
          const newActiveAccount = accounts[0];
          const newRoleFromContract = await contract.methods.getUserRole(newActiveAccount).call();

          // PENANGANAN BARU: Jika AdminRS non-aktif setelah ganti akun
          if (newRoleFromContract === "InactiveAdminRS") {
            setAccount("");
            setRole("");
            setAccountChangedMessage("Akun Admin RS Anda saat ini tidak aktif. Silakan hubungi Super Admin untuk aktivasi."); // Teks disesuaikan
            navigate('/');
            return;
          }
          // PENANGANAN BARU: Jika Dokter non-aktif setelah ganti akun
          if (newRoleFromContract === "InactiveDokter") {
            setAccount("");
            setRole("");
            setAccountChangedMessage("Akun Dokter Anda saat ini tidak aktif. Silakan hubungi Admin Rumah Sakit Anda untuk aktivasi."); // Teks disesuaikan
            navigate('/');
            return;
          }

          // Untuk role lain atau akun aktif, paksa logout dan minta login ulang
          setAccount("");
          setRole("");
          setAccountChangedMessage(`Akun MetaMask berganti ke ${newActiveAccount.substring(0, 6)}...${newActiveAccount.substring(newActiveAccount.length - 4)}. Silakan klik 'LOGIN DENGAN METAMASK' kembali.`); // Teks disesuaikan
          navigate('/');
        }
      };
      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Event listener untuk tombol back/forward browser (popstate)
      const handlePopState = () => {
        if (account) {
          console.log("Tombol navigasi browser (back/forward) ditekan saat login. Memicu logout."); // Teks di konsol
          handleLogout();
        }
      };
      window.addEventListener('popstate', handlePopState);

      return () => {
        if (window.ethereum && window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [handleLogout, navigate, account]);

  // Fungsi untuk proses login dengan MetaMask (dipicu oleh tombol)
  const loginWithMetaMask = async () => {
    if (!window.ethereum) {
      alert("MetaMask tidak terdeteksi. Silakan pasang MetaMask dan coba lagi."); // Teks disesuaikan
      return;
    }

    setAccountChangedMessage(null); // Hapus pesan jika user mencoba login

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const active = accounts[0];

      let userRole = await contract.methods.getUserRole(active).call();

      // PENANGANAN BARU: Jika AdminRS non-aktif saat klik login
      if (userRole === "InactiveAdminRS") {
        setAccount("");
        setRole("");
        setAccountChangedMessage("Akun Admin RS Anda saat ini tidak aktif. Silakan hubungi Super Admin untuk aktivasi."); // Teks disesuaikan
        return;
      }
      // PENANGANAN BARU: Jika Dokter non-aktif saat klik login
      if (userRole === "InactiveDokter") {
        setAccount("");
        setRole("");
        setAccountChangedMessage("Akun Dokter Anda saat ini tidak aktif. Silakan hubungi Admin Rumah Sakit Anda untuk aktivasi."); // Teks disesuaikan
        return;
      }

      setAccount(active); // Set akun hanya jika aktif
      setRole(userRole === "Unknown" ? "Pasien" : userRole);

      // Pengalihan ke halaman role hanya terjadi di sini, setelah validasi
      navigate(getRedirectPath(userRole));

    } catch (err) {
      console.error("Terjadi kesalahan saat menghubungkan wallet:", err); // Teks disesuaikan
      if (err.code === 4001) {
        alert("Koneksi MetaMask ditolak. Silakan setujui koneksi untuk melanjutkan."); // Teks disesuaikan
      } else {
        alert("Gagal login menggunakan MetaMask. Coba lagi atau periksa konsol untuk detail."); // Teks disesuaikan
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
      {!account ? ( // Jika belum ada akun terhubung, tampilkan halaman login
        <div
          className="login-page flex h-screen items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${BackgroundImage})` }}
        >
          <div className="card-wrapper flex w-[800px] max-w-[95%] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl border border-gray-100">
            {/* Left Section: Branding/Title */}
            <div className="card-left flex-1 p-10 text-white bg-gradient-to-br from-blue-800/70 to-indigo-900/70 backdrop-blur-md flex flex-col justify-center text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl uppercase tracking-wider mb-3 font-light">Sistem Informasi</h1>
              <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">Rekam Medis Elektronik</h2>
              <p className="mt-4 text-blue-100 text-sm sm:text-base">
                Platform terdesentralisasi untuk pengelolaan rekam medis.
              </p>
            </div>

            {/* Right Section: Login Button */}
            <div className="card-right flex-1 bg-white p-10 flex flex-col justify-center items-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Masuk ke Beranda</h3>
              {accountChangedMessage && ( // Tampilkan pesan notifikasi jika ada
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
                  <span>HUBUNGKAN DENGAN</span> {/* Teks disesuaikan */}
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
        // Jika sudah ada akun terhubung, tampilkan rute sesuai role
        <div className="main-page w-full min-h-screen block">
          <Routes>
            {/* Redirect utama: Mengarahkan ke path role yang sesuai */}
            <Route path="/" element={<Navigate to={getRedirectPath(role)} replace />} />

            {/* Rute untuk SuperAdmin */}
            <Route
              path="/superadmin"
              element={
                role === "SuperAdmin" ? (
                  <SuperAdminPage account={account} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace /> // Jika tidak sesuai role, redirect ke login
                )
              }
            />
            {/* Rute untuk Admin RS */}
            <Route
              path="/admin"
              element={
                role === "AdminRS" ? ( // Hanya AdminRS aktif yang bisa masuk sini
                  <AdminPage account={account} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Rute untuk Dokter */}
            <Route
              path="/dokter"
              element={
                role === "Dokter" ? ( // Hanya Dokter aktif yang bisa masuk sini
                  <DoctorPage account={account} onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            {/* Rute untuk Pasien */}
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
            {/* Fallback: Jika URL tidak cocok dengan rute di atas, kembali ke halaman login */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </div>
  );
}

export default App;