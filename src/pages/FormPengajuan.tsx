import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// Definisikan tipe data untuk kendaraan agar lebih aman
type Vehicle = {
    Brand?: string;
    Produk: string;
    Type?: string;
    Transmisi?: string;
    tahun?: number;
    Lokasi?: string;
    Harga?: number;
};

const FormPengajuan = () => {
    const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
    const navigate = useNavigate(); // Hook untuk navigasi
    const WHATSAPP_NUMBER = "6285707148902";

    const [formData, setFormData] = useState({
        nama_lengkap: '', nik: '', no_hp: '', email: '', alamat: '',
    });

    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    useEffect(() => {
        const storedVehicle = sessionStorage.getItem('selectedVehicle');

        // ========================================================================
        // PERBAIKAN UTAMA DI SINI: Membuat alur kerja yang tangguh
        // Jika tidak ada kendaraan yang dipilih, jangan biarkan pengguna di halaman ini.
        // Arahkan mereka kembali ke halaman pemilihan.
        // ========================================================================
        if (storedVehicle) {
            setSelectedVehicle(JSON.parse(storedVehicle));
        } else {
            // Jika tidak ada data, beri peringatan dan arahkan kembali
            alert("Anda belum memilih kendaraan. Silakan pilih kendaraan terlebih dahulu.");
            navigate('/pengajuan');
        }
    }, [navigate]);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'nama_lengkap': return value.trim() ? '' : 'Nama lengkap wajib diisi.';
            case 'nik':
                if (!value.trim()) return 'NIK wajib diisi.';
                if (!/^\d{16}$/.test(value)) return 'NIK harus terdiri dari 16 digit angka.';
                return '';
            case 'no_hp':
                if (!value.trim()) return 'Nomor handphone wajib diisi.';
                if (!/^08\d{8,11}$/.test(value)) return 'Format nomor HP tidak valid (contoh: 081234567890).';
                return '';
            case 'email':
                if (!value.trim()) return 'Email wajib diisi.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format email tidak valid.';
                return '';
            case 'alamat': return value.trim() ? '' : 'Alamat lengkap wajib diisi.';
            default: return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const formatRupiah = (number: number | undefined) => {
        if (typeof number !== 'number' || isNaN(number)) return "N/A";
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
    };

    const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationErrors: { [key: string]: string } = {};
        Object.keys(formData).forEach(name => {
            const error = validateField(name, formData[name as keyof typeof formData]);
            if (error) validationErrors[name] = error;
        });

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            alert("Mohon perbaiki kesalahan pada formulir sebelum melanjutkan.");
            return;
        }

        const vehicleDetails = selectedVehicle
            ? `*Detail Kendaraan:*\n- Produk: ${selectedVehicle.Brand || ''} ${selectedVehicle.Produk || ''}\n- Tipe: ${selectedVehicle.Type || 'N/A'}\n- Transmisi: ${selectedVehicle.Transmisi || 'N/A'}\n- Tahun: ${selectedVehicle.tahun || 'N/A'}\n- Lokasi: ${selectedVehicle.Lokasi || 'N/A'}\n- Harga: ${formatRupiah(selectedVehicle.Harga)}`
            : `*Jenis Pengajuan:*\n- Produk: Pinjaman Multiguna`;

        const message = `Halo danuferd-mockup,\n\nSaya ingin mengajukan pembiayaan dengan detail sebagai berikut:\n\n${vehicleDetails}\n\n*Data Diri Pemohon:*\n- Nama Lengkap: ${formData.nama_lengkap}\n- NIK: ${formData.nik}\n- No. HP: ${formData.no_hp}\n- Email: ${formData.email}\n- Alamat: ${formData.alamat}\n\nMohon informasinya untuk proses selanjutnya. Terima kasih.`.trim();
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappUrl, '_blank');
    };

    // Jika selectedVehicle masih null (misalnya saat proses redirect), tampilkan loading.
    if (!selectedVehicle) {
        return (
            <div className="fixed top-0 left-0 w-full h-full bg-white flex flex-col justify-center items-center">
                <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-neutral-600">Mengarahkan...</p>
            </div>
        );
    }

    const renderSummary = () => {
        if (selectedVehicle.Produk === 'Pinjaman Multiguna') {
            return (<div className="bg-slate-100 p-5 rounded-lg text-center md:col-span-2"><p className="text-sm text-neutral-500">Anda Mengajukan</p><h3 className="text-xl font-bold text-primary">Pinjaman Multiguna</h3></div>)
        }
        return (
            <>
                <div className="bg-slate-100 p-5 rounded-lg text-center"><p className="text-sm text-neutral-500">Anda Mengajukan Pembiayaan Untuk</p><h3 className="text-xl font-bold text-primary">{selectedVehicle.Brand} {selectedVehicle.Produk}</h3><span className="text-sm">{selectedVehicle.tahun} &bull; {selectedVehicle.Transmisi} &bull; {selectedVehicle.Lokasi}</span></div>
                <div className="bg-slate-100 p-5 rounded-lg text-center"><p className="text-sm text-neutral-500">Dengan Harga Kendaraan</p><h3 className="text-xl font-bold text-primary">{formatRupiah(selectedVehicle.Harga)}</h3></div>
            </>
        );
    }

    const inputClass = (name: string) => `w-full p-3 rounded-lg border text-base transition-all focus:outline-none focus:ring-2 ${errors[name] ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-primary'}`;
    const labelClass = "mb-2 font-medium block";

    return (
        <section className="bg-slate-100 py-10">
            <div className="container mx-auto px-4 max-w-3xl bg-white p-6 md:p-10 rounded-xl shadow-lg">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold">Satu Langkah Lagi Untuk Pengajuan Anda</h1>
                    <p className="mt-2 text-neutral-600">Lengkapi data diri Anda di bawah ini dengan benar. Tim kami akan segera menghubungi Anda.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">{renderSummary()}</div>
                <form onSubmit={handleFormSubmit}>
                    <fieldset className="border-none mb-5 p-0">
                        <legend className="text-xl font-semibold mb-5 pb-2.5 border-b border-slate-200 w-full">Data Pribadi</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div><label htmlFor="nama_lengkap" className={labelClass}>Nama Lengkap (sesuai KTP)</label><input type="text" id="nama_lengkap" name="nama_lengkap" className={inputClass('nama_lengkap')} value={formData.nama_lengkap} onChange={handleChange} onBlur={handleBlur} />{errors.nama_lengkap && <span className="text-red-600 text-sm mt-1.5">{errors.nama_lengkap}</span>}</div>
                            <div><label htmlFor="nik" className={labelClass}>Nomor Induk Kependudukan (NIK)</label><input type="text" id="nik" name="nik" className={inputClass('nik')} value={formData.nik} onChange={handleChange} onBlur={handleBlur} />{errors.nik && <span className="text-red-600 text-sm mt-1.5">{errors.nik}</span>}</div>
                            <div><label htmlFor="no_hp" className={labelClass}>Nomor Handphone (Aktif WhatsApp)</label><input type="tel" id="no_hp" name="no_hp" className={inputClass('no_hp')} value={formData.no_hp} onChange={handleChange} onBlur={handleBlur} />{errors.no_hp && <span className="text-red-600 text-sm mt-1.5">{errors.no_hp}</span>}</div>
                            <div><label htmlFor="email" className={labelClass}>Alamat Email</label><input type="email" id="email" name="email" className={inputClass('email')} value={formData.email} onChange={handleChange} onBlur={handleBlur} />{errors.email && <span className="text-red-600 text-sm mt-1.5">{errors.email}</span>}</div>
                            <div className="md:col-span-2"><label htmlFor="alamat" className={labelClass}>Alamat Lengkap (sesuai KTP)</label><textarea id="alamat" name="alamat" className={`${inputClass('alamat')} h-24`} rows={3} value={formData.alamat} onChange={handleChange} onBlur={handleBlur}></textarea>{errors.alamat && <span className="text-red-600 text-sm mt-1.5">{errors.alamat}</span>}</div>
                        </div>
                    </fieldset>
                    <div className="mt-8 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
                        <Link to="/pengajuan" className="text-sm text-primary hover:underline">&larr; Kembali & Pilih Kendaraan Lain</Link>
                        <button type="submit" className="w-full md:w-auto px-9 py-4 text-lg rounded-lg font-semibold bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover hover:-translate-y-0.5">Ajukan Sekarang via WhatsApp</button>
                    </div>
                </form>
            </div>
        </section>
    );
};

export default FormPengajuan;