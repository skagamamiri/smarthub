
const CONFIG={SUPABASE_URL:'https://vjbegygjpdiujzaabwmw.supabase.co',SUPABASE_ANON_KEY:'sb_publishable_8qZ46Vz-4OKX2OK0VptZjQ_f0iAWjS8',STORAGE_BUCKET:'smart-hub-files'};let sb=null,user=null,isAdmin=false;
if(CONFIG.SUPABASE_URL&&CONFIG.SUPABASE_ANON_KEY) sb=supabase.createClient(CONFIG.SUPABASE_URL,CONFIG.SUPABASE_ANON_KEY);
const demoResources=[{id:'r1',title:'Buku Teks Pendidikan Islam Tahun 1',type:'textbook',year:'1',subject:'Pendidikan Islam',file_url:'',icon:'📚'},{id:'r2',title:'Buku Aktiviti Matematik Tahun 2',type:'activity',year:'2',subject:'Matematik',file_url:'',icon:'📖'},{id:'r3',title:'Video Pembelajaran Contoh',type:'video',year:'3',subject:'Sains',file_url:'',icon:'🎥'},{id:'r4',title:'Latihan Bahasa Melayu Tahun 4',type:'worksheet',year:'4',subject:'Bahasa Melayu',file_url:'',icon:'📝'}];
const demoGames=[{id:'g1',title:'Kuiz Rukun Islam Cilik',year:'1',subject:'Pendidikan Islam',emoji:'🕌',description:'Kuiz asas Rukun Islam.',html_code:`<!doctype html><html><body style="font-family:Arial;text-align:center;padding:40px"><h1>🕌 Kuiz Rukun Islam Cilik</h1><p>Versi demo SMART HUB.</p></body></html>`},{id:'g2',title:'Cabaran Sifir Pantas',year:'2',subject:'Matematik',emoji:'🔢',description:'Cabaran sifir.',html_code:`<!doctype html><html><body style="font-family:Arial;text-align:center;padding:40px"><h1>🔢 Cabaran Sifir Pantas</h1><p>Versi demo SMART HUB.</p></body></html>`},{id:'g3',title:'Padan Huruf Jawi',year:'1',subject:'Jawi',emoji:'📖',description:'Padankan huruf Jawi.',html_code:`<!doctype html><html><body style="font-family:Arial;text-align:center;padding:40px"><h1>📖 Padan Huruf Jawi</h1><p>Versi demo SMART HUB.</p></body></html>`}];
let resources=[...demoResources],games=[...demoGames],activeResourceYear='all',activeGameYear='all',activeType='all',activeResourceGrade='all';
const $=id=>document.getElementById(id);function toast(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),2500)}
function show(id){
  document.querySelectorAll('.section').forEach(x=>x.classList.add('hidden'));
  $(id).classList.remove('hidden');

  // Active navigation: remove the inactive background first, then apply the green active state.
  // This avoids Tailwind utility-order conflicts when switching between pages.
  document.querySelectorAll('.nav').forEach(x=>{
    const active=x.dataset.section===id;
    x.className='nav touch-btn px-4 py-2 rounded-xl font-bold '+(active?'bg-emerald-600 text-white':'bg-slate-100 text-slate-800');
  });

  const teacherBtn=$('teacherBtn');
  if(teacherBtn){
    const active=id==='teacher';
    teacherBtn.className='touch-btn px-4 py-2 rounded-xl font-bold '+(active?'bg-emerald-600 text-white':'bg-slate-100 text-slate-800');
  }

  if(id==='teacher')renderTeacherState();
}
document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>show(b.dataset.section));document.querySelectorAll('.quick').forEach(b=>b.onclick=()=>show(b.dataset.go));$('teacherBtn').onclick=()=>show('teacher');
show('home');
function yearButtons(id,cb){const e=$(id);e.innerHTML='<button class="yb px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold" data-y="all">Semua</button>'+[1,2,3,4,5,6].map(y=>`<button class="yb px-3 py-2 rounded-xl bg-slate-100 font-bold" data-y="${y}">Tahun ${y}</button>`).join('');e.querySelectorAll('.yb').forEach(b=>b.onclick=()=>{e.querySelectorAll('.yb').forEach(x=>x.className='yb px-3 py-2 rounded-xl bg-slate-100 font-bold');b.className='yb px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold';cb(b.dataset.y)})}
function renderResources(){const q=$('resourceSearch').value.toLowerCase();$('resourceGrid').innerHTML=resources.filter(r=>(activeResourceYear==='all'||String(r.year)===activeResourceYear)&&(activeResourceGrade==='all'||String(r.year)===activeResourceGrade)&&(activeType==='all'||r.type===activeType)&&(`${r.title} ${r.subject}`).toLowerCase().includes(q)).map(r=>`<button class="app-card text-left bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow" onclick="openResource('${r.id}')"><div class="flex justify-between"><span class="text-4xl">${r.icon||'📚'}</span><span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-black">Tahun ${r.year}</span></div><span class="text-[11px] font-black uppercase text-emerald-600">${r.subject}</span><h3 class="font-black font-display text-lg mt-1">${r.title}</h3><p class="text-xs text-slate-500 mt-2">Tekan untuk buka bahan.</p></button>`).join('')||'<div class="col-span-full p-10 text-center bg-white rounded-3xl">Tiada bahan dijumpai.</div>'}
function renderGames(){const q=$('gameSearch').value.toLowerCase();$('gameGrid').innerHTML=games.filter(g=>(activeGameYear==='all'||String(g.year)===activeGameYear)&&(`${g.title} ${g.subject}`).toLowerCase().includes(q)).map(g=>`<button class="app-card text-left bg-white p-5 rounded-3xl border-2 border-emerald-100 shadow" onclick="openGame('${g.id}')"><div class="flex justify-between"><span class="text-4xl">${g.emoji||'🎮'}</span><span class="bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full text-xs font-black">Tahun ${g.year}</span></div><span class="text-[11px] font-black uppercase text-emerald-600">${g.subject}</span><h3 class="font-black font-display text-lg mt-1">${g.title}</h3><div class="mt-4 inline-block bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-black">▶ Main Sekarang</div></button>`).join('')||'<div class="col-span-full p-10 text-center bg-white rounded-3xl">Tiada permainan dijumpai.</div>'}
function getDriveFileId_(resource){
  if(!resource)return '';
  if(resource.drive_file_id)return String(resource.drive_file_id).trim();
  const url=String(resource.file_url||resource.url||'').trim();
  if(!url)return '';
  let m=url.match(/drive\.google\.com\/file\/d\/([^/?#]+)/i);
  if(m)return m[1];
  m=url.match(/[?&]id=([^&#]+)/i);
  if(m)return m[1];
  return '';
}
function getResourceViewerUrl_(resource){
  const driveId=getDriveFileId_(resource);
  if(driveId)return 'https://drive.google.com/file/d/'+encodeURIComponent(driveId)+'/preview';
  return String(resource?.file_url||resource?.url||'').trim();
}
let pdfDoc=null,pdfPage=1,pdfScale=1,pdfFitScale=1,pdfZoomFactor=1,pdfRendering=false,pdfPendingPage=null;
const PDF_CACHE_DB='smart_hub_pdf_cache_v1',PDF_CACHE_STORE='pdfs';
function openPdfCacheDb_(){
  return new Promise(resolve=>{
    if(!('indexedDB' in window)){resolve(null);return}
    const req=indexedDB.open(PDF_CACHE_DB,1);
    req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(PDF_CACHE_STORE))req.result.createObjectStore(PDF_CACHE_STORE,{keyPath:'key'})};
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>resolve(null);
  });
}
async function getCachedPdf_(key){
  const db=await openPdfCacheDb_();if(!db)return null;
  return new Promise(resolve=>{
    const tx=db.transaction(PDF_CACHE_STORE,'readonly'),req=tx.objectStore(PDF_CACHE_STORE).get(key);
    req.onsuccess=()=>resolve(req.result?.data?new Uint8Array(req.result.data):null);
    req.onerror=()=>resolve(null);
  });
}
async function saveCachedPdf_(key,bytes,meta){
  const db=await openPdfCacheDb_();if(!db)return false;
  return new Promise(resolve=>{
    const tx=db.transaction(PDF_CACHE_STORE,'readwrite');
    tx.objectStore(PDF_CACHE_STORE).put({key,data:bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),cachedAt:Date.now(),meta:meta||{}});
    tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);
  });
}
async function loadPdfFromDrive_(driveId,cacheKey){
  const key=String(cacheKey||driveId);
  try{
    const cached=await getCachedPdf_(key);
    if(cached&&cached.byteLength){
      $('pdfStatus').textContent='Membuka PDF dari simpanan...';
      return cached;
    }
  }catch(e){console.warn('PDF cache read:',e)}
  const endpoint=(window.SMART_HUB_GOOGLE_DRIVE_UPLOAD_URL||'').trim();
  if(!endpoint)throw new Error('Endpoint Google Drive belum dikonfigurasi.');
  $('pdfStatus').textContent='Memuat turun PDF kali pertama...';
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'read',fileId:String(driveId)})});
  const text=await res.text();
  let json;try{json=JSON.parse(text)}catch(e){throw new Error('Respons Google Drive tidak sah.');}
  if(!res.ok||!json.ok||!json.data)throw new Error(json.error||'PDF tidak dapat dibaca dari Google Drive.');
  const raw=atob(json.data);
  const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  try{await saveCachedPdf_(key,bytes,{driveId:String(driveId)});$('pdfStatus').textContent='PDF disimpan. Membuka...'}catch(e){console.warn('PDF cache write:',e)}
  return bytes;
}
function updatePdfScaleFromZoom_(){
  pdfScale=Math.max(0.25,Math.min(5,pdfFitScale*pdfZoomFactor));
}
async function calculatePdfFitScale_(page){
  const wrap=$('pdfCanvasWrap');
  const available=Math.max(320,wrap.clientWidth-2);
  const base=page.getViewport({scale:1});
  pdfFitScale=available/base.width;
  updatePdfScaleFromZoom_();
}
async function renderPdfPage_(num){
  if(!pdfDoc)return;
  if(pdfRendering){pdfPendingPage=num;return;}
  pdfRendering=true;
  try{
    const page=await pdfDoc.getPage(num);
    if(num===1 || !pdfFitScale) await calculatePdfFitScale_(page);
    updatePdfScaleFromZoom_();
    const viewport=page.getViewport({scale:pdfScale});
    const canvas=$('pdfCanvas'),ctx=canvas.getContext('2d',{alpha:false});
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    canvas.style.width=Math.ceil(viewport.width)+'px';
    canvas.style.height=Math.ceil(viewport.height)+'px';
    await page.render({canvasContext:ctx,viewport}).promise;
    $('pdfPageInfo').textContent=`${num} / ${pdfDoc.numPages}`;
    $('pdfPageInput').value=num;
    $('pdfPageInput').max=pdfDoc.numPages;
    $('pdfPageTotal').textContent=pdfDoc.numPages;
    $('pdfPrev').disabled=num<=1;$('pdfNext').disabled=num>=pdfDoc.numPages;
    $('pdfZoomOut').disabled=pdfZoomFactor<=0.5;
    $('pdfZoomIn').disabled=pdfZoomFactor>=3;
  }finally{
    pdfRendering=false;
    if(pdfPendingPage&&pdfPendingPage!==num){const n=pdfPendingPage;pdfPendingPage=null;renderPdfPage_(n)}else pdfPendingPage=null;
  }
}
async function openPdfResource_(r){
  const driveId=getDriveFileId_(r);
  if(!driveId)throw new Error('Bahan ini tiada Google Drive ID.');
  $('pdfViewer').classList.remove('hidden');
  $('gameViewer').classList.add('hidden');
  $('closeViewer').classList.add('hidden');
  $('pdfClose').classList.remove('hidden');
  $('pdfStatus').classList.remove('hidden');
  $('pdfTitle').textContent=r.title||'PDF';
  pdfDoc=null;pdfPage=1;pdfScale=1;pdfFitScale=1;pdfZoomFactor=1;$('pdfPageInfo').textContent='1 / 1';$('pdfPageInput').value=1;$('pdfPageInput').max=1;$('pdfPageTotal').textContent='1';
  $('pdfCanvas').style.width='1px';$('pdfCanvas').style.height='1px';
  const cacheKey=String(driveId)+'::'+String(r.updated_at||r.modified_at||r.created_at||'v1');
  const bytes=await loadPdfFromDrive_(driveId,cacheKey);
  pdfDoc=await pdfjsLib.getDocument({data:bytes}).promise;
  $('pdfStatus').classList.add('hidden');
  const firstPage=await pdfDoc.getPage(1);
  await calculatePdfFitScale_(firstPage);
  await renderPdfPage_(1);
}
function getYouTubeEmbedUrl_(url){
  const u=String(url||'').trim();
  if(!u)return '';
  let m=u.match(/[?&]v=([^&#]+)/i);
  if(m)return 'https://www.youtube.com/embed/'+encodeURIComponent(m[1])+'?rel=0&modestbranding=1';
  m=u.match(/youtu\.be\/([^?&#]+)/i);
  if(m)return 'https://www.youtube.com/embed/'+encodeURIComponent(m[1])+'?rel=0&modestbranding=1';
  m=u.match(/youtube\.com\/shorts\/([^?&#]+)/i);
  if(m)return 'https://www.youtube.com/embed/'+encodeURIComponent(m[1])+'?rel=0&modestbranding=1';
  m=u.match(/youtube\.com\/embed\/([^?&#]+)/i);
  if(m)return 'https://www.youtube.com/embed/'+encodeURIComponent(m[1])+'?rel=0&modestbranding=1';
  return '';
}
async function loadVideoFromDrive_(driveId){
  const endpoint=(window.SMART_HUB_GOOGLE_DRIVE_UPLOAD_URL||'').trim();
  if(!endpoint)throw new Error('Endpoint Google Drive belum dikonfigurasi.');
  $('videoStatus').textContent='Memuat turun video...';$('videoStatus').classList.remove('hidden');
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'read',fileId:String(driveId)})});
  const text=await res.text();
  let json;try{json=JSON.parse(text)}catch(e){throw new Error('Respons Google Drive tidak sah.');}
  if(!res.ok||!json.ok||!json.data)throw new Error(json.error||'Video tidak dapat dibaca dari Google Drive.');
  const raw=atob(json.data);
  const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  return new Blob([bytes],{type:json.mimeType||'video/mp4'});
}
async function openVideoResource_(r){
  $('pdfViewer').classList.add('hidden');$('gameViewer').classList.add('hidden');$('videoViewer').classList.remove('hidden');
  $('pdfClose').classList.add('hidden');$('closeViewer').classList.add('hidden');$('videoClose').classList.remove('hidden');
  $('videoTitle').textContent=r.title||'Video';$('videoStatus').classList.add('hidden');$('videoError').classList.add('hidden');
  $('smartVideo').pause();$('smartVideo').removeAttribute('src');$('smartVideo').load();$('smartVideo').classList.add('hidden');
  $('youtubeFrame').src='';$('youtubeFrame').classList.add('hidden');
  const yt=getYouTubeEmbedUrl_(r.file_url||r.url||'');
  if(yt){$('youtubeFrame').src=yt;$('youtubeFrame').classList.remove('hidden');return;}
  try{
    const driveId=getDriveFileId_(r);
    let blob=null;
    if(driveId)blob=await loadVideoFromDrive_(driveId);
    else if(r.file_url||r.url){
      const direct=String(r.file_url||r.url).trim();
      const res=await fetch(direct);
      if(!res.ok)throw new Error('URL video tidak dapat dicapai.');
      blob=await res.blob();
    }
    if(!blob)throw new Error('Video tiada fail atau URL.');
    const objectUrl=URL.createObjectURL(blob);
    $('smartVideo').src=objectUrl;$('smartVideo').classList.remove('hidden');
    $('smartVideo').dataset.objectUrl=objectUrl;
    $('videoStatus').textContent='Video sedia dimainkan';$('videoStatus').classList.remove('hidden');
  }catch(err){console.error(err);$('videoErrorText').textContent=err.message||'Video gagal dipaparkan.';$('videoError').classList.remove('hidden');}
}
async function openResource(id){
  const r=resources.find(x=>String(x.id)===String(id));if(!r)return;
  $('viewer').classList.remove('hidden');document.body.style.overflow='hidden';
  if(String(r.type).toLowerCase()==='video'){await openVideoResource_(r);return;}
  try{await openPdfResource_(r)}catch(err){console.error(err);$('pdfStatus').textContent=err.message||'PDF gagal dipaparkan.';$('pdfStatus').classList.remove('hidden');}
}
function openGame(id){const g=games.find(x=>String(x.id)===String(id));if(!g)return;$('pdfViewer').classList.add('hidden');$('videoViewer').classList.add('hidden');$('gameViewer').classList.remove('hidden');$('pdfClose').classList.add('hidden');$('videoClose').classList.add('hidden');$('closeViewer').classList.remove('hidden');$('viewerFrame').src='';$('viewerFrame').srcdoc=g.html_code||g.html||'';$('viewer').classList.remove('hidden');document.body.style.overflow='hidden'}
function closeViewer_(){
  pdfDoc=null;pdfFitScale=1;pdfZoomFactor=1;
  const v=$('smartVideo');
  if(v){v.pause();const old=v.dataset.objectUrl;if(old)URL.revokeObjectURL(old);v.dataset.objectUrl='';v.removeAttribute('src');v.load();v.classList.add('hidden');}
  $('youtubeFrame').src='';$('youtubeFrame').classList.add('hidden');
  $('viewer').classList.add('hidden');$('pdfViewer').classList.add('hidden');$('videoViewer').classList.add('hidden');$('gameViewer').classList.add('hidden');$('viewerFrame').src='';$('viewerFrame').srcdoc='';$('pdfCanvas').width=1;$('pdfCanvas').height=1;$('closeViewer').classList.add('hidden');$('pdfClose').classList.add('hidden');$('videoClose').classList.add('hidden');$('videoStatus').classList.add('hidden');document.body.style.overflow=''
}
$('closeViewer').onclick=closeViewer_;$('closeViewer').classList.add('hidden');
$('pdfClose').onclick=closeViewer_;
$('videoClose').onclick=closeViewer_;
$('videoFullscreen').onclick=()=>{const el=$('smartVideo').classList.contains('hidden')?$('youtubeFrame'):$('smartVideo');if(el.requestFullscreen)el.requestFullscreen();};
$('pdfPrev').addEventListener('click',()=>{if(pdfDoc&&pdfPage>1){pdfPage-=1;renderPdfPage_(pdfPage)}});
$('pdfNext').addEventListener('click',()=>{if(pdfDoc&&pdfPage<pdfDoc.numPages){pdfPage+=1;renderPdfPage_(pdfPage)}});
function goToPdfPage_(){
  if(!pdfDoc)return;
  const input=$('pdfPageInput');
  let target=parseInt(input.value,10);
  if(!Number.isFinite(target))target=pdfPage;
  target=Math.max(1,Math.min(pdfDoc.numPages,target));
  input.value=target;
  if(target!==pdfPage){pdfPage=target;renderPdfPage_(pdfPage)}
  else input.blur();
}
$('pdfGoPage').addEventListener('click',goToPdfPage_);
$('pdfPageInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();goToPdfPage_()}});
$('pdfPageInput').addEventListener('change',()=>{if(pdfDoc)goToPdfPage_()});
$('pdfZoomIn').addEventListener('click',()=>{if(!pdfDoc)return;pdfZoomFactor=Math.min(3,Math.round((pdfZoomFactor+0.25)*100)/100);updatePdfScaleFromZoom_();renderPdfPage_(pdfPage)});
$('pdfZoomOut').addEventListener('click',()=>{if(!pdfDoc)return;pdfZoomFactor=Math.max(0.5,Math.round((pdfZoomFactor-0.25)*100)/100);updatePdfScaleFromZoom_();renderPdfPage_(pdfPage)});
window.addEventListener('resize',()=>{if(!pdfDoc||$('pdfViewer').classList.contains('hidden'))return;clearTimeout(window.__pdfResizeTimer);window.__pdfResizeTimer=setTimeout(async()=>{const page=await pdfDoc.getPage(pdfPage);await calculatePdfFitScale_(page);await renderPdfPage_(pdfPage)},120)});

document.addEventListener('keydown',e=>{
  if($('viewer').classList.contains('hidden'))return;
  if(e.key==='Escape'){closeViewer_();return}
  if($('pdfViewer').classList.contains('hidden'))return;
  if(e.key==='+'||e.key==='='){e.preventDefault();$('pdfZoomIn').click()}
  if(e.key==='-'||e.key==='_'){e.preventDefault();$('pdfZoomOut').click()}
  if(e.key==='ArrowLeft')$('pdfPrev').click();
  if(e.key==='ArrowRight')$('pdfNext').click();
});
$('resourceSearch').oninput=renderResources;$('gameSearch').oninput=renderGames;yearButtons('yearFilters',y=>{activeResourceYear=y;renderResources()});yearButtons('gameYears',y=>{activeGameYear=y;renderGames()});document.querySelectorAll('.rtype').forEach(b=>b.onclick=()=>{document.querySelectorAll('.rtype').forEach(x=>x.className='rtype px-3 py-2 rounded-xl bg-slate-100 font-bold');b.className='rtype active px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold';activeType=b.dataset.type;renderResources()});document.querySelectorAll('.rgrade').forEach(b=>b.onclick=()=>{document.querySelectorAll('.rgrade').forEach(x=>x.className='rgrade px-3 py-2 rounded-xl bg-slate-100 font-bold');b.className='rgrade active px-3 py-2 rounded-xl bg-emerald-600 text-white font-bold';activeResourceGrade=b.dataset.grade;renderResources()});
async function loadFromSupabase(){if(!sb)return;try{const [rr,gg]=await Promise.all([sb.from('resources').select('*').order('created_at',{ascending:false}),sb.from('games').select('*').order('created_at',{ascending:false})]);if(!rr.error&&rr.data?.length){resources=rr.data;renderResources()}if(!gg.error&&gg.data?.length){games=gg.data;renderGames()}}catch(e){console.warn(e)}}
function renderTeacherState(){if(user){$('teacherLogin').classList.add('hidden');$('teacherPanel').classList.remove('hidden');$('teacherEmail').textContent=(user.email||'')+(isAdmin?' • Admin Sekolah':'');$('teacherRoleLabel').textContent=isAdmin?'Admin Sekolah':'Studio Guru';$('adminPanel').classList.toggle('hidden',!isAdmin);$('adminTabBtn').classList.toggle('hidden',!isAdmin);if(!isAdmin&&activeTeacherTab==='tabAdmin')showTeacherTab('tabBahan');loadManageList();loadPrompts();if(isAdmin)loadAdminTeachers()}else{$('teacherLogin').classList.remove('hidden');$('teacherPanel').classList.add('hidden');$('adminPanel').classList.add('hidden')}}
async function getTeacherRole(email){if(!sb||!email)return null;const {data,error}=await sb.rpc('get_teacher_role',{check_email:email});if(error){console.warn('Semakan whitelist gagal:',error);return null}return data||null}
async function verifyTeacherAccess(currentUser, showMessage=true){if(!currentUser||!sb){isAdmin=false;return false}const role=await getTeacherRole(currentUser.email);if(!role){isAdmin=false;user=null;await sb.auth.signOut();if(showMessage)$('authMsg').textContent='Akses ditolak. Akaun Google ini tidak didaftarkan sebagai guru SK Agama (MIS) Miri.';renderTeacherState();return false}user=currentUser;isAdmin=String(role).toLowerCase()==='admin';renderTeacherState();return true}
async function login(e){e.preventDefault();if(!sb){$('authMsg').textContent='Supabase belum dikonfigurasi. Masukkan URL dan anon key dalam CONFIG.';return}const {data,error}=await sb.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error){$('authMsg').textContent=error.message;return}if(!(await verifyTeacherAccess(data.user))){return}$('authMsg').textContent='';toast('Log masuk berjaya.')}
$('loginForm').onsubmit=login;
$('googleLoginBtn').onclick=async()=>{if(!sb){$('authMsg').textContent='Supabase belum dikonfigurasi.';return}$('authMsg').textContent='Membuka Google...';const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+window.location.pathname}});if(error)$('authMsg').textContent=error.message};$('logoutBtn').onclick=async()=>{if(sb)await sb.auth.signOut();user=null;isAdmin=false;renderTeacherState();toast('Log keluar.')};
async function uploadFileToGoogleDrive(file, meta){
  if(!file)return null;
  const endpoint=(window.SMART_HUB_GOOGLE_DRIVE_UPLOAD_URL||'').trim();
  if(!endpoint)throw new Error('Google Drive belum dikonfigurasi. Tetapkan SMART_HUB_GOOGLE_DRIVE_UPLOAD_URL dalam supabase-config.js.');
  const maxBytes=45*1024*1024;
  if(file.size>maxBytes)throw new Error('Fail terlalu besar untuk kaedah upload ini. Maksimum 45 MB setiap fail.');
  $('resourceMsg').textContent='Memuat naik ke Google Drive...';
  const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(new Error('Gagal membaca fail.'));reader.readAsDataURL(file);});
  const body={
    action:'upload',
    fileName:file.name,
    mimeType:file.type||'application/octet-stream',
    data:base64,
    title:meta.title,
    type:meta.type,
    year:meta.year,
    subject:meta.subject,
    uploadedBy:user?.email||''
  };
  const res=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(body)});
  const text=await res.text();
  let json;try{json=JSON.parse(text)}catch(_){throw new Error('Google Drive memberikan respons yang tidak sah: '+text.slice(0,180));}
  if(!res.ok||!json.ok)throw new Error(json.error||'Upload ke Google Drive gagal.');
  return json;
}
$('resType').addEventListener('change',()=>{
  const isVideo=$('resType').value==='video';
  $('resFile').accept=isVideo?'.mp4,.webm,.ogg,video/mp4,video/webm,video/ogg':'.pdf,.png,.jpg,.jpeg,.mp4,.webm,.ppt,.pptx';
  $('resUrl').placeholder=isVideo?'Link YouTube atau URL video (pilihan)':'Atau URL bahan (pilihan)';
});

$('resourceForm').onsubmit=async e=>{
  e.preventDefault();
  if(!sb||!user){$('resourceMsg').textContent='Log masuk dan konfigurasi Supabase dahulu.';return}
  try{
    const title=$('resTitle').value.trim(), type=$('resType').value, year=$('resYear').value, subject=$('resSubject').value.trim();
    const file=$('resFile').files[0], manualUrl=$('resUrl').value.trim();
    if(!file&&!manualUrl)throw new Error('Pilih fail atau masukkan URL bahan.');
    $('resourceMsg').textContent='Menyimpan...';
    let fileUrl=manualUrl, driveFileId=null;
    if(file){
      const drive=await uploadFileToGoogleDrive(file,{title,type,year,subject});
      fileUrl=drive.previewUrl||drive.fileUrl; driveFileId=drive.fileId||null;
    }
    const payload={title,category:type,type,year,subject,icon:'📚',file_url:fileUrl,drive_file_id:driveFileId};
    const {error}=await sb.from('resources').insert(payload);
    if(error)throw error;
    $('resourceForm').reset();$('resourceMsg').textContent=(type==='video'?'Video berjaya disimpan.':'Bahan berjaya disimpan ke Google Drive.');await loadFromSupabase();await loadManageList();
  }catch(err){console.error(err);$('resourceMsg').textContent=err.message}
}
$('gameForm').onsubmit=async e=>{e.preventDefault();if(!sb||!user){$('gameMsg').textContent='Log masuk dan konfigurasi Supabase dahulu.';return}try{$('gameMsg').textContent='Menyimpan...';const payload={title:$('gameTitle').value.trim(),subject:$('gameSubject').value.trim(),year:$('gameYear').value,emoji:$('gameEmoji').value||'🎮',description:$('gameDesc').value.trim(),html_code:$('gameHtml').value};const {error}=await sb.from('games').insert(payload);if(error)throw error;$('gameForm').reset();$('gameEmoji').value='🎮';$('gameMsg').textContent='Permainan berjaya disimpan.';await loadFromSupabase();await loadManageList()}catch(err){$('gameMsg').textContent=err.message}}
let manageData={res:[],game:[]},manageGrade={res:'all',game:'all'};
async function loadManageList(){
  if(!sb||!user)return;
  const [r,g]=await Promise.all([
    sb.from('resources').select('id,title,type,year,subject,created_at').order('created_at',{ascending:false}).limit(200),
    sb.from('games').select('id,title,year,subject,emoji,created_at').order('created_at',{ascending:false}).limit(200)
  ]);
  manageData.res=r.data||[];manageData.game=g.data||[];
  renderManageList('res');renderManageList('game');
}
const TYPE_LABEL={textbook:'Buku Teks',activity:'Buku Aktiviti',video:'Video',worksheet:'Latihan',reference:'Rujukan'};
function renderManageList(kind){
  const isRes=kind==='res',list=$(isRes?'manageResList':'manageGameList'),grade=manageGrade[kind];
  const rows=manageData[kind].filter(x=>grade==='all'||String(x.year)===grade);
  list.innerHTML=rows.map(x=>`<div class="flex items-center justify-between gap-3 p-3 ${isRes?'bg-slate-50':'bg-amber-50'} rounded-xl"><div class="min-w-0"><b class="block truncate">${isRes?'📚':escapeHtml(x.emoji||'🎮')} ${escapeHtml(x.title)}</b><div class="text-xs text-slate-500">${isRes?escapeHtml(TYPE_LABEL[x.type]||x.type)+' • ':''}${escapeHtml(x.subject||'')} • Tahun ${escapeHtml(x.year)}</div></div><button onclick="${isRes?'deleteResource':'deleteGame'}('${x.id}')" class="shrink-0 px-3 py-2 bg-red-100 text-red-700 rounded-lg font-bold">Hapus</button></div>`).join('')||`<p class="text-sm text-slate-500 text-center p-5">${isRes?'Tiada bahan':'Tiada interaktif'}${grade==='all'?'':' untuk Darjah '+grade}.</p>`;
}
function setupGradeFilter_(id,kind){
  const el=$(id);
  el.innerHTML='<span class="text-sm font-black text-slate-700">Darjah:</span>'+['all',1,2,3,4,5,6].map(g=>`<button type="button" class="mg px-3 py-2 rounded-xl font-bold ${g==='all'?'bg-emerald-600 text-white':'bg-slate-100 text-slate-800'}" data-g="${g}">${g==='all'?'Semua':g}</button>`).join('');
  el.querySelectorAll('.mg').forEach(b=>b.onclick=()=>{
    manageGrade[kind]=b.dataset.g;
    el.querySelectorAll('.mg').forEach(x=>x.className='mg px-3 py-2 rounded-xl font-bold '+(x===b?'bg-emerald-600 text-white':'bg-slate-100 text-slate-800'));
    renderManageList(kind);
  });
}
async function deleteResource(id){if(!confirm('Hapus bahan ini?'))return;const {error}=await sb.from('resources').delete().eq('id',id);if(error)return toast(error.message);await loadFromSupabase();await loadManageList();toast('Bahan dihapus.')}
async function deleteGame(id){if(!confirm('Hapus permainan ini?'))return;const {error}=await sb.from('games').delete().eq('id',id);if(error)return toast(error.message);await loadFromSupabase();await loadManageList();toast('Permainan dihapus.')}
async function loadAdminTeachers(){
  if(!sb||!user||!isAdmin)return;
  const {data,error}=await sb.from('teacher_allowlist').select('id,name,email,role,is_active,created_at').order('name',{ascending:true});
  if(error){$('teacherAdminMsg').textContent='Tidak dapat memuatkan senarai guru: '+error.message;return}
  window._adminTeachers=data||[];
  renderAdminTeachers();
}
function renderAdminTeachers(){
  const q=($('teacherAdminSearch')?.value||'').toLowerCase().trim();
  const rows=(window._adminTeachers||[]).filter(t=>`${t.name} ${t.email}`.toLowerCase().includes(q));
  $('adminStats').textContent=`${(window._adminTeachers||[]).filter(t=>t.is_active).length} akaun aktif • ${(window._adminTeachers||[]).length} jumlah`;
  $('teacherAdminList').innerHTML=rows.map(t=>`<div class="p-3 rounded-2xl border ${t.is_active?'border-emerald-100 bg-emerald-50/50':'border-slate-200 bg-slate-50'}"><div class="flex items-start justify-between gap-3"><div class="min-w-0"><b class="block truncate">${escapeHtml(t.name)}</b><span class="text-xs text-slate-500 break-all">${escapeHtml(t.email)}</span><div class="mt-1 flex gap-2 flex-wrap"><span class="text-[10px] font-black px-2 py-1 rounded-full bg-white border">${escapeHtml(t.role)}</span><span class="text-[10px] font-black px-2 py-1 rounded-full ${t.is_active?'bg-emerald-100 text-emerald-800':'bg-red-100 text-red-700'}">${t.is_active?'Aktif':'Tidak aktif'}</span></div></div><div class="flex gap-2 shrink-0"><button onclick="toggleTeacher('${t.id}',${!t.is_active})" class="px-3 py-2 rounded-lg font-bold ${t.is_active?'bg-red-100 text-red-700':'bg-emerald-100 text-emerald-700'}">${t.is_active?'Nyahaktif':'Aktifkan'}</button></div></div></div>`).join('')||'<p class="text-sm text-slate-500 text-center p-5">Tiada guru dijumpai.</p>';
}
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
async function toggleTeacher(id,nextActive){
  if(!isAdmin)return;
  const {error}=await sb.from('teacher_allowlist').update({is_active:nextActive}).eq('id',id);
  if(error)return toast(error.message);
  await loadAdminTeachers();
  toast(nextActive?'Guru diaktifkan.':'Akses guru dinyahaktifkan.');
}
$('teacherAdminForm').onsubmit=async e=>{
  e.preventDefault();if(!isAdmin)return;
  const name=$('adminTeacherName').value.trim();const email=$('adminTeacherEmail').value.trim().toLowerCase();const role=$('adminTeacherRole').value;
  $('teacherAdminMsg').textContent='Menyimpan...';
  const {error}=await sb.from('teacher_allowlist').upsert({name,email,role,is_active:true},{onConflict:'email'});
  if(error){$('teacherAdminMsg').textContent=error.message;return;}
  $('teacherAdminForm').reset();$('adminTeacherRole').value='KPM-Guru';$('teacherAdminMsg').textContent='Guru berjaya ditambah/diaktifkan.';await loadAdminTeachers();toast('Senarai guru dikemas kini.');
};
$('refreshTeachersBtn').onclick=loadAdminTeachers;
$('teacherAdminSearch').oninput=renderAdminTeachers;
document.querySelectorAll('.refresh-manage').forEach(b=>b.onclick=()=>{loadFromSupabase();loadManageList()});
/* ===== ZON GURU: TAB, SUBJEK, PRATONTON & SENARAI PROMPT ===== */
var SUBJECTS=['Bahasa Melayu','English','Mathematics','Science','Pendidikan Jasmani','Pendidikan Kesihatan','Pendidikan Seni Visual','Sejarah','Reka Bentuk dan Teknologi','Bahasa Arab','Pendidikan Islam','Tasmik'];
document.querySelectorAll('.subject-select').forEach(sel=>{sel.insertAdjacentHTML('beforeend',SUBJECTS.map(x=>`<option>${x}</option>`).join(''))});

var activeTeacherTab='tabBahan';
function showTeacherTab(tab){
  if(tab==='tabAdmin'&&!isAdmin)tab='tabBahan';
  if(!$(tab))tab='tabBahan';
  activeTeacherTab=tab;
  document.querySelectorAll('.tpane').forEach(p=>p.classList.toggle('hidden',p.id!==tab));
  document.querySelectorAll('.ttab').forEach(b=>{const on=b.dataset.tab===tab;b.classList.toggle('active',on);b.setAttribute('aria-selected',on)});
  try{localStorage.setItem('smarthub_teacher_tab',tab)}catch(_){}
}
document.querySelectorAll('.ttab').forEach(b=>b.onclick=()=>showTeacherTab(b.dataset.tab));
try{activeTeacherTab=localStorage.getItem('smarthub_teacher_tab')||'tabBahan'}catch(_){}
showTeacherTab(activeTeacherTab==='tabAdmin'?'tabBahan':activeTeacherTab);
setupGradeFilter_('manageResGrades','res');
setupGradeFilter_('manageGameGrades','game');

$('gamePreviewBtn').onclick=()=>{
  const html=$('gameHtml').value.trim();
  if(!html){$('gameMsg').textContent='Tampal kod HTML dahulu untuk pratonton.';return}
  $('pdfViewer').classList.add('hidden');$('videoViewer').classList.add('hidden');$('gameViewer').classList.remove('hidden');
  $('pdfClose').classList.add('hidden');$('videoClose').classList.add('hidden');$('closeViewer').classList.remove('hidden');
  $('viewerFrame').src='';$('viewerFrame').srcdoc=html;$('viewer').classList.remove('hidden');document.body.style.overflow='hidden';
};
$('gotoGamePrompt').onclick=()=>{showTeacherTab('tabPrompt');setPromptCat('interaktif');window.scrollTo({top:0,behavior:'smooth'})};

/* ---------- Senarai Prompt ---------- */
var PROMPT_CATS=[
  {id:'interaktif',label:'🎮 Interaktif & Game'},
  {id:'rph',label:'🗒️ RPH'},
  {id:'latihan',label:'📝 Latihan & Soalan'},
  {id:'pentaksiran',label:'📊 Pentaksiran (PBD)'},
  {id:'nota',label:'📚 Nota & Bahan'},
  {id:'pentadbiran',label:'🏫 Pentadbiran & Surat'},
  {id:'lain',label:'✨ Lain-lain'}
];
var catLabel=id=>(PROMPT_CATS.find(c=>c.id===id)||{label:'✨ Lain-lain'}).label;

var STARTER_PROMPTS=[
{id:'s1',category:'interaktif',builder:true,title:'Jana permainan interaktif (Mod Individu & Kumpulan)',prompt_text:`Anda ialah pereka permainan pendidikan dan pembangun web yang mahir dalam KSSR (Semakan) Malaysia.

Tugas anda: bina SATU permainan interaktif dalam satu fail HTML (HTML + CSS + JavaScript dalam satu fail) yang boleh dibuka terus di pelayar web dan berfungsi di komputer, tablet, TV pintar dan Smartboard (skrin sentuh).

=== MAKLUMAT GURU ===
Mata pelajaran       : [MATA PELAJARAN]
Tahun                : [TAHUN]
Tema / Unit / Tajuk  : [TAJUK]
Standard Kandungan   : [STANDARD KANDUNGAN]
Standard Pembelajaran: [STANDARD PEMBELAJARAN]
Muka surat buku teks : [MUKA SURAT]
Bahasa permainan     : [BAHASA]
Bilangan soalan      : [BILANGAN SOALAN]
Had masa per soalan  : [HAD MASA]
Tahap kesukaran      : [TAHAP KESUKARAN]
Jenis permainan      : [JENIS PERMAINAN]
Mod permainan        : [MOD PERMAINAN]
Kandungan tambahan   : [NOTA / SOALAN SENDIRI (jika ada)]

=== SENARAI JENIS PERMAINAN ===
1. Kuiz Pelbagai Pilihan (A/B/C/D)
2. Betul atau Salah
3. Padankan Pasangan
4. Isi Tempat Kosong
5. Susun Huruf / Susun Perkataan menjadi ayat
6. Seret & Lepas ke Kategori
7. Kad Memori (cari pasangan kad terbalik)
8. Roda Putar Soalan
9. Lumba ke Garisan Penamat (jawapan betul = maju)
10. Pecahkan Belon Jawapan Betul
11. Teka Gambar / Emoji (guna emoji atau SVG, tiada gambar luar)
12. Susun Mengikut Urutan (langkah, kitaran, kronologi)
Jika jenis permainan ditulis "AI pilih", pilih jenis yang paling sesuai dengan tajuk dan nyatakan sebabnya.

=== KEPERLUAN KANDUNGAN ===
- Semua soalan MESTI selaras dengan DSKP dan buku teks bagi tahun dan tajuk di atas. Jangan masukkan fakta di luar tahap murid.
- Gunakan istilah yang sama seperti dalam buku teks.
- Setiap soalan ada maklum balas ringkas apabila salah (terangkan jawapan betul dalam 1 ayat).
- Jika maklumat guru tidak lengkap, nyatakan andaian anda dalam komen di bahagian atas kod.
- Simpan semua soalan dalam satu array JavaScript di bahagian atas skrip supaya guru mudah menyunting.

=== SKRIN TETAPAN (sebelum mula) ===
- Tajuk permainan, mata pelajaran, tahun dan Standard Pembelajaran.
- Pilihan MOD: Mod Individu atau Mod Kumpulan (ikut "Mod permainan" di atas; jika "Kedua-dua", beri kedua-dua pilihan).
- Mod Kumpulan: pilih 2, 3 atau 4 kumpulan (MAKSIMUM 4), ruang namakan kumpulan (lalai: Merah, Biru, Hijau, Kuning), setiap kumpulan berwarna tersendiri.
- Butang Hidup/Mati bunyi, butang Skrin Penuh dan butang MULA.

=== MOD INDIVIDU ===
- Satu murid bermain pada skrin penuh.
- Papar nombor soalan, markah, pemasa dan bar kemajuan.
- Di akhir: markah, peratus, bintang (1–3), senarai soalan yang salah beserta jawapan betul, butang "Main Semula".

=== MOD KUMPULAN — SKRIN BERPECAH (SPLIT SCREEN) ===
- 2 kumpulan: kiri | kanan. 3 kumpulan: tiga lajur. 4 kumpulan: grid 2 x 2.
- Setiap panel BERFUNGSI BEBAS: soalan, pemasa, markah dan kemajuan sendiri; murid menjawab serentak tanpa mengganggu panel lain.
- Gunakan Pointer Events supaya sentuhan serentak (multi-touch) di Smartboard/TV sentuh berfungsi untuk semua panel.
- Semua kumpulan dapat SET SOALAN YANG SAMA, tetapi susunan soalan dan pilihan jawapan dirawakkan bagi setiap kumpulan.
- Panel berwarna ikut kumpulan dengan nama kumpulan jelas di atas.
- Teks dan butang cukup besar walaupun dalam grid 2 x 2 (butang minimum ±60px tinggi).
- Papan markah langsung kecil di tengah/atas skrin.
- Kumpulan yang selesai memaparkan "SELESAI!" dan menunggu kumpulan lain.
- Di akhir: papan kedudukan (Tempat 1–4) dengan animasi juara/konfeti, markah dan masa setiap kumpulan (masa sebagai pemutus seri), butang "Main Semula" dan "Kembali ke Tetapan".

=== REKA BENTUK & TEKNIKAL ===
- Satu fail HTML sahaja, tiada pemasangan, tiada log masuk.
- Berfungsi tanpa internet: tiada imej/fail luar; guna emoji, CSS dan SVG dalam kod.
- Bunyi menggunakan Web Audio API (betul, salah, tamat masa, menang).
- Reka bentuk ceria, warna terang, fon besar, mesra murid sekolah rendah.
- Responsif untuk skrin landskap (TV/projektor) dan tablet.
- Butang "Jeda" dan "Keluar" untuk guru.
- Kod kemas dengan komen dalam Bahasa Melayu.

=== OUTPUT ===
1. Kod HTML penuh dalam satu blok kod supaya boleh disalin terus.
2. Selepas kod: senarai Standard Pembelajaran yang diliputi, senarai semua soalan dan jawapan (untuk semakan guru), dan cara ringkas menukar/menambah soalan.`},
{id:'s2',category:'interaktif',title:'Kuiz aneka pilihan dengan pemasa',prompt_text:`Bina satu fail HTML tunggal (HTML, CSS dan JS dalam satu fail) untuk kuiz aneka pilihan:
- Mata pelajaran: [MATA PELAJARAN]
- Tahun: [TAHUN]
- Topik: [TOPIK]
- Bilangan soalan: [10]
- Masa setiap soalan: [20] saat

Ciri-ciri:
- Satu soalan dipaparkan pada satu masa dengan 4 pilihan jawapan (butang besar).
- Tunjuk jawapan betul dengan warna hijau dan salah dengan warna merah.
- Bar masa yang berkurang dan skor di bahagian atas.
- Skrin keputusan di akhir dengan bintang (1–3) dan butang "Cuba Lagi".
- Rekaan ceria untuk murid sekolah rendah dan sesuai untuk Smartboard.

Berikan kod penuh sahaja.`},
{id:'s3',category:'rph',title:'RPH harian ringkas',prompt_text:`Sediakan Rancangan Pengajaran Harian (RPH) berdasarkan KSSR (Semakan) untuk:
- Mata pelajaran: [MATA PELAJARAN]
- Tahun: [TAHUN]
- Tarikh / masa: [TARIKH], [MASA] ([60] minit)
- Tajuk: [TAJUK]
- Standard Kandungan: [SK]
- Standard Pembelajaran: [SP]

Sertakan:
1. Objektif pembelajaran (boleh diukur).
2. Kriteria kejayaan.
3. Set induksi (5 minit).
4. Aktiviti utama berpusatkan murid (PAK21).
5. Penutup dan refleksi.
6. Elemen merentas kurikulum (EMK) dan nilai murni.
7. Bahan bantu mengajar.
8. Cadangan aktiviti pengayaan dan pemulihan.

Tulis dalam format jadual yang ringkas.`},
{id:'s4',category:'latihan',title:'Lembaran kerja 3 aras',prompt_text:`Bina lembaran kerja untuk murid [TAHUN] bagi mata pelajaran [MATA PELAJARAN], topik [TOPIK].

Bahagikan kepada 3 aras:
- Aras 1 (Asas): [5] soalan mudah untuk murid lemah.
- Aras 2 (Sederhana): [5] soalan aplikasi.
- Aras 3 (Mencabar/KBAT): [3] soalan pemikiran aras tinggi.

Sertakan ruang nama, kelas dan tarikh di atas, arahan ringkas setiap bahagian, dan skema jawapan di bahagian akhir (berasingan).`},
{id:'s5',category:'latihan',title:'Soalan KBAT berdasarkan topik',prompt_text:`Hasilkan [5] soalan KBAT untuk murid [TAHUN], mata pelajaran [MATA PELAJARAN], topik [TOPIK].

Untuk setiap soalan nyatakan:
- Aras taksonomi Bloom (mengaplikasi / menganalisis / menilai / mencipta)
- Situasi kehidupan harian yang dekat dengan murid di Malaysia
- Cadangan jawapan / skema pemarkahan ringkas

Gunakan bahasa yang mudah difahami murid sekolah rendah.`},
{id:'s6',category:'pentaksiran',title:'Rubrik PBD Tahap Penguasaan 1–6',prompt_text:`Sediakan rubrik Pentaksiran Bilik Darjah (PBD) untuk:
- Mata pelajaran: [MATA PELAJARAN]
- Tahun: [TAHUN]
- Standard Pembelajaran: [SP]
- Aktiviti / tugasan: [AKTIVITI]

Bina jadual Tahap Penguasaan 1 hingga 6 dengan tafsiran umum dan deskriptor khusus untuk tugasan ini, serta contoh evidens yang boleh dikumpul oleh guru bagi setiap tahap.`},
{id:'s7',category:'nota',title:'Nota ringkas & peta minda untuk murid',prompt_text:`Ringkaskan topik [TOPIK] dalam mata pelajaran [MATA PELAJARAN] untuk murid [TAHUN].

Sediakan:
1. Nota ringkas dalam bentuk poin (bahasa mudah, ayat pendek).
2. [5] istilah penting beserta maksud.
3. Rangka peta minda (topik utama → cabang → contoh).
4. [3] soalan semakan kendiri di akhir.`},
{id:'s8',category:'pentadbiran',title:'Surat makluman kepada ibu bapa',prompt_text:`Tulis surat makluman rasmi kepada ibu bapa/penjaga murid [TAHUN/KELAS] daripada [NAMA SEKOLAH] berkenaan:
- Perkara: [PERKARA, cth: lawatan sambil belajar / program kecemerlangan]
- Tarikh dan masa: [TARIKH], [MASA]
- Tempat: [TEMPAT]
- Bayaran / bawaan (jika ada): [BUTIRAN]
- Tarikh akhir maklum balas: [TARIKH AKHIR]

Gunakan format surat rasmi sekolah dalam Bahasa Melayu dan sertakan keratan jawapan di bahagian bawah.`},
{id:'s9',category:'rph',title:'Idea aktiviti PAK21 untuk satu tajuk',prompt_text:`Cadangkan [5] aktiviti PAK21 untuk mengajar [TAJUK] kepada murid [TAHUN] ([BILANGAN] orang, kelas [ARAS: lemah/sederhana/cemerlang]).

Untuk setiap aktiviti berikan: nama aktiviti (cth: Gallery Walk, Think-Pair-Share, Round Robin), langkah pelaksanaan, anggaran masa, bahan diperlukan dan cara mentaksir murid.`}
];

var dbPrompts=[],promptCat='all',promptReady=false;
function setPromptCat(c){promptCat=c;renderPromptCats();renderPrompts()}
function renderPromptCats(){
  const cats=[{id:'all',label:'Semua'},...PROMPT_CATS];
  $('promptCats').innerHTML=cats.map(c=>`<button type="button" data-c="${c.id}" class="pc shrink-0 px-4 py-2 rounded-xl font-bold ${c.id===promptCat?'bg-slate-900 text-white':'bg-white/80 text-slate-800'}">${c.label}</button>`).join('');
  $('promptCats').querySelectorAll('.pc').forEach(b=>b.onclick=()=>setPromptCat(b.dataset.c));
}
$('promptCategory').innerHTML=PROMPT_CATS.map(c=>`<option value="${c.id}">${c.label}</option>`).join('');

function highlightPh_(text){return escapeHtml(text).replace(/\[([^\]\n]{1,60})\]/g,'<span class="ph">[$1]</span>')}
function canEditPrompt_(p){return !p.starter&&user&&(isAdmin||String(p.author_email||'').toLowerCase()===String(user.email||'').toLowerCase())}
function allPrompts_(){return [...dbPrompts,...STARTER_PROMPTS.map(p=>({...p,starter:true,author_name:'SMART HUB'}))]}

function renderPrompts(){
  const q=($('promptSearch').value||'').toLowerCase().trim();
  const rows=allPrompts_().filter(p=>(promptCat==='all'||p.category===promptCat)&&`${p.title} ${p.prompt_text} ${p.subject||''}`.toLowerCase().includes(q));
  $('promptGrid').innerHTML=rows.map(p=>`<article class="bg-white rounded-3xl shadow border-2 ${p.starter?'border-amber-100':'border-emerald-100'} p-4 flex flex-col gap-3">
    <div class="flex flex-wrap gap-1.5 items-center">
      <span class="text-[11px] font-black px-2 py-1 rounded-full bg-amber-100 text-amber-900">${escapeHtml(catLabel(p.category))}</span>
      ${p.subject?`<span class="text-[11px] font-black px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">${escapeHtml(p.subject)}</span>`:''}
      ${p.year?`<span class="text-[11px] font-black px-2 py-1 rounded-full bg-slate-100 text-slate-700">Tahun ${escapeHtml(p.year)}</span>`:''}
      ${p.starter?'<span class="text-[11px] font-black px-2 py-1 rounded-full bg-slate-900 text-amber-300">⭐ Asas</span>':''}
    </div>
    <h4 class="font-black font-display text-lg leading-snug">${escapeHtml(p.title)}</h4>
    <div class="prompt-body bg-slate-50 rounded-xl p-3 font-mono text-slate-700" id="pb-${p.id}">${highlightPh_(p.prompt_text)}</div>
    <div class="flex gap-2 mt-auto">
      <button type="button" onclick="copyPrompt('${p.id}',this)" class="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black"><i class="fa-solid fa-copy mr-1"></i> Salin Prompt</button>
      <button type="button" onclick="togglePrompt('${p.id}',this)" class="px-4 bg-slate-100 rounded-xl font-bold">Lihat</button>
    </div>
    ${p.builder?`<button type="button" onclick="openGameBuilder()" class="w-full bg-amber-400 text-slate-950 py-3 rounded-xl font-black"><i class="fa-solid fa-wand-magic-sparkles mr-1"></i> Isi Borang &amp; Jana Prompt</button>`:''}
    <div class="flex items-center justify-between gap-2 text-[11px] text-slate-500">
      <span class="truncate">oleh <b>${escapeHtml(p.author_name||'Guru')}</b>${p.starter?'':` • ${Number(p.copy_count||0)} kali disalin`}</span>
      ${canEditPrompt_(p)?`<span class="flex gap-1 shrink-0"><button type="button" onclick="editPrompt('${p.id}')" class="px-2 py-1 bg-slate-100 rounded-lg font-bold" style="min-height:0">Edit</button><button type="button" onclick="deletePrompt('${p.id}')" class="px-2 py-1 bg-red-100 text-red-700 rounded-lg font-bold" style="min-height:0">Hapus</button></span>`:''}
    </div>
  </article>`).join('')||'<div class="col-span-full p-10 text-center bg-white rounded-3xl">Tiada prompt dijumpai.</div>';
}
function togglePrompt(id,btn){const el=$('pb-'+id);if(!el)return;const open=el.classList.toggle('open');btn.textContent=open?'Tutup':'Lihat'}

async function copyText_(text){
  try{if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return true}}catch(_){}
  const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;top:0;left:0;opacity:0';
  document.body.appendChild(ta);ta.select();ta.setSelectionRange(0,text.length);
  let ok=false;try{ok=document.execCommand('copy')}catch(_){}
  ta.remove();return ok;
}
async function copyPrompt(id,btn){
  const p=allPrompts_().find(x=>String(x.id)===String(id));if(!p)return;
  const ok=await copyText_(p.prompt_text);
  if(!ok){toast('Gagal menyalin. Tekan "Lihat" dan salin secara manual.');return}
  const old=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-check mr-1"></i> Disalin!';btn.classList.replace('bg-emerald-600','bg-slate-900');
  setTimeout(()=>{btn.innerHTML=old;btn.classList.replace('bg-slate-900','bg-emerald-600')},1800);
  toast('Prompt disalin. Tampal ke ChatGPT / Gemini / Claude.');
  if(!p.starter&&sb){p.copy_count=Number(p.copy_count||0)+1;sb.rpc('increment_prompt_copy',{prompt_id:p.id}).then(()=>{},()=>{})}
}

async function loadPrompts(){
  renderPromptCats();
  if(!sb||!user){renderPrompts();return}
  const {data,error}=await sb.from('prompts').select('*').order('created_at',{ascending:false});
  if(error){
    console.warn('Prompt:',error);
    $('promptNotice').textContent='Prompt kongsi belum tersedia. Admin perlu jalankan SMART_HUB_PROMPTS.sql di Supabase. Prompt asas di bawah masih boleh disalin.';
    $('promptNotice').classList.remove('hidden');promptReady=false;dbPrompts=[];
  }else{$('promptNotice').classList.add('hidden');promptReady=true;dbPrompts=data||[]}
  renderPrompts();
}

function openPromptForm_(p){
  $('promptForm').classList.remove('hidden');
  $('promptFormTitle').textContent=p?'✏️ Edit Prompt':'✍️ Kongsi Prompt Baharu';
  $('promptId').value=p?p.id:'';$('promptTitle').value=p?p.title:'';$('promptCategory').value=p?p.category:(promptCat!=='all'?promptCat:'interaktif');
  $('promptSubject').value=p?.subject||'';$('promptYear').value=p?.year||'';$('promptText').value=p?p.prompt_text:'';$('promptMsg').textContent='';
  $('promptTitle').focus();$('promptForm').scrollIntoView({behavior:'smooth',block:'start'});
}
function closePromptForm_(){$('promptForm').reset();$('promptForm').classList.add('hidden')}
$('promptNewBtn').onclick=()=>{if(!promptReady){toast('Jadual prompt belum disediakan di Supabase.');return}openPromptForm_(null)};
$('promptCancelBtn').onclick=closePromptForm_;
function editPrompt(id){const p=dbPrompts.find(x=>String(x.id)===String(id));if(p)openPromptForm_(p)}
async function deletePrompt(id){
  if(!confirm('Hapus prompt ini?'))return;
  const {error}=await sb.from('prompts').delete().eq('id',id);
  if(error)return toast(error.message);
  await loadPrompts();toast('Prompt dihapus.');
}
$('promptForm').onsubmit=async e=>{
  e.preventDefault();if(!sb||!user)return;
  const id=$('promptId').value;
  const payload={title:$('promptTitle').value.trim(),category:$('promptCategory').value,subject:$('promptSubject').value||null,year:$('promptYear').value||null,prompt_text:$('promptText').value.trim(),updated_at:new Date().toISOString()};
  if(!payload.title||!payload.prompt_text){$('promptMsg').textContent='Isi tajuk dan prompt.';return}
  $('promptMsg').textContent='Menyimpan...';
  let res;
  if(id)res=await sb.from('prompts').update(payload).eq('id',id);
  else{
    const meta=user.user_metadata||{};
    res=await sb.from('prompts').insert({...payload,author_email:String(user.email||'').toLowerCase(),author_name:meta.full_name||meta.name||String(user.email||'').split('@')[0]});
  }
  if(res.error){$('promptMsg').textContent=res.error.message;return}
  closePromptForm_();await loadPrompts();toast(id?'Prompt dikemas kini.':'Prompt dikongsi. Terima kasih!');
};

/* ---------- Borang Jana Prompt Permainan (untuk prompt s1) ---------- */
var GAME_TYPES=['AI pilih yang paling sesuai','Kuiz Pelbagai Pilihan (A/B/C/D)','Betul atau Salah','Padankan Pasangan','Isi Tempat Kosong','Susun Huruf / Susun Perkataan','Seret & Lepas ke Kategori','Kad Memori','Roda Putar Soalan','Lumba ke Garisan Penamat','Pecahkan Belon Jawapan Betul','Teka Gambar / Emoji','Susun Mengikut Urutan'];
function gbField_(label,html){return `<label class="block"><span class="block text-xs font-black text-slate-600 mb-1">${label}</span>${html}</label>`}
function buildGameBuilder_(){
  if($('gameBuilder'))return;
  const inp='w-full p-3 border-2 border-slate-200 rounded-xl';
  const opts=a=>a.map(x=>`<option>${escapeHtml(x)}</option>`).join('');
  const wrap=document.createElement('div');
  wrap.id='gameBuilder';
  wrap.className='hidden fixed inset-0 z-[90] bg-slate-950/70 flex items-end sm:items-center justify-center p-0 sm:p-4';
  wrap.innerHTML=`<div class="bg-white w-full sm:max-w-3xl max-h-[95vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 space-y-4">
    <div class="flex items-start justify-between gap-3"><div><h3 class="font-black font-display text-xl">🎮 Jana Prompt Permainan</h3><p class="text-xs text-slate-500 mt-1">Isi borang, tekan Salin, kemudian tampal ke ChatGPT / Gemini / Claude.</p></div><button type="button" id="gbClose" class="px-3 py-2 bg-slate-100 rounded-xl font-bold">Tutup</button></div>
    <div class="grid sm:grid-cols-2 gap-3">
      ${gbField_('Mata pelajaran',`<select id="gbSubject" class="${inp}"><option value="">— Pilih —</option>${opts(SUBJECTS)}</select>`)}
      ${gbField_('Tahun',`<select id="gbYear" class="${inp}"><option value="">— Pilih —</option>${opts(['1','2','3','4','5','6'].map(y=>'Tahun '+y))}</select>`)}
      <div class="sm:col-span-2">${gbField_('Tema / Unit / Tajuk',`<input id="gbTopic" class="${inp}" placeholder="cth: Unit 3 – Pecahan">`)}</div>
      ${gbField_('Standard Kandungan',`<input id="gbSK" class="${inp}" placeholder="cth: 3.1 Pecahan wajar">`)}
      ${gbField_('Standard Pembelajaran',`<input id="gbSP" class="${inp}" placeholder="cth: 3.1.1, 3.1.2">`)}
      ${gbField_('Muka surat buku teks',`<input id="gbPage" class="${inp}" placeholder="cth: 45–52">`)}
      ${gbField_('Bahasa permainan',`<select id="gbLang" class="${inp}">${opts(['Bahasa Melayu','English','Bahasa Arab','Jawi'])}</select>`)}
      ${gbField_('Jenis permainan',`<select id="gbType" class="${inp}">${opts(GAME_TYPES)}</select>`)}
      ${gbField_('Mod permainan',`<select id="gbMode" class="${inp}">${opts(['Kedua-dua (Individu & Kumpulan)','Mod Individu sahaja','Mod Kumpulan sahaja (2–4 kumpulan, split screen)'])}</select>`)}
      ${gbField_('Bilangan soalan',`<select id="gbCount" class="${inp}">${opts(['10','15','20','5'])}</select>`)}
      ${gbField_('Had masa per soalan',`<select id="gbTime" class="${inp}">${opts(['20 saat','30 saat','15 saat','10 saat','Tiada had masa'])}</select>`)}
      ${gbField_('Tahap kesukaran',`<select id="gbLevel" class="${inp}">${opts(['Campuran','Mudah','Sederhana','Mencabar'])}</select>`)}
      <div class="sm:col-span-2">${gbField_('Kandungan tambahan (pilihan)',`<textarea id="gbExtra" rows="3" class="${inp}" placeholder="Tampal nota, senarai perkataan atau soalan sendiri di sini"></textarea>`)}</div>
    </div>
    <div><span class="block text-xs font-black text-slate-600 mb-1">Pratonton prompt</span><div id="gbPreview" class="prompt-body open bg-slate-50 rounded-xl p-3 font-mono text-slate-700" style="max-height:16rem;overflow-y:auto"></div></div>
    <button type="button" id="gbCopy" class="w-full bg-emerald-600 text-white py-3 rounded-xl font-black"><i class="fa-solid fa-copy mr-1"></i> Salin Prompt</button>
  </div>`;
  document.body.appendChild(wrap);
  wrap.addEventListener('click',e=>{if(e.target===wrap)closeGameBuilder()});
  $('gbClose').onclick=closeGameBuilder;
  wrap.querySelectorAll('input,select,textarea').forEach(el=>el.addEventListener('input',renderGameBuilder_));
  $('gbCopy').onclick=async()=>{
    const ok=await copyText_(gameBuilderText_());
    toast(ok?'Prompt disalin. Tampal ke ChatGPT / Gemini / Claude.':'Gagal menyalin. Pilih teks pratonton dan salin secara manual.');
  };
}
function gameBuilderText_(){
  const base=(STARTER_PROMPTS.find(p=>p.id==='s1')||{}).prompt_text||'';
  const v=id=>($(id).value||'').trim();
  const map={
    '[MATA PELAJARAN]':v('gbSubject'),'[TAHUN]':v('gbYear'),'[TAJUK]':v('gbTopic'),
    '[STANDARD KANDUNGAN]':v('gbSK'),'[STANDARD PEMBELAJARAN]':v('gbSP'),'[MUKA SURAT]':v('gbPage')||'(tiada)',
    '[BAHASA]':v('gbLang'),'[BILANGAN SOALAN]':v('gbCount'),'[HAD MASA]':v('gbTime'),'[TAHAP KESUKARAN]':v('gbLevel'),
    '[JENIS PERMAINAN]':v('gbType').startsWith('AI pilih')?'AI pilih':v('gbType'),'[MOD PERMAINAN]':v('gbMode'),
    '[NOTA / SOALAN SENDIRI (jika ada)]':v('gbExtra')||'(tiada)'
  };
  let t=base;
  Object.keys(map).forEach(k=>{if(map[k])t=t.split(k).join(map[k])});
  return t;
}
function renderGameBuilder_(){$('gbPreview').innerHTML=highlightPh_(gameBuilderText_())}
function openGameBuilder(){
  buildGameBuilder_();
  $('gameBuilder').classList.remove('hidden');document.body.style.overflow='hidden';
  renderGameBuilder_();
}
function closeGameBuilder(){$('gameBuilder').classList.add('hidden');document.body.style.overflow=''}
$('promptSearch').oninput=renderPrompts;
renderPromptCats();renderPrompts();

if(sb){const statusEl=$('supabaseStatus');if(statusEl){statusEl.textContent=' • Supabase disambungkan';statusEl.className='text-[10px] font-bold text-emerald-600'}sb.auth.getSession().then(async({data})=>{if(data.session?.user)await verifyTeacherAccess(data.session.user,false);else{user=null;isAdmin=false;renderTeacherState()}});sb.auth.onAuthStateChange((_e,s)=>{setTimeout(async()=>{if(s?.user)await verifyTeacherAccess(s.user,true);else{user=null;isAdmin=false;renderTeacherState()}},0)})}else renderTeacherState();
renderResources();renderGames();loadFromSupabase();
let deferredInstallPrompt=null;
const installBtn=document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();
  deferredInstallPrompt=e;
  if(installBtn) installBtn.classList.remove('hidden');
});
if(installBtn) installBtn.addEventListener('click',async()=>{
  if(!deferredInstallPrompt){
    toast('Jika butang pemasangan tidak muncul, buka menu Chrome ⋮ dan pilih Install app / Add to Home screen.');
    return;
  }
  deferredInstallPrompt.prompt();
  const choice=await deferredInstallPrompt.userChoice;
  if(choice.outcome==='accepted') toast('SMART HUB sedang dipasang...');
  deferredInstallPrompt=null;
  installBtn.classList.add('hidden');
});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;if(installBtn)installBtn.classList.add('hidden');toast('SMART HUB berjaya dipasang pada peranti.');});
if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
