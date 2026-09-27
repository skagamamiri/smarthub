SMART HUB PWA V11
=================

Fix utama:
- CSS Install/Smartboard tidak lagi terpapar sebagai teks di halaman.
- JavaScript utama dipindahkan ke app.js supaya mudah dimuat turun dan dikekalkan.
- Service Worker dikemas kini untuk cache app.js.
- PDF viewer, video viewer, game viewer, Supabase dan Google Drive flow dikekalkan.
- PWA manifest kekal landscape/standalone.

Fail yang perlu berada dalam root GitHub Pages:
- index.html
- app.js
- manifest.json
- sw.js
- supabase-config.js
- smart-hub-logo.png   <-- kekalkan logo sedia ada dalam repo

Jika repo sedia ada sudah mempunyai supabase-config.js yang lebih baharu, gunakan fail repo tersebut.

Selepas upload:
1. Commit/push semua fail.
2. Tunggu GitHub Pages deploy.
3. Buka SMART HUB dan hard refresh.
4. Pada Android Smartboard, gunakan Install jika prompt tersedia.
