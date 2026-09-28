/* SMART HUB - Large file upload/download patch
 * Loaded after app.js by the service worker.
 * Uses Google Apps Script as a small proxy and Google Drive resumable upload.
 */
(function(){
  const ENDPOINT=()=>String(window.SMART_HUB_GOOGLE_DRIVE_UPLOAD_URL||'').trim();
  const CHUNK_SIZE=6*1024*1024; // 6 MiB; base64 stays well below Apps Script's 50 MB request limit.
  const LEGACY_THRESHOLD=25*1024*1024;

  function post_(payload){
    const endpoint=ENDPOINT();
    if(!endpoint)throw new Error('Endpoint Google Drive belum dikonfigurasi.');
    return fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)})
      .then(async res=>{const text=await res.text();let json;try{json=JSON.parse(text)}catch(_){throw new Error('Respons Google Drive tidak sah: '+text.slice(0,180))}if(!res.ok||!json.ok)throw new Error(json.error||'Google Drive gagal memproses permintaan.');return json;});
  }

  function blobToBase64_(blob){
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('Gagal membaca sebahagian fail.'));reader.readAsDataURL(blob);});
  }

  function base64ToBytes_(base64){
    const raw=atob(base64),out=new Uint8Array(raw.length);
    for(let i=0;i<raw.length;i++)out[i]=raw.charCodeAt(i);
    return out;
  }

  async function uploadLarge_(file,meta){
    if(file.size<=LEGACY_THRESHOLD && typeof window.__smartHubLegacyUpload==='function'){
      return window.__smartHubLegacyUpload(file,meta);
    }
    if(file.size>2*1024*1024*1024)throw new Error('Fail melebihi had SMART HUB 2 GB.');
    const start=await post_({action:'start_resumable',fileName:file.name,mimeType:file.type||'application/octet-stream',totalSize:file.size,title:meta?.title||file.name,type:meta?.type||'reference',year:meta?.year||'',subject:meta?.subject||'',uploadedBy:window.user?.email||''});
    let sessionUrl=start.sessionUrl;
    let offset=0;
    while(offset<file.size){
      const end=Math.min(offset+CHUNK_SIZE,file.size);
      const chunk=file.slice(offset,end);
      const data=await blobToBase64_(chunk);
      const result=await post_({action:'upload_chunk',sessionUrl,start:offset,end:end-1,total:file.size,data});
      if(result.sessionUrl)sessionUrl=result.sessionUrl;
      if(result.complete){
        if($('resourceMsg'))$('resourceMsg').textContent='Upload selesai. Menyimpan bahan...';
        return result;
      }
      const next=Math.max(offset,Math.min(file.size,Number(result.nextStart??end)));
      if(next===offset && end===file.size)throw new Error('Upload selesai tetapi Google Drive tidak memulangkan maklumat fail.');
      offset=next;
      if($('resourceMsg'))$('resourceMsg').textContent=`Memuat naik ke Google Drive... ${Math.round(offset/file.size*100)}%`;
    }
    throw new Error('Upload tidak selesai.');
  }

  async function readLarge_(driveId){
    const meta=await post_({action:'read_meta',fileId:String(driveId)});
    const total=Number(meta.size||0);
    const mimeType=meta.mimeType||'application/octet-stream';
    if(!total)throw new Error('Saiz fail Google Drive tidak dapat dikenal pasti.');
    const parts=[];
    let offset=0;
    while(offset<total){
      const end=Math.min(offset+CHUNK_SIZE,total)-1;
      const r=await post_({action:'read_chunk',fileId:String(driveId),start:offset,end});
      const bytes=base64ToBytes_(r.data||'');
      if(!bytes.length)throw new Error('Google Drive memulangkan chunk kosong.');
      parts.push(bytes);
      offset+=bytes.length;
    }
    const out=new Uint8Array(total);let pos=0;
    for(const p of parts){out.set(p,pos);pos+=p.length;}
    return {bytes:out,mimeType,size:total,name:meta.name||''};
  }

  window.__smartHubLegacyUpload=window.uploadFileToGoogleDrive;
  window.uploadFileToGoogleDrive=uploadLarge_;

  // Replace the existing single-response PDF reader so PDFs above the Apps Script
  // response limit can also be opened and cached locally.
  window.loadPdfFromDrive_=async function(driveId,cacheKey){
    const key=String(cacheKey||driveId);
    try{const cached=await getCachedPdf_(key);if(cached&&cached.byteLength){$('pdfStatus').textContent='Membuka PDF dari simpanan...';return cached;}}catch(e){console.warn('PDF cache read:',e)}
    $('pdfStatus').textContent='Memuat turun PDF kali pertama...';
    const result=await readLarge_(driveId);
    try{await saveCachedPdf_(key,result.bytes,{driveId:String(driveId),size:result.size});$('pdfStatus').textContent='PDF disimpan. Membuka...'}catch(e){console.warn('PDF cache write:',e)}
    return result.bytes;
  };

  // Videos use the same chunked reader, avoiding the 50 MB Apps Script response limit.
  window.loadVideoFromDrive_=async function(driveId){
    $('videoStatus').textContent='Memuat turun video...';$('videoStatus').classList.remove('hidden');
    const result=await readLarge_(driveId);
    return new Blob([result.bytes],{type:result.mimeType||'video/mp4'});
  };
})();
