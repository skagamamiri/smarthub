SMART HUB V1.1
Pusat Pembelajaran Digital SK Agama (MIS) Miri

Fungsi V1.1:
- Portal Smartboard mesra sentuhan
- Buku Teks, Buku Aktiviti, Video, Latihan, Rujukan
- Permainan / HTML interaktif
- Supabase database pusat
- Supabase Auth untuk Zon Guru
- Upload fail ke Supabase Storage
- Guru boleh tambah dan hapus bahan/permainan
- PWA Android

SETUP SUPABASE
1. Cipta project Supabase.
2. Buka SQL Editor dan jalankan supabase_schema.sql.
3. Di Authentication > Users, cipta akaun guru.
4. Buka index.html.
5. Isi CONFIG.SUPABASE_URL dan CONFIG.SUPABASE_ANON_KEY.
6. Host fail ini pada GitHub Pages / Cloudflare Pages.
7. Buka URL pada Smartboard dan install sebagai PWA jika browser menyokongnya.

NOTA KESELAMATAN
- Jangan masukkan service_role key ke dalam index.html.
- Hanya anon/public key digunakan pada frontend.
- Polisi V1.1 membenarkan pengguna authenticated mengurus kandungan. Untuk sekolah dengan ramai guru, peranan admin/teacher boleh diperketatkan pada fasa seterusnya.


Google Drive root folder configured: 174lCIFRIMH_tThruGFr9hKrtOF-6N2jl
Google Apps Script Web App configured in supabase-config.js.
