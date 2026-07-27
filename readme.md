Berikut adalah draf dokumentasi **README.md** yang lengkap, rapi, dan profesional untuk proyek aplikasi web ini:

---

# 📊 Dashboard Jurnal Ke COA - Alpine.js Edition

Aplikasi web _standalone_ (client-side) yang dirancang untuk mengolah, memetakan (_mapping_), dan menormalisasi data jurnal keuangan dari file Excel ke dalam **Chart of Accounts (COA)** resmi Mahad Ibnu Taimiyah Bogor.

Aplikasi ini juga dilengkapi fitur pembuatan **Payload AutoHotkey (AHK)** otomatis untuk mempercepat integrasi/input data ke aplikasi akuntansi internal.

---

## 🚀 Fitur Utama

- ** parsing Excel Fleksibel (`.xlsx`, `.xls`)**: Menggunakan SheetJS untuk membaca sheet `Jurnal` atau sheet utama secara otomatis, menoleransi variasi baris header.
- ** Normalisasi Data Otomatis**:
  - Mengubah format angka/mata uang Indonesia (Rp, titik/koma, minus dalam kurung) menjadi nilai numerik yang presisi.
  - Menormalisasi penamaan **Kas/Bank** (Bank BSI, Bank Muamalat, Kas Besar, Kas Kecil).
  - Mengonversi format tanggal otomatis.
- ** Mapping COA Pintar & Dinamis**:
  - Menyesuaikan kode & pos lama (seperti `A11`-`A28`, `B11`-`B31`) ke COA resmi.
  - **Aturan Dinamis**: Deteksi otomatis kata kunci pada Uraian untuk pos _Uang Tahunan_ dan _Dana Titip_.
  - Aturan khusus (misal: Biaya Administrasi Muamalat otomatis ke _Pendapatan Fee VA Bank_).
  - Penanganan khusus untuk Uang Muka minus dan Penerimaan Lain-lain.
- ** Filter & Pencarian Real-Time**:
  - Filter berdasarkan **Tanggal Transaksi**.
  - Filter berdasarkan **Kas / Bank**.
  - Kolom pencarian serbaguna (_search bar_) untuk uraian, nama, dan pos.
- ** Integrasi AutoHotkey (AHK Payload Generator)**:
  - Tombol **Aksi** pada baris tabel akan secara otomatis menyalin (_copy to clipboard_) _payload_ string berformat pipa (`|`) untuk dibaca oleh script otomasi AHK.
- ** Penanda Baris Interaktif**:
  - Checkbox penanda baris (highlight warna kuning) untuk menandai transaksi yang sudah/akan diproses.
- ** Modal Setting Pos Rules**: View interaktif untuk melihat daftar aturan _mapping_ konstan yang diterapkan aplikasi.
- ** Standalone & Ringan**: Berjalan 100% di browser tanpa membutuhkan backend / server web khusus.

---

## 🛠️ Teknologi yang Digunakan

| Teknologi                                    | Fungsi                                                  |
| :------------------------------------------- | :------------------------------------------------------ |
| **HTML5 & JavaScript (ES6+)**                | Struktur inti & logika aplikasi                         |
| **[Alpine.js (v3)](https://alpinejs.dev/)**  | Framework JavaScript reaktif & deklaratif               |
| **[Tailwind CSS](https://tailwindcss.com/)** | Framework CSS utility-first untuk UI modern & responsif |
| **[SheetJS (xlsx)](https://sheetjs.com/)**   | Parsing file Excel langsung di browser                  |
| **Google Fonts (Inter)**                     | Tipografi antarmuka                                     |

---

## ⚙️ Format Payload AutoHotkey (AHK)

Saat tombol **Aksi** pada salah satu baris diklik, aplikasi akan menghasilkan string berformat khusus dan menyalinnya ke _clipboard_:

```text
TGL|KETERANGAN|BANK_NAME|BANK_TYPE|POS_NAME|POS_TYPE|AMOUNT
```

### Contoh Hasil Output Clipboard:

```text
25/07/2026|Pembayaran SPP Santri - Ahmad|BSI|DEBIT|421010101 - Pendapatan IWS (Infaq Wali-Santri/Murid)|KREDIT|500000
```

### Logika Tipe Transaksi (Debet / Kredit):

- **Jika Excel Debet > 0**: `BANK_TYPE = DEBIT`, `POS_TYPE = KREDIT`, `AMOUNT = Debet`
- **Jika Excel Kredit > 0**: `BANK_TYPE = KREDIT`, `POS_TYPE = DEBIT`, `AMOUNT = Kredit`

---

## 📌 Ringkasan Mapping Kode & Pos

| Kode                                   | Pos Lama                        | Target COA Resmi / Logika                                     |
| :------------------------------------- | :------------------------------ | :------------------------------------------------------------ |
| **A11**                                | Penerimaan Dari Yys Lajnah      | `423010102 - Pendapatan Bantuan-Sumbangan dan Lainnya`        |
| **A12**                                | Penerimaan SPP Santri Non Yatim | `421010101 - Pendapatan IWS (Infaq Wali-Santri/Murid)`        |
| **A13**                                | Sisa Dari Anggaran              | `423010105 - Pendapatan Lain`                                 |
| **A14**                                | Penerimaan Bos                  | `422010101 - Pendapatan Dana BOS`                             |
| **A16**                                | Penerimaan Bagi Hasil Bank      | `611010104 - Pendapatan Administrasi Bank`                    |
| **A23**                                | Uang Tahunan                    | _Dinamis berdasarkan uraian (Pembangunan, PSB, Seragam, dll)_ |
| **A26**                                | Dana Titip                      | _Dinamis berdasarkan uraian (Pegawai, Santri/Saku, Tabungan)_ |
| **A27 / B23**                          | Piutang Guru & Karyawan         | `112030102 - Piutang Pegawai`                                 |
| **A28**                                | Penerimaan Lain-lain            | _(Dikosongkan / Unmatched)_                                   |
| **B11**                                | Mukafaah                        | `521010101 - Beban Mukafaah Markaz`                           |
| **B12 - B15, B17 - B110, B118 - B120** | Beban Operasional / Bidang      | `521010110 - Beban Operasional Markaz`                        |
| **B16**                                | Konsumsi                        | `521010113 - Beban Belanja Dapur Markaz`                      |
| **B111**                               | Bea Tagihan Listrik             | `521010107 - Beban Listrik-Air-Gas Markaz`                    |
| **B115 / B24**                         | Uang Muka / Kas Bon             | `113020102 - Uang Muka Markaz` _(Jika minus, dikosongkan)_    |
| **B22**                                | Pelaksanaan Acara               | `521010126 - Beban Kegiatan-Program`                          |

---

## 📖 Cara Penggunaan

1. **Unduh / Clones Repository**:
   Unduh file `index.html` dari repositori ini.
2. **Buka Aplikasi**:
   Klik 2x pada file `index.html` untuk memburunya di peramban web (_browser_) seperti Google Chrome, Mozilla Firefox, Microsoft Edge, atau Brave.
3. **Upload File Excel**:
   - Drag & drop file Excel jurnal Anda ke area _dropzone_, atau klik area tersebut untuk memilih file.
   - Pastikan sheet yang diunggah bernama **Jurnal** (atau sheet pertama di workbook).
4. **Filter & Cari Data**:
   - Gunakan filter dropdown **Tanggal** atau **Kas/Bank** untuk memperkecil cakupan data.
   - Gunakan _Search Box_ untuk mencari keyword tertentu.
5. **Eksekusi AHK Payload**:
   - Klik tombol **Aksi** pada baris transaksi yang valid.
   - String AHK akan otomatis tersalin ke clipboard dan siap digunakan oleh script AutoHotkey Anda.
6. **Ganti File**:
   - Klik tombol **Ganti File** di pojok kanan atas toolbar untuk mengunggah file jurnal Excel baru.

---

## 👥 Hak Cipta & Lisensi

**Mahad Ibnu Taimiyah Bogor** &copy; 2026. All rights reserved.  
Dikembangkan untuk kebutuhan manajemen internal akuntansi & keuangan Mahad Ibnu Taimiyah Bogor.
