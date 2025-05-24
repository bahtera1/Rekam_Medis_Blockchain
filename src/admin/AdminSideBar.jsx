import React from "react";

export default function AdminSideBar({ activePage, setActivePage, onLogout }) {
    const handleLogout = () => {
        const confirmed = window.confirm("Apakah Anda yakin ingin logout?");
        if (confirmed) {
            onLogout();
        }
    };

    const menuItems = [
        { key: "manageDokter", label: "Manajemen Dokter" },
        { key: "managePasien", label: "Pasien Terdaftar" },
        { key: "manageAssign", label: "Assign Pasien ke Dokter" },
    ];

    return (
        <aside className="w-[250px] min-h-screen flex flex-col bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] text-slate-200 shadow-2xl shadow-blue-900/30 px-6 py-8 rounded-tr-3xl rounded-br-3xl border-r border-blue-900/20 font-poppins relative">
            {/* Judul */}
            <div>
                <div className="flex items-center justify-center mb-10">
                    <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-lg">Admin Panel</span>
                </div>

                {/* NAVIGATION BUTTONS DENGAN GAP */}
                <nav className="flex flex-col gap-y-6">  {/* gap-y-6 untuk jarak antar button */}
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={`
                                w-full flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-150
                                ${activePage === item.key
                                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md"
                                    : "hover:bg-blue-900/30 hover:shadow"
                                }
                                relative
                            `}
                            onClick={() => setActivePage(item.key)}
                        >
                            <span className={`${activePage === item.key ? "font-bold" : "font-medium"}`}>
                                {item.label}
                            </span>
                            {activePage === item.key && (
                                <span className="absolute left-0 top-0 h-full w-2 bg-blue-400 rounded-l-xl shadow-md" />
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            <button
                className="absolute bottom-7 left-6 right-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-900/20 text-white py-3 px-4 rounded-xl font-bold text-base transition-all duration-150"
                onClick={handleLogout}
            >
                Logout
            </button>
        </aside>
    );
}
