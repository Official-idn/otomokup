import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Type definitions
interface Vehicle {
    id: string;
    merk: string;
    model: string;
    tipe?: string;
    warna?: string;
    tahun: string;
    cc?: string;
    transmisi?: string;
    lokasi?: string;
    harga: string;
    kategori: 'Mobil' | 'Motor';
    kondisi: 'Baru' | 'Bekas';
    created_at?: string;
    updated_at?: string;
}

// IndexedDB utilities for client-side data storage
class VehicleDB {
    private dbName: string;
    private version: number;
    private db: IDBDatabase | null;

    constructor() {
        this.dbName = 'VehicleAdminDB';
        this.version = 1;
        this.db = null;
    }

    async init(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            if (this.db) {
                return resolve(this.db);
            }
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains('vehicles')) {
                    const store = db.createObjectStore('vehicles', { keyPath: 'id' });
                    store.createIndex('merk', 'merk', { unique: false });
                    store.createIndex('kategori', 'kategori', { unique: false });
                    store.createIndex('kondisi', 'kondisi', { unique: false });
                }
                if (!db.objectStoreNames.contains('auth')) {
                    db.createObjectStore('auth', { keyPath: 'key' });
                }
            };
        });
    }

    async getAllVehicles(): Promise<Vehicle[]> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['vehicles'], 'readonly');
            const store = transaction.objectStore('vehicles');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addVehicle(vehicle: Vehicle): Promise<IDBValidKey> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['vehicles'], 'readwrite');
            const store = transaction.objectStore('vehicles');
            const request = store.add(vehicle);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateVehicle(vehicle: Vehicle): Promise<IDBValidKey> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['vehicles'], 'readwrite');
            const store = transaction.objectStore('vehicles');
            const request = store.put(vehicle);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteVehicle(id: string): Promise<void> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['vehicles'], 'readwrite');
            const store = transaction.objectStore('vehicles');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async clearAllVehicles(): Promise<void> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['vehicles'], 'readwrite');
            const store = transaction.objectStore('vehicles');
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async setAuthStatus(isAuthenticated: boolean): Promise<IDBValidKey> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['auth'], 'readwrite');
            const store = transaction.objectStore('auth');
            const request = store.put({ key: 'authenticated', value: isAuthenticated });

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAuthStatus(): Promise<boolean> {
        await this.init();
        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction(['auth'], 'readonly');
            const store = transaction.objectStore('auth');
            const request = store.get('authenticated');

            request.onsuccess = () => resolve(request.result?.value || false);
            request.onerror = () => reject(request.error);
        });
    }
}

// CSV Parser and Validator
class CSVProcessor {
    static parseCSV(csvText: string): { vehicles: Vehicle[], errors: string[] } {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            throw new Error('CSV file must have at least a header row and one data row');
        }

        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
        const expectedHeaders = ['merk', 'model', 'tipe', 'warna', 'tahun', 'cc', 'transmisi', 'lokasi', 'harga', 'kategori', 'kondisi'];

        // Check if headers match expected format
        const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
        if (missingHeaders.length > 0) {
            throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
        }

        const vehicles: Vehicle[] = [];
        const errors: string[] = [];

        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
                const vehicle: any = {};

                headers.forEach((header, index) => {
                    vehicle[header] = values[index] || '';
                });

                // Validate vehicle data
                const validationErrors = this.validateVehicle(vehicle);
                if (validationErrors.length > 0) {
                    errors.push(`Row ${i + 1}: ${validationErrors.join(', ')}`);
                    continue;
                }

                // Generate ID if not provided
                if (!vehicle.id) {
                    vehicle.id = `vehicle_${Date.now()}_${i}`;
                }

                // Add timestamps
                vehicle.created_at = new Date().toISOString();
                vehicle.updated_at = new Date().toISOString();

                vehicles.push(vehicle as Vehicle);
            } catch (error: any) {
                errors.push(`Row ${i + 1}: ${error.message}`);
            }
        }

        return { vehicles, errors };
    }

    static validateVehicle(vehicle: Partial<Vehicle>): string[] {
        const errors = [];

        if (!vehicle.merk?.trim()) errors.push('Merk is required');
        if (!vehicle.model?.trim()) errors.push('Model is required');
        if (!vehicle.tahun?.trim()) errors.push('Tahun is required');
        if (!vehicle.harga?.trim()) errors.push('Harga is required');
        if (!vehicle.kategori || !['Mobil', 'Motor'].includes(vehicle.kategori)) errors.push('Kategori must be Mobil or Motor');
        if (!vehicle.kondisi || !['Baru', 'Bekas'].includes(vehicle.kondisi)) errors.push('Kondisi must be Baru or Bekas');

        // Validate numeric fields
        if (vehicle.tahun && isNaN(Number(vehicle.tahun))) errors.push('Tahun must be a number');
        if (vehicle.harga && isNaN(Number(vehicle.harga.replace(/,/g, '')))) errors.push('Harga must be a number');

        return errors;
    }

    static generateCSVTemplate(): string {
        const headers = ['merk', 'model', 'tipe', 'warna', 'tahun', 'cc', 'transmisi', 'lokasi', 'harga', 'kategori', 'kondisi'];
        const sampleData = [
            ['Toyota', 'Avanza 1.5 G', 'MPV', 'Hitam', '2024', '1500', 'CVT', 'Jakarta', '255000000', 'Mobil', 'Baru'],
            ['Honda', 'PCX 160 ABS', 'Matic', 'Putih', '2024', '160', 'Automatic', 'Surabaya', '35000000', 'Motor', 'Baru'],
            ['Suzuki', 'Ertiga GX', 'MPV', 'Silver', '2024', '1500', 'Manual', 'Bandung', '240000000', 'Mobil', 'Baru']
        ];

        const csvContent = [
            headers.join(','),
            ...sampleData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    static exportToCSV(vehicles: Vehicle[]): string {
        if (vehicles.length === 0) {
            throw new Error('No data to export');
        }

        const headers = ['id', 'merk', 'model', 'tipe', 'warna', 'tahun', 'cc', 'transmisi', 'lokasi', 'harga', 'kategori', 'kondisi', 'created_at', 'updated_at'];
        const csvData = vehicles.map(vehicle => [
            vehicle.id,
            vehicle.merk,
            vehicle.model,
            vehicle.tipe || '',
            vehicle.warna || '',
            vehicle.tahun,
            vehicle.cc || '',
            vehicle.transmisi || '',
            vehicle.lokasi || '',
            vehicle.harga,
            vehicle.kategori,
            vehicle.kondisi,
            vehicle.created_at || new Date().toISOString(),
            vehicle.updated_at || new Date().toISOString()
        ]);

        const csvContent = [
            headers.join(','),
            ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        return csvContent;
    }
}

const Admin = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [loginError, setLoginError] = useState('');

    const [activeTab, setActiveTab] = useState('upload');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadCategory, setUploadCategory] = useState('');
    const [uploadStatus, setUploadStatus] = useState('');
    const [uploadErrors, setUploadErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Database and CSV processor instances
    const [vehicleDB] = useState(() => new VehicleDB());

    // Vehicle data management
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [singleVehicleForm, setSingleVehicleForm] = useState({
        merk: '',
        model: '',
        tipe: '',
        warna: '',
        tahun: '',
        cc: '',
        transmisi: '',
        lokasi: '',
        harga: '',
        kategori: '',
        kondisi: ''
    });
    const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

    // Check authentication status on component mount
    useEffect(() => {
        const checkAuth = () => {
            const userRole = sessionStorage.getItem('userRole');
            const isAdmin = userRole === 'admin';
            setIsAuthenticated(isAdmin);

            if (isAdmin) {
                // Load vehicles if authenticated
                loadVehicles();
            }
        };

        checkAuth();
    }, []);

    // Load vehicles from IndexedDB
    const loadVehicles = async () => {
        try {
            // FIX: getAllVehicles now correctly returns Vehicle[], resolving the type error.
            const vehiclesData = await vehicleDB.getAllVehicles();
            setVehicles(vehiclesData);
        } catch (error) {
            console.error('Error loading vehicles:', error);
        }
    };

    // Handle login form submission
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');

        // Simple authentication - in production, this should be replaced with proper API call
        if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
            sessionStorage.setItem('userRole', 'admin');
            setIsAuthenticated(true);
            loadVehicles(); // Load vehicles after successful login
        } else {
            setLoginError('Username atau password salah');
        }
    };

    // Handle logout
    const handleLogout = () => {
        sessionStorage.removeItem('userRole');
        setIsAuthenticated(false);
        setLoginForm({ username: '', password: '' });
        setLoginError('');
        setVehicles([]); // Clear vehicles data
    };

    // Handle login form input changes
    const handleLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginForm(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // Initialize dummy data
    useEffect(() => {
        if (isAuthenticated && vehicles.length === 0) {
            const dummyData: Vehicle[] = [
                {
                    id: 'dummy001',
                    merk: 'Toyota',
                    model: 'Avanza 1.5 G',
                    tipe: 'MPV',
                    warna: 'Hitam',
                    tahun: '2024',
                    cc: '1500',
                    transmisi: 'CVT',
                    lokasi: 'Jakarta',
                    harga: '255000000',
                    kategori: 'Mobil',
                    kondisi: 'Baru'
                },
                {
                    id: 'dummy002',
                    merk: 'Honda',
                    model: 'PCX 160 ABS',
                    tipe: 'Matic',
                    warna: 'Putih',
                    tahun: '2024',
                    cc: '160',
                    transmisi: 'Automatic',
                    lokasi: 'Surabaya',
                    harga: '35000000',
                    kategori: 'Motor',
                    kondisi: 'Baru'
                }
            ];
            setVehicles(dummyData);
        }
    }, [isAuthenticated, vehicles.length]);

    // CSV Template Download
    const downloadCSVTemplate = () => {
        const csvContent = CSVProcessor.generateCSVTemplate();
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'vehicle_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Single vehicle form handlers
    const handleSingleVehicleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSingleVehicleForm(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateSingleVehicleForm = () => {
        const errors: {[key: string]: string} = {};

        if (!singleVehicleForm.merk.trim()) errors.merk = 'Merk wajib diisi';
        if (!singleVehicleForm.model.trim()) errors.model = 'Model wajib diisi';
        if (!singleVehicleForm.tipe.trim()) errors.tipe = 'Tipe wajib diisi';
        if (!singleVehicleForm.tahun.trim()) errors.tahun = 'Tahun wajib diisi';
        if (!singleVehicleForm.harga.trim()) errors.harga = 'Harga wajib diisi';
        if (!singleVehicleForm.kategori) errors.kategori = 'Kategori wajib dipilih';
        if (!singleVehicleForm.kondisi) errors.kondisi = 'Kondisi wajib dipilih';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddSingleVehicle = async () => {
        if (!validateSingleVehicleForm()) return;

        try {
            const newVehicle: Vehicle = {
                id: `vehicle_${Date.now()}`,
                ...singleVehicleForm,
                kategori: singleVehicleForm.kategori as 'Mobil' | 'Motor',
                kondisi: singleVehicleForm.kondisi as 'Baru' | 'Bekas',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            await vehicleDB.addVehicle(newVehicle);
            await loadVehicles();

            setSingleVehicleForm({
                merk: '',
                model: '',
                tipe: '',
                warna: '',
                tahun: '',
                cc: '',
                transmisi: '',
                lokasi: '',
                harga: '',
                kategori: '',
                kondisi: ''
            });

            alert('Data kendaraan berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding vehicle:', error);
            alert('Terjadi kesalahan saat menambahkan data');
        }
    };

    // Edit vehicle handlers
    const handleEditVehicle = (vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setSingleVehicleForm({
            merk: vehicle.merk,
            model: vehicle.model,
            tipe: vehicle.tipe || '',
            warna: vehicle.warna || '',
            tahun: vehicle.tahun,
            cc: vehicle.cc || '',
            transmisi: vehicle.transmisi || '',
            lokasi: vehicle.lokasi || '',
            harga: vehicle.harga,
            kategori: vehicle.kategori,
            kondisi: vehicle.kondisi
        });
        setActiveTab('add-single');
    };

    const handleUpdateVehicle = async () => {
        if (!editingVehicle || !validateSingleVehicleForm()) return;

        try {
            const updatedVehicle: Vehicle = {
                ...editingVehicle,
                ...singleVehicleForm,
                kategori: singleVehicleForm.kategori as 'Mobil' | 'Motor',
                kondisi: singleVehicleForm.kondisi as 'Baru' | 'Bekas',
                updated_at: new Date().toISOString()
            };

            await vehicleDB.updateVehicle(updatedVehicle);
            await loadVehicles();

            setEditingVehicle(null);
            setSingleVehicleForm({
                merk: '',
                model: '',
                tipe: '',
                warna: '',
                tahun: '',
                cc: '',
                transmisi: '',
                lokasi: '',
                harga: '',
                kategori: '',
                kondisi: ''
            });

            alert('Data kendaraan berhasil diperbarui!');
            setActiveTab('view-edit');
        } catch (error) {
            console.error('Error updating vehicle:', error);
            alert('Terjadi kesalahan saat memperbarui data');
        }
    };

    const handleDeleteVehicle = async (vehicleId: string) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus data kendaraan ini?')) {
            return;
        }

        try {
            await vehicleDB.deleteVehicle(vehicleId);
            await loadVehicles();
            alert('Data kendaraan berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            alert('Terjadi kesalahan saat menghapus data');
        }
    };

    const handleCancelEdit = () => {
        setEditingVehicle(null);
        setSingleVehicleForm({
            merk: '',
            model: '',
            tipe: '',
            warna: '',
            tahun: '',
            cc: '',
            transmisi: '',
            lokasi: '',
            harga: '',
            kategori: '',
            kondisi: ''
        });
        setFormErrors({});
        setActiveTab('view-edit');
    };

    // Export data to CSV
    const handleExportData = () => {
        try {
            if (vehicles.length === 0) {
                alert('Tidak ada data untuk diekspor');
                return;
            }

            // FIX: Accessed static method 'exportToCSV' on the class 'CSVProcessor' directly.
            const csvContent = CSVProcessor.exportToCSV(vehicles);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `vehicle_data_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            alert('Data berhasil diekspor ke CSV!');
        } catch (error: any) {
            console.error('Error exporting data:', error);
            alert(`Terjadi kesalahan saat mengekspor data: ${error.message}`);
        }
    };

    // Clear all data
    const handleClearAllData = async () => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus SEMUA data kendaraan? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        try {
            await vehicleDB.clearAllVehicles();
            await loadVehicles();
            alert('Semua data kendaraan berhasil dihapus!');
        } catch (error) {
            console.error('Error clearing data:', error);
            alert('Terjadi kesalahan saat menghapus data');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
        } else {
            setSelectedFile(null);
        }
    };

    const handleUploadClick = async () => {
        if (!selectedFile) {
            setUploadStatus('error');
            setUploadErrors(['Pilih file CSV terlebih dahulu']);
            return;
        }

        setUploadStatus('processing');
        setUploadErrors([]);

        try {
            const csvText = await selectedFile.text();
            // FIX: Accessed static method 'parseCSV' on the class 'CSVProcessor' directly.
            const { vehicles: parsedVehicles, errors } = CSVProcessor.parseCSV(csvText);

            if (errors.length > 0) {
                setUploadStatus('error');
                setUploadErrors(errors);
                return;
            }

            // Filter vehicles by category if specified
            let vehiclesToAdd = parsedVehicles;
            if (uploadCategory) {
                vehiclesToAdd = parsedVehicles.filter(vehicle => {
                    if (uploadCategory === 'mobil-baru') {
                        return vehicle.kategori === 'Mobil' && vehicle.kondisi === 'Baru';
                    } else if (uploadCategory === 'mobil-bekas') {
                        return vehicle.kategori === 'Mobil' && vehicle.kondisi === 'Bekas';
                    } else if (uploadCategory === 'motor-baru') {
                        return vehicle.kategori === 'Motor' && vehicle.kondisi === 'Baru';
                    } else if (uploadCategory === 'motor-bekas') {
                        return vehicle.kategori === 'Motor' && vehicle.kondisi === 'Bekas';
                    }
                    return true;
                });
            }

            // Add vehicles to database
            for (const vehicle of vehiclesToAdd) {
                try {
                    await vehicleDB.addVehicle(vehicle);
                } catch (error) {
                    console.error('Error adding vehicle:', error);
                }
            }

            // Reload vehicles
            await loadVehicles();

            setUploadStatus('success');
            setSelectedFile(null);
            setUploadCategory('');
            if (fileInputRef.current) fileInputRef.current.value = "";

            setTimeout(() => setUploadStatus(''), 3000);

        } catch (error: any) {
            console.error('Error processing CSV:', error);
            setUploadStatus('error');
            setUploadErrors([`Terjadi kesalahan saat memproses file CSV: ${error.message}`]);
        }
    };

    const tabButtonClass = (tabName: string) => 
        `py-4 px-6 border-b-2 font-medium transition-colors ${activeTab === tabName ? 'border-primary text-primary' : 'border-transparent text-neutral-500 hover:text-primary'}`;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upload':
                return (
                    <>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h4 className="text-xl font-bold">Upload Data Kendaraan via CSV</h4>
                                <p className="text-neutral-600 mt-1">Pilih kategori, lalu pilih file .csv yang berisi data kendaraan untuk diimpor ke dalam sistem.</p>
                            </div>
                            <button
                                onClick={downloadCSVTemplate}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7,10 12,15 17,10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Download Template CSV
                            </button>
                        </div>
                        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 my-5 flex flex-col items-start gap-5 bg-slate-50 transition-colors hover:bg-slate-100 hover:border-primary">
                            <div className="w-full">
                                <label htmlFor="upload-category" className="font-medium mb-2 block">1. Pilih Kategori Produk</label>
                                <select
                                    id="upload-category"
                                    value={uploadCategory}
                                    onChange={(e) => setUploadCategory(e.target.value)}
                                    className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                    title="Pilih kategori produk"
                                >
                                    <option value="" disabled>-- Pilih Kategori --</option>
                                    <option value="mobil-baru">Mobil Baru</option>
                                    <option value="mobil-bekas">Mobil Bekas</option>
                                    <option value="motor-baru">Motor Baru</option>
                                    <option value="motor-bekas">Motor Bekas</option>
                                </select>
                            </div>
                            <div className="w-full">
                                <label className="font-medium mb-2 block">2. Pilih File CSV</label>
                                <div className="flex items-center gap-5 w-full">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept=".csv"
                                        className="hidden"
                                        id="csv-upload-input"
                                        title="Pilih file CSV"
                                    />
                                    <button
                                        className="px-5 py-2.5 rounded-lg font-semibold bg-white text-primary border-2 border-slate-200 hover:bg-slate-100"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        Pilih File
                                    </button>
                                    <span className="italic text-neutral-500">
                                        {selectedFile ? selectedFile.name : "Tidak ada file yang dipilih"}
                                    </span>
                                </div>
                            </div>

                            {/* Upload Status */}
                            {uploadStatus && (
                                <div className={`w-full p-4 rounded-lg ${
                                    uploadStatus === 'success'
                                        ? 'bg-green-50 border border-green-200 text-green-800'
                                        : uploadStatus === 'error'
                                        ? 'bg-red-50 border border-red-200 text-red-800'
                                        : 'bg-blue-50 border border-blue-200 text-blue-800'
                                }`}>
                                    <div className="flex items-center gap-2">
                                        {uploadStatus === 'processing' && (
                                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                        )}
                                        <span className="font-medium">
                                            {uploadStatus === 'success' && '✅ Upload Berhasil!'}
                                            {uploadStatus === 'error' && '❌ Upload Gagal'}
                                            {uploadStatus === 'processing' && '⏳ Memproses...'}
                                        </span>
                                    </div>
                                    {uploadErrors.length > 0 && (
                                        <ul className="mt-2 text-sm list-disc list-inside">
                                            {uploadErrors.map((error, index) => (
                                                <li key={index}>{error}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-between items-center">
                            <button
                                onClick={handleExportData}
                                className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-2"
                                disabled={vehicles.length === 0}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                    <polyline points="7,10 12,15 17,10"></polyline>
                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                </svg>
                                Export Data ({vehicles.length} records)
                            </button>

                            <button
                                onClick={handleUploadClick}
                                disabled={!selectedFile || uploadStatus === 'processing'}
                                className="px-7 py-3 rounded-lg font-semibold bg-primary text-white disabled:bg-slate-400 disabled:cursor-not-allowed hover:bg-primary-hover transition-colors"
                            >
                                {uploadStatus === 'processing' ? 'Memproses...' : 'Upload File'}
                            </button>
                        </div>
                    </>
                );
            case 'add-single':
                return (
                    <>
                        <h4 className="text-xl font-bold mb-4">
                            {editingVehicle ? 'Edit Data Kendaraan' : 'Tambah Data Kendaraan Tunggal'}
                        </h4>
                        <p className="text-neutral-600 mb-6">
                            {editingVehicle ? 'Edit detail kendaraan di bawah ini.' : 'Isi formulir di bawah ini untuk menambahkan data kendaraan baru.'}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="font-medium mb-2 block">Merk *</label>
                                <input
                                    type="text"
                                    name="merk"
                                    value={singleVehicleForm.merk}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.merk ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="Contoh: Toyota"
                                />
                                {formErrors.merk && <p className="text-red-500 text-sm mt-1">{formErrors.merk}</p>}
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Model *</label>
                                <input
                                    type="text"
                                    name="model"
                                    value={singleVehicleForm.model}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.model ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="Contoh: Avanza 1.5 G"
                                />
                                {formErrors.model && <p className="text-red-500 text-sm mt-1">{formErrors.model}</p>}
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Tipe *</label>
                                <input
                                    type="text"
                                    name="tipe"
                                    value={singleVehicleForm.tipe}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.tipe ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="Contoh: MPV"
                                />
                                {formErrors.tipe && <p className="text-red-500 text-sm mt-1">{formErrors.tipe}</p>}
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Warna</label>
                                <input
                                    type="text"
                                    name="warna"
                                    value={singleVehicleForm.warna}
                                    onChange={handleSingleVehicleInputChange}
                                    className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Contoh: Hitam"
                                />
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Tahun *</label>
                                <input
                                    type="text"
                                    name="tahun"
                                    value={singleVehicleForm.tahun}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.tahun ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="Contoh: 2024"
                                />
                                {formErrors.tahun && <p className="text-red-500 text-sm mt-1">{formErrors.tahun}</p>}
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">CC</label>
                                <input
                                    type="text"
                                    name="cc"
                                    value={singleVehicleForm.cc}
                                    onChange={handleSingleVehicleInputChange}
                                    className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Contoh: 1500"
                                />
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Transmisi</label>
                                <select
                                    name="transmisi"
                                    value={singleVehicleForm.transmisi}
                                    onChange={handleSingleVehicleInputChange}
                                    className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="">Pilih Transmisi</option>
                                    <option value="Manual">Manual</option>
                                    <option value="Automatic">Automatic</option>
                                    <option value="CVT">CVT</option>
                                </select>
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Lokasi</label>
                                <input
                                    type="text"
                                    name="lokasi"
                                    value={singleVehicleForm.lokasi}
                                    onChange={handleSingleVehicleInputChange}
                                    className="w-full p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="Contoh: Jakarta"
                                />
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Harga *</label>
                                <input
                                    type="text"
                                    name="harga"
                                    value={singleVehicleForm.harga}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.harga ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                    placeholder="Contoh: 255000000"
                                />
                                {formErrors.harga && <p className="text-red-500 text-sm mt-1">{formErrors.harga}</p>}
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Kategori *</label>
                                <select
                                    name="kategori"
                                    value={singleVehicleForm.kategori}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.kategori ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="Mobil">Mobil</option>
                                    <option value="Motor">Motor</option>
                                </select>
                                {formErrors.kategori && <p className="text-red-500 text-sm mt-1">{formErrors.kategori}</p>}
                            </div>

                            <div>
                                <label className="font-medium mb-2 block">Kondisi *</label>
                                <select
                                    name="kondisi"
                                    value={singleVehicleForm.kondisi}
                                    onChange={handleSingleVehicleInputChange}
                                    className={`w-full p-3 rounded-lg border ${formErrors.kondisi ? 'border-red-500' : 'border-slate-300'} focus:outline-none focus:ring-2 focus:ring-primary`}
                                >
                                    <option value="">Pilih Kondisi</option>
                                    <option value="Baru">Baru</option>
                                    <option value="Bekas">Bekas</option>
                                </select>
                                {formErrors.kondisi && <p className="text-red-500 text-sm mt-1">{formErrors.kondisi}</p>}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            {editingVehicle && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="px-6 py-3 rounded-lg font-semibold bg-slate-500 text-white hover:bg-slate-600 transition-colors"
                                >
                                    Batal
                                </button>
                            )}
                            <button
                                onClick={editingVehicle ? handleUpdateVehicle : handleAddSingleVehicle}
                                className="px-6 py-3 rounded-lg font-semibold bg-primary text-white hover:bg-primary-hover transition-colors"
                            >
                                {editingVehicle ? 'Update Data' : 'Tambah Data'}
                            </button>
                        </div>
                    </>
                );
            case 'view-edit':
                return (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h4 className="text-xl font-bold">Lihat & Edit Data Kendaraan</h4>
                                <p className="text-neutral-600 mt-1">Kelola data kendaraan yang ada dalam sistem.</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-sm text-neutral-500">
                                    Total: {vehicles.length} data
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleExportData}
                                        className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center gap-1"
                                        disabled={vehicles.length === 0}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                            <polyline points="7,10 12,15 17,10"></polyline>
                                            <line x1="12" y1="15" x2="12" y2="3"></line>
                                        </svg>
                                        Export
                                    </button>
                                    <button
                                        onClick={handleClearAllData}
                                        className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                                        disabled={vehicles.length === 0}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="3,6 5,6 21,6"></polyline>
                                            <path d="M19,6V20a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                        </svg>
                                        Clear All
                                    </button>
                                </div>
                            </div>
                        </div>

                        {vehicles.length === 0 ? (
                            <div className="text-center py-10 text-neutral-500">
                                <p>Belum ada data kendaraan. Tambahkan data melalui tab "Tambah Data" atau upload CSV.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-slate-200">
                                    <thead>
                                        <tr className="bg-slate-100">
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Merk</th>
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Model</th>
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Tipe</th>
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Tahun</th>
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Kategori</th>
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Kondisi</th>
                                            <th className="border border-slate-200 p-3 text-left font-semibold">Harga</th>
                                            <th className="border border-slate-200 p-3 text-center font-semibold">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {vehicles.map((vehicle, index) => (
                                            <tr key={vehicle.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                                <td className="border border-slate-200 p-3">{vehicle.merk}</td>
                                                <td className="border border-slate-200 p-3">{vehicle.model}</td>
                                                <td className="border border-slate-200 p-3">{vehicle.tipe}</td>
                                                <td className="border border-slate-200 p-3">{vehicle.tahun}</td>
                                                <td className="border border-slate-200 p-3">{vehicle.kategori}</td>
                                                <td className="border border-slate-200 p-3">{vehicle.kondisi}</td>
                                                <td className="border border-slate-200 p-3">
                                                    Rp {parseInt(vehicle.harga, 10).toLocaleString('id-ID')}
                                                </td>
                                                <td className="border border-slate-200 p-3 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleEditVehicle(vehicle)}
                                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteVehicle(vehicle.id)}
                                                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                                        >
                                                            Hapus
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                );
            default:
                return null;
        }
    };

    // Show login form if not authenticated
    if (!isAuthenticated) {
        return (
            <main className="bg-slate-100 min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                    <h1 className="text-center text-3xl font-bold mb-2">Admin Login</h1>
                    <p className="text-center text-neutral-500 mb-8">Masukkan kredensial untuk mengakses panel admin</p>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={loginForm.username}
                                onChange={handleLoginInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Masukkan username"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={loginForm.password}
                                onChange={handleLoginInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Masukkan password"
                                required
                            />
                        </div>

                        {loginError && (
                            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                                {loginError}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
                        >
                            Login
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm text-neutral-500">
                        <p>Demo credentials:</p>
                        <p>Username: <strong>admin</strong></p>
                        <p>Password: <strong>admin123</strong></p>
                    </div>
                </div>
            </main>
        );
    }

    // Show admin panel if authenticated
    return (
        <main className="bg-slate-100 min-h-screen">
            <section className="py-16">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold">Admin Control Panel</h1>
                            <p className="text-neutral-500 mt-1">Kelola data kendaraan untuk website danuferd-mockup</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="flex justify-center border-b-2 border-slate-200">
                        <button className={tabButtonClass('upload')} onClick={() => setActiveTab('upload')}>Upload CSV</button>
                        <button className={tabButtonClass('add-single')} onClick={() => setActiveTab('add-single')}>Tambah Data</button>
                        <button className={tabButtonClass('view-edit')} onClick={() => setActiveTab('view-edit')}>Lihat & Edit</button>
                    </div>

                    <div className="bg-white rounded-b-lg shadow-md p-8 min-h-[300px]">
                        {renderTabContent()}
                    </div>
                </div>
            </section>
        </main>
    );
};

export default Admin;