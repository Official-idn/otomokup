import React, { useEffect } from 'react';

const TentangKami = () => {

    return (
        <>
            <section className="text-white text-center py-24 md:py-32 min-h-[400px] flex items-center justify-center relative bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/assets/images/hero-bg.jpg')"}}>
                <div className="absolute inset-0 bg-black/50"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold">Mendigitalkan Perjalanan Anda Memiliki Kendaraan</h1>
                    <p className="text-lg md:text-xl mt-4 max-w-3xl mx-auto opacity-90">Kami adalah jembatan teknologi antara impian Anda memiliki kendaraan dan solusi pembiayaan terbaik yang ada di Indonesia.</p>
                </div>
            </section>

            <section className="py-20">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="text-center">
                        <img src="/assets/images/placeholder.webp" alt="Tim danuferd-mockup bekerja sama di kantor" className="max-w-md mx-auto rounded-lg shadow-xl transition-transform duration-300 hover:scale-105" />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-left">Siapa Kami</h2>
                        <p className="mb-4 text-neutral-600"><strong>danuferd-mockup</strong> adalah platform teknologi finansial (fintech) terdepan di Indonesia yang berfokus pada ekosistem otomotif. Kami lahir dari pemahaman bahwa proses mendapatkan pembiayaan kendaraan seringkali rumit, lambat, dan tidak transparan.</p>
                        <p className="text-neutral-600">Sebagai bagian dari grup teknologi otomotif terkemuka di Asia, kami memanfaatkan teknologi canggih untuk menyederhanakan setiap langkah, mulai dari simulasi kredit, pengajuan aplikasi, hingga mendapatkan persetujuan dari puluhan mitra pembiayaan terpercaya kami.</p>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TentangKami;