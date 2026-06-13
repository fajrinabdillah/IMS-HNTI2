# IMS HNTI Push Notifications

Fondasi push notification sudah disiapkan di frontend, service worker, SQL, dan Edge Function.

## File yang ditambahkan/diubah

- `App.jsx`
  - Tombol `Push / Push Off` di header.
  - Request permission notifikasi perangkat.
  - Subscribe perangkat ke PushManager.
  - Simpan subscription ke tabel `push_subscriptions`.
  - Semua event `notify(...)` otomatis memanggil Edge Function `send-push`.

- `public/sw.js`
  - Menerima push notification saat IMS tertutup/background.
  - Menampilkan notification OS/browser.
  - Saat diklik, membuka IMS ke URL terkait.

- `supabase/push_notifications.sql`
  - Schema tabel `push_subscriptions`.

- `supabase/functions/send-push/index.ts`
  - Edge Function untuk mengirim push ke role/user tujuan.

## Langkah manual di Supabase

1. Buka Supabase project IMS.
2. Masuk ke menu `SQL Editor`.
3. Copy isi file `supabase/push_notifications.sql`.
4. Klik `Run`.
5. Buat VAPID key:

   ```bash
   npx web-push generate-vapid-keys
   ```

6. Simpan hasilnya:
   - Public Key dipakai di Vercel env: `VITE_VAPID_PUBLIC_KEY`
   - Public Key juga dipakai di Supabase secret: `VAPID_PUBLIC_KEY`
   - Private Key dipakai di Supabase secret: `VAPID_PRIVATE_KEY`

7. Di Supabase CLI, set secrets:

   ```bash
   supabase secrets set VAPID_PUBLIC_KEY="ISI_PUBLIC_KEY"
   supabase secrets set VAPID_PRIVATE_KEY="ISI_PRIVATE_KEY"
   supabase secrets set VAPID_SUBJECT="mailto:admin@hntindonesia.id"
   ```

8. Deploy Edge Function:

   ```bash
   supabase functions deploy send-push
   ```

9. Di Vercel project IMS, tambahkan environment variable:

   ```text
   VITE_VAPID_PUBLIC_KEY=ISI_PUBLIC_KEY
   ```

10. Deploy ulang IMS.

## Cara pakai di HP/laptop

1. Buka IMS dari domain HTTPS.
2. Login.
3. Klik tombol `Push Off` di header.
4. Pilih `Allow / Izinkan`.
5. Setelah berubah menjadi `Push`, perangkat tersebut sudah terdaftar.

Catatan: iPhone/iPad biasanya perlu IMS dipasang ke Home Screen sebagai PWA terlebih dahulu agar push notification web berjalan stabil.

