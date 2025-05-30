import React, { useState, useEffect } from "react";
import contract from "../contract"; // Pastikan ini sudah diimport dengan benar

// Komponen menampilkan satu baris admin RS
function AdminRSRow({ no, address, getNamaRS }) {
  const [nama, setNama] = useState("Memuat...");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchNama = async () => {
      try {
        // Asumsi getNamaRS bisa melempar error jika gagal
        const namaRS = await getNamaRS(address);
        if (active) {
          setNama(namaRS || "Tidak ada nama");
        }
      } catch (err) {
        if (active) {
          setNama("Gagal memuat nama");
          setError(true);
          console.error("Gagal memuat nama RS untuk address:", address, err);
        }
      }
    };

    // Pastikan address dan getNamaRS valid sebelum fetch
    // Kondisi ini sudah ada di versi sebelumnya dan dijaga
    if (address && typeof getNamaRS === 'function') {
      fetchNama();
    } else {
      setNama("Data tidak valid untuk fetchNama"); // Pesan error lebih spesifik
      setError(true);
    }


    return () => {
      active = false;
    };
  }, [address, getNamaRS]);

  return (
    <tr
      className={`
        border-b border-slate-200 
        ${error ? "bg-red-50 hover:bg-red-100" : "bg-white hover:bg-slate-50"}
        transition-colors duration-150 ease-in-out
      `}
    >
      <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-slate-700 text-center">{no}</td>
      <td className="px-5 py-4 whitespace-nowrap text-sm text-slate-600 font-mono">{address}</td>
      <td className={`px-5 py-4 whitespace-nowrap text-sm ${error ? "text-red-600 font-semibold" : "text-slate-800"}`}>
        {nama}
      </td>
    </tr>
  );
}

export default function SuperAdminPage({ account, onLogout }) {
  const [showRegister, setShowRegister] = useState(false);
  const [namaRS, setNamaRS] = useState("");
  const [adminAddress, setAdminAddress] = useState("");
  const [notif, setNotif] = useState("");
  const [notifType, setNotifType] = useState("info"); // info, success, error
  const [daftarAdmin, setDaftarAdmin] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fungsi ambil daftar admin RS dari kontrak
  const fetchAdmins = async () => {
    setInitialLoading(true);
    try {
      // Pastikan contract dan methods ada sebelum dipanggil
      if (contract && contract.methods && contract.methods.getAllAdminRSAddresses) {
        const adminAddresses = await contract.methods.getAllAdminRSAddresses().call();
        setDaftarAdmin(adminAddresses || []);
      } else {
        throw new Error("Contract atau method tidak tersedia");
      }
    } catch (err) {
      setNotif("Gagal mengambil daftar admin RS!");
      setNotifType("error");
      console.error("Fetch admins error:", err);
      setDaftarAdmin([]);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    if (account) {
      fetchAdmins();
    } else {
      setDaftarAdmin([]);
      setInitialLoading(false);
    }
  }, [account]);

  // Ambil nama RS berdasarkan address admin
  const getNamaRS = async (address) => {
    try {
      // Pastikan contract dan methods ada
      if (contract && contract.methods && contract.methods.dataAdmin) {
        const adminData = await contract.methods.dataAdmin(address).call();
        if (adminData && adminData.namaRumahSakit) {
          return adminData.namaRumahSakit;
        }
        return ""; // Kembalikan string kosong jika tidak ada nama, akan dihandle di AdminRSRow
      } else {
        throw new Error("Contract atau method dataAdmin tidak tersedia");
      }
    } catch (err) {
      console.error("Error getting Nama RS for address " + address + ":", err);
      throw err;
    }
  };

  const handleRegisterRS = async (e) => {
    e.preventDefault();
    setNotif("");
    setLoading(true);
    try {
      // Pastikan contract dan methods ada
      if (contract && contract.methods && contract.methods.registerAdminRS) {
        await contract.methods.registerAdminRS(adminAddress, namaRS).send({ from: account });
        setNotif("Sukses mendaftarkan admin RS!");
        setNotifType("success");
        setShowRegister(false);
        setNamaRS("");
        setAdminAddress("");
        await fetchAdmins();
      } else {
        throw new Error("Contract atau method registerAdminRS tidak tersedia");
      }
    } catch (err) {
      setNotif("Gagal mendaftarkan admin RS: " + (err?.message || err));
      setNotifType("error");
      console.error("Register RS error:", err);
    }
    setLoading(false);
  };

  const getNotifClasses = () => {
    if (notifType === "success") return "bg-green-50 border-green-400 text-green-700";
    if (notifType === "error") return "bg-red-50 border-red-400 text-red-700";
    return "bg-sky-50 border-sky-400 text-sky-700";
  };

  // Icon untuk tombol registrasi
  const PlusIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );

  const MinusIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-10 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <header>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
              SuperAdmin Dashboard
            </h1>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:shadow-red-500/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-opacity-75 flex items-center gap-2.5 transform active:scale-95"
              onClick={onLogout}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Logout
            </button>
          </div>
          <div className="mt-6 p-5 bg-white shadow-xl rounded-xl border border-slate-200/80">
            <p className="text-base text-slate-700">
              <span className="font-semibold text-slate-800">Akun Terhubung:</span>
              <span className="ml-2 font-mono text-sky-700 break-all bg-sky-100 px-3 py-1.5 rounded-lg text-sm">
                {account || "Tidak terhubung"}
              </span>
            </p>
          </div>
        </header>

        {notif && (
          <div className={`border-l-4 p-4 rounded-lg shadow-lg mb-0 ${getNotifClasses()}`} role="alert">
            <p className="font-bold text-sm">
              {notifType === "success" ? "Sukses!" : notifType === "error" ? "Terjadi Kesalahan!" : "Informasi"}
            </p>
            <p className="text-sm mt-1">{notif}</p>
          </div>
        )}

        {/* Form Registrasi Admin RS */}
        <section>
          <button
            className="flex items-center justify-center w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-sky-500/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transform active:scale-95"
            onClick={() => {
              setShowRegister(!showRegister);
              setNotif("");
            }}
          >
            {showRegister ? <MinusIcon className="mr-2 h-5 w-5" /> : <PlusIcon className="mr-2 h-5 w-5" />}
            {showRegister ? "Tutup Form Registrasi" : "Registrasi Rumah Sakit Baru"}
          </button>

          {showRegister && (
            <div className="mt-6 bg-white shadow-2xl rounded-xl border border-slate-200/80 p-6 sm:p-8 transform transition-all duration-300 ease-out">
              <form onSubmit={handleRegisterRS} className="space-y-6">
                <div>
                  <label htmlFor="namaRS" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Nama Rumah Sakit
                  </label>
                  <input
                    id="namaRS"
                    type="text"
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 transition-all duration-150 ease-in-out"
                    required
                    value={namaRS}
                    onChange={(e) => setNamaRS(e.target.value)}
                    placeholder="Contoh: RS Harapan Bangsa"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="adminAddress" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Alamat Wallet Admin RS (Ethereum)
                  </label>
                  <input
                    id="adminAddress"
                    type="text"
                    className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 sm:text-sm p-3.5 font-mono transition-all duration-150 ease-in-out"
                    required
                    value={adminAddress}
                    onChange={(e) => setAdminAddress(e.target.value)}
                    placeholder="0x..."
                    disabled={loading}
                    pattern="^0x[a-fA-F0-9]{40}$"
                    title="Masukkan alamat Ethereum yang valid (dimulai dengan 0x dan diikuti 40 karakter heksadesimal)"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-green-500/40 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center transform active:scale-95"
                  disabled={loading}
                >
                  {loading && (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {loading ? "Memproses..." : "Daftarkan Admin RS"}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Tabel daftar Admin RS */}
        <section className="bg-white shadow-2xl rounded-xl overflow-hidden border border-slate-200/80">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-800 mb-6">
              Daftar Admin Rumah Sakit Terdaftar
            </h2>
            {initialLoading ? (
              <div className="text-center py-12">
                <svg
                  className="animate-spin mx-auto h-10 w-10 text-sky-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-3 text-slate-500 text-sm">Memuat daftar admin...</p>
              </div>
            ) : daftarAdmin.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200/80">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-slate-400 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                <p className="text-slate-600 font-semibold text-lg">Belum ada admin RS yang terdaftar.</p>
                <p className="text-sm text-slate-500 mt-1.5">Silakan daftarkan admin RS baru melalui form di atas.</p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-slate-200/80">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100/80">
                    <tr>
                      <th scope="col" className="px-5 py-3.5 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        No
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Alamat Wallet Admin
                      </th>
                      <th scope="col" className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Nama Rumah Sakit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {daftarAdmin.map((adminAddr, idx) => (
                      <AdminRSRow key={adminAddr} no={idx + 1} address={adminAddr} getNamaRS={getNamaRS} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-12 pt-8 pb-4 border-t border-slate-300/70 text-center text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} Sistem Rekam Medis Terdesentralisasi. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
