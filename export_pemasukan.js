// File: export_excel.js

function downloadExcelJurnal(filteredData) {
    if (!filteredData || filteredData.length === 0) {
        alert("Tidak ada data untuk diexport!");
        return;
    }

    // 1. URUTKAN DATA (Sorting berdasarkan tanggal secara kronologis)
    const sortedData = [...filteredData].sort((a, b) => a.dateObj - b.dateObj);

    const ws_data = [];

    // 2. Tambahkan baris Header
    ws_data.push([
        "Tanggal", 
        "Uraian Jurnal", 
        "Kode Akun", 
        "Nama Akun", 
        "Posisi", 
        "Debit", 
        "Kredit"
    ]);

    // Fungsi Bantuan: Untuk memecah teks "Kode - Nama"
    function splitAkun(akunStr) {
        if (!akunStr) return { kode: "", nama: "" };
        
        const parts = akunStr.split(" - ");
        if (parts.length > 1) {
            const kode = parts[0].trim();
            const nama = parts.slice(1).join(" - ").trim();
            return { kode, nama };
        }
        
        return { kode: "", nama: akunStr.trim() };
    }

    // 3. Mapping Hardcode untuk Kas dan Bank
    const bankMapping = {
        "Kas Kecil": { kode: "111010201", nama: "Kas Kecil Mahad Ibnu Taimiyah" },
        "Kas Besar": { kode: "111010202", nama: "Kas Besar Mahad Ibnu Taimiyah" },
        "BSI":       { kode: "111020201", nama: "BSI" },
        "Muamalat":  { kode: "111020202", nama: "Muamalat" }
    };

    // 4. Looping data
    sortedData.forEach(item => {
        
        // Ambil nominal absolut (menghilangkan tanda minus jika ada)
        const nominal = Math.abs(item.totalPenerimaan);
        
        // Cek apakah transaksinya minus (koreksi/refund)
        const isMinus = item.totalPenerimaan < 0;
        
        const akunBank = bankMapping[item.kasBank] ? bankMapping[item.kasBank] : splitAkun(item.kasBank);
        const akunCOA = splitAkun(item.coaBaru);

        // Jika Transaksi NORMAL (Uang Masuk / Positif)
        if (!isMinus) {
            // Baris 1: Bank di posisi DEBIT
            ws_data.push([
                item.tglFormatted, item.uraianJurnal, 
                akunBank.kode, akunBank.nama, "DEBIT", nominal, 0
            ]);

            // Baris 2: Pendapatan (COA) di posisi KREDIT
            ws_data.push([
                item.tglFormatted, item.uraianJurnal, 
                akunCOA.kode, akunCOA.nama, "KREDIT", 0, nominal
            ]);
        } 
        // Jika Transaksi MINUS (Koreksi / Refund)
        else {
            // Baris 1: Pendapatan (COA) pindah ke DEBIT
            ws_data.push([
                item.tglFormatted, item.uraianJurnal + " (Koreksi)", 
                akunCOA.kode, akunCOA.nama, "DEBIT", nominal, 0
            ]);

            // Baris 2: Bank pindah ke KREDIT (Karena uang keluar)
            ws_data.push([
                item.tglFormatted, item.uraianJurnal + " (Koreksi)", 
                akunBank.kode, akunBank.nama, "KREDIT", 0, nominal
            ]);
        }
    });

    // 5. Konversi array of array menjadi Worksheet
    const ws = XLSX.utils.aoa_to_sheet(ws_data);

    // Atur lebar kolom agar rapi di Excel
    ws['!cols'] = [
        { wch: 12 }, // A: Tanggal
        { wch: 55 }, // B: Uraian Jurnal
        { wch: 15 }, // C: Kode Akun
        { wch: 35 }, // D: Nama Akun
        { wch: 10 }, // E: Posisi
        { wch: 15 }, // F: Debit
        { wch: 15 }  // G: Kredit
    ];

    // 6. Buat Workbook dan download file
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Jurnal Upload");

    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Format_Upload_Jurnal_${dateStr}.xlsx`);
}