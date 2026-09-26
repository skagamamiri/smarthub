/**
 * SMART HUB - Google Drive upload gateway
 *
 * 1. Create a Google Apps Script project under the school's Google account.
 * 2. Paste this file into Code.gs.
 * 3. Set ROOT_FOLDER_ID below to the Drive folder that will hold SMART HUB files.
 * 4. Deploy as Web app: Execute as Me, Who has access: Anyone.
 * 5. Put the deployment URL into supabase-config.js as SMART_HUB_GOOGLE_DRIVE_UPLOAD_URL.
 *
 * The browser sends file data as base64 JSON. This is intended for school PDFs/images
 * and other files up to roughly 45 MB. Large video files should be added later using
 * a resumable/Drive API flow rather than this simple gateway.
 */

const ROOT_FOLDER_ID = '174lCIFRIMH_tThruGFr9hKrtOF-6N2jl';
const ALLOW_ANYONE_WITH_LINK = true;

const YEAR_NAMES = {
  '1': 'Tahun 1', '2': 'Tahun 2', '3': 'Tahun 3',
  '4': 'Tahun 4', '5': 'Tahun 5', '6': 'Tahun 6'
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ok:false,error:'Request kosong.'});
    const p = JSON.parse(e.postData.contents);
    if (p.action === 'upload') return upload_(p);
    return json_({ok:false,error:'Action tidak dikenali.'});
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function upload_(p) {
  if (!ROOT_FOLDER_ID || ROOT_FOLDER_ID.indexOf('PASTE_') === 0) {
    throw new Error('ROOT_FOLDER_ID belum dikonfigurasi dalam Google Apps Script.');
  }
  if (!p.fileName || !p.data) throw new Error('Nama fail atau data fail tiada.');
  const year = String(p.year || '');
  if (!YEAR_NAMES[year]) throw new Error('Tahun tidak sah.');
  const subject = String(p.subject || 'Lain-lain').trim() || 'Lain-lain';
  const type = String(p.type || 'reference').trim() || 'reference';
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const yearFolder = getOrCreate_(root, YEAR_NAMES[year]);
  const subjectFolder = getOrCreate_(yearFolder, sanitizeFolder_(subject));
  const typeFolder = getOrCreate_(subjectFolder, typeFolderName_(type));

  const bytes = Utilities.base64Decode(String(p.data));
  const blob = Utilities.newBlob(bytes, p.mimeType || 'application/octet-stream', sanitizeFile_(p.fileName));
  const file = typeFolder.createFile(blob);

  if (ALLOW_ANYONE_WITH_LINK) {
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (sharingErr) {}
  }

  const id = file.getId();
  return json_({
    ok: true,
    fileId: id,
    fileName: file.getName(),
    fileUrl: 'https://drive.google.com/file/d/' + id + '/view',
    previewUrl: 'https://drive.google.com/file/d/' + id + '/preview',
    folderPath: YEAR_NAMES[year] + '/' + subject + '/' + typeFolderName_(type)
  });
}

function getOrCreate_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function typeFolderName_(type) {
  const map = {
    textbook: 'Buku Teks', activity: 'Buku Aktiviti', video: 'Video',
    worksheet: 'Latihan', reference: 'Rujukan'
  };
  return map[type] || 'Rujukan';
}

function sanitizeFolder_(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 100) || 'Lain-lain';
}

function sanitizeFile_(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 180) || ('fail-' + Date.now());
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
