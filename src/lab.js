/* Posteria - bagian Lab Kreatif: sketsa foto, stop motion, drawing,
   vektor, animasi, potong video, dan playground kode. */
/* ============ STUDIO SKETSA: foto kertas → karya seni (Canvas API murni) ============ */
let skImg=null, skName='sketsa', skTimer=null;
const SK_SPECIAL={
  sketch:{ label:'Kehalusan garis', min:1, max:12, val:4 },
  ink:{ label:'Ketebalan garis', min:1, max:8, val:3 },
  logo:{ label:'Ambang hitam-putih', min:20, max:235, val:128 },
  pop:{ label:'Level warna', min:2, max:8, val:4 },
  cartoon:{ label:'Kehalusan', min:1, max:8, val:3 },
  mosaic:{ label:'Ukuran kotak', min:4, max:40, val:12 },
  neon:{ label:'Sensitivitas', min:1, max:8, val:3 },
  vintage:{ label:'Intensitas', min:10, max:100, val:70 },
  duotone:{ label:'Titik tengah', min:40, max:215, val:128 },
  thermal:{ label:'Sensitivitas', min:5, max:20, val:10 },
  colpencil:{ label:'Kehalusan', min:1, max:10, val:3 },
  chalk:{ label:'Ketebalan', min:1, max:8, val:3 },
  orig:{ label:'—', min:0, max:0, val:0 }
};
function skStyle(){
  const b=document.querySelector('#skStyleGroup .art-btn.active');
  return b?b.dataset.art:'sketch';
}
function skOpts(){
  return { style:skStyle(), contrast:+$('skContrast').value, bright:+$('skBright').value, special:+$('skSpecial').value,
    tint:$('skTint').value||'#1a1a1a', duo1:$('skDuo1').value||'#1e1b4b', duo2:$('skDuo2').value||'#5eead4',
    colorize:+$('skColorize').value||0 };
}
function hexRgb(hh){
  let h=String(hh||'#000000').replace('#','');
  if(h.length===3) h=h.split('').map(c=>c+c).join('');
  const n=parseInt(h,16)||0;
  return [n>>16&255,n>>8&255,n&255];
}
function syncSkSpecial(){
  const c=SK_SPECIAL[skStyle()]||SK_SPECIAL.sketch;
  $('skSpecialLbl').textContent=c.label;
  const r=$('skSpecial'); r.min=c.min; r.max=c.max; r.value=c.val;
  $('skSpecialVal').textContent=c.val;
  $('skSpecialWrap').style.opacity=skStyle()==='orig'?'.4':'1';
  $('skColorizeWrap').style.opacity=['sketch','ink','chalk'].includes(skStyle())?'1':'.4';
}
function boxBlur(a,W,H,r){
  const tmp=new Float32Array(a.length);
  for(let y=0;y<H;y++){
    let acc=0; const row=y*W;
    for(let x=-r;x<=r;x++) acc+=a[row+Math.min(W-1,Math.max(0,x))];
    for(let x=0;x<W;x++){ tmp[row+x]=acc/(2*r+1); acc+=a[row+Math.min(W-1,x+r+1)]-a[row+Math.max(0,x-r)]; }
  }
  for(let x=0;x<W;x++){
    let acc=0;
    for(let y=-r;y<=r;y++) acc+=tmp[Math.min(H-1,Math.max(0,y))*W+x];
    for(let y=0;y<H;y++){ a[y*W+x]=acc/(2*r+1); acc+=tmp[Math.min(H-1,y+r+1)*W+x]-tmp[Math.max(0,y-r)*W+x]; }
  }
}
function processArt(img,maxDim,o){
  const mw=img.naturalWidth, mh=img.naturalHeight;
  const sc=Math.min(1,maxDim/Math.max(mw,mh));
  const W=Math.max(1,Math.round(mw*sc)), H=Math.max(1,Math.round(mh*sc));
  const cv=document.createElement('canvas'); cv.width=W; cv.height=H;
  const ctx=cv.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(img,0,0,W,H);
  if(o.style==='orig') return cv;
  if(o.style==='mosaic'){
    // mosaik: kecilkan lalu besarkan tanpa smoothing = kotak-kotak
    const s=Math.max(2,Math.round(o.special));
    const tw=Math.max(1,Math.round(W/s)), th=Math.max(1,Math.round(H/s));
    const sm=document.createElement('canvas'); sm.width=tw; sm.height=th;
    const sctx=sm.getContext('2d');
    try{ sctx.filter='contrast('+(100+o.contrast)+'%) brightness('+(100+o.bright)+'%)'; }catch(err){}
    sctx.drawImage(img,0,0,tw,th);
    ctx.imageSmoothingEnabled=false;
    ctx.drawImage(sm,0,0,tw,th,0,0,W,H);
    ctx.imageSmoothingEnabled=true;
    return cv;
  }
  const src=ctx.getImageData(0,0,W,H), px=src.data;
  const n=W*H, gray=new Float32Array(n);
  const cf=(259*(o.contrast+255))/(255*(259-o.contrast));
  for(let i=0;i<n;i++){
    const lum=.299*px[i*4]+.587*px[i*4+1]+.114*px[i*4+2];
    gray[i]=Math.max(0,Math.min(255,cf*(lum-128)+128+o.bright));
  }
  const out=ctx.createImageData(W,H), op=out.data;
  if(o.style==='sketch'){
    // sketsa pensil: abu → balik → blur → color-dodge
    const inv=new Float32Array(n);
    const tc=hexRgb(o.tint);
    for(let i=0;i<n;i++) inv[i]=255-gray[i];
    boxBlur(inv,W,H,Math.max(1,Math.round(o.special)));
    for(let i=0;i<n;i++){
      const b=inv[i]; let v;
      if(b>=255) v=255;
      else { v=gray[i]*255/(255-b); if(v>255) v=255; }
      v=v*.92+gray[i]*.08;
      const k=1-v/255, ca=o.colorize/100;
      let rr=255-(255-tc[0])*k, gg=255-(255-tc[1])*k, bb=255-(255-tc[2])*k;
      if(ca>0){
        const f=v/Math.max(gray[i],14);
        rr+=(px[i*4]*f-rr)*ca; gg+=(px[i*4+1]*f-gg)*ca; bb+=(px[i*4+2]*f-bb)*ca;
      }
      op[i*4]=rr; op[i*4+1]=gg; op[i*4+2]=bb; op[i*4+3]=255;
    }
  } else if(o.style==='ink'){
    // tinta outline: tepi Sobel → balik
    const gain=o.special, tc=hexRgb(o.tint);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const i=y*W+x;
      const xm=x>0?x-1:0, xp=x<W-1?x+1:W-1, ym=y>0?y-1:0, yp=y<H-1?y+1:H-1;
      const gx=-gray[ym*W+xm]-2*gray[y*W+xm]-gray[yp*W+xm]+gray[ym*W+xp]+2*gray[y*W+xp]+gray[yp*W+xp];
      const gy=-gray[ym*W+xm]-2*gray[ym*W+x]-gray[ym*W+xp]+gray[yp*W+xm]+2*gray[yp*W+x]+gray[yp*W+xp];
      let m=Math.sqrt(gx*gx+gy*gy)*gain/4;
      if(m>255) m=255;
      const k=m/255, ca=o.colorize/100;
      const v=255-m;
      let rr=255-(255-tc[0])*k, gg=255-(255-tc[1])*k, bb=255-(255-tc[2])*k;
      if(ca>0){
        const f=v/Math.max(gray[i],14);
        rr+=(px[i*4]*f-rr)*ca; gg+=(px[i*4+1]*f-gg)*ca; bb+=(px[i*4+2]*f-bb)*ca;
      }
      op[i*4]=rr; op[i*4+1]=gg; op[i*4+2]=bb; op[i*4+3]=255;
    }
  } else if(o.style==='logo'){
    // logo BW: ambang batas tegas
    const th=o.special, tc=hexRgb(o.tint);
    for(let i=0;i<n;i++){ const on=gray[i]>th;
      op[i*4]=on?255:tc[0]; op[i*4+1]=on?255:tc[1]; op[i*4+2]=on?255:tc[2]; op[i*4+3]=255; }
  } else if(o.style==='pop'){
    // pop poster: saturasi + posterize
    const L=Math.max(2,Math.round(o.special)), q=L-1, st=1.5;
    for(let i=0;i<n;i++){
      const r0=px[i*4], g0=px[i*4+1], b0=px[i*4+2];
      const l=.299*r0+.587*g0+.114*b0;
      const r=Math.max(0,Math.min(255,cf*(l+(r0-l)*st-128)+128+o.bright));
      const g=Math.max(0,Math.min(255,cf*(l+(g0-l)*st-128)+128+o.bright));
      const b=Math.max(0,Math.min(255,cf*(l+(b0-l)*st-128)+128+o.bright));
      op[i*4]=Math.round(Math.round(r/255*q)/q*255);
      op[i*4+1]=Math.round(Math.round(g/255*q)/q*255);
      op[i*4+2]=Math.round(Math.round(b/255*q)/q*255);
      op[i*4+3]=255;
    }
  } else if(o.style==='cartoon'){
    // kartun: warna dihaluskan + posterize + garis tepi gelap
    const rA=new Float32Array(n), gA=new Float32Array(n), bA=new Float32Array(n);
    for(let i=0;i<n;i++){ rA[i]=px[i*4]; gA[i]=px[i*4+1]; bA[i]=px[i*4+2]; }
    const br2=Math.max(1,Math.round(o.special));
    boxBlur(rA,W,H,br2); boxBlur(gA,W,H,br2); boxBlur(bA,W,H,br2);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const i=y*W+x;
      const xm=x>0?x-1:0, xp=x<W-1?x+1:W-1, ym=y>0?y-1:0, yp=y<H-1?y+1:H-1;
      const gx=-gray[ym*W+xm]-2*gray[y*W+xm]-gray[yp*W+xm]+gray[ym*W+xp]+2*gray[y*W+xp]+gray[yp*W+xp];
      const gy=-gray[ym*W+xm]-2*gray[ym*W+x]-gray[ym*W+xp]+gray[yp*W+xm]+2*gray[yp*W+x]+gray[yp*W+xp];
      const edge=Math.sqrt(gx*gx+gy*gy)>70?.22:1;
      let r=rA[i], g=gA[i], b=bA[i];
      const l=.299*r+.587*g+.114*b, st=1.4, qq=3;
      r=Math.max(0,Math.min(255,cf*(l+(r-l)*st-128)+128+o.bright));
      g=Math.max(0,Math.min(255,cf*(l+(g-l)*st-128)+128+o.bright));
      b=Math.max(0,Math.min(255,cf*(l+(b-l)*st-128)+128+o.bright));
      op[i*4]=Math.round(Math.round(r/255*qq)/qq*255)*edge;
      op[i*4+1]=Math.round(Math.round(g/255*qq)/qq*255)*edge;
      op[i*4+2]=Math.round(Math.round(b/255*qq)/qq*255)*edge;
      op[i*4+3]=255;
    }
  } else if(o.style==='neon'){
    // neon: garis tepi menyala di atas hitam
    const gain=o.special, tc=hexRgb(o.tint);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const i=y*W+x;
      const xm=x>0?x-1:0, xp=x<W-1?x+1:W-1, ym=y>0?y-1:0, yp=y<H-1?y+1:H-1;
      const gx=-gray[ym*W+xm]-2*gray[y*W+xm]-gray[yp*W+xm]+gray[ym*W+xp]+2*gray[y*W+xp]+gray[yp*W+xp];
      const gy=-gray[ym*W+xm]-2*gray[ym*W+x]-gray[ym*W+xp]+gray[yp*W+xm]+2*gray[yp*W+x]+gray[yp*W+xp];
      let m=Math.sqrt(gx*gx+gy*gy)*gain/4;
      if(m>255) m=255;
      const k=m/255, g2=k*k*.7;
      op[i*4]=Math.min(255,tc[0]*k+255*g2); op[i*4+1]=Math.min(255,tc[1]*k+255*g2); op[i*4+2]=Math.min(255,tc[2]*k+255*g2); op[i*4+3]=255;
    }
  } else if(o.style==='vintage'){
    // vintage: sepia + vignette + grain
    const k=o.special/100, cx=W/2, cy=H/2, md=Math.sqrt(cx*cx+cy*cy);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const i=y*W+x;
      const r0=px[i*4], g0=px[i*4+1], b0=px[i*4+2];
      let sr=.393*r0+.769*g0+.189*b0, sg=.349*r0+.686*g0+.168*b0, sb=.272*r0+.534*g0+.131*b0;
      if(sr>255)sr=255; if(sg>255)sg=255; if(sb>255)sb=255;
      const dx=(x-cx)/md, dy=(y-cy)/md, vg=1-.5*k*(dx*dx+dy*dy);
      const gr=(Math.random()-.5)*26*k;
      op[i*4]=Math.max(0,Math.min(255,(r0+(sr-r0)*k)*vg+gr));
      op[i*4+1]=Math.max(0,Math.min(255,(g0+(sg-g0)*k)*vg+gr));
      op[i*4+2]=Math.max(0,Math.min(255,(b0+(sb-b0)*k)*vg+gr));
      op[i*4+3]=255;
    }
  } else if(o.style==='duotone'){
    // duotone: terang-gelap dipetakan ke ungu-teal
    const c1=hexRgb(o.duo1), c2=hexRgb(o.duo2), m=o.special;
    for(let i=0;i<n;i++){
      let t=(gray[i]-(m-90))/180;
      t=Math.max(0,Math.min(1,t));
      op[i*4]=c1[0]+(c2[0]-c1[0])*t;
      op[i*4+1]=c1[1]+(c2[1]-c1[1])*t;
      op[i*4+2]=c1[2]+(c2[2]-c1[2])*t;
      op[i*4+3]=255;
    }
  } else if(o.style==='thermal'){
    // termal: peta warna panas
    const stops=[[0,11,16,32],[.25,91,33,182],[.5,219,39,119],[.75,245,158,11],[1,254,252,232]];
    const gain=o.special/10;
    for(let i=0;i<n;i++){
      let t=gray[i]/255*gain;
      if(t>1) t=1;
      let s=0;
      while(s<stops.length-2&&t>stops[s+1][0]) s++;
      const f=(t-stops[s][0])/((stops[s+1][0]-stops[s][0])||1);
      op[i*4]=stops[s][1]+(stops[s+1][1]-stops[s][1])*f;
      op[i*4+1]=stops[s][2]+(stops[s+1][2]-stops[s][2])*f;
      op[i*4+2]=stops[s][3]+(stops[s+1][3]-stops[s][3])*f;
      op[i*4+3]=255;
    }
  } else if(o.style==='colpencil'){
    // pensil warna: arsiran sketsa tapi warna asli dipertahankan
    const inv=new Float32Array(n);
    for(let i=0;i<n;i++) inv[i]=255-gray[i];
    boxBlur(inv,W,H,Math.max(1,Math.round(o.special)));
    for(let i=0;i<n;i++){
      const b=inv[i]; let v;
      if(b>=255) v=255;
      else { v=gray[i]*255/(255-b); if(v>255) v=255; }
      const f=v/Math.max(gray[i],14);
      op[i*4]=Math.max(0,Math.min(255,px[i*4]*f));
      op[i*4+1]=Math.max(0,Math.min(255,px[i*4+1]*f));
      op[i*4+2]=Math.max(0,Math.min(255,px[i*4+2]*f));
      op[i*4+3]=255;
    }
  } else if(o.style==='chalk'){
    // papan tulis: garis kapur di atas gelap
    const gain=o.special, bg=[20,26,46], tc=hexRgb(o.tint);
    for(let y=0;y<H;y++) for(let x=0;x<W;x++){
      const i=y*W+x;
      const xm=x>0?x-1:0, xp=x<W-1?x+1:W-1, ym=y>0?y-1:0, yp=y<H-1?y+1:H-1;
      const gx=-gray[ym*W+xm]-2*gray[y*W+xm]-gray[yp*W+xm]+gray[ym*W+xp]+2*gray[y*W+xp]+gray[yp*W+xp];
      const gy=-gray[ym*W+xm]-2*gray[ym*W+x]-gray[ym*W+xp]+gray[yp*W+xm]+2*gray[yp*W+x]+gray[yp*W+xp];
      let m=Math.sqrt(gx*gx+gy*gy)*gain/4/255;
      if(m>1) m=1;
      const ca=o.colorize/100;
      let rr=bg[0]+(tc[0]-bg[0])*m, gg=bg[1]+(tc[1]-bg[1])*m, bb=bg[2]+(tc[2]-bg[2])*m;
      if(ca>0){
        rr+=(bg[0]+(px[i*4]-bg[0])*m-rr)*ca;
        gg+=(bg[1]+(px[i*4+1]-bg[1])*m-gg)*ca;
        bb+=(bg[2]+(px[i*4+2]-bg[2])*m-bb)*ca;
      }
      op[i*4]=rr; op[i*4+1]=gg; op[i*4+2]=bb; op[i*4+3]=255;
    }
  }
  ctx.putImageData(out,0,0);
  return cv;
}
function renderSketch(){
  if(!skImg) return;
  clearTimeout(skTimer);
  skTimer=setTimeout(()=>{
    try{
      const cv=processArt(skImg,1100,skOpts());
      const dc=$('skCanvas');
      dc.width=cv.width; dc.height=cv.height;
      dc.getContext('2d').drawImage(cv,0,0);
      $('skSize').textContent=cv.width+'×'+cv.height+' px';
    }catch(err){ toast('Gagal memproses gambar.'); }
  },120);
}
function skHandle(file){
  if(!file) return;
  if(!file.type.startsWith('image/')){ toast('File harus berupa gambar.'); return; }
  if(file.size>5*1024*1024){ toast('Maksimal 5MB ya.'); return; }
  const rd=new FileReader();
  rd.onload=()=>{
    const im=new Image();
    im.onload=()=>{
      skImg=im;
      skName=(file.name||'foto').replace(/\.[^.]+$/,'')||'sketsa';
      $('skBefore').src=rd.result;
      $('skEmpty').classList.add('hidden'); $('skWork').classList.remove('hidden');
      renderSketch();
      toast('📷 Foto dimuat. Pilih gaya seninya!');
    };
    im.onerror=()=>toast('Gambar rusak, coba file lain.');
    im.src=rd.result;
  };
  rd.readAsDataURL(file);
}
$('skDrop').addEventListener('click',()=>$('skFile').click());
$('skFile').addEventListener('change',e=>skHandle(e.target.files[0]));
['dragover','dragenter'].forEach(ev=>$('skDrop').addEventListener(ev,e=>{ e.preventDefault(); $('skDrop').classList.add('drag'); }));
['dragleave','drop'].forEach(ev=>$('skDrop').addEventListener(ev,e=>{ e.preventDefault(); $('skDrop').classList.remove('drag'); }));
$('skDrop').addEventListener('drop',e=>{ const f=e.dataTransfer.files&&e.dataTransfer.files[0]; skHandle(f); });
document.querySelectorAll('#skStyleGroup .art-btn').forEach(b=>b.onclick=()=>{
  document.querySelectorAll('#skStyleGroup .art-btn').forEach(x=>{ x.classList.remove('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]'); x.classList.add('border-slate-200'); });
  b.classList.add('active','border-[#B97F1F] dark:border-[#E9B44C]','bg-[#EFE3C2] dark:bg-[#2A3358]'); b.classList.remove('border-slate-200');
  syncSkSpecial(); renderSketch();
});
$('skContrast').addEventListener('input',e=>{ $('skContrastVal').textContent=e.target.value; renderSketch(); });
$('skBright').addEventListener('input',e=>{ $('skBrightVal').textContent=e.target.value; renderSketch(); });
$('skColorize').addEventListener('input',e=>{ $('skColorizeVal').textContent=e.target.value+'%'; renderSketch(); });
$('skSpecial').addEventListener('input',e=>{ $('skSpecialVal').textContent=e.target.value; renderSketch(); });
$('skTint').addEventListener('input',()=>renderSketch());
document.querySelectorAll('.sksw').forEach(b=>b.onclick=()=>{
  $('skTint').value=b.dataset.tint;
  document.querySelectorAll('.sksw').forEach(x=>{ x.classList.remove('border-[#B97F1F] dark:border-[#E9B44C]'); x.classList.add('border-slate-200'); });
  b.classList.add('border-[#B97F1F] dark:border-[#E9B44C]'); b.classList.remove('border-slate-200');
  renderSketch();
});
$('skDuo1').addEventListener('input',()=>renderSketch());
$('skDuo2').addEventListener('input',()=>renderSketch());
$('btnSkDownload').onclick=async()=>{
  if(!skImg){ toast('📷 Upload foto dulu ya.'); return; }
  const lbl=$('skDlLabel'); lbl.textContent='Merender HD…';
  try{
    await new Promise(r=>setTimeout(r,30));
    const scale=+$('skScale').value;
    const cv=processArt(skImg,Math.min(2600,1100*scale),skOpts());
    const a=document.createElement('a');
    a.download='sketsa-'+skOpts().style+'-'+cv.width+'x'+cv.height+'.png';
    a.href=cv.toDataURL('image/png');
    a.click();
    toast('Sketsa HD '+cv.width+'×'+cv.height+' terdownload!');
  }catch(err){ toast('Gagal mengekspor.'); }
  lbl.textContent='Download Hasil (HD)';
};
function skToPoster(as){
  if(!skImg){ toast('📷 Upload & proses foto dulu.'); return; }
  const dc=$('skCanvas');
  if(!dc.width){ toast('Belum ada hasil karya.'); return; }
  uploadDataURL=dc.toDataURL('image/png');
  uploadImgEl=new Image(); uploadImgEl.src=uploadDataURL;
  uploadName='sketsa-'+skOpts().style+'.png';
  showUploadFilled(uploadName);
  setUseAs(as);
  toast(as==='background'?'🌄 Sketsa dikirim jadi background poster!':'🧩 Sketsa dikirim jadi foto konten!');
  document.getElementById('studio').scrollIntoView({ behavior:'smooth' });
}
$('btnSkToKonten').onclick=()=>skToPoster('konten');
$('btnSkToBg').onclick=()=>skToPoster('background');

/* ============ LAB KREATIF ============ */
function switchLab(name){
  document.querySelectorAll('[data-labpanel]').forEach(p=>p.classList.toggle('hidden',p.dataset.labpanel!==name));
  document.querySelectorAll('#labTabs .labtab').forEach(b=>b.classList.toggle('active',b.dataset.lab===name));
}
document.querySelectorAll('#labTabs .labtab').forEach(b=>b.onclick=()=>switchLab(b.dataset.lab));
document.querySelectorAll('[data-labgoto]').forEach(b=>b.onclick=()=>{
  switchLab(b.dataset.labgoto);
  document.getElementById('labStudio').scrollIntoView({ behavior:'smooth', block:'start' });
});

/* ---- Util video lintas browser (Safari tidak dukung vp9/requestFrame manual) ---- */
function pickMime(){
  const cands=['video/webm;codecs=vp9','video/webm','video/mp4'];
  for(const m of cands){ try{ if(typeof MediaRecorder!=='undefined'&&MediaRecorder.isTypeSupported(m)) return m; }catch(e){} }
  return '';
}
function videoExt(m){ return (m||'').indexOf('mp4')>-1?'mp4':'webm'; }
function manualCapture(cv){
  try{
    const s=cv.captureStream(0), t=s.getVideoTracks()[0];
    if(t&&typeof t.requestFrame==='function') return {stream:s,track:t};
  }catch(e){}
  return {stream:cv.captureStream(15),track:null};
}

/* ---- Stop Motion ---- */
let smStream=null, smFrames=[], smPlayTimer=null, smPlaying=false, smExporting=false;
function smLoad(src){ return new Promise((res,rej)=>{ const im=new Image(); im.onload=()=>res(im); im.onerror=rej; im.src=src; }); }
async function smStartCam(){
  try{
    smStream=await navigator.mediaDevices.getUserMedia({ video:{ width:{ ideal:1280 } }, audio:false });
    const v=$('smVideo'); v.srcObject=smStream; await v.play();
    $('smLive').classList.remove('hidden');
    toast('📷 Kamera aktif. Ambil frame pertamamu!');
  }catch(err){ toast('Kamera tidak bisa diakses (butuh HTTPS & izin). Bisa upload foto sebagai frame.'); }
}
function smRenderStrip(){
  const st=$('smStrip'); st.innerHTML='';
  $('smCount').textContent=smFrames.length;
  if(!smFrames.length){ st.innerHTML='<p class="text-[11px] text-slate-400 self-center px-2">Belum ada frame. Ambil dari kamera atau upload foto.</p>'; return; }
  smFrames.forEach((f,i)=>{
    const w=document.createElement('div');
    w.className='relative shrink-0 group';
    w.innerHTML='<img src="'+f+'" class="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-[#3A4468]" alt="Frame '+(i+1)+'">'
      +'<span class="absolute bottom-1 left-1 text-[9px] font-extrabold bg-black/60 text-white px-1.5 rounded">'+(i+1)+'</span>'
      +'<button class="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition" title="Hapus frame">✕</button>';
    w.querySelector('button').onclick=e=>{ e.stopPropagation(); smFrames.splice(i,1); smRenderStrip(); smStopPlay(); smOnionUpd(); };
    st.appendChild(w);
  });
}
function smStopPlay(){ smPlaying=false; clearInterval(smPlayTimer); const b=$('smPlay'); if(b) b.textContent='▶ Putar'; }
$('smCam').onclick=smStartCam;
$('smSnap').onclick=()=>{
  const v=$('smVideo');
  if(!v.videoWidth){ toast('📷 Nyalakan kamera dulu, atau upload foto sebagai frame.'); return; }
  const c=document.createElement('canvas'); c.width=v.videoWidth; c.height=v.videoHeight;
  c.getContext('2d').drawImage(v,0,0);
  smFrames.push(c.toDataURL('image/jpeg',.85));
  smRenderStrip(); smOnionUpd();
  toast('📸 Frame '+smFrames.length+' diambil!');
};
$('smFileUp').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  if(!f.type.startsWith('image/')){ toast('File harus gambar.'); return; }
  const rd=new FileReader();
  rd.onload=()=>{ smFrames.push(rd.result); smRenderStrip(); smOnionUpd(); toast('🖼️ Frame ditambahkan!'); };
  rd.readAsDataURL(f);
  e.target.value='';
});
function smOnionUpd(){
  const on=$('smOnionTgl').checked&&smFrames.length>0;
  $('smOnion').style.display=on?'block':'none';
  if(on) $('smOnion').src=smFrames[smFrames.length-1];
}
$('smOnionTgl').addEventListener('change',smOnionUpd);
$('smPlay').onclick=async()=>{
  if(smPlaying){ smStopPlay(); return; }
  if(smFrames.length<2){ toast('️ Butuh minimal 2 frame untuk diputar.'); return; }
  smPlaying=true; $('smPlay').textContent='⏸ Stop';
  const fps=+$('smFps').value, cv=$('smPlayCv');
  const ctx=cv.getContext('2d');
  const imgs=await Promise.all(smFrames.map(smLoad));
  cv.width=imgs[0].naturalWidth; cv.height=imgs[0].naturalHeight;
  let i=0;
  const step=()=>{ if(!smPlaying) return; ctx.drawImage(imgs[i%imgs.length],0,0,cv.width,cv.height); i++; };
  step();
  smPlayTimer=setInterval(step,Math.round(1000/fps));
};
$('smClear').onclick=()=>{ if(!smFrames.length){ toast('Sudah kosong.'); return; } smFrames=[]; smRenderStrip(); smStopPlay(); smOnionUpd(); toast('🗑 Semua frame dihapus.'); };
$('smExport').onclick=async()=>{
  if(smExporting) return;
  if(smFrames.length<2){ toast('️ Butuh minimal 2 frame.'); return; }
  if(typeof MediaRecorder==='undefined'){ toast('Browser tidak mendukung perekam video.'); return; }
  smExporting=true;
  try{
    const fps=+$('smFps').value;
    const imgs=await Promise.all(smFrames.map(smLoad));
    const cv=document.createElement('canvas'); cv.width=imgs[0].naturalWidth; cv.height=imgs[0].naturalHeight;
    const ctx=cv.getContext('2d');
    const cap=manualCapture(cv), stream=cap.stream, track=cap.track;
    const mime=pickMime();
    const rec=new MediaRecorder(stream, mime?{mimeType:mime,videoBitsPerSecond:5000000}:{videoBitsPerSecond:5000000});
    const chunks=[];
    rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    const done=new Promise(r=>{ rec.onstop=r; });
    rec.start();
    for(const im of imgs){ ctx.drawImage(im,0,0,cv.width,cv.height); if(track) track.requestFrame(); await new Promise(r=>setTimeout(r,Math.round(1000/fps))); }
    await new Promise(r=>setTimeout(r,500));
    rec.stop(); await done;
    const url=URL.createObjectURL(new Blob(chunks,{type:'video/'+videoExt(mime)}));
    const a=document.createElement('a'); a.href=url; a.download='stop-motion-'+smFrames.length+'frame.'+videoExt(mime); a.click();
    setTimeout(()=>URL.revokeObjectURL(url),8000);
    toast('🎬 Video stop motion terdownload!');
  }catch(err){ toast('Gagal mengekspor video.'); }
  smExporting=false;
};
smRenderStrip();

/* ---- Drawing Pad ---- */
const dPad=$('dPad');
let dStrokes=[], dTool='pen', dColor='#141A33', dWidth=8, dCur=null, dDrawing=false;
function dPaint(){
  const ctx=dPad.getContext('2d');
  ctx.save(); ctx.setTransform(1,0,0,1,0,0);
  ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,dPad.width,dPad.height);
  ctx.restore();
  ctx.lineCap='round'; ctx.lineJoin='round';
  for(const st of dStrokes){
    ctx.strokeStyle=st.tool==='eraser'?'#ffffff':st.color;
    ctx.lineWidth=st.w; ctx.globalAlpha=1;
    ctx.beginPath();
    st.pts.forEach((p,i)=>{ const x=p[0]*dPad.width, y=p[1]*dPad.height; i?ctx.lineTo(x,y):ctx.moveTo(x,y); });
    if(st.pts.length===1){ const p=st.pts[0]; ctx.lineTo(p[0]*dPad.width+.2,p[1]*dPad.height+.2); }
    ctx.stroke();
  }
}
function dPos(e){ const r=dPad.getBoundingClientRect(); return [Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)),Math.min(1,Math.max(0,(e.clientY-r.top)/r.height))]; }
dPad.addEventListener('pointerdown',e=>{
  e.preventDefault();
  dDrawing=true;
  try{ dPad.setPointerCapture(e.pointerId); }catch(err){}
  dCur={tool:dTool,color:dColor,w:dWidth,pts:[dPos(e)]};
  dStrokes.push(dCur); dPaint();
});
dPad.addEventListener('pointermove',e=>{
  if(!dDrawing||!dCur) return;
  e.preventDefault(); dCur.pts.push(dPos(e));
  if(dCur.pts.length>1500) dCur.pts.shift();
  dPaint();
});
const dEnd=()=>{ dDrawing=false; dCur=null; };
dPad.addEventListener('pointerup',dEnd);
dPad.addEventListener('pointercancel',dEnd);
window.addEventListener('pointerup',()=>{ dDrawing=false; dCur=null; });
document.querySelectorAll('.dtool2').forEach(b=>b.onclick=()=>{
  dTool=b.dataset.dtool;
  document.querySelectorAll('.dtool2').forEach(x=>x.classList.toggle('active',x===b));
});
document.querySelectorAll('#dColors .dsw2').forEach(b=>b.onclick=()=>{
  dColor=b.dataset.dcolor; $('dColor').value=b.dataset.dcolor;
  document.querySelectorAll('#dColors .dsw2').forEach(x=>x.classList.toggle('active',x===b));
});
$('dColor').addEventListener('input',e=>{ dColor=e.target.value; document.querySelectorAll('#dColors .dsw2').forEach(x=>x.classList.remove('active')); });
$('dWidth').addEventListener('input',e=>{ dWidth=+e.target.value; $('dWidthVal').textContent=dWidth; });
$('dUndo').onclick=()=>{ if(!dStrokes.length){ toast('Tidak ada yang di-undo.'); return; } dStrokes.pop(); dPaint(); };
$('dClear').onclick=()=>{ if(!dStrokes.length){ toast('Sudah bersih.'); return; } dStrokes=[]; dPaint(); };
$('dPng').onclick=()=>{
  const a=document.createElement('a'); a.download='gambar-posterialab.png'; a.href=dPad.toDataURL('image/png'); a.click();
  toast('Gambar terdownload (PNG)!');
};
function dToSvg(){
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+dPad.width+' '+dPad.height+'" width="'+dPad.width+'" height="'+dPad.height+'">';
  s+='<rect width="100%" height="100%" fill="#ffffff"/>';
  for(const st of dStrokes){
    if(!st.pts.length) continue;
    const d=st.pts.map((p,i)=>(i?'L':'M')+(p[0]*dPad.width).toFixed(1)+' '+(p[1]*dPad.height).toFixed(1)).join('');
    s+='<path d="'+d+'" fill="none" stroke="'+(st.tool==='eraser'?'#ffffff':st.color)+'" stroke-width="'+st.w+'" stroke-linecap="round" stroke-linejoin="round"/>';
  }
  return s+'</svg>';
}
$('dSvg').onclick=()=>{
  const blob=new Blob([dToSvg()],{type:'image/svg+xml'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='gambar-posterialab.svg'; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  toast('Gambar terdownload (SVG vektor)!');
};
$('dSend').onclick=()=>{
  uploadDataURL=dPad.toDataURL('image/png');
  uploadImgEl=new Image(); uploadImgEl.src=uploadDataURL;
  uploadName='gambar-lab.png';
  showUploadFilled(uploadName);
  setUseAs('konten');
  toast('🧩 Gambar dikirim jadi foto konten!');
  document.getElementById('studio').scrollIntoView({ behavior:'smooth' });
};
dPaint();
document.querySelector('.dtool2[data-dtool="pen"]').classList.add('active');

/* ---- Vector Studio ---- */
const vPad=$('vPad');
let vShapes=[], vSel=null, vSeq=1;
function vRender(){
  const ctx=vPad.getContext('2d');
  ctx.clearRect(0,0,vPad.width,vPad.height);
  for(const s of vShapes){
    ctx.save();
    ctx.fillStyle=s.color; ctx.strokeStyle=s.color;
    const cx=s.x*vPad.width, cy=s.y*vPad.height;
    if(s.kind==='rect'){
      const w=s.size, h=s.size*.6;
      ctx.fillRect(cx-w/2,cy-h/2,w,h);
    } else if(s.kind==='circle'){
      ctx.beginPath(); ctx.arc(cx,cy,s.size/2,0,7); ctx.fill();
    } else if(s.kind==='line'){
      ctx.translate(cx,cy); ctx.rotate((s.angle||0)*Math.PI/180);
      ctx.lineWidth=Math.max(3,s.size*.08); ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(-s.size/2,0); ctx.lineTo(s.size/2,0); ctx.stroke();
    } else if(s.kind==='star'){
      const R=s.size/2, r=R*.45;
      ctx.beginPath();
      for(let i=0;i<10;i++){
        const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r:R;
        const px=cx+Math.cos(a)*rr, py=cy+Math.sin(a)*rr;
        i?ctx.lineTo(px,py):ctx.moveTo(px,py);
      }
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    if(s.id===vSel){
      ctx.save();
      ctx.strokeStyle='#E9B44C'; ctx.lineWidth=3; ctx.setLineDash([8,6]);
      ctx.strokeRect(cx-s.size/2-10,cy-s.size/2-10,s.size+20,s.size+20);
      ctx.restore();
    }
  }
}
function vPos(e){ const r=vPad.getBoundingClientRect(); return { fx:Math.min(1,Math.max(0,(e.clientX-r.left)/r.width)), fy:Math.min(1,Math.max(0,(e.clientY-r.top)/r.height)), W:r.width, H:r.height }; }
vPad.addEventListener('pointerdown',e=>{
  e.preventDefault();
  const p=vPos(e);
  const hit=[...vShapes].reverse().find(s=>{
    const cx=s.x*vPad.width, cy=s.y*vPad.height, m=24;
    const r0=vPad.getBoundingClientRect();
    const px=e.clientX-r0.left, py=e.clientY-r0.top;
    const scx=vPad.width/p.W;
    return Math.abs(px*scx-cx)<s.size/2+m&&Math.abs(py*scx-cy)<s.size/2+m;
  });
  if(hit){
    vSel=hit.id;
    hit._sx=e.clientX; hit._sy=e.clientY; hit._ox=hit.x; hit._oy=hit.y;
    hit._drag=true;
    try{ vPad.setPointerCapture(e.pointerId); }catch(err){}
  } else { vSel=null; }
  vRender();
});
vPad.addEventListener('pointermove',e=>{
  const s=vShapes.find(x=>x._drag); if(!s) return;
  e.preventDefault();
  const r=vPad.getBoundingClientRect();
  s.x=Math.min(.98,Math.max(.02,s._ox+(e.clientX-s._sx)/r.width));
  s.y=Math.min(.98,Math.max(.02,s._oy+(e.clientY-s._sy)/r.height));
  vRender();
});
const vEnd=()=>{ vShapes.forEach(s=>{ s._drag=false; }); };
vPad.addEventListener('pointerup',vEnd);
vPad.addEventListener('pointercancel',vEnd);
document.querySelectorAll('[data-vadd]').forEach(b=>b.onclick=()=>{
  const kind=b.dataset.vadd;
  vShapes.push({ id:'v'+Date.now().toString(36)+(vSeq++), kind, color:$('vColor').value, size:+$('vSize').value, angle:0, x:.5, y:.5 });
  vSel=vShapes[vShapes.length-1].id;
  vRender();
  toast('Bentuk ditambahkan, seret untuk memindah!');
});
$('vColor').addEventListener('input',e=>{ const s=vShapes.find(x=>x.id===vSel); if(!s){ toast('👆 Pilih bentuk dulu di kanvas.'); return; } s.color=e.target.value; vRender(); });
$('vSize').addEventListener('input',e=>{
  $('vSizeVal').textContent=e.target.value;
  const s=vShapes.find(x=>x.id===vSel); if(!s) return;
  s.size=+e.target.value; vRender();
});
$('vDel').onclick=()=>{ if(!vSel){ toast('👆 Pilih bentuk dulu.'); return; } vShapes=vShapes.filter(x=>x.id!==vSel); vSel=null; vRender(); };
$('vClear').onclick=()=>{ if(!vShapes.length){ toast('Sudah kosong.'); return; } vShapes=[]; vSel=null; vRender(); };
function vToSvg(){
  const W=vPad.width, H=vPad.height;
  let s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">';
  for(const sh of vShapes){
    const cx=(sh.x*W).toFixed(1), cy=(sh.y*H).toFixed(1);
    if(sh.kind==='rect'){
      const w=sh.size, h=sh.size*.6;
      s+='<rect x="'+(cx-w/2).toFixed(1)+'" y="'+(cy-h/2).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+sh.color+'"/>';
    } else if(sh.kind==='circle'){
      s+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(sh.size/2).toFixed(1)+'" fill="'+sh.color+'"/>';
    } else if(sh.kind==='line'){
      const L=sh.size/2;
      s+='<line x1="'+(cx-L)+'" y1="'+cy+'" x2="'+(cx+L)+'" y2="'+cy+'" stroke="'+sh.color+'" stroke-width="'+Math.max(3,sh.size*.08).toFixed(1)+'" stroke-linecap="round"/>';
    } else if(sh.kind==='star'){
      const R=sh.size/2, r=R*.45; let pts=[];
      for(let i=0;i<10;i++){
        const a=-Math.PI/2+i*Math.PI/5, rr=i%2?r:R;
        pts.push((+cx+Math.cos(a)*rr).toFixed(1)+','+(+cy+Math.sin(a)*rr).toFixed(1));
      }
      s+='<polygon points="'+pts.join(' ')+'" fill="'+sh.color+'"/>';
    }
  }
  return s+'</svg>';
}
$('vSvg').onclick=()=>{
  if(!vShapes.length){ toast('️ Tambahkan bentuk dulu.'); return; }
  const blob=new Blob([vToSvg()],{type:'image/svg+xml'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='vektor-posterialab.svg'; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  toast('Vektor terdownload (SVG asli)!');
};
$('vPng').onclick=()=>{
  const out=document.createElement('canvas'); out.width=vPad.width; out.height=vPad.height;
  const octx=out.getContext('2d');
  octx.fillStyle='#ffffff'; octx.fillRect(0,0,out.width,out.height);
  octx.drawImage(vPad,0,0);
  const a=document.createElement('a'); a.download='vektor-posterialab.png'; a.href=out.toDataURL('image/png'); a.click();
  toast('Vektor terdownload (PNG)!');
};
vRender();

/* ---- Animation Studio (halaman poster → video) ---- */
let anPlaying=false, anPlayTimer=null, anExporting=false;
async function anBuildThumbs(){
  const su=UNDO, sr=REDO, back=curPage;
  saveCurrentPage();
  const out=[];
  for(let i=0;i<pages.length;i++){
    loadSnap(i);
    const cv=await getPosterCanvas();
    out.push(cv.toDataURL('image/jpeg',.85));
  }
  loadSnap(back);
  UNDO=su; REDO=sr; renderPagesBar();
  return out;
}
function anStop(){ anPlaying=false; clearInterval(anPlayTimer); const b=$('anPlay'); if(b) b.textContent='▶ Putar'; }
$('anPlay').onclick=async()=>{
  if(anPlaying){ anStop(); return; }
  toast('Merender pratinjau…');
  const thumbs=await anBuildThumbs();
  if(!thumbs.length) return;
  $('anPages').textContent=thumbs.length+' halaman';
  anPlaying=true; $('anPlay').textContent='⏸ Stop';
  let i=0;
  const step=()=>{ if(!anPlaying) return; $('anPrev').src=thumbs[i%thumbs.length]; i++; };
  step();
  anPlayTimer=setInterval(step,(+$('anDur').value)*1000);
};
$('anExport').onclick=async()=>{
  if(anExporting) return;
  if(typeof MediaRecorder==='undefined'){ toast('Browser tidak mendukung perekam video.'); return; }
  anExporting=true;
  try{
    toast('Merender halaman…');
    const su=UNDO, sr=REDO, back=curPage;
    saveCurrentPage();
    const canvases=[];
    for(let i=0;i<pages.length;i++){ loadSnap(i); canvases.push(await getPosterCanvas()); }
    loadSnap(back); UNDO=su; REDO=sr; renderPagesBar();
    const S2=1080, cv=document.createElement('canvas'); cv.width=S2; cv.height=S2;
    const ctx=cv.getContext('2d');
    const cap=manualCapture(cv), stream=cap.stream, track=cap.track;
    const mime=pickMime();
    const rec=new MediaRecorder(stream, mime?{mimeType:mime,videoBitsPerSecond:6000000}:{videoBitsPerSecond:6000000});
    const chunks=[];
    rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    const done=new Promise(r=>{ rec.onstop=r; });
    rec.start();
    const dur=+$('anDur').value, mode=$('anZoom').value, fps=15, frames=Math.max(8,dur*fps);
    const drawCover=(img,z,px)=>{
      const iw=img.width, ih=img.height, target=iw/z, th=target*(S2/S2);
      let sw=iw/z, sh=iw/z;
      if(sh>ih){ sh=ih; sw=ih; }
      let sx=(iw-sw)/2+px, sy=(ih-sh)/2;
      sx=Math.max(0,Math.min(iw-sw,sx)); sy=Math.max(0,Math.min(ih-sh,sy));
      ctx.fillStyle='#000'; ctx.fillRect(0,0,S2,S2);
      ctx.drawImage(img,sx,sy,sw,sh,0,0,S2,S2);
    };
    for(const pc of canvases){
      for(let f=0;f<frames;f++){
        const t=frames===1?1:f/(frames-1);
        if(mode==='zoom') drawCover(pc,1+t*.12,0);
        else if(mode==='pan') drawCover(pc,1.06,(t-.5)*pc.width*.1);
        else drawCover(pc,1,0);
        if(track) track.requestFrame();
        await new Promise(r=>setTimeout(r,Math.round(1000/fps)));
      }
    }
    await new Promise(r=>setTimeout(r,500));
    rec.stop(); await done;
    const url=URL.createObjectURL(new Blob(chunks,{type:'video/'+videoExt(mime)}));
    const a=document.createElement('a'); a.href=url; a.download='animasi-poster-'+canvases.length+'halaman.'+videoExt(mime); a.click();
    setTimeout(()=>URL.revokeObjectURL(url),8000);
    toast('🎞️ Video animasi terdownload!');
  }catch(err){ toast('Gagal mengekspor video.'); }
  anExporting=false;
};

/* ---- Video Editing (potong klip) ---- */
$('vdFile').addEventListener('change',e=>{
  const f=e.target.files&&e.target.files[0]; if(!f) return;
  const v=$('vdVideo');
  if(v.src&&v.src.startsWith('blob:')) URL.revokeObjectURL(v.src);
  v.src=URL.createObjectURL(f);
  v.onloadedmetadata=()=>{
    $('vdStart').value=0;
    $('vdEnd').value=Math.max(1,Math.floor(v.duration||5));
    toast('📁 Video dimuat ('+Math.floor(v.duration||0)+' dtk)!');
  };
});
$('vdPlaySeg').onclick=async()=>{
  const v=$('vdVideo');
  if(!v.src){ toast('📁 Pilih video dulu.'); return; }
  const s=Math.max(0,+$('vdStart').value), en=Math.max(s+.5,+$('vdEnd').value);
  v.currentTime=Math.min(s,v.duration||s);
  try{ await v.play(); }catch(err){ return; }
  const chk=()=>{
    if(v.currentTime>=en||v.paused){ v.pause(); v.removeEventListener('timeupdate',chk); }
  };
  v.addEventListener('timeupdate',chk);
};
$('vdCut').onclick=async()=>{
  const v=$('vdVideo');
  if(!v.src){ toast('📁 Pilih video dulu.'); return; }
  if(typeof MediaRecorder==='undefined'){ toast('Browser tidak mendukung perekam video.'); return; }
  const s=Math.max(0,+$('vdStart').value), en=Math.max(s+.5,+$('vdEnd').value);
  try{
    const vw=v.videoWidth||1280, vh=v.videoHeight||720;
    const sc=Math.min(1,1280/Math.max(vw,vh));
    const cv=document.createElement('canvas');
    cv.width=Math.round(vw*sc); cv.height=Math.round(vh*sc);
    const ctx=cv.getContext('2d');
    const stream=cv.captureStream(30);
    const mime=pickMime();
    const rec=new MediaRecorder(stream, mime?{mimeType:mime,videoBitsPerSecond:6000000}:{videoBitsPerSecond:6000000});
    const chunks=[];
    rec.ondataavailable=e=>{ if(e.data&&e.data.size) chunks.push(e.data); };
    const done=new Promise(r=>{ rec.onstop=r; });
    v.currentTime=Math.min(s,v.duration||s);
    await new Promise(r=>{ v.onseeked=()=>r(); setTimeout(r,1500); });
    if(!v.videoWidth){ toast('Video belum siap. Tunggu sebentar lalu coba lagi.'); return; }
    rec.start();
    await v.play();
    await new Promise(r=>{
      let finished=false;
      const fin=()=>{ if(finished) return; finished=true; try{ v.pause(); }catch(e){} v.removeEventListener('timeupdate',chk); v.removeEventListener('ended',fin); cancelAnimationFrame(raf); clearTimeout(safety); r(); };
      const chk=()=>{ ctx.drawImage(v,0,0,cv.width,cv.height); if(v.currentTime>=en||v.ended) fin(); };
      const loop=()=>{ if(finished) return; if(!v.paused) ctx.drawImage(v,0,0,cv.width,cv.height); raf=requestAnimationFrame(loop); };
      const safety=setTimeout(fin,(en-s+10)*1000);
      v.addEventListener('timeupdate',chk);
      v.addEventListener('ended',fin);
      var raf=requestAnimationFrame(loop);
    });
    rec.stop(); await done;
    const url=URL.createObjectURL(new Blob(chunks,{type:'video/'+videoExt(mime)}));
    const a=document.createElement('a'); a.href=url; a.download='potongan-video.'+videoExt(mime); a.click();
    setTimeout(()=>URL.revokeObjectURL(url),8000);
    toast('️ Potongan video terdownload (tanpa suara)!');
  }catch(err){ toast('Gagal memotong video.'); }
};

/* ---- Coding Playground ---- */
const CODE_EX={
  kartu:{ name:'kartu.html', code:'<div class="card">\n  <h1>Halo, aku Rasen!</h1>\n  <p>Ini kartu pertamaku dari kode.</p>\n  <button>Klik Aku</button>\n</div>\n<style>\nbody { font-family: sans-serif; background: #141A33; display: grid; place-items: center; min-height: 100vh; margin: 0; }\n.card { background: #F3EDDC; color: #141A33; padding: 32px 40px; border-radius: 20px; text-align: center; }\n.card button { background: #E9B44C; border: none; padding: 10px 22px; border-radius: 10px; font-weight: bold; cursor: pointer; }\n</style>' },
  tombol:{ name:'tombol.html', code:'<button class="ajaib">Arahkan kursor ke aku!</button>\n<style>\nbody { font-family: sans-serif; background: #141A33; display: grid; place-items: center; min-height: 100vh; margin: 0; }\n.ajaib { font-size: 18px; font-weight: bold; color: #141A33; background: #E9B44C; border: none; padding: 16px 32px; border-radius: 14px; cursor: pointer; transition: transform .2s; animation: goyang 2s infinite; }\n.ajaib:hover { transform: scale(1.1) rotate(-2deg); }\n@keyframes goyang { 0%,100% { transform: rotate(0); } 25% { transform: rotate(2deg); } 75% { transform: rotate(-2deg); } }\n</style>' },
  galeri:{ name:'galeri.html', code:'<h2>Galeri Mini</h2>\n<div class="grid">\n  <div style="background:#E9B44C">1</div>\n  <div style="background:#7D9B76">2</div>\n  <div style="background:#E33D94">3</div>\n  <div style="background:#00C4CC">4</div>\n</div>\n<style>\nbody { font-family: sans-serif; background: #141A33; color: #F3EDDC; text-align: center; padding: 24px; }\n.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; max-width: 420px; margin: 16px auto; }\n.grid div { aspect-ratio: 1; display: grid; place-items: center; font-size: 32px; font-weight: bold; color: #141A33; border-radius: 16px; }\n</style>' }
};
function codeLoad(){
  const k=$('codeEx').value;
  $('codeArea').value=CODE_EX[k].code;
  codeRun();
}
function codeRun(){ $('codeView').srcdoc=$('codeArea').value; }
$('codeEx').addEventListener('change',codeLoad);
$('codeRun').onclick=codeRun;
$('codeDl').onclick=()=>{
  const k=$('codeEx').value;
  const blob=new Blob(['<!DOCTYPE html>\n<html lang="id">\n<head><meta charset="UTF-8">\n<title>'+CODE_EX[k].name+'</title></head>\n<body>\n'+$('codeArea').value+'\n</body>\n</html>'],{type:'text/html'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=CODE_EX[k].name; a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  toast('File HTML terdownload!');
};
codeLoad();
