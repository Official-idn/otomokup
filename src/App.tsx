import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Produk from './pages/Produk';
import TentangKami from './pages/TentangKami';
import FormPengajuan from './pages/FormPengajuan';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pengajuan" element={<Produk />} />
          <Route path="/tentang-kami" element={<TentangKami />} />
          <Route path="/form-pengajuan" element={<FormPengajuan />} />
          <Route
            path="/admin"
            element={
              // FIX: Explicitly pass Admin as children prop to fix TS error
              <ProtectedRoute allowPageLoad={true}>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}

export default App;