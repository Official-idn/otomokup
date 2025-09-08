import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setIsMenuOpen(false);
        document.body.style.overflow = 'auto';
    }, [location]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
    };

    if (location.pathname === '/admin-control') {
        return null;
    }

    const navLinkClasses = "font-medium text-neutral-700 relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full";
    const activeNavLinkClasses = "text-primary after:w-full";

    return (
        <>
            <header className="h-[var(--header-height)] fixed top-0 left-0 w-full bg-white/90 backdrop-blur-md z-[100] shadow-sm">
                <nav className="container mx-auto px-4 flex justify-between items-center h-full">
                    <NavLink to="/" className="flex items-center gap-2.5">
                        <img src="/assets/images/oto-logo.svg" alt="otoweb Logo" className="h-10" />
                        <span className="text-2xl font-bold text-primary">danuferd-mockup</span>
                    </NavLink>
                    <ul className="hidden md:flex gap-8">
                        <li><NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Home</NavLink></li>
                        <li><NavLink to="/pengajuan" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Produk Kami</NavLink></li>
                        <li><NavLink to="/tentang-kami" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`}>Tentang Kami</NavLink></li>
                    </ul>
                    <NavLink to="/pengajuan" className="hidden md:inline-block px-7 py-3 rounded-lg font-semibold text-center transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40">Ajukan Sekarang</NavLink>
                    <button className={`md:hidden flex flex-col justify-around w-8 h-8 bg-transparent border-none cursor-pointer z-[101]`} aria-label="Toggle navigation menu" onClick={toggleMenu}>
                        <span className={`w-8 h-0.5 bg-primary rounded transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[10px]' : ''}`}></span>
                        <span className={`w-8 h-0.5 bg-primary rounded transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`w-8 h-0.5 bg-primary rounded transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[10px]' : ''}`}></span>
                    </button>
                </nav>
            </header>

            <div className={`fixed top-0 left-0 w-full h-screen bg-black/50 z-[99] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`} onClick={toggleMenu}>
                <nav className={`fixed top-[var(--header-height)] right-0 w-72 h-[calc(100vh-var(--header-height))] bg-white shadow-lg transition-transform duration-300 z-[100] p-5 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                    <ul className="list-none p-0 m-0">
                        <li className="mb-5"><NavLink to="/" className="block py-4 text-neutral-700 text-lg font-medium border-b border-slate-100">Home</NavLink></li>
                        <li className="mb-5"><NavLink to="/pengajuan" className="block py-4 text-neutral-700 text-lg font-medium border-b border-slate-100">Produk Kami</NavLink></li>
                        <li className="mb-5"><NavLink to="/tentang-kami" className="block py-4 text-neutral-700 text-lg font-medium border-b border-slate-100">Tentang Kami</NavLink></li>
                    </ul>
                    <NavLink to="/pengajuan" className="w-full mt-5 inline-block px-7 py-3 rounded-lg font-semibold text-center transition-all duration-300 bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40">Ajukan Sekarang</NavLink>
                </nav>
            </div>
        </>
    );
};

export default Header;