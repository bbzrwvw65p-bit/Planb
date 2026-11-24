/* Plan B 8.0.0 · Fase 2: «Para tu nivel» en cada sección, cálculos visibles (encendidos, luz por persona, cocina eléctrica,
   hervir, aparatos médicos, proteína por edad, agua por temporada y forma de lavarse), «Ha pasado algo», cuestionario nuevo,
   vive solo / hogares grandes, gráfico del Refugio, misiones con un solo botón, modo zombi, rojo de noche y aviso legal.
   Migración 7 → 8 con copia previa: no se borra ningún dato. */
'use strict';
const BK8='planb-premig8',LEGAL_K='planb-legal8',BOIL_H=.1,BOIL_WH=100,LUZ_WH=5;
GLK.push(...Object.keys(GL7).filter(k=>!GLK.includes(k)));
const mesHoy=()=>new Date().getMonth();
const verano=()=>{const m=mesHoy();return m>=5&&m<=8},invierno=()=>{const m=mesHoy();return m>=10||m<=2};
const lvNow=()=>D&&D.fin?4:Math.min((D&&D.nivel)||1,4);
const goalW=lv=>lv>=4?14:GOAL7(lv);
const qm=(k,l)=>{const i=GLK.indexOf(k);return i<0?'':`<button type="button" class="qm" aria-label="¿Qué es? ${esc(l||'')}" onclick="expl(${i})">?</button>`};
const omitK=(s,it)=>s+'|'+it,omitted=(s,it)=>!!(D&&D.omit&&D.omit[omitK(s,it)]);
const zOn=()=>!!(D&&D.cfg&&D.cfg.zombie);

/* ===================== Hogar: agua por temporada y forma de lavarse; quién está fuera ===================== */
const X7=X;X=function(src){const x=X7(src),h=x.h||{};
 x.calorZona=x.calor;x.frioZona=x.frio;x.calor=x.calorZona&&verano();x.frio=x.frioZona&&invierno();
 const hf=HIGF8[h.higieneForma]||0;x.higF=h.higieneForma||'Toallitas y gel sin agua';
 x.ppl.forEach(q=>{const w=waterOf(q.p,x.calor);q.L=Math.max(w.L,hf||0)});
 let petL=0;(x.pets||[]).forEach(m=>{const l=petLday(m,x.calor);if(l)petL+=l});x.petL=petL;
 x.Lpp=Math.max(x.calor?6:4,hf||0);x.Lday=x.n?Math.ceil(x.ppl.reduce((a,b)=>a+b.L,0)+petL):null;
 const P=x.P||[],nm=f=>P.map((p,i)=>f(p)?pname(p,i):null).filter(Boolean);
 x.awayQ=list(nm(p=>(['Fuera de casa','A veces fuera y a veces en casa'].includes(p.diaDonde)&&['Más de 2 h','No podría volver a pie'].includes(p.vuelta))||['Algunas noches','Muchas noches'].includes(p.noches)||(!p.diaDonde&&(['Jornada completa','Días seguidos'].includes(p.fuera)||['10 a 30 km','Más de 30 km'].includes(p.dist)))));
 x.solo=x.n===1;x.grande=(x.n||0)>=4;x.adultos=P.filter(p=>adulto(p)||p.edad==='13–17').length||x.n||1;
 x.solaVul=x.solo&&P.some(p=>['Reducida','Silla de ruedas','Encamada'].includes(p.movil)||p.aparato==='Sí, con electricidad');
 const lejos=h.super&&h.super!=='Menos de 15 min'||h.hospital==='Más de 45 min';
 const isla=h.isla==='Sí'||ISLAS8.includes(provOfCP(h.cp)||h.prov);
 x.aislado=(isla||h.carretera==='Sí'||h.entorno==='Rural o aislado')&&!!lejos;x.isla=isla;
 return x};
/* Proteína por persona (EFSA 2012): g/kg por edad; sin peso, peso de referencia de la edad más alta del grupo */
const PROT_GKG8={'0–2':1.14,'3–12':.92,'13–17':.90,'18–64':.83,'65+':.83};
const PROT_REF8={'3–12':{H:37,M:38},'13–17':{H:58,M:48},'18–64':{H:62,M:52},'65+':{H:61,M:55}};
function protOf(p){if(p.edad==='0–2')return 0;const w=num7(p.peso),e=PROT_GKG8[p.edad]?p.edad:'18–64';let g;
 if(w>0)g=w*PROT_GKG8[e];else{const r=PROT_REF8[e]||PROT_REF8['18–64'];g=p.sexo==='Mujer'?r.M:r.H}
 if(p.embarazo==='Embarazo')g+=28;else if(p.embarazo==='Lactancia')g+=19;return g}

/* ===================== Refugio: días por sección (8.0) ===================== */
function refugio(only){const x=X(),lv=lvNow(),goal=GOAL7(lv),RG=(D.registro||[]).filter(r=>counts(r)&&(!only||estOf(r)==='Comprobado')),S=sec=>RG.filter(r=>secOf(r)===sec);
 const s={},n=x.n||0;
 /* Agua (primero sin hervir, para saber cuánto hay que hervir) */
 let Lp=0,Ln=0,treat=0,hervir=false;S('agua').forEach(r=>{const L=r.kind==='Envases'?num7(r.n||1)*num7(r.litros):r.kind==='Depósito o aljibe'?num7(r.litros):!r.kind&&r.unidad==='L'?legacyQty(r):0;
  if(r.kind==='Potabilizar'){if(r.metodo==='Hervir')hervir=true;else treat+=num7(r.litrosTrat)}else if(r.potable==='No')Ln+=L;else Lp+=L});
 const Lboil=hervir?Math.max(0,Ln-treat):0,boilFrac=(Lp+Ln)>0?Lboil/(Lp+Math.min(Ln,treat)+Lboil):0,boilLday=x.Lday?x.Lday*boilFrac:0;
 /* Cocina: gas aparte; la eléctrica suma a la energía (no se cuenta dos veces) */
 const elecT=/Vitro|Hornillo eléctrico|Microondas/,CK=S('cocina'),gasRows=CK.filter(r=>!elecT.test(r.tipo||'')),elecRows=CK.filter(r=>elecT.test(r.tipo||''));
 const boilH=boilLday&&gasRows.length?boilLday*BOIL_H:0,boilWh=boilLday&&!gasRows.length&&elecRows.length?boilLday*BOIL_WH:0;
 const gasD=r=>{const h=(num7(r.horas)||1)+boilH,c=num7(r.consumo),t=r.tipo||'';if(/Bombona/.test(t)&&c)return num7(r.n||1)*num7(r.peso)*1000/(c*h);if(/Cartucho/.test(t)&&c)return num7(r.n||1)*num7(r.peso)/(c*h);return num7(r.diasDecl)};
 const elecCookWh=elecRows.reduce((a,r)=>a+num7(r.consumo)*(num7(r.horas)||1),0)+boilWh;
 /* Energía */
 const E=S('energia'),pct=r=>r.carga===''||r.carga==null?1:Math.max(0,Math.min(100,num7(r.carga)))/100;
 let stWh=0,usbWh=0,luces=0,encWh=0,medWh=0;const devOn=r=>r.enc==='Sí'||(r.enc==null&&['Aparato médico','Nevera de medicinas'].includes(r.grupo));
 E.forEach(r=>{if(r.kind==='Estación o batería grande')stWh+=num7(r.wh)*pct(r);else if(r.kind==='Batería portátil USB')usbWh+=(num7(r.wh)||num7(r.mah)*3.7/1000)*pct(r);
  else if(r.kind==='Aparato'){if(r.grupo==='Luz')luces+=num7(r.n)||1;if(devOn(r)){const w=num7(r.w)*(num7(r.n)||1)*24;if(['Aparato médico','Nevera de medicinas'].includes(r.grupo))medWh+=w;else encWh+=w}}
  else if(!r.kind&&r.unidad==='Wh')stWh+=legacyQty(r);else if(!r.kind&&r.unidad==='mAh')usbWh+=legacyQty(r)*3.7/1000});
 S('com').forEach(r=>{if(r.enc==='Sí')encWh+=num7(r.w)*24});
 const movWh=Math.max(1,x.moviles||0)*12,luzWh=LUZ_WH*Math.max(1,n);
 const usable=(stWh+usbWh)*(1-LOSS7),need=x.n?movWh+luzWh+encWh+medWh+elecCookWh:null;
 const sol=solar7(E.filter(r=>r.kind==='Placa solar'),D.hogar&&D.hogar.prov,(D.cfg&&D.cfg.cielo)||'a ratos'),solNet=sol.day*(1-LOSS7);
 const bal=need==null?null:solNet-need;const generador=E.some(r=>r.kind==='Generador');
 s.energia={d:need?(bal!=null&&bal>=0&&solNet>0?Infinity:usable/(need-solNet)):null,usable,need,stWh,usbWh,sol,solNet,bal,parts:{movWh,luzWh,encWh,medWh,elecCookWh}};
 const gD=gasRows.reduce((a,r)=>a+gasD(r),0),eD=elecRows.length?(s.energia.d||0):0,ckD=gD+eD;
 s.cocina={d:ckD,gD,eD,boilH,boilWh};
 const canBoil=hervir&&ckD>0,Lt=Lp+Math.min(Ln,treat)+(canBoil?Lboil:0);
 s.agua={d:x.Lday?Lt/x.Lday:null,L:Lt,Lp,Ln,treat,hervir,boilLday};
 /* Comida: kcal y proteína (también niños) */
 const foods=S('comida').filter(r=>r.kind==='Alimento'),useF=foods.filter(f=>ckD>0||f.cocinar!=='Sí');
 const kc=f=>num7(f.n||1)*num7(f.kcal),pt=f=>num7(f.n||1)*num7(f.prot),sum=(a,f)=>a.reduce((s,r)=>s+f(r),0);
 const ppl=x.ppl||[],kNeed=x.kcal,pNeed=ppl.length&&ppl.every(q=>ans(q.p.edad))?ppl.reduce((a,q)=>a+protOf(q.p),0):null;
 const daysOf=arr=>{if(!kNeed)return null;let d=sum(arr,kc)/kNeed;ppl.forEach(q=>{if(!q.kcal)return;const c=arr.filter(f=>compat(f,q.p));if(c.length<arr.length)d=Math.min(d,sum(c,kc)/q.kcal)});if(pNeed)d=Math.min(d,sum(arr,pt)/pNeed);return d};
 const legacy=S('comida').filter(r=>!r.kind),rac=legacy.filter(r=>r.unidad==='raciones (persona·día)').reduce((a,r)=>a+legacyQty(r),0),dh=legacy.filter(r=>r.unidad==='días (todo el hogar)').reduce((a,r)=>a+legacyQty(r),0),legD=(x.n?rac/x.n:0)+dh;
 const fd=daysOf(useF);s.comida={d:fd==null&&!legD?null:(fd||0)+legD,dNoCook:(daysOf(foods.filter(f=>f.cocinar!=='Sí'))||0),kNeed,pNeed,legD,protKnown:!!pNeed,kcal:sum(useF,kc),prot:sum(useF,pt)};
 const faltanGrupos=foods.length?GRUPOS7.slice(0,6).filter(g=>!foods.some(f=>f.grupo===g)):[];
 /* Higiene: el artículo esencial que menos dure (regla de Plan B, visible) */
 const H=S('higiene'),hd=a=>Math.max(0,...H.filter(r=>a.includes(r.articulo)).map(r=>num7(r.dias)));
 s.higiene={d:H.length?Math.min(hd(['Toallitas húmedas','Gel sin aclarado']),hd(['Váter de emergencia y bolsas']),hd(['Papel higiénico'])):0,hd};
 /* Medicación */
 const meds=[];(D.personas||[]).forEach(p=>(p.meds||[]).forEach(m=>{if(m._del)return;const exp=m.caduca&&m.caduca<today();meds.push({p,m,d:exp?0:num7(m.dosis)>0?num7(m.unidades)/num7(m.dosis):0})}));
 const needMed=(D.personas||[]).some(p=>p.med==='Sí');s.medic={d:meds.length?Math.min(...meds.map(q=>q.d)):needMed?0:null,meds};
 /* Dinero: sin gasto por defecto */
 const eur=S('dinero').filter(r=>r.kind!=='Fondo de intercambio').reduce((a,r)=>a+(num7(r.importe)||legacyQty(r)),0),gd=num7(D.hogar&&D.hogar.gastoDia);
 s.dinero={d:gd&&x.n?eur/(gd*x.n):null,eur,gd};
 const item=r=>r.elemento||r.articulo||r.opcion||r.documento||r.recurso||'';
 const bot=S('botiquin').map(item),com=S('com').map(r=>r.opcion||'');
 const has=(sec,it)=>omitted(sec,it)||S(sec).some(r=>item(r)===it||r.kind===it);
 const docs=S('doc').filter(r=>r.documento&&r.documento!=='Contactos clave en papel'),plan=typeof planHogar==='function'?planHogar()||{}:{};
 const ev=S('evac');
 return{placaProbada:E.some(r=>r.kind==='Placa solar'&&num7(r.subio)>0&&!!r.fechaPrueba),goal,goalW:goalW(lv),lv,s,luces,usbWh,stWh,solarWh:solNet,solarBal:bal==null?-1:bal,bot,com,has,generador,S,
  potab:S('agua').some(r=>r.kind==='Potabilizar'),faltanGrupos,fondo:S('dinero').some(r=>r.kind==='Fondo de intercambio'),
  contactosPapel:S('doc').some(r=>r.documento==='Contactos clave en papel'&&r.papel==='Sí'),
  docsOk:docs.length>0&&docs.every(r=>r.papel==='Sí'&&r.digital==='Sí'),docs,
  mochilas:new Set(ev.filter(r=>r.kind==='Mochila').map(r=>r.persona||r.id)).size,rutaProbada:ev.some(r=>r.kind==='Ruta'&&r.probada),destino:ev.some(r=>r.kind==='Destino'),
  puntoExt:ans(plan.punto1)&&ans(plan.ext),reparar:has('otros','Herramientas para reparar')||S('otros').some(r=>!r.kind&&/repar|herramient|manten/i.test(r.recurso||''))}}

/* ===================== Subir de nivel ===================== */
function falta7(L){const x=X(),R=refugio(),S=score(),f=[],goal=GOAL7(L),dd=(k,lab,g,min)=>{g=g||goal;const d=R.s[k].d;if(d!=null&&d<g&&!(min&&min()))f.push([`${lab}: ${fmtN(d)} de ${g} días`,`sec7='${k}';go('r')`])};
 dd('agua','Agua',goalW(L));dd('comida','Comida');dd('energia','Energía',null,()=>L>=4&&(R.placaProbada||R.generador));if(R.s.medic.d!=null)dd('medic','Medicación');
 if(L>=2){dd('cocina','Cocina',null,()=>R.s.comida.dNoCook>=goal);dd('higiene','Higiene');if(R.s.dinero.d!=null&&L<4)dd('dinero','Dinero')}
 if(R.s.agua.d==null)f.push(['Agua: faltan las personas del hogar',"go('f')"]);if(R.s.comida.d==null)f.push(['Comida: falta la edad de cada persona',"go('f')"]);
 for(let l=1;l<=L;l++)kitFor(l,R,x).filter(k=>!k.ok).forEach(k=>{if(!f.some(q=>q[0].startsWith(SECN7[k.sec])&&/días/.test(q[0])))f.push([`Kit N${l}: ${k.t}`,`sec7='${k.sec}';go('r')`])});
 S.req.forEach(k=>f.push(['Habilidad: '+fichaDef(k).t,`go('g');gs('como');gfic='${k}';render()`]));
 S.block.forEach(k=>f.push([`${ATRN[k]}: ${S.AM[k]} de ${S.min[k]} XP`,"go('n')"]));
 const ex=levelDefs(L,x).find(d=>d.ty==='x');if(ex&&!isDone(ex.k))f.push([/^Examen/.test(ex.t)?ex.t:'Examen: '+ex.t,`viewKey='${ex.k}';tab='m';render()`]);
 const dr=dueRows();if(dr.length)f.push([`Por revisar: ${dr.length} en el Refugio`,"go('m')"]);S.rev.forEach(t=>f.push(['Por revisar: '+t,"go('m')"]));
 skList().forEach(fi=>{const s=skillOf(fi.k);if(s&&s.caducada&&s.estado!=='Aprendido')f.push(['Por revisar: '+fi.t,`go('g');gs('como');gfic='${fi.k}';render()`])});
 return f}
function faltaHtml(){if(D.fin)return '';const f=falta7(Math.min(D.nivel,4));if(!f.length)return `<section class="card"><div class="k">Nivel ${D.nivel}</div><p class="sm">Lo tienes todo para subir.</p><button type="button" class="btn sm" onclick="if(checkLevel()){save();render();note('Nivel superado.')}">Subir de nivel</button></section>`;
 return `<section class="card dash"><h2 class="k">Te falta para subir:</h2><ul class="ul0 f7">${f.slice(0,8).map(([t,go])=>`<li class="${/^Por revisar/.test(t)?'rev':''}"><button type="button" class="link" onclick="${go}">${esc(t)}</button></li>`).join('')}</ul>${f.length>8?`<p class="xs mut">Y ${f.length-8} más en Niveles.</p>`:''}</section>`}

/* ===================== Cabecera corta y tocable ===================== */
const zName=lv=>ZNIV8[lv-1];
header=function(){const el=$('#sub');if(!el)return;const on=D&&D.hogar&&!wz;el.textContent=on?(D.fin?(D.n5?(zOn()?'N5 · Renacer':'N5 · Autosuf.'):'N4 ✓'):`N${D.nivel} · ${zOn()?ZNIVS8[D.nivel-1]:NIVS8[D.nivel-1]}`):'';
 el.setAttribute('role',on?'button':'');el.tabIndex=on?0:-1;el.setAttribute('aria-label',on?'Ver tu nivel':'');el.onclick=on?()=>go('n'):null;el.onkeydown=on?e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go('n')}}:null};
/* Nombres de nivel según el modo */
const NIVT8=NIV7.map(L=>L.t);function applyNames(){const z=zOn();NIV7.forEach((L,i)=>{L.t=z?ZNIV8[i]:NIVT8[i];if(NIV[i])NIV[i].t=L.t})}

/* ===================== Panel: gráfico del Refugio ===================== */
function secBars(R,x){const g=R.goal,out=[];const add=(k,d,goal,txt)=>{if(d==null)return;out.push({k,f:Math.max(0,Math.min(1,goal?d/goal:0)),txt})};
 [['agua',R.goalW],['comida',g],['energia',g],['medic',g]].concat(R.lv>=2?[['cocina',g],['higiene',g]]:[]).forEach(([k,G])=>{const d=R.s[k].d;if(d!=null)add(k,d,G,`${fmtN(d)} de ${G} días`)});
 if(R.lv>=2&&R.s.dinero.d!=null)add('dinero',R.s.dinero.d,g,`${fmtN(R.s.dinero.d)} de ${g} días`);
 const ks={};for(let l=1;l<=R.lv;l++)kitFor(l,R,x).forEach(k=>{if(['agua','comida','energia','medic','cocina','higiene'].includes(k.sec))return;(ks[k.sec]=ks[k.sec]||[]).push(k.ok)});
 Object.entries(ks).forEach(([k,a])=>{const ok=a.filter(Boolean).length;add(k,ok,a.length,`${ok} de ${a.length} del kit`)});
 return out.sort((a,b)=>a.f-b.f)}
function refugioHtml(){const R=refugio(),x=X(),g=R.goal,E=R.s.energia,bars=secBars(R,x);
 const kit=[];for(let l=1;l<=R.lv;l++)kitFor(l,R,x).forEach(k=>kit.push(k));const kok=kit.filter(k=>k.ok).length;
 const col=f=>f>=1?'ok':f>=.5?'mid':'low';
 return `<section class="card" aria-labelledby="ref7"><h2 class="k" id="ref7">${term('refugio','Refugio')} · objetivo ${g} día${g>1?'s':''}${R.goalW!==g?` (agua ${R.goalW} y potabilizar)`:''}</h2>
 <ul class="bars8">${bars.map(b=>`<li><button type="button" onclick="sec7='${b.k}';go('r')" aria-label="${esc(SECN7[b.k])}: ${esc(b.txt)}"><span class="bl">${esc(SECN7[b.k])}</span><span class="bt"><i class="${col(b.f)}" style="width:${Math.round(b.f*100)}%"></i></span><span class="bv">${esc(b.txt)}</span></button></li>`).join('')}</ul>
 ${E.sol.ok&&E.solNet?`<p class="xs">${term('placa','Placas')}: ${Math.round(E.solNet)} Wh/día con cielo ${term('cielo',SKY7[D.cfg.cielo||'a ratos'].toLowerCase())} ${balHtml(E.bal)}</p>`:''}
 <p class="xs mut">De menor a mayor. Toca una barra para ir a su sección. Kit por nivel: ${kok} de ${kit.length}. ${term('declarado','Declarado')} cuenta para los días; ${term('comprobado','Comprobado')} además da XP.</p></section>`}
const Vp7=V.p;V.p=function(){let h=Vp7();const x=X();
 const hab=(h.match(/<button type="button" class="card tl wide" onclick="go\('g'\);gs\('como'\)">[\s\S]*?<\/button>/)||[''])[0],off=(h.match(/<p class="offn xs" id="offn">[\s\S]*?<\/p>/)||[''])[0];
 if(hab)h=h.replace(hab,'');if(off)h=h.replace(off,'');
 if(hab)h=h.replace(/(<section class="card radarc"[\s\S]*?<\/section>)/,'$1'+hab);
 let pre='';
 if(x.solaVul)pre+=`<section class="card rev"><div class="k">▲ Vives solo</div><p class="sm">Con movilidad reducida o un aparato médico que necesita luz, en una emergencia es más difícil pedir ayuda. Acuerda una ${term('senal','señal de vida')} con tu contacto de fuera y ten el 112 a mano.</p><button type="button" class="gh sm" onclick="go('e')">Ir a Equipo</button></section>`;
 const hpa=`<button type="button" class="card tl wide hpa" onclick="openHPA()"><span class="k">Ha pasado algo en casa</span><b>Luz, agua, fuga, humo, gas, tiempo, terremoto…</b><span class="xs mut">Qué hacer paso a paso y lo que tienes en casa para eso.</span></button>`;
 h=h.replace(/(<section class="card" aria-labelledby="ref7">)/,hpa+'$1');
 if(pre)h=h.replace('<h1 class="sr">Panel</h1>','<h1 class="sr">Panel</h1>'+pre);
 return h+(off||'')};

/* ===================== «Para tu nivel» ===================== */
let ptn8={};
const srcA=k=>SRC7[k]?[SRC7[k][0],SRC7[k][1]]:null;
function ptnFor(s,R,x){const lv=R.lv,G=R.goal,GW=R.goalW,n=x.n||1,h=x.h||{},it=[],tip=[],warn=[];
 const I=(o)=>{it.push(o);return o};
 const pres=h.presupuesto,poco=['Nada','Menos de 20 €','Poco'].includes(pres),sitio=h.almacen==='Muy poco',prisa=h.tiempo==='15 min';
 const ahead=x.aislado&&['agua','comida'].includes(s)&&lv<4;
 if(ahead)warn.push(`${term('aislado','Si se corta tu acceso')}: te sugerimos ir un nivel por delante, ${s==='agua'?goalW(lv+1):GOAL7(lv+1)} días. El objetivo del nivel no cambia.`);
 if(s==='agua'){const L=x.Lday?x.Lday*GW:null,have=R.s.agua.L;
  I({id:'agua',t:'Agua almacenada',q:L?`${fmtN(L)} L: ${x.Lday} L al día × ${GW} días (${n} persona${n>1?'s':''}${x.pets.length?' y animales':''})`:'Faltan las personas del hogar',ok:L?have>=L:null,g:'aguaBeber',src:srcA('who'),add:L&&have<L?{kind:'Envases',pre:{n:Math.ceil((L-have)/5),litros:5,potable:'Sí'}}:null});
  I({id:'beber',t:'Mínimo para beber',q:`${fmtN(1.5*n*GW)} L: 1,5 L × ${n} × ${GW} días (Protección Civil)`,ok:have>=1.5*n*GW,g:'aguaBeber',src:srcA('pc')});
  if(lv>=3)I({id:'potab',t:'Una forma de potabilizar',q:lv>=4?'En 1 mes: 14 días de agua guardada y potabilizar el resto':'Filtro, pastillas, lejía apta o hervir',ok:R.potab,g:'potabilizar',src:srcA('lejia'),add:{kind:'Potabilizar'}});
  if(R.s.agua.hervir&&R.s.agua.boilLday)tip.push(`${term('hervir','Hervir')} gasta cocina: ${fmtN(R.s.agua.boilLday)} L al día que hervir.`);
  tip.push(`${term('higieneForma','Forma de lavarse')}: ${esc(x.higF)}. ${term('temporada','Temporada')}: ${x.calor?'calor (6 L)':x.calorZona?'ahora sin calor; de junio a septiembre sube a 6 L':'sin calor'}.`);
  if(['Pozo','Aljibe o depósito'].includes(h.agua)||h.bomba==='Sí')tip.push('Tu agua depende de una bomba: sin luz no sale. Cuenta solo lo que tengas guardado.');
  if(poco)tip.push('Sin gastar: llena botellas limpias con agua del grifo, ciérralas y apunta la fecha. Cámbiala cada 6 meses (Ready.gov).');
  if(sitio)tip.push('Poco sitio: reparte envases pequeños bajo las camas o al fondo de los armarios ('+PB+').');
  if(prisa)tip.push('Paso corto: hoy llena dos botellas y apúntalas.')}
 else if(s==='higiene'){const hd=R.s.higiene.hd;
  tip.push(`Los días de higiene son los del artículo esencial que menos dure: toallitas o gel, váter de emergencia y papel (${PB}).`);
  [['tg','Toallitas húmedas o gel sin aclarado',['Toallitas húmedas','Gel sin aclarado'],'Toallitas húmedas'],['vt','Váter de emergencia y bolsas',['Váter de emergencia y bolsas'],'Váter de emergencia y bolsas'],['pp','Papel higiénico',['Papel higiénico'],'Papel higiénico']]
   .forEach(([id,t,arts,a])=>I({id,t,q:`Para ${G} días del hogar`,ok:hd(arts)>=G,g:'higieneSeco',src:srcA('ue'),add:{kind:'Artículo',pre:{articulo:a,dias:G}}}));
  I({id:'bolsas',t:'Bolsas de basura',q:'Para la basura y el váter de emergencia',ok:R.has('higiene','Bolsas de basura'),g:'higieneSeco',src:srcA('fema'),add:{kind:'Artículo',pre:{articulo:'Bolsas de basura',dias:G}},omit:1});
  if((x.P||[]).some(p=>p.sexo==='Mujer'&&['13–17','18–64'].includes(p.edad)))I({id:'comp',t:'Compresas o tampones',q:`Para ${G} días`,ok:R.has('higiene','Compresas o tampones'),g:'higieneSeco',add:{kind:'Artículo',pre:{articulo:'Compresas o tampones',dias:G}},omit:1});
  if((x.P||[]).some(bebe))I({id:'panal',t:'Pañales',q:`Para ${G} días`,ok:R.has('higiene','Pañales'),g:'higieneSeco',src:srcA('fema'),add:{kind:'Artículo',pre:{articulo:'Pañales',dias:G}},omit:1})}
 else if(s==='comida'){const c=R.s.comida;
  I({id:'kcal',t:'Energía (kcal)',q:c.kNeed?`${fmtN(c.kNeed*G)} kcal: ${fmtN(c.kNeed)} al día × ${G} días`:'Falta la edad de cada persona',ok:c.kNeed?c.kcal>=c.kNeed*G:null,g:'kcal',src:srcA('efsaE'),add:{kind:'Alimento'}});
  if(c.pNeed)I({id:'prot',t:'Proteína',q:`${fmtN(c.pNeed*G)} g: ${fmtN(c.pNeed)} g al día × ${G} días (también niños, por edad)`,ok:c.prot>=c.pNeed*G,g:'proteinaNinos',src:srcA('efsaS'),add:{kind:'Alimento'}});
  I({id:'frio',t:'Comida que no hace falta cocinar',q:lv===1?'Para el día entero':`Al menos para ${Math.min(G,3)} días, por si no se puede cocinar`,ok:c.dNoCook>=Math.min(G,lv===1?1:3),g:'envase',src:srcA('ue'),add:{kind:'Alimento',pre:{cocinar:'No'}}});
  if(lv>=3)I({id:'grupos',t:'Equilibrada por grupos',q:R.faltanGrupos.length?'Faltan: '+R.faltanGrupos.join(', '):'Todos los grupos',ok:!R.faltanGrupos.length,g:'grupos'});
  if((x.P||[]).some(bebe))tip.push('Bebés: leche o papillas aparte; Plan B no las calcula. Si toma leche de fórmula, el agua para prepararla ya está sumada.');
  if(x.dietTxt)tip.push(esc(x.dietTxt.trim()));
  if(poco)tip.push('Compra uno o dos envases de más cada semana de lo que ya coméis (Comisión Europea: pasos poco a poco y asequibles).');
  if(sitio)tip.push('Poco sitio: lo que más alimenta en menos espacio, como legumbres, arroz, pasta y frutos secos si nadie es alérgico ('+PB+').');
  if(prisa)tip.push('Paso corto: apunta tres latas que ya tengas en casa.')}
 else if(s==='cocina'){
  if(lv===1)I({id:'n1',t:'No hace falta todavía',q:'En 24 horas basta con comida que no se cocina',ok:true,g:'cocinaSinRed'});
  else I({id:'ck',t:'Cocinar sin red',q:`Para ${G} días, o solo comida que no se cocina. Sin datos, Plan B cuenta 1 hora de fuego al día`,ok:R.s.cocina.d>=G||R.s.comida.dNoCook>=G,g:'cocinaSinRed',add:{kind:'Forma de cocinar'}});
  if(R.s.cocina.boilH)tip.push(`${term('hervir','Hervir el agua')} suma ${fmtN(R.s.cocina.boilH)} h de fuego al día.`);
  if(R.s.cocina.eD)tip.push('La cocina eléctrica gasta de tus baterías: se suma al consumo de Energía y no se cuenta dos veces.');
  if(gasHome(x))tip.push('Nunca cocines con gas, carbón ni brasas en un sitio cerrado: el humo tiene monóxido de carbono.');
  if(hasO(h.cocina,'Eléctrica')&&!hasO(h.cocina,'Butano o propano')&&!hasO(h.cocina,'Gas natural'))tip.push('Tu cocina es eléctrica: sin luz no funciona.')}
 else if(s==='energia'){const E=R.s.energia,p=E.parts||{},need=E.need;
  if(need)tip.push(`${term('consumoBasico','Consumo')}: ${Math.round(need)} Wh/día = móviles ${p.movWh} + luz ${p.luzWh} (${LUZ_WH} Wh × persona)${p.encWh?' + encendidos '+Math.round(p.encWh):''}${p.medWh?' + médicos '+Math.round(p.medWh):''}${p.elecCookWh?' + cocina '+Math.round(p.elecCookWh):''}${p.ownNeed?' + con batería propia '+Math.round(p.ownNeed):''}.`);
  const tgt=need?need*G:null;
  I({id:'res',t:lv>=4?'Energía para 1 mes':'Reserva de energía',q:tgt?(lv>=4?`${fmtN(need*30)} Wh guardados (30 días), una placa probada o un generador`:`${fmtN(tgt/(1-LOSS7))} Wh de batería (${Math.round(need)} Wh × ${G} días + 15 % al cargar)`):'Faltan las personas del hogar',ok:need?(E.d>=G||E.dSol>=G||(lv>=4&&(R.placaProbada||R.generador))):null,g:lv>=4?'generador':'wh',add:{kind:'Batería portátil USB',pre:tgt?{wh:Math.ceil(tgt/(1-LOSS7))}:{}}});
  I({id:'luz',t:'Luz sin red: una por persona',q:`${n} linterna${n>1?'s':''} o frontal${n>1?'es':''}`,ok:R.luces>=n,g:'w',src:srcA('fema'),add:{kind:'Aparato',pre:{grupo:'Luz',n,conex:'Pilas AA o AAA'}}});
  I({id:'pilas',t:'Pilas de repuesto',q:'Para la radio y las linternas',ok:R.S('energia').some(r=>r.kind==='Pilas'),g:'pilasClase',src:srcA('fema'),add:{kind:'Pilas'}});
  (x.P||[]).forEach((pp,i)=>{if(pp.aparato==='Sí, con electricidad')I({id:'med'+i,t:'Aparato médico de '+pname(pp,i),q:'Apunta su potencia para sumarla al consumo',ok:R.S('energia').some(r=>r.grupo==='Aparato médico'&&num7(r.w)>0),g:'encendido',add:{kind:'Aparato',pre:{grupo:'Aparato médico',enc:'Sí'}}});
   if(pp.medFrio==='Sí')I({id:'nev'+i,t:'Nevera de medicinas',q:'Apunta su potencia: está encendida todo el día',ok:R.S('energia').some(r=>r.grupo==='Nevera de medicinas'&&num7(r.w)>0),g:'encendido',add:{kind:'Aparato',pre:{grupo:'Nevera de medicinas',enc:'Sí'}}})});
  if(x.frio)I({id:'abrigo',t:'Abrigo sin calefacción',q:`Mantas o sacos para ${n}`,ok:R.has('otros','Mantas o sacos de dormir'),g:'temporada',src:srcA('ue'),add:{sec:'otros',kind:'Seguridad',pre:{articulo:'Mantas o sacos de dormir',cantNum:n}},omit:1});
  if(x.calor)I({id:'fresco',t:'Fresco sin luz',q:'Abanico o ventilador a pilas o USB',ok:R.S('energia').some(r=>/ventil|abanic/i.test(r.recurso||'')),g:'temporada',src:srcA('ue'),add:{kind:'Aparato',pre:{grupo:'Otros',recurso:'Ventilador'}},omit:1})}
 else if(s==='botiquin'){(lv>=2?BOT_C7:BOT_B7).forEach(e=>I({id:e,t:e,q:e==='Vendas hemostáticas'?'No está en la lista de Cruz Roja: mira la explicación':'Lista de Cruz Roja',ok:R.has('botiquin',e),g:GL7[e]?e:'botiquin',src:e==='Vendas hemostáticas'?null:srcA('cr'),add:{kind:'Elemento',pre:{elemento:e}},omit:1,ok2:R.bot.includes(e)}));
  tip.push(`${term('sit','Información Toxicológica')}: ${TEL_SIT} (24 h). Si es grave, 112.`);
  tip.push('Sin medicamentos: el botiquín de Cruz Roja no los lleva. Los de cada persona van en Medicación.')}
 else if(s==='medic'){const ps=D.personas||[];ps.forEach((p,i)=>{if(p.med!=='Sí')return;const ms=(p.meds||[]).filter(m=>!m._del),d=ms.length?Math.min(...ms.map(m=>num7(m.dosis)?num7(m.unidades)/num7(m.dosis):0)):0;
   I({id:'m'+i,t:'Medicación de '+pname(p,i),q:`Para ${G} días${lv>=4?' (MCF)':''}${ms.length?' · ahora '+fmtN(d)+' días':''}`,ok:ms.length?d>=G:false,g:'medicacion',src:lv>=4?srcA('msb'):null,go:`medEdit('${p.id}')`})});
  if(!it.length)I({id:'nada',t:'Nadie toma medicación diaria',q:'Si cambia, márcalo en su ficha (Equipo › Personas)',ok:true,g:'medicacion'});
  tip.push('Plan B no da consejos de dosis: habla con tu médico o farmacéutico.')}
 else if(s==='com'){const adults=x.adultos||1,wk=R.S('com').filter(r=>/Walkie/.test(r.opcion||'')).length;
  I({id:'radio',t:'Radio AM/FM con pilas',q:'Para oír avisos oficiales sin internet',ok:R.com.includes('Radio AM/FM'),g:'Radio AM/FM',src:srcA('ue'),add:{kind:'Equipo',pre:{opcion:'Radio AM/FM'}}});
  I({id:'bat',t:'Batería cargada para los móviles',q:'Cuenta en Energía',ok:R.usbWh>0||R.stWh>0,g:'bateriaUSB',src:srcA('ue'),add:{sec:'energia',kind:'Batería portátil USB'}});
  if(lv>=3)I({id:'hablar',t:x.solo?'Una forma de avisar sin cobertura':'Hablar con los tuyos sin cobertura',q:x.solo?'Para tu señal de vida si no hay móvil':x.grande||adults>2?`${adults} walkies: uno por adulto (${PB})`:'Walkies, nodo de malla u otra',ok:x.solo?R.com.some(c=>COMG7[c]==='hablar'||COMG7[c]==='ayuda'):x.grande||adults>2?wk>=adults||R.com.some(c=>/malla|radioaficionado|satélite/.test(c)):R.com.some(c=>COMG7[c]==='hablar'&&c!=='Batería para móviles'),g:'Walkie PMR446',add:{kind:'Equipo',pre:{opcion:'Walkie PMR446'}}});
  if(lv>=4)I({id:'lejos',t:'Recibir y enviar avisos a distancia',q:'Cualquier forma, también un receptor de onda corta',ok:R.com.some(c=>['Estación de radioaficionado','Mensajero por satélite','Internet por satélite','Emisora CB 27 MHz','Receptor o escáner','Nodo de malla (radio de largo alcance)'].includes(c)),g:'Receptor o escáner',add:{kind:'Equipo',pre:{opcion:'Receptor o escáner'}}});
  if(h.mismaComp==='Sí')tip.push('Si todos usáis la misma compañía de móvil, una avería os deja a todos sin línea: ten una forma de hablar que no dependa de ella.')}
 else if(s==='doc'){I({id:'cont',t:'Contactos clave en papel',q:'Teléfonos de la familia, el médico y el contacto de fuera',ok:R.contactosPapel,g:'papel',add:{kind:'Documento',pre:{documento:'Contactos clave en papel',papel:'Sí',persona:'hogar'}}});
  if(lv>=2){const dk=(d)=>R.docs.some(r=>r.documento===d&&r.papel==='Sí'&&r.digital==='Sí');
   ['DNI o NIE','Tarjeta sanitaria','Seguros','Escrituras o contrato de alquiler'].forEach(d=>I({id:d,t:d,q:'Copia en papel y digital sin conexión',ok:dk(d),g:'digitalOff',add:{kind:'Documento',pre:{documento:d,papel:'Sí',digital:'Sí'}},omit:1}));
   if((x.P||[]).some(p=>p.med==='Sí'||p.cronica==='Sí'))['Informes médicos','Recetas'].forEach(d=>I({id:d,t:d,q:'Copia en papel y digital sin conexión',ok:dk(d),g:'digitalOff',add:{kind:'Documento',pre:{documento:d,papel:'Sí',digital:'Sí'}},omit:1}))}}
 else if(s==='dinero'){const e=R.s.dinero;
  tip.push(lv<=2?'Para qué: comprar lo básico si fallan las tarjetas o los cajeros (Comisión Europea).':lv===3?'Para qué: comprar si fallan las tarjetas o los cajeros y, en 2 semanas, también recibos o un transporte.':'En 1 mes no se pide más dinero: si no hay nada que comprar, no sirve. Cuenta el fondo de intercambio y lo que sabes hacer.');
  I({id:'efe',t:'Efectivo en billetes pequeños y monedas',q:e.eur?`Tienes ${fmtN(e.eur)} €`+(e.d!=null?` · ${fmtN(e.d)} días con tu gasto`:''):'Repartido entre casa y la mochila',ok:e.eur>0&&(e.d==null||e.d>=Math.min(G,14)),g:'efectivo',src:srcA('ue'),add:{kind:'Efectivo'}});
  I({id:'dig',t:'Un medio de pago digital sin conexión, donde exista',q:'La Comisión Europea lo recomienda cuando esté disponible',ok:null,g:'efectivo',src:srcA('ue')});
  if(lv>=4)I({id:'fondo',t:'Fondo de intercambio',q:'Cosas baratas que ya usas y vas rotando',ok:R.fondo||omitted('dinero','Fondo de intercambio'),g:'fondo',add:{kind:'Fondo de intercambio'},omit:1,oid:'Fondo de intercambio'})}
 else if(s==='evac'){
  if(lv>=2){I({id:'moch',t:'Mochila de evacuación por persona',q:`${n} mochila${n>1?'s':''}${x.pets.length?' y transportín o correa para los animales':''}`,ok:R.mochilas>=n,g:'mochila',src:srcA('ue'),add:{kind:'Mochila'}});
   I({id:'punto',t:'Punto de encuentro y contacto de fuera',q:x.solo?'Y una señal de vida diaria con tu contacto':'En el plan sin red',ok:R.puntoExt,g:x.solo?'senal':'red',go:"go('g');gs('plan')"})}
  if(lv>=3)I({id:'ruta',t:'Rutas probadas y destino',q:'Recorridas de verdad, a pie o en vehículo',ok:R.rutaProbada&&R.destino,g:'rutaProbada',add:{kind:'Ruta'}});
  if(x.grande||x.helpQ)I({id:'cuida',t:'Quién se encarga de quién al salir',q:x.helpQ?'Necesitan ayuda: '+x.helpQ:'En hogares grandes, cada adulto sabe a quién lleva',ok:ans(h.quienCuida),g:'red',go:"go('e')"})}
 else if(s==='otros'){
  I({id:'silbato',t:'Silbato',q:'Para pedir ayuda sin gastar voz',ok:R.has('otros','Silbato'),g:'seguridad',src:srcA('fema'),add:{kind:'Seguridad',pre:{articulo:'Silbato',cantNum:n}},omit:1,oid:'Silbato'});
  if(lv>=2)[['Mascarilla de protección facial',n],['Llave inglesa o alicates',1],['Abrelatas manual',1],['Plástico y cinta adhesiva',1]].forEach(([a,q])=>I({id:a,t:a,q:'Ready.gov (FEMA)',ok:R.has('otros',a),g:GL7[a]?a:'seguridad',src:srcA('fema'),add:{kind:'Seguridad',pre:{articulo:a,cantNum:q}},omit:1,oid:a}));
  if(x.frio)I({id:'mantas',t:'Mantas o sacos de dormir',q:`Para ${n}`,ok:R.has('otros','Mantas o sacos de dormir'),g:'temporada',src:srcA('ue'),add:{kind:'Seguridad',pre:{articulo:'Mantas o sacos de dormir',cantNum:n}},omit:1,oid:'Mantas o sacos de dormir'});
  if(lv>=4)I({id:'rep',t:'Herramientas para reparar',q:'Un kit para mantener y arreglar cosas',ok:R.reparar,g:'otros',add:{kind:'Seguridad',pre:{articulo:'Herramientas para reparar'}},omit:1,oid:'Herramientas para reparar'})}
 it.forEach(o=>{if(o.omit&&!o.oid)o.oid=o.add&&o.add.pre&&(o.add.pre.elemento||o.add.pre.articulo||o.add.pre.documento)||o.t});
 return{it,tip,warn}}
function ptnHtml(s,R){const x=X(),P=ptnFor(s,R,x);ptn8[s]=P;const lv=R.lv;
 const head=`Para tu nivel · N${lv}${zOn()?' '+esc(zName(lv)):' · '+esc(NIVT8[lv-1])}`;
 let h=`<section class="card ptn"><h2 class="k">${head}</h2>`;
 if(s==='higiene'||s==='agua')h+=`<div class="chips7" role="group" aria-label="Si se corta el agua, ¿cómo os lavaríais?">${Object.keys(HIGF8).map(k=>`<button type="button" class="${x.higF===k?'on':''}" aria-pressed="${x.higF===k}" onclick="setHig('${esc(k)}')">${esc(k)}</button>`).join('')}</div>`;
 h+=P.warn.map(w=>`<p class="xs rev">${w}</p>`).join('');
 h+=`<ul class="ptnl">${P.it.map((o,i)=>{const om=o.omit&&omitted(s,o.oid),st=om?'–':o.ok==null?'·':o.ok?'✓':'▲';
  return `<li class="${o.ok===false&&!om?'falta':''}"><span class="st" aria-hidden="true">${st}</span><div class="tx"><b>${esc(o.t)}</b> <button type="button" class="qm" aria-label="¿Qué es? ${esc(o.t)}" onclick="ptnWhy('${s}',${i})">?</button><span class="xs mut db">${om?'Omitido: '+esc(D.omit[omitK(s,o.oid)].m):esc(o.q)}</span></div><div class="ac">${!om&&(o.add||o.go)&&o.ok!==true?`<button type="button" class="gh sm" onclick="ptnAdd('${s}',${i})">${o.go?'Ir':'Añadir'}</button>`:''}${o.omit&&o.ok!==true||om?`<button type="button" class="link xs" onclick="ptnOmit('${s}',${i})">${om?'Deshacer':'Omitir'}</button>`:''}</div></li>`}).join('')}</ul>`;
 h+=P.tip.map(t=>`<p class="xs mut">${t}</p>`).join('');
 return h+`<p class="xs mut">Toca «?» para ver de dónde sale cada cifra; lo que no tiene fuente oficial dice «${PB}». El objetivo no baja: con poco dinero, sitio o tiempo solo cambia el camino.</p></section>`}
function setHig(k){D.hogar.higieneForma=k;touch(D.meta.hogar||(D.meta.hogar={}));save();render()}
function ptnWhy(s,i){const o=(ptn8[s]||{it:[]}).it[i];if(!o)return;const g=GL7[o.g];
 ask(`<h2>${esc(o.t)}</h2><p>${esc(o.q)}</p>${g?`<p class="sm">${esc(g[1])}</p>`:''}${o.src?`<p class="sm"><a href="${esc(o.src[1])}" target="_blank" rel="noopener">${esc(o.src[0])} ↗</a></p>`:g&&g[2]?`<p class="sm"><a href="${esc(g[2][1])}" target="_blank" rel="noopener">${esc(g[2][0])} ↗</a></p>`:''}`,'Cerrar',null)}
function ptnAdd(s,i){const o=(ptn8[s]||{it:[]}).it[i];if(!o)return;if(o.go){Function(o.go)();return}const a=o.add||{};edit7(a.sec||s,null,a.kind||null,null,Object.assign({},a.pre||{}))}
async function ptnOmit(s,i){const o=(ptn8[s]||{it:[]}).it[i];if(!o)return;D.omit=D.omit||{};const k=omitK(s,o.oid);
 if(D.omit[k]){delete D.omit[k];save();render();return}
 const m=prompt(`Omitir «${o.t}». ¿Por qué? (por ejemplo: «ya tengo otra cosa» o «no me hace falta»)`,'');if(m==null)return;if(m.trim().length<3)return note('Escribe el motivo: queda anotado.');
 D.omit[k]={m:m.trim(),f:today()};save();checkLevel();save();render();note('Omitido. No resta y queda anotado.')}

/* ===================== Refugio (antes Registro) ===================== */
V.r=function(){const s=sec7,rows=D.registro.map((r,i)=>[r,i]).filter(([r])=>secOf(r)===s),revS=new Set(D.registro.filter(r=>!r._del&&porRev(r)).map(secOf));
 let h=`<h1 class="sr">Refugio</h1><div class="chips7" role="tablist">${SEC7.map(([k,l])=>`<button type="button" role="tab" aria-selected="${k===s}" class="${k===s?'on':''}${revS.has(k)?' hasrev':''}" onclick="sec7='${k}';render()">${l}</button>`).join('')}</div>`;
 const R=refugio(),d=R.s[s];if(d&&d.d!==undefined){const G=s==='agua'?R.goalW:R.goal;h+=`<p class="sm">${term(s==='medic'?'medicacion':'refugio',SECN7[s])}: <b>${d.d==null?(s==='dinero'?'sin días: solo se calculan si pones un gasto diario':s==='medic'?'nadie toma medicación diaria':'sin datos'):fmtN(d.d)+' de '+G+' días'}</b></p>`}
 h+=cuenta8(s,R);h+=ptnHtml(s,R);
 if(s==='medic')return h+medsHtml();
 if(s==='energia')h+=energiaHtml(R);
 if(s==='dinero')h+=`<details class="card"><summary class="xs">${term('gastoDia','Gasto diario por persona (opcional)')}</summary><input id="g_dia" type="number" inputmode="decimal" min="0" step="any" aria-label="Gasto diario por persona en euros" value="${esc(D.hogar.gastoDia||'')}" onchange="D.hogar.gastoDia=this.value;touch(D.meta.hogar||(D.meta.hogar={}));save();render()"><p class="xs mut">${R.s.dinero.d==null?'Sin gasto puesto: Plan B no calcula días de dinero.':`Tienes ${fmtN(R.s.dinero.eur)} €: ${fmtN(R.s.dinero.d)} días.`}</p></details>`;
 if(s==='comida'){const c=R.s.comida;h+=`<p class="xs mut">Días = el menor entre los días por kcal y los días por proteína. ${c.legD?'Incluye '+fmtN(c.legD)+' días de comida apuntada en la versión anterior: edítala y pásala a envases. ':''}</p>`}
 h+=`<div class="row">${kindsOf(s).map(k=>`<button type="button" class="btn sm" onclick="edit7('${s}',null,'${esc(k)}')">+ ${esc(k)}</button>`).join('')}</div>`;
 if(!rows.length)return h+`<div class="card center"><p class="sm mut">Nada apuntado en ${esc(SECN7[s])}.</p></div>`;
 return h+rows.map(([r,i])=>{const e=estOf(r),bad=e==='Por revisar';return `<article class="card ${bad?'rev':''}"><div class="row sb"><h3 class="h3">${esc(r.recurso||r.kind||'—')}</h3><span class="led">${term(bad?'porRevisar':e==='Comprobado'?'comprobado':'declarado',e)}</span></div>
  <p class="xs">${esc(rowSum8(r))}${cadPronto(r)?' · '+term('cadPronto','Caduca pronto'):''}${r.caduca?' · caduca '+fmtD(r.caduca):''}${r.llenado?' · llenada el '+fmtD(r.llenado)+(plusM(r.llenado,LLENADO_M)<today()?'; tocaba cambiarla el ':'; cámbiala antes del ')+fmtD(plusM(r.llenado,LLENADO_M)):''}${r.kind==='Envases'&&!r.origen?' · <b>edítala</b> e indica si es comprada o del grifo':''}${r.kind==='Pilas'&&r.clase==='Recargables'&&r.revision?' · cargar antes del '+fmtD(r.revision):''}</p>${r.legado&&!r.kind?'<p class="xs mut">Fila de antes de la 7.0.0: edítala para pasarla al formulario nuevo.</p>':''}${r.sinCantidad?'<p class="xs mut">Sin cantidad: no da XP hasta que la pongas.</p>':''}
  ${!isMine(r)?'<p class="xs mut">Personal de otra persona · solo lectura</p>':`<div class="row"><button type="button" class="gh sm" onclick="edit7('${s}',${i})">Editar</button>${due(r)&&!expired(r)?`<button type="button" class="gh sm" onclick="revisado(${i})">${r.kind==='Pilas'&&r.clase==='Recargables'?'Cargadas hoy':r.kind==='Envases'&&r.llenado?'La he cambiado hoy':'Revisado hoy'}</button>`:''}<button type="button" class="gh sm" onclick="del(${i})">Borrar</button></div>`}</article>`}).join('')};
function rowSum8(r){let t=rowSum(r);const k=r.kind;
 if(k==='Aparato'&&r.enc==='Sí')t+=' · encendido 24 h';if(k==='Pilas'&&r.clase)t+=' · '+r.clase.toLowerCase();if(k==='Generador')t=[r.w?r.w+' W':'',r.combustible?r.combustible+' L':''].filter(Boolean).join(' · ');
 if(['Seguridad','Fondo de intercambio'].includes(k))t=[r.articulo||'',r.cantNum?r.cantNum+' ud.':''].filter(Boolean).join(' · ');
 if(secOf(r)==='com'&&r.enc==='Sí')t+=' · encendido 24 h ('+(r.w||'?')+' W)';return t}
const energiaHtml7=energiaHtml;energiaHtml=function(R){return energiaHtml7(R).replace(/onclick="D\.cfg\.cielo=/g,'onclick="D.cfg.cieloMarcado=1;D.cfg.cielo=').replace(`${term('perdidas','pérdidas')} 15 %`,`${term('perdidas','pérdidas')} 15 % al cargar`)};

/* ===================== Formulario: «?» al lado, casilla Encendido, campos que dependen de otro ===================== */
function edit7(s,i,kind,mid,pre){const r=i==null?Object.assign({sec:s,kind},pre||{}):D.registro[i];kind=kind||r.kind||kindsOf(s)[0];const flds=((F7[s]||F7.otros).kinds[kind])||[];
 const cand=D.misiones.filter(q=>{const d=defK(q.key);return d&&d.ty==='i'&&(+q.id===+(r.mision??mid)||(!q.hecha&&SEC2FR_inv(d.f)===s))});
 const selId=r.mision!=null&&r.mision!==''?+r.mision:mid!=null?+mid:(i==null&&cand.length===1?cand[0].id:null);
 const opts=cand.map(q=>`<option value="${q.id}" ${selId===q.id?'selected':''}>N${defK(q.key).lv} · ${esc(defK(q.key).t)}</option>`).join('');
 const fld=([k,l,o,g,opt,c])=>{const id='e_'+k,v=r[k]??'',wrap=x=>c?`<div class="fw" data-ck="${c[0]}" data-cv="${esc(c[1])}">${x}</div>`:x,lab=`<div class="lrow"><label for="${id}">${esc(l)}${opt?' · opcional':''}</label>${g&&g[0]!=='@'?qm(g,l):''}</div>`;
  if(o==='chk')return wrap(`<div class="lrow"><label class="chk1"><input type="checkbox" id="${id}" ${v==='Sí'||(v===''&&['Aparato médico','Nevera de medicinas'].includes(r.grupo))?'checked':''}> ${esc(l)}</label>${g?qm(g,l):''}</div>`);
  if(opt==='multi'||k==='etq')return wrap(`<fieldset class="q"><div class="lrow"><legend class="k">${esc(l)}</legend>${g?qm(g,l):''}</div>${o.map(x=>`<label class="chk1"><input type="checkbox" name="${id}" value="${esc(x)}" ${(Array.isArray(v)?v:[]).includes(x)?'checked':''}> ${esc(x)}</label>`).join('')}</fieldset>`);
  if(typeof o==='string'&&o[0]==='@'||Array.isArray(o)){const L=Array.isArray(o)?o.map(x=>[x,x]):optList(o,r);return wrap(lab+`<select id="${id}"><option value="">— Elige —</option>${L.map(([a,b])=>`<option value="${esc(a)}" ${String(v)===String(a)?'selected':''}>${esc(b)}</option>`).join('')}</select>${g==='@com'?'<p class="xs mut" id="e_opc_x"></p>':''}`)}
  return wrap(lab+`<input id="${id}" type="${o==='date'?'date':o==='num'?'number':'text'}" ${o==='num'?'inputmode="decimal" step="any" min="0"':''} value="${esc(v)}">`)};
 $('#nav').hidden=true;document.body.classList.add('nonav');
 $('#v').innerHTML=`<section class="form" aria-labelledby="et"><div class="k">${esc(SECN7[s]||'Refugio')} · ${esc(kind)}</div><h1 class="h2" id="et">${i==null?'NUEVO':'EDITAR'}</h1>
 ${kindsOf(s).length>1&&i==null?`<div class="chips7">${kindsOf(s).map(k=>`<button type="button" class="${k===kind?'on':''}" onclick="edit7('${s}',null,'${esc(k)}',${mid??'null'})">${esc(k)}</button>`).join('')}</div>`:''}
 <label for="e_recurso">Nombre</label><input id="e_recurso" value="${esc(r.recurso||'')}" placeholder="Cómo lo llamas en casa">${flds.map(fld).join('')}
 <label for="e_ubicacion" id="l_ubi">Dónde está</label><input id="e_ubicacion" value="${esc(r.ubicacion||'')}">
 ${cand.length?`<label for="e_mision">¿Para qué misión cuenta? · opcional</label><select id="e_mision"><option value="">— Ninguna —</option>${opts}</select>`:'<input type="hidden" id="e_mision" value="">'}
 <p class="xs mut">«Ya lo tengo» lo deja ${term('declarado','Declarado')}: cuenta para los días. Si cuenta para una misión, apunta cuánto, dónde y cuándo caduca: así pasa a ${term('comprobado','Comprobado')}.</p>
 <div class="row end"><button type="button" class="gh" onclick="render()">Cancelar</button><button type="button" class="btn" onclick="sv7('${s}',${i??'null'},'${esc(kind)}')">Ya lo tengo</button></div></section>`;
 const sel=$('#e_opcion');if(sel){const up=()=>{const g=GL7[sel.value];$('#e_opc_x').textContent=g?g[1]:''};sel.onchange=up;up()}
 const ubi=()=>{const m=$('#e_mision');$('#l_ubi').textContent=m&&m.value?'Dónde está (hace falta para la misión)':'Dónde está · opcional'};const ms=$('#e_mision');if(ms&&ms.tagName==='SELECT')ms.addEventListener('change',ubi);ubi();
 const deps=[...document.querySelectorAll('.fw[data-ck]')],ref=()=>deps.forEach(el=>{const c=$('#e_'+el.dataset.ck);el.hidden=!(c&&el.dataset.cv.split('|').includes(c.value))});
 [...new Set(deps.map(el=>el.dataset.ck))].forEach(k=>{const c=$('#e_'+k);if(c)c.addEventListener('change',ref)});ref();
 const gr=$('#e_grupo'),en=$('#e_enc');if(gr&&en&&i==null)gr.addEventListener('change',()=>{if(['Aparato médico','Nevera de medicinas'].includes(gr.value))en.checked=true});
 window.scrollTo(0,0)}
function sv7(s,i,kind){const old=i==null?{}:D.registro[i],r=Object.assign({},old),flds=((F7[s]||F7.otros).kinds[kind])||[];
 r.sec=s;r.kind=kind;r.frente=SEC2FR[s]||'seg';r.recurso=$('#e_recurso').value.trim();r.ubicacion=$('#e_ubicacion').value.trim();
 flds.forEach(([k,,o])=>{if(k==='etq'){r[k]=[...document.querySelectorAll('input[name="e_'+k+'"]:checked')].map(e=>e.value);return}const el=$('#e_'+k);if(!el)return;const fw=el.closest('.fw');if(fw&&fw.hidden){const ctl=$('#e_'+fw.dataset.ck);if(ctl&&ctl.value)delete r[k];return}if(o==='chk'){r[k]=el.checked?'Sí':'No';return}r[k]=o==='num'?(el.value===''?'':num7(el.value)):el.value.trim()});
 if(!r.recurso)r.recurso=r.elemento||r.opcion||r.articulo||r.documento||r.tipo||r.metodo||(r.grupo?r.grupo:'')||kind;
 const main=['n','litros','wh','mah','importe','w','dias','cant','unidades','cantNum','combustible'].map(k=>num7(r[k])).find(v=>v>0);if(main)r.cantNum=String(main);
 const mi=$('#e_mision').value;if(mi&&!r.ubicacion){note('Para la misión hace falta saber dónde está.');$('#e_ubicacion').focus();return}
 r.mision=mi?+mi:'';r.misionKey=mi?keyOfMid(+mi)||'':'';
 if(!r.estado||r.estado==='Deseo')r.estado='Tengo';if(!r.est||r.est==='Falta')r.est='Declarado';if(!r.confirmado)r.confirmado=today();
 if(s==='energia'&&kind==='Placa solar'&&num7(r.subio)>0&&r.fechaPrueba)r.est='Comprobado';
 if(kind==='Envases'&&r.llenado&&r.origen==='Del grifo (la llenaste tú)'){r.revision=plusM(r.llenado,LLENADO_M)}else if(kind==='Pilas'&&r.clase==='Recargables'){if(!r.revision||r.revision<=today()||!old.clase)r.revision=plusM(today(),3)}else if(!r.revision||r.revision<=today())r.revision=revDefault(r);
 delete r.legado;if(main)delete r.sinCantidad;if(!r.id)r.id=uid();touch(r);
 if(i==null)D.registro.push(r);else D.registro[i]=r;save();checkLevel();save();render();note('Guardado.')}
/* Recargables: «Cargadas hoy» vuelve a poner el recordatorio a 3 meses */
const revisado7=revisado;revisado=function(i){const r=D.registro[i];if(r&&r.kind==='Pilas'&&r.clase==='Recargables'){r.revision=plusM(today(),3);r.confirmado=today();touch(r);save();checkLevel();save();render();note('Hecho. Te avisamos en 3 meses.');return}return revisado7(i)};

/* ===================== Misión: una línea y un solo botón ===================== */
const Vm7=V.m;V.m=function(){let h=Vm7();
 h=h.replace('<section class="card inv"><h2 class="k">Por revisar','<section class="card rev"><h2 class="k">Por revisar').replace(/class="gh inv sm" onclick="(edit|revisado)/g,'class="gh sm" onclick="$1');
 const d=viewKey?defK(viewKey):activeDef();if(!d||d.ty!=='i')return h;const m=inst(d.k);if(!m)return h;
 const ev=linked(m.id),ok=ev.filter(validRow),done=!!m.hecha;
 const card=`<div class="card"><div class="k">Lo que tienes</div><p class="sm">${ok.length?`Apuntado: ${ok.length} cosa${ok.length>1?'s':''} con cuánto, dónde y cuándo.`:'Para completarla, apunta lo que tienes: cuánto, dónde y cuándo caduca.'}</p>${ev.map(r=>`<p class="xs ${validRow(r)?'':'rev'}">· ${esc(r.recurso)}${r.cantNum?' · '+esc(r.cantNum)+' '+esc(r.unidad||''):''}${r.ubicacion?' · '+esc(r.ubicacion):''}${validRow(r)?'':' · falta dónde, cuánto o está por revisar'}</p>`).join('')}</div>`;
 h=h.replace(/<div class="card"><div class="k">Prueba en el registro<\/div>[\s\S]*?<\/p>(?:<p class="xs mut">[\s\S]*?<\/p>)*<\/div>/,card);
 const one=!done?(ok.length?`<button type="button" class="btn wide" onclick="completar(${m.id})">Completar misión</button><button type="button" class="link" onclick="edit(null,${m.id})">Apuntar algo más</button>`:`<button type="button" class="btn wide" onclick="edit(null,${m.id})">Apuntar lo que tengo</button>`):`<button type="button" class="gh" onclick="edit(null,${m.id})">Apuntar algo más</button>`;
 h=h.replace(/<div class="row"><button type="button" class="gh" onclick="edit\(null,\d+\)">\+ Prueba al registro<\/button>[\s\S]*?<\/div><button type="button" class="btn wide" onclick="completar\(\d+\)">[^<]*<\/button>/,one)
  .replace(/<div class="row">(?:<button type="button" class="gh" onclick="hechoYo\(\d+\)">[^<]*<\/button>)?<button type="button" class="gh" onclick="edit\(null,\d+\)">\+ Prueba al registro<\/button><\/div>/,one)
  .replace(' Si ya lo has usado tú, márcalo para subir a Aprendido.','');
 return h};

/* ===================== Niveles: nombres zombi y misiones zombi ===================== */
const Vn7=V.n;V.n=function(){let h=Vn7();if(!zOn())return h;D.zm=D.zm||{};
 const lv=D.fin?(D.n5on?5:4):Math.min(D.nivel,4);
 return `<section class="card zcard"><div class="k">Modo zombi · ${esc(zName(lv))}</div><p class="xs mut">Pide lo mismo que tu nivel real. Estas misiones son extra: no cuentan para subir y no dan XP.</p><ul class="ptnl">${ZMIS8.filter(z=>z[0]<=lv).map(([l,k,t,dsc])=>`<li><span class="st">${D.zm[k]?'✓':'·'}</span><div class="tx"><b>${esc(t)}</b><span class="xs mut db">N${l} · ${esc(dsc)}</span></div><div class="ac"><button type="button" class="gh sm" onclick="D.zm['${k}']=D.zm['${k}']?0:'${today()}';save();render()">${D.zm[k]?'Quitar':'Hecha'}</button></div></li>`).join('')}</ul></section>`+h};

/* ===================== «Ha pasado algo» ===================== */
function hpaHave(id,R,x){const b=[];const E=R.s.energia;
 if(id==='luz'){if(R.luces)b.push(R.luces+' luces');if(E.usable)b.push(Math.round(E.usable)+' Wh de batería'+(E.d!=null&&isFinite(E.d)?' ('+fmtN(E.d)+' días)':''))}
 if(id==='agua'||id==='fuga'){if(R.s.agua.L)b.push(fmtN(R.s.agua.L)+' L de agua'+(R.s.agua.d!=null?' ('+fmtN(R.s.agua.d)+' días)':''));if(R.potab)b.push('forma de potabilizar')}
 if(id==='humo'&&R.has('otros','Extintor'))b.push('extintor');if(id==='humo'&&R.has('otros','Detector de humo'))b.push('detector de humo');
 if(id==='sincom'&&R.com.length)b.push(R.com.join(', '));if(id==='pagos'&&R.s.dinero.eur)b.push(fmtN(R.s.dinero.eur)+' € en efectivo');
 if(id==='salir'&&R.mochilas)b.push(R.mochilas+' mochila'+(R.mochilas>1?'s':''));if(id==='sismo'&&R.has('otros','Silbato'))b.push('silbato');
 return b.length?'Tienes: '+b.join(' · '):''}
function openHPA(){const el=$('#emg'),R=refugio(),x=X();tree={id:null,node:null,hist:[]};
 const L=HPA8.filter(([,,,c])=>c!=='gas'||gasHome(x));
 el.innerHTML=`<div class="eh"><h1 class="h2" id="emgt" tabindex="-1">HA PASADO ALGO</h1><button type="button" class="gh sm" onclick="closeEmg()">Cerrar</button></div>${call112()}<p class="sm mut">Elige lo que pasa en casa. Funciona sin internet.</p><div class="elist">${L.map(([id,t,tr])=>{const hv=hpaHave(id,R,x);return `<button type="button" class="ebtn fb" onclick="${tr==='tiempo'?'hpaTiempo()':`tStart('${tr}')`}"><span><b>${esc(t)}</b>${hv?`<span class="xs mut db">${esc(hv)}</span>`:''}${id==='agua'?'<span class="xs mut db">Si sale turbia o huele raro, no la bebas sin potabilizar.</span>':''}</span><span aria-hidden="true">›</span></button>`}).join('')}</div>`;
 el.hidden=false;document.body.classList.add('lock');const t=$('#emgt');if(t)t.focus()}
function hpaTiempo(){const el=$('#emg');el.innerHTML=`<div class="eh"><h1 class="h2" id="emgt" tabindex="-1">TEMPORAL, LLUVIA O CALOR</h1><button type="button" class="gh sm" onclick="openHPA()">Volver</button></div>${call112()}<p class="sm mut">Sigue los avisos oficiales de tu zona.</p><div class="elist"><button type="button" class="ebtn fb" onclick="tStart('inunda')"><b>Lluvia fuerte o agua en la calle</b><span aria-hidden="true">›</span></button><button type="button" class="ebtn fb" onclick="tStart('calor')"><b>Calor extremo</b><span aria-hidden="true">›</span></button><button type="button" class="ebtn fb" onclick="tStart('apagon')"><b>Viento y se ha ido la luz</b><span aria-hidden="true">›</span></button></div>`;const t=$('#emgt');if(t)t.focus()}

/* ===================== Grupo: Hogar y Amigos, vive solo, hogares grandes ===================== */
const Ve7=V.e;V.e=function(){const x=X(),mem=Object.values(D.unidad&&D.unidad.miembros||{});let h=Ve7();
 h=h.replace(/Unidad · quienes vivís juntos/gi,'Hogar · quiénes vivís juntos').replace(/Nombre de la unidad/gi,'Nombre del hogar').replace(/La Unidad lleva datos/g,'El Hogar lleva datos').replace(/en la unidad/g,'en el hogar')
  .replace('Enviar archivo</button><button type="button" class="gh" onclick="$(\'#impx2\')','Enviar archivo</button><button type="button" class="gh" onclick="$(\'#impx2\')');
 if(!mem.length)h=h.replace(/<button type="button" class="gh sm" onclick="parDone\('([a-z_]+)'\)" disabled>Hecha<\/button>/g,`<button type="button" class="gh sm" onclick="parAmigo('$1')">Con un amigo</button>`).replace('<p class="xs mut">Se activan cuando haya otro miembro en la unidad.</p>','<p class="xs mut">Sin nadie más en el hogar, puedes hacerlas con un amigo (opcional).</p>').replace('<p class="xs mut">Se activan cuando haya otro miembro en el hogar.</p>','<p class="xs mut">Sin nadie más en el hogar, puedes hacerlas con un amigo (opcional).</p>');
 if(mem.length>=2||x.grande)h=h.replace('>Misiones en pareja<','>Misiones en grupo<');
 let add='';
 if(x.solo)add+=`<section class="card"><h2 class="k">${term('senal','Señal de vida')}</h2><p class="sm">Vives solo: acuerda con tu contacto de fuera una hora para avisar de que estás bien.</p><label for="sv_hora" class="k">Hora acordada</label><input id="sv_hora" type="time" value="${esc(D.hogar.senalHora||'')}" onchange="D.hogar.senalHora=this.value;touch(D.meta.hogar||(D.meta.hogar={}));save()"><p class="xs mut">Contacto de fuera: ${esc(ans(D.hogar.contactoExt)&&D.hogar.contactoExt!=='Aún no hay'?D.hogar.contactoExt:'sin apuntar (Equipo › Red de apoyo)')}.</p><button type="button" class="gh sm" onclick="go('g');gs('sim')">Simulacro: avisar a tu contacto</button></section>`;
 if(x.grande||x.helpQ)add+=`<section class="card"><h2 class="k">Al salir, quién se encarga de quién</h2>${x.helpQ?`<p class="xs">Necesitan ayuda: ${esc(x.helpQ)}.</p>`:''}<textarea id="qc" rows="3" aria-label="Quién se encarga de quién" placeholder="Ej.: Ana lleva a Leo; Luis ayuda a la abuela" onchange="D.hogar.quienCuida=this.value.trim();touch(D.meta.hogar||(D.meta.hogar={}));save()">${esc(D.hogar.quienCuida||'')}</textarea></section>`;
 const i=h.indexOf('<section class="card"><div class="k">Misiones en');return add&&i>-1?h.slice(0,i)+add+h.slice(i):h+add};
async function parAmigo(k){const d=PAR.find(q=>q.k===k);const who=prompt(`«${d.t}» con un amigo. ¿Con quién la habéis hecho?`,'');if(!who||who.trim().length<2)return;
 D.par=(D.par||[]).filter(p=>p.id!==k);D.par.push(touch({id:k,hecha:true,fecha:today(),quienes:[D.dev],nombres:[D.cfg.alias||'tú',who.trim()],amigo:1}));save();render();note('Anotada.')}
/* Tarjeta de amigo: nunca vacía (alias por defecto y XP por áreas nuevas, también de tarjetas antiguas) */
const myCard7=myCard;myCard=function(){if(!D.cfg.alias){const me=(D.personas||[]).find(p=>p.id===D.yo);if(me&&ans(me.alias))D.cfg.alias=me.alias}return myCard7()};
const applyAmigo7=applyAmigo;applyAmigo=function(C){if(C&&C.xp){const nx={};ATR7.forEach(([k])=>nx[k]=0);let old=false;Object.entries(C.xp).forEach(([k,v])=>{const m=AMAP7[k];if(!m||(Object.keys(m).length===1&&m[k]===1)){if(nx[k]!=null)nx[k]+=num7(v)}else{old=true;Object.entries(m).forEach(([kk,f])=>{nx[kk]=(nx[kk]||0)+num7(v)*f})}});if(old||Object.keys(C.xp).some(k=>nx[k]==null))C.xp=Object.fromEntries(Object.entries(nx).map(([k,v])=>[k,Math.round(v)]))}if(C&&!C.alias)C.alias='Amigo sin nombre';return applyAmigo7(C)};
const amigosView7=amigosView;amigosView=function(){const me=myCard();const prev=`<section class="card"><div class="k">Tu tarjeta</div><p class="sm"><b>${esc(me.alias||'Sin alias')}</b> · Nivel ${me.fin?'4 ✓':me.nivel} · ${esc(me.rango||'')} · ${me.total} XP</p><p class="xs mut">${ATR7.map(([k,l])=>l+' '+(me.xp[k]||0)).join(' · ')}</p>${me.alias?'':'<p class="xs rev">Pon tu alias arriba para que tu tarjeta no llegue vacía.</p>'}</section>`;
 return amigosView7().replace('<h2 class="k sec">Amigos · fuera de casa</h2>','<h2 class="k sec">Amigos · fuera de casa</h2>'+prev).replace(/XP por atributo/g,'XP por área')};

/* ===================== Perfil: versión en Sistema, aviso legal, rojo de noche, modo zombi ===================== */
privacyView=(pv=>function(){return pv().replace(/<section class="card"><div class="k">Versión<\/div>[\s\S]*?<\/section>/,'')})(privacyView);
const Vf8=V.f;V.f=function(){let h=Vf8();if(sub==='datos')return h;
 const sw=(k,t,d)=>`<div class="row sb"><div><b>${t}</b><p class="xs mut">${d}</p></div><button type="button" class="sw ${D.cfg[k]?'on':''}" role="switch" aria-checked="${!!D.cfg[k]}" aria-label="${t}" onclick="D.cfg.${k}=!D.cfg.${k};save();applyCfg();render()"><i></i></button></div>`;
 h=h.replace('<h2 class="k sec">Ajustes</h2>','<h2 class="k sec">Ajustes</h2><section class="card">'+sw('night','Rojo de noche','Todo en rojo apagado sobre negro para no perder la visión nocturna.')+'<hr>'+sw('zombie','Modo zombi','Los niveles se llaman Primera noche, Aguantar el asedio, Refugio seguro, Colonia y Renacer, con misiones extra. Pide lo mismo que tu nivel real. Lleva rojo de noche.')+'</section><section class="card"><button type="button" class="link" onclick="showLegal()">Aviso legal</button></section>');
 h=h.replace(/(<p class="xs mut">[^<]*?) · Versión [0-9.]+<\/p>/,`$1</p><p class="xs mut">Versión ${APPV} · última revisión de contenidos: ${fmtD(REV8)}</p>`);
 h=h.replace('<button type="button" class="gh sm" onclick="wipe()">Borrar todos mis datos</button>',updHtml().replace(/^<section class="card">|<\/section>$/g,'')+'<hr><button type="button" class="gh sm" onclick="wipe()">Borrar todos mis datos</button>');
 return h};
const updHtml7=updHtml;updHtml=function(){return updHtml7().replace('antes de la 7.0.0',`antes de la 7.0.0`).replace('</p></section>',`${LS.getItem(BK8)?` <button type="button" class="link" onclick="dlCopy('${BK8}')">antes de la 8.0.0</button>`:''}</p></section>`).replace(' ninguna todavía.',LS.getItem(BK8)?'':' ninguna todavía.')};
const applyCfg7=applyCfg;applyCfg=function(){applyCfg7();const c=D&&D.cfg||{};document.documentElement.classList.toggle('night',!!(c.night||c.zombie));document.documentElement.classList.toggle('zombie',!!c.zombie);applyNames()};
function showLegal(first){ask(LEGAL8(),'Entendido',null).then(()=>{try{LS.setItem(LEGAL_K,REV8)}catch(e){}})}

/* ===================== Nombres de pestañas ===================== */
NAV.forEach(n=>{if(n[0]==='r')n[1]='Refugio';if(n[0]==='e')n[1]='Equipo'});
const go7=go;go=function(k){go7(k);try{if(k==='r')history.replaceState(null,'','#refugio');if(k==='e')history.replaceState(null,'','#grupo')}catch(e){}};

/* ===================== Migración 7 → 8 (copia antes; no se borra nada) ===================== */
function migrate8(){const was=D.ver||7;D.mig8={de:was,at:today()};
 (D.personas||[]).forEach(p=>{
  if(!p.diaDonde&&p.ocup){const m={'Trabaja fuera':'Fuera de casa','Estudia fuera':'Fuera de casa','En casa':'En casa','Teletrabajo':'En casa','Mixto':'A veces fuera y a veces en casa'}[p.ocup];if(m)p.diaDonde=m;else if(p.ocup===NS)p.diaDonde=NS}
  if(!p.vuelta&&p.dist&&['Fuera de casa','A veces fuera y a veces en casa'].includes(p.diaDonde)){const m={'Menos de 2 km':'Menos de 30 min','2 a 10 km':'De 30 min a 2 h','10 a 30 km':'Más de 2 h','Más de 30 km':'Más de 2 h'}[p.dist];if(m){p.vuelta=m;p.vueltaEstimada=1}}
  if(!p.noches&&(p.duerme||p.fuera||p.horario)){p.noches=p.fuera==='Días seguidos'?'Muchas noches':p.duerme==='A veces'||['Noche','Turnos'].includes(p.horario)?'Algunas noches':p.duerme==='Siempre'?'No':undefined;if(p.noches===undefined)delete p.noches}
  if(Array.isArray(p.meds))p.meds.forEach(m=>{if(m&&m.nombre==null)m.nombre=''})});
 if(D.hogar){const h=D.hogar;if(h.presupuesto&&PRES_MAP8[h.presupuesto]&&!PRES8.includes(h.presupuesto)){h.presupuesto7=h.presupuesto;h.presupuesto=PRES_MAP8[h.presupuesto]}
  if(h.cp&&!h.prov){const p=provOfCP(h.cp);if(p)h.prov=p}}
 (D.registro||[]).forEach(r=>{
  if(secOf(r)==='botiquin'&&(r.elemento==='Mascarilla de protección facial'||/mascarilla/i.test(r.recurso||''))){r.sec8='botiquin';r.sec='otros';r.frente='seg';r.kind='Seguridad';r.articulo='Mascarilla de protección facial'}
  if(secOf(r)==='energia'&&r.kind==='Aparato'&&r.enc==null&&['Aparato médico','Nevera de medicinas'].includes(r.grupo))r.enc='Sí'});
 /* Agua: «Caducidad o fecha de llenado» pasa a dos campos. Fecha futura = caducidad de agua comprada. Fecha pasada: no se puede saber
    si era caducidad o llenado, así que se deja igual (sigue «Por revisar») y se pide elegir al editarla. Copia en caduca7. */
 (D.registro||[]).forEach(r=>{if(r.kind==='Envases'&&!r.origen&&r.caduca){r.caduca7=r.caduca;if(r.caduca>=today())r.origen='Comprada'}});
 /* Punto de encuentro y contacto de fuera: un solo dato para el cuestionario y el Plan sin red */
 if(D.hogar){const h=D.hogar;D.plan=D.plan||{};const pl=D.plan;
  [['punto','punto1'],['contactoExt','ext']].forEach(([hk,pk])=>{const hv=okV8(h[hk]),pv=okV8(pl[pk]);
   if(pv&&hv&&h[hk]!==pl[pk]){h[hk+'7']=h[hk];h[hk]=pl[pk]}else if(pv&&!hv)h[hk]=pl[pk];else if(hv&&!pv)pl[pk]=h[hk]})}
 D.omit=D.omit||{};D.zm=D.zm||{};D.ver=8;D.v8={at:today()}}
const migrate7w=window.migrate;
window.migrate=function(){migrate7w();if(!D||migErr)return;if((D.ver||0)>=8)return;
 const snap=JSON.stringify(D);
 try{LS.setItem(BK8,JSON.stringify({at:new Date().toISOString(),de:D.ver||7,app:APPV,data:JSON.parse(snap)}))}catch(e){migErr='nobackup';D=JSON.parse(snap);return}
 try{if(window.__failMig8)throw new Error('prueba de fallo');migrate8();save()}catch(e){D=JSON.parse(snap);migErr='fail';try{LS.setItem(KEY,snap)}catch(_){}}};
const newD7=newD;newD=function(){const d=newD7();d.ver=8;d.v8={at:today()};d.omit={};d.zm={};return d};

/* ===================== Render: provincia por código postal, nombres, aviso legal la primera vez ===================== */
const render7=render;render=function(){if(D&&D.hogar){const p=provOfCP(D.hogar.cp);if(p&&!D.hogar.prov){D.hogar.prov=p;save()}}applyNames();render7()};
const boot7=boot;boot=function(){boot7();if(D&&D.cfg)applyCfg();let seen=null;try{seen=LS.getItem(LEGAL_K)}catch(e){}if(!seen&&!gateOn())setTimeout(()=>showLegal(true),400)};

/* Alta nueva: el hogar recién creado nace ya en formato 8 */
const wzEnd7=wzEnd;wzEnd=function(){wzEnd7.apply(this,arguments);try{if(D&&D.hogar&&(D.ver||0)<8){migrate8();save()}if(D&&D.hogar&&syncPunto8('hogar')){save();render()}}catch(e){}};

/* ===================== Auditoría de textos aprobada (23/11/2026) ===================== */
/* 3 · Punto de encuentro y contacto de fuera: un solo dato. Cuestionario (Perfil › Red de apoyo) y Guía › Plan sin red leen y escriben lo mismo. */
function okV8(v){return ans(v)&&v!=='Aún no hay'&&v!==NS}
function syncPunto8(from){if(!D||!D.hogar)return false;const h=D.hogar;let ch=false;
 [['punto','punto1'],['contactoExt','ext']].forEach(([hk,pk])=>{const pl=D.plan||{};
  if(from==='plan'){if(okV8(pl[pk])&&h[hk]!==pl[pk]){h[hk]=pl[pk];ch=true}}
  else if(okV8(h[hk])&&pl[pk]!==h[hk]){D.plan=Object.assign(D.plan||{},{[pk]:h[hk],_u:nowMs(),_b:D.dev});ch=true}});
 if(ch&&from==='plan')touch(D.meta.hogar||(D.meta.hogar={}));return ch}
const planSave7=planSave;planSave=function(who){planSave7(who);if(who==='h'&&syncPunto8('plan')){save();render()}};
/* 4 · Panel: el punto débil de agua sigue el objetivo del nivel actual (no 72 h fijo). 13 · «Por revisar» en una sola forma. */
weak=function(S,A){const dr=dueRows();if(dr.length)return{t:`${dr.length} por revisar`,s:S.frozen?`${Math.round(S.frozen)} XP no cuentan hasta que lo revises.`:'Revísalo para que siga contando.',go:"go('m')"};
 const R=refugio(),x=X(),G=R.goalW,q=R.s.agua;
 if(x.Lday&&(q.d==null||q.d<G))return{t:q.L?`Agua para menos de ${G} días`:'Sin agua apuntada',s:`${x.n===1?'Necesitas':'Necesitáis'} ${fmtN(x.Lday*G)} L para ${G} días (nivel ${lvNow()})${q.L?`; hay ${fmtN(q.L)} L.`:'.'}`,go:"sec7='agua';go('r')"};
 const sw=skWarn();if(sw.length){const w=sw[0];return{t:w.t,s:w.s,go:`go('g');gs('como');gfic='${w.k}';render()`}}
 if(S.req.length)return{t:S.req.length>1?'Faltan habilidades para subir':'Falta una habilidad para subir',s:'Aprende: '+S.req.map(k=>fichaDef(k).t).join(', ')+'. Práctica y test en Guía › Cómo se hace.',go:"go('n')"};
 if(S.block.length){const k=S.block[0];return{t:ATRN[k]+' bajo el mínimo',s:`${S.AM[k]} de ${S.min[k]} XP de misiones y habilidades para poder subir.`,go:"go('n')"}}
 if(A.x.mismaComp)return{t:'Misma compañía de móvil',s:'Si falla esa red, os quedáis todos sin móvil. Una segunda línea de otra compañía sirve de respaldo.',go:"viewKey='walkies';tab='m';render()"};
 const u=unknowns().length;if(u)return{t:`${u} respuesta${u>1?'s':''} «No lo sé»`,s:'Averiguarlas da XP de Resolución.',go:"go('m')"};return null};
/* 11 · Cada sección muestra su cuenta en una línea */
function cuenta8(s,R){const x=X(),q=R.s[s],f=fmtN;let t='';
 if(s==='agua'&&q&&x.Lday)t=`Cuenta: ${f(q.L)} L ÷ ${x.Lday} L al día = ${f(q.d||0)} días.`+(q.Ln?' Incluye el agua no potable que puedes potabilizar.':'');
 else if(s==='comida'&&q&&q.kNeed)t=`Cuenta: ${f(q.kcal)} kcal ÷ ${f(q.kNeed)} kcal al día`+(q.pNeed?` y ${f(q.prot)} g ÷ ${f(q.pNeed)} g de proteína al día`:'')+`; vale el menor, mirando también lo que puede comer cada persona = ${f(q.d||0)} días.`;
 else if(s==='energia'&&q&&q.need){const net=q.need-(q.solNet||0);t=`Cuenta: ${f(q.usable)} Wh útiles (ya sin el 15 % al cargar) ÷ ${f(Math.max(0,net))} Wh al día${q.solNet?` (consumo ${f(q.need)} − placas ${f(q.solNet)})`:''} = ${q.d===Infinity?'sin límite':f(q.d||0)+' días'}.`}
 else if(s==='cocina'&&q)t=`Cuenta: con gas o combustible ${f(q.gD)} días + eléctrica con tu batería ${f(q.eD)} días`+(q.boilH?`; incluye ${f(q.boilH*60)} min al día de hervir agua`:'')+'.';
 else if(s==='higiene'&&q)t=`Cuenta: vale el artículo esencial que menos dura = ${f(q.d||0)} días.`;
 else if(s==='medic'&&q&&q.meds&&q.meds.length)t=`Cuenta: vale la medicación que antes se acaba = ${f(q.d||0)} días.`;
 else if(s==='dinero'&&q)t=`Cuenta: ${f(q.eur)} € en efectivo`+(q.gd&&x.n?` ÷ (${f(q.gd)} € × ${x.n} persona${x.n>1?'s':''} al día) = ${f(q.d||0)} días.`:'. El fondo de intercambio no se cuenta en euros.');
 if(!t){const k=[];for(let l=1;l<=R.lv;l++)kitFor(l,R,x).filter(i=>i.sec===s&&i.ok!=null).forEach(i=>k.push(!!i.ok));if(k.length)t=`Kit hasta tu nivel: ${k.filter(Boolean).length} de ${k.length}.`}
 return t?`<p class="xs">${t}</p>`:''}
/* 1 · Agua del grifo: «La he cambiado hoy» renueva la fecha de llenado */
const revisado8=revisado;revisado=function(i){const r=D.registro[i];if(r&&r.kind==='Envases'&&r.llenado&&r.origen==='Del grifo (la llenaste tú)'){r.llenado=today();r.revision=plusM(today(),LLENADO_M);r.confirmado=today();touch(r);save();render();note('Agua cambiada hoy.');return}revisado8(i)};
/* Perfil › Tus datos: el bloque Versión solo está en Sistema */
const Vf8b=V.f;V.f=function(){const h=Vf8b();return sub==='datos'?h.replace(/<section class="card"><div class="k">Versión<\/div>[\s\S]*?<\/section>/,''):h.replace(/ Sin cuentas ni servidores\. Versión [0-9.]+\./,' Sin cuentas ni servidores.')};
/* boot() se llama al final de app801.js (8.0.1), después de todas las capas */
