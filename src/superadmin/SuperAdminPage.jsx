// src/superadmin/SuperAdminPage.jsx
import React, { useState, useEffect } from "react";
import contract from "../contract";
import web3 from "../web3";

export default function SuperAdminPage({ account, onLogout }) {
    const [showRegister, setShowRegister] = useState(false);
    const [namaRS, setNamaRS] = useState("");
    const [adminAddress, setAdminAddress] = useState("");
    const [notif, setNotif] = useState("");
    const [daftarAdmin, setDaftarAdmin] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load daftar AdminRS dari blockchain
    useEffect(() => {
        const fetchAdmins = async () => {
            try {
                const admins = await contract.methods.daftarAdmin().call();
                setDaftarAdmin(admins);
            } catch (err) {
                setNotif("Gagal mengambil daftar admin RS!");
            }
        };
        fetchAdmins();
    }, []);

    // Ambil detail nama RS dari blockchain
    const getNamaRS = async (address) => {
        try {
            const admin = await contract.methods.dataAdmin(address).call();
            return admin.namaRumahSakit;
        } catch {
            return "-";
        }
    };

    const handleRegisterRS = async (e) => {
        e.preventDefault();
        setNotif("");
        setLoading(true);
        try {
            await contract.methods
                .registerAdminRS(adminAddress, namaRS)
                .send({ from: account });
            setNotif("Sukses mendaftarkan admin RS!");
            setShowRegister(false);
            setNamaRS("");
            setAdminAddress("");
            // Refresh daftar admin
            const admins = await contract.methods.daftarAdmin().call();
            setDaftarAdmin(admins);
        } catch (err) {
            setNotif("Gagal mendaftarkan admin RS: " + (err?.message || err));
        }
        setLoading(false);
    };

    return (
        <div className="p-10 min-h-screen bg-gray-50">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-blue-900">SuperAdmin Dashboard</h1>
                <button
                    className="bg-red-500 text-white px-4 py-2 rounded"
                    onClick={onLogout}
                >
                    Logout
                </button>
            </div>

            <div className="mb-4">
                <span className="font-semibold text-gray-700">Account:</span>
                <span className="ml-2 font-mono text-gray-800">{account}</span>
            </div>

            {notif && (
                <div className="mb-4">
                    <span className="text-sm text-blue-700 bg-blue-100 rounded px-4 py-2">{notif}</span>
                </div>
            )}

            {/* Form Register Admin RS */}
            <div className="my-8">
                <button
                    className="bg-blue-600 text-white px-6 py-2 rounded shadow hover:bg-blue-700 transition"
                    onClick={() => setShowRegister(!showRegister)}
                >
                    {showRegister ? "Tutup Form Register RS" : "Register Rumah Sakit/Admin RS"}
                </button>

                {showRegister && (
                    <form
                        className="mt-6 bg-white shadow-md rounded px-8 py-6 max-w-lg"
                        onSubmit={handleRegisterRS}
                    >
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Nama Rumah Sakit
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2"
                                required
                                value={namaRS}
                                onChange={(e) => setNamaRS(e.target.value)}
                                placeholder="Contoh: RS Umum Sejahtera"
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700 mb-2">
                                Address Admin RS (Ethereum)
                            </label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded px-3 py-2 font-mono"
                                required
                                value={adminAddress}
                                onChange={(e) => setAdminAddress(e.target.value)}
                                placeholder="0x1234...abcd"
                                disabled={loading}
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
                            disabled={loading}
                        >
                            {loading ? "Memproses..." : "Register RS"}
                        </button>
                    </form>
                )}
            </div>

            {/* Tabel daftar Admin RS */}
            <div className="mt-10 bg-white rounded shadow-md p-8">
                <h2 className="text-xl font-bold mb-6 text-blue-800">Daftar Rumah Sakit (Admin RS)</h2>
                {daftarAdmin.length === 0 ? (
                    <p className="text-gray-500">Belum ada admin RS terdaftar.</p>
                ) : (
                    <table className="w-full border">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="py-2 px-4">No</th>
                                <th className="py-2 px-4">Address</th>
                                <th className="py-2 px-4">Nama Rumah Sakit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {daftarAdmin.map((addr, idx) => (
                                <AdminRSRow key={addr} no={idx + 1} address={addr} getNamaRS={getNamaRS} />
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

// Komponen row rumah sakit (mengambil nama dari blockchain)
function AdminRSRow({ no, address, getNamaRS }) {
    const [nama, setNama] = useState("-");
    useEffect(() => {
        let active = true;
        getNamaRS(address).then((v) => active && setNama(v));
        return () => { active = false };
    }, [address, getNamaRS]);
    return (
        <tr>
            <td className="border px-4 py-2 text-center">{no}</td>
            <td className="border px-4 py-2 font-mono">{address}</td>
            <td className="border px-4 py-2">{nama}</td>
        </tr>
    );
}
