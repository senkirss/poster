/* Posteria - bagian editor: panel, drag & drop, pegangan ubah ukuran/putar,
   layer, halaman, autosave, ekspor PNG/JPEG/PDF, dan berbagi. */
/* ============ ALA CANVA: tab, template, seret elemen, stiker, zoom ============ */
function zeroPos(){ return { badge:[0,0], icon:[0,0], title:[0,0], sub:[0,0], foot:[0,0] }; }
let POS=zeroPos();       // offset elemen (fraksi lebar/tinggi poster)
let STICKER=null;        // {emoji,size,x,y} — x,y = posisi pusat 0..1
let zoom=1;
let drawVisible=true, stickerFront=true;
const ZBASE=['badge','icon','title','sub','foot','sticker','extras','shapes'];
let ZORDER=[...ZBASE];
let SHAPES=[], selectedShapeId=null, shapeSeq=1, builtShapeIds='__none__', shapesVisible=true;
let activeSel=null, selectedExtraId=null;

/* ---- Rel tab ---- */
function switchTab(name){
  document.querySelectorAll('[data-panel]').forEach(p=>p.classList.toggle('hidden', p.dataset.panel!==name));
  document.querySelectorAll('#rail .rail-btn').forEach(b=>b.classList.toggle('active', b.dataset.tab===name));
}
document.querySelectorAll('#rail .rail-btn').forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));

/* ---- Galeri template sekali klik ---- */
const TEMPLATES=[
  { name:'Promo Gajian', c1:'#16233A', c2:'#7A4033', vpos:'center', angle:150, font:'modern', badge:'Promo Gajian', title:'Diskon Akhir Tahun', subtitle:'Semua item −20% • sampai 31 Desember', footer:'Lihat Koleksi', mark:'Label', iconSize:64, titleSize:46, titleColor:'#F3EDDC', align:'center', pattern:'none', size:'portrait', cat:'bisnis' },
  { name:'Ngopi Pagi', c1:'#33210F', c2:'#8C5A2B', vpos:'bottom', angle:140, font:'serif', badge:'Kedai Kopi', title:'Ngopi Pagi di Sini', subtitle:'Kopi susu • roti bakar • meja di teras', footer:'Buka 07.00–21.00', mark:'Kopi', iconSize:58, titleSize:44, titleColor:'#F3EDDC', align:'left', pattern:'none', size:'square', cat:'makanan' },
  { name:'Serba 99 Ribu', c1:'#5E1B1B', c2:'#A8471F', vpos:'top', angle:120, font:'playful', badge:'Sale', title:'Serba 99 Ribu', subtitle:'Stok terbatas • replenisi tiap Jumat', footer:'Cek Toko Online', mark:'Petir', iconSize:66, titleSize:48, titleColor:'#F3EDDC', align:'center', pattern:'dots', size:'portrait', cat:'bisnis' },
  { name:'Konser Amal', c1:'#101A33', c2:'#33406B', vpos:'center', angle:160, font:'modern', badge:'Live Music', title:'Konser Amal Akhir Pekan', subtitle:'Sabtu, 19.00 • Gedung Serba Guna', footer:'Tiket 50rb', mark:'Musik', iconSize:60, titleSize:42, titleColor:'#F3EDDC', align:'center', pattern:'grid', size:'story', cat:'event' },
  { name:'Undangan', c1:'#2C2724', c2:'#7E6E5E', vpos:'center', angle:150, font:'elegant', badge:'Save the Date', title:'Pernikahan Andini & Bagas', subtitle:'Minggu, 14 Februari • Gedung Serba Guna', footer:'Konfirmasi Kehadiran', mark:'Hati', iconSize:54, titleSize:46, titleColor:'#F3EDDC', align:'center', pattern:'none', size:'portrait', cat:'undangan', elems:{icon:false} },
  { name:'Sayur Segar', c1:'#12351F', c2:'#2F6B3A', vpos:'bottom', angle:135, font:'playful', badge:'Menu Harian', title:'Sayur Segar Tiba Pagi', subtitle:'Dipetik pagi ini, dikirim hari yang sama', footer:'Pesan via WhatsApp', mark:'Daun', iconSize:62, titleSize:44, titleColor:'#F3EDDC', align:'left', pattern:'none', size:'square', cat:'makanan' },
  { name:'Catatan Hari', c1:'#191717', c2:'#3D3A38', vpos:'center', angle:150, font:'serif', badge:'Catatan', title:'Mulai dari yang kecil', subtitle:'Satu langkah hari ini sudah cukup', footer:'', mark:'Peti Kata', iconSize:52, titleSize:42, titleColor:'#F3EDDC', align:'center', pattern:'none', size:'square', cat:'kutipan', elems:{icon:false,footer:false} },
  { name:'Kelas Desain', c1:'#0B3A54', c2:'#1D6273', vpos:'top', angle:140, font:'modern', badge:'Kelas Pemula', title:'Belajar Desain Grafis dari Nol', subtitle:'4 pertemuan • Zoom • sertifikat', footer:'Daftar Batch Terbaru', mark:'Sasaran', iconSize:58, titleSize:42, titleColor:'#F3EDDC', align:'center', pattern:'none', size:'story', cat:'edukasi', elems:{icon:false} },
  { name:'Toko Baru', c1:'#2B1D12', c2:'#7A4B1E', vpos:'center', angle:130, font:'playful', badge:'Buka Baru', title:'Toko Baru Buka Besok', subtitle:'Potongan 20% untuk pembeli pertama', footer:'Gudang Lama No. 12', mark:'Kado', iconSize:62, titleSize:46, titleColor:'#F3EDDC', align:'center', pattern:'dots', size:'portrait', cat:'bisnis' },
  { name:'Nasi Goreng', c1:'#3A1512', c2:'#7E2E22', vpos:'bottom', angle:150, font:'serif', badge:'Menu', title:'Nasi Goreng Spesial', subtitle:'Bumbu kacang, sambal matah, telur dadar', footer:'Makan di Tempat', mark:'Piring', iconSize:58, titleSize:44, titleColor:'#F3EDDC', align:'left', pattern:'none', size:'square', cat:'makanan' },
  { name:'Barista', c1:'#0E3B3C', c2:'#245C5A', vpos:'top', angle:140, font:'modern', badge:'Dibutuhkan', title:'Barista Full Time', subtitle:'Gaji terjadwal • mess tersedia • lamar via WA', footer:'Kirim CV', mark:'Koper', iconSize:58, titleSize:42, titleColor:'#F3EDDC', align:'center', pattern:'grid', size:'portrait', cat:'bisnis', elems:{icon:false} },
  { name:'Webinar', c1:'#141A33', c2:'#2A3260', vpos:'center', angle:150, font:'montserrat', badge:'Webinar Gratis', title:'Jualan Online untuk Pemula', subtitle:'Jumat, 19.30 • Zoom • 60 menit', footer:'Daftar Gratis', mark:'Layar', iconSize:58, titleSize:42, titleColor:'#F3EDDC', align:'center', pattern:'none', size:'story', cat:'edukasi' },
];
const TPL_CAT={ 0:'bisnis', 1:'makanan', 2:'bisnis', 3:'event', 4:'undangan', 5:'makanan', 6:'kutipan', 7:'edukasi' };
function clickOpt(sel, attr, val){ const b=document.querySelector(sel+' [data-'+attr+'="'+val+'"]'); if(b) b.click(); }
const tplGallery=$('tplGallery');
TEMPLATES.forEach((t,i)=>{
  const b=document.createElement('button');
  b.className='group text-left rounded-xl overflow-hidden border-2 border-slate-200 hover:border-indigo-400 hover:shadow-card hover:-translate-y-0.5 transition-all';
  b.innerHTML='<span class="block h-16" style="background:linear-gradient(135deg,'+t.c1+','+t.c2+')"></span>'
    +'<span class="block px-2 py-1.5 text-[11px] font-extrabold bg-white dark:bg-[#232B4D]">'+t.name+'</span>';
  b.onclick=()=>applyTemplate(i);
  tplGallery.appendChild(b);
});

/* ============================================================
   TEMPLATE SAYA + FAVORIT (disimpan di localStorage)
   ============================================================ */
const MY_KEY='posteria-my-templates-v1', FAV_KEY='posteria-favorites-v1';
let MY_TPL=[], FAVS=[];
$('btnSaveTpl').onclick=()=>{
  saveCurrentPage();
  const snap=snapshot();
  const name=(($('docTitle')&&$('docTitle').value)||'Template saya').trim()||'Template saya';
  const my={ id:'my'+Date.now().toString(36), name, snap, c1:snap.S.c1, c2:snap.S.c2, title:snap.S.title, size:snap.S.size };
  MY_TPL.unshift(my);
  if(MY_TPL.length>40) MY_TPL.length=40;
  saveMyTpl();
  renderLandingGallery();
  toast('Template disimpan di "Milikku".');
};

/* Galeri landing ala Canva Templates: masonry + cari + kategori */
const TPL_RATIO={ portrait:'3/4', square:'1/1', story:'9/16' };
const TPL_SIZELBL={ portrait:'Portrait 3:4', square:'Square 1:1', story:'Story 9:16' };
let galCat='semua', galQ='';
$('landingGallery').addEventListener('click',e=>{
  const fav=e.target.closest?e.target.closest('[data-fav]'):null;
  if(fav){ e.stopPropagation(); toggleFav(fav.dataset.fav); return; }
  const btn=e.target.closest?e.target.closest('[data-tpluse]'):null;
  if(!btn) return;
  e.stopPropagation();
  applyTemplate(+btn.dataset.tpluse);
  document.getElementById('studio').scrollIntoView({ behavior:'smooth' });
});
/* Baris pratinjau di hero: poster asli dari template, bisa diklik */
document.addEventListener('click',e=>{
  const b=e.target.closest?e.target.closest('[data-open-tpl]'):null;
  if(!b) return;
  applyTemplate(+b.dataset.openTpl);
  document.getElementById('studio').scrollIntoView({ behavior:'smooth' });
});
$('tplSearch').addEventListener('input',e=>{ galQ=e.target.value.toLowerCase().trim(); renderLandingGallery(); });
$('tplSearch').addEventListener('keydown',e=>{ if(e.key==='Enter') document.getElementById('galeri').scrollIntoView({ behavior:'smooth' }); });
$('tplSearchBtn').onclick=()=>document.getElementById('galeri').scrollIntoView({ behavior:'smooth' });
document.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{
  galCat=b.dataset.cat;
  document.querySelectorAll('[data-cat]').forEach(x=>{
    const on=x===b;
    x.classList.toggle('is-on',on);
  });
  renderLandingGallery();
});
document.querySelectorAll('[data-tag]').forEach(b=>b.onclick=()=>{
  $('tplSearch').value=b.dataset.tag; galQ=b.dataset.tag.toLowerCase();
  renderLandingGallery();
  document.getElementById('galeri').scrollIntoView({ behavior:'smooth' });
});

/* ---- Stiker mengambang ---- */
const STICKERS=['⭐','❤️','🔥','🎉','💡','✨','🎈','🌈','💎','👑','🍕','☕'];
const stickerGroup=$('stickerGroup');
(function buildStickers(){
  const none=document.createElement('button');
  none.className='opt-btn text-lg border-2 rounded-xl py-1.5 hover:scale-110 hover:shadow-card border-slate-200';
  none.innerHTML=markSvg('Henti',16,'currentColor'); none.title='Tanpa stiker'; none.dataset.sticker='';
  none.onclick=()=>{ pushHistory(); STICKER=null; syncStickerUI(); render(); };
  stickerGroup.appendChild(none);
  STICKERS.forEach(em=>{
    const b=document.createElement('button');
    b.className='opt-btn text-xl border-2 rounded-xl py-1.5 hover:scale-110 hover:shadow-card border-slate-200';
    b.textContent=em; b.title=em; b.dataset.sticker=em;
    b.onclick=()=>{
      const keep=STICKER;
      pushHistory();
      STICKER={ emoji:em, size:keep?keep.size:64, x:keep?keep.x:.84, y:keep?keep.y:.10 };
      syncStickerUI(); render();
    };
    stickerGroup.appendChild(b);
  });
})();
function syncStickerUI(){
  stickerGroup.querySelectorAll('.opt-btn').forEach(x=>{
    const on=(x.dataset.sticker===''&&!STICKER)||(STICKER&&x.dataset.sticker===STICKER.emoji);
    x.classList.toggle('active',on);
    x.classList.toggle('border-[#B97F1F] dark:border-[#E9B44C]',on); x.classList.toggle('bg-[#EFE3C2] dark:bg-[#2A3358]',on);
    x.classList.toggle('border-slate-200',!on);
  });
  $('inStickerSize').value=STICKER?STICKER.size:64;
  $('stickerSizeVal').textContent=(STICKER?STICKER.size:64)+'px';
}
$('inStickerSize').addEventListener('pointerdown',()=>{ if(STICKER) pushHistory(); });
$('inStickerSize').addEventListener('input',e=>{
  const v=+e.target.value;
  if(!STICKER) STICKER={ emoji:'⭐', size:v, x:.84, y:.10 };
  else STICKER.size=v;
  $('stickerSizeVal').textContent=v+'px';
  renderPositions();
});

/* ---- Seret elemen langsung di kanvas ---- */
function posterWH(){ return { W:poster.clientWidth||1, H:poster.clientHeight||1 }; }
function clampPos(v){ return Math.min(.45, Math.max(-.45, v)); }
function renderPositions(){
  const { W, H }=posterWH(); if(!W||!H) return;
  const map={ badge:pvBadge, icon:pvIconWrap, title:pvTitle, sub:pvSubtitle, foot:pvFooterWrap };
  for(const k in map){
    const el=map[k]; if(!el) continue;
    el.style.transform='translate('+(POS[k][0]*W).toFixed(1)+'px,'+(POS[k][1]*H).toFixed(1)+'px)'+(k==='icon'?' rotate('+(S.iconRot||0)+'deg)':'');
  }
  if(STICKER){
    pvSticker.style.display='block';
    pvSticker.textContent=STICKER.emoji;
    pvSticker.style.left=(STICKER.x*100)+'%';
    pvSticker.style.top=(STICKER.y*100)+'%';
    pvSticker.style.fontSize=(STICKER.size*(W/420)).toFixed(1)+'px';
    pvSticker.style.transform='translate(-50%,-50%) rotate('+(STICKER.rot||0)+'deg)';
  } else pvSticker.style.display='none';
  const zOf=k=>10+ZORDER.indexOf(k)*10;
  pvBadge.style.zIndex=zOf('badge'); pvIconWrap.style.zIndex=zOf('icon');
  pvTitle.style.zIndex=zOf('title'); pvSubtitle.style.zIndex=zOf('sub');
  pvFooterWrap.style.zIndex=zOf('foot');
  pvSticker.style.zIndex=zOf('sticker');
  const exL=$('extraLayer'); if(exL) exL.style.zIndex=zOf('extras');
  const shL=$('shapeLayer'); if(shL) shL.style.zIndex=zOf('shapes');
  posterInner.style.zIndex='auto';
}
document.querySelectorAll('#poster [data-drag]').forEach(el=>{
  el.addEventListener('pointerdown',e=>{
    if(drawTool!=='off'||(e.button!==undefined&&e.button===2)) return;
    const key=el.dataset.drag;
    if(isLocked(key)){ toast('Layer ini dikunci. Buka kuncinya dulu.'); return; }
    e.preventDefault();
    activeSel={kind:'drag',key};
    pushHistory();
    el.classList.add('dragging');
    const sx=e.clientX, sy=e.clientY;
    const ox=key==='sticker'?(STICKER?STICKER.x:.84):POS[key][0];
    const oy=key==='sticker'?(STICKER?STICKER.y:.10):POS[key][1];
    try{ el.setPointerCapture(e.pointerId); }catch(err){}
    const mv=ev=>{
      const { W, H }=posterWH();
      const dx=(ev.clientX-sx)/W, dy=(ev.clientY-sy)/H;
      if(key==='sticker'){
        if(!STICKER) return;
        STICKER.x=Math.min(.98, Math.max(.02, ox+dx));
        STICKER.y=Math.min(.98, Math.max(.02, oy+dy));
      } else {
        POS[key][0]=clampPos(ox+dx); POS[key][1]=clampPos(oy+dy);
      }
      const pr=poster.getBoundingClientRect(), er=el.getBoundingClientRect();
      const sn=snapCenter(((er.left+er.right)/2-pr.left)/pr.width, ((er.top+er.bottom)/2-pr.top)/pr.height);
      if(key==='sticker'){
        if(STICKER){ STICKER.x=sn.x; STICKER.y=sn.y; }
      } else {
        POS[key][0]+=sn.x-(((er.left+er.right)/2-pr.left)/pr.width);
        POS[key][1]+=sn.y-(((er.top+er.bottom)/2-pr.top)/pr.height);
      }
      renderPositions();
      if(typeof renderSelBox==='function') renderSelBox();
    };
    const up=()=>{
      hideGuides();
      el.classList.remove('dragging');
      el.removeEventListener('pointermove',mv);
      el.removeEventListener('pointerup',up);
      el.removeEventListener('pointercancel',up);
    };
    el.addEventListener('pointermove',mv);
    el.addEventListener('pointerup',up);
    el.addEventListener('pointercancel',up);
  });
  el.addEventListener('dblclick',()=>{
    const key=el.dataset.drag;
    if(key==='sticker'){ if(STICKER){ STICKER.x=.84; STICKER.y=.10; } }
    else POS[key]=[0,0];
    renderPositions();
    toast('🎯 Posisi elemen dikembalikan.');
  });
});
$('btnResetPos').onclick=()=>{
  pushHistory();
  POS=zeroPos();
  if(STICKER){ STICKER.x=.84; STICKER.y=.10; }
  renderPositions();
  toast('🎯 Semua posisi direset ke tengah.');
};

/* ---- Zoom pratinjau ---- */
function setZoom(z){
  zoom=Math.min(1.3, Math.max(.6, Math.round(z*10)/10));
  $('zoomVal').textContent=Math.round(zoom*100)+'%';
  const zvT=$('zoomValTop'); if(zvT) zvT.textContent=Math.round(zoom*100)+'%';
  render();
}
$('zoomIn').onclick=()=>setZoom(zoom+.1);
$('zoomOut').onclick=()=>setZoom(zoom-.1);
$('zoomInTop').onclick=()=>setZoom(zoom+.1);
$('zoomOutTop').onclick=()=>setZoom(zoom-.1);
$('btnDownloadTop').onclick=()=>exportPoster();

/* ============ TEKS BEBAS (tak terbatas, maks 6) ============ */
let EXTRAS=[], extraSeq=1, builtExtraIds='__none__';
$('btnAddText').onclick=()=>{
  if(EXTRAS.length>=15){ toast('️ Maksimal 15 teks bebas per halaman.'); return; }
  pushHistory();
  const f=FONTS[S.font];
  EXTRAS.push({ id:'x'+Date.now().toString(36)+(extraSeq++), text:'Teks baru '+(EXTRAS.length+1),
    size:Math.max(24,S.titleSize-8), color:S.titleColor, family:f.title, weight:f.weight, x:.5, y:.78, rot:0 });
  switchTab('teks');
  renderExtras(); renderExtraList();
  toast('Teks bebas ditambahkan, seret di kanvas!');
};
function renderExtras(){
  const layer=$('extraLayer'); if(!layer) return;
  const sig=EXTRAS.map(t=>t.id).join(',');
  if(sig!==builtExtraIds){
    layer.innerHTML='';
    EXTRAS.forEach(t=>{
      const d=document.createElement('div');
      d.dataset.extra=t.id;
      d.className='absolute';
      d.style.cssText+=';pointer-events:auto;white-space:nowrap;line-height:1.15;max-width:94%;';
      layer.appendChild(d);
    });
    builtExtraIds=sig;
  }
  const { W }=posterWH();
  EXTRAS.forEach(t=>{
    const el=layer.querySelector('[data-extra="'+t.id+'"]'); if(!el) return;
    el.style.left=(t.x*100)+'%'; el.style.top=(t.y*100)+'%';
    el.style.transform='translate(-50%,-50%) rotate('+(t.rot||0)+'deg)';
    el.style.fontSize=(t.size*(W/420)).toFixed(1)+'px';
    el.style.color=t.color; el.style.fontFamily=t.family; el.style.fontWeight=t.weight;
    el.style.textAlign='center';
    el.style.fontStyle=t.italic?'italic':'normal';
    el.style.fontWeight=(t.bold===false)?'400':(t.weight||800);
    el.style.textDecoration=t.underline?'underline':'none';
    el.style.letterSpacing=(t.ls||0)/100+'em';
    el.style.lineHeight=String(t.lh||1.15);
    if(!el.isContentEditable&&document.activeElement!==el) el.textContent=t.text;
  });
}
function renderExtraList(){
  const list=$('extraList'); if(!list) return;
  if(list.contains(document.activeElement)) return;
  list.innerHTML='';
  EXTRAS.forEach(t=>{
    const row=document.createElement('div');
    row.className='bg-[#F5F2EB] dark:bg-[#232B4D]/60 border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-2';
    row.innerHTML=
      '<div class="flex items-center gap-2">'
      +'<input data-xkind="color" type="color" value="'+t.color+'" class="!w-8 !h-7 shrink-0" title="Warna teks"/>'
      +'<input data-xkind="text" type="text" maxlength="40" class="flex-1 min-w-0 bg-white dark:bg-[#1C2342] border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#E9B44C]"/>'
      +'<button data-xkind="del" class="text-[11px] font-bold text-red-500 bg-red-50 hover:bg-red-100 px-2 py-1.5 rounded-lg transition" title="Hapus teks"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5h15M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5 7.5 20h9l1-13.5M10 10v6M14 10v6"/></svg></button>'
      +'</div>'
      +'<div class="flex items-center gap-2"><span class="text-[10px] font-bold text-slate-500 dark:text-[#A39D86]">Ukuran</span>'
      +'<input data-xkind="size" type="range" min="16" max="90" value="'+t.size+'" class="flex-1"/>'
      +'<span data-xkind="val" class="text-[10px] font-extrabold text-[#8A5A12] dark:text-[#E9B44C] w-8 text-right">'+t.size+'</span></div>';
    const q=s=>row.querySelector('[data-xkind="'+s+'"]');
    q('text').value=t.text;
    q('color').addEventListener('focus',()=>{ selectedExtraId=t.id; activeSel={kind:'extra',id:t.id}; pushHistory(); });
    q('text').addEventListener('focus',()=>{ selectedExtraId=t.id; activeSel={kind:'extra',id:t.id}; pushHistory(); });
    q('size').addEventListener('pointerdown',()=>pushHistory());
    q('color').addEventListener('input',e=>{ t.color=e.target.value; renderExtras(); });
    q('text').addEventListener('input',e=>{ t.text=e.target.value; renderExtras(); });
    q('size').addEventListener('input',e=>{ t.size=+e.target.value; q('val').textContent=t.size; renderExtras(); });
    q('del').onclick=()=>{ pushHistory(); EXTRAS=EXTRAS.filter(x=>x.id!==t.id); renderExtras(); renderExtraList(); toast('🗑 Teks bebas dihapus.'); };
    list.appendChild(row);
  });
}
/* Seret + edit langsung teks bebas (delegasi, khusus data-extra) */
poster.addEventListener('pointerdown',e=>{
  const tgt=e.target&&e.target.closest?e.target.closest('[data-extra]'):null;
  if(!tgt||drawTool!=='off') return;
  if(tgt.isContentEditable) return;
  const t=EXTRAS.find(x=>x.id===tgt.dataset.extra); if(!t) return;
  if(isLocked('extras')){ toast('Layer teks bebas dikunci.'); return; }
  e.preventDefault();
  selectedExtraId=t.id; activeSel={kind:'extra',id:t.id};
  pushHistory();
  tgt.classList.add('dragging');
  const sx=e.clientX, sy=e.clientY, ox=t.x, oy=t.y;
  try{ tgt.setPointerCapture(e.pointerId); }catch(err){}
  const mv=ev=>{
    const { W, H }=posterWH();
    t.x=Math.min(.98,Math.max(.02,ox+(ev.clientX-sx)/W));
    t.y=Math.min(.98,Math.max(.02,oy+(ev.clientY-sy)/H));
    const sn=snapCenter(t.x,t.y); t.x=sn.x; t.y=sn.y;
    tgt.style.left=(t.x*100)+'%'; tgt.style.top=(t.y*100)+'%';
    if(typeof renderSelBox==='function') renderSelBox();
  };
  const up=()=>{ hideGuides(); tgt.classList.remove('dragging'); tgt.removeEventListener('pointermove',mv); tgt.removeEventListener('pointerup',up); tgt.removeEventListener('pointercancel',up); };
  tgt.addEventListener('pointermove',mv); tgt.addEventListener('pointerup',up); tgt.addEventListener('pointercancel',up);
});
poster.addEventListener('dblclick',e=>{
  const tgt=e.target&&e.target.closest?e.target.closest('[data-extra]'):null;
  if(!tgt) return;
  const t=EXTRAS.find(x=>x.id===tgt.dataset.extra); if(!t) return;
  selectedExtraId=t.id; activeSel={kind:'extra',id:t.id};
  tgt.contentEditable='true'; tgt.focus();
  try{ const r=document.createRange(); r.selectNodeContents(tgt); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }catch(err){}
  tgt.onblur=()=>{
    tgt.contentEditable='false';
    const v=(tgt.innerText||'').replace(/\s+/g,' ').trim();
    if(v) t.text=v.slice(0,40);
    renderExtras(); renderExtraList();
  };
  tgt.onkeydown=ev=>{ if(ev.key==='Enter'||ev.key==='Escape'){ ev.preventDefault(); tgt.blur(); } };
});


/* ============================================================
   EDIT FOTO: crop, putar 90, balik, kecerahan, kontras,
   saturasi, hitam-putih. Semua diproses di browser.
   ============================================================ */
let photoCache={ sig:'', cv:null, url:'' };
function photoSig(){ return [PHOTO.rot,PHOTO.flipX?1:0,PHOTO.flipY?1:0,PHOTO.bw?1:0,
  PHOTO.crop?PHOTO.crop.x+','+PHOTO.crop.y+','+PHOTO.crop.w+','+PHOTO.crop.h:''].join('|'); }
function photoFilter(){
  const f=[];
  if(PHOTO.bright) f.push('brightness('+(1+PHOTO.bright/100)+')');
  if(PHOTO.contrast) f.push('contrast('+(1+PHOTO.contrast/100)+')');
  if(PHOTO.sat) f.push('saturate('+(1+PHOTO.sat/100)+')');
  if(PHOTO.bw) f.push('grayscale(1)');
  return f.length?f.join(' '):'none';
}
/* hasil crop + putar + balik (tanpa filter, filter dipakai saat menggambar) */
function editedPhotoCanvas(maxSide){
  const img=uploadImgEl;
  if(!img||!img.naturalWidth) return null;
  const sig=photoSig()+'|'+(maxSide||0)+'|'+img.naturalWidth+'x'+img.naturalHeight;
  if(photoCache.sig===sig&&photoCache.cv) return photoCache.cv;
  const iw=img.naturalWidth, ih=img.naturalHeight;
  const rot=((PHOTO.rot%360)+360)%360, sw=(rot===90||rot===270)?ih:iw, sh=(rot===90||rot===270)?iw:ih;
  let scale=1;
  if(maxSide&&Math.max(sw,sh)>maxSide) scale=maxSide/Math.max(sw,sh);
  const cv=document.createElement('canvas');
  cv.width=Math.max(1,Math.round(sw*scale)); cv.height=Math.max(1,Math.round(sh*scale));
  const c=cv.getContext('2d');
  c.save();
  c.translate(cv.width/2,cv.height/2);
  if(rot) c.rotate(rot*Math.PI/180);
  if(PHOTO.flipX||PHOTO.flipY) c.scale(PHOTO.flipX?-1:1,PHOTO.flipY?-1:1);
  if(PHOTO.crop){
    const cr=PHOTO.crop;
    c.drawImage(img, cr.x*iw, cr.y*ih, cr.w*iw, cr.h*ih, -cr.w*iw*scale/2, -cr.h*ih*scale/2, cr.w*iw*scale, cr.h*ih*scale);
  } else {
    c.drawImage(img, -iw*scale/2, -ih*scale/2, iw*scale, ih*scale);
  }
  c.restore();
  photoCache={ sig, cv, url:'' };
  return cv;
}
/* gambar foto hasil edit ke area (cover = isi penuh area) */
function drawEditedPhoto(ctx,dx,dy,dw,dh){
  const cv=editedPhotoCanvas(0); if(!cv) return false;
  ctx.save();
  ctx.filter=photoFilter();
  const ir=cv.width/cv.height, cr=dw/dh;
  let sw,sh,sx,sy;
  if(ir>cr){ sh=cv.height; sw=sh*cr; sx=(cv.width-sw)/2; sy=0; }
  else { sw=cv.width; sh=sw/cr; sx=0; sy=(cv.height-sh)/2; }
  ctx.drawImage(cv,sx,sy,sw,sh,dx,dy,dw,dh);
  ctx.restore();
  return true;
}
function refreshPhotoPreview(){
  const cv=editedPhotoCanvas(1200);
  const imgs=[$('pvPhoto'),$('posterBgImg')];
  if(!cv){ imgs.forEach(i=>{ if(i) i.removeAttribute('src'); }); return; }
  const url=cv.toDataURL('image/jpeg',.85);
  imgs.forEach(i=>{ if(i) i.src=url; });
  const f=photoFilter();
  [$('pvPhoto'),$('posterBgImg')].forEach(i=>{ if(i) i.style.filter=(f==='none'?'none':f); });
}
function syncPhotoUI(){
  const set=(id,val)=>{ const e=$(id); if(e) e.value=val; };
  set('phBright',PHOTO.bright); set('phContrast',PHOTO.contrast); set('phSat',PHOTO.sat);
  $('phBrightVal').textContent=(PHOTO.bright>0?'+':'')+PHOTO.bright+'%';
  $('phContrastVal').textContent=(PHOTO.contrast>0?'+':'')+PHOTO.contrast+'%';
  $('phSatVal').textContent=(PHOTO.sat>0?'+':'')+PHOTO.sat+'%';
  $('phBW').setAttribute('aria-pressed',PHOTO.bw?'true':'false');
  const on=!!uploadDataURL;
  ['phRot','phFlipH','phFlipV','phBW','phResetAll','phCropReset'].forEach(id=>{ const e=$(id); if(e) e.disabled=!on; });
  ['phBright','phContrast','phSat'].forEach(id=>{ const e=$(id); if(e) e.disabled=!on; });
  renderCropBox();
}
function renderCropBox(){
  const box=$('cropBox'), rect=$('cropRect'); if(!box||!rect) return;
  const img=uploadImgEl;
  if(!img||!img.naturalWidth){ rect.style.display='none'; return; }
  rect.style.display='block';
  const bw=box.clientWidth, bh=box.clientHeight;
  const iw=img.naturalWidth, ih=img.naturalHeight;
  const sc=Math.min(bw/iw,bh/ih), dw=iw*sc, dh=ih*sc, ox=(bw-dw)/2, oy=(bh-dh)/2;
  const cr=PHOTO.crop||{x:.1,y:.1,w:.8,h:.8};
  rect.style.left=(ox+cr.x*dw)+'px'; rect.style.top=(oy+cr.y*dh)+'px';
  rect.style.width=Math.max(14,cr.w*dw)+'px'; rect.style.height=Math.max(14,cr.h*dh)+'px';
  rect.dataset.cx=cr.x; rect.dataset.cy=cr.y; rect.dataset.cw=cr.w; rect.dataset.ch=cr.h;
  rect.dataset.ox=ox; rect.dataset.oy=oy; rect.dataset.dw=dw; rect.dataset.dh=dh;
}
function cropRectToNorm(){
  const rect=$('cropRect'); if(!rect) return null;
  const x=parseFloat(rect.dataset.cx), y=parseFloat(rect.dataset.cy);
  const w=parseFloat(rect.dataset.cw), h=parseFloat(rect.dataset.ch);
  return { x, y, w, h };
}
/* --- interaksi crop: geser kotak, tarik sudut kanan bawah --- */
(function bindCrop(){
  const box=$('cropBox'), rect=$('cropRect'), grip=$('cropGrip');
  if(!box||!rect||!grip) return;
  let mode=null, start=null, orig=null;
  const normPos=e=>{ const r=box.getBoundingClientRect(); return { x:e.clientX-r.left, y:e.clientY-r.top }; };
  const down=(e,isGrip)=>{
    if(!uploadDataURL) return;
    e.preventDefault(); e.stopPropagation();
    mode=isGrip?'size':'move'; start=normPos(e); orig=cropRectToNorm()||{x:.1,y:.1,w:.8,h:.8};
    pushHistory();
    try{ (isGrip?grip:rect).setPointerCapture(e.pointerId); }catch(err){}
  };
  const mv=e=>{
    if(!mode) return;
    const p=normPos(e);
    const ox=parseFloat(rect.dataset.ox)||0, oy=parseFloat(rect.dataset.oy)||0;
    const dw=parseFloat(rect.dataset.dw)||1, dh=parseFloat(rect.dataset.dh)||1;
    let nx=orig.x, ny=orig.y, nw=orig.w, nh=orig.h;
    if(mode==='move'){
      nx=orig.x+(p.x-start.x)/dw; ny=orig.y+(p.y-start.y)/dh;
      nx=Math.min(1-orig.w,Math.max(0,nx)); ny=Math.min(1-orig.h,Math.max(0,ny));
    } else {
      nw=orig.w+(p.x-start.x)/dw; nh=orig.h+(p.y-start.y)/dh;
      nw=Math.max(.08,Math.min(1-orig.x,nw)); nh=Math.max(.08,Math.min(1-orig.y,nh));
    }
    PHOTO.crop={ x:nx, y:ny, w:nw, h:nh };
    renderCropBox(); refreshPhotoPreview(); render();
  };
  const up=()=>{ mode=null; };
  rect.addEventListener('pointerdown',e=>down(e,false));
  grip.addEventListener('pointerdown',e=>down(e,true));
  [rect,grip].forEach(el=>{
    el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
  });
})();
$('phRot').onclick=()=>{ pushHistory(); PHOTO.rot=((PHOTO.rot||0)+90)%360; photoCache={sig:'',cv:null,url:''}; refreshPhotoPreview(); syncPhotoUI(); render(); };
$('phFlipH').onclick=()=>{ pushHistory(); PHOTO.flipX=!PHOTO.flipX; photoCache={sig:'',cv:null,url:''}; refreshPhotoPreview(); render(); };
$('phFlipV').onclick=()=>{ pushHistory(); PHOTO.flipY=!PHOTO.flipY; photoCache={sig:'',cv:null,url:''}; refreshPhotoPreview(); render(); };
$('phBW').onclick=()=>{ pushHistory(); PHOTO.bw=!PHOTO.bw; refreshPhotoPreview(); syncPhotoUI(); render(); };
$('phResetAll').onclick=()=>{ pushHistory(); PHOTO={ ...PHOTO_DEF }; photoCache={sig:'',cv:null,url:''}; refreshPhotoPreview(); syncPhotoUI(); render(); toast('Foto dikembalikan ke kondisi awal.'); };
$('phCropReset').onclick=()=>{ pushHistory(); PHOTO.crop=null; photoCache={sig:'',cv:null,url:''}; refreshPhotoPreview(); syncPhotoUI(); render(); toast('Potongan foto direset.'); };
$('phBright').addEventListener('input',e=>{ PHOTO.bright=+e.target.value; $('phBrightVal').textContent=(PHOTO.bright>0?'+':'')+PHOTO.bright+'%'; refreshPhotoPreview(); render(); });
$('phContrast').addEventListener('input',e=>{ PHOTO.contrast=+e.target.value; $('phContrastVal').textContent=(PHOTO.contrast>0?'+':'')+PHOTO.contrast+'%'; refreshPhotoPreview(); render(); });
$('phSat').addEventListener('input',e=>{ PHOTO.sat=+e.target.value; $('phSatVal').textContent=(PHOTO.sat>0?'+':'')+PHOTO.sat+'%'; refreshPhotoPreview(); render(); });
['phBright','phContrast','phSat'].forEach(id=>$(id).addEventListener('pointerdown',()=>pushHistory()));

/* ============ SUSUNAN LAYER ============ */
function layerOn(key){
  switch(key){
    case 'draw': return drawVisible;
    case 'sticker': return !!STICKER&&!STICKER.hidden;
    case 'foot': return S.showFooter; case 'sub': return S.showSubtitle;
    case 'title': return S.showTitle; case 'icon': return S.showIcon;
    case 'badge': return S.showBadge; case 'decor': return S.showDecor;
    case 'pattern': return S.pattern!=='none'; case 'mark': return S.showMark;
    case 'shapes': return shapesVisible;
  }
  return true;
}
function syncLayersUI(){
  document.querySelectorAll('.leye').forEach(b=>{
    const on=layerOn(b.dataset.layer);
    b.innerHTML=markSvg(on?'Mata':'Mata Tutup',14,'currentColor');
    b.classList.toggle('opacity-40',!on);
    const dis=b.dataset.layer==='sticker'&&!STICKER;
    b.disabled=!!dis;
    b.classList.toggle('opacity-30',!!dis);
  });
}
function toggleLayer(key){
  pushHistory();
  switch(key){
    case 'draw': drawVisible=!drawVisible; break;
    case 'shapes': shapesVisible=!shapesVisible; break;
    case 'sticker': if(STICKER) STICKER.hidden=!STICKER.hidden; break;
    case 'foot': S.showFooter=!S.showFooter; break;
    case 'sub': S.showSubtitle=!S.showSubtitle; break;
    case 'title': S.showTitle=!S.showTitle; break;
    case 'icon': S.showIcon=!S.showIcon; break;
    case 'badge': S.showBadge=!S.showBadge; break;
    case 'decor': S.showDecor=!S.showDecor; break;
    case 'mark': S.showMark=!S.showMark; break;
    case 'pattern': clickOpt('#patternGroup','pattern',S.pattern==='none'?'dots':'none'); break;
  }
  syncToggles(); syncLayersUI(); render();
}
document.querySelectorAll('.leye').forEach(b=>b.onclick=()=>toggleLayer(b.dataset.layer));
/* (urutan stiker kini diatur lewat daftar layer dinamis) */



/* ---- format teks judul ---- */
function syncTxtUI(){
  const b=$('txtBold'), i=$('txtItalic'), u=$('txtUnderline');
  if(b) b.setAttribute('aria-pressed',TXT.bold?'true':'false');
  if(i) i.setAttribute('aria-pressed',TXT.italic?'true':'false');
  if(u) u.setAttribute('aria-pressed',TXT.underline?'true':'false');
  if($('txtLS')) $('txtLS').value=TXT.ls||0;
  if($('txtLSVal')) $('txtLSVal').textContent=(TXT.ls||0);
  if($('txtLH')) $('txtLH').value=Math.round((TXT.lh||1.12)*100);
  if($('txtLHVal')) $('txtLHVal').textContent=(TXT.lh||1.12).toFixed(2);
}
$('txtBold').onclick=()=>{ pushHistory(); TXT.bold=!TXT.bold; syncTxtUI(); render(); };
$('txtItalic').onclick=()=>{ pushHistory(); TXT.italic=!TXT.italic; syncTxtUI(); render(); };
$('txtUnderline').onclick=()=>{ pushHistory(); TXT.underline=!TXT.underline; syncTxtUI(); render(); };
$('txtLS').addEventListener('input',e=>{ TXT.ls=+e.target.value; $('txtLSVal').textContent=TXT.ls; render(); });
$('txtLH').addEventListener('input',e=>{ TXT.lh=+e.target.value/100; $('txtLHVal').textContent=TXT.lh.toFixed(2); render(); });
$('txtLS').addEventListener('pointerdown',()=>pushHistory());
$('txtLH').addEventListener('pointerdown',()=>pushHistory());



/* gambar QR ke ekspor */
function drawQrExport(ctx,W,H){
  if(!QR.on||!qrCanvas) return;
  const size=QR.size*(W/420);
  ctx.save();
  ctx.translate(QR.x*W,QR.y*H);
  if(QR.rot) ctx.rotate(QR.rot*Math.PI/180);
  ctx.drawImage(qrCanvas,-size/2,-size/2,size,size);
  ctx.restore();
}

/* ============================================================
   ELEMEN QR (dibuat di browser dengan library lokal)
   ============================================================ */
let qrCanvas=null;
function buildQrCanvas(){
  if(!QR.on||!QR.text) return null;
  if(typeof QRCode==='undefined') return null;
  const tmp=document.createElement('div');
  tmp.style.cssText='position:absolute;left:-9999px;top:0;';
  document.body.appendChild(tmp);
  try{
    new QRCode(tmp,{ text:QR.text, width:QR.size, height:QR.size, colorDark:'#141A33', colorLight:'#ffffff', correctLevel:QRCode.CorrectLevel.M });
  }catch(e){ document.body.removeChild(tmp); return null; }
  const cv=tmp.querySelector('canvas');
  const im=tmp.querySelector('img');
  document.body.removeChild(tmp);
  if(!cv) return null;
  if(im&&im.src) cv.dataset.src=im.src;
  return cv;
}
function renderQr(){
  const layer=$('qrLayer'); if(!layer) return;
  const sig=QR.on?(QR.text+'|'+QR.size):'';
  if(layer.dataset.sig!==sig){
    layer.innerHTML=''; layer.dataset.sig=sig;
    qrCanvas=null;
    if(QR.on&&QR.text){
      const cv=buildQrCanvas();
      if(cv){ layer.appendChild(cv); qrCanvas=cv; }
    }
  }
  const el=layer.firstElementChild;
  if(!el){ layer.style.display='none'; return; }
  layer.style.display='block';
  const { W,H }=posterWH();
  const size=QR.size*(W/420);
  el.style.cssText='position:absolute;left:'+(QR.x*100)+'%;top:'+(QR.y*100)+'%;'
    +'width:'+size+'px;height:'+size+'px;transform:translate(-50%,-50%) rotate('+(QR.rot||0)+'deg);'
    +'pointer-events:auto;cursor:grab;touch-action:none;';
  if(qrCanvas){ qrCanvas.style.width=size+'px'; qrCanvas.style.height=size+'px'; }
}
$('qrAdd').onclick=()=>{
  const v=($('qrText').value||'').trim();
  if(!v){ toast('Isi dulu teks atau tautan untuk QR.'); return; }
  pushHistory();
  QR.on=true; QR.text=v;
  if(!QR.size) QR.size=150;
  $('qrSize').value=QR.size; $('qrSizeVal').textContent=QR.size+'px';
  $('qrLayer').dataset.sig='';
  renderQr(); syncQrUI();
  toast('QR ditambahkan. Seret untuk memindah.');
};
$('qrRemove').onclick=()=>{
  if(!QR.on){ toast('Belum ada QR di kanvas.'); return; }
  pushHistory();
  QR.on=false; QR.text='';
  $('qrLayer').dataset.sig=''; $('qrLayer').innerHTML='';
  renderQr(); syncQrUI();
  toast('QR dihapus.');
};
$('qrText').addEventListener('change',e=>{
  if(!QR.on) return;
  pushHistory();
  QR.text=e.target.value.trim();
  $('qrLayer').dataset.sig='';
  renderQr();
});
$('qrSize').addEventListener('input',e=>{
  QR.size=+e.target.value; $('qrSizeVal').textContent=QR.size+'px';
  $('qrLayer').dataset.sig='';
  renderQr();
});
$('qrSize').addEventListener('pointerdown',()=>pushHistory());
function syncQrUI(){
  const on=!!QR.on;
  if($('qrSize')) $('qrSize').value=QR.size;
  if($('qrSizeVal')) $('qrSizeVal').textContent=QR.size+'px';
  if($('qrRemove')) $('qrRemove').disabled=!on;
  if($('qrSize')) $('qrSize').disabled=!on;
  if($('qrText')&&document.activeElement!==$('qrText')&&QR.text) $('qrText').value=QR.text;
}
/* seret QR di kanvas */
poster.addEventListener('pointerdown',e=>{
  const tgt=e.target&&e.target.closest?e.target.closest('#qrLayer canvas'):null;
  if(!tgt||drawTool!=='off') return;
  e.preventDefault();
  activeSel={kind:'qr'};
  pushHistory();
  const sx=e.clientX, sy=e.clientY, ox=QR.x, oy=QR.y;
  try{ tgt.setPointerCapture(e.pointerId); }catch(err){}
  const mv=ev=>{
    const { W,H }=posterWH();
    QR.x=Math.min(.99,Math.max(.01,ox+(ev.clientX-sx)/W));
    QR.y=Math.min(.99,Math.max(.01,oy+(ev.clientY-sy)/H));
    renderQr();
  };
  const up=()=>{ tgt.removeEventListener('pointermove',mv); tgt.removeEventListener('pointerup',up); tgt.removeEventListener('pointercancel',up); renderSelBox(); scheduleAuto(); };
  tgt.addEventListener('pointermove',mv); tgt.addEventListener('pointerup',up); tgt.addEventListener('pointercancel',up);
});

/* ============================================================
   KOTAK PEMBATAS + PEGANGAN UBAH UKURAN & PUTAR (di kanvas)
   Pakai Pointer Events supaya jalan di mouse dan sentuh.
   ============================================================ */
const handleLayer=$('handleLayer');
const SEL_HANDLES=['nw','ne','sw','se'];
let selBox=null, selHandles=[], selRot=null, selStem=null;
function selTarget(){
  if(!activeSel) return null;
  if(activeSel.kind==='extra'){ const t=EXTRAS.find(x=>x.id===activeSel.id); return t?{type:'extra',obj:t,el:document.querySelector('[data-extra="'+t.id+'"]')}:null; }
  if(activeSel.kind==='shape'){ const s=SHAPES.find(x=>x.id===activeSel.id); return s?{type:'shape',obj:s,el:document.querySelector('[data-shape="'+s.id+'"]')}:null; }
  if(activeSel.kind==='drag'&&activeSel.key==='sticker') return STICKER?{type:'sticker',obj:STICKER,el:$('pvSticker')}:null;
  if(activeSel.kind==='drag'&&activeSel.key==='icon') return {type:'icon',obj:null,el:$('pvIconWrap')};
  if(activeSel.kind==='qr') return QR.on?{type:'qr',obj:QR,el:$('qrLayer').firstElementChild}:null;
  return null;
}
function ensureSelDom(){
  if(!selBox&&handleLayer){
    selBox=document.createElement('div'); selBox.className='sel-box'; handleLayer.appendChild(selBox);
    selStem=document.createElement('div'); selStem.className='sel-stem'; handleLayer.appendChild(selStem);
    selHandles=SEL_HANDLES.map(h=>{ const d=document.createElement('div'); d.className='sel-handle'; d.dataset.h=h;
      d.setAttribute('role','button'); d.setAttribute('tabindex','0');
      d.setAttribute('aria-label','Ubah ukuran '+h.toUpperCase());
      handleLayer.appendChild(d); return d; });
    selRot=document.createElement('div'); selRot.className='sel-rot'; selRot.dataset.h='rot';
    selRot.setAttribute('role','button'); selRot.setAttribute('tabindex','0');
    selRot.setAttribute('aria-label','Putar elemen');
    handleLayer.appendChild(selRot);
  }
}
function hideSelBox(){
  if(!handleLayer) return;
  if(selBox) selBox.style.display='none';
  if(selStem) selStem.style.display='none';
  selHandles.forEach(h=>h.style.display='none');
  if(selRot) selRot.style.display='none';
}
function renderSelBox(){
  if(!handleLayer) return;
  const t=selTarget();
  if(!t||!t.el||!t.el.offsetParent){ hideSelBox(); return; }
  ensureSelDom();
  const pr=poster.getBoundingClientRect(), r=t.el.getBoundingClientRect();
  if(!r.width||!r.height){ hideSelBox(); return; }
  const x=r.left-pr.left, y=r.top-pr.top, w=r.width, h=r.height;
  selBox.style.display='block'; selBox.style.left=x+'px'; selBox.style.top=y+'px';
  selBox.style.width=w+'px'; selBox.style.height=h+'px';
  const pts={ nw:[x,y], ne:[x+w,y], sw:[x,y+h], se:[x+w,y+h] };
  selHandles.forEach(hd=>{
    const p=pts[hd.dataset.h];
    hd.style.display='block'; hd.style.left=p[0]+'px'; hd.style.top=p[1]+'px';
  });
  const canRot=t.type!=='shape'||t.obj.kind!=='circle';
  if(canRot){
    selRot.style.display='block'; selRot.style.left=(x+w/2)+'px'; selRot.style.top=(y-22)+'px';
    selStem.style.display='block'; selStem.style.left=(x+w/2)+'px'; selStem.style.top=(y-22)+'px';
    selStem.style.height='16px';
  } else { selRot.style.display='none'; selStem.style.display='none'; }
}
/* ubah ukuran proporsional: sudut yang ditarik jadi acuan, sisi opposite tetap */
function setSelCenter(t,pt){ // pt = titik baru (px poster)
  const { W,H }=posterWH();
  if(t.type==='extra'){ const e=t.obj; e.x=Math.min(.99,Math.max(.01,pt.x/W)); e.y=Math.min(.99,Math.max(.01,pt.y/H)); }
  else if(t.type==='shape'){ const s=t.obj; s.x=Math.min(.99,Math.max(.01,pt.x/W)); s.y=Math.min(.99,Math.max(.01,pt.y/H)); }
  else if(t.type==='sticker'){ const st=t.obj; st.x=Math.min(.99,Math.max(.01,pt.x/W)); st.y=Math.min(.99,Math.max(.01,pt.y/H)); }
}
function syncSelPanel(t){
  if(t.type==='shape'){ syncShapeControls(); }
  else if(t.type==='extra'){ renderExtraList(); }
  else if(t.type==='sticker'){ const v=Math.round(t.obj.size); $('inStickerSize').value=v; $('stickerSizeVal').textContent=v+'px'; }
  else if(t.type==='icon'){ const v=Math.round(S.iconSize); $('inIconSize').value=v; $('iconSizeVal').textContent=v+'px'; }
}
function onHandlePointerDown(e,mode,handle){
  const t=selTarget(); if(!t) return;
  e.preventDefault(); e.stopPropagation();
  const pr=poster.getBoundingClientRect();
  const r=t.el.getBoundingClientRect();
  const box={ x:r.left-pr.left, y:r.top-pr.top, w:r.width, h:r.height };
  const cx=box.x+box.w/2, cy=box.y+box.h/2;
  const anchor={ nw:[box.x+box.w,box.y+box.h], ne:[box.x,box.y+box.h], sw:[box.x+box.w,box.y], se:[box.x,box.y] }[handle];
  const startAng=Math.atan2(e.clientY-(pr.top+cy), e.clientX-(pr.left+cx))*180/Math.PI;
  const startSize=(t.type==='extra')?t.obj.size:(t.type==='sticker')?t.obj.size:(t.type==='icon')?S.iconSize:(t.obj.w||.3);
  const startShape={ w:t.type==='shape'?t.obj.w:0, h:t.type==='shape'?t.obj.h:0 };
  pushHistory();
  const el=e.currentTarget;
  try{ el.setPointerCapture(e.pointerId); }catch(err){}
  const mv=ev=>{
    const px=ev.clientX-pr.left, py=ev.clientY-pr.top;
    if(mode==='rot'){
      const ang=Math.atan2(py-cy,px-cx)*180/Math.PI;
      let deg=ang-startAng+90;
      if(ev.shiftKey) deg=Math.round(deg/15)*15;
      deg=((deg%360)+360)%360;
      if(t.type==='extra') t.obj.rot=deg;
      else if(t.type==='shape') t.obj.angle=deg;
      else if(t.type==='sticker') t.obj.rot=deg;
      else if(t.type==='icon') S.iconRot=deg;
      renderExtras(); renderShapes(); renderPositions(); renderSelBox();
      return;
    }
    // ubah ukuran: sisi berlawanan tetap di tempat, skala proporsional
    const dx=px-anchor[0], dy=py-anchor[1];
    const dist=Math.hypot(dx,dy)||1;
    const startDist=Math.hypot(cx-anchor[0],cy-anchor[1])||1;
    let factor=dist/startDist;
    factor=Math.max(.2,Math.min(5,factor));
    if(t.type==='icon'){
      S.iconSize=Math.max(0,Math.min(220,Math.round(startSize*factor)));
      render();
    } else if(t.type==='qr'){
      QR.size=Math.max(40,Math.min(600,Math.round(startSize*factor)));
      $('qrSize').value=QR.size; $('qrSizeVal').textContent=QR.size+'px';
      $('qrLayer').dataset.sig='';
      renderQr();
    } else if(t.type==='extra'){
      t.obj.size=Math.max(8,Math.min(200,Math.round(startSize*factor)));
      const nx=anchor[0]+dx*factor, ny=anchor[1]+dy*factor;
      setSelCenter(t,{ x:(anchor[0]+nx)/2, y:(anchor[1]+ny)/2 });
      renderExtras();
    } else if(t.type==='sticker'){
      t.obj.size=Math.max(12,Math.min(240,Math.round(startSize*factor)));
      const nx=anchor[0]+dx*factor, ny=anchor[1]+dy*factor;
      setSelCenter(t,{ x:(anchor[0]+nx)/2, y:(anchor[1]+ny)/2 });
      renderPositions();
    } else if(t.type==='shape'){
      const s=t.obj;
      s.w=Math.max(.02,Math.min(1.6,startShape.w*factor));
      if(s.kind==='rect') s.h=Math.max(.02,Math.min(1.6,startShape.h*factor));
      const nx=anchor[0]+dx*factor, ny=anchor[1]+dy*factor;
      setSelCenter(t,{ x:(anchor[0]+nx)/2, y:(anchor[1]+ny)/2 });
      renderShapes();
    }
    syncSelPanel(t);
    renderSelBox();
  };
  const up=()=>{
    el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',up); el.removeEventListener('pointercancel',up);
    render(); renderSelBox(); scheduleAuto();
  };
  el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up); el.addEventListener('pointercancel',up);
}
function bindSelHandles(){
  if(!handleLayer) return;
  handleLayer.addEventListener('pointerdown',e=>{
    const h=e.target.closest?e.target.closest('[data-h]'):null;
    if(!h) return;
    onHandlePointerDown(e,h.dataset.h==='rot'?'rot':'scale',h.dataset.h);
  });
  // keyboard: pegangan bisa dioperasikan dengan tombol panah
  handleLayer.addEventListener('keydown',e=>{
    const h=e.target.closest?e.target.closest('[data-h]'):null;
    if(!h) return;
    const step=e.shiftKey?10:2;
    const t=selTarget(); if(!t) return;
    if(h.dataset.h==='rot'){
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight') return;
      e.preventDefault();
      const d=(e.key==='ArrowRight'?step:-step);
      if(t.type==='qr') QR.rot=((QR.rot||0)+d+360)%360;
      else if(t.type==='extra') t.obj.rot=((t.obj.rot||0)+d+360)%360;
      else if(t.type==='shape') t.obj.angle=((t.obj.angle||0)+d+360)%360;
      else if(t.type==='sticker') t.obj.rot=((t.obj.rot||0)+d+360)%360;
      else if(t.type==='icon') S.iconRot=((S.iconRot||0)+d+360)%360;
      renderExtras(); renderShapes(); renderPositions(); renderSelBox();
    } else {
      if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight'&&e.key!=='ArrowUp'&&e.key!=='ArrowDown') return;
      e.preventDefault();
      const f=(e.key==='ArrowRight'||e.key==='ArrowDown')?1.02:.98;
      const { W,H }=posterWH();
      const pr=poster.getBoundingClientRect(), r=t.el.getBoundingClientRect();
      const box={ x:r.left-pr.left, y:r.top-pr.top, w:r.width, h:r.height };
      const cx=box.x+box.w/2, cy=box.y+box.h/2;
      const startSize=(t.type==='extra')?t.obj.size:(t.type==='sticker')?t.obj.size:(t.type==='icon')?S.iconSize:(t.type==='qr')?QR.size:(t.obj.w||.3);
      if(t.type==='icon'){ S.iconSize=Math.max(0,Math.min(220,Math.round(startSize*f))); render(); }
      else if(t.type==='qr'){ QR.size=Math.max(40,Math.min(600,Math.round(startSize*f))); $('qrSize').value=QR.size; $('qrSizeVal').textContent=QR.size+'px'; $('qrLayer').dataset.sig=''; renderQr(); }
      else if(t.type==='extra'){ t.obj.size=Math.max(8,Math.min(200,Math.round(startSize*f))); renderExtras(); }
      else if(t.type==='sticker'){ t.obj.size=Math.max(12,Math.min(240,Math.round(startSize*f))); renderPositions(); }
      else if(t.type==='shape'){ t.obj.w=Math.max(.02,Math.min(1.6,t.obj.w*f)); if(t.obj.kind==='rect') t.obj.h=Math.max(.02,Math.min(1.6,t.obj.h*f)); renderShapes(); }
      syncSelPanel(t); renderSelBox();
    }
  });
}
bindSelHandles();
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&activeSel){ activeSel=null; selectedShapeId=null; hideSelBox(); render(); }
});


/* Ukuran cetak: A4/A3/A5 potret & lanskap */

/* ============ MULTI-HALAMAN ============ */
let pages=[], curPage=0, uploadName='gambar.png', silentUI=false;
function snapshot(){
  return { S:{...S}, POS:JSON.parse(JSON.stringify(POS)), STICKER:STICKER?{...STICKER}:null,
    strokes:JSON.parse(JSON.stringify(strokes)), EXTRAS:JSON.parse(JSON.stringify(EXTRAS)),
    SHAPES:JSON.parse(JSON.stringify(SHAPES)), ZORDER:ZORDER.slice(),
    upload:uploadDataURL, uploadName, stickerFront, drawVisible, shapesVisible, zoom, PHOTO:{ ...PHOTO_DEF, ...(PHOTO||{}) },
    locked:{ ...LAYER_LOCK }, TXT:{ ...TXT_DEF, ...(TXT||{}) }, QR:{ ...QR_DEF, ...(QR||{}) } };
}
function blankSnap(){
  return { S:{...DEFAULTS}, POS:zeroPos(), STICKER:null, strokes:[], EXTRAS:[], SHAPES:[],
    ZORDER:[...ZBASE], upload:null, uploadName:'gambar.png', stickerFront:true, drawVisible:true, shapesVisible:true, zoom:1, PHOTO:{ ...PHOTO_DEF }, locked:{}, TXT:{ ...TXT_DEF }, QR:{ ...QR_DEF } };
}
function saveCurrentPage(){ pages[curPage]=snapshot(); }
function showUploadFilled(name){
  if(!uploadDataURL) return;
  for(const [e,f] of [['dropPhotoEmpty','dropPhotoFilled'],['dropBgEmpty','dropBgFilled']]){
    $(e).classList.add('hidden'); const fl=$(f); fl.classList.remove('hidden'); fl.classList.add('flex');
  }
  $('dropPhoto').classList.add('has-img'); $('dropBg').classList.add('has-img');
  $('thumbBg').src=uploadDataURL; $('thumbPhoto').src=uploadDataURL;
  if($('cropImg')) $('cropImg').src=uploadDataURL;
  photoCache={sig:'',cv:null,url:''}; refreshPhotoPreview(); syncPhotoUI();
  $('thumbBgName').textContent=name; $('thumbPhotoName').textContent=name;
}
function syncUIFromState(){
  silentUI=true;
  $('inBadge').value=S.badge||''; $('inTitle').value=S.title||'';
  $('inSubtitle').value=S.subtitle||''; $('inFooter').value=S.footer||'';
  $('inTitleSize').value=S.titleSize; $('inTitleColor').value=S.titleColor;
  $('inC1').value=S.c1; $('inC2').value=S.c2; $('inAngle').value=S.angle;
  $('inIconSize').value=S.iconSize; $('inPhotoSize').value=S.photoSize; $('inOverlay').value=S.overlay;
  $('inPadding').value=S.padding; $('inRadius').value=S.radius;
  $('inShSize').value=S.shSize||0; $('shSizeVal').textContent=S.shSize||0; $('inShColor').value=S.shColor||'#000000';
  $('inStSize').value=S.stSize||0; $('stSizeVal').textContent=S.stSize||0; $('inStColor').value=S.stColor||'#ffffff';
  $('inStickerSize').value=STICKER?STICKER.size:64;
  clickOpt('#modeGroup','mode',S.mode);
  clickOpt('#layoutGroup','layout',S.layout);
  clickOpt('#fontGroup','font',S.font); clickOpt('#alignGroup','align',S.align);
  syncSizeButtons();
  const isPrint=!!(SIZES[S.size]&&SIZES[S.size].print);
  const q=$('inQuality'); if(q){ q.disabled=isPrint; if(isPrint) q.value='1'; }
  const ph=$('printHint'); if(ph) ph.textContent=isPrint?'Ukuran cetak aktif, resolusi 300 dpi.':
    'Ukuran cetak selalu 300 dpi. Untuk ukuran media sosial, pilih tombol di atas.';
  clickOpt('#bgTypeGroup','bgtype',S.bgType); clickOpt('#useAsGroup','useas',S.useAs);
  clickOpt('#photoShapeGroup','shape',S.photoShape);
  syncToggles(); syncStickerUI(); syncIconUI();
  $('zoomVal').textContent=Math.round(zoom*100)+'%';
  silentUI=false;
}
function loadSnap(i){
  curPage=i;
  const p=pages[i];
  S={...p.S}; POS=JSON.parse(JSON.stringify(p.POS)); STICKER=p.STICKER?{...p.STICKER}:null;
  strokes=JSON.parse(JSON.stringify(p.strokes)); EXTRAS=JSON.parse(JSON.stringify(p.EXTRAS||[]));
  SHAPES=JSON.parse(JSON.stringify(p.SHAPES||[])); ZORDER=Array.isArray(p.ZORDER)&&p.ZORDER.length?p.ZORDER.slice():[...ZBASE];
  stickerFront=p.stickerFront!==false; drawVisible=p.drawVisible!==false; shapesVisible=p.shapesVisible!==false; zoom=p.zoom||1;
  PHOTO={ ...PHOTO_DEF, ...(p.PHOTO||{}) };
  TXT={ ...TXT_DEF, ...(p.TXT||{}) };
  QR={ ...QR_DEF, ...(p.QR||{}) };
  UNDO=[]; REDO=[]; builtShapeIds='__reset__';
  activeSel=null;
  uploadDataURL=p.upload||null; uploadName=p.uploadName||'gambar.png';
  if(uploadDataURL){ uploadImgEl=new Image(); uploadImgEl.src=uploadDataURL; showUploadFilled(uploadName); }
  else clearUploadSilent();
  syncUIFromState();
  builtExtraIds='__reset__';
  if(typeof syncPhotoUI==='function') syncPhotoUI();
  render(); renderPagesBar();
}
function restorePage(i){ saveCurrentPage(); loadSnap(i); }
function renderPagesBar(){
  const bar=$('pagesBar'); if(!bar) return;
  bar.innerHTML='';
  pages.forEach((p,i)=>{
    const b=document.createElement('button');
    b.className='shrink-0 w-24 text-left rounded-xl overflow-hidden border-2 transition-all '+(i===curPage?'border-[#B97F1F] dark:border-[#E9B44C] shadow-card':'border-slate-200 hover:border-[#E9B44C]');
    b.innerHTML='<span class="block h-14" style="background:linear-gradient(135deg,'+p.S.c1+','+p.S.c2+')"></span>'
      +'<span class="block px-2 py-1 bg-white dark:bg-[#232B4D] text-[10px] font-extrabold">H'+(i+1)+' • <span id="pgt'+i+'">'+((p.S.title||'Tanpa judul').slice(0,14))+'</span></span>';
    b.onclick=()=>{ if(i!==curPage) restorePage(i); };
    bar.appendChild(b);
  });
  $('pageCount').textContent=pages.length;
  $('btnDelPage').classList.toggle('opacity-40',pages.length<=1);
}
$('btnAddPage').onclick=()=>{
  if(pages.length>=8){ toast('️ Maksimal 8 halaman.'); return; }
  saveCurrentPage();
  pages.splice(curPage+1,0,blankSnap());
  loadSnap(curPage+1);
  toast('📄 Halaman baru ditambahkan!');
};
$('btnDupPage').onclick=()=>{
  if(pages.length>=8){ toast('️ Maksimal 8 halaman.'); return; }
  saveCurrentPage();
  pages.splice(curPage+1,0,snapshot());
  loadSnap(curPage+1);
  toast('⧉ Halaman diduplikat!');
};
$('btnDelPage').onclick=()=>{
  if(pages.length<=1){ toast('️ Minimal 1 halaman.'); return; }
  pages.splice(curPage,1);
  loadSnap(Math.max(0,curPage-1));
  toast('🗑 Halaman dihapus.');
};
$('btnDownloadAll').onclick=async()=>{
  if($('inFormat').value==='pdf'){ await exportPdfAll(); return; }
  saveCurrentPage();
  const back=curPage;
  toast('Mengunduh '+pages.length+' halaman satu per satu… (izinkan multi-download bila ditanya)');
  for(let i=0;i<pages.length;i++){
    loadSnap(i);
    await new Promise(r=>setTimeout(r,900));
    await exportPoster();
  }
  loadSnap(back);
  toast('Semua halaman diunduh!');
};


/* ============================================================
   SIMPAN OTOMATIS (localStorage) + SIMPAN/BUKA FILE .json
   Semua tetap di browser, tidak ada data yang dikirim ke server.
   ============================================================ */
const AUTOSAVE_KEY='posteria-autosave-v1', AUTOSAVE_MAX=4.2*1024*1024;
let autoTimer=null, autoWarned=false, autosaveReady=false;
function autosavePayload(withUpload){
  return { app:'posteria', v:1, savedAt:Date.now(),
    title:($('docTitle')&&$('docTitle').value)||'Desain Tanpa Judul',
    cur:curPage, pages:pages.map(p=>{
      const q=JSON.parse(JSON.stringify(p));
      if(!withUpload) q.upload=null;
      return q;
    }) };
}
function setSaveState(txt,cls){
  const el=$('saveState'); if(!el) return;
  el.textContent=txt||'';
  el.className='lp-save'+(cls?' is-'+cls:'');
}
function writeAuto(){
  if(!autosaveReady||!pages.length) return;
  saveCurrentPage();
  let payload;
  try{ payload=JSON.stringify(autosavePayload(true)); }
  catch(e){ setSaveState('Gagal menyimpan','error'); return; }
  if(payload.length>AUTOSAVE_MAX){
    // foto terlalu besar: coba lagi tanpa foto, lalu beri tahu pengguna
    try{ payload=JSON.stringify(autosavePayload(false)); }
    catch(e2){ setSaveState('Gagal menyimpan','error'); return; }
    if(!autoWarned){ autoWarned=true; toast('Foto terlalu besar untuk disimpan otomatis. Pakai "Simpan ke file" bila mau menyimpan foto.'); }
  }
  try{
    localStorage.setItem(AUTOSAVE_KEY,payload);
    setSaveState('Tersimpan','saved');
  }catch(e){
    setSaveState('Gagal menyimpan','error');
    if(!autoWarned){ autoWarned=true; toast('Penyimpanan browser penuh, desain tidak bisa disimpan otomatis.'); }
  }
}
function scheduleAuto(){
  setSaveState('Menyimpan…');
  if(autoTimer) clearTimeout(autoTimer);
  autoTimer=setTimeout(()=>{ autoTimer=null; writeAuto(); },800);
}
function readAuto(){
  try{ const raw=localStorage.getItem(AUTOSAVE_KEY); if(!raw) return null;
    const d=JSON.parse(raw);
    if(!d||d.app!=='posteria'||!Array.isArray(d.pages)||!d.pages.length) return null;
    return d;
  }catch(e){ return null; }
}
function clearAuto(){ try{ localStorage.removeItem(AUTOSAVE_KEY); }catch(e){} }
function applyPayload(d,keepUpload){
  if(!d||!Array.isArray(d.pages)||!d.pages.length) return false;
  pages=d.pages.map(p=>({
    S:{...DEFAULTS,...p.S}, POS:p.POS?JSON.parse(JSON.stringify(p.POS)):zeroPos(),
    STICKER:p.STICKER?{...p.STICKER}:null, strokes:p.strokes?JSON.parse(JSON.stringify(p.strokes)):[],
    EXTRAS:p.EXTRAS?JSON.parse(JSON.stringify(p.EXTRAS)):[], SHAPES:p.SHAPES?JSON.parse(JSON.stringify(p.SHAPES)):[],
    ZORDER:Array.isArray(p.ZORDER)&&p.ZORDER.length?p.ZORDER.slice():[...ZBASE],
    upload:keepUpload?p.upload:null, uploadName:p.uploadName||'gambar.png',
    stickerFront:p.stickerFront!==false, drawVisible:p.drawVisible!==false, shapesVisible:p.shapesVisible!==false, zoom:p.zoom||1
  }));
  curPage=0;
  if($('docTitle')) $('docTitle').value=d.title||'Desain Tanpa Judul';
  loadSnap(0);
  setSaveState('Tersimpan','saved');
  return true;
}
function showResumeBox(d){
  const box=$('resumeBox'); if(!box||!d) return;
  const t=$('resumeTitle'), s=$('resumeSub');
  if(t) t.textContent=(d.title&&d.title!=='Desain Tanpa Judul')?d.title:'Desain terakhir';
  if(s){
    const jam=new Date(d.savedAt||Date.now());
    const hh=String(jam.getHours()).padStart(2,'0'), mm=String(jam.getMinutes()).padStart(2,'0');
    s.textContent='Tersimpan otomatis '+hh+':'+mm+' • '+d.pages.length+' halaman • di browser ini';
  }
  box.classList.remove('hidden');
}
$('btnResumeYes').onclick=()=>{
  autosaveReady=true;
  const d=readAuto();
  if(d&&applyPayload(d,true)){ $('resumeBox').classList.add('hidden'); toast('Desain terakhir dilanjutkan.'); }
  else { $('resumeBox').classList.add('hidden'); toast('Simpanan tidak bisa dibaca, mulai dari awal.'); }
};
$('btnResumeNo').onclick=()=>{
  autosaveReady=true;
  clearAuto(); $('resumeBox').classList.add('hidden');
  pages=[blankSnap()]; curPage=0; loadSnap(0);
  setSaveState('Tersimpan','saved');
  toast('Mulai dari poster kosong.');
};
$('btnSaveFile').onclick=()=>{
  saveCurrentPage();
  const data=autosavePayload(true);
  const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const slug=((($('docTitle')&&$('docTitle').value)||'posteria').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''))||'posteria';
  const a=document.createElement('a');
  a.download=slug+'.posteria.json'; a.href=URL.createObjectURL(blob); a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),2000);
  toast('Desain disimpan ke file.');
};
$('btnOpenFile').onclick=()=>$('fileOpen').click();
$('fileOpen').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0]; e.target.value='';
  if(!f) return;
  if(f.size>12*1024*1024){ toast('File terlalu besar (maks 12MB).'); return; }
  const r=new FileReader();
  r.onload=()=>{
    let d=null;
    try{ d=JSON.parse(String(r.result)); }
    catch(err){ toast('File bukan desain Posteria yang valid.'); return; }
    if(!d||d.app!=='posteria'||!Array.isArray(d.pages)||!d.pages.length){ toast('File bukan desain Posteria yang valid.'); return; }
    if(applyPayload(d,true)){ $('resumeBox').classList.add('hidden'); toast('Desain dibuka dari file.'); }
    else toast('File tidak bisa dibaca.');
  };
  r.onerror=()=>toast('Gagal membaca file.');
  r.readAsText(f);
});
/* pemicu simpan otomatis: setiap perubahan penting menunda simpan 0,8 detik */
['input','change'].forEach(ev=>document.addEventListener(ev,()=>scheduleAuto(),true));
window.addEventListener('pointerup',()=>scheduleAuto(),{passive:true});

/* ============ SMART SNAP GUIDES (garis bantu tengah) ============ */
function showGuides(v,h){
  const gv=$('guideV'), gh=$('guideH');
  if(gv) gv.style.display=v?'block':'none';
  if(gh) gh.style.display=h?'block':'none';
}
function hideGuides(){ showGuides(false,false); }
function snapCenter(fx,fy){
  const TH=.02;
  const sx=Math.abs(fx-.5)<TH, sy=Math.abs(fy-.5)<TH;
  showGuides(sx,sy);
  return { x:sx?.5:fx, y:sy?.5:fy };
}

/* ============ RIWAYAT UNDO/REDO GLOBAL ============ */
let UNDO=[], REDO=[];
function snapHist(){
  return { POS:JSON.parse(JSON.stringify(POS)), STICKER:STICKER?{...STICKER}:null,
    EXTRAS:JSON.parse(JSON.stringify(EXTRAS)), SHAPES:JSON.parse(JSON.stringify(SHAPES)),
    ZORDER:ZORDER.slice(), strokes:JSON.parse(JSON.stringify(strokes)),
    drawVisible, shapesVisible, locked:{ ...LAYER_LOCK } };
}
function pushHistory(){ UNDO.push(snapHist()); if(UNDO.length>50) UNDO.shift(); REDO=[]; }
function applyHist(hh){
  POS=JSON.parse(JSON.stringify(hh.POS)); STICKER=hh.STICKER?{...hh.STICKER}:null;
  EXTRAS=JSON.parse(JSON.stringify(hh.EXTRAS)); SHAPES=JSON.parse(JSON.stringify(hh.SHAPES));
  ZORDER=hh.ZORDER.slice(); strokes=JSON.parse(JSON.stringify(hh.strokes));
  drawVisible=hh.drawVisible!==false; shapesVisible=hh.shapesVisible!==false;
  LAYER_LOCK={ ...(hh.locked||{}) };
  TXT={ ...TXT_DEF, ...(hh.TXT||{}) };
  syncStickerUI(); builtExtraIds='__reset__'; builtShapeIds='__reset__';
  render();
}
function undoAll(){
  if(!UNDO.length){ toast('Tidak ada langkah untuk di-undo.'); return; }
  REDO.push(snapHist()); applyHist(UNDO.pop()); toast('Dibatalkan.');
}
function redoAll(){
  if(!REDO.length){ toast('Tidak ada langkah untuk di-redo.'); return; }
  UNDO.push(snapHist()); applyHist(REDO.pop()); toast('Dikembalikan.');
}
$('btnUndoAll').onclick=()=>undoAll();
$('btnRedoAll').onclick=()=>redoAll();
/* Duplikat cepat + perataan kanvas untuk elemen terpilih */
$('btnDuplicate').onclick=()=>{
  const sh=selShape();
  if(sh){
    if(SHAPES.length>=20){ toast('️ Maksimal 20 bentuk.'); return; }
    pushHistory();
    const c={...sh, id:'s'+Date.now().toString(36)+(shapeSeq++),
      x:Math.min(.96,sh.x+.05), y:Math.min(.96,sh.y+.05)};
    SHAPES.push(c); selectedShapeId=c.id; activeSel={kind:'shape',id:c.id};
    renderShapes(); toast('⧉ Bentuk diduplikat!');
    return;
  }
  const t=EXTRAS.find(x=>x.id===selectedExtraId);
  if(t){
    if(EXTRAS.length>=15){ toast('️ Maksimal 15 teks bebas.'); return; }
    pushHistory();
    EXTRAS.push({...t, id:'x'+Date.now().toString(36)+(extraSeq++),
      x:Math.min(.96,t.x+.05), y:Math.min(.96,t.y+.05)});
    selectedExtraId=EXTRAS[EXTRAS.length-1].id; activeSel={kind:'extra',id:selectedExtraId};
    builtExtraIds='__reset__'; renderExtras(); renderExtraList();
    toast('⧉ Teks diduplikat!');
    return;
  }
  toast('👆 Pilih dulu bentuk / teks bebas di kanvas (klik untuk memilih).');
};
function alignActive(pos){
  if(!activeSel){ toast('👆 Pilih dulu elemen di kanvas (klik untuk memilih).'); return; }
  const k=activeSel.kind;
  if(k==='shape'&&!selShape()){ toast('️ Bentuknya sudah tidak ada.'); return; }
  if(k==='extra'&&!EXTRAS.find(x=>x.id===activeSel.id)){ toast('️ Teksnya sudah tidak ada.'); return; }
  pushHistory();
  if(k==='shape'){ const s=selShape(); s.x=pos; renderShapes(); }
  else if(k==='extra'){ const t=EXTRAS.find(x=>x.id===activeSel.id); t.x=pos; renderExtras(); }
  else if(k==='drag'){
    const key=activeSel.key;
    if(key==='sticker'){ if(STICKER) STICKER.x=pos; }
    else POS[key][0]=pos===.5?0:(pos-.5)*.75;
    render();
  }
  toast(pos===.5?'⬌ Rata tengah kanvas.':(pos<.5?'⬅ Rata kiri kanvas.':'➡ Rata kanan kanvas.'));
}
$('alignL').onclick=()=>alignActive(.12);
$('alignC').onclick=()=>alignActive(.5);
$('alignR').onclick=()=>alignActive(.88);
window.addEventListener('keydown',e=>{
  const t=e.target;
  const typing=t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.tagName==='SELECT'||t.isContentEditable);
  if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&e.key.toLowerCase()==='z'){ if(typing) return; e.preventDefault(); undoAll(); }
  else if((e.ctrlKey||e.metaKey)&&(e.key.toLowerCase()==='y'||(e.shiftKey&&e.key.toLowerCase()==='z'))){ if(typing) return; e.preventDefault(); redoAll(); }
});


/* ---- Rataan vertikal + kunci layer ---- */
let LAYER_LOCK={};
function isLocked(key){ return !!LAYER_LOCK[key]; }
function alignVertical(pos){
  if(!activeSel){ toast('Pilih dulu elemen di kanvas.'); return; }
  const k=activeSel.kind;
  let el=null, layerKey=null;
  if(k==='extra'){ const t=EXTRAS.find(x=>x.id===activeSel.id); if(!t) return; el=document.querySelector('[data-extra="'+t.id+'"]'); layerKey='extras'; }
  else if(k==='shape'){ const s=SHAPES.find(x=>x.id===activeSel.id); if(!s) return; el=document.querySelector('[data-shape="'+s.id+'"]'); layerKey='shapes'; }
  else if(k==='drag'){ el=$('pvSticker')&&activeSel.key==='sticker'?$('pvSticker'):($('pvIconWrap')&&activeSel.key==='icon'?$('pvIconWrap'):null);
    layerKey=activeSel.key; }
  if(!el) return;
  if(layerKey&&isLocked(layerKey)){ toast('Layer ini dikunci. Buka kuncinya dulu.'); return; }
  pushHistory();
  const pr=poster.getBoundingClientRect(), r=el.getBoundingClientRect();
  const H=pr.height||1;
  const targetY=pos*H;
  if(k==='extra'||k==='shape'||(k==='drag'&&activeSel.key==='sticker')){
    const cur=(r.top+r.bottom)/2-pr.top;
    const delta=(targetY-cur)/H;
    if(k==='extra'){ const t=EXTRAS.find(x=>x.id===activeSel.id); t.y=Math.min(.99,Math.max(.01,t.y+delta)); renderExtras(); }
    else if(k==='shape'){ const s=SHAPES.find(x=>x.id===activeSel.id); s.y=Math.min(.99,Math.max(.01,s.y+delta)); renderShapes(); }
    else if(STICKER){ STICKER.y=Math.min(.99,Math.max(.01,STICKER.y+delta)); renderPositions(); }
  } else {
    // elemen di dalam kolom (ikon): geser lewat POS
    const cur=(r.top+r.bottom)/2-pr.top;
    POS[activeSel.key][1]=Math.min(.45,Math.max(-.45,POS[activeSel.key][1]+(targetY-cur)/H));
    render();
  }
  renderSelBox();
  toast(pos===.5?'Rata tengah vertikal.':(pos<.5?'Rata atas.':'Rata bawah.'));
}
$('alignT').onclick=()=>alignVertical(.22);
$('alignM').onclick=()=>alignVertical(.5);
$('alignB').onclick=()=>alignVertical(.78);

/* ============ DAFTAR LAYER DINAMIS + URUTAN Z ============ */
const LAYER_META={
  draw:{mark:'Pena',name:'Coretan'}, sticker:{mark:'Bintang',name:'Stiker'},
  extras:{mark:'Teks',name:'Teks Bebas'}, shapes:{mark:'Kotak',name:'Bentuk'},
  foot:{mark:'Tombol',name:'Tombol'}, sub:{mark:'Garis',name:'Subjudul'},
  title:{mark:'Huruf',name:'Judul'}, icon:{mark:'Kamera',name:'Ikon / Foto'},
  badge:{mark:'Label',name:'Badge'}, decor:{mark:'Lingkaran',name:'Dekorasi'},
  pattern:{mark:'Motif',name:'Motif'}, mark:{mark:'Hak Cipta',name:'Watermark'}
};
let builtLayerSig='__none__';
function moveLayer(key,dir){
  const i=ZORDER.indexOf(key), j=i+dir;
  if(i<0||j<0||j>=ZORDER.length) return;
  pushHistory();
  const t=ZORDER[i]; ZORDER[i]=ZORDER[j]; ZORDER[j]=t;
  toast(dir>0?'⬆ "'+LAYER_META[key].name+'" ke depan.':'⬇ "'+LAYER_META[key].name+'" ke belakang.');
  render();
}
function renderLayers(){
  const list=$('layerList'); if(!list) return;
  const eyeSig=['draw','sticker','foot','sub','title','icon','badge','decor','pattern','mark','shapes'].map(layerOn).join(',');
  const sig=ZORDER.join(',')+'|'+eyeSig+'|'+(STICKER?'1':'0')+'|'+SHAPES.length;
  if(sig===builtLayerSig) return;
  builtLayerSig=sig;
  list.innerHTML='';
  const rows=[{key:'draw',locked:true}]
    .concat(ZORDER.slice().reverse().map(k=>({key:k})))
    .concat([{key:'decor'},{key:'pattern'},{key:'mark'}]);
  rows.forEach(({key,locked})=>{
    const m=LAYER_META[key]; if(!m) return;
    const on=layerOn(key);
    const row=document.createElement('div');
    row.className='flex items-center gap-1.5 bg-[#F5F2EB] dark:bg-[#232B4D]/60 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2';
    let html='<span class="grid place-items-center w-4 h-4 shrink-0 text-slate-600 dark:text-[#D9D2BC]">'+markSvg(m.mark,16,'currentColor')+'</span><span class="flex-1 text-xs font-bold">'+m.name+'</span>';
    if(!locked&&ZORDER.includes(key)){
      html+='<button data-lmove="-1" class="text-xs font-extrabold bg-white dark:bg-[#1C2342] border border-slate-200 dark:border-slate-700 w-7 h-7 rounded-lg hover:border-[#E9B44C]" title="Kirim ke belakang">⬇</button>'
        +'<button data-lmove="1" class="text-xs font-extrabold bg-white dark:bg-[#1C2342] border border-slate-200 dark:border-slate-700 w-7 h-7 rounded-lg hover:border-[#E9B44C]" title="Bawa ke depan">⬆</button>';
    } else if(locked){
      html+='<span class="text-[9px] font-bold text-slate-400">ATAS</span>';
    }
    row.innerHTML=html;
    const lock=document.createElement('button');
    lock.className='llock grid place-items-center w-5 h-5 hover:scale-110 transition'+(isLocked(key)?' text-[#8A5A12] dark:text-[#E9B44C]':'');
    lock.innerHTML=markSvg(isLocked(key)?'Gembok':'Buka',14,'currentColor');
    lock.title=isLocked(key)?'Buka kunci layer':'Kunci layer';
    lock.setAttribute('aria-label',lock.title);
    lock.onclick=()=>{ pushHistory(); LAYER_LOCK[key]=!isLocked(key); renderLayers(); };
    row.appendChild(lock);
    const eye=document.createElement('button');
    eye.className='leye grid place-items-center w-5 h-5 hover:scale-110 transition'+(on?'':' opacity-40');
    eye.innerHTML=markSvg(on?'Mata':'Mata Tutup',16,'currentColor');
    eye.title='Tampil/sembunyi';
    if(key==='sticker'&&!STICKER){ eye.disabled=true; eye.classList.add('opacity-30'); }
    eye.onclick=()=>toggleLayer(key);
    row.appendChild(eye);
    row.querySelectorAll('[data-lmove]').forEach(b=>b.onclick=()=>moveLayer(key,+b.dataset.lmove));
    list.appendChild(row);
  });
}

/* ============ BENTUK DASAR (SHAPES) ============ */
function selShape(){ return SHAPES.find(s=>s.id===selectedShapeId)||null; }
function needSel(){ const s=selShape(); if(!s) toast('👆 Pilih bentuk dulu (klik di kanvas / daftar).'); return s; }
document.querySelectorAll('[data-shapeadd]').forEach(b=>b.onclick=()=>{
  if(SHAPES.length>=20){ toast('️ Maksimal 20 bentuk per halaman.'); return; }
  pushHistory();
  const kind=b.dataset.shapeadd;
  const base={ id:'s'+Date.now().toString(36)+(shapeSeq++), kind, color:$('shapeColor').value, x:.5, y:.5, angle:0, radius:.12 };
  if(kind==='rect') Object.assign(base,{w:.5,h:.2});
  else if(kind==='circle') Object.assign(base,{w:.32,h:.32});
  else if(kind==='triangle') Object.assign(base,{w:.42,h:.42});
  else if(kind==='star') Object.assign(base,{w:.38,h:.38});
  else if(kind==='arrow') Object.assign(base,{w:.5,h:.25});
  else Object.assign(base,{w:.6,h:.05,thick:+$('inShapeThick').value/1080,angle:+$('inShapeAngle').value});
  SHAPES.push(base); selectedShapeId=base.id;
  switchTab('bentuk'); renderShapes();
  toast('🔷 Bentuk ditambahkan, seret di kanvas!');
});
$('shapeColor').addEventListener('input',e=>{ const s=needSel(); if(!s) return; s.color=e.target.value; renderShapes(); });
$('shapeColor').addEventListener('pointerdown',()=>{ if(selShape()) pushHistory(); });
document.querySelectorAll('.scol').forEach(b=>b.onclick=()=>{ const s=needSel(); if(!s) return; pushHistory(); s.color=b.dataset.scolor; $('shapeColor').value=s.color; renderShapes(); });
$('inShapeW').addEventListener('input',e=>{ const s=needSel(); if(!s) return; s.w=+e.target.value/100; $('shapeWVal').textContent=e.target.value+'%'; renderShapes(); });
$('inShapeH').addEventListener('input',e=>{ const s=needSel(); if(!s||s.kind!=='rect') return; s.h=+e.target.value/100; $('shapeHVal').textContent=e.target.value+'%'; renderShapes(); });
$('inShapeThick').addEventListener('input',e=>{ const s=needSel(); if(!s||s.kind!=='line') return; s.thick=+e.target.value/1080; $('shapeThickVal').textContent=e.target.value; renderShapes(); });
$('inShapeAngle').addEventListener('input',e=>{ const s=needSel(); if(!s||s.kind==='circle') return; s.angle=+e.target.value; $('shapeAngleVal').textContent=e.target.value+'°'; renderShapes(); });
$('inShapeRadius').addEventListener('input',e=>{ const s=needSel(); if(!s||s.kind!=='rect') return; s.radius=+e.target.value/100; $('shapeRadiusVal').textContent=e.target.value+'%'; renderShapes(); });
['inShapeW','inShapeH','inShapeThick','inShapeAngle','inShapeRadius'].forEach(id=>$(id).addEventListener('pointerdown',()=>{ if(selShape()) pushHistory(); }));
function renderShapes(){
  const layer=$('shapeLayer'); if(!layer) return;
  layer.style.display=shapesVisible?'block':'none';
  const sig=SHAPES.map(s=>s.id).join(',');
  if(sig!==builtShapeIds){
    layer.innerHTML='';
    SHAPES.forEach(s=>{
      const d=document.createElement('div');
      d.dataset.shape=s.id; d.className='absolute';
      d.style.cssText+=';pointer-events:auto;';
      layer.appendChild(d);
    });
    builtShapeIds=sig;
  }
  if(!SHAPES.find(s=>s.id===selectedShapeId)) selectedShapeId=SHAPES.length?SHAPES[SHAPES.length-1].id:null;
  const { W, H }=posterWH();
  SHAPES.forEach(s=>{
    const el=layer.querySelector('[data-shape="'+s.id+'"]'); if(!el) return;
    el.style.left=(s.x*100)+'%'; el.style.top=(s.y*100)+'%';
    el.style.background=s.color;
    el.classList.toggle('shape-sel',s.id===selectedShapeId);
    if(s.kind==='rect'){
      el.style.width=(s.w*W)+'px'; el.style.height=(s.h*H)+'px'; el.style.borderRadius=((s.radius!==undefined?s.radius:.12)*100)+'%';
      el.style.transform='translate(-50%,-50%) rotate('+(s.angle||0)+'deg)';
    } else if(s.kind==='triangle'){
      el.style.width=(s.w*W)+'px'; el.style.height=(s.h*H)+'px'; el.style.borderRadius='0';
      el.style.clipPath='polygon(50% 0%, 100% 100%, 0% 100%)';
      el.style.transform='translate(-50%,-50%) rotate('+(s.angle||0)+'deg)';
    } else if(s.kind==='star'){
      el.style.width=(s.w*W)+'px'; el.style.height=(s.h*H)+'px'; el.style.borderRadius='0';
      el.style.clipPath='polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
      el.style.transform='translate(-50%,-50%) rotate('+(s.angle||0)+'deg)';
    } else if(s.kind==='arrow'){
      el.style.width=(s.w*W)+'px'; el.style.height=(s.h*H)+'px'; el.style.borderRadius='0';
      el.style.clipPath='polygon(0% 28%, 62% 28%, 62% 0%, 100% 50%, 62% 100%, 62% 72%, 0% 72%)';
      el.style.transform='translate(-50%,-50%) rotate('+(s.angle||0)+'deg)';
    } else if(s.kind==='circle'){
      const d=s.w*W; el.style.width=d+'px'; el.style.height=d+'px'; el.style.borderRadius='50%';
      el.style.transform='translate(-50%,-50%)';
    } else {
      el.style.width=(s.w*W)+'px'; el.style.height=Math.max(2,(s.thick||.014)*W)+'px'; el.style.borderRadius='999px';
      el.style.transform='translate(-50%,-50%) rotate('+(s.angle||0)+'deg)';
    }
  });
  renderShapeList();
  syncShapeControls();
}
function renderShapeList(){
  const list=$('shapeList'); if(!list) return;
  list.innerHTML='';
  const names={rect:'Kotak',circle:'Lingkaran',line:'Garis',triangle:'Segitiga',star:'Bintang',arrow:'Panah'};
  const icons={rect:'▢',circle:'⚪',line:'➖',triangle:'△',star:'★',arrow:'➤'};
  SHAPES.forEach((s,i)=>{
    const row=document.createElement('button');
    row.className='w-full flex items-center gap-2 rounded-xl px-2.5 py-2 border-2 text-left transition '
      +(s.id===selectedShapeId?'border-[#B97F1F] dark:border-[#E9B44C] bg-[#EFE3C2] dark:bg-[#2A3358] dark:bg-[#2A3358]':'border-slate-200 dark:border-slate-700 hover:border-[#E9B44C]');
    row.innerHTML='<span class="text-base">'+icons[s.kind]+'</span>'
      +'<span class="w-4 h-4 rounded-full border border-slate-300 shrink-0" style="background:'+s.color+'"></span>'
      +'<span class="flex-1 text-xs font-bold">'+names[s.kind]+' '+(i+1)+'</span>'
      +'<span data-xdel class="text-[11px] font-bold text-red-500 hover:scale-110" title="Hapus"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5h15M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5 7.5 20h9l1-13.5M10 10v6M14 10v6"/></svg></span>';
    row.onclick=e=>{
      if(e.target.closest('[data-xdel]')){ pushHistory(); SHAPES=SHAPES.filter(x=>x.id!==s.id); renderShapes(); toast('🗑 Bentuk dihapus.'); }
      else { selectedShapeId=s.id; activeSel={kind:'shape',id:s.id}; renderShapes(); }
    };
    list.appendChild(row);
  });
  if(!SHAPES.length) list.innerHTML='<p class="text-[11px] text-slate-400 text-center py-2">Belum ada bentuk. Klik Kotak / Lingkaran / Garis di atas.</p>';
}
function syncShapeControls(){
  const s=selShape(); if(!s) return;
  if(document.activeElement===$('shapeColor')) return;
  $('shapeColor').value=s.color;
  $('inShapeW').value=Math.round(s.w*100); $('shapeWVal').textContent=Math.round(s.w*100)+'%';
  if(s.kind==='rect'){ $('inShapeH').value=Math.round(s.h*100); $('shapeHVal').textContent=Math.round(s.h*100)+'%'; }
  const rw=$('shapeRadiusWrap');
  if(rw) rw.classList.toggle('hidden',s.kind!=='rect');
  if(s.kind==='rect'){ $('inShapeRadius').value=Math.round((s.radius!==undefined?s.radius:.12)*100); $('shapeRadiusVal').textContent=Math.round((s.radius!==undefined?s.radius:.12)*100)+'%'; }
  if(s.kind==='line'){ $('inShapeThick').value=Math.round((s.thick||.014)*1080); $('shapeThickVal').textContent=Math.round((s.thick||.014)*1080); }
  $('inShapeAngle').value=s.angle||0; $('shapeAngleVal').textContent=(s.angle||0)+'°';
}
/* Seret bentuk (delegasi) + snap */
poster.addEventListener('pointerdown',e=>{
  const tgt=e.target&&e.target.closest?e.target.closest('[data-shape]'):null;
  if(!tgt||drawTool!=='off') return;
  const s=SHAPES.find(x=>x.id===tgt.dataset.shape); if(!s) return;
  if(isLocked('shapes')){ toast('Layer bentuk dikunci.'); return; }
  e.preventDefault();
  pushHistory();
  selectedShapeId=s.id; activeSel={kind:'shape',id:s.id}; renderShapes();
  tgt.classList.add('dragging');
  const sx=e.clientX, sy=e.clientY, ox=s.x, oy=s.y;
  try{ tgt.setPointerCapture(e.pointerId); }catch(err){}
  const smv=ev=>{
    const { W, H }=posterWH();
    s.x=Math.min(.98,Math.max(.02,ox+(ev.clientX-sx)/W));
    s.y=Math.min(.98,Math.max(.02,oy+(ev.clientY-sy)/H));
    const sn=snapCenter(s.x,s.y); s.x=sn.x; s.y=sn.y;
    tgt.style.left=(s.x*100)+'%'; tgt.style.top=(s.y*100)+'%';
    if(typeof renderSelBox==='function') renderSelBox();
  };
  const sup=()=>{ hideGuides(); tgt.classList.remove('dragging'); tgt.removeEventListener('pointermove',smv); tgt.removeEventListener('pointerup',sup); tgt.removeEventListener('pointercancel',sup); };
  tgt.addEventListener('pointermove',smv); tgt.addEventListener('pointerup',sup); tgt.addEventListener('pointercancel',sup);
});

/* ---- Pelukis grup absolut sesuai urutan layer (untuk ekspor) ---- */
function drawShapesExport(ctx,W,H){
  SHAPES.forEach(s=>{
    ctx.save(); ctx.fillStyle=s.color;
    if(s.kind==='rect'){
      ctx.translate(s.x*W,s.y*H); ctx.rotate((s.angle||0)*Math.PI/180);
      const w=s.w*W, h=s.h*H, r=Math.min(w,h)*(s.radius!==undefined?s.radius:.12);
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(-w/2,-h/2,w,h,r); else ctx.rect(-w/2,-h/2,w,h);
      ctx.fill();
    } else if(s.kind==='triangle'||s.kind==='star'||s.kind==='arrow'){
      ctx.translate(s.x*W,s.y*H); ctx.rotate((s.angle||0)*Math.PI/180);
      const w=s.w*W, h=s.h*H;
      ctx.beginPath();
      if(s.kind==='triangle') ctx.moveTo(0,-h/2),ctx.lineTo(w/2,h/2),ctx.lineTo(-w/2,h/2);
      else if(s.kind==='arrow') ctx.moveTo(-w/2,-h*.22),ctx.lineTo(w*.12,-h*.22),ctx.lineTo(w*.12,-h/2),
        ctx.lineTo(w/2,0),ctx.lineTo(w*.12,h/2),ctx.lineTo(w*.12,h*.22),ctx.lineTo(-w/2,h*.22);
      else { const pts=[[0,-.5],[.12,-.16],[.48,-.16],[.19,.06],[.3,.5],[0,.26],[-.3,.5],[-.19,.06],[-.48,-.16],[-.12,-.16]];
        pts.forEach((p,i)=>i?ctx.lineTo(p[0]*w,p[1]*h):ctx.moveTo(p[0]*w,p[1]*h)); }
      ctx.closePath(); ctx.fill();
    } else if(s.kind==='circle'){
      ctx.beginPath(); ctx.arc(s.x*W,s.y*H,(s.w*W)/2,0,7); ctx.fill();
    } else {
      ctx.translate(s.x*W,s.y*H); ctx.rotate((s.angle||0)*Math.PI/180);
      const len=s.w*W, th=Math.max(2,(s.thick||.014)*W);
      ctx.beginPath();
      if(ctx.roundRect) ctx.roundRect(-len/2,-th/2,len,th,th/2); else ctx.rect(-len/2,-th/2,len,th);
      ctx.fill();
    }
    ctx.restore();
  });
}
function paintAbsGroups(ctx,W,H,u,front){
  const cr=['badge','icon','title','sub','foot'].map(k=>ZORDER.indexOf(k));
  const cmax=Math.max.apply(null,cr);
  ['sticker','extras','shapes'].map(k=>({k,r:ZORDER.indexOf(k)}))
    .filter(g=>front?g.r>cmax:g.r<=cmax)
    .sort((a,b)=>a.r-b.r)
    .forEach(g=>{
      if(g.k==='sticker'){ if(STICKER&&!STICKER.hidden) drawStickerExport(ctx,W,u); }
      else if(g.k==='extras'){ EXTRAS.forEach(t=>{
        const eu=t.size*(W/420);
        ctx.save();
        ctx.translate(t.x*W,t.y*H); if(t.rot) ctx.rotate(t.rot*Math.PI/180);
        if('letterSpacing' in ctx) ctx.letterSpacing=((t.ls||0)/100*eu)+'px';
        ctx.font=(t.bold===false?'400':(t.weight||800))+(t.italic?' italic':'')+' '+eu+'px '+t.family;
        ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillStyle=t.color;
        ctx.fillText(t.text,0,0);
        if(t.underline){ ctx.strokeStyle=t.color; ctx.lineWidth=Math.max(2,eu*.06); ctx.beginPath();
          const uw=ctx.measureText(t.text).width; ctx.moveTo(-uw/2,eu*.62); ctx.lineTo(uw/2,eu*.62); ctx.stroke(); }
        if('letterSpacing' in ctx) ctx.letterSpacing='0px';
        ctx.restore();
      }); }
      else if(g.k==='shapes'){ if(shapesVisible) drawShapesExport(ctx,W,H); }
    });
}

/* ============ CORAT-CORET: pen, spidol, eraser ============ */
let strokes=[]; // {tool,color,w,pts:[[nx,ny],...]} — koordinat ternormalisasi 0..1
let drawTool='off', drawColor='#ffffff';
/* Ketebalan masing-masing tool (px pada acuan 1080) — diingat terpisah */
const drawWidths={ pen:6, marker:18, eraser:28 };
const TOOL_NAMES={ pen:'Pen', marker:'Spidol', eraser:'Eraser', off:'Pen' };
let drawing=false, curStroke=null;
const drawLayer=$('drawLayer');
function drawDims(){
  const sz=SIZES[S.size];
  const W=720, H=Math.round(720*sz.h/sz.w);
  return {W,H};
}
function paintStrokes(ctx,W,H){
  ctx.save();
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(const st of strokes){
    ctx.save();
    if(st.tool==='eraser'){ ctx.globalCompositeOperation='destination-out'; ctx.globalAlpha=1; }
    else if(st.tool==='marker'){ ctx.globalAlpha=0.55; }
    else { ctx.globalAlpha=1; }
    ctx.strokeStyle=st.color;
    ctx.lineWidth=Math.max(1, st.w/1080*W);
    ctx.beginPath();
    st.pts.forEach(([nx,ny],i)=>{ const x=nx*W, y=ny*H; i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    if(st.pts.length===1){ const [nx,ny]=st.pts[0]; ctx.lineTo(nx*W+0.15, ny*H+0.15); }
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}
function renderDraw(){
  if(!drawLayer) return;
  const {W,H}=drawDims();
  if(drawLayer.width!==W||drawLayer.height!==H){ drawLayer.width=W; drawLayer.height=H; }
  const ctx=drawLayer.getContext('2d');
  ctx.clearRect(0,0,W,H);
  if(drawVisible) paintStrokes(ctx,W,H);
}
function evtPos(e){
  const r=drawLayer.getBoundingClientRect();
  return [Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)), Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))];
}
drawLayer.addEventListener('pointerdown',e=>{
  if(drawTool==='off'||e.button===2) return;
  e.preventDefault();
  drawing=true;
  pushHistory();
  const [nx,ny]=evtPos(e);
  curStroke={ tool:drawTool, color:drawColor, w:drawWidths[drawTool]||6, pts:[[nx,ny]] };
  strokes.push(curStroke);
  try{ drawLayer.setPointerCapture(e.pointerId); }catch(err){}
  renderDraw();
});
drawLayer.addEventListener('pointermove',e=>{
  if(!drawing||!curStroke) return;
  e.preventDefault();
  curStroke.pts.push(evtPos(e));
  // batasi titik agar memori tetap ringan
  if(curStroke.pts.length>1200) curStroke.pts.shift();
  renderDraw();
});
/* Penting: akhiri coretan dari level window supaya tombol lain TIDAK pernah
   "nyangkut" walau user melepas klik di luar kanvas / jendela. */
function endDraw(e){
  if(!drawing) return;
  if(e){ try{ if(drawLayer.hasPointerCapture(e.pointerId)) drawLayer.releasePointerCapture(e.pointerId); }catch(err){} }
  drawing=false; curStroke=null;
}
window.addEventListener('pointerup',endDraw);
window.addEventListener('pointercancel',endDraw);
window.addEventListener('blur',()=>endDraw());
drawLayer.addEventListener('lostpointercapture',()=>endDraw());
/* Esc = matikan mode gambar */
window.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&drawTool!=='off') setDrawTool('off');
});
function setDrawTool(t){
  drawTool=t;
  document.querySelectorAll('#drawToolGroup .draw-tool').forEach(b=>b.classList.toggle('active', b.dataset.draw===t));
  drawLayer.classList.toggle('draw-on', t!=='off');
  poster.classList.toggle('ready-move', t==='off');
  /* Slider selalu mengikuti ketebalan tool yang sedang aktif */
  const wk=t==='off'?'pen':t;
  $('drawWidth').value=drawWidths[wk];
  $('drawWidthVal').textContent=drawWidths[wk];
  $('drawWidthTool').textContent=TOOL_NAMES[t];
  const hints={ off:'Pilih Pen / Spidol / Eraser, lalu gambar langsung di atas poster. Coretan ikut tersimpan saat download HD. (Esc untuk berhenti)',
    pen:'Mode Pen: klik & seret di poster untuk menggambar garis presisi.',
    marker:'Mode Spidol: garis tebal semi-transparan, cocok untuk highlight.',
    eraser:'Mode Eraser: hapus coretan dengan mengusapnya.' };
  $('drawHint').textContent=hints[t];
}
document.querySelectorAll('#drawToolGroup .draw-tool').forEach(b=>b.onclick=()=>{ setDrawTool(b.dataset.draw); });
document.querySelectorAll('#drawColorGroup .dswatch').forEach(b=>b.onclick=()=>{
  drawColor=b.dataset.dcolor; $('drawColor').value=b.dataset.dcolor;
  document.querySelectorAll('#drawColorGroup .dswatch').forEach(x=>x.classList.toggle('active', x===b));
  if(drawTool==='off') setDrawTool('pen');
});
$('drawColor').addEventListener('input',e=>{
  drawColor=e.target.value;
  document.querySelectorAll('#drawColorGroup .dswatch').forEach(x=>x.classList.remove('active'));
  if(drawTool==='off') setDrawTool('pen');
});
$('iconSearch').addEventListener('input',()=>syncIconUI());
$('drawWidth').addEventListener('input',e=>{
  if(drawTool==='off') setDrawTool('pen');
  drawWidths[drawTool]=+e.target.value;
  $('drawWidthVal').textContent=drawWidths[drawTool];
});
$('btnUndo').onclick=()=>undoAll();
$('btnClearDraw').onclick=()=>{
  if(!strokes.length){ toast('🗑 Kanvas gambar sudah bersih.'); return; }
  pushHistory();
  strokes=[]; renderDraw(); toast('🗑 Semua coretan dihapus.');
};

/* ============ POSTER BARU (kosongan) ============ */
$('btnNew').onclick=()=>{
  const modeBtn=document.querySelector('#modeGroup [data-mode="custom"]');
  if(modeBtn && !modeBtn.classList.contains('active')) modeBtn.click();
  S.badge=''; S.title=''; S.subtitle=''; S.footer=''; S.iconSize=0; S.pattern='none';
  S.showBadge=false; S.showIcon=false; S.showFooter=false; S.showDecor=false; S.showMark=false;
  syncToggles();
  strokes=[]; renderDraw();
  POS=zeroPos(); STICKER=null; SHAPES=[]; selectedShapeId=null; ZORDER=[...ZBASE];
  shapesVisible=true; drawVisible=true; UNDO=[]; REDO=[];   builtShapeIds='__reset__';
  syncStickerUI(); syncIconUI();
  $('inBadge').value=''; $('inTitle').value=''; $('inSubtitle').value=''; $('inFooter').value=''; $('inIconSize').value=0;
  S.shSize=0; S.stSize=0; S.iconSvg=null;
  $('inShSize').value=0; $('shSizeVal').textContent='0'; $('inStSize').value=0; $('stSizeVal').textContent='0';
  toast('📄 Poster baru yang kosong siap. Selamat berkarya!');
  render();
};

/* ============ TEMA GELAP / TERANG ============ */
function setTheme(dark){
  document.documentElement.classList.toggle('dark',dark);
  try{ document.documentElement.style.colorScheme=dark?'dark':'light'; }catch(e){}
  $('themeIcon').innerHTML=dark
    ?'<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
    :'<svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>';
  $('themeLabel').textContent=dark?'Terang':'Gelap';
  try{ localStorage.setItem('posteria-theme',dark?'dark':'light'); }catch(e){}
}
$('btnTheme').onclick=()=>{ setTheme(!document.documentElement.classList.contains('dark')); toast(document.documentElement.classList.contains('dark')?'Mode gelap aktif.':'Mode terang aktif.'); };
try{ const pp=localStorage.getItem('posteria-theme'); if(pp!=='light') setTheme(true); }catch(e){}

/* ================= ACTIONS ================= */
function toast(msg){
  const t=$('toast'); t.innerHTML=msg;
  t.classList.remove('translate-y-24','opacity-0');
  clearTimeout(t._h);
  t._h=setTimeout(()=>t.classList.add('translate-y-24','opacity-0'),2600);
}
$('btnRandom').onclick=()=>{
  const p=PRESETS[Math.floor(Math.random()*PRESETS.length)];
  const mk=SVGS[Math.floor(Math.random()*SVGS.length)];
  const fonts=Object.keys(FONTS);
  S.c1=p.c1; S.c2=p.c2; S.icon=''; S.iconSvg=mk.s; S.vpos=['center','top','bottom'][Math.floor(Math.random()*3)]; S.font=fonts[Math.floor(Math.random()*fonts.length)];
  S.angle=Math.floor(Math.random()*360);
  $('inC1').value=S.c1; $('inC2').value=S.c2; $('inAngle').value=S.angle;
  syncIconUI();
  toast('Desain acak dibuat!');
  render();
};
$('btnReset').onclick=()=>{
  S={...DEFAULTS};
  clearUploadSilent();
  strokes=[]; renderDraw();
  POS=zeroPos(); STICKER=null; SHAPES=[]; selectedShapeId=null; ZORDER=[...ZBASE];
  shapesVisible=true; drawVisible=true; UNDO=[]; REDO=[]; builtShapeIds='__reset__';
  syncStickerUI(); syncIconUI(); setZoom(1);
  $('inBadge').value=S.badge; $('inTitle').value=S.title; $('inSubtitle').value=S.subtitle; $('inFooter').value=S.footer;
  $('inTitleSize').value=S.titleSize; $('inTitleColor').value=S.titleColor; $('inC1').value=S.c1; $('inC2').value=S.c2;
  $('inAngle').value=S.angle; $('inIconSize').value=S.iconSize;
  $('inShSize').value=S.shSize; $('shSizeVal').textContent=S.shSize; $('inShColor').value=S.shColor;
  $('inStSize').value=S.stSize; $('stSizeVal').textContent=S.stSize; $('inStColor').value=S.stColor;
  $('inPhotoSize').value=S.photoSize; $('inOverlay').value=S.overlay; $('inPadding').value=S.padding; $('inRadius').value=S.radius;
  syncToggles(); $('customPanel').classList.add('hidden');
  setUseAs('konten');
  document.querySelector('#modeGroup [data-mode="template"]').click();
  document.querySelector('#bgTypeGroup [data-bgtype="gradient"]').click();
  toast('Desain dikembalikan ke awal.');
  render();
};
function clearUploadSilent(){
  uploadDataURL=null; uploadImgEl=null;
  for(const [e,f] of [['dropPhotoEmpty','dropPhotoFilled'],['dropBgEmpty','dropBgFilled']]){
    $(e).classList.remove('hidden'); const fl=$(f); fl.classList.add('hidden'); fl.classList.remove('flex');
  }
  $('dropPhoto').classList.remove('has-img'); $('dropBg').classList.remove('has-img');
  $('filePhoto').value=''; $('fileBg').value='';
}
['inTitle','inSubtitle','inFooter'].forEach(id=>{ const e=$(id); if(e) e.addEventListener('input',()=>{ syncWaLink(); }); });
$('btnCopy').onclick=async()=>{
  const txt=`${S.badge}\n${S.title}\n${S.subtitle}\n${S.footer}`;
  try{ await navigator.clipboard.writeText(txt); toast('📋 Teks poster disalin!'); }
  catch{ toast('Gagal menyalin teks.'); }
};

/* ============ EXPORT: Canvas API murni (resolusi tinggi) ============ */
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function wrapLines(ctx,text,maxW){
  const words=String(text).split(/\s+/).filter(Boolean); const lines=[]; let cur='';
  for(const w of words){ const t=cur?cur+' '+w:w; if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w;} else cur=t; }
  if(cur)lines.push(cur); return lines.length?lines:[''];
}
function drawCover(ctx,img,W,H){
  const ir=img.naturalWidth/img.naturalHeight, cr=W/H;
  let sw,sh,sx,sy;
  if(ir>cr){ sh=img.naturalHeight; sw=sh*cr; sx=(img.naturalWidth-sw)/2; sy=0; }
  else { sw=img.naturalWidth; sh=sw/cr; sx=0; sy=(img.naturalHeight-sh)/2; }
  ctx.drawImage(img,sx,sy,sw,sh,0,0,W,H);
}
function svgWithSize(str){
  return str
    .replace(/\swidth="[^"]*"/g,'')
    .replace(/\sheight="[^"]*"/g,'')
    .replace('<svg','<svg width="512" height="512"');
}
function svgImage(str){
  return new Promise((res,rej)=>{
    const im=new Image();
    im.onload=()=>res(im); im.onerror=rej;
    im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svgWithSize(str));
  });
}
function drawStickerExport(ctx,W,u){
  ctx.save();
  ctx.translate(STICKER.x*W, STICKER.y*H); if(STICKER.rot) ctx.rotate(STICKER.rot*Math.PI/180);
  ctx.font=(STICKER.size*2.6*u)+'px \'Segoe UI Emoji\',\'Noto Color Emoji\',sans-serif';
  ctx.textAlign='center'; ctx.textBaseline='middle';
  ctx.fillText(STICKER.emoji,0,0);
  ctx.restore();
}
async function exportPoster(forceScale, asCanvas){
  const fmt=$('inFormat').value;
  if(fmt==='pdf'&&!asCanvas){ await exportPdfAll(); return; }
  const sz=SIZES[S.size];
  let scale=sz.print?1:(forceScale||+$('inQuality').value);
  const MAXPX=36e6;                       // batas memori canvas
  if(sz.w*scale*sz.h*scale>MAXPX) scale=Math.max(1,Math.sqrt(MAXPX/(sz.w*sz.h)));
  const W=Math.round(sz.w*scale), H=Math.round(sz.h*scale);
  const label=$('dlLabel'); label.textContent='Merender HD…';
  try{
    try{ await document.fonts.ready; }catch(e){}
    if(uploadImgEl && !uploadImgEl.complete){ await new Promise(res=>{uploadImgEl.onload=res;uploadImgEl.onerror=res;}); }
    const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
    const ctx=cv.getContext('2d');
    const u=W/1080; // unit skala relatif terhadap desain 1080
    const isCustom=S.mode==='custom';
    const showB=S.showBadge, showI=S.showIcon,
          showF=S.showFooter, showM=S.showMark, showD=S.showDecor;
    const bgImg = (S.bgType==='image'||S.useAs==='background') && uploadImgEl && uploadImgEl.naturalWidth && S.useAs==='background' && uploadDataURL;
    const photoImg = uploadImgEl && uploadImgEl.naturalWidth && uploadDataURL && S.useAs==='konten';
    // 1) background: foto / solid / gradien
    if(S.bgType==='image' && bgImg){
      if(!drawEditedPhoto(ctx,0,0,W,H)) drawCover(ctx,uploadImgEl,W,H);
      ctx.fillStyle=`rgba(0,0,0,${S.overlay/100})`; ctx.fillRect(0,0,W,H);
    } else if(S.bgType==='solid'){
      ctx.fillStyle=S.c1; ctx.fillRect(0,0,W,H);
    } else {
      const rad=S.angle*Math.PI/180;
      const dx=Math.cos(rad), dy=Math.sin(rad);
      const g=ctx.createLinearGradient(W/2-dx*W/2, H/2-dy*H/2, W/2+dx*W/2, H/2+dy*H/2);
      g.addColorStop(0,S.c1); g.addColorStop(1,S.c2);
      ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    }
    // 2) dekorasi: satu lingkaran garis
    if(showD){
      ctx.strokeStyle='rgba(255,255,255,.26)'; ctx.lineWidth=3*u;
      ctx.beginPath(); ctx.arc(W*0.86, H*0.12, W*0.31, 0, 7); ctx.stroke();
    }
    // 3) motif
    if(S.pattern!=='none'){
      ctx.fillStyle=S.pattern==='dots'?'rgba(255,255,255,.16)':'rgba(255,255,255,.10)';
      const step=(S.pattern==='dots'?64:84)*u;
      for(let yy=step/2;yy<H;yy+=step) for(let xx=step/2;xx<W;xx+=step){
        if(S.pattern==='dots'){ctx.beginPath();ctx.arc(xx,yy,4.5*u,0,7);ctx.fill();}
        else ctx.fillRect(xx,yy,3*u,3*u);
      }
    }
    // 8a) grup absolut di belakang konten (sesuai urutan layer)
    paintAbsGroups(ctx,W,H,u,false);
    const padX=(isCustom?120:120)*u;
    const cx = S.align==='left'?padX : S.align==='right'?W-padX : W/2;
    ctx.textAlign=S.align==='left'?'left':S.align==='right'?'right':'center';
    let y=H*0.5;
    const f=FONTS[S.font];
    const titleShrink=(isCustom&&S.layout==='foto')?0.85:1;
    // hitung tinggi blok agar vertikal center
    const titlePx=S.titleSize*3.1*u*titleShrink, subPx=44*u, badgePx=32*u, footH=120*u;
    const titleLH=(TXT.lh||1.12), titleLS=(TXT.ls||0)/100;
    const showT=S.showTitle;
    const titleFont=`${TXT.bold?f.weight:400}${TXT.italic?' italic':''} ${titlePx}px ${f.title}`;
    if('letterSpacing' in ctx) ctx.letterSpacing=(titleLS*titlePx)+'px';
    const titleLines=wrapLines((()=>{ctx.font=titleFont;return ctx;})(), S.title||'Judul Poster Kamu', W-240*u);
    const subLines=S.subtitle.trim()?wrapLines((()=>{ctx.font=`500 ${subPx}px ${f.sub}`;return ctx;})(), S.subtitle, W-260*u):[];
    const showS=S.showSubtitle&&subLines.length>0;
    let iconH=20*u;
    if(showI){
      if(photoImg){ const boost=(isCustom&&S.layout==='foto')?1.6:1; iconH=(S.photoSize*boost+50)*u; }
      else if(S.iconSize>0){ iconH=(S.iconSize*1.5+50)*u; }
    }
    const hasBadge=showB&&S.badge.trim(), hasFoot=showF&&S.footer.trim();
    const totalH=(hasBadge?badgePx+50*u:0)+iconH+(showT?titleLines.length*titlePx*titleLH:0)+(showS?subLines.length*subPx*1.4:0)+(hasFoot?footH+90*u:60*u);
    const padT=(isCustom?S.padding*3.2:90)*u, padB=(isCustom?S.padding*3.2:150)*u;
    y = !isCustom ? (S.vpos==='top' ? padT : S.vpos==='bottom' ? H-totalH-padB : (H-totalH)/2) : S.layout==='atas' ? padT : S.layout==='bawah' ? H-totalH-padB : (H-totalH)/2;
    // 4) badge
    if(hasBadge){
      ctx.font=`800 ${badgePx}px 'Plus Jakarta Sans',sans-serif`;
      const btxt=S.badge.toUpperCase();
      const bw=ctx.measureText(btxt).width+56*u, bh=70*u;
      const bx=cx-(ctx.textAlign==='center'?bw/2:ctx.textAlign==='left'?0:bw)+POS.badge[0]*W;
      const by=y+POS.badge[1]*H;
      ctx.fillStyle='#F3EDDC';
      roundRect(ctx,bx,by,bw,bh,6*u); ctx.fill();
      ctx.fillStyle='#141A33'; ctx.textBaseline='middle';
      const alignSave=ctx.textAlign; ctx.textAlign='center';
      ctx.fillText(btxt, bx+bw/2, by+bh/2+2*u);
      ctx.textAlign=alignSave;
      y+=bh+50*u;
    }
    // 5) ikon emoji ATAU foto upload
    if(showI){
      const ixx=cx+POS.icon[0]*W, iy=y+POS.icon[1]*H;
      if(photoImg){
        const boost=(isCustom&&S.layout==='foto')?1.6:1;
        const box=S.photoSize*boost*2.9*u;
        const ix=ixx-box/2, r=S.photoShape==='circle'?box/2:S.photoShape==='square'?24*u:52*u;
        ctx.save(); roundRect(ctx,ix,iy,box,box,r); ctx.clip();
        if(!drawEditedPhoto(ctx,ix,iy,box,box)) drawCover(ctx,uploadImgEl,ix,iy,box,box);
        ctx.restore();
        ctx.strokeStyle='rgba(255,255,255,.6)'; ctx.lineWidth=4*u;
        roundRect(ctx,ix,iy,box,box,r); ctx.stroke();
        y+=box+50*u;
      } else if(S.iconSvg){
        const box=S.iconSize>0?S.iconSize*4.4*u:200*u;
        const dd=box*.78;
        ctx.save();
        ctx.translate(ixx,iy+box/2); if(S.iconRot) ctx.rotate(S.iconRot*Math.PI/180);
        try{
          const simg=await svgImage(S.iconSvg);
          ctx.drawImage(simg,-dd/2,-dd/2,dd,dd);
        }catch(err){
          ctx.font=(box*.5)+'px sans-serif'; ctx.textBaseline='middle'; ctx.fillStyle='#ffffff';
          ctx.fillText('★',0,0);
        }
        ctx.restore();
        y+=box+50*u;
      } else if(S.iconSize>0){
        const box=S.iconSize*4.4*u, fs=S.iconSize*2.9*u;
        const ix=ixx-box/2;
        ctx.font=`${fs}px 'Segoe UI Emoji','Noto Color Emoji',sans-serif`;
        ctx.textBaseline='middle';
        ctx.fillText(S.icon,ixx,iy+box/2+4*u);
        y+=box+50*u;
      }
    }
    // 6) judul (+bayangan & outline)
    const shRGB=hexRgb(S.shColor||'#000000');
    const shOn=S.shSize>0, stW=(S.stSize||0)*3.1*u;
    ctx.fillStyle=S.titleColor; ctx.textBaseline='alphabetic';
    ctx.font=titleFont;
    if(S.font==='elegant'){ try{ctx.font=`italic ${TXT.bold?f.weight:400} ${titlePx}px ${f.title}`;}catch(e){} }
    if(showT){
      if(shOn){ ctx.shadowColor='rgba('+shRGB[0]+','+shRGB[1]+','+shRGB[2]+',.45)'; ctx.shadowOffsetY=S.shSize*3.1*u*.35; ctx.shadowBlur=S.shSize*3.1*u; }
      if(stW>0){ ctx.lineJoin='round'; ctx.lineWidth=stW; ctx.strokeStyle=S.stColor||'#ffffff'; }
      titleLines.forEach((ln,i)=>{ const lx=cx+POS.title[0]*W, ly=y+POS.title[1]*H+titlePx*titleLH*i;
        if(stW>0) ctx.strokeText(ln,lx,ly); ctx.fillText(ln,lx,ly);
        if(TXT.underline){ ctx.save(); ctx.strokeStyle=S.titleColor; ctx.lineWidth=Math.max(2,titlePx*.05);
          ctx.beginPath(); const uw=ctx.measureText(ln).width;
          const ux=ctx.textAlign==='center'?lx-uw/2:(ctx.textAlign==='right'?lx-uw:lx);
          ctx.moveTo(ux,ly+titlePx*.14); ctx.lineTo(ux+uw,ly+titlePx*.14); ctx.stroke(); ctx.restore(); } });
      ctx.shadowColor='transparent'; ctx.shadowBlur=0; ctx.shadowOffsetY=0;
      y+=titleLines.length*titlePx*titleLH+36*u;
    }
    if('letterSpacing' in ctx) ctx.letterSpacing='0px';
    // 7) subjudul
    if(showS){
      ctx.fillStyle='rgba(255,255,255,.90)'; ctx.font=`500 ${subPx}px ${f.sub}`;
      if(S.font==='elegant'){ try{ctx.font=`italic 500 ${subPx}px ${f.sub}`;}catch(e){} }
      subLines.forEach((ln,i)=>{ ctx.fillText(ln,cx+POS.sub[0]*W,y+POS.sub[1]*H+subPx*1.4*i); });
      y+=subLines.length*subPx*1.4+60*u;
    }
    // 8) footer tombol
    if(hasFoot){
      const fw=W-300*u, fh=120*u, fx=(W-fw)/2+POS.foot[0]*W, fy=y+POS.foot[1]*H;
      ctx.fillStyle='#F3EDDC'; roundRect(ctx,fx,fy,fw,fh,8*u); ctx.fill();
      ctx.fillStyle='#141A33'; ctx.font=`800 ${40*u}px 'Plus Jakarta Sans',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(S.footer.toUpperCase().slice(0,42), fx+fw/2, fy+fh/2+2*u);
      y+=fh+34*u;
    }
    // 8b) grup absolut di depan konten (sesuai urutan layer)
    paintAbsGroups(ctx,W,H,u,true);
    drawQrExport(ctx,W,H);
    // 9) watermark
    if(showM){
      ctx.fillStyle='rgba(255,255,255,.65)'; ctx.font=`600 ${26*u}px 'Plus Jakarta Sans',sans-serif`;
      ctx.textAlign='center'; ctx.textBaseline='alphabetic';
      ctx.fillText('Posteria · Rasen', W/2, H-70*u);
    }
    // 9b) coretan pen/spidol (via layer offscreen agar eraser hanya menghapus coretan)
    if(drawVisible&&strokes.length){
      const off=document.createElement('canvas'); off.width=W; off.height=H;
      paintStrokes(off.getContext('2d'),W,H);
      ctx.drawImage(off,0,0);
    }
    // 10) unduh — atau kembalikan canvas bila diminta (fitur tab baru)
    if(window.__wantCanvas){ const c=window.__wantCanvas; window.__wantCanvas=null; c.resolve(cv); return; }
    const a=document.createElement('a');
    const slug=(($('docTitle')&&$('docTitle').value)||'posteria').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'posteria';
    a.download=slug+`-${S.size}-${sz.w}x${sz.h}.${fmt}`;
    a.href=cv.toDataURL(fmt==='jpeg'?'image/jpeg':'image/png', .95);
    a.click();
    toast(`✅ Poster ${sz.w}×${sz.h} (${fmt.toUpperCase()}) terdownload!`);
  }catch(err){
    console.error(err);
    // Fallback html2canvas bila Canvas API gagal
    try{
      const canvas=await html2canvas(poster,{scale:3,useCORS:true,backgroundColor:null});
      if(window.__wantCanvas){ const c=window.__wantCanvas; window.__wantCanvas=null; c.resolve(canvas); return; }
      const a=document.createElement('a');
      a.download=`posteria-${S.size}.png`; a.href=canvas.toDataURL('image/png'); a.click();
      toast('Poster terdownload (fallback mode).');
    }catch(e2){ if(window.__wantCanvas){ const c=window.__wantCanvas; window.__wantCanvas=null; c.reject(e2); return; } toast('Gagal mengekspor. Coba lagi.'); }
  }finally{
    label.textContent='Download Poster';
  }
}
$('btnDownload').onclick=()=>exportPoster();
$('btnPreviewDl').onclick=()=>exportPoster();


/* ============================================================
   UNDUH PDF (dibuat sendiri di browser, tanpa server & tanpa
   library): tiap halaman poster jadi satu halaman PDF.
   ============================================================ */
function dataUrlToBytes(url){
  const bin=atob(String(url).split(',')[1]);
  const out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++) out[i]=bin.charCodeAt(i);
  return out;
}
function buildPdf(items){ // items: {bytes,w,h,mw,mh}
  const enc=new TextEncoder(), parts=[]; let len=0;
  const push=b=>{ parts.push(b); len+=b.length; };
  const pushStr=s=>push(enc.encode(s));
  const n=items.length, objCount=2+n*3;
  const pageNum=i=>3+i*3;
  pushStr('%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n');
  const off=[];
  off[1]=len; pushStr('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  const kids=items.map((_,i)=>pageNum(i)+' 0 R').join(' ');
  off[2]=len; pushStr('2 0 obj\n<< /Type /Pages /Kids ['+kids+'] /Count '+n+' >>\nendobj\n');
  items.forEach((it,i)=>{
    const pn=pageNum(i), cn=pn+1, im=pn+2;
    off[pn]=len;
    pushStr(pn+' 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 '+it.mw.toFixed(2)+' '+it.mh.toFixed(2)+']'
      +' /Resources << /XObject << /Im0 '+im+' 0 R >> >> /Contents '+cn+' 0 R >>\nendobj\n');
    const content='q '+it.mw.toFixed(2)+' 0 0 '+it.mh.toFixed(2)+' 0 0 cm /Im0 Do Q';
    off[cn]=len;
    pushStr(cn+' 0 obj\n<< /Length '+content.length+' >>\nstream\n'+content+'\nendstream\nendobj\n');
    off[im]=len;
    pushStr(im+' 0 obj\n<< /Type /XObject /Subtype /Image /Width '+it.w+' /Height '+it.h
      +' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+it.bytes.length+' >>\nstream\n');
    push(it.bytes);
    pushStr('\nendstream\nendobj\n');
  });
  const xrefPos=len;
  let xref='xref\n0 '+(objCount+1)+'\n0000000000 65535 f \n';
  for(let i=1;i<=objCount;i++) xref+=String(off[i]).padStart(10,'0')+' 00000 n \n';
  pushStr(xref);
  pushStr('trailer\n<< /Size '+(objCount+1)+' /Root 1 0 R >>\nstartxref\n'+xrefPos+'\n%%EOF');
  const out=new Uint8Array(len); let p=0;
  parts.forEach(c=>{ out.set(c,p); p+=c.length; });
  return out;
}
async function exportPdfAll(){
  const label=$('dlLabel'); const back=curPage;
  try{
    saveCurrentPage();
    const total=pages.length;
    label.textContent='Menyusun PDF…';
    const items=[];
    for(let i=0;i<total;i++){
      loadSnap(i);
      label.textContent='Menyusun PDF… '+(i+1)+'/'+total;
      await new Promise(r=>setTimeout(r,120));
      const sz=SIZES[S.size];
      const sc=sz.print?1:2;
      const cv=await getPosterCanvas(sc);
      const url=cv.toDataURL('image/jpeg',.92);
      const bytes=dataUrlToBytes(url);
      const mw=sz.print?(sz.mmW*72/25.4):(sz.w*sc*72/96);
      const mh=sz.print?(sz.mmH*72/25.4):(sz.h*sc*72/96);
      items.push({ bytes, w:cv.width, h:cv.height, mw, mh });
    }
    const pdf=buildPdf(items);
    const blob=new Blob([pdf],{type:'application/pdf'});
    const slug=((($('docTitle')&&$('docTitle').value)||'posteria').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,''))||'posteria';
    const a=document.createElement('a');
    a.download=slug+'.pdf'; a.href=URL.createObjectURL(blob); a.click();
    setTimeout(()=>URL.revokeObjectURL(a.href),4000);
    toast('PDF '+total+' halaman selesai diunduh.');
  }catch(err){
    console.error(err);
    toast('Gagal membuat PDF.');
  }finally{
    loadSnap(back);
    label.textContent='Download Poster';
  }
}


/* ============================================================
   SALIN GAMBAR, BAGIKAN (Web Share), WHATSAPP (teks saja)
   ============================================================ */
function shareText(){
  const t=(S.title||'Poster Posteria').trim();
  const sub=(S.subtitle||'').trim();
  const foot=(S.footer||'').trim();
  return [t,sub,foot].filter(Boolean).join('\n');
}
async function posterBlob(){
  const cv=await getPosterCanvas(2);
  return await new Promise(res=>cv.toBlob(res,'image/png'));
}
$('btnCopyImage').onclick=async()=>{
  try{
    if(!navigator.clipboard||!window.ClipboardItem) { toast('Browser ini belum bisa menyalin gambar.'); return; }
    const blob=await posterBlob();
    await navigator.clipboard.write([new ClipboardItem({'image/png':blob})]);
    toast('Gambar poster disalin ke clipboard.');
  }catch(e){ toast('Gagal menyalin gambar ke clipboard.'); }
};
$('btnShare').onclick=async()=>{
  try{
    const blob=await posterBlob();
    const file=new File([blob],'posteria.png',{type:'image/png'});
    if(navigator.canShare&&!navigator.canShare({files:[file]})){ toast('Bagikan file tidak didukung browser ini.'); return; }
    await navigator.share({ title:(S.title||'Poster Posteria'), text:shareText(), files:[file] });
  }catch(e){ if(e&&e.name==='AbortError') return; toast('Gagal membuka menu bagikan.'); }
};
/* tombol Bagikan hanya muncul bila browser mendukung Web Share dengan file */
(function(){
  const b=$('btnShare'); if(!b) return;
  const ok=typeof navigator.share==='function';
  b.classList.toggle('hidden',!ok);
})();
function syncWaLink(){
  const a=$('btnWa'); if(!a) return;
  const t=encodeURIComponent(shareText());
  a.href='https://wa.me/?text='+t;
}

/* ============ BUKA HASIL DI TAB BARU ============ */
function getPosterCanvas(sc){ return new Promise((resolve,reject)=>{ window.__wantCanvas={resolve,reject}; exportPoster(sc||1,true).catch(reject); }); }
$('btnNewTab').onclick=async()=>{
  const win=window.open('','_blank');
  if(!win){ toast('Popup diblokir browser. Izinkan popup untuk fitur ini.'); return; }
  win.document.write('<p style="font-family:sans-serif;color:#888">⏳ Merender poster…</p>');
  try{
    const cv=await getPosterCanvas();
    const url=cv.toDataURL('image/png');
    win.document.title='Pratinjau Poster - Posteria';
    win.document.body.style.cssText='margin:0;background:#0f172a;display:grid;place-items:center;min-height:100vh;padding:24px;box-sizing:border-box;';
    win.document.body.innerHTML='';
    const img=win.document.createElement('img');
    img.src=url; img.alt='Poster Posteria';
    img.style.cssText='max-width:100%;max-height:calc(100vh - 48px);border-radius:12px;box-shadow:0 25px 60px rgba(0,0,0,.5);';
    win.document.body.appendChild(img);
    toast('🔗 Poster dibuka di tab baru!');
  }catch(err){ try{win.close();}catch(e){} toast('Gagal membuka tab baru.'); }
};

/* ============ ANIMASI SCROLL: reveal + parallax + progres ============ */
const hasIO=typeof IntersectionObserver!=='undefined';
const revealObs=hasIO?new IntersectionObserver(es=>{
  es.forEach(en=>{
    const el=en.target;
    if(en.isIntersecting){
      el.classList.add('revealed');
      el._revealedOnce=true;
      clearTimeout(el._rh);
      el._rh=setTimeout(()=>{ el.style.transitionDelay=''; el.classList.add('done'); },900);
    } else if(el._revealedOnce){
      clearTimeout(el._rh);
      el.classList.remove('done');
      void el.offsetWidth;
      el.classList.remove('revealed');
    }
  });
},{threshold:.12,rootMargin:'0px 0px -8% 0px'}):null;
function observeReveals(root){
  const els=(root||document).querySelectorAll('[data-reveal]:not(.revealed)');
  if(!hasIO||!revealObs){ els.forEach(el=>el.classList.add('revealed')); return; }
  els.forEach(el=>{
    if(el.dataset.delay) el.style.transitionDelay=el.dataset.delay+'ms';
    revealObs.observe(el);
  });
}
function tagReveal(sel,dir,step){
  document.querySelectorAll(sel).forEach((el,i)=>{
    if(el.hasAttribute('data-reveal')) return;
    el.setAttribute('data-reveal',dir||'');
    if(step) el.style.transitionDelay=Math.min(i*step,480)+'ms';
  });
}
tagReveal('#galeri > div:first-child');
tagReveal('#catPills');
tagReveal('#fitur > div:first-child');
tagReveal('#fitur > div:nth-child(2) > div','',90);
tagReveal('#cara > div','',110);
tagReveal('#studio > div:first-child');
tagReveal('#studio > div:nth-child(3) > aside','left');
tagReveal('#studio > div:nth-child(3) > section','right');
tagReveal('#sketsa > div:first-child');
tagReveal('#sketsa aside','left');
tagReveal('#sketsa > div:nth-child(2) > div:nth-child(2)','right');
tagReveal('footer > div','zoom');
observeReveals();
const reduceMotion=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const plxEls=[...document.querySelectorAll('[data-parallax]')];
let scrollTick=false;
function onScrollPage(){
  if(scrollTick||reduceMotion) return;
  scrollTick=true;
  requestAnimationFrame(()=>{
    const y=window.scrollY||0;
    plxEls.forEach(el=>{ el.style.transform='translate3d(0,'+(y*parseFloat(el.dataset.parallax||.1)).toFixed(1)+'px,0)'; });
    const h=document.documentElement;
    const max=h.scrollHeight-h.clientHeight;
    const bar=$('scrollProgress');
    if(bar) bar.style.transform='scaleX('+(max>0?(h.scrollTop/max).toFixed(3):0)+')';
    scrollTick=false;
  });
}
window.addEventListener('scroll',onScrollPage,{passive:true});
onScrollPage();
poster.classList.add('ready-move');
(function(){
  try{
    var t=document.createElement('div'); t.className='hidden'; document.body.appendChild(t);
    var cssFailed=getComputedStyle(t).display!=='none';
    t.remove();
    if(cssFailed) document.getElementById('noNet').style.display='block';
  }catch(e){}
  window.addEventListener('error',function(e){ try{ if(e&&e.message) toast('️ Galat: '+e.message); }catch(err){} });
  window.addEventListener('unhandledrejection',function(e){ try{ var r=e.reason; toast('️ Gagal: '+((r&&r.message)||'unknown')); }catch(err){} });
})();
render();
pages=[snapshot()];
renderPagesBar();
renderLandingGallery();

/* ============ JALANKAN SAAT HALAMAN SIAP ============ */
if(typeof syncPhotoUI==='function') syncPhotoUI();
if(typeof syncQrUI==='function') syncQrUI();
if(typeof syncTxtUI==='function') syncTxtUI();
loadMyTpl();
renderLandingGallery();
syncWaLink();
/* tawarkan melanjutkan desain terakhir (hanya sekali, setelah semua siap) */
(function(){
  const d=readAuto();
  if(d){ showResumeBox(d); toast('Ada desain tersimpan. Lanjutkan atau mulai baru di bagian Studio.'); }
  else autosaveReady=true;
})();
