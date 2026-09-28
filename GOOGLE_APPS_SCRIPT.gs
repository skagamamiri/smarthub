/**
 * SMART HUB - Google Drive gateway
 *
 * Supports:
 *  - normal/small uploads (legacy)
 *  - resumable uploads for large files
 *  - chunked downloads for large PDFs/videos
 *
 * Deploy as Web app: Execute as Me, Who has access: Anyone.
 */

const ROOT_FOLDER_ID = '174lCIFRIMH_tThruGFr9hKrtOF-6N2jl';
const ALLOW_ANYONE_WITH_LINK = true;
const DRIVE_API = 'https://www.googleapis.com';

const YEAR_NAMES = {
  '1': 'Tahun 1', '2': 'Tahun 2', '3': 'Tahun 3',
  '4': 'Tahun 4', '5': 'Tahun 5', '6': 'Tahun 6'
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return json_({ok:false,error:'Request kosong.'});
    const p = JSON.parse(e.postData.contents);
    switch (p.action) {
      case 'upload': return upload_(p); // legacy/small-file compatibility
      case 'start_resumable': return startResumable_(p);
      case 'upload_chunk': return uploadChunk_(p);
      case 'read': return read_(p); // legacy/small-file compatibility
      case 'read_meta': return readMeta_(p);
      case 'read_chunk': return readChunk_(p);
      default: return json_({ok:false,error:'Action tidak dikenali.'});
    }
  } catch (err) {
    return json_({ok:false,error:String(err && err.message || err)});
  }
}

function upload_(p) {
  const folderInfo = getTargetFolder_(p);
  if (!p.fileName || !p.data) throw new Error('Nama fail atau data fail tiada.');
  const bytes = Utilities.base64Decode(String(p.data));
  const blob = Utilities.newBlob(bytes, p.mimeType || 'application/octet-stream', sanitizeFile_(p.fileName));
  const file = folderInfo.folder.createFile(blob);
  return finalizeFile_(file, folderInfo.path);
}

function startResumable_(p) {
  if (!p.fileName) throw new Error('Nama fail tiada.');
  const totalSize = Number(p.totalSize || 0);
  if (!totalSize || totalSize < 1) throw new Error('Saiz fail tidak sah.');
  if (totalSize > 2 * 1024 * 1024 * 1024) throw new Error('Fail melebihi had SMART HUB 2 GB.');

  const folderInfo = getTargetFolder_(p);
  const mimeType = String(p.mimeType || 'application/octet-stream');
  const metadata = {
    name: sanitizeFile_(p.fileName),
    mimeType: mimeType,
    parents: [folderInfo.folder.getId()]
  };

  const response = UrlFetchApp.fetch(DRIVE_API + '/upload/drive/v3/files?uploadType=resumable', {
    method: 'post',
    contentType: 'application/json; charset=UTF-8',
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'X-Upload-Content-Type': mimeType,
      'X-Upload-Content-Length': String(totalSize)
    },
    payload: JSON.stringify(metadata),
    muteHttpExceptions: true
  });

  const code = response.getResponseCode();
  if (code < 200 || code >= 300) {
    throw new Error('Gagal memulakan resumable upload (' + code + '): ' + response.getContentText().slice(0, 500));
  }

  const headers = response.getHeaders();
  const sessionUrl = header_(headers, 'Location');
  if (!sessionUrl) throw new Error('Google Drive tidak memulangkan URL sesi upload.');

  return json_({ok:true,sessionUrl:sessionUrl,folderPath:folderInfo.path});
}

function uploadChunk_(p) {
  if (!p.sessionUrl) throw new Error('URL sesi upload tiada.');
  const start = Number(p.start);
  const end = Number(p.end);
  const total = Number(p.total);
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(total) || start < 0 || end < start || total < 1) {
    throw new Error('Julat chunk tidak sah.');
  }
  if (!p.data) throw new Error('Data chunk tiada.');

  const bytes = Utilities.base64Decode(String(p.data));
  const expectedLength = end - start + 1;
  if (bytes.length !== expectedLength) throw new Error('Saiz chunk tidak sepadan.');

  const response = UrlFetchApp.fetch(p.sessionUrl, {
    method: 'put',
    contentType: String(p.mimeType || 'application/octet-stream'),
    headers: {
      Authorization: 'Bearer ' + ScriptApp.getOAuthToken(),
      'Content-Length': String(bytes.length),
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total
    },
    payload: bytes,
    muteHttpExceptions: true,
    followRedirects: true
  });

  const code = response.getResponseCode();
  const headers = response.getHeaders();
  const newSessionUrl = header_(headers, 'Location') || p.sessionUrl;

  if (code === 308) {
    const range = header_(headers, 'Range');
    let nextStart = start;
    if (range) {
      const m = String(range).match(/bytes\s*=\s*\d+-(\d+)/i);
      if (m) nextStart = Number(m[1]) + 1;
    }
    return json_({ok:true,complete:false,nextStart:nextStart,sessionUrl:newSessionUrl});
  }

  if (code === 200 || code === 201) {
    let fileInfo;
    try { fileInfo = JSON.parse(response.getContentText()); } catch (_) { fileInfo = {}; }
    if (!fileInfo.id) throw new Error('Upload selesai tetapi Google Drive tidak memulangkan file ID.');
    const file = DriveApp.getFileById(fileInfo.id);
    if (ALLOW_ANYONE_WITH_LINK) {
      try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (_) {}
    }
    return json_({
      ok:true,
      complete:true,
      fileId:fileInfo.id,
      fileName:fileInfo.name || file.getName(),
      fileUrl:'https://drive.google.com/file/d/' + fileInfo.id + '/view',
      previewUrl:'https://drive.google.com/file/d/' + fileInfo.id + '/preview'
    });
  }

  throw new Error('Upload chunk gagal (' + code + '): ' + response.getContentText().slice(0, 500));
}

function read_(p) {
  if (!p.fileId) throw new Error('File ID tiada.');
  const file = DriveApp.getFileById(String(p.fileId));
  const bytes = file.getBlob().getBytes();
  const MAX_READ = 35 * 1024 * 1024;
  if (bytes.length > MAX_READ) throw new Error('Fail terlalu besar untuk bacaan lama. Gunakan bacaan berchunk.');
  return json_({ok:true,fileId:file.getId(),name:file.getName(),mimeType:file.getMimeType(),data:Utilities.base64Encode(bytes)});
}

function readMeta_(p) {
  if (!p.fileId) throw new Error('File ID tiada.');
  const id = encodeURIComponent(String(p.fileId));
  const response = UrlFetchApp.fetch(DRIVE_API + '/drive/v3/files/' + id + '?fields=id,name,mimeType,size&supportsAllDrives=true', {
    method: 'get',
    headers: {Authorization:'Bearer ' + ScriptApp.getOAuthToken()},
    muteHttpExceptions: true
  });
  const code = response.getResponseCode();
  if (code !== 200) throw new Error('Gagal mendapatkan metadata Google Drive (' + code + ').');
  const data = JSON.parse(response.getContentText());
  return json_({ok:true,id:data.id,name:data.name||'',mimeType:data.mimeType||'application/octet-stream',size:Number(data.size||0)});
}

function readChunk_(p) {
  if (!p.fileId) throw new Error('File ID tiada.');
  const start = Number(p.start);
  const end = Number(p.end);
  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end < start) throw new Error('Julat bacaan tidak sah.');
  const id = encodeURIComponent(String(p.fileId));
  const response = UrlFetchApp.fetch(DRIVE_API + '/drive/v3/files/' + id + '?alt=media&supportsAllDrives=true', {
    method: 'get',
    headers: {
      Authorization:'Bearer ' + ScriptApp.getOAuthToken(),
      Range:'bytes=' + start + '-' + end
    },
    muteHttpExceptions: true
  });
  const code = response.getResponseCode();
  if (code !== 200 && code !== 206) throw new Error('Gagal membaca chunk Google Drive (' + code + ').');
  const bytes = response.getContent();
  return json_({ok:true,start:start,end:start + bytes.length - 1,data:Utilities.base64Encode(bytes)});
}

function getTargetFolder_(p) {
  if (!ROOT_FOLDER_ID || ROOT_FOLDER_ID.indexOf('PASTE_') === 0) throw new Error('ROOT_FOLDER_ID belum dikonfigurasi.');
  const year = String(p.year || '');
  if (!YEAR_NAMES[year]) throw new Error('Tahun tidak sah.');
  const subject = String(p.subject || 'Lain-lain').trim() || 'Lain-lain';
  const type = String(p.type || 'reference').trim() || 'reference';
  const root = DriveApp.getFolderById(ROOT_FOLDER_ID);
  const yearFolder = getOrCreate_(root, YEAR_NAMES[year]);
  const subjectFolder = getOrCreate_(yearFolder, sanitizeFolder_(subject));
  const typeFolder = getOrCreate_(subjectFolder, typeFolderName_(type));
  return {folder:typeFolder,path:YEAR_NAMES[year] + '/' + subject + '/' + typeFolderName_(type)};
}

function finalizeFile_(file, folderPath) {
  if (ALLOW_ANYONE_WITH_LINK) {
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (_) {}
  }
  const id = file.getId();
  return json_({
    ok:true,
    fileId:id,
    fileName:file.getName(),
    fileUrl:'https://drive.google.com/file/d/' + id + '/view',
    previewUrl:'https://drive.google.com/file/d/' + id + '/preview',
    folderPath:folderPath || ''
  });
}

function getOrCreate_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

function typeFolderName_(type) {
  const map = {textbook:'Buku Teks',activity:'Buku Aktiviti',video:'Video',worksheet:'Latihan',reference:'Rujukan'};
  return map[type] || 'Rujukan';
}

function sanitizeFolder_(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, '-').trim().slice(0, 100) || 'Lain-lain';
}

function sanitizeFile_(s) {
  return String(s).replace(/[\\/:*?"<>|]/g, '_').trim().slice(0, 180) || ('fail-' + Date.now());
}

function header_(headers, wanted) {
  if (!headers) return '';
  const target = String(wanted).toLowerCase();
  const keys = Object.keys(headers);
  for (const k of keys) if (String(k).toLowerCase() === target) return Array.isArray(headers[k]) ? headers[k][0] : headers[k];
  return '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
