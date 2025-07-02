import React, { useState } from "react";

// --- SVG Icons ---
// Using inline SVGs for simplicity.

const UserCircleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ClipboardDocumentCheckIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 019 9v.375M10.125 2.25A3.375 3.375 0 0113.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 013.375 3.375M9 15l2.25 2.25L15 12" />
    </svg>
);

const ArrowLeftOnRectangleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

// Simple User Icon for collapsed logo
const UserIconSolid = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
);


// KOREKSI: Ganti activeTab, setActiveTab menjadi activeMenu, setActiveMenu
export default function PasienSideBar({ activeMenu, setActiveMenu, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const menuItems = [
        { key: "dataDiri", label: "Data Diri", icon: <UserCircleIcon /> },
        { key: "rekamMedisHistory", label: "Riwayat Rekam Medis", icon: <ClipboardDocumentCheckIcon /> }, // Menggunakan key yang sesuai dengan activeMenu di PasienPage
    ];

    const handleMenuItemClick = (key) => {
        setActiveMenu(key); // Pastikan memanggil setActiveMenu
    };

    const handleLogoutClick = () => {
        setShowConfirmModal(true);
    };

    const confirmLogout = () => {
        if (typeof onLogout === "function") {
            onLogout();
        }
        setShowConfirmModal(false);
    };

    const cancelLogout = () => {
        setShowConfirmModal(false);
    };

    return (
        <>
            <aside
                className={`
                    flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-black text-slate-200
                    shadow-2xl shadow-teal-900/30 
                    ${isOpen ? "px-6" : "px-3 items-center"} 
                    py-8 rounded-r-3xl border-r border-slate-700 font-poppins relative
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "w-64" : "w-20"} 
                    min-h-screen group
                `}
            >
                {/* Toggle Button */}
                <button
                    className={`
                        absolute top-7 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white 
                        rounded-full p-1.5 transition-all duration-200 z-20
                        focus:outline-none focus:ring-2 focus:ring-teal-500
                        ${isOpen ? "right-[-15px]" : "right-[-15px] transform"} 
                    `}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        )}
                    </svg>
                </button>

                {/* Logo/Title Section */}
                <div className={`mb-10 flex items-center ${isOpen ? "justify-start" : "justify-center"} w-full mt-2`}>
                    {isOpen ? (
                        <div className="text-center w-full">
                            <span className="block font-extrabold text-2xl tracking-tight text-white drop-shadow-lg">
                                Menu Pasien
                            </span>
                        </div>
                    ) : (
                        <div className="p-2 bg-teal-600 rounded-lg">
                            <UserIconSolid className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>

                {/* Navigation Buttons */}
                <nav className="flex-grow flex flex-col gap-y-3 w-full">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={`
                                flex items-center py-3 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out
                                group-hover:shadow-lg
                                ${isOpen ? "px-4 w-full justify-start" : "px-0 w-12 h-12 justify-center"}
                                ${activeMenu === item.key // Pastikan menggunakan activeMenu
                                    ? "bg-gradient-to-r from-teal-500 to-teal-400 text-white shadow-lg scale-105"
                                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-100"}
                            `}
                            onClick={() => handleMenuItemClick(item.key)}
                            title={isOpen ? "" : item.label}
                        >
                            <span className={`transition-transform duration-200 ${activeMenu === item.key && isOpen ? "scale-110" : ""}`}>
                                {React.cloneElement(item.icon, { className: `w-5 h-5 ${isOpen ? "mr-3" : "mr-0"}` })}
                            </span>
                            {isOpen && (
                                <span className={`transition-opacity duration-200 ${activeMenu === item.key ? "font-semibold" : ""}`}>
                                    {item.label}
                                </span>
                            )}
                            {!isOpen && activeMenu === item.key && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-teal-400 rounded-r-full" />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Logout Button */}
                <div className="mt-auto w-full">
                    <button
                        className={`
                            flex items-center py-3 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out
                            w-full
                            ${isOpen ? "px-4 justify-start" : "px-0 w-12 h-12 justify-center"}
                            text-red-400 hover:bg-red-700/20 hover:text-red-300
                        `}
                        onClick={handleLogoutClick}
                        title={isOpen ? "" : "Logout"}
                    >
                        <ArrowLeftOnRectangleIcon className={`w-5 h-5 ${isOpen ? "mr-3" : "mr-0"}`} />
                        {isOpen && (
                            <span>Logout</span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Custom Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Logout</h3>
                        <p className="text-slate-300 mb-8 text-center">
                            Apakah Anda yakin ingin keluar dari sesi ini?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={cancelLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 font-medium transition-colors duration-150 order-2 sm:order-1"
                            >
                                Batal
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors duration-150 order-1 sm:order-2"
                            >
                                Ya, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}