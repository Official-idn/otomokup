import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
    return (
        <div className="container mx-auto px-4 flex flex-col items-center justify-center h-[calc(100vh-180px)] text-center">
            <h1 className="text-4xl font-bold mb-4">404 - Halaman Tidak Ditemukan</h1>
            <p className="text-lg text-neutral-600 mb-8">Maaf, halaman yang Anda cari tidak ada.</p>
            <Link to="/" className="px-7 py-3 rounded-lg font-semibold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5">
                Kembali ke Beranda
            </Link>
        </div>
    );
};

export default NotFound;