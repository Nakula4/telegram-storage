# 🤖 Telegram Storage (Cloudflare Workers)

Bot Telegram cerdas berbasis **Cloudflare Workers** untuk menyortir file masuk (Gambar, Video, Dokumen) ke dalam forum topik/thread secara otomatis, lengkap dengan fitur **Auto-Tagging tanggal berbasis WIB** dan **Statistik Permanen (Cloudflare KV)**.

---

## ✨ Fitur Utama
* **Penyortiran Otomatis:** Memindahkan file dari ruang *General* ke topik khusus Gambar, Video, atau Dokumen secara *real-time*.
* **Auto-Tagging Tanggal:** Otomatis menambahkan tag berformat `#Gambar #02Agustus2026` di bawah file (aman jika ada *caption* asli).
* **Auto-Cleanup:** Menghapus pesan file asli di ruangan utama agar *chat* tetap bersih, serta otomatis menghapus pesan laporan bot setelah 3 detik.
* **Statistik Permanen (`/status`):** Menghitung jumlah file yang tersortir menggunakan Cloudflare KV.
* **Perintah Cek ID (`/cek`):** Mengetahui ID Grup dan ID Topik ruangan dengan mudah.

---

## 🚀 Panduan Instalasi (Deploy ke Cloudflare)

### Langkah 1: Buat KV Namespace (Database Statistik)
1. Masuk ke [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Pilih menu **Workers & Pages** > **KV**.
3. Klik **Create a namespace**, beri nama misal `BOT_STORAGE`, lalu klik **Add**.

### Langkah 2: Buat Worker Baru
1. Masuk ke menu **Workers & Pages** > **Create application** > **Create Worker**.
2. Beri nama bebas (misal: `telegram-sorter`), lalu klik **Deploy**.
3. Klik **Edit code**, lalu hapus semua kode bawaan dan ganti dengan isi file `worker.js` dari repository ini.

### Langkah 3: Konfigurasi Token & Chat ID
Sebelum menekan tombol *Save and deploy*, ubah variabel berikut di dalam kode `worker.js`:
* `const BOT_TOKEN = 'MASUKKAN_TOKEN_BOT_ANDA';`
* `const CHAT_ID = 'MASUKKAN_CHAT_ID_GRUP_ANDA';`
* Sesuaikan ID topik (`TOPIC_GAMBAR`, `TOPIC_VIDEO`, `TOPIC_DOKUMEN`) dengan grup Anda.

### Langkah 4: Hubungkan KV Namespace
1. Masuk ke tab **Settings** di atas editor Cloudflare Worker Anda, lalu pilih **Variables**.
2. Cari bagian **KV Namespace Bindings**, klik **Add binding**.
3. Variable name: `MY_KV`
4. KV namespace: Pilih `BOT_STORAGE` yang sudah dibuat di Langkah 1.
5. Klik **Save**. Kembali ke tab **Code** dan klik **Deploy** ulang.

### Langkah 5: Aktifkan Webhook Telegram
Buka *browser* Anda dan akses URL berikut (ganti bagian yang ada di dalam kurung siku):
`https://api.telegram.org/bot[TOKEN_BOT_ANDA]/setWebhook?url=https://[NAMA_WORKER_ANDA].[AKUN_ANDA].workers.dev&drop_pending_updates=true`

Jika muncul tulisan `{"ok":true,"result":true,"description":"Webhook was set"}`, bot Anda sudah siap digunakan!

---

## 📌 Perintah Bot di Telegram
* `/cek` — Melihat Chat ID dan Topic ID ruangan tempat bot dipanggil.
* `/status` — Menampilkan statistik jumlah file yang berhasil disortir.
