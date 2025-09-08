import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [testimonials, setTestimonials] = useState([]);
    const trackRef = useRef(null);
    const autoSlideInterval = useRef(null);

    useEffect(() => {
        fetch('/database/testimonials.json')
            .then(res => res.json())
            .then(data => setTestimonials(data))
            .catch(err => console.error("Failed to load testimonials:", err));
    }, []);

    useEffect(() => {
        if (trackRef.current) {
            const track = trackRef.current as HTMLDivElement;
            const slideWidth = track.children[0]?.getBoundingClientRect().width || 0;
            track.style.transform = `translateX(-${currentIndex * (slideWidth + 20)}px)`; // 20 is the gap
        }
    }, [currentIndex]);

    useEffect(() => {
        startAutoSlide();
        return () => stopAutoSlide();
    }, [testimonials]);

    const startAutoSlide = () => {
        stopAutoSlide();
        autoSlideInterval.current = setInterval(() => {
            moveToNextSlide();
        }, 5000);
    };

    const stopAutoSlide = () => {
        clearInterval(autoSlideInterval.current);
    };

    const moveToNextSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex + 1) % (testimonials.length || 1));
    };

    const moveToPrevSlide = () => {
        setCurrentIndex(prevIndex => (prevIndex - 1 + testimonials.length) % (testimonials.length || 1));
    };
    
    const btnClasses = "px-4 py-2 text-sm rounded-lg font-semibold text-center transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40";

    return (
        <>
            <section className="pt-20 pb-20 bg-gradient-to-br from-slate-100 to-cyan-50">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                    <div className="text-center md:text-left">
                        <h1 className="text-4xl lg:text-5xl font-bold text-neutral-800 mb-5">Mobil Impian di Depan Mata? Dapatkan Solusi Dananya di Sini.</h1>
                        <p className="text-lg text-neutral-600 mb-10">Pilih produk pembiayaan yang paling sesuai dengan kebutuhan Anda di bawah ini.</p>
                    </div>

                    <div className="text-center md:text-right">
                        <img src="/assets/bahan/loan-wallet.svg" alt="Ilustrasi pinjaman kendaraan" className="max-w-xs md:max-w-sm lg:max-w-md inline-block" />
                    </div>

                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mt-10">
                         <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 flex flex-col">
                            <div className="text-primary mx-auto mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 11l1.5-4.5h11L19 11M5 11v8a1 1 0 001 1h12a1 1 0 001-1v-8M5 11h14M7 15h2M15 15h2M6 8h12l-1 3H7l-1-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                            <h3 className="text-lg font-bold mb-2">Kredit Mobil Baru</h3>
                            <p className="flex-grow text-sm text-neutral-600 mb-4">Jangan biarkan mobil impian hanya jadi angan-angan. Kami hadirkan penawaran terbaik untuk mobil baru idaman Anda.</p>
                            <Link to="/pengajuan?tab=mobil-baru" className={btnClasses}>Cek Simulasi</Link>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 flex flex-col">
                            <div className="text-primary mx-auto mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 11l1.5-4.5h11L19 11M5 11v8a1 1 0 001 1h12a1 1 0 001-1v-8M5 11h14M7 15h2M15 15h2M6 8h12l-1 3H7l-1-3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
                            <h3 className="text-lg font-bold mb-2">Kredit Mobil Bekas</h3>
                            <p className="flex-grow text-sm text-neutral-600 mb-4">Pilihan cerdas untuk memiliki mobil berkualitas dengan cicilan yang lebih ringan dan terjangkau.</p>
                            <Link to="/pengajuan?tab=mobil-bekas" className={btnClasses}>Cek Simulasi</Link>
                        </div>
                         <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 flex flex-col">
                            <div className="text-primary mx-auto mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 16V5h3l2 3h6v3l-2 3H8l-3 2zm14 0h-2v-3h2v3zM6 16H4v-2h2v2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/></svg></div>
                            <h3 className="text-lg font-bold mb-2">Kredit Motor Baru</h3>
                            <p className="flex-grow text-sm text-neutral-600 mb-4">Solusi gesit di jalanan padat. Dapatkan motor baru impian Anda dengan proses mudah dan cepat.</p>
                            <Link to="/pengajuan?tab=motor-baru" className={btnClasses}>Cek Simulasi</Link>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 flex flex-col">
                            <div className="text-primary mx-auto mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 16V5h3l2 3h6v3l-2 3H8l-3 2zm14 0h-2v-3h2v3zM6 16H4v-2h2v2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="7.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/><circle cx="17.5" cy="18.5" r="2.5" stroke="currentColor" strokeWidth="2"/></svg></div>
                            <h3 className="text-lg font-bold mb-2">Kredit Motor Bekas</h3>
                            <p className="flex-grow text-sm text-neutral-600 mb-4">Miliki motor idaman dengan harga lebih ekonomis. Pilihan tepat untuk mobilitas harian Anda.</p>
                            <Link to="/pengajuan?tab=motor-bekas" className={btnClasses}>Cek Simulasi</Link>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20 flex flex-col">
                            <div className="text-primary mx-auto mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
                            <h3 className="text-lg font-bold mb-2">Pinjaman Multiguna</h3>
                            <p className="flex-grow text-sm text-neutral-600 mb-4">Butuh dana mendesak? Kendaraan Anda solusinya. Jadikan BPKB sebagai jaminan untuk dana tunai cepat.</p>
                            <Link to="/pengajuan?tab=multiguna" className={btnClasses}>Cek Simulasi</Link>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="py-20">
            <div className="container mx-auto px-4">
                <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">Bukan Sekadar Pinjaman, Ini Solusi Terbaik Untuk Anda</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10"><div className="mx-auto mb-4"><img src="/assets/bahan/instant-approval.svg" alt="Instant Approval Icon" className="h-24 mx-auto"/></div><h3 className="text-lg font-bold mb-2">Persetujuan Kilat</h3><p className="text-sm text-neutral-600">Dapatkan kepastian dalam 24 jam. Kami menghargai waktu berharga Anda.</p></div>
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10"><div className="mx-auto mb-4"><img src="/assets/bahan/complete-transparency.svg" alt="Complete Transparency Icon" className="h-24 mx-auto"/></div><h3 className="text-lg font-bold mb-2">Transparansi Penuh</h3><p className="text-sm text-neutral-600">Tidak ada biaya tersembunyi. Semua informasi disajikan jelas di awal.</p></div>
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10"><div className="mx-auto mb-4"><img src="/assets/bahan/multiple-purpose-loan.svg" alt="Multiple Purpose Loan Icon" className="h-24 mx-auto" /></div><h3 className="text-lg font-bold mb-2">Jaringan Terluas</h3><p className="text-sm text-neutral-600">Terhubung dengan puluhan perusahaan pembiayaan terpercaya di seluruh Indonesia.</p></div>
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/10"><div className="mx-auto mb-4"><img src="/assets/bahan/digital-process.svg" alt="Digital Process Icon" className="h-24 mx-auto"/></div><h3 className="text-lg font-bold mb-2">Proses Digital</h3><p className="text-sm text-neutral-600">Proses awal yang praktis tanpa perlu dokumen rumit untuk pengajuan pertama.</p></div>
                </div>
            </div>
        </section>

            <section className="py-20 bg-slate-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-center text-3xl md:text-4xl font-bold mb-12">Kisah Mereka yang Telah Mewujudkan Impiannya</h2>
                    <div className="relative w-full overflow-hidden py-2.5">
                        <div className="flex gap-5 transition-transform duration-500 ease-in-out" ref={trackRef}>
                            {testimonials.map((testi, index) => (
                                <div className="flex-shrink-0 w-full md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] bg-white p-6 rounded-xl shadow-md" key={index}>
                                    <p className="italic mb-5 text-neutral-600">"{testi.quote}"</p>
                                    <div className="flex items-center gap-4 border-t border-slate-200 pt-4">
                                        <img src={testi.image} alt={`Foto ${testi.name}`} className="w-12 h-12 rounded-full object-cover" />
                                        <div><h4 className="font-bold text-neutral-800">{testi.name}</h4><p className="text-sm text-neutral-500">{testi.loanType}</p></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="absolute top-1/2 -translate-y-1/2 -left-4 md:-left-5 bg-white border border-slate-300 rounded-full w-10 h-10 z-10 text-2xl flex items-center justify-center shadow-md hover:bg-slate-100" onClick={moveToPrevSlide}>&lt;</button>
                        <button className="absolute top-1/2 -translate-y-1/2 -right-4 md:-right-5 bg-white border border-slate-300 rounded-full w-10 h-10 z-10 text-2xl flex items-center justify-center shadow-md hover:bg-slate-100" onClick={moveToNextSlide}>&gt;</button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Home;