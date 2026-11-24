/* Plan B v6 · Migración a v6 con copia previa, primera pantalla (hogar nuevo o unirse), «Cambiar quién soy»,
   elegir qué se comparte en la Unidad, versión dentro de QR y archivo, aviso de versión nueva y textos de «Tus datos». */
'use strict';
let startMode=null,joinP=null,shareSel=null,migErr=null,swNew=false;
const BK_KEY='planb-premig';

/* ===================== Migración a v6 (con copia previa) ===================== */
const VEHN={'Ninguno':0,'1':1,'2':2,'3 o más':3};
function migrate6(){if(!D||(D.ver||0)>=6&&D.skills)return;const was=D.ver||0;
 if(window.__failMig)throw new Error('prueba de fallo');
 D.skills=D.skills||{};D.vehiculos=D.vehiculos||[];D.tomb=D.tomb||{};D.tomb.vehiculos=D.tomb.vehiculos||[];
 const h=D.hogar;
 if(h&&was<6){const old={};['clima','riesgos','cerca','vehiculos','vehTipo','autonomia'].forEach(k=>{if(h[k]!==undefined)old[k]=h[k]});if(Object.keys(old).length)h._v5=old;
  /* clima → temperatura */
  const tm={'Templado':'Templado todo el año','Calor intenso frecuente':'Veranos muy calurosos','Frío intenso frecuente':'Inviernos muy fríos con heladas','Ambos extremos':'Veranos muy calurosos e inviernos fríos'};
  if(h.clima!==undefined&&h.temp===undefined){if(h.clima===NS)h.temp=NS;else if(tm[h.clima])h.temp=tm[h.clima]}
  delete h.clima;
  /* riesgos del tiempo → fenómenos; el resto se queda en «Otros riesgos» */
  const fm={'Olas de calor':'Olas de calor','Inundaciones o DANA':'Lluvias torrenciales o DANA','Temporales o huracanes':'Viento fuerte o temporales','Frío extremo o nevadas':'Nieve o hielo'};
  if(Array.isArray(h.riesgos)){const fe=[...new Set(h.riesgos.map(r=>fm[r]).filter(Boolean))],rest=h.riesgos.filter(r=>RIESGOS.includes(r));
   if(fe.length&&h.fenom===undefined)h.fenom=fe;h.riesgos=rest.length?rest:['Ninguno especial']}
  /* cerca */
  if(Array.isArray(h.cerca))h.cerca=[...new Set(h.cerca.map(c=>c==='Barranco, río o zona baja'?'Barranco, río o rambla':c))];
  /* vehículos uno a uno */
  if(h.vehiculos!==undefined||h.vehTipo!==undefined){const vt=Array.isArray(h.vehTipo)?h.vehTipo:[];let n=h.vehiculos===NS?null:VEHN[h.vehiculos];
   if(n==null&&vt.length)n=vt.length;
   if(n!=null&&!D.vehiculos.length){const mh=D.meta&&D.meta.hogar||{};for(let i=0;i<n;i++){const t=vt[i],v={id:'mv'+i+'_'+(mh._u||0),_u:mh._u||nowMs(),_b:mh._b||D.dev};
     if(t==='Moto')v.tipo='Moto';
     if(t==='Combustión')v.motor='Gasolina o diésel';else if(t==='Híbrido')v.motor='Híbrido';else if(t==='Eléctrico')v.motor='Eléctrico';
     if(ans(h.autonomia)){const lv=VEH_NIVEL.includes(h.autonomia)?h.autonomia:null;if(lv){if(v.motor==='Eléctrico')v.bat=lv;else v.dep=lv}}
     D.vehiculos.push(v)}
    h.nveh=n}else if(h.vehiculos===NS)h.nveh=NS;
   delete h.vehiculos;delete h.vehTipo;delete h.autonomia}
  /* compañía de móvil: de la pregunta por persona a «¿Usáis la misma compañía?» */
  const ops=(D.personas||[]).map(p=>p.operador).filter(o=>ans(o)).map(nkey);
  if(h.mismaComp===undefined&&(D.personas||[]).length>1&&ops.length===(D.personas||[]).length)h.mismaComp=new Set(ops).size===1?'Sí':'No'}
 (D.personas||[]).forEach(p=>{delete p.operador});
 D.ver=6;if(was&&was<6)D.migradoDe=was}
function migBackup(){try{if(!D||(D.ver||0)>=6)return true;LS.setItem(BK_KEY,JSON.stringify({at:new Date().toISOString(),de:D.ver||3,data:D}));return true}catch(e){return false}}
const migrate5w=window.migrate;
window.migrate=function(){if(!D)return;const need=(D.ver||0)<6;if(!need){migrate5w();migrate6();return}
 const snap=JSON.stringify(D);if(!migBackup()){migErr='nobackup';D=JSON.parse(snap);return}
 try{migrate5w();migrate6()}catch(e){D=JSON.parse(snap);migErr='fail';try{LS.setItem(KEY,snap)}catch(_){}}};
function migErrView(){return `<section class="form" aria-labelledby="me"><div class="k">Actualización</div><h1 class="h2" id="me">NO SE HAN PODIDO ACTUALIZAR TUS DATOS</h1>
 <p class="sm">${migErr==='nobackup'?'No había espacio para guardar la copia previa, así que no se ha tocado nada.':'Ha fallado la actualización. Tus datos se han restaurado tal como estaban antes.'}</p>
 <p class="sm">Guarda ahora una copia en un archivo. Luego puedes volver a intentarlo.</p><div class="row"><button type="button" class="btn" onclick="exportRaw()">Guardar copia</button><button type="button" class="gh" onclick="migErr=null;D=JSON.parse(LS.getItem(KEY)||'null');boot()">Reintentar</button></div>${bigHelp()}</section>`}
function exportRaw(){shareFile({app:'planb',ver:D&&D.ver||0,fecha:new Date().toISOString(),data:D},'planb-copia-'+today()+'.json')}

/* Perfil: los vehículos también se sellan para la Unidad */
function stampProfile(dr){migrate5();const st=o=>JSON.stringify(Object.fromEntries(Object.entries(o||{}).filter(([k])=>k[0]!=='_')));
 if(st(D.hogar)!==st(dr.hogar))D.meta.hogar={_u:nowMs(),_b:D.dev};
 [['personas',true],['mascotas',false],['vehiculos',false]].forEach(([c,own])=>{const old=new Map((D[c]||[]).map(o=>[o.id,o]));
  (dr[c]||[]).forEach(o=>{const p=old.get(o.id);if(own&&!o._o)o._o=D.dev;if(!p||st(p)!==st(o))touch(o)});
  old.forEach((o,id)=>{if(!(dr[c]||[]).some(n=>n.id===id))tombstone(c,o)})})}

/* ===================== Primera pantalla ===================== */
function renderStart(){if(migErr)return migErrView();
 if(startMode==='join')return joinView();
 return `${bigHelp()}<section class="form" aria-labelledby="st"><div class="k">Plan B</div><h1 class="h2" id="st">¿EMPIEZAS UN HOGAR NUEVO O TE UNES A UNO?</h1>
 <div class="elist"><button type="button" class="ebtn" onclick="startMode='new';startWz('onb')"><span><b>EMPIEZO UN HOGAR NUEVO</b><span class="xs mut db" style="letter-spacing:0">Respondes unas preguntas sobre tu casa y quién vive en ella.</span></span><span aria-hidden="true">›</span></button>
 <button type="button" class="ebtn" onclick="startMode='join';render()"><span><b>ME UNO A UN HOGAR</b><span class="xs mut db" style="letter-spacing:0">Alguien de tu casa ya usa Plan B: escanea su QR de la Unidad o importa su archivo.</span></span><span aria-hidden="true">›</span></button></div>
 <p class="xs mut">Todo se guarda solo en este móvil. Sin cuentas ni servidores.</p>
 <p class="center"><button type="button" class="link" onclick="$('#impb').click()">Restaurar una copia de seguridad</button></p><input type="file" id="impb" accept="application/json,.json" hidden onchange="importar(this)"></section>`}
function joinView(){if(joinP)return joinWho();
 return `<section class="form" aria-labelledby="jt"><button type="button" class="gh sm" onclick="startMode=null;render()">‹ Atrás</button><div class="k">Unirse a un hogar</div><h1 class="h2" id="jt">ESCANEA SU QR DE LA UNIDAD</h1>
 <ol class="steps"><li>En el otro móvil: Equipo · Sincronizar · <b>Mostrar mi QR</b>.</li><li>Aquí: <b>Escanear</b> y apunta a su pantalla. Si no tienes cámara, que te envíe el archivo y lo importas.</li><li>Después eliges quién eres.</li></ol>
 <div class="row"><button type="button" class="btn" onclick="joinPrep();scanStart()">Escanear</button><button type="button" class="gh" onclick="joinPrep();$('#impj').click()">Importar archivo</button></div><input type="file" id="impj" accept="application/json,.json" hidden onchange="importX(this)">${call112()}</section>`}
function newD(){return{ver:6,inicio:today(),nivel:1,misiones:[],registro:[],repasos:[],aver:[],cfg:{},pasados:[],skills:{},vehiculos:[],personas:[],mascotas:[]}}
function joinPrep(){if(!D){D=newD();migrate5()}}
function joinApply(P){if(!P.hogar||!P.hogar.length){note('Ese QR no lleva la ficha del hogar. Pide que la marquen al compartir.');return}
 const r=applyUnidad(P);if(r.err)return note(r.err);{const jm=D.unidad.miembros[P.dev];if(jm)jm._teVe=false}D.unidad.id=P.unidad.id;if(P.unidad.nombre)D.unidad.nombre=P.unidad.nombre;joinP={alias:P.alias||'otro miembro',conf:r.conf};save();render()}
function joinWho(){const ps=D.personas||[];
 return `<section class="form" aria-labelledby="jw"><div class="k">Unido a ${esc(D.unidad.nombre||'la unidad')}</div><h1 class="h2" id="jw">¿QUIÉN ERES TÚ?</h1><p class="sm">Datos recibidos de ${esc(joinP.alias)}. Elige tu ficha: desde ahora solo tú la editas.</p>
 <div class="elist">${ps.map((p,i)=>`<button type="button" class="ebtn" onclick="joinPick('${p.id}')"><b>${esc(pname(p,i).toUpperCase())}</b><span aria-hidden="true">›</span></button>`).join('')}<button type="button" class="ebtn" onclick="joinPick('')"><b>NO ESTOY EN LA LISTA</b><span aria-hidden="true">›</span></button></div>
 <p class="xs mut">Si no estás, se crea tu ficha y la rellenas tú.</p></section>`}
function joinPick(id){if(!id){const p={id:uid(),_o:D.dev};touch(p);D.personas.push(p);D.hogar.nper=D.personas.length;id=p.id}
 joinP=null;startMode=null;setYo(id);askedFill=false;checkLevel();save();boot();setTimeout(async()=>{await dupAsk();const m=Object.values(D.unidad.miembros||{}).find(x=>x._teVe===false);if(m)vueltaAsk(m.alias)},50)}

/* ===================== Personas repetidas ===================== */
const nkey=s=>String(s||'').trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function dupPairs(){const ps=D&&D.personas||[],out=[],seen=new Map();ps.forEach(p=>{if(!ans(p.alias))return;const k=nkey(p.alias);if(seen.has(k))out.push([seen.get(k),p]);else seen.set(k,p)});return out}
async function dupAsk(){const d=dupPairs()[0];if(!d)return;const [a,b]=d;
 if(!isMine(a)&&!isMine(b))return;
 if(!await ask(`<h2>¿Son la misma persona?</h2><p>Hay dos fichas con el nombre «${esc(a.alias)}». Si es la misma persona, se unen en una sola: se conservan los datos de las dos.</p>`,'Unirlas','No, son distintas'))return dupSkip(a,b);
 dupMerge(a,b)}
function dupSkip(a,b){D.cfg.dupNo=D.cfg.dupNo||[];D.cfg.dupNo.push([a.id,b.id].sort().join('|'));save()}
function dupMerge(a,b){/* se queda la que no es mía (su dueño manda) o la que soy yo; la otra se borra con lápida */
 let keep=a,drop=b;if(!isMine(b)||D.yo===b.id){keep=b;drop=a}
 if(!isMine(drop)){note('Esta ficha la edita su dueño: que la una desde su móvil.');return}
 if(isMine(keep)){Object.keys(drop).forEach(k=>{if(k[0]!=='_'&&k!=='id'&&!given(keep[k]))keep[k]=drop[k]});touch(keep)}
 if(D.yo===drop.id)D.yo=keep.id;tombstone('personas',drop);D.personas=D.personas.filter(p=>p.id!==drop.id);D.hogar.nper=D.personas.length;save();render();note('Fichas unidas. Sincroniza para que cambie en los otros móviles.')}
const dupList=()=>dupPairs().filter(([a,b])=>(isMine(a)||isMine(b))&&!(D.cfg.dupNo||[]).includes([a.id,b.id].sort().join('|')));

/* ===================== Quién soy ===================== */
function setYo(id){const p=D.personas.find(q=>q.id===id);if(!p)return;D.yo=id;if(!isMine(p)){p._o0=p._o;p._o=D.dev;p._claim=D.dev;touch(p)}if(!D.cfg.alias&&ans(p.alias))D.cfg.alias=p.alias;save();render()}
async function changeYo(){const p=D.personas.find(q=>q.id===D.yo);
 if(!await ask(`<h2>¿Cambiar quién eres en este móvil?</h2><p>Dejas de ser «${esc(p?pname(p,D.personas.indexOf(p)):'—')}» y eliges otra ficha.</p><p>${p&&p._o0&&p._o0!==D.dev?'Esa ficha vino de otro móvil: vuelve a su dueño original cuando sincronicéis.':'Esa ficha se queda en este móvil.'} Tus XP y tu Refugio se quedan en este móvil.</p>`,'Cambiar','Cancelar'))return;
 if(p&&p._o0&&p._o0!==D.dev){p._o=p._o0;delete p._o0;delete p._claim;touch(p)}D.yo=null;save();tab='e';render()}

/* ===================== Equipo: guía, cambiar quién soy, duplicados ===================== */
const GUIA_ADD=['Si quieres, crea antes su ficha en Perfil · Personas.','En su móvil: instala Plan B, no rellenes nada y elige «Me uno a un hogar». Que escanee tu QR de la Unidad.','En su móvil elige quién es.','Sincronizad en los dos sentidos: tú escaneas su QR. Si los dos cambiasteis lo mismo, eliges qué versión se queda.'];
const Ve5=V.e;V.e=function(){let h=Ve5();
 const extra=`${D.yo?`<section class="card"><div class="k">En este móvil eres</div><p class="sm"><b>${esc(pname(D.personas.find(q=>q.id===D.yo)||{},D.personas.findIndex(q=>q.id===D.yo)))}</b></p><button type="button" class="gh sm" onclick="changeYo()">Cambiar quién soy en este móvil</button></section>`:''}
 ${dupList().length?`<section class="card inv"><div class="k">Posibles repetidos</div>${dupList().map(([a,b])=>`<div class="rv"><div><b>${esc(a.alias)}</b><span class="xs db">Dos fichas con el mismo nombre.</span></div><button type="button" class="gh inv sm" onclick="dupMerge(D.personas.find(p=>p.id==='${a.id}'),D.personas.find(p=>p.id==='${b.id}'))">Unir</button><button type="button" class="gh inv sm" onclick="dupSkip({id:'${a.id}'},{id:'${b.id}'});render()">Son distintas</button></div>`).join('')}</section>`:''}
 <details class="card"><summary><span class="k">Guía</span><b class="db">Añadir a alguien a casa</b></summary><ol class="steps">${GUIA_ADD.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></details>`;
 return h.replace('<h2 class="k sec">Unidad · quienes vivís juntos</h2>',extra+'<h2 class="k sec">Unidad · quienes vivís juntos</h2>')};
/* Amigos: tarjeta fija y opción de no enviar medallas */
const amig5=amigosView;amigosView=function(){return amig5().replace('<div class="row"><button type="button" class="btn" onclick="shareStart(\'a\',\'qr\')">',`<div class="row sb"><span class="sm">Incluir mis medallas en la tarjeta</span><button type="button" class="sw ${D.cfg.noMedals?'':'on'}" role="switch" aria-checked="${!D.cfg.noMedals}" aria-label="Incluir medallas" onclick="D.cfg.noMedals=!D.cfg.noMedals;save();render()"><i></i></button></div><p class="xs mut">La tarjeta es siempre la misma: alias, nivel, rango, XP y, si quieres, el nombre de tus medallas.</p><div class="row"><button type="button" class="btn" onclick="shareStart('a','qr')">`)};

/* ===================== Compartir la Unidad: elegir qué va ===================== */
function payloadOf(kind){return kind==='u'?unidadPayload(shareSel||SEL_DEF()):myCard()}
function summaryOf(kind,P){if(kind==='a')return[`Alias: ${P.alias||'(sin alias)'}`,`Nivel ${P.nivel} · ${P.rango}`,`XP por atributo y total (${P.total})`,P.medallas.length?`Medallas (solo el nombre): ${P.medallas.length}`:'Sin medallas','Fecha de la tarjeta','Nada más: ni inventario, ni ubicaciones, ni salud, ni dirección.'];
 const s=shareSel||SEL_DEF(),np=(P.personas||[]).filter(p=>!p._del).length,nm=(P.miembros||[]).length+1,out=[];
 if(P.hogar)out.push(`Ficha del hogar y ${(P.vehiculos||[]).filter(v=>!v._del).length} vehículo(s)${s.contactos?', con contactos':', sin contactos'}`);
 if(P.personas)out.push(`Fichas de ${np} persona${np===1?'':'s'}${s.salud?', con salud':', sin salud'}${s.cuerpo?', con peso y altura':''}${s.contactos?', con contactos':''}`);
 if(P.registro)out.push(`${P.registro.filter(r=>!r._del).length} filas del registro${s.ubic?', con su ubicación en casa':', sin ubicaciones'}`);
 if(P.mascotas)out.push(`${P.mascotas.filter(r=>!r._del).length} animal(es)`);if(P.plan)out.push('Plan sin red y misiones en pareja');
 out.push(`XP, habilidades y tiempos de ${nm} miembro${nm===1?'':'s'} (solo lectura)`,`Versión de Plan B: ${P.av}`);return out}
const shareStart5=shareStart;
shareStart=function(kind,mode,go){if(kind==='u'&&!go){if(!D.yo){note('Antes, indica quién eres en este móvil.');return}if(!D.cfg.alias){const el=$('#alias');note('Escribe tu alias para compartir.');if(el)el.focus();return}
  shareSel=shareSel||SEL_DEF();shareMode=mode;return selView()}
 return shareStart5(kind,mode)};
let shareMode='qr';
const SEL_ROWS=()=>[['hogar','Ficha del hogar y vehículos'],['registro','Registro (qué tenéis)'],['ubic','· con la ubicación exacta en casa',1],['mascotas','Animales'],['plan','Plan sin red'],['salud','Salud de tus fichas (medicación, alergias…)',1],['cuerpo','Sexo, edad, peso y altura de tus fichas',1],['contactos','Contactos (teléfonos y contacto fuera de la zona)',1]];
function selView(){const s=shareSel,mine=D.personas.filter(isMine),oth=D.personas.filter(p=>!isMine(p));
 openOv(`<div class="eh"><h1 class="h2" id="ovt" tabindex="-1">QUÉ COMPARTES</h1><button type="button" class="gh sm" onclick="closeOv()">Cerrar</button></div><p class="box inv"><b>Solo para quien vive contigo.</b></p>
 <fieldset class="card"><legend class="k">Del hogar</legend>${SEL_ROWS().map(([k,l,sens])=>`<label class="chk1"><input type="checkbox" ${s[k]?'checked':''} onchange="shareSel['${k}']=this.checked"> <span>${esc(l)}${sens?' <span class="xs mut">(desmarcado al principio)</span>':''}</span></label>`).join('')}</fieldset>
 <fieldset class="card"><legend class="k">Personas</legend>${mine.map(p=>`<label class="chk1"><input type="checkbox" ${s.personas[p.id]?'checked':''} onchange="shareSel.personas['${p.id}']=this.checked"> <span>${esc(pname(p,D.personas.indexOf(p)))}</span></label>`).join('')||'<p class="xs mut">No eres dueño de ninguna ficha.</p>'}${oth.length?`<p class="xs mut">${esc(oth.map(p=>pname(p,D.personas.indexOf(p))).join(', '))}: sus datos personales solo los comparte su dueño.</p>`:''}</fieldset>
 <p class="xs mut">Lo que no marques no viaja, y en el otro móvil <b>no se borra</b>: se queda como estaba.</p>
 <div class="row"><button type="button" class="gh" onclick="selPreview()">Ver contenido exacto</button><button type="button" class="btn" onclick="closeOv();shareStart('u',shareMode,1)">Continuar</button></div>`)}
function selPreview(){const P=payloadOf('u');openOv(`<div class="eh"><h1 class="h2" id="ovt" tabindex="-1">CONTENIDO EXACTO</h1></div><ul class="ul0">${summaryOf('u',P).map(x=>`<li>${esc(x)}</li>`).join('')}</ul><pre class="pre">${esc(JSON.stringify(P,null,2))}</pre><div class="row"><button type="button" class="gh" onclick="selView()">‹ Atrás</button><button type="button" class="btn" onclick="closeOv();shareStart('u',shareMode,1)">Continuar</button></div>`)}

/* ===================== Recibir: versiones y unirse ===================== */
const handle5=handlePayload;
handlePayload=async function(P){if(!P||typeof P!=='object')return note('Contenido no válido.');
 if(P.t==='planb-unidad'){const pv=P.avn||(P.v>=6?60:50);
  if(pv<APPV_N){await ask(`<h2>El otro móvil tiene una versión más antigua</h2><p>Su Plan B es la versión ${esc(P.av||P.v||'5')} y la tuya la ${APPV}. Antes de unir datos, actualiza ese móvil: con internet, cierra Plan B del todo y vuelve a abrirla.</p>`,'Entendido',null);return}
  if(pv>APPV_N){await ask(`<h2>Este móvil tiene una versión más antigua</h2><p>El otro móvil usa la versión ${esc(P.av)} y este la ${APPV}. Actualiza este primero: con internet, cierra Plan B del todo y vuelve a abrirla.</p>`,'Entendido',null);return}
  if(startMode==='join'&&(!D||!D.hogar)){joinPrep();return joinApply(P)}
  if(!D||!D.hogar)return note('Primero empieza un hogar o únete a uno.');
  const before=JSON.stringify(D.unidad.miembros[P.dev]||null);await handle5(P);
  const m=D.unidad&&D.unidad.miembros&&D.unidad.miembros[P.dev],changed=JSON.stringify(m||null)!==before;
  if(m&&changed){m._teVe=(P.miembros||[]).some(x=>x&&x.dev===D.dev);save();render()}
  if(dupList().length)await dupAsk();
  if(m&&changed&&!m._teVe)setTimeout(vueltaAsk,80,m.alias);return}
 if(!D||!D.hogar)return note('Primero empieza un hogar o únete a uno.');
 return handle5(P)};

/* ===================== Simulacros: XP según pasos y tiempo mínimo ===================== */
if(DRILL.min==null)DRILL.min=20;
function drillXP(d){if(!d.sorpresa||d.s<DRILL.min)return 0;const f=Math.min(DRILL.pasos.length,d.pasos||0)/DRILL.pasos.length;return Math.round(DRILL.xp*tScore(d.s,DRILL.obj)*f*10)/10}
function extraXP(){const a={},f={};if(!D)return{a,f};
 (D.par||[]).filter(p=>p.hecha&&(p.quienes||[]).includes(D.dev)).forEach(p=>{const d=PAR.find(q=>q.k===p.id);if(!d)return;a[d.a]=(a[d.a]||0)+PAR_XP;f[d.f]=(f[d.f]||0)+PAR_XP});
 (D.drills||[]).filter(d=>d.sorpresa).slice(-DRILL.max).forEach(d=>{const v=drillXP(d);a.rsp=(a.rsp||0)+v;f.energia=(f.energia||0)+v});return{a,f}}
const renderDrill5=renderDrill;renderDrill=function(){if(!drill.end)return renderDrill5();const d={sorpresa:drill.sorpresa,s:drill.end,pasos:drill.done.length},xp=Math.round(drillXP(d));
 renderDrill5();const p=$('#ov .card');if(p&&drill.sorpresa){const q=p.querySelectorAll('p.sm')[1];if(q)q.textContent=d.s<DRILL.min?`Menos de ${DRILL.min} s: demasiado rápido para contar. Sin XP.`:`+${xp} XP de Respuesta: ${d.pasos} de ${DRILL.pasos.length} pasos marcados × ${Math.round(tScore(d.s,DRILL.obj)*100)} % del objetivo de tiempo.`}};

/* ===================== Fichas: habilidad, enlaces con fecha ===================== */
function linksHtml(ids,vg,inline){const L=(ids||[]).map(id=>LNK[id]).filter(Boolean);if(!L.length)return '';
 const a=l=>`<a class="xlink" href="${esc(l.u)}" target="_blank" rel="noopener noreferrer">${esc(l.t)}<span aria-hidden="true"> ↗</span><span class="sr"> (abre una web externa, necesita internet)</span></a><span class="xs mut db">${esc(l.o)} · necesita internet</span>`;
 if(inline)return `<p class="xs">${L.map(a).join('')}</p>`;
 return `<section class="box dash xl"><div class="k">Para ampliar · necesita internet</div><p class="xs mut">Lo esencial ya está en esta ficha y funciona sin conexión. Estos enlaces solo se abren si los tocas: van al navegador y esa web ve la visita.${vg?' La visita también puede quedar en el historial del navegador.':''}</p><ul class="xll">${L.map(l=>`<li>${a(l)}</li>`).join('')}</ul><p class="xs mut">Enlaces comprobados el ${esc(LNK_FECHA)}.</p></section>`}
function fichaHtml(k,inEmg){const f=fichaDef(k);if(!f)return '';skOpen(k);
 return `${inEmg?'':call112()}<p class="sm mut">${esc(f.d)}</p>${f.act?`<div class="acts">${f.act.map(([n,l])=>telA(n,l,'btn')).join('')}</div>`:''}${f.vg&&!inEmg?quick():''}
 ${f.sec.map(s=>`<section class="card"><h3 class="k">${esc(s.h)}</h3><ol class="steps">${s.s.map(x=>`<li>${esc(x)}</li>`).join('')}</ol></section>`).join('')}
 ${f.nota?`<p class="box">${esc(f.nota)}</p>`:''}<p class="xs mut">Fuente: ${esc(f.src.join(' · '))}. Sigue siempre las indicaciones del 112 y de las autoridades.</p>${linksHtml(f.links,f.vg)}${inEmg?'':skCard(k)}`}
function relFicha(k,x){return(k==='calor'&&x.calor)||(k==='calima'&&x.calima)||(k==='agua'&&(x.sequia||x.inund))}
function comoView(){if(gfic&&fichaDef(gfic)){const f=fichaDef(gfic);return `<button type="button" class="gh sm" onclick="gfic=null;render();window.scrollTo(0,0)">‹ Cómo se hace</button><h2 class="h2" style="margin-top:12px">${esc(f.t.toUpperCase())}</h2>${fichaHtml(gfic)}`}
 const x=X(),tag=f=>{if(f.vg||f.noScore)return '';const e=skEstado(f.k);return `<span class="xs db" style="letter-spacing:0">${skVigente(f.k)?'✓ Aprobada':e?'Leída':'Sin abrir'}${relFicha(f.k,x)?' · para tu zona':''}</span>`};
 return `<p class="lead">Pasos esenciales de lo que la app recomienda. Funcionan sin internet; cada ficha enlaza a su fuente oficial para ampliar (necesita conexión).</p><p class="xs mut">Cada ficha es una habilidad: al abrirla queda «Leída» (sin XP); con la práctica y el test aprobado pasa a «Aprobada» y da XP durante 12 meses.</p><div class="elist">${FICHAS.map(f=>`<button type="button" class="ebtn" onclick="gfic='${f.k}';render();window.scrollTo(0,0)"><span><b>${esc(f.t.toUpperCase())}</b><span class="xs mut db" style="letter-spacing:0">${esc(f.d)}</span>${tag(f)}</span><span aria-hidden="true">›</span></button>`).join('')}</div>`}

/* ===================== Escenarios: fenómenos del tiempo ===================== */
const COND6=[['calima','Calima o polvo','Es un factor en tu zona: con calima, puertas y ventanas cerradas y mascarilla FFP2 si sales. Mira la ficha «Calima».'],
 ['dana','Lluvias torrenciales','Es un factor en tu zona: no cruces calles ni vados inundados y sigue los avisos de AEMET y Protección Civil.'],
 ['viento','Viento fuerte','Es un factor en tu zona: puede cortar la luz y las carreteras. Recoge lo que pueda volar del balcón o la terraza.'],
 ['nieve','Nieve o hielo','Es un factor en tu zona: carreteras cortadas y cortes de luz más largos. Abrigo y calor seguro en casa.'],
 ['niebla','Niebla densa','Es un factor en tu zona: si conduces, menos velocidad y luces encendidas.'],
 ['sequia','Sequía o restricciones de agua','Es un factor en tu zona: puede haber cortes de agua programados. Ten tu reserva de agua al día.'],
 ['frio','Frío intenso','Es un factor en tu zona: sin luz puede no haber calefacción. Ropa de abrigo y mantas a mano.']];
const cond5=condiciones;condiciones=function(g,x){const out=cond5(g,x);if(g==='inc')return out;COND6.forEach(([k,t,n])=>{if(x[k])out.push({k,t,st:'si',n})});return out};

/* ===================== Perfil: vehículos ===================== */
function vehProfile(){const vs=D.vehiculos||[];return `<h2 class="k sec">Vehículos · ${vs.length}</h2>${vs.map((v,i)=>`<section class="card"><div class="row sb"><h3 class="h3">${esc(vname(v,i))}</h3><div class="row"><button type="button" class="gh sm" onclick="startWz('edit',['v:${v.id}:v1'])" aria-label="Editar ${esc(vname(v,i))}">Editar</button><button type="button" class="gh sm" onclick="quitar('v','${v.id}')" aria-label="Quitar ${esc(vname(v,i))}">Quitar</button></div></div><dl class="dl sm">${sumBlock(VQ[0],v)}</dl></section>`).join('')}<button type="button" class="gh wide" onclick="addVehiculo()">+ Añadir vehículo</button>`}

/* ===================== Panel: avisos, ayuda y habilidades ===================== */
const isIOS=()=>/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const GLOS=[['Frente','Cada área de preparación: agua, comida, energía, salud, seguridad, comunicaciones, evacuación y documentos.'],['Atributo','Lo que entrenas con cada misión (por ejemplo Habilidades o Respuesta). Suman tus XP.'],['Por revisar','XP que no cuentan hasta que revises algo: algo caducado o con la revisión pasada, una ficha sin aprobar o una habilidad caducada.'],['Misión en curso','La misión de la semana: la que toca ahora.']];
const Vp5=V.p;V.p=function(){let pre='';
 if(swNew)pre+=`<section class="card inv" role="status"><div class="k">Actualización</div><p class="sm"><b>Hay una versión nueva.</b> Cierra Plan B del todo y vuelve a abrirla.</p></section>`;
 if(isIOS()&&!isStandalone())pre+=`<section class="card dash"><div class="k">▲ Sin instalar</div><p class="sm">En una pestaña del navegador, algunos móviles borran los datos si pasan 7 días sin abrirla. Instálala en la pantalla de inicio y haz copias de seguridad.</p></section>`;
 const w=skWarn();if(w.length)pre+=`<section class="card inv"><div class="k">Habilidades</div>${w.map(x=>`<div class="rv"><div><b>${esc(x.t)}</b><span class="xs db">${esc(x.s)}</span></div><button type="button" class="gh inv sm" onclick="go('g');gs('como');gfic='${x.k}';render()">Ver</button></div>`).join('')}</section>`;
 if(!D.cfg.glosOk)pre+=`<section class="card"><div class="k">Primera vez · qué es cada cosa</div><dl class="dl2">${GLOS.map(([a,b])=>`<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl><button type="button" class="gh sm" onclick="D.cfg.glosOk=1;save();render()">Entendido</button></section>`;
 const h=Vp5();const sk=skPanel();return h.replace('<h1 class="sr">Panel</h1>','<h1 class="sr">Panel</h1>'+pre).replace(/(<p class="offn xs" id="offn">)/,sk+'$1')};

/* ===================== Tus datos ===================== */
function privacyView(){const bk=LS.getItem(BK_KEY);let bkd=null;try{bkd=bk&&JSON.parse(bk).at}catch(e){}
 return `<h1 class="sr">Tus datos</h1><button type="button" class="gh sm" onclick="sub=null;render()">‹ Perfil</button><h2 class="h2" style="margin-top:12px">TUS DATOS</h2>
 <section class="card"><ul class="ul0"><li>Todo se guarda <b>solo en este móvil</b>, en la memoria del navegador.</li><li>No hay cuentas, ni servidor que reciba tus datos, ni analítica, ni rastreadores.</li><li>La app no hace por sí sola ninguna petición a terceros: la letra, las librerías de QR y las frecuencias van dentro de la app.</li><li>Funciona sin conexión. Solo se conecta para descargar o actualizar sus propios archivos desde el servicio web donde está publicada; ese servicio puede registrar la visita técnica, como cualquier web, pero tus datos no viajan.</li><li><b>Enlaces externos (↗):</b> la app nunca los abre ni los carga sola. Solo si tocas uno se abre en el navegador, y esa web sí ve tu visita. Lo esencial está dentro de la app.</li><li>La app no guarda qué pantallas o árboles consultas. De las fichas «Cómo se hace» anota que la abriste (para tu habilidad), nunca la de violencia doméstica.</li><li>No hay cifrado propio: protege el móvil con código o huella.</li></ul></section>
 <section class="card inv"><div class="k">▲ Cuándo se pierden los datos</div><ul class="ul0"><li>En algunos móviles, si borras el icono de Plan B de la pantalla de inicio, se borran también sus datos.</li><li>Si cambia la dirección de la app, la nueva empieza vacía: cada dirección guarda sus datos por separado.</li><li>En una pestaña del navegador sin instalar, algunos móviles los borran tras 7 días sin abrirla.</li><li>Borrar los datos del navegador también los borra.</li></ul><p class="sm">Por eso, haz una copia de seguridad de vez en cuando: la app te lo recuerda cada 30 días.</p></section>
 <section class="card"><div class="k">Al compartir</div><ul class="ul0"><li><b>QR:</b> va directo de una pantalla a la cámara del otro móvil, sin internet.</li><li><b>Hogar:</b> antes de enviar eliges qué va: hogar, cada persona, Refugio, animales y plan sin red. Salud, contactos, peso y altura y ubicaciones exactas van desmarcados al principio. Los datos personales de otra persona solo los comparte su dueño. Lo que no envíes no se borra en el otro móvil.</li><li><b>Amigos:</b> solo la tarjeta de estadísticas (alias, nivel, rango, XP, fecha y, si quieres, el nombre de tus medallas). Nunca inventario, salud, ubicaciones ni dirección.</li><li><b>Archivo:</b> antes de enviarlo ves su contenido exacto. No va cifrado por Plan B. Algunas apps de mensajería cifran de extremo a extremo; otras, y el correo, guardan los mensajes en sus servidores. En todos los casos, <b>quien lo recibe puede leerlo</b>.</li><li><b>Copia de seguridad:</b> lleva todo; guárdala en un sitio tuyo.</li></ul></section>
 <section class="card"><div class="k">Versión</div><p class="sm">Plan B ${APPV} · datos en formato ${D.ver}.</p><p class="xs mut">El QR y el archivo de la Unidad llevan la versión: si el otro móvil tiene otra, se pide actualizar antes de unir.${bkd?' Copia automática antes de la última actualización: '+esc(fmtD(String(bkd).slice(0,10)))+'.':''}</p></section>
 <section class="card inv"><div class="k">Zona de peligro</div><p class="sm">Borra de este móvil todo lo que guarda Plan B. No se puede deshacer y no afecta a lo que ya hayas compartido.</p><button type="button" class="btn wide" style="background:#000;color:#fff" onclick="wipe()">Borrar todos mis datos</button></section>`}

/* ===================== Render, almacenamiento persistente y versión nueva ===================== */
const render5=render;render=function(){if(migErr||(startMode==='join'&&joinP&&!gateOn())){header();$('#v').innerHTML=migErr?migErrView():joinWho();$('#nav').hidden=true;document.body.classList.add('nonav');return}return render5()};
if(navigator.storage&&navigator.storage.persist){navigator.storage.persisted().then(p=>{if(!p)return navigator.storage.persist()}).catch(()=>{})}
if('serviceWorker'in navigator){navigator.serviceWorker.addEventListener('controllerchange',()=>{});
 addEventListener('load',()=>{navigator.serviceWorker.getRegistration().then(reg=>{if(!reg)return;const mark=()=>{if(navigator.serviceWorker.controller){swNew=true;if(D&&D.hogar&&tab==='p'&&!wz)render()}};
  if(reg.waiting)mark();reg.addEventListener('updatefound',()=>{const w=reg.installing;if(w)w.addEventListener('statechange',()=>{if(w.state==='installed')mark()})})}).catch(()=>{})})}
/* boot() se llama al final de app7.js */


/* ===================== Vuelta del QR: que el otro móvil también te vea ===================== */
async function vueltaAsk(al){const n=esc(al||'el otro móvil');
 if(await ask(`<h2>Ahora al revés</h2><p>Ya tienes los datos de <b>${n}</b>, pero ${n} todavía no tiene los tuyos. Enséñale tu QR para que en su móvil también salgáis los dos.</p>`,'Mostrar mi QR','Más tarde')){go('e');shareStart('u','qr')}}
const Ve6=V.e;V.e=function(){const h=Ve6(),f=Object.values(D.unidad.miembros||{}).filter(m=>m._teVe===false);if(!f.length)return h;
 return `<section class="box inv"><b>Falta la vuelta del QR.</b> <span class="sm">${esc(f.map(m=>m.alias||'Miembro').join(', '))} aún no tiene tus datos: enséñale tu QR para que te vea en su móvil.</span><div class="row"><button type="button" class="btn" onclick="shareStart('u','qr')">Mostrar mi QR</button></div></section>`+h};
