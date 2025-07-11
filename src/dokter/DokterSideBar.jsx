import React, { useState } from "react";

// Ikon
const ProfileIcon = ({ className = "w-6 h-6" }) => ( // <<< ICON BARU UNTUK PROFIL
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a8.966 8.966 0 0115 0H4.501z" />
    </svg>
);

const DocumentTextIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
);

const ArrowLeftOnRectangleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const HospitalIcon = ({ className = "w-5 h-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18h16.5a1.5 1.5 0 011.5 1.5v16.5a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5V4.5a1.5 1.5 0 011.5-1.5zm12 6H9.75v3.75H6v3h3.75V18h3.75v-3.75H18v-3h-3.75V9z" />
    </svg>
);

// Komponen Sidebar
export default function DokterSideBar({ onSelect, activeTab, onLogout }) {
    const [isOpen, setIsOpen] = useState(true);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const menuItems = [
        { key: "profile", label: "Profil", icon: <ProfileIcon /> }, // <<< DIUBAH: key "dashboard" menjadi "profile", label "Beranda" menjadi "Profil", icon HomeIcon menjadi ProfileIcon
        { key: "update", label: "Pasien Saya", icon: <DocumentTextIcon /> }, // <<< DIUBAH: label "Data Pasien" menjadi "Pasien Saya"
    ];

    const handleMenuItemClick = (key) => {
        onSelect(key);
    };

    const handleLogoutClick = () => {
        setShowConfirmModal(true);
    };

    const confirmLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            onSelect('logout');
        }
        setShowConfirmModal(false);
    };

    const cancelLogout = () => {
        setShowConfirmModal(false);
    };

    return (
        <>
            <aside className={`
                flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-black text-slate-200
                shadow-2xl shadow-blue-900/30 
                ${isOpen ? "px-6" : "px-3 items-center"}
                py-8 rounded-r-3xl border-r border-slate-700 font-poppins relative
                transition-all duration-300 ease-in-out
                ${isOpen ? "w-64" : "w-20"}
                min-h-screen group
            `}>
                <button
                    className={`
                        absolute top-7 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white
                        rounded-full p-1.5 transition-all duration-200 z-20
                        focus:outline-none focus:ring-2 focus:ring-blue-500 
                        ${isOpen ? "right-[-15px]" : "right-[-15px] transform"}
                    `}
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label={isOpen ? "Tutup sidebar" : "Buka sidebar"}
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        {isOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        )}
                    </svg>
                </button>

                <div className={`mb-10 flex items-center ${isOpen ? "justify-start" : "justify-center"} w-full mt-2`}>
                    {isOpen ? (
                        <div className="text-center w-full">
                            <span className="block font-extrabold text-2xl tracking-tight text-white drop-shadow-lg">
                                Beranda Dokter
                            </span>
                        </div>
                    ) : (
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <HospitalIcon className="w-5 h-5 text-white" />
                        </div>
                    )}
                </div>

                <nav className="flex-grow flex flex-col gap-y-3 w-full">
                    {menuItems.map((item) => (
                        <button
                            key={item.key}
                            className={`
                                flex items-center py-3 rounded-lg font-medium text-sm transition-all duration-200 ease-in-out
                                group-hover:shadow-lg
                                ${isOpen ? "px-4 w-full justify-start" : "px-0 w-12 h-12 justify-center"}
                                ${activeTab === item.key
                                    ? "bg-gradient-to-r from-blue-500 to-blue-400 text-white shadow-lg scale-105" // <<< DIUBAH: from-sky-500 to-sky-400 menjadi from-blue-500 to-blue-400
                                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-100"}
                            `}
                            onClick={() => handleMenuItemClick(item.key)}
                            title={isOpen ? "" : item.label}
                        >
                            <span className={`transition-transform duration-200 ${activeTab === item.key && isOpen ? "scale-110" : ""}`}>
                                {React.cloneElement(item.icon, { className: `w-5 h-5 ${isOpen ? "mr-3" : "mr-0"}` })}
                            </span>
                            {isOpen && (
                                <span className={`transition-opacity duration-200 ${activeTab === item.key ? "font-semibold" : ""}`}>
                                    {item.label}
                                </span>
                            )}
                            {!isOpen && activeTab === item.key && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-blue-400 rounded-r-full" /> // <<< DIUBAH: bg-sky-400 menjadi bg-blue-400
                            )}
                        </button>
                    ))}
                </nav>

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
                        {isOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Logout</h3>
                        <p className="text-slate-300 mb-8 text-center">
                            Apakah Anda yakin ingin Logout dari sesi ini?
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