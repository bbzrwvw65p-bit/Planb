/* Plan B v5 · Unidad y Amigos sin servidor: fusión registro a registro, QR (varios si hace falta) y archivo.
   Nada sale del móvil salvo lo que tú enseñas en un QR o envías en un archivo. Sin cifrado propio. */
'use strict';
const nowMs=()=>Date.now();
const devOf=()=>D&&D.dev;
function touch(r){if(r){r._u=nowMs();r._b=devOf()}return r}
const isMine=r=>!r||!r._o||r._o===devOf();
const SYNC_COLLS=['registro','mascotas','personas','par'];
/* ---------- Fusión (función pura, probada en los tests) ---------- */
const cmpKey=r=>{const o={};Object.keys(r||{}).sort().forEach(k=>{if(!['_u','_b','mision'].includes(k))o[k]=r[k]});return JSON.stringify(o)};
function mergeColl(L,R,base,owner){const lm=new Map((L||[]).map(r=>[r.id,r])),rm=new Map((R||[]).map(r=>[r.id,r])),out=[],conf=[];
 new Set([...lm.keys(),...rm.keys()]).forEach(id=>{const l=lm.get(id),r=rm.get(id);
  if(!r){out.push(l);return}if(!l){out.push(r);return}
  if(cmpKey(l)===cmpKey(r)){out.push((r._u||0)>(l._u||0)?Object.assign({},l,{_u:r._u,_b:r._b}):l);return}
  if(owner){const o=owner(l,r);if(o){out.push(o);return}}
  const lc=(l._u||0)>base,rc=(r._u||0)>base;
  if(lc&&rc){conf.push({id,l,r});out.push(l);return}
  if(rc){out.push(r);return}if(lc){out.push(l);return}
  out.push((r._u||0)>(l._u||0)?r:l)});
 return{out,conf}}
/* Datos personales: solo su dueño los cambia. Para las fichas mías, gana la mía; las del otro, la suya. */
function ownerRule(me,them){return(l,r)=>{const o=l._o||r._o;
 if(r._o===them&&l._o===me&&r._claim===them)return r; /* el otro dice «soy yo» en una ficha que creé yo */
 if(o===me)return l;if(o===them)return r;return null}}
/* ---------- Colecciones locales con lápidas ---------- */
function collLocal(name){if(name==='hogar')return D.hogar?[Object.assign({id:'hogar'},D.hogar,D.meta.hogar||{})]:[];
 if(name==='plan')return D.plan?[Object.assign({id:'plan'},D.plan)]:[];
 return[...(D[name]||[]),...((D.tomb&&D.tomb[name])||[])]}
function setLocal(name,arr){if(name==='hogar'){const h=arr[0];if(!h)return;const{id,_u,_b,...rest}=h;D.hogar=rest;D.meta.hogar={_u,_b};return}
 if(name==='plan'){if(arr[0]){const{id,...rest}=arr[0];D.plan=rest}return}
 D[name]=arr.filter(r=>!r._del);D.tomb[name]=arr.filter(r=>r._del)}
function tombstone(name,rec){if(!rec||!rec.id)return;D.tomb[name]=D.tomb[name]||[];D.tomb[name].push({id:rec.id,_del:1,_u:nowMs(),_b:devOf()})}
/* ---------- Tarjetas y datos personales ---------- */
function medallas(S){S=S||score();const m=[];(D.pasados||[]).forEach(l=>m.push('Nivel '+l+' superado'));if(D.fin&&!m.includes('Nivel 4 superado'))m.push('Nivel 4 superado');
 if((D.drills||[]).some(d=>d.sorpresa))m.push('Simulacro sorpresa medido');if((D.drills||[]).some(d=>d.sorpresa&&d.s<=DRILL.obj))m.push('Respuesta en objetivo');
 if(D.cfg.lastBackup)m.push('Copia de seguridad');if(planCompleto())m.push('Plan sin red acordado');if((D.par||[]).some(p=>p.hecha))m.push('Misión en pareja');return m}
function myCard(){const S=score();return{t:'planb-amigo',v:5,id:D.dev,alias:D.cfg.alias||'',nivel:S.lv,fin:!!D.fin,rango:D.fin?'Nivel máximo':RANGOS[S.ri],xp:Object.fromEntries(ATR.map(([k])=>[k,S.A[k]])),total:S.T,medallas:medallas(S),at:new Date().toISOString()}}
function myPersonal(){const S=score(),apr=[],tms=[];D.misiones.forEach(m=>{const d=defK(m.key);if(!d)return;if(m.hecha&&(d.ty==='s'||m.aprendido))apr.push(d.t);(d.tm||[]).forEach(([k,l])=>{const t=m.tiempos&&m.tiempos[k];if(t)tms.push([l,t.best])})});
 return{nivel:S.lv,fin:!!D.fin,rango:D.fin?'Nivel máximo':RANGOS[S.ri],xp:S.A,total:S.T,bloquean:S.block.map(k=>ATRN[k]),aprendido:apr,tiempos:tms,simulacros:(D.drills||[]).filter(d=>d.sorpresa).map(d=>[d.fecha,d.s]),medallas:medallas(S)}}
function unidadPayload(){return{t:'planb-unidad',v:5,unidad:{id:D.unidad.id,nombre:D.unidad.nombre||''},dev:D.dev,alias:D.cfg.alias||'',yo:D.yo||null,at:new Date().toISOString(),
 hogar:collLocal('hogar'),plan:collLocal('plan'),registro:collLocal('registro').map(r=>{const o=Object.assign({},r);delete o.mision;return o}),mascotas:collLocal('mascotas'),personas:collLocal('personas'),par:collLocal('par'),
 personal:myPersonal(),card:myCard(),miembros:Object.values(D.unidad.miembros||{})}}
/* Aplica lo recibido de otro miembro. Devuelve el número de conflictos. */
function applyUnidad(P){const them=P.dev,me=D.dev;if(!them||them===me)return{err:'Es tu propio archivo.'};
 const peer=D.sync.peers[them]||{},base=peer.at||0,conf=[];
 ['hogar','plan',...SYNC_COLLS].forEach(name=>{const R=(P[name]||[]).map(r=>Object.assign({},r));
  if(name==='registro')R.forEach(r=>{delete r.mision});
  const res=mergeColl(collLocal(name),R,base,name==='personas'?ownerRule(me,them):null);
  if(name==='registro')res.out.forEach(r=>{if(r.misionKey){const m=D.misiones.find(q=>q.key===r.misionKey);r.mision=m?m.id:''}});
  setLocal(name,res.out);res.conf.forEach(c=>conf.push(Object.assign({coll:name,from:P.alias||'otro miembro',fromDev:them},c)))});
 if(!D.unidad.id||!Object.keys(D.unidad.miembros||{}).length){D.unidad.id=P.unidad.id;if(P.unidad.nombre)D.unidad.nombre=P.unidad.nombre}
 D.unidad.miembros=D.unidad.miembros||{};
 const put=m=>{if(!m||!m.dev||m.dev===me)return;const o=D.unidad.miembros[m.dev];if(!o||(o.at||'')<=(m.at||''))D.unidad.miembros[m.dev]=m};
 put({dev:them,alias:P.alias,yo:P.yo,personal:P.personal,card:P.card,at:P.at});(P.miembros||[]).forEach(put);
 D.sync.conf=(D.sync.conf||[]).filter(c=>!conf.some(n=>n.coll===c.coll&&n.id===c.id)).concat(conf);
 D.sync.peers[them]={at:nowMs(),alias:P.alias};if(D.hogar&&D.personas.length)D.hogar.nper=D.personas.length;return{conf:conf.length}}
function resolveConf(i,pick){const c=D.sync.conf[i];if(!c)return;const keep=Object.assign({},pick==='r'?c.r:c.l);touch(keep);
 const arr=collLocal(c.coll).filter(r=>r.id!==c.id);arr.push(keep);if(c.coll==='registro'&&keep.misionKey){const m=D.misiones.find(q=>q.key===keep.misionKey);keep.mision=m?m.id:''}
 setLocal(c.coll,arr);D.sync.conf.splice(i,1)}
function applyAmigo(C){if(!C||!C.id)return false;if(C.id===D.dev)return false;const allowed=['t','v','id','alias','nivel','fin','rango','xp','total','medallas','at'],c={};allowed.forEach(k=>{if(k in C)c[k]=C[k]});
 D.amigos=D.amigos||[];const i=D.amigos.findIndex(a=>a.id===c.id);if(i<0)D.amigos.push(c);else if((D.amigos[i].at||'')<=(c.at||''))D.amigos[i]=c;return true}
/* Nivel del hogar: sube solo cuando todos llegan al mínimo */
function nivelHogar(){const S=score(),rows=[{alias:D.cfg.alias||'Tú',nivel:S.lv,fin:!!D.fin,bloquean:S.block.map(k=>ATRN[k]),yo:true}];
 Object.values(D.unidad.miembros||{}).forEach(m=>{const p=m.personal||m.card||{};rows.push({alias:m.alias||'Miembro',nivel:p.nivel||1,fin:!!p.fin,bloquean:p.bloquean||[],at:m.at})});
 const eff=r=>r.fin?5:r.nivel;const lv=Math.min(...rows.map(eff));return{lv:Math.min(4,lv),completo:rows.every(r=>r.fin),rows}}
/* ---------- QR: trocea, comprime si el móvil puede, base64url ---------- */
const QR_CH=480;
const b64u=u8=>{let s='';for(let i=0;i<u8.length;i+=0x8000)s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const ub64u=s=>{s=s.replace(/-/g,'+').replace(/_/g,'/');while(s.length%4)s+='=';const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u};
async function zip(u8,dir){const S=dir?CompressionStream:DecompressionStream;const st=new Blob([u8]).stream().pipeThrough(new S('deflate'));return new Uint8Array(await new Response(st).arrayBuffer())}
async function packFrames(obj){let u=new TextEncoder().encode(JSON.stringify(obj)),fl='j';
 if(typeof CompressionStream!=='undefined'){try{u=await zip(u,true);fl='z'}catch(e){u=new TextEncoder().encode(JSON.stringify(obj));fl='j'}}
 const s=b64u(u),n=Math.max(1,Math.ceil(s.length/QR_CH)),id=Math.random().toString(36).slice(2,6),out=[];
 for(let i=0;i<n;i++)out.push(`PB5|${id}|${i+1}|${n}|${fl}|${s.slice(i*QR_CH,(i+1)*QR_CH)}`);return out}
function frameParse(t){const m=/^PB5\|([a-z0-9]+)\|(\d+)\|(\d+)\|([jz])\|(.*)$/s.exec(t||'');return m?{id:m[1],i:+m[2],n:+m[3],fl:m[4],d:m[5]}:null}
async function unpackFrames(frames){const f=frames[0],s=frames.slice().sort((a,b)=>a.i-b.i).map(x=>x.d).join('');let u=ub64u(s);
 if(f.fl==='z'){if(typeof DecompressionStream==='undefined')throw new Error('nodecomp');u=await zip(u,false)}return JSON.parse(new TextDecoder().decode(u))}
function qrSvg(text){const q=qrcode(0,'L');q.addData(text,'Byte');q.make();const n=q.getModuleCount(),m=4;let p='';
 for(let r=0;r<n;r++)for(let c=0;c<n;c++)if(q.isDark(r,c))p+=`M${c+m} ${r+m}h1v1h-1z`;
 return `<svg class="qr" viewBox="0 0 ${n+2*m} ${n+2*m}" role="img" aria-label="Código QR" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${p}" fill="#000"/></svg>`}
/* ---------- Cámara (getUserMedia + jsQR local; sin BarcodeDetector) ---------- */
let cam=null;
function loadJsQR(){return window.jsQR?Promise.resolve():new Promise((ok,ko)=>{const s=document.createElement('script');s.src='lib/jsQR.js';s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
async function camStart(video,onText,onErr){camStop();
 if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){onErr('nocam');return}
 try{await loadJsQR()}catch(e){onErr('nolib');return}
 let stream;try{stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}},audio:false})}catch(e){onErr(e&&e.name==='NotAllowedError'?'denied':e&&e.name==='NotFoundError'?'nocam':'error');return}
 video.setAttribute('playsinline','');video.setAttribute('muted','');video.muted=true;video.setAttribute('autoplay','');video.srcObject=stream;
 try{await video.play()}catch(e){}
 const cv=document.createElement('canvas'),ctx=cv.getContext('2d',{willReadFrequently:true});cam={stream,video,timer:null};
 const tick=()=>{if(!cam)return;if(video.readyState>=2&&video.videoWidth){const sc=Math.min(1,720/Math.max(video.videoWidth,video.videoHeight));cv.width=Math.round(video.videoWidth*sc);cv.height=Math.round(video.videoHeight*sc);ctx.drawImage(video,0,0,cv.width,cv.height);
   const img=ctx.getImageData(0,0,cv.width,cv.height),code=jsQR(img.data,cv.width,cv.height,{inversionAttempts:'dontInvert'});if(code&&code.data)onText(code.data)}
  cam&&(cam.timer=setTimeout(tick,120))};tick()}
function camStop(){if(!cam)return;clearTimeout(cam.timer);try{cam.stream.getTracks().forEach(t=>t.stop())}catch(e){}if(cam.video)cam.video.srcObject=null;cam=null}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&cam){camStop();if(typeof scanUI!=='undefined'&&scanUI)scanUI.paused=true}});
/* ---------- Archivo: hoja de Compartir con archivo o descarga + importar ---------- */
async function shareFile(obj,name){const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
 try{const f=new File([blob],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})&&/iPhone|iPad|Android/.test(navigator.userAgent)){await navigator.share({files:[f],title:name});return 'shared'}}catch(e){if(e&&e.name==='AbortError')return 'abort'}
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);return 'download'}
