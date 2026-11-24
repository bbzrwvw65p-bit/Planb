/* Plan B 8.0.1 · lista aprobada por Joel (24/11/2026).
   Autonomía = la sección que antes se acaba; energía sin sol y producción aparte; interruptor «Encendido» en la fila;
   batería propia del aparato; modo zombi con pantalla de radar; Equipo y Ajustes reorganizados; «Te falta» por nivel;
   habilidades por relevancia. No cambia el formato de los datos (sigue siendo el 8): no se borra nada. */
'use strict';
GLK.push(...Object.keys(GL7).filter(k=>!GLK.includes(k))); /* «?» de los términos nuevos de content801 */

/* ===================== 3 · Encendido: qué aparatos llevan interruptor ===================== */
const ELEC801=/Vitro|Hornillo eléctrico|Microondas/,MED801=['Aparato médico','Nevera de medicinas'],PROD801=['Placa solar','Generador','Manivela o dinamo'];
function isElec(r){const s=secOf(r),k=r.kind;return(s==='energia'&&(k==='Aparato'||PROD801.includes(k)))||(s==='com'&&k==='Equipo')||(s==='cocina'&&ELEC801.test(r.tipo||''))}
function isProd(r){return secOf(r)==='energia'&&PROD801.includes(r.kind)}
/* Sin tocar nada, cada aparato sigue como estaba: placas y cocina eléctrica cuentan; aparato médico y nevera de medicinas, encendidos */
function encOn(r){const s=secOf(r),k=r.kind,e=r.enc;
 if(s==='energia'&&k==='Aparato')return e==='Sí'||((e==null||e==='')&&MED801.includes(r.grupo));
 if(s==='energia'&&k==='Placa solar')return e!=='No';
 if(s==='energia'&&(k==='Generador'||k==='Manivela o dinamo'))return e==='Sí';
 if(s==='cocina')return e!=='No';
 if(s==='com')return e==='Sí';return false}
function encToggle(i){const r=D.registro[i];if(!r||!isMine(r))return;r.enc=encOn(r)?'No':'Sí';touch(r);save();checkLevel();save();render()}
const hrs801=r=>{const h=num7(r.horasDia);return h>0?Math.min(24,h):24};
const ownWh801=r=>r.conex==='Batería propia'?(num7(r.bpWh)||num7(r.bpMah)*3.7/1000)*(r.bpCarga===''||r.bpCarga==null?1:Math.max(0,Math.min(100,num7(r.bpCarga)))/100):0;
/* Días hasta que se vacía la reserva común: cada aparato con batería propia gasta primero la suya y luego tira de la común */
function daysOwn801(U,base,own){const bp=own.map(o=>({t:o.need>0?o.own/o.need:Infinity,need:o.need})).sort((a,b)=>a.t-b.t);
 let t=0,used=0,rate=base;for(const b of bp){if(!isFinite(b.t))break;const dt=b.t-t;
  if(rate>0&&used+rate*dt>=U)return t+(U-used)/rate;used=Math.max(0,used+rate*dt);t=b.t;rate+=b.need}
 return rate>0?t+(U-used)/rate:Infinity}

/* ===================== 4 · Refugio: energía sin sol; la producción va aparte ===================== */
function refugio(only){const x=X(),lv=lvNow(),goal=GOAL7(lv),RG=(D.registro||[]).filter(r=>counts(r)&&(!only||estOf(r)==='Comprobado')),S=sec=>RG.filter(r=>secOf(r)===sec);
 const s={},n=x.n||0;
 let Lp=0,Ln=0,treat=0,hervir=false;S('agua').forEach(r=>{const L=r.kind==='Envases'?num7(r.n||1)*num7(r.litros):r.kind==='Depósito o aljibe'?num7(r.litros):!r.kind&&r.unidad==='L'?legacyQty(r):0;
  if(r.kind==='Potabilizar'){if(r.metodo==='Hervir')hervir=true;else treat+=num7(r.litrosTrat)}else if(r.potable==='No')Ln+=L;else Lp+=L});
 const Lboil=hervir?Math.max(0,Ln-treat):0,boilFrac=(Lp+Ln)>0?Lboil/(Lp+Math.min(Ln,treat)+Lboil):0,boilLday=x.Lday?x.Lday*boilFrac:0;
 /* Cocina: gas aparte; la eléctrica (si está encendida) suma a la energía */
 const CK=S('cocina'),gasRows=CK.filter(r=>!ELEC801.test(r.tipo||'')),elecRows=CK.filter(r=>ELEC801.test(r.tipo||'')&&encOn(r));
 const boilH=boilLday&&gasRows.length?boilLday*BOIL_H:0,boilWh=boilLday&&!gasRows.length&&elecRows.length?boilLday*BOIL_WH:0;
 const gasD=r=>{const h=(num7(r.horas)||1)+boilH,c=num7(r.consumo),t=r.tipo||'';if(/Bombona/.test(t)&&c)return num7(r.n||1)*num7(r.peso)*1000/(c*h);if(/Cartucho/.test(t)&&c)return num7(r.n||1)*num7(r.peso)/(c*h);return num7(r.diasDecl)};
 const elecCookWh=elecRows.reduce((a,r)=>a+num7(r.consumo)*(num7(r.horas)||1),0)+boilWh;
 /* Energía */
 const E=S('energia'),pct=r=>r.carga===''||r.carga==null?1:Math.max(0,Math.min(100,num7(r.carga)))/100;
 let stWh=0,usbWh=0,luces=0,encWh=0,medWh=0,genWh=0;const own=[];
 E.forEach(r=>{if(r.kind==='Estación o batería grande')stWh+=num7(r.wh)*pct(r);else if(r.kind==='Batería portátil USB')usbWh+=(num7(r.wh)||num7(r.mah)*3.7/1000)*pct(r);
  else if(r.kind==='Aparato'){if(r.grupo==='Luz')luces+=num7(r.n)||1;if(encOn(r)){const w=num7(r.w)*(num7(r.n)||1)*hrs801(r),ow=ownWh801(r);
   if(ow>0&&w>0)own.push({need:w,own:ow,name:r.recurso||r.grupo||'Aparato'});else if(MED801.includes(r.grupo))medWh+=w;else encWh+=w}}
  else if((r.kind==='Generador'||r.kind==='Manivela o dinamo')&&encOn(r))genWh+=num7(r.w)*num7(r.horasDia);
  else if(!r.kind&&r.unidad==='Wh')stWh+=legacyQty(r);else if(!r.kind&&r.unidad==='mAh')usbWh+=legacyQty(r)*3.7/1000});
 S('com').forEach(r=>{if(encOn(r))encWh+=num7(r.w)*hrs801(r)});
 const movWh=Math.max(1,x.moviles||0)*12,luzWh=LUZ_WH*Math.max(1,n);
 const ownNeed=own.reduce((a,o)=>a+o.need,0),ownWh=own.reduce((a,o)=>a+o.own,0);
 const usable=(stWh+usbWh)*(1-LOSS7),base=x.n?movWh+luzWh+encWh+medWh+elecCookWh:null,need=base==null?null:base+ownNeed;
 const sol=solar7(E.filter(r=>r.kind==='Placa solar'&&encOn(r)),D.hogar&&D.hogar.prov,(D.cfg&&D.cfg.cielo)||'a ratos'),solNet=sol.day*(1-LOSS7),genNet=genWh*(1-LOSS7),prod=solNet+genNet;
 const bal=need==null?null:prod-need;const generador=E.some(r=>r.kind==='Generador');
 const dNo=need?daysOwn801(usable,base,own):null,dSol=need?(prod>0?(bal>=0?Infinity:daysOwn801(usable,base-prod,own)):dNo):null;
 s.energia={d:dNo,dSol,usable,need,stWh,usbWh,sol,solNet,genNet,prod,bal,own:{n:own.length,need:ownNeed,wh:ownWh},parts:{movWh,luzWh,encWh,medWh,elecCookWh,ownNeed}};
 const gD=gasRows.reduce((a,r)=>a+gasD(r),0),eD=elecRows.length?(dNo||0):0,eDs=elecRows.length?(dSol||0):0,ckD=gD+eD;
 s.cocina={d:ckD,dSol:gD+eDs,gD,eD,boilH,boilWh,filas:CK.length};
 const canBoil=hervir&&(ckD>0||gD+eDs>0),Lt=Lp+Math.min(Ln,treat)+(canBoil?Lboil:0);
 s.agua={d:x.Lday?Lt/x.Lday:null,L:Lt,Lp,Ln,treat,hervir,boilLday};
 const foods=S('comida').filter(r=>r.kind==='Alimento'),useF=foods.filter(f=>ckD>0||gD+eDs>0||f.cocinar!=='Sí');
 const kc=f=>num7(f.n||1)*num7(f.kcal),pt=f=>num7(f.n||1)*num7(f.prot),sum=(a,f)=>a.reduce((s,r)=>s+f(r),0);
 const ppl=x.ppl||[],kNeed=x.kcal,pNeed=ppl.length&&ppl.every(q=>ans(q.p.edad))?ppl.reduce((a,q)=>a+protOf(q.p),0):null;
 const daysOf=arr=>{if(!kNeed)return null;let d=sum(arr,kc)/kNeed;ppl.forEach(q=>{if(!q.kcal)return;const c=arr.filter(f=>compat(f,q.p));if(c.length<arr.length)d=Math.min(d,sum(c,kc)/q.kcal)});if(pNeed)d=Math.min(d,sum(arr,pt)/pNeed);return d};
 const legacy=S('comida').filter(r=>!r.kind),rac=legacy.filter(r=>r.unidad==='raciones (persona·día)').reduce((a,r)=>a+legacyQty(r),0),dh=legacy.filter(r=>r.unidad==='días (todo el hogar)').reduce((a,r)=>a+legacyQty(r),0),legD=(x.n?rac/x.n:0)+dh;
 const fd=daysOf(useF);s.comida={d:fd==null&&!legD?null:(fd||0)+legD,dNoCook:(daysOf(foods.filter(f=>f.cocinar!=='Sí'))||0),kNeed,pNeed,legD,protKnown:!!pNeed,kcal:sum(useF,kc),prot:sum(useF,pt)};
 const faltanGrupos=foods.length?GRUPOS7.slice(0,6).filter(g=>!foods.some(f=>f.grupo===g)):[];
 const H=S('higiene'),hd=a=>Math.max(0,...H.filter(r=>a.includes(r.articulo)).map(r=>num7(r.dias)));
 s.higiene={d:H.length?Math.min(hd(['Toallitas húmedas','Gel sin aclarado']),hd(['Váter de emergencia y bolsas']),hd(['Papel higiénico'])):0,hd,filas:H.length};
 const meds=[];(D.personas||[]).forEach(p=>(p.meds||[]).forEach(m=>{if(m._del)return;const exp=m.caduca&&m.caduca<today();meds.push({p,m,d:exp?0:num7(m.dosis)>0?num7(m.unidades)/num7(m.dosis):0})}));
 const needMed=(D.personas||[]).some(p=>p.med==='Sí');s.medic={d:meds.length?Math.min(...meds.map(q=>q.d)):needMed?0:null,meds,needMed};
 const eur=S('dinero').filter(r=>r.kind!=='Fondo de intercambio').reduce((a,r)=>a+(num7(r.importe)||legacyQty(r)),0),gd=num7(D.hogar&&D.hogar.gastoDia);
 s.dinero={d:gd&&x.n?eur/(gd*x.n):null,eur,gd};
 const item=r=>r.elemento||r.articulo||r.opcion||r.documento||r.recurso||'';
 const bot=S('botiquin').map(item),com=S('com').map(r=>r.opcion||'');
 const has=(sec,it)=>omitted(sec,it)||S(sec).some(r=>item(r)===it||r.kind===it);
 const docs=S('doc').filter(r=>r.documento&&r.documento!=='Contactos clave en papel'),plan=typeof planHogar==='function'?planHogar()||{}:{};
 const ev=S('evac');
 return{placaProbada:E.some(r=>r.kind==='Placa solar'&&num7(r.subio)>0&&!!r.fechaPrueba),goal,goalW:goalW(lv),lv,s,luces,usbWh,stWh,solarWh:solNet,solarBal:need==null?-1:solNet-need,bot,com,has,generador,S,
  potab:S('agua').some(r=>r.kind==='Potabilizar'),faltanGrupos,fondo:S('dinero').some(r=>r.kind==='Fondo de intercambio'),
  contactosPapel:S('doc').some(r=>r.documento==='Contactos clave en papel'&&r.papel==='Sí'),
  docsOk:docs.length>0&&docs.every(r=>r.papel==='Sí'&&r.digital==='Sí'),docs,
  mochilas:new Set(ev.filter(r=>r.kind==='Mochila').map(r=>r.persona||r.id)).size,rutaProbada:ev.some(r=>r.kind==='Ruta'&&r.probada),destino:ev.some(r=>r.kind==='Destino'),
  puntoExt:ans(plan.punto1)&&ans(plan.ext),reparar:has('otros','Herramientas para reparar')||S('otros').some(r=>!r.kind&&/repar|herramient|manten/i.test(r.recurso||''))}}

/* 11 · Cuenta visible: energía sin sol y, aparte, con producción */
const cuenta8_800=cuenta8;
cuenta8=function(s,R){if(s!=='energia')return cuenta8_800(s,R);const q=R.s.energia,f=fmtN;if(!q||!q.need)return cuenta8_800(s,R);
 const net=q.need-q.prod,lab=q.genNet>0?'Con tu producción (sol, generador o manivela)':'Con producción solar';
 let t=`<p class="xs">Cuenta sin sol: ${f(q.usable)} Wh útiles (ya sin el 15 % al cargar) ÷ ${f(q.need)} Wh al día = ${f(q.d||0)} días.`+(q.own.n?` Incluye ${q.own.n} aparato${q.own.n>1?'s':''} con ${term('bateriaPropia','batería propia')}: ${f(q.own.wh)} Wh solo para ${q.own.n>1?'ellos':'él'}.`:'')+'</p>';
 if(q.prod>0)t+=`<p class="xs">${lab}: ${net<=0?`te sobran ${f(-net)} Wh al día.`:`te faltan ${f(net)} Wh al día; así aguanta ${f(q.dSol||0)} días.`}</p>`;
 return t};

/* ===================== 2 · Autonomía del Panel: la sección que antes se acaba ===================== */
function autonomia801(){const R=refugio(),x=X(),out=[];
 const add=(k,lab,d,noData)=>out.push({k,lab,d:noData||d==null?0:d,sin:noData||d==null});
 add('agua','agua',R.s.agua.d,!R.S('agua').length);add('comida','comida',R.s.comida.d,!R.S('comida').length);
 add('cocina','cocina',R.s.cocina.d,!R.S('cocina').length);add('energia','energía',R.s.energia.d,!R.S('energia').length);
 add('higiene','higiene',R.s.higiene.d,!R.S('higiene').length);
 if(R.s.medic.needMed||R.s.medic.meds.length)add('medic','medicación',R.s.medic.d,!R.s.medic.meds.length);
 const min=Math.min(...out.map(o=>o.d)),lim=out.filter(o=>o.d===min),sin=out.filter(o=>o.sin);return{min,lim,sin,x}}
function autHtml801(){const a=autonomia801(),x=a.x;
 const who=x.n?`${x.n} persona${x.n>1?'s':''}`:'personas sin definir';
 const sub=a.sin.length?`Sin datos de ${a.sin.map(o=>o.lab).join(', ')}`:`Limita: ${a.lim.map(o=>o.lab).join(', ')}`;
 return `<button type="button" class="card tl aut801" onclick="const e=document.getElementById('ref7');if(e)e.scrollIntoView()" aria-label="Autonomía: ${fmtN(a.min)} días. ${esc(sub)}. Ver las barras del Refugio"><span class="k">Autonomía</span><span class="n2">${fmtN(a.min)}<span class="xs"> días</span></span><span class="mut xs up">${esc(sub)} · ${who}</span><span class="xs mut db">Lo que antes se acaba. Energía sin sol.</span></button>`}
const Vp800=V.p;V.p=function(){const h=Vp800();
 return h.replace(/<div class="card"><div class="k">Autonomía<\/div><div class="n2">[\s\S]*?<\/div><div class="mut xs up">[\s\S]*?<\/div><\/div>/,autHtml801())};

/* ===================== 10 · «Te falta para subir»: primero lo pendiente de niveles anteriores ===================== */
const reqLv801=k=>{const l=Object.keys(REQ).find(l=>(REQ[l]||[]).includes(k));return l?+l:1};
falta7=function(L){const x=X(),R=refugio(),S=score(),f=[],goal=GOAL7(L),P=(t,g,l)=>f.push([t,g,l||L]);
 const dd=(k,lab,g,min)=>{g=g||goal;const d=R.s[k].d;if(d!=null&&d<g&&!(min&&min()))P(`${lab}: ${fmtN(d)} de ${g} días`,`sec7='${k}';go('r')`)};
 dd('agua','Agua',goalW(L));dd('comida','Comida');
 /* La energía cuenta sin sol, pero para subir vale también lo que produces (como en la 8.0.0) */
 dd('energia','Energía',null,()=>R.s.energia.dSol>=goal||(L>=4&&(R.placaProbada||R.generador)));if(R.s.medic.d!=null)dd('medic','Medicación');
 if(L>=2){dd('cocina','Cocina',null,()=>R.s.comida.dNoCook>=goal||R.s.cocina.dSol>=goal);dd('higiene','Higiene');if(R.s.dinero.d!=null&&L<4)dd('dinero','Dinero')}
 if(R.s.agua.d==null)P('Agua: faltan las personas del hogar',"go('e')");if(R.s.comida.d==null)P('Comida: falta la edad de cada persona',"go('e')");
 for(let l=1;l<=L;l++)kitFor(l,R,x).filter(k=>!k.ok).forEach(k=>{if(!f.some(q=>q[0].startsWith(SECN7[k.sec])&&/días/.test(q[0])))P(`Kit N${l}: ${k.t}`,`sec7='${k.sec}';go('r')`,l)});
 S.req.forEach(k=>P('Habilidad: '+fichaDef(k).t,`go('g');gs('como');gfic='${k}';render()`,Math.min(reqLv801(k),L)));
 S.block.forEach(k=>P(`${ATRN[k]}: ${S.AM[k]} de ${S.min[k]} XP`,"go('n')"));
 const ex=levelDefs(L,x).find(d=>d.ty==='x');if(ex&&!isDone(ex.k))P(/^Examen/.test(ex.t)?ex.t:'Examen: '+ex.t,`viewKey='${ex.k}';tab='m';render()`);
 const dr=dueRows();if(dr.length)P(`Por revisar: ${dr.length} en el Refugio`,"go('m')");S.rev.forEach(t=>P('Por revisar: '+t,"go('m')"));
 skList().forEach(fi=>{const s=skillOf(fi.k);if(s&&s.caducada&&s.estado!=='Aprendido')P('Por revisar: '+fi.t,`go('g');gs('como');gfic='${fi.k}';render()`)});
 return f};
/* Agrupa: «Pendiente de N1», «Pendiente de N2»… y luego «Del nivel N3» */
function faltaGroups801(L,f){const g=[];for(let l=1;l<L;l++){const it=f.filter(q=>q[2]===l);if(it.length)g.push({t:`Pendiente de N${l}`,prev:1,it})}
 const cur=f.filter(q=>!(q[2]<L));if(cur.length)g.push({t:`Del nivel N${L}`,it:cur});
 const clean=t=>t.replace(/^Kit N\d: /,'Kit: ');g.forEach(G=>G.it=G.it.map(q=>[clean(q[0]),q[1],q[2]]));return g}
faltaHtml=function(){if(D.fin)return '';const L=Math.min(D.nivel,4),f=falta7(L);
 if(!f.length)return `<section class="card"><div class="k">Nivel ${D.nivel}</div><p class="sm">Lo tienes todo para subir.</p><button type="button" class="btn sm" onclick="if(checkLevel()){save();render();note('Nivel superado.')}">Subir de nivel</button></section>`;
 const G=faltaGroups801(L,f),many=G.length>1,prevN=G.filter(g=>g.prev).reduce((a,g)=>a+g.it.length,0);let left=Math.max(4,8-prevN),shown=0;
 const li=([t,go])=>`<li class="${/^Por revisar/.test(t)?'rev':''}"><button type="button" class="link" onclick="${go}">${esc(t)}</button></li>`;
 const body=G.map(g=>{const it=g.prev?g.it:g.it.slice(0,left);shown+=it.length;return (many?`<h3 class="k${g.prev?' rev':''}" style="margin-top:10px">${esc(g.t)}</h3>`:'')+`<ul class="ul0 f7">${it.map(li).join('')}</ul>`}).join('');
 return `<section class="card dash"><h2 class="k">Te falta para subir:</h2>${body}${f.length>shown?`<p class="xs mut">Y ${f.length-shown} más en Niveles.</p>`:''}</section>`};
/* Niveles: misma agrupación */
const Vn801=V.n;V.n=function(){let h=Vn801();if(D.fin)return h;const L=Math.min(D.nivel,4),f=falta7(L);if(!f.length)return h;
 const G=faltaGroups801(L,f);if(G.length<2)return h.replace(/<div class="b"><span>▲ Kit N\d: /g,'<div class="b"><span>▲ Kit: ');
 const rows=G.map(g=>`<div class="k${g.prev?' rev':''}" style="margin-top:8px">${esc(g.t)}</div>`+g.it.map(([t,go])=>`<div class="b"><span>▲ ${esc(t)}</span><button type="button" class="gh sm" onclick="${go}">Ir</button></div>`).join('')).join('');
 return h.replace(/(<div class="mins"><div class="k">Te falta para subir:<\/div>)(?:<div class="b"><span>▲ [\s\S]*?<\/span><button type="button" class="gh sm" onclick="[^"]*">Ir<\/button><\/div>)+/,(m,a)=>a+rows)};

/* ===================== 11 · Habilidades: mínimo fijo; orden por relevancia y recomendadas según el hogar ===================== */
function skInfo801(){const x=X(),R=refugio(),req=reqFor(Math.min((D&&D.nivel)||1,4)),rec={},why={};
 SKREC801.forEach(([k,f])=>{const w=f(x);if(w)rec[k]=w});
 if(!R.potab||(R.s.agua.d!=null&&R.s.agua.d<R.goalW))why.agua=R.potab?'tienes poca agua guardada':'no tienes ninguna forma de potabilizar';
 if(gasHome(x))why.gas='en casa hay gas';if(!R.has('otros','Extintor'))why.extintor='no tienes extintor apuntado';
 const sc=k=>{let s=0;if(req.includes(k)&&!skVigente(k))s+=100;if(why[k])s+=40;if(relFicha(k,x))s+=25;if(rec[k])s+=20;if(skVigente(k))s-=200;return s};
 return{x,req,rec,why,sc}}
comoView=function(){if(gfic&&fichaDef(gfic)){const f=fichaDef(gfic);return `<button type="button" class="gh sm" onclick="gfic=null;render();window.scrollTo(0,0)">‹ Cómo se hace</button><h2 class="h2" style="margin-top:12px">${esc(f.t.toUpperCase())}</h2>${fichaHtml(gfic)}`}
 const I=D&&D.hogar?skInfo801():null,x=I?I.x:X();
 const list=FICHAS.map((f,i)=>({f,i,s:f.vg||f.noScore||!I?-999:I.sc(f.k)})).sort((a,b)=>b.s-a.s||a.i-b.i).map(o=>o.f);
 const tag=f=>{if(f.vg||f.noScore)return '';const e=skEstado(f.k),bits=[skVigente(f.k)?'✓ Aprobada':e?'Leída':'Sin abrir'];
  if(I){if(I.req.includes(f.k))bits.push('requisito para subir');else if(I.rec[f.k])bits.push('recomendada: '+I.rec[f.k]+' · opcional');if(I.why[f.k]&&!skVigente(f.k))bits.push(I.why[f.k])}
  if(relFicha(f.k,x))bits.push('para tu zona');return `<span class="xs db" style="letter-spacing:0">${esc(bits.join(' · '))}</span>`};
 return `<p class="lead">Pasos esenciales de lo que la app recomienda. Funcionan sin internet; cada ficha enlaza a su fuente oficial para ampliar (necesita conexión).</p><p class="xs mut">Cada ficha es una habilidad: al abrirla queda «Leída» (sin XP); con la práctica y el test aprobado pasa a «Aprobada» y da XP durante 12 meses. Arriba, las que más te importan según tu nivel y lo que tienes en el Refugio. Las recomendadas son opcionales: dan XP y no bloquean la subida.</p><div class="elist">${list.map(f=>`<button type="button" class="ebtn" onclick="gfic='${f.k}';render();window.scrollTo(0,0)"><span><b>${esc(f.t.toUpperCase())}</b><span class="xs mut db" style="letter-spacing:0">${esc(f.d)}</span>${tag(f)}</span><span aria-hidden="true">›</span></button>`).join('')}</div>`};
reqHtml=function(lv){const I=skInfo801(),ks=reqFor(lv).slice().sort((a,b)=>I.sc(b)-I.sc(a));
 const row=(k,extra)=>{const ok=skVigente(k);return `<div class="${ok||extra?'':'b'}"><span>${ok?'✓ ':extra?'· ':'▲ '}${esc(fichaDef(k).t)}${extra?`<span class="xs mut db">${esc(extra)}</span>`:''}</span><button type="button" class="gh sm" onclick="go('g');gs('como');gfic='${k}';render();window.scrollTo(0,0)">${ok?'Ver':'Aprender'}</button></div>`};
 const rec=Object.keys(I.rec).filter(k=>skOk(k)&&!ks.includes(k));
 return (ks.length?`<div class="mins"><div class="k">Habilidades para subir</div>${ks.map(k=>row(k)).join('')}<p class="xs mut">Aprobada = práctica marcada y test aprobado (4 de 5). Caduca a los 12 meses.</p></div>`:'')
  +(rec.length?`<div class="mins"><div class="k">Recomendadas para tu hogar · opcionales</div>${rec.map(k=>row(k,I.rec[k]+(skVigente(k)?' · aprobada':''))).join('')}<p class="xs mut">Dan XP como las demás y no bloquean la subida.</p></div>`:'')};

/* ===================== 3 · Interruptor «Encendido» en la fila; 12 · batería propia en el resumen ===================== */
const rowSum801=rowSum8;rowSum8=function(r){let t=rowSum801(r).replace(/ · encendido 24 h \([^)]*\)/,'').replace(' · encendido 24 h','');
 if(isElec(r)&&encOn(r)){const w=num7(r.w);
  if(isProd(r)&&r.kind!=='Placa solar')t+=num7(r.horasDia)>0&&w?` · produce ${fmtN(w*num7(r.horasDia))} Wh al día`:' · pon las horas al día para que cuente';
  else if(!isProd(r)&&secOf(r)!=='cocina')t+=w?` · encendido ${fmtN(hrs801(r))} h al día`:' · pon su potencia para que cuente'}
 if(r.kind==='Aparato'&&r.conex==='Batería propia'){const o=ownWh801(r);t+=o?` · batería propia: ${fmtN(o)} Wh`:' · batería propia sin capacidad apuntada'}
 return t};
function encSw801(r,i){const on=encOn(r),nm=esc(r.recurso||r.kind||'');
 return `<div class="row sb encw"><span class="sm">${term('encendido','Encendido')} <span class="xs mut">${isProd(r)?(on?'produce':'no cuenta'):(on?'gasta cada día':'apagado')}</span></span><button type="button" class="sw ${on?'on':''}" role="switch" aria-checked="${on}" aria-label="Encendido: ${nm}" onclick="encToggle(${i})"><i></i></button></div>`}
const Vr801=V.r;V.r=function(){return Vr801().replace(/<div class="row"><button type="button" class="gh sm" onclick="edit7\('([a-z]+)',(\d+)\)">Editar<\/button>/g,(m,s,i)=>{const r=D.registro[+i];return r&&isElec(r)?encSw801(r,+i)+m:m})};
/* Energía: «con este cielo la batería se vacía en…» usa los días con producción; nunca «∞» */
const eH801=energiaHtml;energiaHtml=function(R){const E=R.s.energia,d=E.d;E.d=E.dSol;try{return eH801(R)}finally{E.d=d}};

/* ===================== 5 y 6 · Modo noche (rojo) y modo zombi, cada uno por su lado ===================== */
const applyCfg801=applyCfg;applyCfg=function(){applyCfg801();const c=D&&D.cfg||{},de=document.documentElement;de.classList.toggle('night',!!c.night);de.classList.toggle('zombie',!!c.zombie)};

/* ===================== 7 y 8 · Equipo (personas, animales, red de apoyo) y Ajustes ===================== */
NAV.forEach(n=>{if(n[0]==='e')n[1]='Equipo';if(n[0]==='f')n[1]='Ajustes'});
IC.f='<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="6.5"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/>';
const go801=go;go=function(k){go801(k);try{if(k==='e')history.replaceState(null,'','#equipo');if(k==='f')history.replaceState(null,'','#ajustes')}catch(e){}};
const SECT801=/<section class="card">(?:(?!<section)[\s\S])*?<\/section>/g;
/* Trocea la vista de la 8.0.0 por sus títulos «k sec» */
function blocks801(h){const i=h.indexOf('<h2 class="k sec">');const pre=i<0?h:h.slice(0,i),out=[];if(i<0)return{pre,out};
 h.slice(i).split('<h2 class="k sec">').slice(1).forEach(p=>{const j=p.indexOf('</h2>');out.push({t:p.slice(0,j),body:p.slice(j+5)})});return{pre,out}}
const Vf801=V.f;
function perfil801(){const k=sub;sub=null;try{return blocks801(Vf801())}finally{sub=k}}
const RED801=/<section class="card"><div class="row sb"><h3 class="h3">Red de apoyo<\/h3>[\s\S]*?<\/section>/;
V.f=function(){if(sub==='datos')return Vf801().replace('>‹ Perfil<','>‹ Ajustes<');
 const B=perfil801(),get=t=>B.out.find(b=>b.t.startsWith(t)),hog=get('Hogar'),veh=get('Vehículos'),aj=get('Ajustes'),cop=get('Copia de seguridad'),dat=get('Tus datos'),sis=get('Sistema');
 const sec=(t,b)=>b?`<h2 class="k sec">${t}</h2>${b}`:'';
 let legal='',app='';
 if(aj){const cards=aj.body.match(SECT801)||[],pick=re=>cards.find(c=>re.test(c))||'';legal=pick(/showLegal\(\)/);
  const nz=pick(/D\.cfg\.night=/),big=pick(/toggleBig\(\)/),dri=pick(/drillToggle\(\)/),rest=cards.filter(c=>![legal,nz,big,dri].includes(c));
  app=(nz+big+dri+rest.join(''))
   .replace(/Rojo de noche/g,'Modo noche (rojo)')
   .replace(' Lleva rojo de noche.',' Pantalla verde de radar antigua, con líneas suaves y sin animaciones. Se puede usar junto al modo noche: entonces manda el rojo.')}
 return `<h1 class="sr">Ajustes</h1>`+sec('Tu hogar',hog&&hog.body.replace(RED801,''))+sec(veh&&veh.t,veh&&veh.body)+sec('Ajustes de la app',app)+sec('Copia de seguridad',cop&&cop.body)+sec('Tus datos',dat&&dat.body)+sec('Sistema',sis&&sis.body)+sec('Aviso legal',legal)};
const Ve801=V.e;V.e=function(){let h=Ve801();const B=perfil801(),get=t=>B.out.find(b=>b.t.startsWith(t)),per=get('Personas'),ani=get('Animales'),hog=get('Hogar'),red=hog&&(hog.body.match(RED801)||[''])[0];
 const top=(per?`<h2 class="k sec">${per.t}</h2>${per.body}`:'')+(ani?`<h2 class="k sec">${ani.t}</h2>${ani.body}`:'')+(red?`<h2 class="k sec">Red de apoyo</h2>${red}<p class="xs mut">El punto de encuentro y el contacto de fuera son los mismos que en Guía › Plan sin red.</p>`:'');
 h=h.replace(/<h1 class="sr">[^<]*<\/h1>/,'<h1 class="sr">Equipo</h1>'+top);
 return h.replace(/Indica quién eres en Grupo/g,'Indica quién eres en Equipo')};

/* ===================== 9 · El logo abre el aviso legal ===================== */
const boot801=boot;boot=function(){boot801();const lg=document.querySelector('header .logo');if(lg&&!lg.dataset.legal){lg.dataset.legal=1;lg.setAttribute('role','button');lg.setAttribute('tabindex','0');lg.setAttribute('aria-label','Plan B · aviso legal');lg.style.cursor='pointer';
 lg.addEventListener('click',()=>showLegal());lg.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showLegal()}})}};

/* boot() se llama al final de app802.js (8.0.2) */
