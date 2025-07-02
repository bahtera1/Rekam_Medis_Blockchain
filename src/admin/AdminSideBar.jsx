import React, { useState } from "react";

const UserGroupIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-3.741-5.192M2.985 19.644A2.25 2.25 0 0 1 5.235 17.5h13.531c1.228 0 2.276.736 2.61 1.808a9.03 9.03 0 0 1-.698 5.396M15 9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.165 18.75l-.426-1.5M17.835 18.75l.426-1.5m0 0a3.001 3.001 0 0 0-5.192 0l-.426 1.5M12 9.75V15m0 0V9.75M12 15a2.25 2.25 0 0 0 2.25-2.25H9.75A2.25 2.25 0 0 0 12 15Z" />
    </svg>
);

const ClipboardDocumentListIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
);

const UserPlusIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
);

const ArrowLeftOnRectangleIcon = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);


export default function AdminSideBar({ activePage, setActivePage, onLogout, namaRumahSakit }) {
    const [isOpen, setIsOpen] = useState(true);
    // State for custom confirmation modal
    const [showConfirmModal, setShowConfirmModal] = useState(false);


    const handleLogoutClick = () => {
        setShowConfirmModal(true); // Show custom modal
    };

    const confirmLogout = () => {
        onLogout();
        setShowConfirmModal(false);
    };

    const cancelLogout = () => {
        setShowConfirmModal(false);
    };

    const menuItems = [
        { key: "manageDokter", label: "Manajemen Dokter", icon: <UserGroupIcon /> },
        { key: "managePasien", label: "Pasien Terdaftar", icon: <ClipboardDocumentListIcon /> },
        { key: "manageAssign", label: "Penugasan Dokter", icon: <UserPlusIcon /> }, // Shorter label for consistency
    ];

    return (
        <> {/* Fragment to wrap sidebar and modal */}
            <aside
                className={`
                    flex flex-col bg-gradient-to-b from-slate-800 via-slate-900 to-black text-slate-200
                    shadow-2xl shadow-blue-900/30 
                    ${isOpen ? "px-6" : "px-3 items-center"} 
                    py-8 rounded-r-3xl border-r border-slate-700 font-poppins relative
                    transition-all duration-300 ease-in-out
                    ${isOpen ? "w-64" : "w-20"} 
                    min-h-screen group
                `}
            >
                {/* Toggle Button - Adjusted positioning */}
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
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        {isOpen ? (
                            // Chevron Left
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        ) : (
                            // Chevron Right
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        )}
                    </svg>
                </button>

                {/* Logo/Title Section */}
                <div className={`mb-10 flex items-center ${isOpen ? "justify-start" : "justify-center"} w-full mt-2`}>
                    {/* Placeholder for a logo image if you have one */}
                    {isOpen ? (
                        <div className="text-center w-full">
                            <span className="block font-extrabold text-2xl tracking-tight text-white drop-shadow-lg">
                                Beranda Admin
                            </span>
                            {namaRumahSakit && (
                                <span
                                    className="block mt-1 text-sm font-medium text-sky-400 tracking-wide truncate"
                                    title={namaRumahSakit}
                                >
                                    {namaRumahSakit}
                                </span>
                            )}
                        </div>
                    ) : (
                        // Simple icon/logo when collapsed
                        <div className="p-2 bg-sky-500 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" />
                            </svg>
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
                                ${activePage === item.key
                                    ? "bg-gradient-to-r from-sky-500 to-sky-400 text-white shadow-lg scale-105"
                                    : "text-slate-400 hover:bg-slate-700 hover:text-slate-100"}
                            `}
                            onClick={() => setActivePage(item.key)}
                            title={isOpen ? "" : item.label} // Show full label as tooltip when collapsed
                        >
                            <span className={`transition-transform duration-200 ${activePage === item.key && isOpen ? "scale-110" : ""}`}>
                                {React.cloneElement(item.icon, { className: `w-5 h-5 ${isOpen ? "mr-3" : "mr-0"}` })}
                            </span>
                            {isOpen && (
                                <span className={`transition-opacity duration-200 ${activePage === item.key ? "font-semibold" : ""}`}>
                                    {item.label}
                                </span>
                            )}
                            {/* Active indicator for collapsed state */}
                            {!isOpen && activePage === item.key && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-sky-400 rounded-r-full" />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-slate-700">
                        <h3 className="text-xl font-semibold text-white mb-6 text-center">Konfirmasi Logout</h3>
                        <p className="text-slate-300 mb-8 text-center">
                            Apakah Anda yakin ingin keluar dari sesi ini?
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-4">
                            <button
                                onClick={cancelLogout}
                                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium transition-colors duration-150 order-2 sm:order-1"
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
