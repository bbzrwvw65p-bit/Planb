/* Plan B 7.0.0 · Fase 1: copia antes de migrar (cualquier versión), migración 6.x → 7, Refugio por días y «Tú»,
   registro por secciones, placas con PVGIS sin internet, kit por nivel, explicaciones al tocar y actualización con un toque. */
'use strict';
const BK7='planb-premig7',BKA='planb-copia-auto',LOSS7=.15,PR_DEF=.86,PROT_KG=.83;
let sec7='agua',upd7={msg:null,stuck:false},hadCtl=!!(navigator.serviceWorker&&navigator.serviceWorker.controller),reloading7=false;
const num7=v=>{const n=parseFloat(String(v??'').replace(',','.'));return isFinite(n)?n:0};
const r1=v=>Math.round(v*10)/10;
const fmtN=v=>v==null?'—':!isFinite(v)?'∞':(v<10?r1(v):Math.floor(v)).toLocaleString('es-ES');

/* ===================== Contenido nuevo sobre el de la 6.1 ===================== */
NIV.splice(0,NIV.length,...NIV7.map(L=>({t:L.t,o:L.o,src:L.src,adv:!!L.adv,opt:!!L.opt})));
ATR.splice(0,ATR.length,...ATR7);ATR7.forEach(([k,l])=>{ATRN[k]=l});
CUR.forEach(d=>{if(d.lv6==null)d.lv6=d.lv;if(LV7[d.k]!=null)d.lv=LV7[d.k]});
if(!CUR.some(d=>d.k==='semana5'))CUR.push({lv:5,k:'semana5',ty:'x',t:'Una semana de lo propio',a:['rsp','res'],f:'comida',min:10080,
 w:()=>'Demuestra que el hogar repone lo que gasta: agua, comida, energía, cocina e higiene sin comprar ni depender de servicios de fuera.',
 o:()=>'Vivid una semana solo de lo propio. Apuntad qué faltó y qué hubo que comprar.',src:['Objetivo de Plan B, no recomendación oficial']});
Object.keys(REQ).forEach(k=>delete REQ[k]);REQ[1]=['extintor','pls'];REQ[2]=['rcp','agua','hemo'];
const gasHome=x=>{x=x||X();const h=x.h||{};return [...(Array.isArray(h.cocina)?h.cocina:[]),...(Array.isArray(h.acs)?h.acs:[])].some(o=>['Butano o propano','Gas natural'].includes(o))||(D&&D.registro||[]).some(r=>r.sec==='cocina'&&/butano|propano|gas natural|cartucho/i.test(r.tipo||''))};
reqFor=function(lv){const out=[];for(let l=1;l<=Math.min(lv,4);l++)(REQ[l]||[]).forEach(k=>{if(!out.includes(k))out.push(k)});if(D&&gasHome()&&!out.includes('gas'))out.splice(2,0,'gas');return out.filter(skOk)};
(function(){const p2=PQ.find(s=>s.id==='p2');if(p2&&!p2.q.some(q=>q.k==='actividad')){
 p2.q.splice(4,0,{k:'actividad',l:'Actividad física',ty:'one',o:['Sedentaria','Moderada','Activa','Muy activa'],opt:true,c:p=>!bebe(p),f:'comida'},{k:'restr',l:'Restricciones',ty:'multi',o:['Ninguna','Sin gluten','Sin lactosa','Sin frutos secos'],ex:'Ninguna',opt:true,f:'comida'})}})();
if(!P_SALUD.includes('meds'))P_SALUD.push('meds');
GLOS.splice(0,GLOS.length,['Refugio','Cuántos días aguanta cada sección de tu casa frente al objetivo de tu nivel. No da XP.'],['«Tú»','Habilidades, Respuesta, Resolución y Red: lo único que da XP, y solo lo demostrado.'],['Declarado y Comprobado','«Ya lo tengo» lo deja Declarado: cuenta para los días. Con su misión pasa a Comprobado y da XP.'],['Tocar un nombre','Toca cualquier nombre subrayado para ver qué es.']);
/* Energía de cada persona según su actividad (EFSA 2013: PAL 1,4 / 1,6 / 1,8 / 2,0) */
const PAL7={'Sedentaria':1.4,'Moderada':1.6,'Activa':1.8,'Muy activa':2};
const kcalOf6=kcalOf;kcalOf=function(p){const r=kcalOf6(p);if(r.src==='formula'&&PAL7[p.actividad])r.kcal=Math.round(r.kcal/1.6*PAL7[p.actividad]/50)*50;return r};

/* ===================== Explicaciones al tocar ===================== */
const GLK=Object.keys(GL7);
function term(k,label){const i=GLK.indexOf(k);if(i<0)return esc(label||k);return `<button type="button" class="term" onclick="expl(${i})">${esc(label||GL7[k][0])}</button>`}
function expl(i){const g=GL7[GLK[i]];if(!g)return;ask(`<h2>${esc(g[0])}</h2><p>${esc(g[1])}</p>${g[2]?`<p class="sm"><a href="${esc(g[2][1])}" target="_blank" rel="noopener">${esc(g[2][0])} ↗</a></p>`:''}`,'Cerrar',null)}

/* ===================== Copia de seguridad y migración a la 7 ===================== */
function backupNow(motivo){try{LS.setItem(BKA,JSON.stringify({at:new Date().toISOString(),motivo,app:APPV,ver:D&&D.ver,data:D}));return true}catch(e){return false}}
function dlCopy(key){const raw=LS.getItem(key);if(!raw)return note('No hay copia guardada.');let x;try{x=JSON.parse(raw)}catch(e){return note('La copia está dañada.')}
 shareFile({app:'planb',ver:x.de??x.ver??0,av:x.app||APPV,fecha:x.at,data:x.data},'planb-copia-'+(key===BK7?'antes-de-7':'auto')+'-'+String(x.at||today()).slice(0,10)+'.json')}
function legacyQty(r){return num7(r.cantNum)||num7(r.cantidad)}
function migrate7(){const was=D.ver||0;
 D.mig7={de:was,at:today(),nivel:D.nivel,pasados:(D.pasados||[]).slice(),fin:!!D.fin};
 /* Nivel: nadie baja. El N1 de antes (72 h) es el N2 nuevo; el N4 de antes (3 meses) pasa al N4 nuevo. */
 if(D.hogar||D.misiones&&D.misiones.length){const o=+D.nivel||1;
  if(D.fin){D.nivel=4}else D.nivel=Math.min(4,o+1);
  const ps=new Set((D.pasados||[]).map(l=>Math.min(4,l+1)));for(let l=1;l<D.nivel;l++)ps.add(l);D.pasados=[...ps].filter(l=>D.fin||l<D.nivel).sort();}
 /* Misiones: cerrada con prueba válida → Comprobado; cerrada sin prueba → Declarado */
 (D.misiones||[]).forEach(m=>{const d=defK(m.key);if(d&&m.lvl!=null){m.lvl6=m.lvl;m.lvl=d.lv}
  if(!m.hecha||!d)return;const rows=linked(m.id);let ok;
  if(d.ty==='i')ok=rows.some(r=>validRow(r)&&legacyQty(r)>0);
  else if(d.ty==='s')ok=rows.some(r=>r.estado==='Aprendido');
  else ok=!(d.tm||[]).some(([k])=>!m.tiempos||!m.tiempos[k]||m.tiempos[k].best==null);
  m.est=ok?'Comprobado':'Declarado';if(ok)rows.forEach(r=>{if(validRow(r))r.est='Comprobado'})});
 /* Registro: nada se borra. Se añade la sección y el estado nuevo. */
 (D.registro||[]).forEach(r=>{if(!r.sec){r.sec=FR2SEC[r.frente]||'otros';r.legado=1;
   const t=(r.recurso||'').toLowerCase(),q=legacyQty(r);
   if(r.sec==='agua'&&r.unidad==='L'){r.kind='Envases';r.n=1;r.litros=q;r.potable=r.potable||'Sí'}
   else if(r.sec==='energia'&&r.unidad==='mAh'){r.kind='Batería portátil USB';r.mah=q}
   else if(r.sec==='energia'&&r.unidad==='Wh'){r.kind='Estación o batería grande';r.wh=q}
   else if(r.sec==='energia'&&/linterna|frontal|luz|lámpara|farol/.test(t)){r.kind='Aparato';r.grupo='Luz';r.n=q||1}
   else if(r.sec==='doc'&&/efectivo|dinero|billete/.test(t)){r.sec='dinero';r.kind='Efectivo'}
   else if(r.sec==='botiquin'&&/medic/.test(t)){r.sec='medic'}
   else if(r.sec==='otros'&&/repar|herramient/.test(t)){r.kind='Otro'}}
  if(!r.est)r.est=r.estado==='Deseo'?'Falta':'Declarado';
  if(r.estado==='Hecho'&&!legacyQty(r))r.sinCantidad=1});
 (D.personas||[]).forEach(p=>{if(!Array.isArray(p.meds))p.meds=[]});
 D.cfg=D.cfg||{};if(!D.cfg.cielo)D.cfg.cielo='a ratos';
 D.ver=7;D.v7={at:today()}}
const migrate6w=window.migrate;
window.migrate=function(){if(!D)return;const from=D.ver||0;if(from>=7){migrate6w();D.ver=Math.max(D.ver||0,from);return}
 const snap=JSON.stringify(D);
 try{LS.setItem(BK7,JSON.stringify({at:new Date().toISOString(),de:from,app:APPV,data:JSON.parse(snap)}))}catch(e){migErr='nobackup';D=JSON.parse(snap);return}
 try{if(window.__failMig7)throw new Error('prueba de fallo');migrate6w();if(migErr)return;migrate7();save()}catch(e){D=JSON.parse(snap);migErr='fail';try{LS.setItem(KEY,snap)}catch(_){}}};
const newD6=newD;newD=function(){const d=newD6();d.ver=7;d.v7={at:today()};d.cfg.cielo='a ratos';return d};

/* ===================== Datos solares (PVGIS) ===================== */
function pvOf(prov){const p=PV7[prov];if(!p)return null;if(!p._h){p._h=p[0].split(',').map(Number);p._t=p[1].split(',').map(Number);p._pr=p[2]?p[2].split(",").map(v=>v/1000):null}return p}
const SKY7={'sol':'Soleado','a ratos':'A ratos','nublado':'Nublado'};
function skyF(p,m,sky){const t=p._t.slice(m*4,m*4+4);if(!t[0])return 0;return sky==='sol'?t[1]/t[0]:sky==='nublado'?t[2]/t[0]:1}
function solar7(rows,prov,sky,date){date=date||new Date();const p=pvOf(prov),m=date.getMonth(),out={day:0,good:0,bad:0,now:0,rest:0,ok:!!p,prov};
 if(!p||!rows.length)return out;const pr=p._pr?p._pr[m]:PR_DEF,hU=date.getUTCHours(),frac=date.getUTCMinutes()/60;
 rows.forEach(r=>{const W=num7(r.w);if(!W)return;const t=p._t.slice(m*4,m*4+4),place=r.coloc==='No lo sé'?(t[0]?t[3]/t[0]:1):1;
  const prof=p._h.slice(m*24,m*24+24).map(g=>g*place*W/1000*pr);const k=skyF(p,m,sky);
  out.day+=prof.reduce((a,b)=>a+b,0)*k;out.good+=prof.reduce((a,b)=>a+b,0)*skyF(p,m,'sol');out.bad+=prof.reduce((a,b)=>a+b,0)*skyF(p,m,'nublado');
  out.now+=prof[hU]*k;out.rest+=(prof[hU]*(1-frac)+prof.slice(hU+1).reduce((a,b)=>a+b,0))*k});
 return out}

/* ===================== Refugio: días por sección ===================== */
const secOf=r=>r.sec||FR2SEC[r.frente]||'otros';
const porRev=r=>due(r)||expired(r);
const estOf=r=>porRev(r)?'Por revisar':r.est==='Falta'||r.estado==='Deseo'?'Falta':r.est==='Comprobado'?'Comprobado':'Declarado';
const cadPronto=r=>!!(r.caduca&&!expired(r)&&r.caduca<=plusM(today(),1));
const counts=r=>!r._del&&['Declarado','Comprobado'].includes(estOf(r))&&(!r.ubtipo||r.ubtipo==='Casa'||secOf(r)==='evac'||secOf(r)==='dinero');
function compat(f,p){const e=Array.isArray(f.etq)?f.etq:[];if(p.dieta==='Vegana'&&!e.includes('Vegano'))return false;if(p.dieta==='Vegetariana'&&!e.includes('Vegetariano')&&!e.includes('Vegano'))return false;
 return (Array.isArray(p.restr)?p.restr:[]).filter(x=>x!=='Ninguna').every(x=>e.includes(x))}
function refugio(only){const x=X(),lv=Math.min(D.nivel||1,4),goal=GOAL7(lv),RG=(D.registro||[]).filter(r=>counts(r)&&(!only||estOf(r)==='Comprobado')),S=sec=>RG.filter(r=>secOf(r)===sec);
 const s={};
 /* Energía */
 const E=S('energia'),pct=r=>r.carga===''||r.carga==null?1:Math.max(0,Math.min(100,num7(r.carga)))/100;
 let stWh=0,usbWh=0,luces=0;E.forEach(r=>{if(r.kind==='Estación o batería grande')stWh+=num7(r.wh)*pct(r);else if(r.kind==='Batería portátil USB')usbWh+=(num7(r.wh)||num7(r.mah)*3.7/1000)*pct(r);else if(r.kind==='Aparato'&&r.grupo==='Luz')luces+=num7(r.n)||1;
  else if(!r.kind&&r.unidad==='Wh')stWh+=legacyQty(r);else if(!r.kind&&r.unidad==='mAh')usbWh+=legacyQty(r)*3.7/1000});
 const usable=(stWh+usbWh)*(1-LOSS7),need=x.n?Math.max(1,x.moviles)*12+10:null;
 const sol=solar7(E.filter(r=>r.kind==='Placa solar'),D.hogar&&D.hogar.prov,(D.cfg&&D.cfg.cielo)||'a ratos'),solNet=sol.day*(1-LOSS7);
 const bal=need==null?null:solNet-need;
 s.energia={d:need?(bal!=null&&bal>=0&&solNet>0?Infinity:usable/(need-solNet)):null,usable,need,stWh,usbWh,sol,solNet,bal};
 /* Agua */
 let Lp=0,Ln=0,treat=0,hervir=false;S('agua').forEach(r=>{const L=r.kind==='Envases'?num7(r.n||1)*num7(r.litros):r.kind==='Depósito o aljibe'?num7(r.litros):!r.kind&&r.unidad==='L'?legacyQty(r):0;
  if(r.kind==='Potabilizar'){if(r.metodo==='Hervir')hervir=true;else treat+=num7(r.litrosTrat)}else if(r.potable==='No')Ln+=L;else Lp+=L});
 /* Cocina */
 const cks=S('cocina').map(r=>{const h=num7(r.horas)||1,c=num7(r.consumo),t=r.tipo||'';let d=0;
  if(/Bombona/.test(t)&&c)d=num7(r.n||1)*num7(r.peso)*1000/(c*h);else if(/Cartucho/.test(t)&&c)d=num7(r.n||1)*num7(r.peso)/(c*h);
  else if(/Vitro|Hornillo eléctrico|Microondas/.test(t)&&c)d=usable/(c*h);else if(num7(r.diasDecl))d=num7(r.diasDecl);return d});
 const ckD=cks.reduce((a,b)=>a+b,0);s.cocina={d:ckD};
 const canBoil=hervir&&ckD>0,Lt=Lp+(canBoil?Ln:Math.min(Ln,treat));
 s.agua={d:x.Lday?Lt/x.Lday:null,L:Lt,Lp,Ln,treat};
 /* Comida */
 const foods=S('comida').filter(r=>r.kind==='Alimento'),cookable=ckD>0,useF=foods.filter(f=>cookable||f.cocinar!=='Sí');
 const kc=f=>num7(f.n||1)*num7(f.kcal),pt=f=>num7(f.n||1)*num7(f.prot),sum=(a,f)=>a.reduce((s,r)=>s+f(r),0);
 const ppl=x.ppl||[],kNeed=x.kcal,pNeed=ppl.length&&ppl.every(q=>adulto(q.p)&&num7(q.p.peso)>0)?ppl.reduce((a,q)=>a+PROT_KG*num7(q.p.peso),0):null;
 const daysOf=(arr)=>{if(!kNeed)return null;let d=sum(arr,kc)/kNeed;ppl.forEach(q=>{if(!q.kcal)return;const c=arr.filter(f=>compat(f,q.p));if(c.length<arr.length)d=Math.min(d,sum(c,kc)/q.kcal)});
  if(pNeed){d=Math.min(d,sum(arr,pt)/pNeed)}return d};
 const legacy=S('comida').filter(r=>!r.kind),rac=legacy.filter(r=>r.unidad==='raciones (persona·día)').reduce((a,r)=>a+legacyQty(r),0),dh=legacy.filter(r=>r.unidad==='días (todo el hogar)').reduce((a,r)=>a+legacyQty(r),0),legD=(x.n?rac/x.n:0)+dh;
 const fd=daysOf(useF);s.comida={d:fd==null&&!legD?null:(fd||0)+legD,dNoCook:(daysOf(foods.filter(f=>f.cocinar!=='Sí'))||0),kNeed,pNeed,legD,protKnown:!!pNeed};
 const faltanGrupos=foods.length?GRUPOS7.slice(0,6).filter(g=>!foods.some(f=>f.grupo===g)):[];
 /* Higiene: lo esencial (toallitas o gel, váter de emergencia y papel) marca los días; regla de Plan B */
 const H=S('higiene'),hd=a=>Math.max(0,...H.filter(r=>a.includes(r.articulo)).map(r=>num7(r.dias)));
 s.higiene={d:H.length?Math.min(hd(['Toallitas húmedas','Gel sin aclarado']),hd(['Váter de emergencia y bolsas']),hd(['Papel higiénico'])):0};
 /* Medicación por persona */
 const meds=[];(D.personas||[]).forEach(p=>(p.meds||[]).forEach(m=>{if(m._del)return;const exp=m.caduca&&m.caduca<today();meds.push({p,m,d:exp?0:num7(m.dosis)>0?num7(m.unidades)/num7(m.dosis):0})}));
 const needMed=(D.personas||[]).some(p=>p.med==='Sí');
 s.medic={d:meds.length?Math.min(...meds.map(q=>q.d)):needMed?0:null,meds};
 /* Dinero */
 const eur=S('dinero').reduce((a,r)=>a+(num7(r.importe)||legacyQty(r)),0),gd=num7(D.hogar&&D.hogar.gastoDia);
 s.dinero={d:gd&&x.n?eur/(gd*x.n):null,eur,gd};
 const bot=S('botiquin').map(r=>r.elemento||r.recurso),com=S('com').map(r=>r.opcion||'');
 const docs=S('doc').filter(r=>r.documento&&r.documento!=='Contactos clave en papel'),plan=typeof planHogar==='function'?planHogar()||{}:{};
 const ev=S('evac'),R={goal,lv,s,luces,usbWh,stWh,solarWh:solNet,solarBal:bal==null?-1:bal,bot,com,
  potab:S('agua').some(r=>r.kind==='Potabilizar'),faltanGrupos,
  contactosPapel:S('doc').some(r=>r.documento==='Contactos clave en papel'&&r.papel==='Sí')||ans(plan.nota),
  docsOk:docs.length>0&&docs.every(r=>r.papel==='Sí'&&r.digital==='Sí'),
  mochilas:new Set(ev.filter(r=>r.kind==='Mochila').map(r=>r.persona||r.id)).size,rutaProbada:ev.some(r=>r.kind==='Ruta'&&r.probada),destino:ev.some(r=>r.kind==='Destino'),
  puntoExt:ans(plan.punto1)&&ans(plan.ext),reparar:S('otros').some(r=>/repar|herramient|manten/i.test(r.recurso||''))};
 return R}
autonomy=function(){const x=X(),R=refugio();return{x,L:R.s.agua.L,agua:R.s.agua.d,comida:R.s.comida.d,rac:0,dh:0,wh:R.s.energia.usable,energia:R.s.energia.d,eNeed:R.s.energia.need}};
const kitFor=(lv,R,x)=>KIT7.filter(k=>k[0]===lv).map(k=>({lv,sec:k[1],t:k[2],g:k[3],ok:k[4](R,x)})).filter(k=>k.ok!==null);

/* ===================== «Tú»: XP de lo demostrado ===================== */
function addA(acc,d,v){const w=d.a.length>1?[.6,.4]:[1];d.a.forEach((a,i)=>Object.entries(AMAP7[a]||{}).forEach(([k,f])=>{acc[k]=(acc[k]||0)+v*w[i]*f}))}
const hasQty=r=>legacyQty(r)>0||['n','litros','wh','mah','importe','w','kcal'].some(k=>num7(r[k])>0);
mXP=function(m,d){const out={a:{},f:0,frozen:0,fac:0,needSk:[],est:null};if(!m||!d)return out;
 let tv=0;(d.tm||[]).forEach(t=>{tv+=tmVal(t,m.tiempos&&m.tiempos[t[0]])});if(tv){out.a.rsp=tv;out.f+=tv}
 if(!m.hecha)return out;const fk=misFichas(d.k),skOkAll=fk.every(skVigente);out.needSk=fk.filter(k=>!skVigente(k));
 const rows=linked(m.id),B=XPB[d.ty];let fac=0;
 if(d.ty==='i'){const ok=rows.filter(r=>validRow(r)&&hasQty(r));if(ok.length)fac=1;else if(rows.some(porRev)){out.frozen=B;out.est='Por revisar'}}
 else if(d.ty==='s'){if(rows.some(porRev)||fk.some(k=>{const s=skillOf(k);return s&&s.caducada})){out.frozen=B;out.est='Por revisar'}else if(skOkAll&&(rows.some(r=>r.estado==='Aprendido')||m.prueba))fac=1}
 else fac=1;
 if(!out.est)out.est=fac?'Comprobado':'Declarado';
 const v=B*fac;addA(out.a,d,v);out.f+=v;out.fac=fac;return out};
maxXP=function(lv,x){const a={},f={};levelDefs(lv,x).forEach(d=>{const v=XPB[d.ty];addA(a,d,v);f[d.f]=(f[d.f]||0)+v;(d.tm||[]).forEach(()=>{a.rsp=(a.rsp||0)+TXP})});
 reqFor(lv).filter(k=>!reqFor(lv-1).includes(k)).forEach(k=>{a.hab=(a.hab||0)+SKXP});return{a,f}};
score=function(){const x=X(),A={},F={};let frozen=0;ATR.forEach(([k])=>A[k]=0);FR.forEach(([k])=>F[k]=0);const rev=[];
 D.misiones.forEach(m=>{const d=defK(m.key);if(!d||!visible(d,x)||!d.lv)return;const r=mXP(m,d);Object.entries(r.a).forEach(([k,v])=>A[k]=(A[k]||0)+v);F[d.f]+=r.f;frozen+=r.frozen;if(r.est==='Por revisar')rev.push(d.t)});
 const sk=skillXP();A.hab+=sk.v;frozen+=sk.frozen;const cu=courseXP();A.hab+=cu.v;
 const seen=new Set();(D.aver||[]).forEach(q=>{const k=q.id||q.l||JSON.stringify(q);if(seen.has(k))return;seen.add(k);A.res+=5});
 const ex=extraXP();Object.entries(ex.a).forEach(([k,v])=>Object.entries(AMAP7[k]||{[k]:1}).forEach(([kk,f])=>{if(A[kk]!=null)A[kk]+=v*f}));
 const AM={};ATR.forEach(([k])=>AM[k]=Math.round(A[k]));
 const lv=D.fin?4:Math.min(D.nivel,4),cumA={},cumF={};let lo=0,hi=0;
 for(let l=1;l<=lv;l++){const mx=maxXP(l,x),tot=Object.values(mx.a).reduce((s,v)=>s+v,0);if(l<lv)lo+=tot;hi+=tot;Object.entries(mx.a).forEach(([k,v])=>cumA[k]=(cumA[k]||0)+v);Object.entries(mx.f).forEach(([k,v])=>cumF[k]=(cumF[k]||0)+v)}
 const min={};ATR.forEach(([k])=>min[k]=Math.round(.4*(cumA[k]||0)));
 Object.keys(A).forEach(k=>A[k]=Math.round(A[k]));Object.keys(F).forEach(k=>F[k]=Math.round(F[k]));
 const block=ATR.filter(([k])=>AM[k]<min[k]).map(([k])=>k),req=reqMissing(lv),T=ATR.reduce((s,[k])=>s+A[k],0);
 const fr=hi>lo?Math.max(0,Math.min(1,(T-lo)/(hi-lo))):1,cuts=[0,.2,.45,.7];let ri=0;cuts.forEach((q,i)=>{if(fr>=q)ri=i});
 const next=ri<3?Math.max(1,Math.ceil(lo+cuts[ri+1]*(hi-lo)-T)):0;
 return{A,AM,F,T,min,block,req,cumA,cumF,ri,next,frozen:Math.round(frozen),lv,rev}};

/* ===================== Subir de nivel: «Te falta para subir:» ===================== */
function falta7(L){const x=X(),R=refugio(),S=score(),f=[],goal=GOAL7(L),dd=(k,lab,min)=>{const d=R.s[k].d;if(d!=null&&d<goal&&!(min&&min()))f.push([`${lab}: ${fmtN(d)} de ${goal} días`,`sec7='${k}';go('r')`])};
 dd('agua','Agua');dd('comida','Comida');dd('energia','Energía');if(R.s.medic.d!=null)dd('medic','Medicación');
 if(L>=2){dd('cocina','Cocina',()=>R.s.comida.dNoCook>=goal);dd('higiene','Higiene');if(R.s.dinero.d==null)f.push(['Dinero: pon el gasto básico diario',"sec7='dinero';go('r')"]);else dd('dinero','Dinero')}
 if(R.s.agua.d==null)f.push(['Agua: faltan las personas del hogar',"go('f')"]);if(R.s.comida.d==null)f.push(['Comida: falta la edad de cada persona',"go('f')"]);
 for(let l=1;l<=L;l++)kitFor(l,R,x).filter(k=>!k.ok).forEach(k=>{if(!f.some(q=>q[0].startsWith(SECN7[k.sec])&&/días/.test(q[0])))f.push([`Kit N${l}: ${k.t}`,`sec7='${k.sec}';go('r')`])});
 S.req.forEach(k=>f.push(['Habilidad: '+fichaDef(k).t,`go('g');gs('como');gfic='${k}';render()`]));
 S.block.forEach(k=>f.push([`${ATRN[k]}: ${S.AM[k]} de ${S.min[k]} XP`,"go('n')"]));
 const ex=levelDefs(L,x).find(d=>d.ty==='x');if(ex&&!isDone(ex.k))f.push(['Examen: '+ex.t,`viewKey='${ex.k}';tab='m';render()`]);
 const dr=dueRows();if(dr.length)f.push([`Por revisar: ${dr.length} en el registro`,"go('m')"]);S.rev.forEach(t=>f.push(['Por revisar: '+t,"go('m')"]));
 skList().forEach(fi=>{const s=skillOf(fi.k);if(s&&s.caducada&&s.estado!=='Aprendido')f.push(['Por revisar: '+fi.t,`go('g');gs('como');gfic='${fi.k}';render()`])});
 return f}
checkLevel=function(){if(!D||!D.hogar)return false;if(D.fin){if(D.n5on&&!D.n5&&N5C.every(([k])=>D.n5c&&D.n5c[k]))D.n5=today();return false}
 const L=Math.min(D.nivel,4);if(falta7(L).length)return false;D.pasados=[...new Set([...(D.pasados||[]),L])];if(L>=4)D.fin=true;else D.nivel=L+1;return true};
const activeDef6=activeDef;activeDef=function(){if(D.fin){if(!D.n5on)return null;const x=X();return levelDefs(5,x).find(d=>!isDone(d.k))||null}return activeDef6()};
header=function(){$('#sub').textContent=D&&D.hogar&&!wz?(D.fin?(D.n5?'Autosuficiente':'Nivel 4 · completo'):`Nivel ${D.nivel} · ${NIV7[D.nivel-1].t}`):''};

/* ===================== Panel ===================== */
const ARW={pos:['↑','pos'],eq:['=','eq'],neg:['↓','neg']};
function balHtml(b){if(b==null)return '';const k=b>5?'pos':b<-5?'neg':'eq',[a,c]=ARW[k];return `<span class="bal ${c}" aria-label="Balance ${k==='pos'?'positivo':k==='neg'?'negativo':'justo'}">${a} ${b>0?'+':''}${Math.round(b)} Wh/día</span>`}
function refugioHtml(){const R=refugio(),Rc=refugio(true),g=R.goal,x=X();
 const line=(k,lab,txt,ok)=>`<li><span>${term(k==='medic'?'medicacion':k==='energia'?'wh':k==='agua'?'potable':k==='comida'?'kcal':k==='cocina'?'cocinaSinRed':k==='higiene'?'higieneSeco':k==='dinero'?'efectivo':'refugio',lab)}</span><button type="button" class="gh sm" onclick="sec7='${k}';go('r')">${txt}</button><b>${ok==null?'':ok?'✓':'▲'}</b></li>`;
 const dl=k=>{const d=R.s[k].d;return d==null?[null,'sin datos']:[d>=g,`${fmtN(d)} de ${g} días`+(Rc.s[k].d?` (${fmtN(Math.min(d,Rc.s[k].d))} comprobado)`:'')]};
 const ks=[['agua','Agua'],['comida','Comida'],['energia','Energía'],['medic','Medicación']].concat(R.lv>=2?[['cocina','Cocina'],['higiene','Higiene'],['dinero','Dinero']]:[]);
 const kit=[];for(let l=1;l<=R.lv;l++)kitFor(l,R,x).forEach(k=>kit.push(k));const kok=kit.filter(k=>k.ok).length;
 const E=R.s.energia;
 return `<section class="card" aria-labelledby="ref7"><h2 class="k" id="ref7">${term('refugio','Refugio')} · objetivo ${g} día${g>1?'s':''}</h2><ul class="ref7">${ks.map(([k,l])=>{const[o,t]=dl(k);return line(k,l,t,o)}).join('')}</ul>
 ${E.sol.ok&&E.solNet?`<p class="xs">${term('placa','Placas')}: ${Math.round(E.solNet)} Wh/día con cielo ${term('cielo',SKY7[D.cfg.cielo||'a ratos'].toLowerCase())} ${balHtml(E.bal)}</p>`:''}
 <p class="xs mut">Kit por nivel: ${kok} de ${kit.length}. ${term('declarado','Declarado')} cuenta para los días; ${term('comprobado','Comprobado')} además da XP.</p></section>`}
function faltaHtml(){if(D.fin)return '';const f=falta7(Math.min(D.nivel,4));if(!f.length)return `<section class="card"><div class="k">Nivel ${D.nivel}</div><p class="sm">Lo tienes todo para subir.</p><button type="button" class="btn sm" onclick="if(checkLevel()){save();render();note('Nivel superado.')}">Subir de nivel</button></section>`;
 return `<section class="card dash"><h2 class="k">Te falta para subir:</h2><ul class="ul0 f7">${f.slice(0,8).map(([t,go])=>`<li><button type="button" class="link" onclick="${go}">${esc(t)}</button></li>`).join('')}</ul>${f.length>8?`<p class="xs mut">Y ${f.length-8} más en Niveles.</p>`:''}</section>`}
const Vp6=V.p;V.p=function(){let h=Vp6();
 h=h.replace(/<section class="card" aria-labelledby="frt">[\s\S]*?<\/section>/,refugioHtml()+faltaHtml()).replace(/<section class="card" aria-labelledby="aut">[\s\S]*?<\/section>/,'')
  .replace('id="att">Atributos</h2>','id="att">«Tú» · áreas</h2>').replace('el mínimo en los seis (línea discontinua)','el mínimo en las cuatro áreas (línea discontinua)');
 let pre='';const mg=D.mig7;if(mg&&!D.cfg.mig7Ok)pre+=`<section class="card inv"><div class="k">Plan B ${APPV}</div><p class="sm"><b>Tus datos se han pasado a la versión nueva.</b> Antes se guardó una copia completa en este móvil. No se ha borrado nada.</p><p class="xs">Nivel: el ${mg.nivel||1} de antes es ahora el ${D.nivel} (la escalera nueva empieza en 24 h). Nadie baja de nivel.</p><div class="row"><button type="button" class="gh inv sm" onclick="dlCopy('${BK7}')">Descargar la copia</button><button type="button" class="gh inv sm" onclick="D.cfg.mig7Ok=1;save();render()">Entendido</button></div></section>`;
 if(upd7.msg)pre+=`<section class="card" role="status"><p class="sm">${esc(upd7.msg)}</p></section>`;
 return h.replace('<h1 class="sr">Panel</h1>','<h1 class="sr">Panel</h1>'+pre).replace(/Cierra Plan B del todo y vuelve a abrirla\.<\/p>/,'</p><button type="button" class="btn sm" onclick="checkUpd()">Actualizar</button>')};

/* ===================== Registro por secciones ===================== */
const kindsOf=s=>Object.keys((F7[s]||F7.otros).kinds);
function optList(o,r){if(o==='@per')return [['hogar','Hogar'],...(D.personas||[]).map((p,i)=>[p.id,pname(p,i)])];
 if(o==='@bat')return (D.registro||[]).filter(q=>q.sec==='energia'&&['Estación o batería grande','Batería portátil USB'].includes(q.kind)).map(q=>[q.id,q.recurso||q.kind]);
 if(o==='@com')return COM7.map(c=>[c,c]);return o.map(v=>[v,v])}
function rowSum(r){const s=secOf(r),k=r.kind,v=[];
 if(s==='agua'){if(k==='Envases')v.push(`${r.n||1} × ${r.litros||'?'} L`,r.potable==='No'?'no potable':'potable');else if(k==='Depósito o aljibe')v.push(`${r.litros||'?'} L`);else if(k==='Potabilizar')v.push(r.metodo||'',r.litrosTrat?r.litrosTrat+' L':'')}
 else if(s==='comida'&&k==='Alimento')v.push(`${r.n||1} envase${(r.n||1)>1?'s':''}`,r.kcal?r.kcal+' kcal c/u':'',r.prot?r.prot+' g proteína c/u':'',r.grupo||'',r.cocinar==='Sí'?'hay que cocinarlo':'',(r.etq||[]).join(', '));
 else if(s==='energia')v.push(r.wh?r.wh+' Wh':'',r.mah?r.mah+' mAh':'',r.w?r.w+' W':'',r.n&&k!=='Pilas'?r.n+' ud.':'',k==='Pilas'?`${r.n||'?'} pilas ${r.tipoPila||''}`:'',r.grupo||'',r.conex||'',r.coloc||'',r.subio?'prueba: subió '+r.subio+' Wh':'');
 else if(s==='cocina')v.push(r.tipo||'',r.n?r.n+' ud.':'',r.peso?r.peso+(/Cartucho/.test(r.tipo||'')?' g':' kg'):'',r.consumo?r.consumo+(/Bombona|Cartucho/.test(r.tipo||'')?' g/h':' W'):'');
 else if(s==='higiene')v.push(r.articulo||'',r.dias?r.dias+' días':'');
 else if(s==='botiquin')v.push(r.cant?r.cant+' ud.':'');
 else if(s==='com')v.push(r.canal||'');
 else if(s==='doc')v.push(r.papel==='Sí'?'papel':'sin papel',r.digital==='Sí'?'digital':'sin digital',r.original?'original: '+r.original:'');
 else if(s==='dinero')v.push((r.importe||legacyQty(r))+' €',r.donde||'');
 else if(s==='evac')v.push(r.modo||'',r.probada?'probada '+fmtD(r.probada):'',r.pesoKg?r.pesoKg+' kg':'');
 if(r.legado&&!r.kind)v.push((r.cantNum?r.cantNum+' '+(r.unidad||''):r.cantidad||''));
 return v.filter(Boolean).join(' · ')}
function medsHtml(){const ps=D.personas||[];if(!ps.length)return '<p class="sm mut">Añade primero las personas en Perfil.</p>';
 return ps.map((p,i)=>`<article class="card"><div class="row sb"><h3 class="h3">${esc(pname(p,i))}</h3>${isMine(p)?`<button type="button" class="gh sm" onclick="medEdit('${p.id}')">+ Medicación</button>`:''}</div>${(p.meds||[]).filter(m=>!m._del).map((m,j)=>{const d=num7(m.dosis)?num7(m.unidades)/num7(m.dosis):0;return `<div class="rv"><div><b>${esc(m.nombre||'Medicación')}</b><span class="xs mut db">${fmtN(d)} días · ${esc(m.dosis||'?')} al día · ${esc(m.unidades||'?')} unidades${m.caduca?' · caduca '+fmtD(m.caduca):''}</span></div>${isMine(p)?`<button type="button" class="gh sm" onclick="medEdit('${p.id}',${j})">Editar</button>`:''}</div>`}).join('')||`<p class="xs mut">${p.med==='Sí'?'Toma medicación diaria: apúntala para calcular los días.':'Sin medicación apuntada.'}</p>`}<p class="xs mut">🔒 Privada: no se comparte salvo que su dueño marque «Salud» al compartir.</p></article>`).join('')}
function medEdit(pid,j){const p=D.personas.find(q=>q.id===pid);if(!p)return;p.meds=p.meds||[];const m=j==null?{}:p.meds[j];
 $('#nav').hidden=true;document.body.classList.add('nonav');
 $('#v').innerHTML=`<section class="form"><div class="k">Medicación · ${esc(pname(p,D.personas.indexOf(p)))}</div><h1 class="h2">${j==null?'NUEVA':'EDITAR'}</h1>
 <label for="m_nombre">Nombre</label><input id="m_nombre" value="${esc(m.nombre||'')}"><label for="m_dosis">Unidades al día</label><input id="m_dosis" type="number" inputmode="decimal" step="any" min="0" value="${esc(m.dosis||'')}">
 <label for="m_unidades">Unidades que tienes</label><input id="m_unidades" type="number" inputmode="decimal" step="any" min="0" value="${esc(m.unidades||'')}"><label for="m_caduca">Caducidad</label><input id="m_caduca" type="date" value="${esc(m.caduca||'')}">
 <p class="xs mut">Plan B no da consejos de dosis: habla con tu médico o farmacéutico.</p><div class="row end">${j!=null?`<button type="button" class="gh" onclick="medDel('${pid}',${j})">Borrar</button>`:''}<button type="button" class="gh" onclick="render()">Cancelar</button><button type="button" class="btn" onclick="medSv('${pid}',${j??'null'})">Guardar</button></div></section>`}
function medSv(pid,j){const p=D.personas.find(q=>q.id===pid),m={};['nombre','dosis','unidades','caduca'].forEach(k=>m[k]=$('#m_'+k).value.trim());if(!m.nombre)return note('Falta el nombre.');
 if(j==null)p.meds.push(m);else p.meds[j]=Object.assign(p.meds[j],m);touch(p);save();checkLevel();save();render();note('Guardado.')}
function medDel(pid,j){const p=D.personas.find(q=>q.id===pid);p.meds.splice(j,1);touch(p);save();render()}
V.r=function(){const s=sec7,rows=D.registro.map((r,i)=>[r,i]).filter(([r])=>secOf(r)===s);
 let h=`<h1 class="sr">Registro</h1><div class="chips7" role="tablist">${SEC7.map(([k,l])=>`<button type="button" role="tab" aria-selected="${k===s}" class="${k===s?'on':''}" onclick="sec7='${k}';render()">${l}</button>`).join('')}</div>`;
 const R=refugio(),d=R.s[s];if(d&&d.d!==undefined)h+=`<p class="sm">${term(s==='medic'?'medicacion':'refugio',SECN7[s])}: <b>${d.d==null?'sin datos':fmtN(d.d)+' de '+R.goal+' días'}</b></p>`;
 if(s==='medic')return h+medsHtml();
 if(s==='energia')h+=energiaHtml(R);if(s==='dinero')h+=`<div class="card"><label for="g_dia">${term('gastoDia','Gasto básico diario por persona (€)')}</label><input id="g_dia" type="number" inputmode="decimal" min="0" step="any" value="${esc(D.hogar.gastoDia||'')}" onchange="D.hogar.gastoDia=this.value;touch(D.meta.hogar||(D.meta.hogar={}));save();render()"><p class="xs mut">${R.s.dinero.d==null?'':`Tienes ${R.s.dinero.eur} €: ${fmtN(R.s.dinero.d)} días.`} Objetivo: personas × gasto × días del nivel, desde N2 (${PB}).</p></div>`;
 if(s==='comida'){const c=R.s.comida;h+=`<p class="xs mut">Días = el menor entre los días por kcal y los días por proteína${c.protKnown?'':' (la proteína se calcula cuando todas las personas son adultas y tienen peso)'}. ${c.legD?'Incluye '+fmtN(c.legD)+' días de filas antiguas en raciones: pásalas a envases. ':''}${R.faltanGrupos.length?'Faltan grupos: '+esc(R.faltanGrupos.join(', '))+'.':''}</p>`}
 h+=`<div class="row">${kindsOf(s).map(k=>`<button type="button" class="btn sm" onclick="edit7('${s}',null,'${esc(k)}')">+ ${esc(k)}</button>`).join('')}</div>`;
 if(!rows.length)return h+`<div class="card center"><p class="sm mut">Nada apuntado en ${esc(SECN7[s])}.</p></div>`;
 return h+rows.map(([r,i])=>{const e=estOf(r),bad=e==='Por revisar';return `<article class="card ${bad?'inv':''}"><div class="row sb"><h3 class="h3">${esc(r.recurso||r.kind||'—')}</h3><span class="led">${term(e==='Por revisar'?'porRevisar':e==='Comprobado'?'comprobado':'declarado',e)}</span></div>
  <p class="xs">${esc(rowSum(r))}${cadPronto(r)?' · '+term('cadPronto','Caduca pronto'):''}${r.caduca?' · caduca '+fmtD(r.caduca):''}</p>${r.legado&&!r.kind?'<p class="xs mut">Fila de antes de la 7.0.0: edítala para pasarla al formulario nuevo.</p>':''}${r.sinCantidad?'<p class="xs mut">Sin cantidad: no da XP hasta que la pongas.</p>':''}
  ${!isMine(r)?'<p class="xs mut">Personal de otra persona · solo lectura</p>':`<div class="row"><button type="button" class="gh sm" onclick="edit7('${s}',${i})">Editar</button>${due(r)&&!expired(r)?`<button type="button" class="gh sm" onclick="revisado(${i})">Revisado hoy</button>`:''}<button type="button" class="gh sm" onclick="del(${i})">Borrar</button></div>`}</article>`}).join('')};
function energiaHtml(R){const E=R.s.energia,x=X(),provs=Object.keys(PV7),cur=D.hogar.prov||'',sky=D.cfg.cielo||'a ratos';
 const devs=(D.registro||[]).filter(r=>counts(r)&&r.sec==='energia'&&r.kind==='Aparato'),usb=E.usbWh*(1-LOSS7),st=E.stWh*(1-LOSS7);
 const hrs=r=>{const W=num7(r.w);if(!W)return '—';const c=r.conex||'';const wh=/USB/.test(c)?usb+st:/230|12 V/.test(c)?st:null;return wh==null?(c?'con su batería o pilas':'—'):fmtN(wh/W)+' h'};
 const grp={};devs.forEach(r=>{const g=r.grupo||'Otros';grp[g]=(grp[g]||0)+num7(r.w)*(num7(r.n)||1)});
 let h=`<div class="card"><p class="xs">${term('estacion','Estaciones')}: ${Math.round(E.stWh)} Wh · ${term('bateriaUSB','Baterías USB')}: ${Math.round(E.usbWh)} Wh (aparte: solo cargan USB) · ${term('perdidas','pérdidas')} 15 % · ${term('consumoBasico','consumo básico')}: ${E.need??'—'} Wh/día</p>`;
 if(devs.length)h+=`<table class="tbl"><thead><tr><th scope="col">Aparato</th><th scope="col">W</th><th scope="col">Dura</th></tr></thead><tbody>${devs.map(r=>`<tr><th scope="row">${esc(r.recurso||r.grupo||'Aparato')}</th><td>${esc(r.w||'?')}</td><td>${hrs(r)}</td></tr>`).join('')}${Object.entries(grp).map(([g,w])=>`<tr><th scope="row">Grupo · ${esc(g)}</th><td>${w}</td><td>${w?fmtN(st/w)+' h':'—'}</td></tr>`).join('')}</tbody></table>`;
 h+=`<label for="pv_prov">Provincia (para el sol, ${term('pvgis','PVGIS')})</label><select id="pv_prov" onchange="D.hogar.prov=this.value;save();render()"><option value="">— Elige —</option>${provs.map(p=>`<option ${p===cur?'selected':''}>${esc(p)}</option>`).join('')}</select>
 <div class="k" style="margin-top:10px">${term('cielo','Cielo')}</div><div class="chips7">${Object.entries(SKY7).map(([k,l])=>`<button type="button" class="${k===sky?'on':''}" aria-pressed="${k===sky}" onclick="D.cfg.cielo='${k}';save();render()">${l}</button>`).join('')}</div>`;
 if(E.sol.ok&&(D.registro||[]).some(r=>counts(r)&&r.kind==='Placa solar')){const s=E.sol;h+=`<p class="sm">Ahora: ${Math.round(s.now)} W · queda hoy: ${Math.round(s.rest)} Wh · día con este cielo: ${Math.round(s.day)} Wh · día bueno: ${Math.round(s.good)} Wh · día malo: ${Math.round(s.bad)} Wh</p><p class="sm">${term('balance','Balance')}: ${balHtml(E.bal)}${E.bal!=null&&E.bal<0&&E.d!=null&&isFinite(E.d)?` · con este cielo la batería se vacía en ${fmtN(E.d)} días`:''}</p><p class="xs mut">${sky==='a ratos'&&!D.cfg.cieloMarcado?'Cielo «a ratos» por defecto. ':''}Cifras orientativas: valores medios publicados por PVGIS (Comisión Europea) para ${esc(cur)}, con 14 % de pérdidas del sistema y 15 % de carga.</p>`}
 else if(!cur)h+='<p class="xs mut">Elige tu provincia para calcular lo que dan tus placas.</p>';
 return h+'</div>'}
function edit7(s,i,kind,mid){const r=i==null?{sec:s,kind}:D.registro[i];kind=kind||r.kind||kindsOf(s)[0];const flds=((F7[s]||F7.otros).kinds[kind])||[];
 const opts=D.misiones.filter(q=>{const d=defK(q.key);return d&&d.ty==='i'}).map(q=>`<option value="${q.id}" ${+(r.mision??mid)===q.id?'selected':''}>N${defK(q.key).lv} · ${esc(defK(q.key).t)}</option>`).join('');
 const fld=([k,l,o,g,opt])=>{const id='e_'+k,v=r[k]??'',lab=`<label for="${id}">${esc(l)}${opt?' · opcional':''}</label>${g&&g[0]!=='@'?' '+term(g,'¿Qué es?'):''}`;
  if(opt==='multi'||k==='etq')return `<fieldset class="q"><legend class="k">${esc(l)}</legend>${g?term(g,'¿Qué es?'):''}${o.map((x,j)=>`<label class="chk1"><input type="checkbox" name="${id}" value="${esc(x)}" ${(Array.isArray(v)?v:[]).includes(x)?'checked':''}> ${esc(x)}</label>`).join('')}</fieldset>`;
  if(typeof o==='string'&&o[0]==='@'||Array.isArray(o)){const L=Array.isArray(o)?o.map(x=>[x,x]):optList(o,r);return lab+`<select id="${id}"><option value="">— Elige —</option>${L.map(([a,b])=>`<option value="${esc(a)}" ${String(v)===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select>${g==='@com'?'<p class="xs mut" id="e_opc_x"></p>':''}`}
  return lab+`<input id="${id}" type="${o==='date'?'date':o==='num'?'number':'text'}" ${o==='num'?'inputmode="decimal" step="any" min="0"':''} value="${esc(v)}">`};
 $('#nav').hidden=true;document.body.classList.add('nonav');
 $('#v').innerHTML=`<section class="form" aria-labelledby="et"><div class="k">${esc(SECN7[s]||'Registro')} · ${esc(kind)}</div><h1 class="h2" id="et">${i==null?'NUEVO':'EDITAR'}</h1>
 ${kindsOf(s).length>1&&i==null?`<div class="chips7">${kindsOf(s).map(k=>`<button type="button" class="${k===kind?'on':''}" onclick="edit7('${s}',null,'${esc(k)}',${mid??'null'})">${esc(k)}</button>`).join('')}</div>`:''}
 <label for="e_recurso">Nombre</label><input id="e_recurso" value="${esc(r.recurso||'')}" placeholder="Cómo lo llamas en casa">${flds.map(fld).join('')}
 <label for="e_ubicacion">Dónde está · opcional</label><input id="e_ubicacion" value="${esc(r.ubicacion||'')}">
 <label for="e_mision">Misión que prueba · opcional</label><select id="e_mision"><option value="">— Ninguna —</option>${opts}</select>
 <p class="xs mut">«Ya lo tengo» lo deja ${term('declarado','Declarado')}: cuenta para los días. Pasa a ${term('comprobado','Comprobado')} con su misión.</p>
 <div class="row end"><button type="button" class="gh" onclick="render()">Cancelar</button><button type="button" class="btn" onclick="sv7('${s}',${i??'null'},'${esc(kind)}')">Ya lo tengo</button></div></section>`;
 const sel=$('#e_opcion');if(sel){const up=()=>{const g=GL7[sel.value];$('#e_opc_x').textContent=g?g[1]:''};sel.onchange=up;up()}window.scrollTo(0,0)}
function sv7(s,i,kind){const old=i==null?{}:D.registro[i],r=Object.assign({},old),flds=((F7[s]||F7.otros).kinds[kind])||[];
 r.sec=s;r.kind=kind;r.frente=SEC2FR[s]||'seg';r.recurso=$('#e_recurso').value.trim();r.ubicacion=$('#e_ubicacion').value.trim();
 flds.forEach(([k,,o])=>{if(k==='etq'){r[k]=[...document.querySelectorAll('input[name="e_'+k+'"]:checked')].map(e=>e.value);return}const el=$('#e_'+k);if(el)r[k]=o==='num'?(el.value===''?'':num7(el.value)):el.value.trim()});
 if(!r.recurso)r.recurso=r.elemento||r.opcion||r.articulo||r.documento||r.tipo||r.metodo||(r.grupo?r.grupo:'')||kind;
 const main=['n','litros','wh','mah','importe','w','dias','cant','unidades'].map(k=>num7(r[k])).find(v=>v>0);if(main)r.cantNum=String(main);
 const mi=$('#e_mision').value;r.mision=mi?+mi:'';r.misionKey=mi?keyOfMid(+mi)||'':'';
 if(!r.estado||r.estado==='Deseo')r.estado='Tengo';if(!r.est||r.est==='Falta')r.est='Declarado';if(!r.confirmado)r.confirmado=today();
 if(s==='energia'&&kind==='Placa solar'&&num7(r.subio)>0&&r.fechaPrueba)r.est='Comprobado';
 if(!r.revision||r.revision<=today())r.revision=revDefault(r);delete r.legado;if(main)delete r.sinCantidad;if(!r.id)r.id=uid();touch(r);
 if(i==null)D.registro.push(r);else D.registro[i]=r;save();checkLevel();save();render();note('Guardado.')}
const edit6=edit;edit=function(i,mid){if(i!=null&&D.registro[i])return edit7(secOf(D.registro[i]),i);if(mid!=null){const m=D.misiones.find(q=>q.id===mid),d=m&&defK(m.key);return edit7(d?SEC2FR_inv(d.f):'otros',null,null,mid)}return edit7(sec7,null)};
const SEC2FR_inv=f=>FR2SEC[f]||'otros';
const completar6=completar;completar=async function(id){const m=D.misiones.find(q=>q.id===id),d=m&&defK(m.key);
 if(d&&d.ty==='s'&&!misFichas(d.k).length&&!m.hecha){const t=prompt('Ya lo he hecho. Cuenta en una línea qué hiciste y cuándo (es la comprobación):','');if(!t||t.trim().length<5){note('Hace falta la comprobación para que cuente.');return}m.prueba={t:t.trim(),fecha:today()}}
 await completar6(id);const mm=D.misiones.find(q=>q.id===id);if(mm&&mm.hecha){const r=mXP(mm,defK(mm.key));mm.est=r.est;if(r.est==='Comprobado')linked(id).forEach(q=>{if(validRow(q)){q.est='Comprobado';touch(q)}});save();render()}};
xpRows=function(d){const B=XPB[d.ty],a={};addA(a,d,B);const r=Object.entries(a).filter(([,v])=>v>0).map(([k,v])=>[ATRN[k],'—','+'+Math.round(v)]);if(!r.length)r.push(['Refugio · días','—','sin XP']);if(d.tm)r.push(['Respuesta · tiempos','—','hasta +'+TXP*d.tm.length]);return r};
const Vm6=V.m;V.m=function(){return Vm6().replace('Atributo / frente','Área de «Tú»').replace(/<th scope="col">Tengo<\/th>/,'<th scope="col"><span class="sr">Declarado</span></th>').replace(/>Aprendido<\/th>/,'>Comprobado</th>').replace(/>Lo he hecho yo<\/button>/g,'>Lo he probado</button>').replace('Lo he hecho yo · completar','Ya lo he hecho').replace(/>Completar misión</,'>Lo he probado · completar<')};

/* ===================== Niveles ===================== */
V.n=function(){const x=X(),S=score(),R=refugio(),ad=activeDef();
 return '<h1 class="sr">Niveles</h1>'+NIV7.map((L,i)=>{const lv=i+1,defs=levelDefs(lv,x),passed=lv<5?(D.pasados.includes(lv)||(D.fin&&lv===4)):!!D.n5,on=lv<5?lv===D.nivel&&!passed&&!D.fin:D.fin&&D.n5on&&!D.n5,dn=defs.filter(d=>isDone(d.k)).length;
  const src=L.s.map(k=>`<a class="xs" href="${esc(SRC7[k][1])}" target="_blank" rel="noopener">${esc(SRC7[k][0])} ↗</a>`).join(' · ');
  const kit=lv<5?kitFor(lv,R,x):[];
  return `<section class="card lvl ${on?'on':''} ${!on&&!passed?'lock':''}"><div class="row sb top"><div><div class="k">Nivel ${pad2(lv)} · ${passed?'Superado':on?'Activo':L.opt?'Opcional':'Bloqueado'}</div><h2 class="h2">${lv===5?term('nivel5',L.t.toUpperCase()):esc(L.t.toUpperCase())}</h2>${L.adv?`<span class="tag">${L.opt?'Opcional · objetivo de Plan B':'Avanzado · no oficial'}</span>`:''}</div><div class="n2">${dn}<span class="xs">/${defs.length}</span></div></div>
  <p class="sm">${esc(L.o)}</p><p class="xs mut">Base: ${esc(L.src)} ${src}</p>
  ${kit.length?`<div class="mins"><div class="k">Kit del nivel</div>${kit.map(k=>`<div class="${k.ok?'':'b'}"><span>${k.ok?'✓ ':'▲ '}${term(k.g,k.t)}</span><button type="button" class="gh sm" onclick="sec7='${k.sec}';go('r')">Ver</button></div>`).join('')}</div>`:''}
  ${on&&lv<5?`<div class="mins"><div class="k">Te falta para subir:</div>${falta7(lv).map(([t,g])=>`<div class="b"><span>▲ ${esc(t)}</span><button type="button" class="gh sm" onclick="${g}">Ir</button></div>`).join('')||'<p class="sm">Nada: puedes subir.</p>'}${ATR.map(([k,l])=>`<div class="${S.block.includes(k)?'b':''}"><span>${term(k,l)}</span><span>${S.AM[k]} / ${S.min[k]}</span></div>`).join('')}${reqHtml(lv)}<p class="xs mut">${term('rangos','Rangos')}: ${RANGOS.map((r,j)=>ROM[j]+' '+r).join(' · ')}.</p></div>`:''}
  ${lv===5?`<div class="mins"><div class="k">Criterios</div>${N5C.map(([k,t])=>{const c=D.n5c&&D.n5c[k];return `<div class="${c?'':'b'}"><span>${c?'✓ ':'▲ '}${esc(t)}${c?' · '+fmtD(c.fecha):''}</span>${D.fin&&D.n5on?`<button type="button" class="gh sm" onclick="n5Mark('${k}')">${c?'Quitar':'Comprobado'}</button>`:''}</div>`}).join('')}${D.fin&&!D.n5on?`<button type="button" class="btn sm" onclick="D.n5on=1;save();render()">Empezar el nivel opcional</button>`:''}${!D.fin?'<p class="xs mut">Se abre al completar el nivel 4.</p>':''}</div>`:''}
  <ol class="ml">${defs.map((d,j)=>{const m=inst(d.k),st=m&&m.hecha?(mXP(m,d).est==='Por revisar'?'congelada':'hecha'):ad&&ad.k===d.k?'activa':'';return `<li class="${st}"><button type="button" onclick="viewKey='${d.k}';tab='m';render();window.scrollTo(0,0)"><span class="num">${d.ty==='x'?'EX':pad2(j+1)}</span><span class="tt">${esc(d.t)}</span><span class="st">${st==='hecha'?'✓ '+(mXP(m,d).est==='Comprobado'?'comprobada':'declarada'):st==='activa'?'▶ activa':st==='congelada'?'por revisar':''}</span></button></li>`}).join('')}</ol></section>`}).join('')}
async function n5Mark(k){D.n5c=D.n5c||{};if(D.n5c[k]){delete D.n5c[k]}else{const t=prompt('Comprobación: cuenta en una línea cómo lo has demostrado.','');if(!t||t.trim().length<5)return note('Hace falta la comprobación.');D.n5c[k]={t:t.trim(),fecha:today()}}checkLevel();save();render()}

/* ===================== Versión y actualización con un toque ===================== */
async function checkUpd(force){upd7.msg='Buscando actualización…';upd7.stuck=false;render();let v=null;
 try{const r=await fetch('version.json?t='+Date.now(),{cache:'no-store'});v=(await r.json()).v}catch(e){}
 const reg=('serviceWorker'in navigator)?await navigator.serviceWorker.getRegistration().catch(()=>null):null;
 if(!v){upd7.msg='Sin conexión: no se puede comprobar ahora.';render();return}
 if(v===APPV&&!force){if(reg)reg.update().catch(()=>{});upd7.msg=`Ya tienes la última versión (${APPV})`;render();return}
 backupNow('antes de actualizar a '+v);sessionStorage.setItem('planbUpd',JSON.stringify({from:APPV,to:v}));
 if(!reg){location.reload();return}
 const skip=w=>{try{w.postMessage({type:'SKIP_WAITING'})}catch(e){}};
 reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')skip(reg.waiting||w)})});
 await reg.update().catch(()=>{});if(reg.waiting)skip(reg.waiting);
 setTimeout(()=>{if(!reloading7){upd7.msg=`Hay una versión nueva (${v}), pero no se ha podido cargar.`;upd7.stuck=true;render()}},12000)}
async function forceUpd(){if(!await ask('<h2>Forzar actualización</h2><p>Se guarda una copia de tus datos, se borra la caché de la app y se vuelve a descargar. Tus datos no se tocan.</p>','Forzar','Cancelar'))return;
 backupNow('antes de forzar la actualización');sessionStorage.setItem('planbUpd',JSON.stringify({from:APPV,to:'?',forced:1}));
 try{const ks=await caches.keys();await Promise.all(ks.filter(k=>/^planb/.test(k)).map(k=>caches.delete(k)))}catch(e){}
 try{const rs=await navigator.serviceWorker.getRegistrations();await Promise.all(rs.map(r=>r.unregister()))}catch(e){}
 /* Los archivos se piden de nuevo desde un marco que ya no controla el service worker, para renovar también la caché del navegador */
 try{const urls=['./','index.html',...[...document.scripts].map(s=>s.src).filter(Boolean)],fr=document.createElement('iframe');fr.hidden=true;fr.src='version.json?f='+Date.now();document.body.appendChild(fr);
  await new Promise(ok=>{fr.onload=ok;setTimeout(ok,5000)});const f=(fr.contentWindow&&fr.contentWindow.fetch)||fetch;await Promise.all(urls.map(u=>f(u,{cache:'reload'}).catch(()=>{})));fr.remove()}catch(e){}
 reloading7=true;location.reload()}
if('serviceWorker'in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadCtl||reloading7)return;reloading7=true;location.reload()});
(function(){const s=sessionStorage.getItem('planbUpd');if(!s)return;sessionStorage.removeItem('planbUpd');let o={};try{o=JSON.parse(s)}catch(e){}
 upd7.msg=o.from!==APPV?`Actualizado a ${APPV}`:`Ya tienes la última versión (${APPV})`;if(o.from===APPV&&o.to!==APPV&&!o.forced)upd7.stuck=true;setTimeout(()=>note(upd7.msg),700)})();
function updHtml(){return `<section class="card"><div class="k">Versión</div><p class="sm">Plan B ${APPV} · datos en formato ${D.ver}.</p>${upd7.msg?`<p class="sm" role="status"><b>${esc(upd7.msg)}</b></p>`:''}<div class="row"><button type="button" class="btn sm" onclick="checkUpd()">Actualizar</button>${upd7.stuck?'<button type="button" class="gh sm" onclick="forceUpd()">Forzar actualización</button>':''}</div>
 <p class="xs mut">Copias en este móvil:${LS.getItem(BK7)?` <button type="button" class="link" onclick="dlCopy('${BK7}')">antes de la 7.0.0</button>`:''}${LS.getItem(BKA)?` <button type="button" class="link" onclick="dlCopy('${BKA}')">antes de la última actualización</button>`:''}${!LS.getItem(BK7)&&!LS.getItem(BKA)?' ninguna todavía.':''}</p></section>`}
const privacyView6=privacyView;privacyView=function(){return privacyView6().replace(/<section class="card"><div class="k">Versión<\/div>[\s\S]*?<\/section>/,updHtml())};
const Vf7=V.f;V.f=function(){const h=Vf7();return h.includes('Versión')?h:h+updHtml()};
/* boot() se llama al final de app8.js */
