/* Plan B 8.0.2 · lista aprobada por Joel (24/11/2026).
   Energía en 4 grupos; para subir cuentan baterías + combustible + sol de día nublado; omitir con doble confirmación y
   tarjeta «Sin cubrir»; energía médica primero; «Otro» con nombre obligatorio. Migración con copia previa: no se borra nada. */
'use strict';
GLK.push(...Object.keys(GL7).filter(k=>!GLK.includes(k)));
const BK802='planb-premig802';

/* ===================== Qué lleva interruptor (8.0.2) ===================== */
const PROD802=['Placa solar','Generador','Aerogenerador pequeño','Manivela o dinamo','Otro generador'],ACUM802=['Estación o batería grande','Batería portátil USB','Pilas','Otro acumulador'];
const luzElec802=r=>r.kind==='Iluminación'&&(LUZ_E802.includes(r.tipoLuz)||(!r.tipoLuz&&r.kind8==='Aparato'));
function isProd(r){return secOf(r)==='energia'&&PROD802.includes(r.kind)}
function isElec(r){const s=secOf(r),k=r.kind;return(s==='energia'&&(k==='Aparato'||PROD802.includes(k)||luzElec802(r)))||(s==='com'&&k==='Equipo')||(s==='cocina'&&ELEC801.test(r.tipo||''))}
function encOn(r){const s=secOf(r),k=r.kind,e=r.enc;
 if(s==='energia'&&k==='Aparato')return e==='Sí'||((e==null||e==='')&&MED801.includes(r.grupo));
 if(s==='energia'&&(k==='Placa solar'||k==='Aerogenerador pequeño'))return e!=='No';
 if(s==='energia'&&(k==='Generador'||k==='Manivela o dinamo'||k==='Otro generador'||k==='Iluminación'))return e==='Sí';
 if(s==='cocina')return e!=='No';if(s==='com')return e==='Sí';return false}

/* ===================== Migración 8.0.1 → 8.0.2 (copia antes; no se borra nada) ===================== */
function luzTipo802(r){const t=(r.recurso||'').toLowerCase();return /frontal/.test(t)?'Frontal':/farol/.test(t)?'Farolillo eléctrico':/linterna/.test(t)?'Linterna':'Otra luz eléctrica'}
/* Aparato del grupo Luz → Iluminación eléctrica. Se guarda de dónde venía (kind8) y se conservan todos los campos. */
function fixRows802(){let n=0;(D&&D.registro||[]).forEach(r=>{if(secOf(r)==='energia'&&r.kind==='Aparato'&&r.grupo==='Luz'){r.kind8='Aparato';r.kind='Iluminación';if(!r.tipoLuz)r.tipoLuz=luzTipo802(r);n++}});return n}
function migrate802(){fixRows802();D.omit=D.omit||{};D.v802={at:today()}}
const migrate801w=window.migrate;
window.migrate=function(){migrate801w();if(!D||migErr||!D.hogar||D.v802)return;
 const snap=JSON.stringify(D);
 try{LS.setItem(BK802,JSON.stringify({at:new Date().toISOString(),de:'8.0.1',app:APPV,data:JSON.parse(snap)}))}catch(e){migErr='nobackup';D=JSON.parse(snap);return}
 try{if(window.__failMig802)throw new Error('prueba de fallo');migrate802();save()}catch(e){D=JSON.parse(snap);migErr='fail';try{LS.setItem(KEY,snap)}catch(_){}}};
const newD801=newD;newD=function(){const d=newD801();d.v802={at:today()};return d};
/* Filas que llegan de un móvil con la 8.0.1 (sincronizar o importar): se pasan al grupo nuevo sin perder nada */
const render801=render;render=function(){try{if(!migErr&&D&&D.v802&&D.registro&&fixRows802())save()}catch(e){}render801()};

/* ===================== 1 y 2 · Refugio: energía en 4 grupos; para subir, el peor caso ===================== */
function refugio(only){const x=X(),lv=lvNow(),goal=GOAL7(lv),RG=(D.registro||[]).filter(r=>counts(r)&&(!only||estOf(r)==='Comprobado')),S=sec=>RG.filter(r=>secOf(r)===sec);
 const s={},n=x.n||0;
 let Lp=0,Ln=0,treat=0,hervir=false;S('agua').forEach(r=>{const L=r.kind==='Envases'?num7(r.n||1)*num7(r.litros):r.kind==='Depósito o aljibe'?num7(r.litros):!r.kind&&r.unidad==='L'?legacyQty(r):0;
  if(r.kind==='Potabilizar'){if(r.metodo==='Hervir')hervir=true;else treat+=num7(r.litrosTrat)}else if(r.potable==='No')Ln+=L;else Lp+=L});
 const Lboil=hervir?Math.max(0,Ln-treat):0,boilFrac=(Lp+Ln)>0?Lboil/(Lp+Math.min(Ln,treat)+Lboil):0,boilLday=x.Lday?x.Lday*boilFrac:0;
 const CK=S('cocina'),gasRows=CK.filter(r=>!ELEC801.test(r.tipo||'')),elecRows=CK.filter(r=>ELEC801.test(r.tipo||'')&&encOn(r));
 const boilH=boilLday&&gasRows.length?boilLday*BOIL_H:0,boilWh=boilLday&&!gasRows.length&&elecRows.length?boilLday*BOIL_WH:0;
 const gasD=r=>{const h=(num7(r.horas)||1)+boilH,c=num7(r.consumo),t=r.tipo||'';if(/Bombona/.test(t)&&c)return num7(r.n||1)*num7(r.peso)*1000/(c*h);if(/Cartucho/.test(t)&&c)return num7(r.n||1)*num7(r.peso)/(c*h);return num7(r.diasDecl)};
 const elecCookWh=elecRows.reduce((a,r)=>a+num7(r.consumo)*(num7(r.horas)||1),0)+boilWh;
 /* Energía */
 const E=S('energia'),pct=r=>r.carga===''||r.carga==null?1:Math.max(0,Math.min(100,num7(r.carga)))/100;
 let stWh=0,usbWh=0,luces=0,luzApoyoH=0,velas=0,encWh=0,medWh=0,genWh=0,windWh=0,fuelWh=0,medRows=0;const own=[];
 E.forEach(r=>{const k=r.kind;
  if(k==='Estación o batería grande'||k==='Otro acumulador')stWh+=num7(r.wh)*pct(r);else if(k==='Batería portátil USB')usbWh+=(num7(r.wh)||num7(r.mah)*3.7/1000)*pct(r);
  else if(k==='Iluminación'){const u=num7(r.n)||1;if(luzElec802(r)){luces+=u;if(encOn(r))encWh+=num7(r.w)*u*hrs801(r)}else{luzApoyoH+=u*num7(r.horasLuz);if(r.tipoLuz==='Velas')velas+=u}}
  else if(k==='Aparato'){if(r.grupo==='Luz')luces+=num7(r.n)||1;const med=MED801.includes(r.grupo);if(med)medRows++;if(encOn(r)){const w=num7(r.w)*(num7(r.n)||1)*hrs801(r),ow=ownWh801(r);
   if(ow>0&&w>0)own.push({need:w,own:ow,med});else if(med)medWh+=w;else encWh+=w}}
  else if(k==='Generador'){if(encOn(r))genWh+=num7(r.w)*num7(r.horasDia);const L=num7(r.combustible),c=num7(r.consumoLh);if(L>0&&c>0)fuelWh+=L/c*num7(r.w)}
  else if((k==='Manivela o dinamo'||k==='Otro generador')&&encOn(r))genWh+=num7(r.w)*num7(r.horasDia);
  else if(k==='Aerogenerador pequeño'&&encOn(r))windWh+=num7(r.whNormal);
  else if(!k&&r.unidad==='Wh')stWh+=legacyQty(r);else if(!k&&r.unidad==='mAh')usbWh+=legacyQty(r)*3.7/1000});
 S('com').forEach(r=>{if(encOn(r))encWh+=num7(r.w)*hrs801(r)});
 const movWh=Math.max(1,x.moviles||0)*12,luzWh=LUZ_WH*Math.max(1,n);
 const ownNeed=own.reduce((a,o)=>a+o.need,0),ownWh=own.reduce((a,o)=>a+o.own,0);
 const usable=(stWh+usbWh)*(1-LOSS7),fuelNet=fuelWh*(1-LOSS7),base=x.n?movWh+luzWh+encWh+medWh+elecCookWh:null,need=base==null?null:base+ownNeed;
 const sol=solar7(E.filter(r=>r.kind==='Placa solar'&&encOn(r)),D.hogar&&D.hogar.prov,(D.cfg&&D.cfg.cielo)||'a ratos');
 const solNet=sol.day*(1-LOSS7),solBad=sol.bad*(1-LOSS7),genNet=genWh*(1-LOSS7),windNet=windWh*(1-LOSS7),prod=solNet+genNet+windNet;
 const bal=need==null?null:prod-need;const generador=E.some(r=>r.kind==='Generador');
 /* Peor caso (el que cuenta para subir): baterías + combustible guardado + sol de un día nublado (PVGIS). El viento, 0. */
 const dBat=need?daysOwn801(usable,base,own):null;
 const d=need?(solBad>=need?Infinity:daysOwn801(usable+fuelNet,base-solBad,own)):null;
 const dSol=need?(prod>0?(bal>=0?Infinity:daysOwn801(usable+fuelNet,base-prod,own)):d):null;
 const hasStore=E.some(r=>ACUM802.includes(r.kind)||(!r.kind&&['Wh','mAh'].includes(r.unidad))),hasGen=E.some(r=>PROD802.includes(r.kind));
 /* Energía médica: aparato médico o nevera de medicinas apuntados, o alguien que lo necesita según sus datos */
 const medNeed=!!(x.elecDev||x.medFrio||medRows),medOk=medNeed&&medRows>0&&d!=null&&d>=goal;
 s.energia={d:isFinite(d)?d:d,dBat,dSol,usable,fuelNet,solBad,need,stWh,usbWh,sol,solNet,genNet,windNet,prod,bal,hasStore,hasGen,medNeed,medOk,medRows,luzApoyoH,velas,own:{n:own.length,need:ownNeed,wh:ownWh},parts:{movWh,luzWh,encWh,medWh,elecCookWh,ownNeed}};
 const fin=v=>v==null?v:isFinite(v)?v:1e6;
 const gD=gasRows.reduce((a,r)=>a+gasD(r),0),eD=elecRows.length?(fin(d)||0):0,ckD=gD+eD;
 s.cocina={d:ckD,dSol:gD+(elecRows.length?(dSol||0):0),gD,eD,boilH,boilWh,filas:CK.length};
 const canBoil=hervir&&ckD>0,Lt=Lp+Math.min(Ln,treat)+(canBoil?Lboil:0);
 s.agua={d:x.Lday?Lt/x.Lday:null,L:Lt,Lp,Ln,treat,hervir,boilLday};
 const foods=S('comida').filter(r=>r.kind==='Alimento'),useF=foods.filter(f=>ckD>0||f.cocinar!=='Sí');
 const kc=f=>num7(f.n||1)*num7(f.kcal),pt=f=>num7(f.n||1)*num7(f.prot),sum=(a,f)=>a.reduce((s,r)=>s+f(r),0);
 const ppl=x.ppl||[],kNeed=x.kcal,pNeed=ppl.length&&ppl.every(q=>ans(q.p.edad))?ppl.reduce((a,q)=>a+protOf(q.p),0):null;
 const daysOf=arr=>{if(!kNeed)return null;let dd=sum(arr,kc)/kNeed;ppl.forEach(q=>{if(!q.kcal)return;const c=arr.filter(f=>compat(f,q.p));if(c.length<arr.length)dd=Math.min(dd,sum(c,kc)/q.kcal)});if(pNeed)dd=Math.min(dd,sum(arr,pt)/pNeed);return dd};
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
 const docs=S('doc').filter(r=>r.documento&&r.documento!=='Contactos clave en papel'&&r.documento!=='Otro'),plan=typeof planHogar==='function'?planHogar()||{}:{};
 const ev=S('evac');
 return{placaProbada:E.some(r=>r.kind==='Placa solar'&&num7(r.subio)>0&&!!r.fechaPrueba),goal,goalW:goalW(lv),lv,s,luces,usbWh,stWh,solarWh:solNet,solarBal:need==null?-1:solNet-need,bot,com,has,generador,S,
  potab:S('agua').some(r=>r.kind==='Potabilizar'),faltanGrupos,fondo:S('dinero').some(r=>r.kind==='Fondo de intercambio'),
  contactosPapel:S('doc').some(r=>r.documento==='Contactos clave en papel'&&r.papel==='Sí'),
  docsOk:docs.length>0&&docs.every(r=>r.papel==='Sí'&&r.digital==='Sí'),docs,
  mochilas:new Set(ev.filter(r=>r.kind==='Mochila').map(r=>r.persona||r.id)).size,rutaProbada:ev.some(r=>r.kind==='Ruta'&&r.probada),destino:ev.some(r=>r.kind==='Destino'),
  puntoExt:ans(plan.punto1)&&ans(plan.ext),reparar:has('otros','Herramientas para reparar')||S('otros').some(r=>!r.kind&&/repar|herramient|manten/i.test(r.recurso||''))}}
const dTxt802=v=>v==null?'—':isFinite(v)?fmtN(v):'cubierto';
/* Cuenta visible de energía */
cuenta8=(c8=>function(s,R){if(s!=='energia')return c8(s,R);const q=R.s.energia,f=fmtN;if(!q||!q.need)return c8(s,R);
 let t=`<p class="xs">Cuenta para subir (peor caso): ${f(q.usable)} Wh de baterías (ya sin el 15 % al cargar)${q.fuelNet?` + ${f(q.fuelNet)} Wh del ${term('combustibleGen','combustible guardado')}`:''}${q.solBad?` y ${f(q.solBad)} Wh al día de sol en día nublado (PVGIS)`:''} frente a ${f(q.need)} Wh al día = ${q.d===Infinity?'el sol de un día nublado ya cubre el consumo':f(q.d||0)+' días'}.`+(q.own.n?` Incluye ${q.own.n} aparato${q.own.n>1?'s':''} con ${term('bateriaPropia','batería propia')}: ${f(q.own.wh)} Wh solo para ${q.own.n>1?'ellos':'él'}.`:'')+(q.windNet?` El ${term('eolica','viento')} no cuenta aquí.`:'')+'</p>';
 if(q.prod>0){const net=q.need-q.prod;t+=`<p class="xs">Con producción normal (sol con tu cielo${q.genNet?', generador, manivela':''}${q.windNet?', viento':''}): ${net<=0?`te sobran ${f(-net)} Wh al día.`:`te faltan ${f(net)} Wh al día; así aguanta ${f(q.dSol||0)} días.`}</p>`}
 if(q.luzApoyoH)t+=`<p class="xs">Luz de apoyo: ${f(q.luzApoyoH)} horas (velas, barritas o farolillo de aceite). No cuenta como luz por persona.</p>`;
 return t})(cuenta8);

/* ===================== 3 · Omitir con doble confirmación; «Sin cubrir» ===================== */
const DIAS802='§días',MEDK802='§médica';
const omitLab802=(k,o)=>o&&o.t||(k.split('|')[1]===DIAS802?`Días de ${SECN7[k.split('|')[0]]||k.split('|')[0]}`:k.split('|')[1]===MEDK802?'Energía del equipo médico':k.split('|')[1]);
async function omit802(s,oid,label,med){D.omit=D.omit||{};const k=omitK(s,oid);
 if(D.omit[k]){delete D.omit[k];save();checkLevel();save();render();note('Deshecho: vuelve a contar.');return}
 const risk=med?`<div class="danger802"><p><b>Peligro.</b> En casa hay un aparato médico o medicación en nevera que depende de la luz. Si omites su energía y hay un apagón, la vida o la salud de esa persona puede correr peligro.</p></div><p class="sm">${esc(SUMESS_TXT802)}</p><p class="xs"><a href="${SUMESS802[1]}" target="_blank" rel="noopener">${esc(SUMESS802[0])} ↗</a></p>`
  :`<p>Si omites «${esc(label)}», Plan B deja de pedírtelo para subir de nivel. En una emergencia real tendrás menos de lo que marca el objetivo de tu nivel: es un riesgo que asumes tú.</p>`;
 if(!await ask(`<h2>${med?'▲ ':''}Omitir «${esc(label)}»</h2>${risk}<p class="xs mut">Quedará en «Sin cubrir» en el Panel y marcado en su sección del Refugio hasta que lo cubras o lo deshagas.</p>`,'Entiendo el riesgo','Cancelar'))return;
 if(!await ask(`<h2>¿Seguro que lo omites?</h2><p>${med?'<b class="rd802">Es energía para un equipo médico.</b> ':''}«${esc(label)}» dejará de contar para subir de nivel.</p>`,'Sí, omitir','No'))return;
 D.omit[k]={m:'Omitido con doble confirmación',t:label,f:today(),med:med?1:0};save();checkLevel();save();render();note('Omitido. Queda en «Sin cubrir».')}
/* El «Omitir» de «Para tu nivel» pasa por la doble confirmación */
ptnOmit=function(s,i){const o=(ptn8[s]||{it:[]}).it[i];if(!o)return;return omit802(s,o.oid,o.t,o.med)};
/* Kit: lo omitido cuenta como hecho para subir, pero queda en «Sin cubrir» */
/* kitFor es const en app7: se envuelve la comprobación de cada fila del kit (lo omitido cuenta como resuelto y queda en «Sin cubrir») */
KIT7.forEach(k=>{if(k.w802)return;const f=k[4];k[4]=(R,x)=>omitted(k[1],k[2])||f(R,x);k.w802=1});
function sinCubrir802(){return Object.entries(D&&D.omit||{}).map(([k,o])=>({k,s:k.split('|')[0],oid:k.slice(k.indexOf('|')+1),t:omitLab802(k,o),o,med:!!(o&&o.med)||k.endsWith('|'+MEDK802)}))}
function sinCubrirHtml802(list){return `<section class="card rev sc802"><h2 class="k">Sin cubrir · ${list.length}</h2><p class="xs mut">Lo has omitido tú. No cuenta para subir y en una emergencia te faltará.</p><ul class="ptnl">${list.map(q=>`<li class="falta"><span class="st" aria-hidden="true">${q.med?'▲':'–'}</span><div class="tx"><b class="${q.med?'rd802':''}">${esc(q.t)}</b><span class="xs mut db">${esc(SECN7[q.s]||q.s)}${q.o&&q.o.f?' · desde el '+fmtD(q.o.f):''}${q.o&&q.o.m&&!/doble confirmación/.test(q.o.m)?' · '+esc(q.o.m):''}</span></div><div class="ac"><button type="button" class="gh sm" onclick="sec7='${q.s}';go('r')">Ver</button><button type="button" class="link xs" onclick="undoOmit802('${esc(q.k).replace(/'/g,"\\'")}')">Deshacer</button></div></li>`).join('')}</ul></section>`}
function undoOmit802(k){if(D.omit&&D.omit[k]){delete D.omit[k];save();checkLevel();save();render();note('Deshecho: vuelve a contar.')}}

/* ===================== «Te falta para subir»: energía médica primero; omitidos fuera ===================== */
const DAYSECS802=['agua','comida','cocina','energia','higiene','medic','dinero'];
falta7=function(L){const x=X(),R=refugio(),S=score(),f=[],goal=GOAL7(L),P=(t,g,l)=>f.push([t,g,l||L]),om=k=>omitted(k,DIAS802),E=R.s.energia;
 if(E.medNeed&&!E.medOk&&!omitted('energia',MEDK802))P(E.medRows?`Energía para el equipo médico: ${dTxt802(E.d)} de ${goal} días`:'Energía para el equipo médico: apunta el aparato en Energía › Dispositivos',"sec7='energia';go('r')");
 const dd=(k,lab,g,min)=>{if(om(k))return;g=g||goal;const d=R.s[k].d;if(d!=null&&d<g&&!(min&&min()))P(`${lab}: ${fmtN(d)} de ${g} días`,`sec7='${k}';go('r')`)};
 dd('agua','Agua',goalW(L));dd('comida','Comida');
 if(!om('energia')){if(!E.hasStore)P('Energía: falta una forma de guardarla (batería o pilas)',"sec7='energia';go('r')");if(!E.hasGen)P('Energía: falta una forma de generarla (placa, generador, manivela…)',"sec7='energia';go('r')")}
 dd('energia','Energía',null,()=>L>=4&&(R.placaProbada||R.generador));if(R.s.medic.d!=null)dd('medic','Medicación');
 if(L>=2){dd('cocina','Cocina',null,()=>R.s.comida.dNoCook>=goal);dd('higiene','Higiene');if(R.s.dinero.d!=null&&L<4)dd('dinero','Dinero')}
 if(R.s.agua.d==null&&!om('agua'))P('Agua: faltan las personas del hogar',"go('e')");if(R.s.comida.d==null&&!om('comida'))P('Comida: falta la edad de cada persona',"go('e')");
 for(let l=1;l<=L;l++)kitFor(l,R,x).filter(k=>!k.ok).forEach(k=>{if(!f.some(q=>q[0].startsWith(SECN7[k.sec])&&/días/.test(q[0])))P(`Kit N${l}: ${k.t}`,`sec7='${k.sec}';go('r')`,l)});
 S.req.forEach(k=>P('Habilidad: '+fichaDef(k).t,`go('g');gs('como');gfic='${k}';render()`,Math.min(reqLv801(k),L)));
 S.block.forEach(k=>P(`${ATRN[k]}: ${S.AM[k]} de ${S.min[k]} XP`,"go('n')"));
 const ex=levelDefs(L,x).find(d=>d.ty==='x');if(ex&&!isDone(ex.k))P(/^Examen/.test(ex.t)?ex.t:'Examen: '+ex.t,`viewKey='${ex.k}';tab='m';render()`);
 const dr=dueRows();if(dr.length)P(`Por revisar: ${dr.length} en el Refugio`,"go('m')");S.rev.forEach(t=>P('Por revisar: '+t,"go('m')"));
 skList().forEach(fi=>{const s=skillOf(fi.k);if(s&&s.caducada&&s.estado!=='Aprendido')P('Por revisar: '+fi.t,`go('g');gs('como');gfic='${fi.k}';render()`)});
 return f};
/* Lo que se puede omitir desde «Te falta»: días de una sección, la energía médica y cada elemento del kit */
function omitOf802(t,L){const m=t.match(/^(Agua|Comida|Energía|Medicación|Cocina|Higiene|Dinero): /);if(/^Energía para el equipo médico/.test(t))return['energia',MEDK802,'Energía del equipo médico',1];
 if(m){const s={Agua:'agua',Comida:'comida','Energía':'energia','Medicación':'medic',Cocina:'cocina',Higiene:'higiene',Dinero:'dinero'}[m[1]];return[s,DIAS802,'Días de '+SECN7[s]]}
 const k=t.match(/^Kit(?: N\d)?: (.+)$/);if(k){for(let l=1;l<=L;l++){const it=KIT7.find(q=>q[0]===l&&q[2]===k[1]);if(it)return[it[1],it[2],it[2]]}}return null}
const faltaHtml801=faltaHtml;faltaHtml=function(){let h=faltaHtml801();const L=Math.min(D.nivel||1,4);
 return h.replace(/<li class="([^"]*)"><button type="button" class="link" onclick="([^"]*)">([^<]*)<\/button><\/li>/g,(m,c,g,t)=>{const tt=t.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');const o=omitOf802(tt,L);const med=/^Energía para el equipo médico/.test(tt);
  return `<li class="${c}${med?' rd802':''}"><button type="button" class="link" onclick="${g}">${t}</button>${o?` <button type="button" class="link xs mut" onclick="omit802('${o[0]}','${esc(o[1]).replace(/'/g,"\\'")}','${esc(o[2]).replace(/'/g,"\\'")}',${o[3]?1:0})">Omitir</button>`:''}</li>`})};
/* Punto débil: la energía médica va por delante de todo */
const weak801=weak;weak=function(S,A){try{const E=refugio().s.energia;if(E.medNeed&&!E.medOk&&!omitted('energia',MEDK802))return{t:'▲ Energía para el equipo médico',s:E.medRows?`Para ${GOAL7(lvNow())} días: hoy ${dTxt802(E.d)}. Si se va la luz, ese aparato o esa medicación dependen de tu reserva.`:'En casa hay un aparato médico o medicación en nevera: apúntalo en Energía › Dispositivos para calcular cuánto aguanta.',go:"sec7='energia';go('r')"}}catch(e){}return weak801(S,A)};
/* Autonomía: lo omitido no cuenta para el mínimo y se dice aparte */
autonomia801=(a8=>function(){const keep=o=>!omitted(o.k,DIAS802);
 const R=refugio(),x=X();const out=[];const add=(k,lab,d,noData)=>out.push({k,lab,d:noData||d==null?0:d,sin:noData||d==null});
 add('agua','agua',R.s.agua.d,!R.S('agua').length);add('comida','comida',R.s.comida.d,!R.S('comida').length);add('cocina','cocina',R.s.cocina.d,!R.S('cocina').length);
 add('energia','energía',R.s.energia.d,!R.S('energia').length);add('higiene','higiene',R.s.higiene.d,!R.S('higiene').length);
 if(R.s.medic.needMed||R.s.medic.meds.length)add('medic','medicación',R.s.medic.d,!R.s.medic.meds.length);
 const inc=out.filter(keep),fin=inc.map(o=>isFinite(o.d)?o.d:1e6),min=inc.length?Math.min(...fin):0;
 return{min,lim:inc.filter((o,i)=>fin[i]===min),sin:inc.filter(o=>o.sin),om:out.filter(o=>!keep(o)),x}})(autonomia801);
autHtml801=(h8=>function(){const a=autonomia801();let h=h8();if(a.om.length)h=h.replace('<span class="xs mut db">Lo que antes se acaba.',`<span class="xs mut db">Sin cubrir (omitido): ${esc(a.om.map(o=>o.lab).join(', '))}. Lo que antes se acaba.`);return h.replace('Energía sin sol.','Energía en el peor caso.')})(autHtml801);
/* Barras del Panel: nunca «∞» */
const secBars801=secBars;secBars=function(R,x){return secBars801(R,x).map(b=>Object.assign(b,{txt:b.txt.replace(/^∞ de (\d+) días$/,'cubierto ($1 días)')}))};
/* Panel: tarjeta fija «Sin cubrir» */
const Vp801=V.p;V.p=function(){const h=Vp801(),l=sinCubrir802();if(!l.length)return h;const c=sinCubrirHtml802(l);
 return /<section class="card" aria-labelledby="ref7">/.test(h)?h.replace('<section class="card" aria-labelledby="ref7">',c+'<section class="card" aria-labelledby="ref7">'):h+c};

/* ===================== Refugio: marcas de omitido, energía por grupos, «Otro» ===================== */
const rowSum802=rowSum8;rowSum8=function(r){if(r.kind==='Iluminación'){const u=num7(r.n)||1,v=[`${u} × ${(r.tipoLuz||'luz').toLowerCase()}`];
  if(luzElec802(r)){if(r.w)v.push(r.w+' W');if(r.conex)v.push(r.conex);if(encOn(r))v.push(`encendida ${fmtN(hrs801(r))} h al día`)}else v.push(num7(r.horasLuz)?`${fmtN(u*num7(r.horasLuz))} h de luz de apoyo`:'sin horas de luz: no suma');
  return v.join(' · ')}
 let t=rowSum802(r);if(r.kind==='Generador'){const L=num7(r.combustible),c=num7(r.consumoLh);t+=L&&c?` · combustible para ${fmtN(L/c)} h`:L?' · falta el consumo por hora: el combustible cuenta 0':''}
 if(r.kind==='Aerogenerador pequeño')t=[r.w?r.w+' W':'',r.whNormal?r.whNormal+' Wh en un día normal':'sin dato de un día normal'].filter(Boolean).join(' · ');
 return t};
const Vr802=V.r;V.r=function(){const s=sec7;let h=Vr802();const om=sinCubrir802();
 /* Chips: marca en las secciones con algo omitido */
 const oms=new Set(om.map(q=>q.s));h=h.replace(/<button type="button" role="tab" aria-selected="(true|false)" class="([^"]*)" onclick="sec7='([a-z]+)';render\(\)">/g,(m,a,c,k)=>oms.has(k)?m.replace(`class="${c}"`,`class="${c} hasom"`):m);
 /* Aviso de lo omitido en esta sección */
 const here=om.filter(q=>q.s===s);let pre='';
 if(here.length)pre+=`<section class="card rev sc802"><div class="k">Sin cubrir en ${esc(SECN7[s])}</div>${here.map(q=>`<div class="row sb"><span class="sm ${q.med?'rd802':''}">${q.med?'▲ ':''}${esc(q.t)}</span><button type="button" class="gh sm" onclick="undoOmit802('${esc(q.k).replace(/'/g,"\\'")}')">Deshacer</button></div>`).join('')}</section>`;
 const R=refugio(),d=R.s[s];
 if(DAYSECS802.includes(s)&&d&&d.d!=null&&!omitted(s,DIAS802)){const G=s==='agua'?R.goalW:R.goal;if(d.d<G)pre+=`<p class="xs mut">¿No puedes o no quieres cubrir los días de ${esc(SECN7[s])}? <button type="button" class="link xs" onclick="omit802('${s}','${DIAS802}','Días de ${esc(SECN7[s])}')">Omitir</button></p>`}
 if(s==='energia'){const E=R.s.energia;
  if(E.medNeed)pre+=`<section class="card ${E.medOk?'':'rev'} med802"><div class="k ${E.medOk?'':'rd802'}">${E.medOk?'✓':'▲'} Energía para el equipo médico</div><p class="sm">${E.medRows?`Hoy: ${dTxt802(E.d)} de ${R.goal} días en el peor caso.`:'Apunta el aparato médico o la nevera de medicinas en Dispositivos.'}</p><p class="xs">${term('sumEsencial','Suministro esencial')}: ${esc(SUMESS_TXT802)}</p>${!E.medOk&&!omitted('energia',MEDK802)?`<button type="button" class="link xs" onclick="omit802('energia','${MEDK802}','Energía del equipo médico',1)">Omitir (no recomendado)</button>`:''}</section>`;
  if(E.velas)pre+=`<p class="xs rev">Velas: nunca sin vigilar, lejos de cortinas y de lo que pueda arder, y con la habitación ventilada (recomendación de Plan B).</p>`;
  /* Botones «+» agrupados en los 4 grupos */
  h=h.replace(/<div class="row">(<button type="button" class="btn sm" onclick="edit7\('energia',null,'[^']*'\)">[^<]*<\/button>)+<\/div>/,()=>EGRP802.map(([t,g,ks])=>`<div class="k" style="margin-top:8px">${term(g,t)}</div><div class="row">${ks.map(k=>`<button type="button" class="btn sm" onclick="edit7('energia',null,'${esc(k)}')">+ ${esc(klab802(k))}</button>`).join('')}</div>`).join(''))}
 /* Filas «Otro» sin días en Cocina */
 h=h.replace(/<b>∞ de (\d+) días<\/b>/,'<b>cubierto: el sol de un día nublado da más de lo que gastas</b>');const at=h.indexOf('<section class="card ptn">');return at>-1?h.slice(0,at)+pre+h.slice(at):h+pre};
/* Nota en las filas que no suman */
const rowNote802=r=>{const s=secOf(r);if(s==='cocina'&&!/Bombona|Cartucho/.test(r.tipo||'')&&!ELEC801.test(r.tipo||'')&&!num7(r.diasDecl))return 'Sin días: indica cuántos días cubre para que sume.';
 if(s==='higiene'&&r.articulo==='Otro')return num7(r.dias)?'Artículo extra: los días de higiene salen de los artículos esenciales.':'Sin días: indica cuántos días cubre.';return ''};
const Vr802b=V.r;V.r=function(){return Vr802b().replace(/<article class="card([^"]*)">([\s\S]*?)<\/article>/g,(m,c,b)=>{const i=(b.match(/onclick="(?:edit7\('[a-z]+',|del\()(\d+)/)||[])[1];const r=i!=null?D.registro[+i]:null;const n=r?rowNote802(r):'';return n?m.replace('</p>',`</p><p class="xs rev">${n}</p>`):m})};

/* ===================== «Para tu nivel» de Energía ===================== */
const ptnFor801=ptnFor;ptnFor=function(s,R,x){const P=ptnFor801(s,R,x);if(s!=='energia')return P;const E=R.s.energia,G=R.goal;
 const luz=P.it.find(o=>o.id==='luz');if(luz){luz.q+=' eléctricas (las velas no cuentan)';luz.add={kind:'Iluminación',pre:{tipoLuz:'Linterna',n:x.n||1}};luz.omit=1;luz.oid=(KIT7.find(k=>k[0]===1&&k[1]==='energia'&&/^Luz sin red/.test(k[2]))||[])[2]||'Luz sin red';}
 const res=P.it.find(o=>o.id==='res');if(res&&E.need)res.ok=E.d>=G||(R.lv>=4&&(R.placaProbada||R.generador));
 P.it.splice(1,0,{id:'store',t:'Una forma de guardar energía',q:'Batería grande, batería USB, pilas u otra',ok:E.hasStore,g:'acumuladores',add:{kind:'Batería portátil USB'}},
  {id:'gen',t:'Una forma de generar energía',q:'Placa solar, generador, manivela o dinamo u otra',ok:E.hasGen,g:'generadores',add:{kind:'Placa solar'}});
 if(E.medNeed)P.it.unshift({id:'med',t:'Energía para el equipo médico',q:`${G} días en el peor caso para el aparato médico o la nevera de medicinas`,ok:E.medOk,g:'sumEsencial',src:SUMESS802,add:{kind:'Aparato',pre:{grupo:'Aparato médico'}},omit:1,oid:MEDK802,med:1});
 return P};

/* ===================== Formulario: nombres de grupo, «Otro» con nombre obligatorio, «¿Cuántos días cubre?» ===================== */
const edit7_801=edit7;edit7=function(s,i,kind,mid,pre){edit7_801(s,i,kind,mid,pre);const v=$('#v');if(!v)return;
 if(s==='energia'){const hk=v.querySelector('.form > .k');const r=i==null?{kind}:D.registro[i];const kk=kind||r.kind;if(hk)hk.textContent=`${SECN7.energia} · ${klab802(kk)}`;
  v.querySelectorAll('.form .chips7 button').forEach(b=>{const t=b.textContent.trim();if(KLAB802[t]){const g=EGRP802.find(q=>q[2].includes(t));b.textContent=klab802(t)+(KLAB802[t]==='Otro'&&g?' ('+g[0].toLowerCase()+')':'')}})}
 const swap=(sel,lab,ok)=>{const c=$(sel),l=lab&&v.querySelector(`label[for="${lab}"]`);if(!c||!l)return;const orig=l.textContent;const up=()=>{l.textContent=ok(c.value)?'¿Cuántos días cubre?':orig};c.addEventListener('change',up);up()};
 if(s==='higiene')swap('#e_articulo','e_dias',v=>v==='Otro');if(s==='cocina')swap('#e_tipo','e_diasDecl',v=>v==='Otra');
 const nm=v.querySelector('label[for="e_recurso"]');if(nm){const sels=[...v.querySelectorAll('.form select')];const up=()=>{const o=sels.some(x=>/^Otr[oa]\b/.test(x.value));nm.textContent=o?'Nombre (obligatorio con «Otro»)':'Nombre'};sels.forEach(x=>x.addEventListener('change',up));up()}};
const sv7_801=sv7;sv7=function(s,i,kind){const v=$('#v'),sels=v?[...v.querySelectorAll('.form select')].filter(x=>!x.closest('.fw')||!x.closest('.fw').hidden):[];
 const otro=/^Otr[oa]\b/.test(kind||'')||sels.some(x=>/^Otr[oa]\b/.test(x.value)),nm=$('#e_recurso');
 if(otro&&nm&&!nm.value.trim()){note('Con «Otro», escribe el nombre: es obligatorio.');nm.focus();return}return sv7_801(s,i,kind)};

/* ===================== Copia previa a la 8.0.2 ===================== */
const dlCopy801=dlCopy;dlCopy=function(key){if(key!==BK802)return dlCopy801(key);const raw=LS.getItem(key);if(!raw)return note('No hay copia guardada.');let x;try{x=JSON.parse(raw)}catch(e){return note('La copia está dañada.')}
 shareFile({app:'planb',ver:x.de??x.ver??0,av:x.app||APPV,fecha:x.at,data:x.data},'planb-copia-antes-de-8.0.2-'+String(x.at||today()).slice(0,10)+'.json')};
const updHtml801=updHtml;updHtml=function(){const h=updHtml801();if(!LS.getItem(BK802))return h;const b=` <button type="button" class="link" onclick="dlCopy('${BK802}')">antes de la 8.0.2</button>`;
 return /Copias en este móvil:/.test(h)?h.replace(/(Copias en este móvil:[\s\S]*?)(<\/p>)/,`$1${b}$2`):h.replace('</section>',`<p class="xs mut">Copias en este móvil:${b}</p></section>`)};

boot();
