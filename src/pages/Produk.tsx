import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Produk = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Brand definitions by category - Updated to filter brands appropriately for each vehicle type
    // Car brands: Only show car manufacturers in car tabs (Mobil Baru/Bekas)
    const CAR_BRANDS = ['BMW', 'Daihatsu', 'Honda', 'Mazda', 'Mitsubishi', 'Nissan', 'Suzuki', 'Toyota'];
    // Motorcycle brands: Only show motorcycle manufacturers in motorcycle tabs (Motor Baru/Bekas)
    const MOTORCYCLE_BRANDS = ['KTM', 'Kawasaki', 'Vespa', 'Yamaha'];

    // State Management
    const [allVehicles, setAllVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [uniqueValues, setUniqueValues] = useState({ brands: [], types: [], transmissions: [], locations: [] });
    
    const [currentMainTab, setCurrentMainTab] = useState(searchParams.get('tab') || 'mobil-baru');
    const [currentBrandTab, setCurrentBrandTab] = useState('');
    
    const [filters, setFilters] = useState({ search: '', brand: '', priceMin: '', priceMax: '', type: '', yearMin: '', yearMax: '', transmission: '', location: '' });
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
    
    const brandTabsRef = useRef(null);

    // Data Fetching and Normalization
    useEffect(() => {
        const fetchVehicleData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const categories = ['mobil-baru', 'mobil-bekas', 'motor-baru', 'motor-bekas'];
                const promises = categories.map(category =>
                    fetch(`./database/${category}.json`).then(res => res.ok ? res.json() : [])
                );
                
                const results = await Promise.all(promises);
                const combinedData = results.flat();

                const normalizedData = combinedData.map(item => ({
                    id: item.id,
                    Brand: item.merk,
                    Produk: item.model,
                    Type: item.tipe,
                    Warna: item.warna,
                    tahun: Number(item.tahun),
                    CC: item.cc,
                    Transmisi: item.transmisi,
                    Lokasi: item.lokasi,
                    Harga: Number(item.harga),
                    Kategori: item.kategori,
                    Kondisi: item.kondisi,
                }));

                setAllVehicles(normalizedData);

                // Set initial unique values (will be filtered based on current tab)
                setUniqueValues({
                    brands: Array.from(new Set(normalizedData.map(v => v.Brand))).sort(),
                    types: Array.from(new Set(normalizedData.map(v => v.Type))).sort(),
                    transmissions: Array.from(new Set(normalizedData.map(v => v.Transmisi))).sort(),
                    locations: Array.from(new Set(normalizedData.map(v => v.Lokasi))).sort()
                });

            } catch (err) {
                setError('Gagal memuat data kendaraan. Silakan coba lagi nanti.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicleData();
    }, []);

    // Brand filtering based on current tab
    useEffect(() => {
        if (allVehicles.length === 0) return;

        let filteredBrands = [];
        if (currentMainTab === 'mobil-baru' || currentMainTab === 'mobil-bekas') {
            // Filter vehicles for current tab and get available brands that are in CAR_BRANDS
            const tabVehicles = allVehicles.filter(v =>
                (currentMainTab === 'mobil-baru' && v.Kategori === 'Mobil' && v.Kondisi === 'Baru') ||
                (currentMainTab === 'mobil-bekas' && v.Kategori === 'Mobil' && v.Kondisi === 'Bekas')
            );
            filteredBrands = Array.from(new Set(tabVehicles.map(v => v.Brand)))
                .filter((brand): brand is string => typeof brand === 'string' && CAR_BRANDS.includes(brand))
                .sort();
        } else if (currentMainTab === 'motor-baru' || currentMainTab === 'motor-bekas') {
            // Filter vehicles for current tab and get available brands that are in MOTORCYCLE_BRANDS
            const tabVehicles = allVehicles.filter(v =>
                (currentMainTab === 'motor-baru' && v.Kategori === 'Motor' && v.Kondisi === 'Baru') ||
                (currentMainTab === 'motor-bekas' && v.Kategori === 'Motor' && v.Kondisi === 'Bekas')
            );
            filteredBrands = Array.from(new Set(tabVehicles.map(v => v.Brand)))
                .filter((brand): brand is string => typeof brand === 'string' && MOTORCYCLE_BRANDS.includes(brand))
                .sort();
        }

        setUniqueValues(prev => ({
            ...prev,
            brands: filteredBrands
        }));

        // Debug logging
        console.log(`Tab: ${currentMainTab}, Filtered brands:`, filteredBrands);
        if (currentMainTab === 'multiguna') {
            console.log('Multiguna tab active - headers should be hidden');
        }
    }, [currentMainTab, allVehicles]);

    // Filtering Logic
    useEffect(() => {
        let tempVehicles = [...allVehicles];

        switch (currentMainTab) {
            case 'mobil-baru': tempVehicles = tempVehicles.filter(v => v.Kategori === 'Mobil' && v.Kondisi === 'Baru'); break;
            case 'mobil-bekas': tempVehicles = tempVehicles.filter(v => v.Kategori === 'Mobil' && v.Kondisi === 'Bekas'); break;
            case 'motor-baru': tempVehicles = tempVehicles.filter(v => v.Kategori === 'Motor' && v.Kondisi === 'Baru'); break;
            case 'motor-bekas': tempVehicles = tempVehicles.filter(v => v.Kategori === 'Motor' && v.Kondisi === 'Bekas'); break;
        }

        if (currentBrandTab) tempVehicles = tempVehicles.filter(v => v.Brand === currentBrandTab);
        if (filters.search) {
             const searchTerm = filters.search.toLowerCase();
             tempVehicles = tempVehicles.filter(v => `${v.Brand} ${v.Produk} ${v.Type} ${v.Warna}`.toLowerCase().includes(searchTerm));
        }
        if (filters.brand) tempVehicles = tempVehicles.filter(v => v.Brand === filters.brand);
        if (filters.type) tempVehicles = tempVehicles.filter(v => v.Type === filters.type);
        if (filters.transmission) tempVehicles = tempVehicles.filter(v => v.Transmisi === filters.transmission);
        if (filters.location) tempVehicles = tempVehicles.filter(v => v.Lokasi === filters.location);
        if (filters.yearMin) tempVehicles = tempVehicles.filter(v => v.tahun >= parseInt(filters.yearMin, 10));
        if (filters.yearMax) tempVehicles = tempVehicles.filter(v => v.tahun <= parseInt(filters.yearMax, 10));
        if (filters.priceMin) tempVehicles = tempVehicles.filter(v => v.Harga >= parseInt(filters.priceMin, 10));
        if (filters.priceMax) tempVehicles = tempVehicles.filter(v => v.Harga <= parseInt(filters.priceMax, 10));

        setFilteredVehicles(tempVehicles);
        setCurrentPage(1);
    }, [allVehicles, currentMainTab, currentBrandTab, filters]);


    // Handlers
    const handleMainTabClick = (tab) => {
        setCurrentMainTab(tab);
        setCurrentBrandTab('');
        setFilters({ search: '', brand: '', priceMin: '', priceMax: '', type: '', yearMin: '', yearMax: '', transmission: '', location: '' });
    };

    const handleBrandTabClick = (brand) => setCurrentBrandTab(brand);
    const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const resetFilters = () => {
        setFilters({ search: '', brand: '', priceMin: '', priceMax: '', type: '', yearMin: '', yearMax: '', transmission: '', location: '' });
        setCurrentBrandTab('');
    };
    
    const selectVehicle = (vehicle) => {
        if (window.confirm(`Anda yakin ingin mengajukan pembiayaan untuk ${vehicle.Brand || ''} ${vehicle.Produk}?`)) {
            sessionStorage.setItem('selectedVehicle', JSON.stringify(vehicle));
            navigate('/form-pengajuan');
        }
    };

    const toggleFilterPanel = () => setIsFilterPanelOpen(!isFilterPanelOpen);

    // Pagination Calculation
    const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const vehiclesToShow = filteredVehicles.slice(startIndex, startIndex + itemsPerPage);

    // UI Helpers
    const formatPrice = (price) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price);
    const scrollBrandTabs = (direction) => {
        if (brandTabsRef.current) brandTabsRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    };

    const renderContent = () => {
        const colSpan = currentMainTab === 'multiguna' ? 1 : 6;

        if (error) return <tr><td colSpan={colSpan} className="text-center p-12 text-red-600">{error}</td></tr>;
        if (currentMainTab === 'multiguna') {
            return (
                <tr>
                    <td colSpan={colSpan} className="text-center p-12">
                        <h3 className="text-2xl font-bold mb-4">Pinjaman Multiguna</h3>
                        <p className="mb-6">Solusi fleksibel untuk berbagai kebutuhan finansial Anda dengan jaminan BPKB kendaraan.</p>
                        <button className="px-7 py-3 rounded-lg font-semibold bg-primary text-white" onClick={() => selectVehicle({Produk: 'Pinjaman Multiguna'})}>
                            Ajukan Pinjaman Multiguna
                        </button>
                    </td>
                </tr>
            );
        }
        if (!isLoading && vehiclesToShow.length === 0) {
            return <tr><td colSpan={colSpan} className="text-center p-12 text-neutral-500">Tidak ada kendaraan yang sesuai dengan filter.</td></tr>;
        }
        return vehiclesToShow.map((v, index) => (
            <tr key={`${v.id}-${index}`} className="hover:bg-slate-50 transition-colors">
                <td data-label="Model">
                    <div className="font-semibold text-neutral-800">{v.Brand}</div>
                    <div className="text-sm text-neutral-500">{v.Produk} {v.CC ? `(${v.CC}cc)` : ''}</div>
                </td>
                <td data-label="Transmisi">{v.Transmisi}</td>
                <td data-label="Tahun">{v.tahun || 'N/A'}</td>
                <td data-label="Lokasi">{v.Lokasi}</td>
                <td data-label="Harga" className="font-semibold">{formatPrice(v.Harga)}</td>
                <td data-label="Aksi" className="text-center">
                    <button className="px-4 py-2 text-sm rounded-lg font-semibold bg-primary text-white" onClick={() => selectVehicle(v)}>Ajukan</button>
                </td>
            </tr>
        ));
    };
    
    return (
        <main>
            {isLoading && (
                <div className="fixed top-0 left-0 w-full h-full bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center z-[999]">
                    <div className="w-16 h-16 border-8 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                    <p className="mt-5 font-semibold text-neutral-700">Memuat Data Kendaraan...</p>
                </div>
            )}
            <section className="text-white text-center py-20 relative bg-cover bg-center bg-no-repeat" style={{backgroundImage: "url('/assets/images/hero-wallet.png')"}}>
                <div className="absolute inset-0 bg-neutral-800/70"></div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Temukan Kendaraan Impian Anda</h1>
                    <p className="text-lg max-w-2xl mx-auto opacity-90">Pilih dari ribuan mobil dan motor baru atau bekas dengan skema pembiayaan terbaik.</p>
                </div>
            </section>

            <section className="pt-16 pb-20">
                <div className="container mx-auto px-4">
                    <div className="flex justify-center gap-2 md:gap-4 border-b border-slate-200 mb-8 overflow-x-auto">
                        <button className={`py-4 px-3 md:px-6 border-b-2 text-sm md:text-base font-medium whitespace-nowrap ${currentMainTab === 'mobil-baru' ? 'border-primary text-primary' : 'border-transparent text-neutral-500'}`} onClick={() => handleMainTabClick('mobil-baru')}>Mobil Baru</button>
                        <button className={`py-4 px-3 md:px-6 border-b-2 text-sm md:text-base font-medium whitespace-nowrap ${currentMainTab === 'mobil-bekas' ? 'border-primary text-primary' : 'border-transparent text-neutral-500'}`} onClick={() => handleMainTabClick('mobil-bekas')}>Mobil Bekas</button>
                        <button className={`py-4 px-3 md:px-6 border-b-2 text-sm md:text-base font-medium whitespace-nowrap ${currentMainTab === 'motor-baru' ? 'border-primary text-primary' : 'border-transparent text-neutral-500'}`} onClick={() => handleMainTabClick('motor-baru')}>Motor Baru</button>
                        <button className={`py-4 px-3 md:px-6 border-b-2 text-sm md:text-base font-medium whitespace-nowrap ${currentMainTab === 'motor-bekas' ? 'border-primary text-primary' : 'border-transparent text-neutral-500'}`} onClick={() => handleMainTabClick('motor-bekas')}>Motor Bekas</button>
                        <button className={`py-4 px-3 md:px-6 border-b-2 text-sm md:text-base font-medium whitespace-nowrap ${currentMainTab === 'multiguna' ? 'border-primary text-primary' : 'border-transparent text-neutral-500'}`} onClick={() => handleMainTabClick('multiguna')}>Pinjaman Multiguna</button>
                    </div>

                    {currentMainTab !== 'multiguna' && (
                        <>
                            <div className="flex flex-col gap-5 mb-8">
                                <div className="flex items-center"><button className="bg-slate-100 border border-slate-200 rounded-full w-9 h-9 cursor-pointer shrink-0 flex items-center justify-center text-xl" onClick={() => scrollBrandTabs('left')}>&lt;</button><div className="flex gap-2.5 overflow-x-auto no-scrollbar flex-grow py-1.5" ref={brandTabsRef}><button className={`py-2 px-4 border rounded-full whitespace-nowrap cursor-pointer transition-all text-sm ${currentBrandTab === '' ? 'bg-primary text-white border-primary font-semibold' : 'border-slate-300 bg-white hover:bg-slate-100'}`} onClick={() => handleBrandTabClick('')}>Semua Merk</button>{uniqueValues.brands.map(brand => (<button key={brand} className={`py-2 px-4 border rounded-full whitespace-nowrap cursor-pointer transition-all text-sm ${currentBrandTab === brand ? 'bg-primary text-white border-primary font-semibold' : 'border-slate-300 bg-white hover:bg-slate-100'}`} onClick={() => handleBrandTabClick(brand)}>{brand}</button>))}</div><button className="bg-slate-100 border border-slate-200 rounded-full w-9 h-9 cursor-pointer shrink-0 flex items-center justify-center text-xl" onClick={() => scrollBrandTabs('right')}>&gt;</button></div>
                                <div className="flex flex-col md:flex-row justify-between gap-5"><div className="flex flex-grow"><input type="text" placeholder="Cari model, merk, warna..." name="search" value={filters.search} onChange={handleFilterChange} aria-label="Search vehicles" className="w-full border border-slate-300 border-r-0 px-4 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary" /><button aria-label="Search button" className="bg-primary text-white border-none px-4 rounded-r-lg cursor-pointer"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></button></div><button className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold bg-white text-primary border-2 border-slate-200 hover:bg-slate-100 hover:border-primary" onClick={toggleFilterPanel}>Filter<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg></button></div>
                            </div>
                            
                            <div className={`fixed top-0 left-0 w-full h-full bg-black/50 z-[1000] transition-opacity duration-300 ${isFilterPanelOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={toggleFilterPanel}>
                                <div className={`fixed top-0 right-0 w-full max-w-sm h-screen bg-white shadow-xl z-[1001] flex flex-col transition-transform duration-300 ${isFilterPanelOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center p-4 border-b border-slate-200 shrink-0"><h4 className="m-0 text-xl font-bold">Filter Lanjutan</h4><button className="bg-none border-none cursor-pointer text-neutral-500 p-1.5 hover:text-neutral-800" onClick={toggleFilterPanel} aria-label="Close filter panel"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button></div>
                                    <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-5">
                                        <div><label htmlFor="filter-brand" className="font-medium mb-2 block">Merk</label><select id="filter-brand" name="brand" value={filters.brand} onChange={handleFilterChange} className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Semua Merk</option>{uniqueValues.brands.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                                        <div><label htmlFor="filter-type" className="font-medium mb-2 block">Tipe</label><select id="filter-type" name="type" value={filters.type} onChange={handleFilterChange} className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Semua Tipe</option>{uniqueValues.types.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                        <div><label htmlFor="filter-transmission" className="font-medium mb-2 block">Transmisi</label><select id="filter-transmission" name="transmission" value={filters.transmission} onChange={handleFilterChange} className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Semua Transmisi</option>{uniqueValues.transmissions.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                        <div><label htmlFor="filter-location" className="font-medium mb-2 block">Lokasi</label><select id="filter-location" name="location" value={filters.location} onChange={handleFilterChange} className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"><option value="">Semua Lokasi</option>{uniqueValues.locations.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                                        <div><label className="font-medium mb-2 block">Rentang Tahun</label><div className="grid grid-cols-2 gap-2.5"><input type="number" name="yearMin" placeholder="Min" value={filters.yearMin} onChange={handleFilterChange} aria-label="Minimum year" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" /><input type="number" name="yearMax" placeholder="Max" value={filters.yearMax} onChange={handleFilterChange} aria-label="Maximum year" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
                                        <div><label className="font-medium mb-2 block">Rentang Harga (Rp)</label><div className="grid grid-cols-2 gap-2.5"><input type="number" name="priceMin" placeholder="Min" value={filters.priceMin} onChange={handleFilterChange} aria-label="Minimum price" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" /><input type="number" name="priceMax" placeholder="Max" value={filters.priceMax} onChange={handleFilterChange} aria-label="Maximum price" className="w-full p-3 rounded-lg border border-slate-300 bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary" /></div></div>
                                    </div>
                                    <div className="p-4 border-t border-slate-200 flex justify-end gap-2.5 shrink-0"><button className="px-5 py-2.5 rounded-lg font-semibold bg-white text-primary border-2 border-slate-200 hover:bg-slate-100" onClick={resetFilters}>Reset Filter</button><button className="px-5 py-2.5 rounded-lg font-semibold bg-primary text-white" onClick={toggleFilterPanel}>Terapkan</button></div>
                                </div>
                            </div>
                        </>
                    )}

                    <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-md">
                        <table className="w-full border-collapse responsive-table">
                            {/* Only show table headers for vehicle-related tabs, not for Pinjaman Multiguna */}
                            {currentMainTab !== 'multiguna' && (
                                <thead>
                                    <tr>
                                        <th className="p-4 text-left bg-slate-100 font-semibold uppercase text-xs tracking-wider">Model Kendaraan</th>
                                        <th className="p-4 text-left bg-slate-100 font-semibold uppercase text-xs tracking-wider">Transmisi</th>
                                        <th className="p-4 text-left bg-slate-100 font-semibold uppercase text-xs tracking-wider">Tahun</th>
                                        <th className="p-4 text-left bg-slate-100 font-semibold uppercase text-xs tracking-wider">Lokasi</th>
                                        <th className="p-4 text-left bg-slate-100 font-semibold uppercase text-xs tracking-wider">Harga</th>
                                        <th className="p-4 text-left bg-slate-100 font-semibold uppercase text-xs tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                            )}
                            <tbody>{renderContent()}</tbody>
                        </table>
                    </div>

                    {currentMainTab !== 'multiguna' && filteredVehicles.length > 0 && (
                        <div className="flex flex-col md:flex-row justify-between items-center mt-8 text-sm"><div className="text-neutral-600">Menampilkan {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredVehicles.length)} dari {filteredVehicles.length}</div><div className="flex items-center gap-2.5"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1.5 border border-slate-300 bg-white cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50">Sebelumnya</button><span>Halaman {currentPage} dari {totalPages}</span><button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="px-3 py-1.5 border border-slate-300 bg-white cursor-pointer rounded-md disabled:cursor-not-allowed disabled:opacity-50">Berikutnya</button></div></div>
                    )}
                </div>
            </section>
        </main>
    );
};

export default Produk;