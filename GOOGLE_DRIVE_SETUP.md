# SMART HUB - Google Drive upload setup

## 1. Create the root folder
Create a folder in the school's Google Drive, e.g. `SMART HUB`.
Copy the folder ID from its URL.

## 2. Deploy Apps Script
1. Open Google Apps Script while signed in with the school's storage-owner Google account.
2. Create a new project.
3. Paste `GOOGLE_APPS_SCRIPT.gs` into `Code.gs`.
4. Replace `PASTE_GOOGLE_DRIVE_ROOT_FOLDER_ID_HERE` with the SMART HUB folder ID.
5. Save.
6. Deploy > New deployment > Web app.
7. Execute as: **Me**.
8. Who has access: **Anyone**.
9. Authorize the requested Drive permission.
10. Copy the Web app URL ending in `/exec`.

## 3. Configure the SMART HUB dashboard
Open `supabase-config.js` and replace:

`https://script.google.com/macros/s/AKfycbzkFj794K6GpG5_5SBkOZ_lyMD0WnekIEqhWdsYqWa5-gGvsTMaPqHMSlLbiIalhiVP/exec`

with the Web app URL.

## 4. Supabase migration
Run the SQL migration in `SMART_HUB_GOOGLE_DRIVE_MIGRATION.sql` before testing.

## 5. Important
This simple gateway base64-encodes the file in the browser and is intended for normal school PDFs/images and files up to about 45 MB. Do not use it for very large videos yet.
