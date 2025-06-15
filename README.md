🫘 BeansHub – Aplikasi Manajemen Roastery Terintegrasi
BeansHub adalah platform digital cerdas untuk membantu coffee house roastery kecil-menengah dalam mengelola seluruh proses bisnis — dari pengadaan green bean, proses roasting, hingga penjualan dan pelaporan keuangan, secara otomatis dan real-time.

🔒 Teknologi Inti
Database: Firestore (Cloud Firestore – NoSQL realtime database dari Google)

Authentication: Google Sign-In / Firebase Authentication

Arsitektur: Modular, terintegrasi otomatis antar fitur

Real-Time Update: Setiap perubahan data langsung tercermin di seluruh sistem

🎯 Modul Utama & Alur Terintegrasi
1. Modul Manajemen Stok Bahan Baku (Green Bean)
Tujuan: Memastikan ketersediaan stok bahan baku secara akurat.

Fitur:
Pencatatan Masuk Green Bean

Input: Nama pemasok, jenis biji, kuantitas (kg), harga beli/kg, tanggal masuk

Stok Real-time

Monitoring jumlah stok green bean per jenis

Riwayat Pergerakan Stok

Lacak penggunaan untuk proses roasting

2. Modul Roasting
Tujuan: Mengelola proses roasting dengan efisiensi dan akurasi stok.

Fitur:
Input Roasting

Pilih green bean dari stok

Masukkan jumlah (kg)

Pilih Profil Roasting dari modul Log

Kalkulasi Penyusutan Otomatis

Formula default: Penyusutan 20%

Contoh: 10 kg → 8 kg roasted bean

Update Otomatis Stok

Green bean berkurang, roasted bean bertambah

3. Modul Log & Profil Roasting
Tujuan: Menstandarkan dan melacak proses roasting.

Fitur:
Manajemen Profil Roasting

Buat/edit profil: nama, kurva suhu, durasi, catatan

Log Roasting Otomatis

Diisi langsung setiap sesi dari Modul Roasting

Data: tanggal, jenis green bean, kuantitas awal & akhir, profil, catatan

Riwayat & Analisis

Tampilkan performa roasting secara historis

4. Modul Estimasi Harga Jual
Tujuan: Memberikan kontrol penuh terhadap perhitungan HPP & harga jual.

Fitur:
HPP Green Bean: Diambil dari harga beli per kg

HPP Roasted Bean:

Formula:
(Harga Beli / 0.8) + Biaya Operasional/kg

Input manual biaya roasting (gas, listrik, tenaga kerja)

Estimasi Harga Jual

Tambah margin keuntungan (persentase)

Output: Rekomendasi harga jual roasted bean per kg

5. Modul Manajemen Penjualan
Tujuan: Mendata penjualan dan pergerakan stok hasil produk.

Fitur:
Pencatatan Transaksi Penjualan

Produk: roasted / green bean

Detail: jenis, kuantitas, harga jual/kg, tanggal, metode bayar

Update Stok Otomatis

Stok dikurangi sesuai produk yang terjual

Data Pelanggan (Opsional)

Simpan nama & histori pelanggan

6. Modul Laporan Keuangan
Tujuan: Menyajikan kinerja bisnis secara menyeluruh.

Fitur:
Laporan Laba Rugi

Pendapatan: dari penjualan

HPP: dari HPP produk yang dijual

Biaya Operasional: termasuk biaya roasting atau input manual

Laba Bersih

Arus Kas

Kas Masuk: dari penjualan

Kas Keluar: pembelian bahan, operasional

Neraca Usaha

Aset: stok & kas

Kewajiban & ekuitas

⚙️ Alur Integrasi Otomatis (Sirkulasi Data)
Stok Green Bean Masuk → Modul Roasting

Roasting → Otomatis update stok roasted bean + Log roasting

Hasil Roasting → Dihitung HPP → Estimasi Harga Jual

Penjualan → Kurangi stok + Catat pemasukan → Masuk ke laporan keuangan

Semua data → Otomatis muncul dalam Laporan Keuangan & Analisis

🚀 Keunggulan BeansHub
Realtime & Otomatis: Minim kesalahan input manual

Fleksibel: Bisa diakses oleh roastery kecil dengan 1 roaster, maupun bisnis yang mulai berkembang

Berbasis Cloud: Aman, scalable, dan efisien

User-friendly: UI/UX disederhanakan untuk operasional harian
