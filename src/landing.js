/* Posteria - bagian landing: state dasar, render real-time, template galeri,
   favorit, dan template milik pengguna. */
/* ================= STATE ================= */
/* Perkuat classList agar menerima beberapa kelas sekaligus (dipakai di banyak panel) */
['add','remove'].forEach(m=>{
  const orig=DOMTokenList.prototype[m];
  DOMTokenList.prototype[m]=function(...a){ a.forEach(x=>String(x).split(' ').filter(Boolean).forEach(t=>orig.call(this,t))); };
});
(function(){
  const origT=DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle=function(t,f){
    if(typeof t==='string'&&t.indexOf(' ')>-1){
      const ts=t.split(' ').filter(Boolean);
      if(f===undefined){ ts.forEach(x=>origT.call(this,x)); return this.contains(ts[0]); }
      ts.forEach(x=>origT.call(this,x,!!f)); return !!f;
    }
    return origT.call(this,t,f);
  };
})();
const FONTS = {
  modern:  { title: "'Plus Jakarta Sans','Inter',sans-serif", sub: "'Plus Jakarta Sans','Inter',sans-serif", weight: 800 },
  serif:   { title: "'Playfair Display',serif",               sub: "'Plus Jakarta Sans',sans-serif",          weight: 700 },
  playful: { title: "Fredoka,sans-serif",                    sub: "'Plus Jakarta Sans',sans-serif",          weight: 600 },
  elegant: { title: "'Cormorant Garamond',serif",             sub: "'Cormorant Garamond',serif",              weight: 700 },
  poppins:   { title: "Poppins,'Plus Jakarta Sans',sans-serif",  sub: "'Plus Jakarta Sans',sans-serif",          weight: 700 },
  montserrat:{ title: "Montserrat,'Plus Jakarta Sans',sans-serif", sub: "'Plus Jakarta Sans',sans-serif",        weight: 800 },
  oswald:    { title: "Oswald,'Plus Jakarta Sans',sans-serif",   sub: "'Plus Jakarta Sans',sans-serif",          weight: 600 },
  dancing:   { title: "'Dancing Script',cursive",                sub: "'Plus Jakarta Sans',sans-serif",          weight: 700 },
};
const PRESETS = [
  { n:'Navy',        c1:'#16233A', c2:'#2A3260' },
  { n:'Terakota',    c1:'#7A4033', c2:'#B4703A' },
  { n:'Laut',        c1:'#0B3A54', c2:'#1D6273' },
  { n:'Hutan',       c1:'#12351F', c2:'#2F6B3A' },
  { n:'Tengah Malam',c1:'#101A33', c2:'#33406B' },
  { n:'Karamel',     c1:'#33210F', c2:'#8C5A2B' },
  { n:'Bata',        c1:'#5E1B1B', c2:'#A8471F' },
  { n:'Mono',        c1:'#191717', c2:'#3D3A38' },
  { n:'Lumut',       c1:'#2B3A2F', c2:'#4E6B4F' },
  { n:'Plum',        c1:'#3A2036', c2:'#6E3A4E' },
  { n:'Kabut',       c1:'#33404F', c2:'#64748B' },
  { n:'Susu',        c1:'#3A1512', c2:'#7E2E22' },
];
const ICONS = [
  {e:'🚀',k:'roket rocket launch cepat luar angkasa startup'},
  {e:'🎨',k:'seni art desain lukis cat kreatif warna'},
  {e:'✨',k:'sparkle kilau bintang bersinar baru ajaib'},
  {e:'❤️',k:'hati love cinta suka favorit sayang'},
  {e:'🔥',k:'api fire hot panas promo laris'},
  {e:'🎉',k:'pesta party perayaan hore selamat'},
  {e:'💡',k:'lampu ide idea kreatif pintar cerdas'},
  {e:'⭐',k:'bintang star favorit rating nilai'},
  {e:'🎯',k:'target goal fokus tepat sasaran'},
  {e:'☕',k:'kopi coffee ngopi kafe minuman'},
  {e:'🌙',k:'bulan moon malam tidur mimpi'},
  {e:'💎',k:'berlian diamond mewah premium mahal'},
  {e:'📣',k:'pengumuman announce promo info toa'},
  {e:'🌈',k:'pelangi rainbow ceria warna warni'},
  {e:'🛍️',k:'belanja shop belanja tas sale toko'},
  {e:'🎧',k:'musik headphone audio lagu headset'}
];
const SIZES = {
  portrait: { label:'Portrait 1080×1440', ratio:'3/4',  w:1080, h:1440, maxW:420 },
  square:   { label:'Square 1080×1080',   ratio:'1/1',  w:1080, h:1080, maxW:440 },
  story:    { label:'Story 1080×1920',    ratio:'9/16', w:1080, h:1920, maxW:300 },
  /* ukuran cetak: 300 dpi, 1 px = 1/300 inci */
  a4p: { label:'A4 potret (210×297 mm)', ratio:'210/297', w:2480, h:3508, maxW:420, print:true,  mmW:210, mmH:297 },
  a4l: { label:'A4 lanskap (297×210 mm)', ratio:'297/210', w:3508, h:2480, maxW:560, print:true,  mmW:297, mmH:210 },
  a3p: { label:'A3 potret (297×420 mm)', ratio:'297/420', w:3508, h:4960, maxW:420, print:true,  mmW:297, mmH:420 },
  a3l: { label:'A3 lanskap (420×297 mm)', ratio:'420/297', w:4960, h:3508, maxW:560, print:true,  mmW:420, mmH:297 },
  a5p: { label:'A5 potret (148×210 mm)', ratio:'148/210', w:1748, h:2480, maxW:360, print:true,  mmW:148, mmH:210 },
  a5l: { label:'A5 lanskap (210×148 mm)', ratio:'210/148', w:2480, h:1748, maxW:500, print:true,  mmW:210, mmH:148 },
};
const PRINT_SIZES=['a4p','a4l','a3p','a3l','a5p','a5l'];
const DEFAULTS = { vpos:'center', badge:'Promo Gajian', title:'Diskon Akhir Tahun', subtitle:'Semua item −20% • sampai 31 Desember', footer:'Lihat Koleksi', font:'modern', titleSize:46, titleColor:'#F3EDDC', align:'center', c1:'#16233A', c2:'#7A4033', angle:150, pattern:'none', icon:'', iconSize:64, size:'portrait',
  mode:'template', layout:'tengah', bgType:'gradient', overlay:45, useAs:'konten', photoSize:120, photoShape:'rounded',
  showBadge:true, showIcon:true, showFooter:true, showDecor:true, showMark:true, showTitle:true, showSubtitle:true,
  shSize:0, shColor:'#000000', stSize:0, stColor:'#ffffff', iconSvg:null, iconRot:0, padding:32, radius:26 };
let S = { ...DEFAULTS };
/* Format teks judul: tebal, miring, garis bawah, jarak huruf, jarak baris */
const TXT_DEF={ bold:true, italic:false, underline:false, ls:0, lh:1.12 };
let TXT={ ...TXT_DEF };
/* Elemen QR: dibuat di browser, tidak ada data yang dikirim ke server */
const QR_DEF={ on:false, text:'', x:.5, y:.62, size:150, rot:0 };
let QR={ ...QR_DEF };
/*状态 edit foto: putar, balik, filter, crop (dinormalisasi 0..1) */
const PHOTO_DEF={ rot:0, flipX:false, flipY:false, bright:0, contrast:0, sat:0, bw:false, crop:null };
let PHOTO={ ...PHOTO_DEF };
let uploadDataURL = null;   // gambar upload (dipakai konten ATAU background sesuai S.useAs)
let uploadImgEl = null;     // elemen Image untuk ekspor canvas resolusi tinggi

/* ================= REFS ================= */
const $ = id => document.getElementById(id);
const poster=$('poster'), pvBadge=$('pvBadge'), pvIconWrap=$('pvIconWrap'), pvIcon=$('pvIcon'), pvPhoto=$('pvPhoto'), pvTitle=$('pvTitle'), pvSubtitle=$('pvSubtitle'), pvFooter=$('pvFooter'), pvFooterWrap=$('pvFooterWrap'), pvMark=$('pvMark'), posterPattern=$('posterPattern'), posterInner=$('posterInner'), posterBgImg=$('posterBgImg'), posterOverlay=$('posterOverlay'), decorLayer=$('decorLayer');
const pvSvg=$('pvSvg');

/* ================= BUILD OPTION GRIDS ================= */
const presetGroup = $('presetGroup');
PRESETS.forEach((p,i)=>{
  const b=document.createElement('button');
  b.className='opt-btn h-11 rounded-xl border-2 border-slate-200 hover:scale-105 hover:shadow-card'+(i===0?' active !border-[#E9B44C]':'');
  b.style.background=`linear-gradient(135deg, ${p.c1}, ${p.c2})`;
  b.title=p.n; b.dataset.i=i;
  b.onclick=()=>{ S.c1=p.c1; S.c2=p.c2; $('inC1').value=p.c1; $('inC2').value=p.c2; markActive(presetGroup,b); render(); };
  presetGroup.appendChild(b);
});
const iconGroup=$('iconGroup');
function buildIconGrid(filter){
  iconGroup.innerHTML='';
  const q=(filter||'').toLowerCase().trim();
  ICONS.filter(o=>!q||o.k.includes(q)||o.e===q).forEach(o=>{
    const on=!S.iconSvg&&S.icon===o.e;
    const b=document.createElement('button');
    b.className='opt-btn text-xl border-2 rounded-xl py-1.5 hover:scale-110 hover:shadow-card '+(on?'border-[#B97F1F] dark:border-[#E9B44C] bg-[#EFE3C2] dark:bg-[#2A3358]':'border-slate-200');
    b.textContent=o.e; b.title=o.e; b.dataset.icon=o.e;
    b.onclick=()=>{ S.icon=o.e; S.iconSvg=null; if(S.iconSize===0){S.iconSize=64;$('inIconSize').value=64;} syncIconUI(); render(); };
    iconGroup.appendChild(b);
  });
  if(!iconGroup.children.length) iconGroup.innerHTML='<p class="col-span-6 text-[11px] text-slate-400 text-center py-2">Tidak ketemu, coba kata lain.</p>';
}
/* Ikon garis SVG bawaan (tajam di semua ukuran) */
const SVGS=[
  {n:'Bintang',k:'bintang star favorit rating nilai',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2.5 14.9 8.6 21.5 9.3 16.4 13.8 17.8 20.4 12 17 6.2 20.4 7.6 13.8 2.5 9.3 9.1 8.6"/></svg>'},
  {n:'Hati',k:'hati love cinta suka sayang favorit',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5S3.5 15.4 3.5 9.6A4.6 4.6 0 0 1 8.2 5c1.6 0 3 .9 3.8 2.2A4.6 4.6 0 0 1 15.8 5a4.6 4.6 0 0 1 4.7 4.6c0 5.8-8.5 10.9-8.5 10.9Z"/></svg>'},
  {n:'Petir',k:'petir kilat cepat energi power',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 5 13.5 11 13.5 10 22 19 9.5 13 9.5"/></svg>'},
  {n:'Musik',k:'musik lagu nada audio headphone',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="17.5" r="3.2"/><circle cx="17" cy="15.5" r="3.2"/><path d="M10.2 17.5V6l10-2.5v12"/></svg>'},
  {n:'Keranjang',k:'keranjang belanja cart toko sale beli',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2.5l2.2 11h10.6l2.2-8H7"/><circle cx="9.5" cy="19.5" r="1.4"/><circle cx="17" cy="19.5" r="1.4"/></svg>'},
  {n:'Kado',k:'kado gift hadiah ulang tahun',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="9" width="16" height="4" rx="1"/><path d="M6 13v7h12v-7M12 9v11M12 9S8 9 7 7a2 2 0 0 1 3.5-1.5M12 9s4 0 5-2a2 2 0 0 0-3.5-1.5"/></svg>'},
  {n:'Label',k:'label tag harga diskon sale',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12V4.5a1 1 0 0 1 1-1H12l8.5 8.5a1.4 1.4 0 0 1 0 2L14 20.5a1.4 1.4 0 0 1-2 0Z"/><circle cx="9" cy="9" r="1.4"/></svg>'},
  {n:'Bel',k:'bel lonceng notifikasi info',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14 6 10"/><path d="M10 19a2.2 2.2 0 0 0 4 0"/></svg>'},
  {n:'Kamera',k:'kamera foto potret jepret',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><circle cx="12" cy="13.5" r="3.4"/><path d="M8.5 7.5 10 5h4l1.5 2.5"/></svg>'},
  {n:'Mahkota',k:'mahkota crown raja premium mewah',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5 7.5 11 12 5.5 16.5 11 20 8.5 19 17.5H5Z"/><path d="M5 20.5h14"/></svg>'},
  {n:'Centang',k:'centang check benar setuju oke',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M8.5 12.2l2.4 2.4 4.6-5"/></svg>'},
  {n:'Kopi',k:'kopi coffee kafe minuman hangat',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9.5h11V16a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 16Z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8.5 6c0-1 .8-1 .8-2M12.5 6c0-1 .8-1 .8-2"/></svg>'},
  {n:'Daun',k:'daun leaf hijau segar organik veg Salad',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 19.5C4.5 10 11 4.5 19.5 4.5c0 8.5-6 15-15 15Z"/><path d="M4.5 19.5c3.5-6.5 7.5-9.5 11.5-11.5"/></svg>'},
  {n:'Peti Kata',k:'peti kata quote kutipan kalimat indian pesan',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 6.5C6.4 7.8 4.5 10 4.5 13.2V18h5.4v-5.6H7.3c.2-1.4 1-2.5 2.2-3.2Z"/><path d="M19.5 6.5c-3.1 1.3-5 3.5-5 6.7V18h5.4v-5.6h-2.6c.2-1.4 1-2.5 2.2-3.2Z"/></svg>'},
  {n:'Sasaran',k:'sasaran target fokus tepat belajar',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.2"/><circle cx="12" cy="12" r="1"/></svg>'},
  {n:'Piring',k:'piring makan food resto menu maskul',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.5 3v6.5a2 2 0 0 0 4 0V3M9.5 9.5V21"/><path d="M16.5 3c-1.6 1.2-2.5 3-2.5 5.3 0 1.9 1 3.2 2.5 3.4V21"/></svg>'},
  {n:'Koper',k:'koper briefcase kerja lowongan kantor',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7.5" width="18" height="12" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18"/></svg>'},
  {n:'Layar',k:'layar monitor komputer webinar zoom',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="4.5" width="19" height="12" rx="2.5"/><path d="M9 20h6M12 16.5V20"/></svg>'},
  {n:'Pena',k:'pena tulis gambar coret brush',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19 6 15 16.5 4.5a2 2 0 0 1 2.8 2.8L9 17.8 5 19Z"/><path d="M14.5 6.5 17.5 9.5"/></svg>'},
  {n:'Kotak',k:'kotak persegi box bentuk shape',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2.5"/></svg>'},
  {n:'Tombol',k:'tombol button cta aksi',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="8" rx="4"/></svg>'},
  {n:'Teks',k:'teks paragraf baris tulisan',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5h16M4 12h16M4 17.5h9"/></svg>'},
  {n:'Garis',k:'garis subjudul baris pendek',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8.5h12M4 15.5h8"/></svg>'},
  {n:'Huruf',k:'huruf judul letter typography',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4 4 20M12 4l8 16M7.6 14h8.8"/></svg>'},
  {n:'Lingkaran',k:'lingkaran bulat circle bulat',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/></svg>'},
  {n:'Motif',k:'motif pola tekstur garis hatch',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15 15 4M9 20 20 9M4 20h16"/></svg>'},
  {n:'Hak Cipta',k:'hak cipta copyright watermark tanda',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M15.4 9.6a3.9 3.9 0 1 0 0 4.8"/></svg>'},
  {n:'Mata',k:'mata lihat tampil show mata',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle cx="12" cy="12" r="3"/></svg>'},
  {n:'Buka',k:'buka unlock lepas kunci gembok',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 7.5-2"/></svg>'},
  {n:'Gembok',k:'gembok lock kunci terkunci',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/></svg>'},
  {n:'Mata Tutup',k:'mata tutup sembunyi hide',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5c3 3 6 4.5 9 4.5s6-1.5 9-4.5"/><path d="M4.5 15c2.3 2 4.7 3 7.5 3s5.2-1 7.5-3"/></svg>'},
  {n:'Kanvas',k:'kanvas template poster halaman desain',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><path d="M7 9.5h10M7 13.5h6"/></svg>'},
  {n:'Galeri',k:'galeri grid koleksi template',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/></svg>'},
  {n:'Latar',k:'latar background dasar warna',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M12 3.5v17"/></svg>'},
  {n:'Ukuran',k:'ukuran resize skala dimensi',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5"/></svg>'},
  {n:'Lapis',k:'lapis layer urutan tumpukan',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5 21 8l-9 4.5L3 8Z"/><path d="M3 12.5 12 17l9-4.5M3 16.5 12 21l9-4.5"/></svg>'},
  {n:'Unggah',k:'unggah upload foto gambar naik',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M8 7.5 12 3.5l4 4M4.5 15v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V15"/></svg>'},
  {n:'Simpan',k:'simpan unduh download ekspor kirim',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11M8 10.5l4 4 4-4M4.5 19.5h15"/></svg>'},
  {n:'Cari',k:'cari search telusuri magnifier',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.5-4.5"/></svg>'},
  {n:'Slider',k:'slider penyesuaian setelan atur',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h9M18 8h2M4 16h3M12 16h8"/><circle cx="15.5" cy="8" r="2.2"/><circle cx="9.5" cy="16" r="2.2"/></svg>'},
  {n:'Tetes',k:'tetes warna cat pewarnaan',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5s6 6.3 6 10.1a6 6 0 0 1-12 0c0-3.8 6-10.1 6-10.1Z"/></svg>'},
  {n:'Henti',k:'henti mati tanpa kosong mati',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.5"/><path d="M6.5 17.5 17.5 6.5"/></svg>'},
  {n:'Spidol',k:'spidol marker tebal highlighter',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 19.5h5M7.5 17 16 8.5l3 3L10.5 20H7.5Z"/><path d="M14.5 6.5 17.5 9.5"/></svg>'},
  {n:'Penghapus',k:'penghapus eraser hapus',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 20.5 3.8 15.8a2 2 0 0 1 0-2.8l8-8a2 2 0 0 1 2.8 0l5.7 5.7a2 2 0 0 1 0 2.8L13.5 20.5Z"/><path d="M9 20.5h11"/></svg>'},
  {n:'Hapus',k:'hapus trash buang remove sampah',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 6.5h15M9.5 6.5V5A1.5 1.5 0 0 1 11 3.5h2A1.5 1.5 0 0 1 14.5 5v1.5M6.5 6.5 7.5 20h9l1-13.5M10 10v6M14 10v6"/></svg>'},
  {n:'Salin',k:'salin copy duplikat salin teks',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="8.5" y="3.5" width="12" height="12" rx="2"/><path d="M15.5 18.5v.5a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h.5"/></svg>'},
  {n:'Baru',k:'baru tambah plus tambah baru',s:'<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>'}
];
function markOf(name){ const o=SVGS.find(x=>x.n===name); return o?o.s:''; }
function markSvg(name,size,color){
  const s=markOf(name); if(!s) return '';
  const out=color?s.replace(/#fff/g,color):s;
  return out.replace('<svg','<svg width="'+size+'" height="'+size+'"');
}
function buildSvgGrid(filter){
  const g=$('svgGroup'); if(!g) return;
  g.innerHTML='';
  const q=(filter||'').toLowerCase().trim();
  SVGS.forEach((o,idx)=>{
    if(q&&!(o.k.includes(q)||o.n.toLowerCase().includes(q))) return;
    const on=S.iconSvg===o.s;
    const b=document.createElement('button');
    b.className='opt-btn border-2 rounded-xl p-1.5 grid place-items-center hover:scale-110 hover:shadow-card '+(on?'border-[#B97F1F] dark:border-[#E9B44C] bg-[#EFE3C2] dark:bg-[#2A3358]':'border-slate-200');
    b.title=o.n; b.dataset.svgidx=idx;
    b.innerHTML='<span class="block w-6 h-6 rounded-lg p-1" style="background:#141A33">'+o.s.replace('<svg','<svg width="100%" height="100%"')+'</span>';
    b.onclick=()=>{ S.iconSvg=o.s; if(S.iconSize===0){S.iconSize=64;$('inIconSize').value=64;} syncIconUI(); render(); };
    g.appendChild(b);
  });
  if(!g.children.length) g.innerHTML='<p class="col-span-6 text-[11px] text-slate-400 text-center py-2">Tidak ketemu, coba kata lain.</p>';
}
function syncIconUI(){
  const q=$('iconSearch')?$('iconSearch').value:'';
  buildIconGrid(q); buildSvgGrid(q);
}
buildIconGrid(''); buildSvgGrid('');
DEFAULTS.iconSvg=markOf('Label');
if(!S.iconSvg) S.iconSvg=DEFAULTS.iconSvg;
function markActive(container, btn){
  container.querySelectorAll('.opt-btn').forEach(x=>{x.classList.remove('active','!border-[#E9B44C]','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  btn.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');btn.classList.remove('border-slate-200');
}
function segActive(container, btn){
  container.querySelectorAll('.opt-btn').forEach(x=>x.classList.remove('active','bg-white','shadow','font-bold'));
  btn.classList.add('active','bg-white','shadow','font-bold');
}

/* ================= RENDER (REALTIME) ================= */
function render(){
  scheduleAuto();
  const f=FONTS[S.font], sz=SIZES[S.size];
  const isCustom = S.mode==='custom';
  const hasUpload = !!uploadDataURL;
  const bgAsImage = S.bgType==='image' && hasUpload && S.useAs==='background';
  const photoAsContent = hasUpload && S.useAs==='konten';
  // background
  if(bgAsImage){
    poster.style.background='#0f172a';
    posterBgImg.src=uploadDataURL; posterBgImg.style.display='block';
    posterOverlay.style.display='block';
    posterOverlay.style.background=`rgba(0,0,0,${S.overlay/100})`;
  } else {
    posterBgImg.style.display='none'; posterOverlay.style.display='none';
    poster.style.background = S.bgType==='solid' ? S.c1 : `linear-gradient(${S.angle}deg, ${S.c1}, ${S.c2})`;
  }
  poster.style.aspectRatio=sz.ratio;
  poster.style.maxWidth=Math.round(sz.maxW*zoom)+'px';
  poster.style.borderRadius=(isCustom?S.radius:26)+'px';
  $('sizeLabel').textContent=sz.label;
  posterPattern.className='absolute inset-0 '+(S.pattern==='dots'?'poster-pattern-dots':S.pattern==='grid'?'poster-pattern-grid':'');
  decorLayer.style.display=S.showDecor?'block':'none';
  // teks + visibilitas elemen
  const showB=S.showBadge, showI=S.showIcon, showF=S.showFooter, showM=S.showMark;
  pvBadge.textContent=S.badge||'';
  pvBadge.style.display=(showB && S.badge.trim())?'inline-block':'none';
  pvTitle.textContent=S.title||'Judul Poster Kamu';
  pvTitle.style.fontFamily=f.title;
  pvTitle.style.fontSize=(isCustom&&S.layout==='foto'?Math.round(S.titleSize*0.85):S.titleSize)+'px';
  pvTitle.style.color=S.titleColor;
  pvTitle.style.fontStyle=(S.font==='elegant'||TXT.italic)?'italic':'normal';
  pvTitle.style.fontWeight=TXT.bold?'800':'400';
  pvTitle.style.textDecoration=TXT.underline?'underline':'none';
  pvTitle.style.letterSpacing=(TXT.ls||0)/100+'em';
  pvTitle.style.lineHeight=String(TXT.lh||1.12);
  pvTitle.style.display=S.showTitle?'block':'none';
  pvTitle.style.textShadow=S.shSize>0?('0 '+Math.round(S.shSize*.4)+'px '+S.shSize+'px '+S.shColor+'73'):'none';
  pvTitle.style.webkitTextStroke=S.stSize>0?((S.stSize*.4).toFixed(1)+'px '+S.stColor):'';
  pvSubtitle.textContent=S.subtitle||'';
  pvSubtitle.style.display=(S.showSubtitle&&S.subtitle.trim())?'block':'none';
  pvSubtitle.style.fontFamily=f.sub;
  pvSubtitle.style.fontStyle=(S.font==='elegant')?'italic':'normal';
  pvFooter.textContent=S.footer||'';
  pvFooterWrap.style.display=(showF && S.footer.trim())?'block':'none';
  pvMark.style.display=showM?'block':'none';
  // align + layout (custom)
  const alignCls = S.align==='left'?'flex-start':S.align==='right'?'flex-end':'center';
  posterInner.style.alignItems=alignCls;
  posterInner.style.textAlign=S.align;
  posterInner.style.justifyContent = !isCustom ? (S.vpos==='top'?'flex-start':S.vpos==='bottom'?'flex-end':'center') : S.layout==='atas' ? 'flex-start' : S.layout==='bawah' ? 'flex-end' : 'center';
  posterInner.style.padding=(isCustom?S.padding:32)+'px';
  pvFooter.style.textAlign='center';
  // ikon ATAU foto konten
  if(!showI || (S.iconSize<=0 && !photoAsContent)){ pvIconWrap.style.display='none'; }
  else if(photoAsContent){
    pvIconWrap.style.display='grid';
    pvIcon.style.display='none'; pvPhoto.style.display='block';
    pvPhoto.src=uploadDataURL;
    const boost=(isCustom&&S.layout==='foto')?1.6:1;
    const box=Math.round(S.photoSize*boost);
    pvIconWrap.style.width=box+'px'; pvIconWrap.style.height=box+'px';
    pvIconWrap.style.fontSize='0px'; pvIconWrap.style.padding='0';
    pvIconWrap.style.borderRadius = S.photoShape==='circle'?'50%':S.photoShape==='square'?'14px':'22px';
  }
  else if(S.iconSvg){
    pvIconWrap.style.display='grid';
    pvIcon.style.display='none'; pvPhoto.style.display='none'; pvSvg.style.display='grid';
    pvSvg.innerHTML=S.iconSvg;
    const box=Math.round(S.iconSize*1.5);
    pvIconWrap.style.width=box+'px'; pvIconWrap.style.height=box+'px';
    pvIconWrap.style.fontSize=S.iconSize+'px';
    pvIconWrap.style.borderRadius='0px';
    const inner=Math.max(20,Math.round(box*.86));
    pvSvg.style.width=inner+'px'; pvSvg.style.height=inner+'px';
    const sg=pvSvg.querySelector('svg'); if(sg){ sg.setAttribute('width',inner); sg.setAttribute('height',inner); sg.style.display='block'; }
  }
  else{
    pvIconWrap.style.display='grid';
    pvIcon.style.display='block'; pvPhoto.style.display='none'; pvSvg.style.display='none';
    pvIcon.textContent=S.icon;
    const box=Math.round(S.iconSize*1.5);
    pvIconWrap.style.width=box+'px'; pvIconWrap.style.height=box+'px';
    pvIconWrap.style.fontSize=S.iconSize+'px';
    pvIconWrap.style.borderRadius='0px';
  }
  $('titleSizeVal').textContent=S.titleSize+'px';
  $('angleVal').textContent=S.angle+'°';
  $('iconSizeVal').textContent=S.iconSize+'px';
  const ps=$('photoSizeVal'); if(ps) ps.textContent=S.photoSize+'px';
  const ov=$('overlayVal'); if(ov) ov.textContent=S.overlay+'%';
  const pd=$('paddingVal'); if(pd) pd.textContent=S.padding+'px';
  const rd=$('radiusVal'); if(rd) rd.textContent=S.radius+'px';
  renderDraw();
  renderPositions();
  renderExtras();
  renderShapes();
  if(typeof renderSelBox==='function') renderSelBox();
  if(typeof renderQr==='function') renderQr();
  renderLayers();
  syncLayersUI();
  const pgt=$('pgt'+curPage); if(pgt) pgt.textContent=(S.title||'Tanpa judul').slice(0,14);
}

/* ================= INPUT BINDINGS ================= */
$('inBadge').addEventListener('input',e=>{S.badge=e.target.value;render();});
$('inTitle').addEventListener('input',e=>{S.title=e.target.value;render();});
$('inSubtitle').addEventListener('input',e=>{S.subtitle=e.target.value;render();});
$('inFooter').addEventListener('input',e=>{S.footer=e.target.value;render();});
$('inTitleSize').addEventListener('input',e=>{S.titleSize=+e.target.value;render();});
$('inShSize').addEventListener('input',e=>{S.shSize=+e.target.value;$('shSizeVal').textContent=e.target.value;render();});
$('inShColor').addEventListener('input',e=>{S.shColor=e.target.value;render();});
$('inStSize').addEventListener('input',e=>{S.stSize=+e.target.value;$('stSizeVal').textContent=e.target.value;render();});
$('inStColor').addEventListener('input',e=>{S.stColor=e.target.value;render();});
$('inTitleColor').addEventListener('input',e=>{S.titleColor=e.target.value;render();});
document.querySelectorAll('.tcolor').forEach(b=>b.onclick=()=>{S.titleColor=b.dataset.tcolor;$('inTitleColor').value=b.dataset.tcolor;render();});
$('inC1').addEventListener('input',e=>{S.c1=e.target.value;render();});
$('inC2').addEventListener('input',e=>{S.c2=e.target.value;render();});
$('inAngle').addEventListener('input',e=>{S.angle=+e.target.value;render();});
$('inIconSize').addEventListener('input',e=>{S.iconSize=+e.target.value;render();});
$('fontGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.font=b.dataset.font;
  $('fontGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');b.classList.remove('border-slate-200');
  render();
});
$('alignGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{S.align=b.dataset.align;segActive($('alignGroup'),b);render();});
$('patternGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.pattern=b.dataset.pattern;
  $('patternGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');b.classList.remove('border-slate-200');
  render();
});
/* Ukuran: media sosial (portrait/square/story) dan cetak (A4/A3/A5) */
const OFF_SZ='border-[#B97F1F] dark:border-[#E9B44C]';
const ON_SZ='bg-[#EFE3C2] dark:bg-[#2A3358]';
function syncSizeButtons(){
  [['#sizeGroup','size'],['#printSizeGroup','psize']].forEach(([sel,attr])=>{
    const g=$(sel); if(!g) return;
    g.querySelectorAll('button').forEach(x=>{
      const on=x.dataset[attr]===S.size;
      x.classList.toggle('active',on);
      x.classList.toggle(OFF_SZ,on);
      x.classList.toggle(ON_SZ,on);
      x.classList.toggle('border-slate-200',!on);
    });
  });
  const isPrint=!!(SIZES[S.size]&&SIZES[S.size].print);
  const q=$('inQuality'); if(q){ q.disabled=isPrint; }
}
function setSize(size){
  if(!SIZES[size]) return;
  pushHistory();
  S.size=size;
  syncSizeButtons();
  render();
}
$('sizeGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>setSize(b.dataset.size));
$('printSizeGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>setSize(b.dataset.psize));

/* ============ MODE, BGTYPE, LAYOUT, UPLOAD ============ */
$('modeGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.mode=b.dataset.mode;
  $('modeGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');b.classList.remove('border-slate-200');
  $('customPanel').classList.toggle('hidden', S.mode!=='custom');
  if(S.mode==='template'){ S.showBadge=S.showIcon=S.showFooter=S.showDecor=S.showMark=true; S.layout='tengah'; syncToggles(); }
  else if(!silentUI) toast('Mode Custom aktif. Atur layout, background foto & elemen sesukamu!');
  render();
});
function syncToggles(){ $('tglBadge').checked=S.showBadge; $('tglIcon').checked=S.showIcon; $('tglFooter').checked=S.showFooter; $('tglDecor').checked=S.showDecor; $('tglMark').checked=S.showMark; }
[['tglBadge','showBadge'],['tglIcon','showIcon'],['tglFooter','showFooter'],['tglDecor','showDecor'],['tglMark','showMark']].forEach(([id,key])=>{
  $(id).addEventListener('change',e=>{S[key]=e.target.checked;render();});
});
$('layoutGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.layout=b.dataset.layout;
  $('layoutGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-white');x.classList.add('border-slate-200');});
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-white');b.classList.remove('border-slate-200');
  render();
});
$('bgTypeGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.bgType=b.dataset.bgtype;
  $('bgTypeGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');b.classList.remove('border-slate-200');
  $('presetWrap').classList.toggle('hidden', S.bgType==='image');
  $('bgUploadWrap').classList.toggle('hidden', S.bgType!=='image');
  if(S.bgType==='image' && S.useAs!=='background'){ setUseAs('background'); }
  render();
});
$('useAsGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{ setUseAs(b.dataset.useas); render(); });
function setUseAs(v){
  S.useAs=v;
  $('useAsGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  const btn=$('useAsGroup').querySelector(`[data-useas="${v}"]`);
  if(btn){btn.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');btn.classList.remove('border-slate-200');}
  $('photoOpts').style.opacity = v==='konten' ? '1' : '.45';
  if(v==='background' && S.bgType!=='image'){
    // otomatis pindah ke tab background agar langsung terlihat
    $('bgTypeGroup').querySelector('[data-bgtype="image"]').click();
  }
}
$('photoShapeGroup').querySelectorAll('button').forEach(b=>b.onclick=()=>{
  S.photoShape=b.dataset.shape;
  $('photoShapeGroup').querySelectorAll('button').forEach(x=>{x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');x.classList.add('border-slate-200');});
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]');b.classList.remove('border-slate-200');
  render();
});
$('inPhotoSize').addEventListener('input',e=>{S.photoSize=+e.target.value;render();});
$('inOverlay').addEventListener('input',e=>{S.overlay=+e.target.value;render();});
$('inPadding').addEventListener('input',e=>{S.padding=+e.target.value;render();});
$('inRadius').addEventListener('input',e=>{S.radius=+e.target.value;render();});
$('btnBlank').onclick=()=>{
  S.badge='';S.title='Tulis Judulmu Di Sini';S.subtitle='';S.footer='';S.iconSize=0;S.pattern='none';
  $('inBadge').value='';$('inTitle').value=S.title;$('inSubtitle').value='';$('inFooter').value='';$('inIconSize').value=0;
  toast('🧹 Kanvas kosong siap, isi sesukamu!');
  render();
};

/* ---- Upload gambar (klik + drag & drop, maks 5MB) ---- */
function handleUpload(file){
  if(!file) return;
  if(!file.type.startsWith('image/')){ toast('File harus berupa gambar.'); return; }
  if(file.size>5*1024*1024){ toast('Maksimal 5MB ya.'); return; }
  const rd=new FileReader();
  rd.onload=()=>{
    uploadDataURL=rd.result;
    uploadImgEl=new Image();
    uploadImgEl.src=uploadDataURL;
    uploadName=file.name||'gambar.png';
    showUploadFilled(uploadName);
    toast(S.useAs==='background' ? '🌄 Foto dipasang sebagai background!' : '🧩 Foto dipasang sebagai konten!');
    render();
  };
  rd.readAsDataURL(file);
}
function clearUpload(){
  uploadDataURL=null; uploadImgEl=null;
  for(const [e,f] of [['dropPhotoEmpty','dropPhotoFilled'],['dropBgEmpty','dropBgFilled']]){
    $(e).classList.remove('hidden'); const fl=$(f); fl.classList.add('hidden'); fl.classList.remove('flex');
  }
  $('dropPhoto').classList.remove('has-img'); $('dropBg').classList.remove('has-img');
  $('filePhoto').value=''; $('fileBg').value='';
  toast('🗑️ Foto dihapus.');
  render();
}
for(const [drop,input] of [['dropPhoto','filePhoto'],['dropBg','fileBg']]){
  $(drop).addEventListener('click',e=>{ if(e.target.closest('button'))return; $(input).click(); });
  $(input).addEventListener('change',e=>handleUpload(e.target.files[0]));
  ['dragover','dragenter'].forEach(ev=>$(drop).addEventListener(ev,e=>{e.preventDefault();$(drop).classList.add('drag');}));
  ['dragleave','drop'].forEach(ev=>$(drop).addEventListener(ev,e=>{e.preventDefault();$(drop).classList.remove('drag');}));
  $(drop).addEventListener('drop',e=>{ const f=e.dataTransfer.files&&e.dataTransfer.files[0]; handleUpload(f); });
}
$('btnRemovePhoto').onclick=e=>{e.stopPropagation();clearUpload();};
$('btnRemoveBg').onclick=e=>{e.stopPropagation();clearUpload();};

/* --- fungsi khusus landing --- */
function applyTemplate(i){
  const t=TEMPLATES[i]; if(!t) return;
  pushHistory();
  S.badge=t.badge; S.title=t.title; S.subtitle=t.subtitle; S.footer=t.footer;
  S.font=t.font; S.titleSize=t.titleSize; S.titleColor=t.titleColor; S.align=t.align;
  S.c1=t.c1; S.c2=t.c2; S.angle=t.angle; S.pattern=t.pattern; S.icon=''; S.iconSize=t.iconSize;
  S.shSize=0; S.stSize=0; S.iconSvg=markOf(t.mark);
  S.bgType='gradient'; S.useAs='konten';
  const el=t.elems||{};
  S.vpos=t.vpos||'center';
  S.showBadge=el.badge!==false; S.showIcon=el.icon!==false; S.showFooter=el.footer!==false;
  S.showDecor=true; S.showMark=true; syncToggles();
  POS=zeroPos(); STICKER=null;
  SHAPES=[]; selectedShapeId=null; ZORDER=[...ZBASE]; shapesVisible=true; builtShapeIds='__reset__';
  $('inBadge').value=S.badge; $('inTitle').value=S.title; $('inSubtitle').value=S.subtitle; $('inFooter').value=S.footer;
  $('inTitleSize').value=S.titleSize; $('inTitleColor').value=S.titleColor;
  $('inC1').value=S.c1; $('inC2').value=S.c2; $('inAngle').value=S.angle; $('inIconSize').value=S.iconSize;
  $('inShSize').value=0; $('shSizeVal').textContent='0'; $('inStSize').value=0; $('stSizeVal').textContent='0';
  clickOpt('#fontGroup','font',S.font); clickOpt('#alignGroup','align',S.align);
  clickOpt('#patternGroup','pattern',S.pattern); clickOpt('#sizeGroup','size',t.size);
  clickOpt('#bgTypeGroup','bgtype','gradient'); clickOpt('#useAsGroup','useas','konten');
  syncStickerUI(); syncIconUI();
  toast('🎁 Template “'+t.name+'” dipakai!');
  render();
}

function loadMyTpl(){
  try{ const raw=localStorage.getItem(MY_KEY); MY_TPL=raw?JSON.parse(raw):[]; if(!Array.isArray(MY_TPL)) MY_TPL=[]; }catch(e){ MY_TPL=[]; }
  try{ const raw=localStorage.getItem(FAV_KEY); FAVS=raw?JSON.parse(raw):[]; if(!Array.isArray(FAVS)) FAVS=[]; }catch(e){ FAVS=[]; }
}

function saveMyTpl(){
  try{ localStorage.setItem(MY_KEY,JSON.stringify(MY_TPL.slice(0,40))); }
  catch(e){ toast('Penyimpanan browser penuh, template tidak bisa disimpan.'); }
}

function saveFavs(){
  try{ localStorage.setItem(FAV_KEY,JSON.stringify(FAVS)); }catch(e){}
}

function isFav(name){ return FAVS.indexOf(name)>=0; }
function toggleFav(name){
  const i=FAVS.indexOf(name);
  if(i>=0) FAVS.splice(i,1); else FAVS.push(name);
  saveFavs();
  renderLandingGallery();
}

function applyMyTpl(id){
  const my=MY_TPL.find(m=>m.id===id); if(!my) return;
  const p=my.snap;
  S={ ...DEFAULTS, ...p.S }; POS=JSON.parse(JSON.stringify(p.POS));
  STICKER=p.STICKER?{...p.STICKER}:null;
  strokes=JSON.parse(JSON.stringify(p.strokes||[]));
  EXTRAS=JSON.parse(JSON.stringify(p.EXTRAS||[]));
  SHAPES=JSON.parse(JSON.stringify(p.SHAPES||[]));
  ZORDER=Array.isArray(p.ZORDER)&&p.ZORDER.length?p.ZORDER.slice():[...ZBASE];
  LAYER_LOCK={ ...(p.locked||{}) };
  TXT={ ...TXT_DEF, ...(p.TXT||{}) };
  QR={ ...QR_DEF, ...(p.QR||{}) };
  PHOTO={ ...PHOTO_DEF, ...(p.PHOTO||{}) };
  builtExtraIds='__reset__'; builtShapeIds='__reset__';
  syncUIFromState(); syncStickerUI(); syncIconUI(); syncTxtUI();
  document.getElementById('studio').scrollIntoView({behavior:'smooth'});
  toast('Template "'+my.name+'" dipakai.');
}

function myTplCard(my){
  const f=FONTS[my.snap.S.font]||FONTS.modern;
  const b=document.createElement('div');
  b.className='break-inside-avoid mb-5 group cursor-pointer';
  b.innerHTML=
    '<div class="relative rounded-2xl overflow-hidden" style="aspect-ratio:'+(TPL_RATIO[my.size]||'3/4')+';background:linear-gradient(150deg,'+my.c1+','+my.c2+')">'
    +'<div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 gap-2">'
    +'<span class="leading-tight" style="font-family:'+f.title+';font-weight:'+f.weight+';color:'+(my.snap.S.titleColor||'#F3EDDC')+';font-size:15px">'+my.title+'</span>'
    +'<span style="color:rgba(243,237,220,.75);font-size:9px">Template saya</span>'
    +'</div></div>'
    +'<div class="mt-2 flex items-center gap-2">'
    +'<p class="text-sm font-extrabold dark:text-white truncate flex-1">'+my.name+'</p>'
    +'<button data-mydel="'+my.id+'" class="text-[11px] font-bold text-red-500 hover:scale-110" title="Hapus template" aria-label="Hapus template">&times;</button>'
    +'</div>';
  b.onclick=e=>{
    if(e.target.closest('[data-mydel]')){
      MY_TPL=MY_TPL.filter(m=>m.id!==my.id); saveMyTpl(); renderLandingGallery();
      toast('Template dihapus.'); return;
    }
    applyMyTpl(my.id);
  };
  return b;
}

function tplCard(t,i){
  const f=FONTS[t.font]||FONTS.modern;
  const b=document.createElement('div');
  b.className='break-inside-avoid mb-5 group cursor-pointer';
  b.dataset.reveal=''; b.dataset.delay=(i%4*70);
  const vj=t.vpos==='top'?'flex-start':t.vpos==='bottom'?'flex-end':'center';
  const ai=t.align==='left'?'items-start':t.align==='right'?'items-end':'items-center';
  const ta=t.align==='left'?'text-left':t.align==='right'?'text-right':'text-center';
  b.innerHTML=
    '<div class="relative rounded-2xl overflow-hidden shadow-card group-hover:shadow-2xl group-hover:-translate-y-1 transition-all" style="aspect-ratio:'+TPL_RATIO[t.size]+';background:linear-gradient(150deg,'+t.c1+','+t.c2+')">'
    +'<div class="absolute inset-0 flex flex-col '+ai+' '+vj+' '+ta+' p-4 gap-2">'
    +(t.badge?'<span class="px-2 py-1 rounded-[3px] uppercase" style="background:#F3EDDC;color:#141A33;font-size:8px;font-weight:800;letter-spacing:.08em">'+t.badge+'</span>':'')
    +((t.elems&&t.elems.icon===false)?'':'<span class="grid place-items-center">'+markSvg(t.mark,26)+'</span>')
    +'<span class="leading-tight" style="font-family:'+f.title+';font-weight:'+f.weight+';color:'+t.titleColor+';font-size:15px">'+t.title+'</span>'
    +'<span style="color:rgba(243,237,220,.75);font-size:9px;line-height:1.35">'+t.subtitle+'</span>'
    +((t.elems&&t.elems.footer===false||!t.footer)?'':'<span class="mt-1 px-2 py-1 rounded-[3px]" style="background:#F3EDDC;color:#141A33;font-size:8px;font-weight:800;letter-spacing:.06em">'+t.footer+'</span>')
    +'</div>'
    +'<div class="absolute inset-0 opacity-0 group-hover:opacity-100 transition grid place-items-center" style="background:rgba(15,23,42,.45);z-index:2">'
    +'<button type="button" data-tpluse="'+i+'" class="lp-use cursor-pointer" style="pointer-events:auto">Gunakan template</button></div>'
    +'</div>'
    +'<div class="mt-2 flex items-center gap-2">'
    +'<p class="text-sm font-extrabold dark:text-white truncate flex-1">'+t.name+'</p>'
    +'<button data-fav="'+t.name+'" class="text-[13px] leading-none '+(isFav(t.name)?'text-[#E9B44C]':'text-slate-300 dark:text-slate-600')+'" title="'+(isFav(t.name)?'Hapus dari favorit':'Tandai favorit')+'" aria-label="Tandai favorit">\u2605</button>'
    +'</div>'
    +'<p class="text-[11px] text-slate-500 dark:text-[#A39D86]">'+TPL_SIZELBL[t.size]+' • Poster</p>';
  b.onclick=()=>{ applyTemplate(i); document.getElementById('studio').scrollIntoView({ behavior:'smooth' }); };
  return b;
}

function renderLandingGallery(){
  const g=$('landingGallery'); if(!g) return;
  g.innerHTML='';
  TEMPLATES.forEach((t,i)=>{
    const cat=t.cat||TPL_CAT[i]||'bisnis';
    const hay=(t.name+' '+t.title+' '+t.subtitle+' '+t.badge).toLowerCase();
    if(galCat==='favorit'){ if(!isFav(t.name)) return; }
    else if(galCat==='milikku'){ return; }
    else if(galCat!=='semua'&&cat!==galCat) return;
    if(galQ&&hay.indexOf(galQ)<0) return;
    g.appendChild(tplCard(t,i));
  });
  if(galCat==='milikku'||galCat==='favorit'){
    MY_TPL.forEach(my=>{
      if(galCat==='favorit'&&!isFav('my:'+my.id)) return;
      const hay=(my.name+' '+my.title).toLowerCase();
      if(galQ&&hay.indexOf(galQ)<0) return;
      g.appendChild(myTplCard(my));
    });
  }
  const n=g.children.length;
  $('galEmpty').style.display=n?'none':'block';
  $('galCount').textContent=n+' template';
  observeReveals(g);
}

function renderHeroPosters(){
  const box=$('heroPosters'); if(!box) return;
  const picks=[0,1,2];
  let html='<a href="#galeri" class="lp-more">Lihat 12 template</a>';
  picks.forEach(i=>{
    const t=TEMPLATES[i]; if(!t) return;
    const f=FONTS[t.font]||FONTS.modern;
    html+='<button type="button" class="lp-poster" data-open-tpl="'+i+'" style="background:linear-gradient(150deg,'+t.c1+','+t.c2+');aspect-ratio:'+(TPL_RATIO[t.size]||'3/4')+'">'
      +'<span class="lp-poster-inner">'
      +(t.badge?'<span class="lp-poster-badge">'+t.badge+'</span>':'')
      +'<span class="lp-poster-title" style="font-family:'+f.title+';font-weight:'+f.weight+'">'+t.title+'</span>'
      +'</span></button>';
  });
  box.innerHTML=html;
}
