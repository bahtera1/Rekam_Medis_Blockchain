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

    fetchNama();

    return () => {
      active = false;
    };
  }, [address, getNamaRS]);

  return (
    <tr
      className={`border-b border-gray-200 hover:bg-gray-100 transition-colors duration-150 ${
        error ? "bg-red-50" : "bg-white"
      }`}
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-center">{no}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{address}</td>
      <td className={`px-6 py-4 whitespace-nowrap text-sm ${error ? "text-red-600" : "text-gray-800"}`}>
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
      const adminAddresses = await contract.methods.getAllAdminRSAddresses().call();
      setDaftarAdmin(adminAddresses || []);
    } catch (err) {
      setNotif("Gagal mengambil daftar admin RS!");
      setNotifType("error");
      console.error("Fetch admins error:", err);
    }
    setInitialLoading(false);
  };

  useEffect(() => {
    if (account) {
      fetchAdmins();
    } else {
      setDaftarAdmin([]);
    }
  }, [account]);

  // Ambil nama RS berdasarkan address admin
  const getNamaRS = async (address) => {
    try {
      const adminData = await contract.methods.dataAdmin(address).call();
      if (adminData && adminData.namaRumahSakit) {
        return adminData.namaRumahSakit || "Tidak ada nama";
      }
      return "Tidak ada nama";
    } catch (err) {
      console.error("Error getting Nama RS:", err);
      return "Gagal memuat nama";
    }
  };

  const handleRegisterRS = async (e) => {
    e.preventDefault();
    setNotif("");
    setLoading(true);
    try {
      await contract.methods.registerAdminRS(adminAddress, namaRS).send({ from: account });
      setNotif("Sukses mendaftarkan admin RS!");
      setNotifType("success");
      setShowRegister(false);
      setNamaRS("");
      setAdminAddress("");
      await fetchAdmins(); // Refresh daftar admin setelah registrasi
    } catch (err) {
      setNotif("Gagal mendaftarkan admin RS: " + (err?.message || err));
      setNotifType("error");
      console.error("Register RS error:", err);
    }
    setLoading(false);
  };

  const getNotifClasses = () => {
    if (notifType === "success") return "bg-green-100 border-green-400 text-green-700";
    if (notifType === "error") return "bg-red-100 border-red-400 text-red-700";
    return "bg-blue-100 border-blue-400 text-blue-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-800">SuperAdmin Dashboard</h1>
            <button
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
          <div className="mt-4 p-4 bg-white shadow rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-semibold">Akun Terhubung:</span>
              <span className="ml-2 font-mono text-indigo-600 break-all">{account || "Tidak terhubung"}</span>
            </p>
          </div>
        </header>

        {notif && (
          <div className={`border-l-4 p-4 rounded-md shadow-sm mb-6 ${getNotifClasses()}`} role="alert">
            <p className="font-bold">{notifType === "success" ? "Sukses" : notifType === "error" ? "Error" : "Informasi"}</p>
            <p>{notif}</p>
          </div>
        )}

        {/* Form Registrasi Admin RS */}
        <section className="mb-10">
          <button
            className="flex items-center justify-center w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            onClick={() => {
              setShowRegister(!showRegister);
              setNotif("");
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 mr-2 transition-transform duration-300 ${showRegister ? "rotate-45" : ""}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            {showRegister ? "Tutup Form Registrasi" : "Registrasi Rumah Sakit Baru"}
          </button>

          {showRegister && (
            <div className="mt-6 bg-white shadow-xl rounded-lg p-6 sm:p-8">
              <form onSubmit={handleRegisterRS} className="space-y-6">
                <div>
                  <label htmlFor="namaRS" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Rumah Sakit
                  </label>
                  <input
                    id="namaRS"
                    type="text"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3"
                    required
                    value={namaRS}
                    onChange={(e) => setNamaRS(e.target.value)}
                    placeholder="Contoh: RS Umum Sejahtera"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="adminAddress" className="block text-sm font-medium text-gray-700 mb-1">
                    Alamat Wallet Admin RS (Ethereum)
                  </label>
                  <input
                    id="adminAddress"
                    type="text"
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm p-3 font-mono"
                    required
                    value={adminAddress}
                    onChange={(e) => setAdminAddress(e.target.value)}
                    placeholder="0x1234...abcd"
                    disabled={loading}
                    pattern="^0x[a-fA-F0-9]{40}$"
                    title="Masukkan alamat Ethereum yang valid (dimulai dengan 0x dan diikuti 40 karakter heksadesimal)"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
        <section className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-2xl font-semibold text-slate-700 mb-6">Daftar Admin Rumah Sakit Terdaftar</h2>
            {initialLoading ? (
              <div className="text-center py-10">
                <svg
                  className="animate-spin mx-auto h-8 w-8 text-blue-600"
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
                <p className="mt-2 text-gray-500">Memuat daftar admin...</p>
              </div>
            ) : daftarAdmin.length === 0 ? (
              <p className="text-gray-500 text-center py-10">Belum ada admin RS yang terdaftar.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Alamat Wallet Admin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Rumah Sakit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {daftarAdmin.map((adminAddr, idx) => (
                      <AdminRSRow key={adminAddr} no={idx + 1} address={adminAddr} getNamaRS={getNamaRS} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Sistem Rekam Medis Terdesentralisasi. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
