# 🚀 Cara Deploy ke Vercel (Gratis & Gampang)

Biar aplikasi ini bisa dibuka di HP, Tablet, atau Laptop lain, kamu bisa online-kan (deploy) pakai **Vercel**. Gratis kok!

## Persiapan
Pastikan kamu sudah punya akun GitHub dan kode ini sudah di-push ke GitHub.

## Langkah-langkah

1.  Buka [vercel.com](https://vercel.com) dan **Login** (pilih "Continue with GitHub").
2.  Di dashboard, klik tombol **"Add New..."** -> **"Project"**.
3.  Di bagian "Import Git Repository", cari nama repository (project) kamu ini, terus klik **Import**.
4.  nanti muncul halaman konfigurasi:
    -   **Project Name**: Bebas (ini bakal jadi nama link kamu nanti).
    -   **Framework Preset**: Biarin aja (biasanya otomatis deteksi "Vite").
    -   **Root Directory**: Biarin `./`
    -   Sisanya biarin default.
5.  Klik tombol **Deploy**.
6.  Tunggu sebentar (paling 1 menit)... dan **Selesai!** 

🎉 Nanti kamu bakal dapat link (contoh: `resto-kamu.vercel.app`). Link itu tinggal dicopy dan kirim ke HP kamu buat dibuka.

## Cara Update
Kalau kamu ada perubahan kode di komputer:
1.  Tinggal `git push` lagi ke GitHub.
2.  Vercel bakal **otomatis** update website kamu. Gak perlu setting apa-apa lagi!

## Cara Hapus (Matikan Website)
Kalau kamu mau "tutup toko" atau hapus websitenya:
1.  Buka dashboard project kamu di Vercel.
2.  Masuk ke **Settings**.
3.  Scroll paling bawah, ada tombol merah **Delete Project**.
4.  Ketik nama project buat konfirmasi, terus hapus.
5.  Website langsung hilang dan gak bisa diakses lagi. Aman!
