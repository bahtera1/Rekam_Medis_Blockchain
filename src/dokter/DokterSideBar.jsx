import React from 'react';

export default function DokterSideBar({ onSelect, activeTab }) {
    return (
        <aside className="w-[250px] min-h-screen flex flex-col bg-gradient-to-b from-[#334155] via-[#1e293b] to-[#0f172a] text-slate-200 shadow-2xl shadow-blue-900/30 px-6 py-8 rounded-tr-3xl rounded-br-3xl border-r border-blue-900/20 font-poppins relative">
            {/* Judul */}
            <div>
                <div className="flex items-center justify-center mb-10">
                    <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-lg">Menu Dokter</span>
                </div>
                <nav className="flex flex-col gap-y-6">
                    <button
                        className={`
                            w-full flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-150
                            ${activeTab === 'dashboard'
                                ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md"
                                : "hover:bg-blue-900/30 hover:shadow"
                            }
                            relative
                        `}
                        onClick={() => onSelect('dashboard')}
                    >
                        <span className={activeTab === 'dashboard' ? "font-bold" : "font-medium"}>
                            Dashboard
                        </span>
                        {activeTab === 'dashboard' && (
                            <span className="absolute left-0 top-0 h-full w-2 bg-blue-400 rounded-l-xl shadow-md" />
                        )}
                    </button>
                    <button
                        className={`
                            w-full flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-150
                            ${activeTab === 'update'
                                ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-md"
                                : "hover:bg-blue-900/30 hover:shadow"
                            }
                            relative
                        `}
                        onClick={() => onSelect('update')}
                    >
                        <span className={activeTab === 'update' ? "font-bold" : "font-medium"}>
                            Data Pasien
                        </span>
                        {activeTab === 'update' && (
                            <span className="absolute left-0 top-0 h-full w-2 bg-blue-400 rounded-l-xl shadow-md" />
                        )}
                    </button>
                </nav>
            </div>
            {/* Tombol Logout */}
            <button
                className="absolute bottom-7 left-6 right-6 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 shadow-lg shadow-red-900/20 text-white py-3 px-4 rounded-xl font-bold text-base transition-all duration-150"
                onClick={() => onSelect('logout')}
            >
                Logout
            </button>
        </aside>
    );
}
