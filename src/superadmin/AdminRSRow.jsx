import React from "react";

// Icon untuk Edit
const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.4-8.4zm0 0L19.5 7.125m-1.5 1.5l-2.433 2.433m-1.875 1.875L9.75 10.5" />
    </svg>
);

// Icon untuk Aktif/Nonaktif
const IconToggle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.456a2.25 2.25 0 00-1.555-2.107L15.682 5.25H12V4.75" />
    </svg>
);


// Komponen menampilkan satu baris admin RS
export default function AdminRSRow({ adminData, no, onEdit, onToggleStatus }) {
    // adminData kini berisi objek lengkap dari smart contract
    const { address, namaRumahSakit, aktif, alamatRumahSakit, kota, NIBRS } = adminData; // IDRS diubah jadi NIBRS

    return (
        <tr
            className={`
                border-b border-slate-200 
                ${aktif ? "bg-white hover:bg-slate-50" : "bg-red-50 hover:bg-red-100"}
                transition-colors duration-150 ease-in-out
            `}
        >
            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-700 text-center">{no}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600 font-mono break-all">{address}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-800">{namaRumahSakit}</td>
            <td className="px-4 py-3 text-sm text-slate-600 break-words max-w-xs">{alamatRumahSakit || '-'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{kota || '-'}</td>
            <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">{NIBRS || '-'}</td> {/* IDRS diubah jadi NIBRS */}
            <td className="px-4 py-3 whitespace-nowrap text-sm text-center">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${aktif ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {aktif ? "Aktif" : "Non-Aktif"}
                </span>
            </td>
            <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                    <button
                        onClick={() => onEdit(adminData)} // Mengirim seluruh objek adminData
                        className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 p-2 rounded-full transition-colors duration-150"
                        title="Edit Detail Admin RS"
                    >
                        <IconEdit />
                    </button>
                    <button
                        onClick={() => onToggleStatus(address, aktif)} // Mengirim alamat dan status aktif
                        className={`p-2 rounded-full transition-colors duration-150 ${aktif ? "text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200" : "text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200"}`}
                        title={aktif ? "Nonaktifkan Admin RS" : "Aktifkan Admin RS"}
                    >
                        <IconToggle />
                    </button>
                </div>
            </td>
        </tr>
    );
}