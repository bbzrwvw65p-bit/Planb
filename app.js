/* Plan B v6 · PWA sin IA, sin nube. Datos solo en este dispositivo (localStorage 'planb'). Territorio: España (112). */
'use strict';
const LS=localStorage,KEY='planb';
if(!LS.getItem(KEY)&&LS.getItem('ohara'))LS.setItem(KEY,LS.getItem('ohara'));
let D=null;try{D=JSON.parse(LS.getItem(KEY)||'null')}catch(e){D=null}
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>'&#'+ch.charCodeAt(0)+';');
const save=()=>LS.setItem(KEY,JSON.stringify(D));
const ymd=d=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
const today=()=>ymd(new Date());
const plusM=(d,n)=>{const x=new Date(d+'T12:00');x.setMonth(x.getMonth()+n);return ymd(x)};
const fmtD=d=>d?new Date(d+'T12:00').toLocaleDateString('es-ES',{day:'numeric',month:'short',year:'numeric'}).replace('.',''):'—';
const ans=v=>v!==undefined&&v!==null&&v!==NS&&v!==''&&!(Array.isArray(v)&&!v.length);
const given=v=>v!==undefined&&v!==null&&v!==''&&!(Array.isArray(v)&&!v.length);
const hasO=(v,o)=>Array.isArray(v)&&v.includes(o);
const list=a=>a.length<=1?a.join(''):a.slice(0,-1).join(', ')+' y '+a[a.length-1];
const pad2=n=>String(n).padStart(2,'0');
const mmss=s=>s==null?'—':(s>=60?Math.floor(s/60)+' min '+pad2(s%60)+' s':s+' s');
let tab=({'#panel':'p','#mision':'m','#niveles':'n','#guia':'g','#registro':'r','#equipo':'e','#perfil':'f'})[location.hash]||'p';
let wz=null,viewKey=null,run=null,runTick=null,emg=null,deferredPrompt=null,askedFill=false;

/* ===================== Contexto del perfil ===================== */
const W_PESO={'Menos de 5 kg':3,'5 a 15 kg':10,'15 a 30 kg':22,'Más de 30 kg':35};
const KCAL={'3–12':1600,'13–17':2400,'18–64':2100,'65+':1900};
const pname=(p,i)=>ans(p.alias)?p.alias:'Persona '+(i+1);
const mname=(m,i)=>ans(m.nombre)?m.nombre:(ans(m.especie)?m.especie:'Animal')+' '+(i+1);
const petLday=(m,calor)=>W_PESO[m.peso]?Math.ceil(W_PESO[m.peso]*.06*(calor?1.5:1)*2)/2:null;
function X(src){src=src||D||{};const h=src.hogar||{},P=src.personas||[],pets=src.mascotas||[];
 const nm=f=>P.map((p,i)=>f(p)?pname(p,i):null).filter(Boolean);
 const arr0=v=>Array.isArray(v)?v:[],fen=arr0(h.fenom),rg0=arr0(h.riesgos);
 /* v6: temperaturas y fenómenos (con compatibilidad con las respuestas de v5) */
 const calor=['Veranos muy calurosos','Veranos muy calurosos e inviernos fríos','Calor intenso frecuente','Ambos extremos'].includes(h.temp||h.clima)||fen.includes('Olas de calor')||rg0.includes('Olas de calor');
 const frio=['Inviernos muy fríos con heladas','Veranos muy calurosos e inviernos fríos','Frío intenso frecuente','Ambos extremos'].includes(h.temp||h.clima)||fen.includes('Nieve o hielo')||rg0.includes('Frío extremo o nevadas');
 const calima=fen.includes('Calima o polvo en suspensión'),dana=fen.includes('Lluvias torrenciales o DANA'),viento=fen.includes('Viento fuerte o temporales'),nieve=fen.includes('Nieve o hielo'),niebla=fen.includes('Niebla densa'),humedad=fen.includes('Humedad alta casi siempre'),sequia=fen.includes('Sequía o restricciones de agua');
 const Lpp=calor?6:4,n=(h.nper===NS||!P.length)?null:P.length;
 const ppl=P.map((p,i)=>{const w=waterOf(p,calor),e=kcalOf(p),notes=[...w.notes,...e.notes];
  if(p.edad==='0–2'){notes.push('bebé: leche o papillas aparte');if(hasO(p.lactante,'Leche de fórmula'))notes.push('incluye agua para la fórmula')}
  if(p.med==='Sí')notes.push('medicación'+(p.medFrio==='Sí'?' en frío':''));if(p.aparato==='Sí, con electricidad')notes.push('aparato eléctrico');
  return{name:pname(p,i),L:w.L,beber:w.beber,ref:w.ref,kcal:e.kcal,kcalSrc:e.src,notes,p}});
 let petL=0,petUnknown=0;pets.forEach(m=>{const l=petLday(m,calor);if(l)petL+=l;else petUnknown++});
 const Lday=n?Math.ceil(ppl.reduce((a,b)=>a+b.L,0)+petL):null;
 const kcal=n&&ppl.every(q=>q.kcal!=null)?ppl.reduce((a,b)=>a+b.kcal,0):null;
 const diets=[...new Set(P.map(p=>p.dieta).filter(d=>d==='Vegetariana'||d==='Vegana'))];
 const intol=P.map((p,i)=>ans(p.intol)&&p.intol!=='Nada'?pname(p,i)+': '+p.intol:null).filter(Boolean);
 const dietTxt=(diets.length?` Hay dieta ${diets.join(' y ').toLowerCase()} (${list(nm(p=>diets.includes(p.dieta)))}): prioriza proteína vegetal en conserva y frutos secos.`:'')+(intol.length?' Ojo con: '+intol.join('; ')+'.':'');
 const arr=v=>Array.isArray(v)?v:[];
 const cerca=arr(h.cerca),rg=arr(h.riesgos),cocina=arr(h.cocina),acs=arr(h.acs),elec=arr(h.elec);
 const inund=h.inundable==='Sí'||cerca.includes('Barranco, río o rambla')||cerca.includes('Barranco, río o zona baja')||dana||rg.includes('Inundaciones o DANA'),forestal=cerca.includes('Monte o zona forestal')||rg.includes('Incendios forestales'),costa=cerca.includes('Costa')||viento||rg.includes('Temporales o huracanes'),ind=cerca.includes('Industria química o puerto'),volc=rg.includes('Volcán'),sism=rg.includes('Terremotos');
 const riskList=[];if(inund)riskList.push('inundación (zonas altas)');if(forestal)riskList.push('incendio forestal');if(costa)riskList.push('temporal');if(ind)riskList.push('accidente industrial (confinarse)');if(calima)riskList.push('calima');if(nieve)riskList.push('nieve o hielo');if(volc)riskList.push('erupción volcánica');if(sism)riskList.push('terremoto');
 const routeTips=[];if(inund)routeTips.push('inundación: zonas altas, nunca barrancos ni pasos bajos');if(forestal)routeTips.push('incendio: alejarse del monte en dirección contraria al humo');if(volc)routeTips.push('volcán: rutas del plan oficial de emergencias');if(costa)routeTips.push('temporal: lejos de primera línea');if(ind)routeTips.push('industria: confinarse salvo orden contraria');
 const pais='España',emer='112'; /* v5: la app asume territorio español */
 const medP=nm(p=>p.med==='Sí'),frioP=nm(p=>p.medFrio==='Sí'),devP=nm(p=>p.aparato==='Sí, con electricidad');
 const helpP=nm(p=>['Reducida','Silla de ruedas','Encamada'].includes(p.movil)||hasO(p.limit,'No puede subir escaleras')||hasO(p.limit,'Necesita que le lleven en brazos')||p.edad==='0–2');
 const awayP=nm(p=>['Jornada completa','Días seguidos'].includes(p.fuera)||['10 a 30 km','Más de 30 km'].includes(p.dist));
 const moviles=P.filter(p=>p.tieneMovil!=='No'&&!['0–2','3–12'].includes(p.edad)).length;
 const V=(src.vehiculos||[]),vComb=v=>['Gasolina o diésel','Híbrido','Híbrido enchufable'].includes(v.motor),vElec=v=>['Eléctrico','Híbrido enchufable'].includes(v.motor);
 const vehs=V.length>0||(typeof h.nveh==='number'?h.nveh>0:(!!h.vehiculos&&!['Ninguno',NS].includes(h.vehiculos)));
 const vehBajo=list(V.map((v,i)=>(v.dep==='Casi vacío'||v.bat==='Casi vacío')?vname(v,i):null).filter(Boolean));
 const vehPlan=V.map((v,i)=>vname(v,i)+': '+(v.motor==='Eléctrico'?'la mitad de la batería':v.motor==='Híbrido enchufable'?'medio depósito y la mitad de la batería':v.motor===NS||!v.motor?'medio depósito o la mitad de la batería':'medio depósito')).join('; ');
 const impr=P.map((p,i)=>ans(p.impres)&&p.impres!=='Nada'?pname(p,i)+': '+p.impres:null).filter(Boolean);
 const allergy=P.map((p,i)=>ans(p.alergias)&&p.alergias!=='Ninguna'?pname(p,i)+' ('+p.alergias+')':null).filter(Boolean);
 return{h,P,pets,ppl,n,Lpp,Lday,petL,petUnknown,kcal,calor,frio,dietTxt,quien:n===1?'ti':n?`las ${n} personas de casa`:'cada persona',
  piso:h.vivienda==='Piso',casa:h.vivienda==='Casa',alto:h.vivienda==='Piso'&&(h.planta==='4.ª o más'||h.ascensor==='No'),terraza:hasO(h.exterior,'Terraza o balcón'),patio:hasO(h.exterior,'Patio o jardín'),exteriorSi:hasO(h.exterior,'Terraza o balcón')||hasO(h.exterior,'Patio o jardín'),almacenPoco:h.almacen==='Muy poco',
  rural:h.entorno==='Rural o aislado',isla:h.isla==='Sí',hospLejos:h.hospital==='Más de 45 min',superLejos:h.super==='Más de 45 min',unaCarretera:h.carretera==='Sí',
  inund,forestal,costa,ind,volc,sism,riskList,routeTips,pais,emer,eu:UE_PAISES.includes(pais),us:pais==='Estados Unidos',
  aljibe:['Aljibe o depósito','Pozo'].includes(h.agua),aguaRedLike:h.agua!=='Otra',bombaRisk:h.bomba==='Sí'||((h.agua==='Pozo'||h.agua==='Aljibe o depósito')&&h.bomba!=='No'),
  cocinaElec:cocina.includes('Eléctrica'),cocinaLlama:cocina.some(o=>['Butano o propano','Gas natural','Leña'].includes(o)),cocinaKnown:cocina.length>0,lena:cocina.includes('Leña'),lenaHeat:cocina.includes('Leña')||acs.includes('Leña'),gasCanal:cocina.includes('Gas natural')||acs.includes('Gas natural'),combustion:[...cocina,...acs].some(o=>['Butano o propano','Gas natural','Leña'].includes(o)),
  solar:elec.includes('Placas solares con batería'),sinElec:elec.includes('Sin electricidad'),satInternet:hasO(h.internet,'Satélite'),
  vehs,vehElec:V.some(vElec),vehComb:V.some(vComb),vehBajo,vehPlan,veh:V,
  calima,dana,viento,nieve,niebla,humedad,sequia,mismaComp:h.mismaComp==='Sí'&&n!==1,
  anyKid:P.some(p=>['0–2','3–12'].includes(p.edad)),anyBaby:P.some(p=>p.edad==='0–2'),anyFormula:P.some(p=>hasO(p.lactante,'Leche de fórmula')),anyOld:P.some(p=>p.edad==='65+'),anyPreg:P.some(p=>['Embarazo','Lactancia'].includes(p.embarazo)),
  anyMov:P.some(p=>['Reducida','Silla de ruedas','Encamada'].includes(p.movil)),anyDeaf:P.some(p=>hasO(p.sentidos,'Oye mal')),
  medN:medP.length,medQ:list(medP),medUnknown:P.some(p=>p.med===NS||p.med===undefined),medFrio:frioP.length>0,medFrioQ:list(frioP),elecDev:devP.length>0,elecDevQ:list(devP),cronN:P.filter(p=>p.cronica==='Sí').length,
  helpQ:list(helpP),awayQ:list(awayP),moviles,imprTxt:impr.join('; '),allergyTxt:allergy.join(', '),faKnown:list(nm(p=>hasO(p.habil,'Primeros auxilios'))),
  petNames:list(pets.map(mname)),petMed:pets.some(m=>m.medm==='Sí')}}
const vname=(v,i)=>(ans(v.tipo)&&v.tipo!=='Otro'?v.tipo:'Vehículo')+' '+(i+1);
/* v6 · Agua por persona. Beber: mínimo 1,5 L (Protección Civil). Agua total de referencia (bebida + alimentos):
   EFSA 2010, 2,0 L mujeres y 2,5 L hombres desde 14 años; +0,3 L embarazo, +0,7 L lactancia. Para guardar: 4 L (FEMA), 6 L con calor. */
const EFSA_W={'0–2':'1,1 a 1,2 L (1-2 años)','3–12':'1,3 a 2,1 L según edad y sexo','13–17':'2,0 L chicas y 2,5 L chicos desde 14 años (1,9 y 2,1 L a los 13)'};
function waterOf(p,calor){let L=calor?6:4,extra=0;const notes=[];
 if(p.embarazo==='Embarazo'){extra=.3;notes.push('embarazo: +0,3 L (EFSA)')}else if(p.embarazo==='Lactancia'){extra=.7;notes.push('lactancia: +0,7 L (EFSA)')}
 const adult=['18–64','65+','13–17'].includes(p.edad);let ref=null;
 if(adult&&p.sexo==='Mujer')ref=(2+extra).toLocaleString('es-ES')+' L';else if(adult&&p.sexo==='Hombre')ref='2,5 L';else if(adult)ref='2,0 a 2,5 L';else if(EFSA_W[p.edad])ref=EFSA_W[p.edad];
 if(p.edad==='13–17'&&ref&&p.sexo)ref+=' (desde 14 años)';
 return{L:Math.round((L+extra)*10)/10,beber:1.5,ref,notes}}
/* v6 · Energía. Con sexo, peso, altura y edad de adulto: Mifflin-St Jeor (1990) × 1,6 (actividad moderada, EFSA 2013).
   Si falta algún dato: valor general orientativo por edad. Lactancia: +500 kcal (EFSA, lactancia exclusiva, 6 primeros meses). */
const AGE_MID={'18–64':41,'65+':72};
function kcalOf(p){const notes=[];let k=null,src='general';
 const adult=p.edad==='18–64'||p.edad==='65+',w=+p.peso,hgt=+p.altura,age=+p.edadN||AGE_MID[p.edad];
 if(adult&&(p.sexo==='Mujer'||p.sexo==='Hombre')&&w>0&&hgt>0){k=(10*w+6.25*hgt-5*age+(p.sexo==='Hombre'?5:-161))*1.6;src='formula';if(!p.edadN)notes.push('edad aproximada')}
 else{k=KCAL[p.edad]??(p.edad==='0–2'?0:null);if(k&&p.cantidad==='Poco')k*=.85;if(k&&p.cantidad==='Mucho')k*=1.2}
 if(k&&p.embarazo==='Lactancia'){k+=500;notes.push('lactancia: +500 kcal (EFSA)')}
 if(k&&p.embarazo==='Embarazo')notes.push('embarazo: EFSA suma 70, 260 o 500 kcal según el trimestre');
 return{kcal:k==null?null:Math.round(k/50)*50,src,notes}}

/* ===================== Misiones ===================== */
const defK=k=>CUR.find(d=>d.k===k);
const visible=(d,x)=>!d.c||d.c(x||X());
const levelDefs=(lv,x)=>{x=x||X();return CUR.filter(d=>d.lv===lv&&visible(d,x))};
const inst=k=>D.misiones.find(m=>m.key===k);
const isDone=k=>{const m=inst(k);return !!(m&&m.hecha)};
const semana=()=>{const d=new Date(),k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);return 'Semana del '+d.toLocaleDateString('es-ES',{day:'numeric',month:'short'}).replace('.','')};
function activeDef(){if(D.fin)return null;const x=X();return levelDefs(D.nivel,x).find(d=>!isDone(d.k))||null}
function ensureInst(k){let m=inst(k);if(!m){const d=defK(k);m={id:Math.max(0,...D.misiones.map(q=>q.id||0))+1,key:k,lvl:d.lv,semana:semana(),hecha:false,tiempos:{}};D.misiones.push(m)}m.tiempos=m.tiempos||{};return m}
const objOf=(d,x)=>d.o(x||X());
const numOf=(d,x)=>levelDefs(d.lv,x).findIndex(q=>q.k===d.k)+1;

/* ===================== Registro ===================== */
const ESTADOS=['Deseo','Tengo','Hecho','Explicado','Aprendido'];
/* v6: en el registro solo se elige Deseo, Tengo o Hecho. Explicado y Aprendido son estados de las habilidades (Guía · Cómo se hace). */
const ESTADOS_SEL=['Deseo','Tengo','Hecho'];
const FAC={Deseo:0,Tengo:.4,Hecho:.6,Explicado:0,Aprendido:.8};
const UNIDADES=['L','raciones (persona·día)','días (todo el hogar)','Wh','mAh','unidades'];
const UBT=['Casa','Mochila','Trabajo','Vehículo'];
const due=r=>!!(r.revision&&r.revision<=today());
const expired=r=>!!(r.caduca&&r.caduca<today());
const validRow=r=>['Tengo','Hecho','Aprendido'].includes(r.estado)&&(r.estado!=='Tengo'||((r.cantidad||r.cantNum)&&r.ubicacion&&r.confirmado))&&!due(r)&&!expired(r);
const keyOfMid=id=>(D.misiones.find(m=>m.id===id)||{}).key;
const linked=id=>{const k=keyOfMid(id);return D.registro.filter(r=>(+r.mision===id||(k&&r.misionKey===k))&&r.estado!=='Deseo'&&isMine(r))};
const dueRows=()=>D.registro.map((r,i)=>[r,i]).filter(([r])=>due(r)||expired(r));
function revDefault(r){const base=r.confirmado||today(),mk=(D.misiones.find(m=>m.id===+r.mision)||{}).key||'';
 if(r.estado==='Aprendido')return plusM(base,12);
 if(/medic/i.test(r.recurso+mk)&&r.caduca&&r.caduca>today())return r.caduca;
 if(['documentos','digital','finanzas','reubicacion'].includes(mk)||/document|dni|pasaporte|póliza|seguro|fotocopia/i.test(r.recurso))return plusM(base,12);
 const six=plusM(base,6);return r.caduca&&r.caduca>today()&&r.caduca<six?r.caduca:six}

/* ===================== XP ===================== */
const XPB={i:30,s:30,d:40,x:60},TXP=20;
const tScore=(s,obj)=>s==null?0:s<=obj?1:Math.max(.3,obj/s);
/* v6: un tiempo por debajo del mínimo creíble no cuenta */
const tmMin=t=>t[3]||5;
const tmVal=(t,rec)=>rec&&rec.best!=null&&rec.best>=tmMin(t)?TXP*tScore(rec.best,t[2]):0;
function split(d,v,acc){const w=d.a.length>1?[.6,.4]:[1];d.a.forEach((a,i)=>acc[a]=(acc[a]||0)+v*w[i])}
function mXP(m,d){const out={a:{},f:0,frozen:0,fac:0,needSk:[]};if(!m||!d)return out;
 let tv=0;(d.tm||[]).forEach(t=>{tv+=tmVal(t,m.tiempos&&m.tiempos[t[0]])});
 if(tv){out.a.rsp=tv;out.f+=tv}
 if(!m.hecha)return out;
 let fac=0;const fk=misFichas(d.k),skOk=fk.every(skVigente);out.needSk=fk.filter(k=>!skVigente(k));
 if(d.ty==='i'){const rows=linked(m.id),ok=rows.filter(validRow);
  /* v6: sin fila válida, la misión queda en pausa (antes conservaba el 40 %) */
  if(ok.length){fac=Math.max(...ok.map(r=>FAC[r.estado]));if(m.aprendido&&skOk)fac=.8;else if(fac>.6)fac=.6}else out.frozen=XPB.i*.4}
 else if(d.ty==='s'){const rows=linked(m.id);
  /* v6: con ficha «Cómo se hace», no puntúa hasta tener la habilidad Aprendida y vigente */
  if(!skOk)out.frozen=XPB.s*.8;else if(rows.length&&rows.every(r=>due(r)))out.frozen=XPB.s*.8;else fac=.8}
 else fac=1;
 const v=XPB[d.ty]*fac;split(d,v,out.a);out.f+=v;out.fac=fac;return out}
function maxXP(lv,x){const a={},f={};levelDefs(lv,x).forEach(d=>{const v=XPB[d.ty]*(d.ty==='i'||d.ty==='s'?.8:1);split(d,v,a);f[d.f]=(f[d.f]||0)+v;(d.tm||[]).forEach(()=>{a.rsp=(a.rsp||0)+TXP;f[d.f]=(f[d.f]||0)+TXP})});(REQ[lv]||[]).forEach(k=>{a.hab=(a.hab||0)+SKXP;const fr=skFront(k);f[fr]=(f[fr]||0)+SKXP});return{a,f}}
function score(){const x=X(),A={},F={};let frozen=0;ATR.forEach(([k])=>A[k]=0);FR.forEach(([k])=>F[k]=0);
 D.misiones.forEach(m=>{const d=defK(m.key);if(!d||!visible(d,x))return;const r=mXP(m,d);Object.entries(r.a).forEach(([k,v])=>A[k]+=v);F[d.f]+=r.f;frozen+=r.frozen});
 /* v6: habilidades Aprendidas y vigentes (la ficha de violencia doméstica nunca puntúa) */
 const sk=skillXP();A.hab+=sk.v;Object.entries(sk.f).forEach(([k,v])=>{if(F[k]!=null)F[k]+=v});frozen+=sk.frozen;
 /* v6: los mínimos de nivel solo cuentan misiones y habilidades Aprendidas; lo demás suma al total, no desbloquea */
 const AM={};ATR.forEach(([k])=>AM[k]=Math.round(A[k]));
 const bonus={};D.registro.filter(r=>!r.mision&&r.estado==='Tengo'&&validRow(r)&&r.frente).forEach(r=>{bonus[r.frente]=Math.min(30,(bonus[r.frente]||0)+3)});
 Object.entries(bonus).forEach(([f,v])=>{if(F[f]!=null){F[f]+=v;A.rec+=v}});
 (D.aver||[]).forEach(q=>{A.res+=5;if(F[q.f]!=null)F[q.f]+=5});
 const ex=extraXP();Object.entries(ex.a).forEach(([k,v])=>A[k]+=v);const cu=courseXP();A.hab+=cu.v;Object.entries(cu.f).forEach(([k,v])=>{if(F[k]!=null)F[k]+=v});Object.entries(ex.f).forEach(([k,v])=>{if(F[k]!=null)F[k]+=v});
 const lv=D.fin?4:D.nivel,cumA={},cumF={};let lo=0,hi=0;
 for(let l=1;l<=lv;l++){const mx=maxXP(l,x),tot=Object.values(mx.a).reduce((s,v)=>s+v,0);if(l<lv)lo+=tot;hi+=tot;Object.entries(mx.a).forEach(([k,v])=>cumA[k]=(cumA[k]||0)+v);Object.entries(mx.f).forEach(([k,v])=>cumF[k]=(cumF[k]||0)+v)}
 const min={};ATR.forEach(([k])=>min[k]=Math.round(.4*(cumA[k]||0)));
 Object.keys(A).forEach(k=>A[k]=Math.round(A[k]));Object.keys(F).forEach(k=>F[k]=Math.round(F[k]));
 const block=ATR.filter(([k])=>AM[k]<min[k]).map(([k])=>k),req=reqMissing(lv);
 const T=Object.values(A).reduce((s,v)=>s+v,0);
 const fr=hi>lo?Math.max(0,Math.min(1,(T-lo)/(hi-lo))):1,cuts=[0,.2,.45,.7];let ri=0;cuts.forEach((q,i)=>{if(fr>=q)ri=i});
 const next=ri<3?Math.max(1,Math.ceil(lo+cuts[ri+1]*(hi-lo)-T)):0;
 return{A,AM,F,T,min,block,req,cumA,cumF,ri,next,frozen:Math.round(frozen),lv}}
function checkLevel(){if(D.fin)return false;const ex=levelDefs(D.nivel).find(d=>d.ty==='x');if(!ex||!isDone(ex.k))return false;const S=score();if(S.block.length||S.req.length)return false;
 D.pasados=[...new Set([...(D.pasados||[]),D.nivel])];if(D.nivel>=4)D.fin=true;else D.nivel++;return true}

/* ===================== Autonomía ===================== */
function autonomy(){const x=X(),ok=D.registro.filter(r=>validRow(r)&&(r.ubtipo==='Casa'||!r.ubtipo)),num=r=>parseFloat(String(r.cantNum||'').replace(',','.'))||0;
 const L=ok.filter(r=>r.unidad==='L').reduce((s,r)=>s+num(r),0);
 const rac=ok.filter(r=>r.unidad==='raciones (persona·día)').reduce((s,r)=>s+num(r),0),dh=ok.filter(r=>r.unidad==='días (todo el hogar)').reduce((s,r)=>s+num(r),0);
 const wh=ok.reduce((s,r)=>s+(r.unidad==='Wh'?num(r):r.unidad==='mAh'?num(r)*3.7/1000:0),0);
 const eNeed=x.n?Math.max(1,x.moviles)*12+10:null;
 return{x,L,agua:x.Lday?L/x.Lday:null,comida:x.n?(rac/x.n+dh):null,rac,dh,wh,energia:eNeed?wh/eNeed:null,eNeed}}
const dias=v=>v==null?'—':v<10?(Math.floor(v*10)/10).toLocaleString('es-ES'):Math.floor(v).toLocaleString('es-ES');

/* ===================== Preguntas «No lo sé» ===================== */
const qVisible=(q,obj)=>!q.c||q.c(obj);
function unknowns(){const out=[];const H=D.hogar||{};
 HQ.forEach(s=>s.q.forEach(q=>{if(qVisible(q,H)&&H[q.k]===NS)out.push({sid:'h:'+s.id,l:q.l,who:'Hogar',f:q.f})}));
 (D.personas||[]).forEach((p,i)=>PQ.forEach(s=>{if(s.c&&!s.c(p))return;s.q.forEach(q=>{if(qVisible(q,p)&&p[q.k]===NS)out.push({sid:'p:'+p.id+':'+s.id,l:q.l,who:pname(p,i),f:q.f})})}));
 (D.mascotas||[]).forEach((m,i)=>MQ.forEach(s=>s.q.forEach(q=>{if(m[q.k]===NS)out.push({sid:'m:'+m.id+':'+s.id,l:q.l,who:mname(m,i),f:q.f})})));
 (D.vehiculos||[]).forEach((v,i)=>VQ.forEach(s=>s.q.forEach(q=>{if(qVisible(q,v)&&v[q.k]===NS)out.push({sid:'v:'+v.id+':'+s.id,l:q.l,who:vname(v,i),f:q.f})})));return out}
function unknownsKeys(){const m=new Map();if(!D||!D.hogar)return m;unknowns().forEach(u=>{const id=u.sid+'|'+u.l;m.set(id,{id,f:FRN[u.f]?u.f:'doc'})});return m}
function screensFor(src,mode){const out=[];
 HQ.forEach(s=>{if(s.only==='onb'&&mode==='edit')return;out.push({id:'h:'+s.id,s,scope:'h',obj:src.hogar})});
 src.personas.forEach((p,i)=>PQ.forEach(s=>{if(s.c&&!s.c(p))return;if(!isMine(p))return;out.push({id:'p:'+p.id+':'+s.id,s,scope:'p',obj:p,idx:i,who:'Persona '+(i+1)+' de '+src.personas.length})}));
 src.mascotas.forEach((m,i)=>MQ.forEach(s=>out.push({id:'m:'+m.id+':'+s.id,s,scope:'m',obj:m,idx:i,who:'Animal '+(i+1)+' de '+src.mascotas.length})));
 (src.vehiculos||[]).forEach((v,i)=>VQ.forEach(s=>out.push({id:'v:'+v.id+':'+s.id,s,scope:'v',obj:v,idx:i,who:'Vehículo '+(i+1)+' de '+src.vehiculos.length})));return out}
const pendingQ=sc=>sc.s.q.filter(q=>!q.opt&&qVisible(q,sc.obj)&&!given(sc.obj[q.k]));
function unanswered(){if(!D||!D.hogar)return 0;return screensFor({hogar:D.hogar,personas:D.personas||[],mascotas:D.mascotas||[],vehiculos:D.vehiculos||[]},'fill').reduce((s,sc)=>s+pendingQ(sc).length,0)}
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
function syncArrays(dr){const h=dr.hogar;if(typeof h.nper==='number'){while(dr.personas.length<h.nper)dr.personas.push({id:uid()});if(dr.personas.length>h.nper)dr.personas.length=h.nper}
 const nm=h.animales==='Sí'&&typeof h.nmasc==='number'?h.nmasc:h.animales==='No'?0:dr.mascotas.length;while(dr.mascotas.length<nm)dr.mascotas.push({id:uid()});if(dr.mascotas.length>nm)dr.mascotas.length=nm;
 dr.vehiculos=dr.vehiculos||[];if(typeof h.nveh==='number'){while(dr.vehiculos.length<h.nveh)dr.vehiculos.push({id:uid()});if(dr.vehiculos.length>h.nveh)dr.vehiculos.length=h.nveh}}

/* ===================== Asistente del perfil ===================== */
function startWz(mode,only){const src=D&&D.hogar?{hogar:D.hogar,personas:D.personas||[],mascotas:D.mascotas||[],vehiculos:D.vehiculos||[]}:{hogar:{},personas:[],mascotas:[],vehiculos:[]};
 wz={mode,draft:structuredClone(src),hist:[],only:only||null,cur:null};wzNext(true)}
function wzList(){const all=screensFor(wz.draft,wz.mode);if(wz.only)return all.filter(s=>wz.only.includes(s.id));if(wz.mode==='fill')return all.filter(s=>pendingQ(s).length||wz.hist.includes(s.id));return all}
function wzCur(){return screensFor(wz.draft,wz.mode).find(s=>s.id===wz.cur)}
function wzNext(first){if(!first){const sc=wzCur();if(sc){const miss=pendingQ(sc);if(miss.length){note('Responde o marca «No lo sé»: falta «'+miss[0].l+'».');const el=document.querySelector('[data-q="'+miss[0].k+'"]');if(el)el.scrollIntoView({block:'center'});return}
  const bad=sc.s.q.find(q=>q.ty==='n'&&qVisible(q,sc.obj)&&given(sc.obj[q.k])&&sc.obj[q.k]!==NS&&(!(sc.obj[q.k]>=q.min)||!(sc.obj[q.k]<=q.max)));if(bad){note(`«${bad.l}»: escribe un número entre ${bad.min} y ${bad.max}, o déjalo vacío.`);return}if(sc.scope==='h')syncArrays(wz.draft)}}
 const n=wzList().find(s=>!wz.hist.includes(s.id));if(n){wz.hist.push(n.id);wz.cur=n.id}else wz.cur='__sum';
 if(wz.cur==='__sum'&&wz.mode==='edit'){wzEnd();return}window.scrollTo(0,0);render();const h=$('#v .wzh .k');if(h&&!first){h.tabIndex=-1;h.focus({preventScroll:true})}}
function wzBack(){if(wz.cur==='__sum')wz.cur=wz.hist[wz.hist.length-1];else{wz.hist.pop();wz.cur=wz.hist[wz.hist.length-1]}if(!wz.cur){wzCancel();return}window.scrollTo(0,0);render()}
function wzCancel(){if(!D||!D.hogar)return;
 /* si se canceló añadir una persona o animal nuevo sin datos, se quita */
 const real=o=>Object.keys(o).some(k=>k!=='id'&&k[0]!=='_');D.personas=D.personas.filter(real);D.mascotas=D.mascotas.filter(real);D.vehiculos=(D.vehiculos||[]).filter(real);if(typeof D.hogar.nveh==='number')D.hogar.nveh=D.vehiculos.length;D.hogar.nper=D.personas.length||D.hogar.nper;if(D.hogar.animales==='Sí')D.hogar.nmasc=D.mascotas.length;save();wz=null;render()}
function wzSet(qi,val){const sc=wzCur(),q=sc.s.q[qi];if(val===undefined)delete sc.obj[q.k];else sc.obj[q.k]=val}
function keepFocus(id){const y=window.scrollY;render();window.scrollTo(0,y);const b=document.getElementById(id);if(b)b.focus({preventScroll:true})}
function wzPick(qi,oi){const sc=wzCur(),q=sc.s.q[qi],cur=sc.obj[q.k];
 if(oi===-1)wzSet(qi,cur===NS?undefined:NS);
 else if(oi===-2)wzSet(qi,cur===q.nada?undefined:q.nada);
 else if(q.ty==='one')wzSet(qi,cur===q.o[oi]?undefined:q.o[oi]);
 else{const v=q.o[oi];let a=Array.isArray(cur)?cur.slice():[];a=a.includes(v)?a.filter(y=>y!==v):[...a,v];if(q.ex)a=v===q.ex?a.filter(y=>y===q.ex):a.filter(y=>y!==q.ex);wzSet(qi,a.length?a:undefined)}
 keepFocus('q'+qi+'_'+oi)}
function wzNum(qi,dl){const sc=wzCur(),q=sc.s.q[qi],cur=sc.obj[q.k];const v=typeof cur==='number'?cur+dl:q.min;wzSet(qi,Math.max(q.min,Math.min(q.max,v)));keepFocus('q'+qi+'_'+(dl>0?'p':'m'))}
function wzNumIn(qi,el){const v=String(el.value).replace(',','.').trim();wzSet(qi,v===''?undefined:Math.round(parseFloat(v)*10)/10)}
function wzText(qi,el){wzSet(qi,el.value.trim()?el.value:undefined);document.querySelectorAll('[data-tq="'+qi+'"]').forEach(b=>{b.setAttribute('aria-pressed','false');b.classList.remove('on')})}
const showV=v=>v===NS?'No lo sé':Array.isArray(v)?v.join(', '):typeof v==='number'?String(v):v;
function qHtml(q,qi,obj){const v=obj[q.k],id='q'+qi,nk=q.opt?'':`<button type="button" ${q.ty==='text'?`data-tq="${qi}"`:''} id="${id}_-1" class="opt nk ${v===NS?'on':''}" aria-pressed="${v===NS}" onclick="wzPick(${qi},-1)">No lo sé</button>`;
 let h=`<fieldset class="q" data-q="${q.k}"><legend class="k">${esc(q.l)}${q.opt?' · opcional':''}</legend>`;
 if(q.ty==='n'){h+=`<div class="numin"><input type="number" id="${id}" inputmode="decimal" step="any" min="${q.min}" max="${q.max}" aria-label="${esc(q.l)} (${esc(q.unit||'')})" value="${typeof v==='number'?v:''}" oninput="wzNumIn(${qi},this)" autocomplete="off"><span class="unit">${esc(q.unit||'')}</span></div>${q.hint?`<p class="hint">${esc(q.hint)}</p>`:''}</fieldset>`;return h}
 if(q.ty==='text'){const val=v===NS||v===q.nada?'':v||'';h+=`<input type="text" id="${id}" aria-label="${esc(q.l)}" placeholder="${esc(q.ph||'')}" value="${esc(val)}" oninput="wzText(${qi},this)" autocomplete="off"><div class="opts">${q.nada?`<button type="button" data-tq="${qi}" id="${id}_-2" class="opt ${v===q.nada?'on':''}" aria-pressed="${v===q.nada}" onclick="wzPick(${qi},-2)">${esc(q.nada)}</button>`:''}${nk}</div>`}
 else if(q.ty==='num')h+=`<div class="opts"><div class="step"><button type="button" class="opt" id="${id}_m" aria-label="Menos" onclick="wzNum(${qi},-1)">−</button><b aria-live="polite" aria-label="${esc(q.l)}: ${typeof v==='number'?v:'sin responder'}">${typeof v==='number'?v:'—'}</b><button type="button" class="opt" id="${id}_p" aria-label="Más" onclick="wzNum(${qi},1)">+</button></div>${nk}</div>`;
 else{const sel=o=>q.ty==='multi'?hasO(v,o):v===o;h+=`<div class="opts">${q.o.map((o,oi)=>`<button type="button" id="${id}_${oi}" class="opt ${sel(o)?'on':''}" aria-pressed="${sel(o)}" onclick="wzPick(${qi},${oi})">${esc(o)}</button>`).join('')}${nk}</div>${q.ty==='multi'?'<p class="hint">Puedes marcar varias.</p>':''}`}
 if(q.hint)h+=`<p class="hint">${esc(q.hint)}</p>`;if(q.link&&typeof linksHtml==='function')h+=linksHtml([q.link],false,true);
 return h+'</fieldset>'}
function renderWz(){const sc=wz.cur==='__sum'?null:wzCur(),L=wzList(),pos=wz.hist.length,tot=Math.max(pos,L.length);
 const title=wz.mode==='onb'?'Configuración inicial':wz.mode==='fill'?'Completar perfil':'Editar perfil';let body;
 if(sc){const sub=sc.scope==='h'?'Hogar · '+esc(sc.s.t):`${esc(sc.who)} · ${esc(sc.s.t)}`;
  body=`<div class="wzh"><div class="k">${sub}</div><div class="pbar" role="progressbar" aria-label="Progreso" aria-valuemin="0" aria-valuemax="${tot}" aria-valuenow="${pos}"><i style="width:${Math.round(pos/tot*100)}%"></i></div></div>
  ${wz.mode==='fill'&&pos===1&&D&&D.migradoDe?'<p class="box">Plan B se ha actualizado y hay preguntas nuevas. Tu progreso, tus misiones y tu registro se conservan.</p>':''}${wz.mode==='onb'&&pos===1?bigHelp()+'<p class="lead">No damos nada por hecho. Responde lo que sepas; si no lo sabes, marca «No lo sé».</p><p class="box">¿Vienes de otro móvil? <button type="button" class="link" onclick="$(\'#imp0\').click()">Restaurar una copia</button><input type="file" id="imp0" accept="application/json,.json" hidden onchange="importar(this)"></p>':''}${sc.s.h?`<p class="lead">${esc(sc.s.h)}</p>`:''}${sc.s.q.map((q,qi)=>qVisible(q,sc.obj)?qHtml(q,qi,sc.obj):'').join('')}
  ${sc.s.q.some(q=>!q.opt&&qVisible(q,sc.obj))?'<p class="box dash">«No lo sé» no resta: crea una misión para averiguarlo.</p>':''}`}
 else{const x=X(wz.draft);body=`<div class="wzh"><div class="k">Resumen</div></div><h2 class="h2">TU HOGAR</h2><p class="lead">Revísalo. Se guarda solo en este dispositivo y puedes cambiarlo cuando quieras.</p>
  <div class="card"><dl class="dl sm">${HQ.map(s=>s.q.filter(q=>qVisible(q,wz.draft.hogar)&&given(wz.draft.hogar[q.k])).map(q=>`<dt>${esc(q.l)}</dt><dd>${esc(showV(wz.draft.hogar[q.k]))}</dd>`).join('')).join('')}</dl></div>
  ${wz.draft.personas.map((p,i)=>`<div class="card"><div class="k">Persona ${i+1}</div><h3 class="h3">${esc(pname(p,i))}</h3><p class="sm mut">${esc([ans(p.edad)?p.edad+' años':'',p.med==='Sí'?'medicación':'',ans(p.dieta)?p.dieta:''].filter(Boolean).join(' · '))}</p>${x.ppl[i]?`<p class="sm">Agua: ${x.ppl[i].L} L/día${x.ppl[i].kcal?` · ${x.ppl[i].kcal.toLocaleString('es-ES')} kcal/día`:''}</p>`:''}</div>`).join('')}
  ${wz.draft.mascotas.map((m,i)=>`<div class="card"><div class="k">Animal ${i+1}</div><h3 class="h3">${esc(mname(m,i))}</h3></div>`).join('')}
  ${(wz.draft.vehiculos||[]).map((v,i)=>`<div class="card"><div class="k">Vehículo ${i+1}</div><h3 class="h3">${esc(vname(v,i))}</h3><p class="sm mut">${esc([v.motor,v.dep?'depósito: '+v.dep:'',v.bat?'batería: '+v.bat:''].filter(x=>ans(x)).join(' · '))}</p></div>`).join('')}`}
 return `<section class="wz" aria-labelledby="wzt"><h1 id="wzt" class="sr">${title}</h1>${body}
 <div class="row end">${(pos>1||wz.cur==='__sum')?'<button type="button" class="gh" onclick="wzBack()">Atrás</button>':(wz.mode!=='onb'?'<button type="button" class="gh" onclick="wzCancel()">Cancelar</button>':'')}
 <button type="button" class="btn" onclick="${wz.cur==='__sum'?'wzEnd()':'wzNext()'}">${wz.cur==='__sum'?(wz.mode==='onb'?'Empezar':'Guardar'):(wz.mode==='edit'&&!wzList().some(s=>!wz.hist.includes(s.id))?'Guardar':'Siguiente')}</button></div>
 ${wz.mode==='fill'?'<p class="center"><button type="button" class="link" onclick="wz=null;render()">Más tarde</button></p>':''}</section>`}
function wzEnd(){const dr=wz.draft,mode=wz.mode;syncArrays(dr);
 if(!D||!D.hogar){D={ver:7,v7:{at:today()},inicio:today(),nivel:1,misiones:[],registro:[],repasos:[],aver:[],cfg:(D&&D.cfg)||{},pasados:[],...(D&&D.misiones?D:{})}}
 const old=unknownsKeys();stampProfile(dr);D.hogar=dr.hogar;D.personas=dr.personas;D.mascotas=dr.mascotas;D.vehiculos=dr.vehiculos||[];
 if(D.personas.length&&D.hogar.nper!==NS)D.hogar.nper=D.personas.length;
 const now=unknownsKeys();old.forEach(k=>{if(!now.has(k.id)&&!D.aver.some(a=>a.id===k.id))D.aver.push({id:k.id,f:k.f,fecha:today()})});
 wz=null;makeRepasos();checkLevel();save();if(mode==='onb')tab='p';render();window.scrollTo(0,0);note(mode==='onb'?'Perfil guardado. Tu primera misión te espera.':'Perfil guardado. Misiones y cantidades actualizadas.')}

/* ===================== Repasos ===================== */
function makeRepasos(){const x=X();D.repasos=D.repasos||[];D.misiones.forEach(m=>{const d=defK(m.key);if(!d||!m.hecha||!visible(d,x))return;const o=objOf(d,x);if(!m.sig){m.sig=o;return}if(m.sig===o)return;
 D.repasos=D.repasos.filter(r=>r.resuelto||r.mid!==m.id);D.repasos.push({id:Date.now()+m.id,mid:m.id,key:m.key,titulo:'Repaso: '+d.t,texto:o,fecha:today(),resuelto:false})})}
function ajustado(id){const r=D.repasos.find(q=>q.id===id);if(!r)return;r.resuelto=today();const m=D.misiones.find(q=>q.id===r.mid),d=m&&defK(m.key);if(d)m.sig=objOf(d);save();render()}

/* ===================== Migración desde v3 ===================== */
const CATMAP={'agua':'agua','comida':'comida','refugio y casa':'seg','energía':'energia','seguridad física':'seg','seguridad digital':'doc','respaldo analógico':'doc','protocolos familiares':'evac','salud y botiquín':'salud','comunicaciones':'com','evacuación':'evac','habilidades':'seg'};
function migrate(){if(!D)return;
 if(!D.ver||D.ver<4){const p=D.perfil||{},h={};
  const nA=+p.adultos||0,nM=+p.menores||0;if(D.perfil&&(nA+nM)>0)h.nper=nA+nM;
  if(p.mascotas==='Sí')h.animales='Sí';else if(p.mascotas==='No')h.animales='No';
  if(['Piso','Casa','Otra'].includes(p.vivienda))h.vivienda=p.vivienda;
  const pl={Bajo:'Bajo',Intermedia:'1.ª a 3.ª',Alta:'4.ª o más'}[p.planta];if(pl)h.planta=pl;if(p.ascensor==='Sí'||p.ascensor==='No')h.ascensor=p.ascensor;
  const en={Ciudad:'Urbano',Pueblo:'Pueblo','Rural o aislado':'Rural o aislado'}[p.entorno];if(en)h.entorno=en;if(p.entorno==='Isla')h.isla='Sí';
  if(p.region)h.municipio=p.region;
  const cm={'Costa (primera línea)':'Costa','Zona baja o junto a barranco/río':'Barranco, río o zona baja','Ladera o monte':'Monte o zona forestal','Bosque o vegetación seca':'Monte o zona forestal','Industria química o puerto':'Industria química o puerto','Nada de esto':'Nada de esto'};
  if(Array.isArray(p.cerca)&&p.cerca.length){const c2=[...new Set(p.cerca.map(v=>cm[v]).filter(Boolean))];if(c2.length)h.cerca=c2}
  if(p.cocina==='Vitro/inducción')h.cocina=['Eléctrica'];if(p.agua==='De red')h.agua='Red municipal';
  if(p.vehiculo==='No')h.vehiculos='Ninguno';else if(p.vehiculo==='Gasolina/diésel')h.vehTipo=['Combustión'];else if(p.vehiculo==='Eléctrico')h.vehTipo=['Eléctrico'];
  const cl={Calor:'Calor intenso frecuente','Frío':'Frío intenso frecuente',Templado:'Templado'}[p.clima];if(cl)h.clima=cl;
  const rm={'Incendios forestales':'Incendios forestales','Inundaciones/DANA':'Inundaciones o DANA','Terremotos':'Terremotos','Volcánico':'Volcán','Olas de calor':'Olas de calor','Temporales':'Temporales o huracanes'};
  if(Array.isArray(p.riesgos)&&p.riesgos.length){const r=[...new Set(p.riesgos.map(v=>rm[v]).filter(Boolean))];if(r.length)h.riesgos=r}
  const personas=[];for(let i=0;i<nA+nM;i++)personas.push({id:uid()});
  const reg=(D.registro||[]).map(r=>({...r,frente:r.frente||CATMAP[r.categoria]||'seg',ubtipo:r.ubtipo==='Coche'?'Vehículo':r.ubtipo}));
  const mis=(D.misiones||[]).map(m=>{const d=defK(m.key);return d?{id:m.id,key:m.key,lvl:d.lv,semana:m.semana||'',hecha:!!m.hecha,fecha:m.fecha,tiempos:{}}:null}).filter(Boolean);
  const nv=Math.max(1,Math.min(4,+D.nivel||1));
  D={ver:4,inicio:today(),migradoDe:3,nivel:nv,fin:!!D.fin,pasados:Array.from({length:nv-1},(_,i)=>i+1),hogar:D.perfil?h:undefined,personas,mascotas:[],misiones:mis,registro:reg,
   repasos:(D.repasos||[]).filter(r=>!r.resuelto).map(r=>({id:r.id,mid:r.mid,key:r.key,titulo:r.titulo,texto:r.texto,fecha:r.fecha,resuelto:false})),aver:[],cfg:{}};
  if(D.hogar){const x=X();D.misiones.forEach(m=>{const d=defK(m.key);if(m.hecha&&d)m.sig=objOf(d,x)})}}
 D.misiones=D.misiones||[];D.registro=D.registro||[];D.repasos=D.repasos||[];D.aver=D.aver||[];D.cfg=D.cfg||{};D.personas=D.personas||[];D.mascotas=D.mascotas||[];D.nivel=D.nivel||1;D.pasados=D.pasados||[]}

/* ===================== Diálogos ===================== */
function ask(html,yes='Sí',no='No'){return new Promise(ok=>{const d=$('#dlg');$('#dlgb').innerHTML=html;$('#dy').textContent=yes;$('#dn').textContent=no||'';$('#dn').hidden=!no;d.showModal();$('#dy').onclick=()=>{d.close();ok(true)};$('#dn').onclick=()=>{d.close();ok(false)};d.oncancel=()=>ok(false)})}
function note(t){const n=$('#toast');n.textContent=t;n.hidden=false;clearTimeout(note._t);note._t=setTimeout(()=>{n.hidden=true},3800)}

/* ===================== Iconos ===================== */
const IC={p:'<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h7v7h-7z"/>',m:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/><path d="M12 8l4 4-4 4-4-4z"/>',n:'<path d="M4 20h4v-6H4zM10 20h4V9h-4zM16 20h4V4h-4z"/>',r:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 10h6M9 14h6M9 18h3"/>',f:'<path d="M12 4l4 4-4 4-4-4z"/><path d="M5 21l2-6h10l2 6"/>'};
const svgI=k=>`<svg aria-hidden="true" focusable="false" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3">${IC[k]}</svg>`;
const ROM=['I','II','III','IV'];
const durTxt=m=>m>=1440?Math.round(m/1440)+' días':m>=120?Math.round(m/60)+' h':m+' min';
const tyTxt={i:'se apunta en el Refugio',s:'saber hacer',d:'simulacro',x:'examen'};

/* ===================== Panel ===================== */
const NAV=[['p','Panel'],['m','Misión'],['n','Niveles'],['g','Guía'],['r','Registro'],['e','Equipo'],['f','Perfil']];
function radar(S){const cx=120,cy=100,R=62,keys=ATR.map(a=>a[0]),pt=(i,r)=>{const g=-Math.PI/2+i*2*Math.PI/keys.length;return[(cx+r*Math.cos(g)).toFixed(1),(cy+r*Math.sin(g)).toFixed(1)]};
 const val=k=>S.cumA[k]?Math.min(1,S.A[k]/S.cumA[k]):0,ring=f=>keys.map((_,i)=>pt(i,R*f).join(',')).join(' ');
 const poly=keys.map((k,i)=>pt(i,Math.max(.03,val(k))*R).join(',')).join(' ');
 const anc=keys.map((_,i)=>{const c=Math.cos(-Math.PI/2+i*2*Math.PI/keys.length);return Math.abs(c)<.2?'middle':c>0?'start':'end'});
 const lab=keys.map((k,i)=>{const[x,y]=pt(i,R+10),b=S.block.includes(k),dy=i===0?-4:i===keys.length/2?12:4;return `<text x="${x}" y="${(+y+dy).toFixed(1)}" text-anchor="${anc[i]}" class="rl${b?' b':''}">${ATRN[k].toUpperCase()} ${S.A[k]}</text>`}).join('');
 const desc=ATR.map(([k,l])=>`${l}: ${S.A[k]} XP de ${Math.round(S.cumA[k]||0)} posibles; para el mínimo cuentan ${S.AM[k]} de ${S.min[k]}${S.block.includes(k)?', bloquea la subida':''}`).join('. ');
 return `<svg class="radar" viewBox="-22 -4 284 208" role="img" aria-label="Radar de atributos. ${esc(desc)}.">${[1,.66,.33].map(f=>`<polygon points="${ring(f)}" class="rg"/>`).join('')}<polygon points="${ring(.4)}" class="rmin"/>${keys.map((_,i)=>`<line x1="${cx}" y1="${cy}" x2="${pt(i,R)[0]}" y2="${pt(i,R)[1]}" class="rg"/>`).join('')}<polygon points="${poly}" class="rv"/>${lab}</svg>`}
function weak(S,A){const dr=dueRows();if(dr.length)return{t:`${dr.length} revisi${dr.length>1?'ones vencidas':'ón vencida'}`,s:S.frozen?`${S.frozen} puntos en pausa hasta que lo compruebes.`:'Compruébalo para mantener tus puntos.',go:"go('m')"};
 if(A.x.Lday&&(A.agua==null||A.agua<3))return{t:A.L?'Agua para menos de 72 h':'Sin agua comprobada',s:`Necesitáis ${A.x.Lday*3} L para 72 h${A.L?`; hay ${Math.round(A.L)} L.`:'.'}`,go:"go('r')"};
 const sw=skWarn();if(sw.length){const w=sw[0];return{t:w.t,s:w.s,go:`go('g');gs('como');gfic='${w.k}';render()`}}
 if(S.req.length){return{t:'Falta una habilidad para subir',s:'Aprende: '+S.req.map(k=>fichaDef(k).t).join(', ')+'. Práctica y test en Guía · Cómo se hace.',go:"go('n')"}}
 if(S.block.length){const k=S.block[0];return{t:ATRN[k]+' bajo mínimo',s:`${S.AM[k]} de ${S.min[k]} XP de misiones y habilidades para poder subir.`,go:"go('n')"}}
 if(A.x.mismaComp)return{t:'Misma compañía de móvil',s:'Si falla esa red, os quedáis todos sin móvil. Una eSIM o una línea de otra compañía sirve de respaldo.',go:"viewKey='walkies';tab='m';render()"};
 const u=unknowns().length;if(u)return{t:`${u} respuesta${u>1?'s':''} «No lo sé»`,s:'Averiguarlas da XP de Resolución.',go:"go('m')"};return null}
const V={};
V.p=function(){const S=score(),A=autonomy(),x=A.x,ad=activeDef(),dr=dueRows(),wk=weak(S,A),lvl=S.lv,L=NIV[lvl-1];
 let h=`<h1 class="sr">Panel</h1><div class="hero"><div><div class="k">Nivel · rango</div><div class="n">${pad2(lvl)}<span class="nu"> · ${esc(L.t)}</span></div><div class="rk">${D.fin?'NIVEL MÁXIMO':'RANGO '+ROM[S.ri]+' · '+RANGOS[S.ri].toUpperCase()}</div></div>
 <div class="tr"><div class="k">XP total</div><div class="n">${S.T.toLocaleString('es-ES')}</div><div class="mut xs up">${D.fin?'4 niveles completados':S.next?`${S.next} para rango ${ROM[S.ri+1]}`:'Rango máximo · haz el examen'}</div></div></div>`;
 const un=unanswered();if(un)h+=`<button type="button" class="card inv wide tl" onclick="startWz('fill')"><span class="k">Perfil incompleto</span><b>${un} pregunta${un>1?'s':''} sin responder</b><span class="xs">Respóndelas para adaptar misiones y cantidades.</span></button>`;
 h+=`<section class="card radarc" aria-labelledby="att"><h2 class="k" id="att">Atributos</h2><div class="rcol">${radar(S)}</div><div class="rtx"><p class="mut xs">Para subir: el mínimo en los seis (línea discontinua), las habilidades del nivel y el examen. Para el mínimo solo cuentan misiones comprobadas y habilidades aprobadas.</p><p class="blk">${S.block.length?'BLOQUEAN: '+S.block.map(k=>ATRN[k].toUpperCase()).join(' · '):'TODOS EN EL MÍNIMO'}</p></div></section>`;
 h+=`<section class="card" aria-labelledby="frt"><h2 class="k" id="frt">Frentes de cobertura</h2><ul class="bars">${FR.map(([k,l])=>{const mx=S.cumF[k]||0,p=mx?Math.min(100,Math.round(S.F[k]/mx*100)):0;return `<li><span>${l}</span><span class="bar" role="img" aria-label="${l}: ${p} %"><i style="width:${p}%"></i></span><b>${S.F[k]}</b></li>`}).join('')}</ul></section>`;
 h+=`<div class="two">${wk?`<button type="button" class="card inv tl" onclick="${wk.go}"><span class="k">▲ Punto débil</span><b>${esc(wk.t)}</b><span class="xs">${esc(wk.s)}</span></button>`:`<div class="card"><div class="k">Punto débil</div><b>Nada urgente</b></div>`}
 <div class="card"><div class="k">Autonomía</div><div class="n2">${dias(A.agua)}<span class="xs"> días</span></div><div class="mut xs up">Agua · ${x.n?`${x.n} persona${x.n>1?'s':''}`:'personas sin definir'}${x.pets.length?' + '+x.pets.length+' animal'+(x.pets.length>1?'es':''):''}</div></div></div>`;
 if(ad){const n=numOf(ad);h+=`<button type="button" class="card mis wide" onclick="go('m')"><span class="n2">${ad.ty==='x'?'EX':pad2(n)}</span><span class="mc"><span class="k">Misión de la semana</span><b>${esc(ad.t)}</b><span class="xs mut">${durTxt(ad.min)} · ${tyTxt[ad.ty]}</span></span><span aria-hidden="true">›</span></button>`}
 h+=`<section class="card" aria-labelledby="aut"><h2 class="k" id="aut">Autonomía real</h2><p class="mut xs">Con lo comprobado en casa (registro) y tu perfil.</p>
 <div class="three"><div><div class="n3">${dias(A.agua)}</div><div class="k">Agua · días</div><div class="mut xs">${Math.round(A.L)} L · ${x.Lday?x.Lday+' L/día':'? L/día'}</div></div><div><div class="n3">${dias(A.comida)}</div><div class="k">Comida · días</div><div class="mut xs">${A.rac?Math.round(A.rac)+' raciones':''}${A.dh?(A.rac?' + ':'')+A.dh+' días':''}${!A.rac&&!A.dh?'sin datos':''}</div></div><div><div class="n3">${dias(A.energia)}</div><div class="k">Energía · días</div><div class="mut xs">${Math.round(A.wh)} Wh${A.eNeed?' · '+A.eNeed+' Wh/día':''}</div></div></div>
 ${x.ppl.length||x.pets.length?`<table class="tbl"><caption class="sr">Necesidades por persona</caption><thead><tr><th scope="col">Quién</th><th scope="col">Agua/día</th><th scope="col">Comida/día</th></tr></thead><tbody>${x.ppl.map(q=>`<tr><th scope="row">${esc(q.name)}<span class="xs mut db">${esc(['beber mín. 1,5 L',q.ref?'EFSA '+q.ref:'',...q.notes].filter(Boolean).join(' · '))}</span></th><td>${q.L.toLocaleString('es-ES')} L</td><td>${q.kcal==null?'edad ?':q.kcal?q.kcal.toLocaleString('es-ES')+' kcal'+(q.kcalSrc==='formula'?'':'<span class="xs mut db">general</span>'):'especial'}</td></tr>`).join('')}${x.pets.map((m,i)=>`<tr><th scope="row">${esc(mname(m,i))}</th><td>${petLday(m,x.calor)?petLday(m,x.calor)+' L':'peso ?'}</td><td>su comida</td></tr>`).join('')}</tbody></table><p class="xs mut">Agua para guardar: 4 L por persona y día para beber, cocinar e higiene básica (FEMA: 1 galón)${x.calor?'; con calor, la parte que se bebe puede doblarse (Ready.gov): 6 L en total':''}; embarazo +0,3 L y lactancia +0,7 L (EFSA). Beber: mínimo 1,5 L (Protección Civil). Agua total de referencia (bebida y alimentos, EFSA 2010): 2,0 L mujeres y 2,5 L hombres desde 14 años, con temperatura y actividad moderadas. Comida: estimación. Con sexo, peso, altura y edad, fórmula de Mifflin-St Jeor (1990) × 1,6 de actividad moderada (EFSA 2013); si falta algún dato, valor general orientativo. Animales: unos 60 ml por kg y día, orientativo. Energía: 12 Wh por móvil y 10 Wh de luz al día, orientativo.</p>`:''}</section>`;
 if(dr.length)h+=`<section class="card"><h2 class="k">Por revisar · ${dr.length}</h2>${dr.slice(0,4).map(([r,i])=>`<div class="rv"><div><b>${esc(r.recurso)}</b><span class="xs mut db">${expired(r)?'Caducado el '+fmtD(r.caduca):'Revisión '+fmtD(r.revision)} · ${esc(r.ubicacion||'—')}</span></div><button type="button" class="gh sm" onclick="${expired(r)?`edit(${i})`:`revisado(${i})`}">${expired(r)?'Editar':'Revisado hoy'}</button></div>`).join('')}</section>`;
 if(backupDue())h+=`<section class="card dash"><h2 class="k">Copia de seguridad</h2><p class="sm">${D.cfg.lastBackup?'Tu última copia es del '+fmtD(D.cfg.lastBackup)+'.':'Aún no has hecho ninguna copia.'} Si se borra el navegador o cambias de móvil, sin copia se pierde todo.</p><div class="row"><button type="button" class="gh" onclick="snoozeBackup()">Más tarde</button><button type="button" class="btn" onclick="exportar()">Hacer copia</button></div></section>`;
 return h};

/* ===================== Misión ===================== */
function xpRows(d){const w=d.a.length>1?[.6,.4]:[1],B=XPB[d.ty],r=[];
 if(d.ty==='i'){d.a.forEach((a,i)=>r.push([ATRN[a],'+'+Math.round(B*.4*w[i]),'+'+Math.round(B*.8*w[i])]));r.push(['Frente · '+FRN[d.f],'+'+Math.round(B*.4),'+'+Math.round(B*.8)])}
 else{const f=d.ty==='s'?.8:1;d.a.forEach((a,i)=>r.push([ATRN[a],'—','+'+Math.round(B*f*w[i])]));r.push(['Frente · '+FRN[d.f],'—','+'+Math.round(B*f)])}
 if(d.tm)r.push(['Respuesta · tiempos','—','hasta +'+TXP*d.tm.length]);return r}
V.m=function(){const x=X(),reps=D.repasos.filter(r=>!r.resuelto),dr=dueRows(),uk=unknowns();let h='<h1 class="sr">Misión</h1>';
 if(!viewKey){
 if(dr.length)h+=`<section class="card inv"><h2 class="k">Por revisar · ${dr.length}</h2>${dr.map(([r,i])=>`<div class="rv"><div><b>${esc(r.recurso)}</b><span class="xs db">${expired(r)?'Caducó el '+fmtD(r.caduca)+': repón y edita':(r.revision<today()?'Tocaba revisarlo el ':'Toca revisarlo hoy · ')+fmtD(r.revision)} · ${esc(r.ubicacion||'—')}</span></div><button type="button" class="gh inv sm" onclick="${expired(r)?`edit(${i})`:`revisado(${i})`}">${expired(r)?'Editar':'Revisado hoy'}</button></div>`).join('')}<p class="xs">Mientras esté «Por revisar», sus XP no cuentan y no puedes subir de nivel.</p></section>`;
 h+=reps.map(r=>`<section class="card dash"><div class="k">Repaso · tu perfil cambió</div><h3 class="h3">${esc(r.titulo)}</h3><p class="sm">${esc(r.texto)}</p><div class="row"><button type="button" class="gh" onclick="edit(null,${r.mid})">Actualizar en el Refugio</button><button type="button" class="gh" onclick="ajustado(${r.id})">Ya está ajustado</button></div></section>`).join('');
 if(uk.length)h+=`<details class="card"><summary><span class="k">Por averiguar · ${uk.length}</span><span class="xs mut db">Misiones cortas: +5 XP de Resolución cada una</span></summary><ul class="ul">${uk.map(u=>`<li><div><b>${esc(u.l)}</b><span class="xs mut db">${esc(u.who)}</span></div><button type="button" class="gh sm" onclick="startWz('edit',['${u.sid}'])">Responder</button></li>`).join('')}</ul></details>`;}
 const d=viewKey?defK(viewKey):activeDef();
 if(!d){const S=score();return h+(D.fin?`<section class="card"><div class="k">Sistema completo</div><h2 class="h2">NIVEL 4 SUPERADO</h2><p>Mantén tus revisiones y repite los simulacros para no perder forma.</p></section>`:`<section class="card inv"><div class="k">Examen superado</div><h2 class="h3">Faltan mínimos para subir</h2><p class="sm">Por debajo: ${S.block.map(k=>ATRN[k]).join(', ')}. Repite cronómetros, completa misiones o revisa lo que esté «Por revisar».</p></section>`)}
 const ad=activeDef(),isAct=!!ad&&ad.k===d.k,m=inst(d.k)||(isAct?ensureInst(d.k):null),done=!!(m&&m.hecha),ty=d.ty,n=numOf(d,x),ev=m?linked(m.id):[],evOk=ev.filter(validRow),locked=!m&&!isAct,xr=m?mXP(m,d):null;
 h+=`<article class="mission" aria-labelledby="mt"><div class="mh"><div><div class="k">${done?'Completada':ty==='x'?'Examen del nivel':isAct?'Misión en curso':'Vista previa'} · Nivel ${d.lv}${m&&m.semana?' · '+esc(m.semana):''}</div><div class="big" aria-hidden="true">${ty==='x'?'EX':pad2(n)}</div><h2 class="mt" id="mt"><span class="sr">${ty==='x'?'Examen':'Misión '+n}: </span>${esc(d.t.toUpperCase())}</h2></div>${viewKey?`<button type="button" class="gh sm" onclick="viewKey=null;render()">Volver</button>`:''}</div>
 <div class="card"><div class="k">Por qué</div><p>${esc(d.w(x))}</p><hr><div class="k">Objetivo</div><p>${esc(d.o(x))}</p><hr><div class="row sb top"><div><div class="k">Duración</div><div class="n3">${durTxt(d.min)}</div></div><div class="tr"><div class="k">Fuente</div><div class="sm">${d.src.map(esc).join('<br>')}</div></div></div></div>`+(typeof MIS_FICHA!=='undefined'&&MIS_FICHA[d.k]?`<div class="card"><div class="k">Cómo se hace · funciona sin internet</div><div class="row">${MIS_FICHA[d.k].map(k=>`<button type="button" class="gh sm" onclick="openFicha('${k}')">${esc(fichaDef(k).t)}${skVigente(k)?' ✓':''}</button>`).join('')}</div>${d.ty==='s'?`<p class="xs mut">Esta misión da XP cuando tengas aprobadas (práctica y test) todas sus habilidades: ${esc(MIS_FICHA[d.k].map(k=>fichaDef(k).t+(skVigente(k)?' ✓':'')).join(', '))}.</p>`:''}</div>`:'');
 h+=`<div class="card"><div class="k">XP que otorga</div><table class="tbl xp"><thead><tr><th scope="col">Atributo / frente</th><th scope="col">${ty==='i'?'Tengo':'<span class="sr">Sin valor</span>'}</th><th scope="col">${ty==='i'||ty==='s'?'Aprendido':'Superado'}</th></tr></thead><tbody>${xpRows(d).map(r=>`<tr><th scope="row">${r[0]}</th><td>${r[1]}</td><td><b>${r[2]}</b></td></tr>`).join('')}</tbody></table>${xr&&(done||xr.a.rsp)?`<p class="xs mut">Ahora aporta ${Math.round(Object.values(xr.a).reduce((s,v)=>s+v,0))} XP${xr.frozen?' · <b>'+Math.round(xr.frozen)+' XP por revisar</b>: '+(xr.needSk&&xr.needSk.length?'aprende '+esc(xr.needSk.map(k=>fichaDef(k).t).join(', '))+' en Cómo se hace':'revisa lo apuntado en el Refugio'):''}.</p>`:''}</div>`;
 if(d.tm&&!locked)h+=`<div class="card"><div class="k">Cronómetro · Respuesta</div>${d.tm.map(tt=>{const[k,l,obj]=tt,t=m&&m.tiempos[k],r=run&&run.key===d.k&&run.t===k;return `<div class="tm"><div><b>${esc(l)}</b><span class="xs mut db">Objetivo ${mmss(obj)} · mínimo creíble ${mmss(tmMin(tt))} · ${t&&t.best!=null?'mejor '+mmss(t.best)+' ('+Math.round(tScore(t.best,obj)*100)+' %)':t?'sin tiempo válido':'sin medir'}</span></div><div class="tmr"><span class="clock" id="clk_${k}">${r?mmss(Math.round((Date.now()-run.t0)/1000)):t?mmss(t.last):'0 s'}</span><button type="button" class="${r?'btn':'gh'} sm" onclick="tmToggle('${d.k}','${k}')" aria-label="${r?'Parar':'Iniciar'} cronómetro: ${esc(l)}">${r?'Parar':t?'Repetir':'Iniciar'}</button></div></div>`}).join('')}<p class="xs mut">Mide de verdad: Iniciar al dar la señal, Parar al terminar. Se guarda tu mejor tiempo. Un tiempo por debajo del mínimo creíble no cuenta.</p></div>`;
 if(ty==='i'&&m)h+=`<div class="card"><div class="k">Prueba en el registro</div><p class="sm">${evOk.length?`${evOk.length} fila${evOk.length>1?'s':''} comprobada${evOk.length>1?'s':''}.`:ev.length?'Hay filas, pero sin comprobar o vencidas.':'Necesita una fila vinculada: Tengo con cantidad, ubicación y fecha, o Hecho.'}</p>${ev.map(r=>`<p class="xs mut">· ${esc(r.recurso)} · ${esc(r.estado)}${r.cantNum?' · '+esc(r.cantNum)+' '+esc(r.unidad||''):''}${validRow(r)?'':' · sin validar'}</p>`).join('')}</div>`;
 if(locked)h+=`<p class="box dash">Se abre cuando llegues a ella.${d.lv>D.nivel?' Antes, supera el examen del nivel '+(d.lv-1)+'.':''}</p>`;
 else if(!done){if(ty==='i')h+=`<div class="row"><button type="button" class="gh" onclick="edit(null,${m.id})">+ Prueba al registro</button><button type="button" class="gh ${m.aprendido?'on':''}" aria-pressed="${!!m.aprendido}" onclick="hechoYo(${m.id})">Lo he hecho yo</button></div><button type="button" class="btn wide" onclick="completar(${m.id})">Completar misión</button>`;
  else if(ty==='s')h+=`<button type="button" class="btn wide" onclick="completar(${m.id})">Lo he hecho yo · completar</button>`;
  else h+=`<button type="button" class="btn wide" onclick="completar(${m.id})">${ty==='x'?'Examen superado':'Simulacro superado'}</button>`}
 else{h+=`<p class="box">Completada el ${fmtD(m.fecha)}.${ty==='i'&&!m.aprendido?' Si ya lo has usado tú, márcalo para subir a Aprendido.':''}</p>`;if(ty==='i')h+=`<div class="row">${!m.aprendido?`<button type="button" class="gh" onclick="hechoYo(${m.id})">Lo he hecho yo</button>`:''}<button type="button" class="gh" onclick="edit(null,${m.id})">+ Prueba al registro</button></div>`}
 return h+`</article><p class="center xs mut">Una misión por semana basta. Las semanas sin misión no restan.</p>`};
const XP_HELP='Los puntos (XP) miden lo demostrado: una fila comprobada en el registro, un tiempo medido o una habilidad con práctica y test.';

/* ===================== Niveles ===================== */
V.n=function(){const x=X(),S=score(),ad=activeDef();return '<h1 class="sr">Niveles</h1>'+NIV.map((L,i)=>{const lv=i+1,defs=levelDefs(lv,x),passed=D.pasados.includes(lv)||(D.fin&&lv===4),on=lv===D.nivel&&!passed,dn=defs.filter(d=>isDone(d.k)).length;
 return `<section class="card lvl ${on?'on':''} ${!on&&!passed?'lock':''}" aria-labelledby="lv${lv}"><div class="row sb top"><div><div class="k">Nivel ${pad2(lv)} · ${passed?'Superado':on?'Activo':'Bloqueado'}</div><h2 class="h2" id="lv${lv}">${esc(L.t.toUpperCase())}</h2>${L.adv?'<span class="tag">Avanzado · no oficial</span>':''}</div><div class="n2" aria-label="${dn} de ${defs.length} misiones">${dn}<span class="xs">/${defs.length}</span></div></div>
 <p class="sm">${esc(L.o)}</p><p class="xs mut">Base: ${esc(L.src)}</p><div class="bar" aria-hidden="true"><i style="width:${Math.round(dn/Math.max(1,defs.length)*100)}%"></i></div>
 <p class="xs mut">${defs.length} misiones de 15–60 min (los simulacros, más). A una por semana: unos ${Math.round(defs.length/4.33*10)/10} meses.</p>
 ${on?`<div class="mins"><div class="k">Mínimos para subir</div>${ATR.map(([k,l])=>`<div class="${S.block.includes(k)?'b':''}"><span>${S.block.includes(k)?'▲ ':''}${l}</span><span>${S.AM[k]} / ${S.min[k]}</span></div>`).join('')}<p class="xs mut">Cuentan solo misiones comprobadas y habilidades aprobadas.</p>${reqHtml(lv)}<p class="xs mut">Rangos del nivel: ${RANGOS.map((r,j)=>ROM[j]+' '+r).join(' · ')}.</p></div>`:''}
 <ol class="ml">${defs.map((d,j)=>{const m=inst(d.k),st=m&&m.hecha?(mXP(m,d).frozen?'congelada':'hecha'):ad&&ad.k===d.k?'activa':'';return `<li class="${st}"><button type="button" onclick="viewKey='${d.k}';tab='m';render();window.scrollTo(0,0)"><span class="num">${d.ty==='x'?'EX':pad2(j+1)}</span><span class="tt">${esc(d.t)}</span><span class="st">${st==='hecha'?'✓ hecha':st==='activa'?'▶ activa':st==='congelada'?'en pausa':''}</span></button></li>`}).join('')}</ol></section>`}).join('')+`<p class="xs mut center">Niveles 1 y 2: recomendaciones oficiales. Nivel 3: extensión de esas guías. Nivel 4: avanzado y no oficial.</p>`};

/* ===================== Registro ===================== */
const RF=[['recurso','Recurso','text'],['frente','Frente',FR.map(f=>f[0])],['estado','Estado',ESTADOS_SEL],['cantNum','Cantidad (número)','num'],['unidad','Unidad',UNIDADES],['cantidad','Cantidad (texto libre)','text'],['modelo','Modelo o capacidad','text'],['ubicacion','Ubicación exacta','text'],['ubtipo','Dónde está',UBT],['carga','Estado o carga','text'],['sabe','¿Sabes usarlo?',['Sí','No']],['confirmado','Fecha de confirmación','date'],['caduca','Caducidad (si tiene)','date'],['revision','Siguiente revisión','date']];
V.r=function(){let h=`<h1 class="sr">Registro</h1><button type="button" class="btn wide" onclick="edit()">+ Añadir fila</button>`;
 if(!D.registro.length)return h+`<div class="card center"><h2 class="h3">REGISTRO VACÍO</h2><p class="sm mut">Añade lo que puedas demostrar. Con cantidad numérica y unidad se calcula tu autonomía.</p></div>`;
 return h+FR.map(([fk,fl])=>{const rows=D.registro.map((r,i)=>[r,i]).filter(([r])=>(r.frente||'seg')===fk);if(!rows.length)return '';return `<h2 class="k sec">${fl} · ${rows.length}</h2>`+rows.map(([r,i])=>{const bad=due(r)||expired(r);return `<article class="card ${bad?'inv':''}"><div class="row sb"><h3 class="h3">${esc(r.recurso)}</h3><span class="led">${esc(r.estado||'—')}</span></div>${bad?`<p class="xs"><b>▲ ${expired(r)?'CADUCADO':'REVISIÓN VENCIDA'}</b></p>`:''}
 <dl class="dl sm"><dt>Cantidad</dt><dd>${esc(r.cantNum?r.cantNum+' '+(r.unidad||''):r.cantidad||'—')}</dd><dt>Ubicación</dt><dd>${esc(r.ubicacion||'—')}${r.ubtipo?' · '+esc(r.ubtipo):''}</dd><dt>Revisión</dt><dd>${fmtD(r.revision)}</dd>${r.caduca?`<dt>Caduca</dt><dd>${fmtD(r.caduca)}</dd>`:''}${r.mision?`<dt>Misión</dt><dd>${esc((defK((D.misiones.find(m=>m.id===+r.mision)||{}).key)||{}).t||'—')}</dd>`:''}</dl>
 ${!isMine(r)?`<p class="xs mut">Personal de ${esc(ownerName(r._o))} · solo lectura</p></article>`:`<div class="row"><button type="button" class="gh ${bad?'inv':''} sm" onclick="edit(${i})" aria-label="Editar ${esc(r.recurso)}">Editar</button>${due(r)&&!expired(r)?`<button type="button" class="gh inv sm" onclick="revisado(${i})">Revisado hoy</button>`:''}<button type="button" class="gh ${bad?'inv':''} sm" onclick="del(${i})" aria-label="Borrar ${esc(r.recurso)}">Borrar</button></div></article>`}`}).join('')}).join('')};

/* ===================== Perfil ===================== */
function sumBlock(s,obj){return s.q.filter(q=>qVisible(q,obj)).map(q=>`<dt>${esc(q.l)}</dt><dd class="${obj[q.k]===NS?'nk':''}${!given(obj[q.k])?' un':''}">${given(obj[q.k])?esc(showV(obj[q.k])):'Sin responder'}</dd>`).join('')}
V.f=function(){const H=D.hogar||{},st=isStandalone();
 return `<h1 class="sr">Perfil</h1><h2 class="k sec">Hogar</h2>${HQ.filter(s=>s.only!=='onb').map(s=>`<section class="card"><div class="row sb"><h3 class="h3">${esc(s.t)}</h3><button type="button" class="gh sm" onclick="startWz('edit',['h:${s.id}'])" aria-label="Editar ${esc(s.t)}">Editar</button></div><dl class="dl sm">${sumBlock(s,H)}</dl></section>`).join('')}
 <h2 class="k sec">Personas · ${D.personas.length}</h2>${D.personas.map((p,i)=>`<section class="card"><div class="row sb"><h3 class="h3">${esc(pname(p,i))}</h3>${isMine(p)?`<div class="row"><button type="button" class="gh sm" onclick="editPersona('${p.id}')" aria-label="Editar ficha de ${esc(pname(p,i))}">Editar</button><button type="button" class="gh sm" onclick="quitar('p','${p.id}')" aria-label="Quitar a ${esc(pname(p,i))}">Quitar</button></div>`:`<span class="led">Solo lectura</span>`}</div>${D.yo===p.id?'<p class="xs mut">Eres tú en este móvil.</p>':''}${!isMine(p)?`<p class="xs mut">La edita ${esc(ownerName(p._o))} en su móvil.</p>`:''}<dl class="dl sm">${PQ.filter(s=>!s.c||s.c(p)).map(s=>sumBlock(s,p)).join('')}</dl>${hasO(p.habil,'Primeros auxilios')?`<p class="xs mut">«Sabe primeros auxilios» es informativo y no da XP.</p><button type="button" class="gh sm" onclick="go('g');gs('como')">Ver fichas de Cómo se hace</button>`:''}${['0–2','3–12'].includes(p.edad)?'<p class="xs mut">Apunta en el botiquín la dosis por peso que indique su pediatra. Plan B nunca la calcula.</p>':''}</section>`).join('')}<button type="button" class="gh wide" onclick="addPersona()">+ Añadir persona</button>
 ${vehProfile()}<h2 class="k sec">Animales · ${D.mascotas.length}</h2>${D.mascotas.map((m,i)=>`<section class="card"><div class="row sb"><h3 class="h3">${esc(mname(m,i))}</h3><div class="row"><button type="button" class="gh sm" onclick="startWz('edit',['m:${m.id}:m1'])" aria-label="Editar ${esc(mname(m,i))}">Editar</button><button type="button" class="gh sm" onclick="quitar('m','${m.id}')" aria-label="Quitar ${esc(mname(m,i))}">Quitar</button></div></div><dl class="dl sm">${sumBlock(MQ[0],m)}</dl></section>`).join('')}<button type="button" class="gh wide" onclick="addMascota()">+ Añadir animal</button>
 <h2 class="k sec">Tus datos</h2><button type="button" class="card tl wide" onclick="sub='datos';render();window.scrollTo(0,0)"><span class="k">Privacidad</span><b>Dónde están tus datos y qué se comparte</b><span class="xs mut">Todo se guarda solo en este móvil. Sin cuentas ni servidores. Versión ${APPV}.</span></button>
 <h2 class="k sec">Ajustes</h2>${drillSettings()}<section class="card"><div class="row sb"><div><b>Letra grande</b><p class="xs mut">Para leer con la pantalla al mínimo.</p></div><button type="button" class="sw ${D.cfg.big?'on':''}" role="switch" aria-checked="${!!D.cfg.big}" aria-label="Letra grande" onclick="toggleBig()"><i></i></button></div><hr><p class="xs mut">Ahorro de batería: fondo negro, sin vibración y sin animaciones, salvo el borde del botón «Tengo un problema», que cambia despacio de color. Con «Reducir movimiento» del sistema queda fijo en rojo.</p></section>
 <h2 class="k sec">Copia de seguridad</h2><section class="card"><p class="sm">Guarda todo en un archivo de copia. Sin nube: tú eliges dónde (Archivos, correo, ordenador).</p><p class="xs mut">Última copia: ${D.cfg.lastBackup?fmtD(D.cfg.lastBackup):'nunca'}.</p><div class="row"><button type="button" class="btn" onclick="exportar()">Exportar</button><button type="button" class="gh" onclick="$('#imp').click()">Importar</button></div><input type="file" id="imp" accept="application/json,.json" hidden onchange="importar(this)"></section>
 <h2 class="k sec">Sistema</h2><section class="card"><p class="sm"><b>PLAN B.</b> Sin IA. Sin nube. Sin cuentas. Tus datos no salen de este dispositivo.</p><p class="xs mut">${st?'Abierta como app instalada.':'Abierta en una pestaña del navegador: lo que guardes aquí no pasa a la app instalada.'} · Versión ${APPV}</p><button type="button" class="gh sm" onclick="wipe()">Borrar todos mis datos</button></section>`};

/* ===================== Acciones ===================== */
const PSCR=['p1','pc','p2','p3','p3n'];
function editPersona(id){startWz('edit',PSCR.map(s=>'p:'+id+':'+s))}
function addPersona(){const p={id:uid()};D.personas.push(p);D.hogar.nper=D.personas.length;save();startWz('edit',PSCR.map(s=>'p:'+p.id+':'+s))}
function addVehiculo(){const v={id:uid()};D.vehiculos=D.vehiculos||[];D.vehiculos.push(v);D.hogar.nveh=D.vehiculos.length;save();startWz('edit',['v:'+v.id+':v1'])}
function addMascota(){const m={id:uid()};D.mascotas.push(m);D.hogar.animales='Sí';D.hogar.nmasc=D.mascotas.length;save();startWz('edit',['m:'+m.id+':m1'])}
async function quitar(t,id){const arr=t==='p'?D.personas:t==='v'?D.vehiculos:D.mascotas,i=arr.findIndex(q=>q.id===id),nm=t==='p'?pname(arr[i],i):t==='v'?vname(arr[i],i):mname(arr[i],i);
 if(!await ask(`<h2>¿Quitar a ${esc(nm)}?</h2><p>Se borra su ficha y se recalculan misiones y cantidades.</p>`,'Quitar','Cancelar'))return;
 tombstone(t==='p'?'personas':t==='v'?'vehiculos':'mascotas',arr[i]);arr.splice(i,1);if(t==='p')D.hogar.nper=D.personas.length||undefined;else if(t==='v')D.hogar.nveh=D.vehiculos.length;else{D.hogar.nmasc=D.mascotas.length||undefined;if(!D.mascotas.length)D.hogar.animales='No'}makeRepasos();save();render()}
function toggleBig(){D.cfg.big=!D.cfg.big;save();applyCfg();render()}
function applyCfg(){document.documentElement.classList.toggle('big',!!(D&&D.cfg&&D.cfg.big))}
function revisado(i){const r=D.registro[i];touch(r);r.confirmado=today();r.revision=revDefault({...r,revision:''});save();render();note('Revisión anotada. Sus XP vuelven a contar.')}
function tmToggle(k,t){if(run&&run.key===k&&run.t===t){const s=Math.max(1,Math.round((Date.now()-run.t0)/1000)),m=ensureInst(k),p=m.tiempos[t],tt=(defK(k).tm||[]).find(q=>q[0]===t)||[t,'',60],ok=s>=tmMin(tt);
  const best=p&&p.best!=null?(ok?Math.min(p.best,s):p.best):(ok?s:null);m.tiempos[t]={best,last:s,fecha:today()};if(!ok)m.tiempos[t].corto=(p&&p.corto||0)+1;run=null;clearInterval(runTick);save();render();note(ok?'Tiempo: '+mmss(s):`${mmss(s)}: demasiado rápido para contar (mínimo ${mmss(tmMin(tt))}). Repítelo de verdad.`);return}
 if(run){note('Ya hay un cronómetro en marcha.');return}run={key:k,t,t0:Date.now()};clearInterval(runTick);runTick=setInterval(()=>{const e=document.getElementById('clk_'+t);if(e&&run)e.textContent=mmss(Math.round((Date.now()-run.t0)/1000))},1000);render()}
async function hechoYo(id){const m=D.misiones.find(q=>q.id===id);if(m.aprendido){m.aprendido=false;save();render();return}
 const fk=misFichas(m.key).filter(k=>!skVigente(k));if(await ask('<h2>¿Lo has hecho tú?</h2><p>Solo cuenta si lo has usado o hecho tú mismo, no si te lo han explicado. Sube la misión a <b>Aprendido</b>.</p>'+(fk.length?`<p>Para que cuente del todo, aprende también: <b>${esc(fk.map(k=>fichaDef(k).t).join(', '))}</b> (Guía · Cómo se hace).</p>`:''))){m.aprendido=true;save();render()}}
async function completar(id){const m=D.misiones.find(q=>q.id===id),d=defK(m.key),x=X();
 if(d.ty==='i'&&!linked(id).some(validRow)){if(await ask(`<h2>Falta la prueba</h2><p>Solo cuenta lo demostrado. Para cerrar «${esc(d.t)}» necesitas una fila del registro vinculada en estado <b>Tengo</b> (con cantidad, ubicación y fecha) o <b>Hecho</b>, sin nada «Por revisar».</p><p>¿La añades ahora?</p>`,'Añadir','Ahora no'))edit(null,id);return}
 if(d.tm&&(d.ty==='x'||d.ty==='d')){const miss=d.tm.filter(([k])=>!m.tiempos[k]||m.tiempos[k].best==null);if(miss.length){await ask(`<h2>Faltan tiempos</h2><p>Un simulacro se demuestra con tiempos reales. Mide: ${miss.map(t=>esc(t[1])).join(', ')}.</p>`,'Entendido',null);return}}
 const fk=misFichas(d.k).filter(k=>!skVigente(k));if((d.ty==='s'||d.ty==='i')&&fk.length&&d.ty==='s'){await ask(`<h2>Antes, aprende la habilidad</h2><p>Esta misión se demuestra con la práctica y el test de: <b>${esc(fk.map(k=>fichaDef(k).t).join(', '))}</b>.</p><p>Está en Guía · Cómo se hace. Hasta entonces no da puntos.</p>`,'Entendido',null);return}
 if(d.ty==='s'){if(!await ask(`<h2>¿Lo has hecho tú?</h2><p>Es una misión de saber hacer: solo cuenta si lo has hecho tú. Se registra como <b>Aprendido</b>, con revisión en 12 meses.</p>`))return;
  D.registro.push(touch({id:uid(),recurso:d.t,frente:d.f,estado:'Aprendido',ubtipo:'Casa',sabe:'Sí',confirmado:today(),revision:plusM(today(),12),mision:id,misionKey:m.key,_o:D.dev}))}
 else if(!await ask(d.ty==='i'?'<h2>¿Misión completada?</h2><p>Tiene prueba en el registro. Ciérrala solo si lo has comprobado.</p>':'<h2>¿Simulacro superado?</h2><p>Ciérralo si lo habéis hecho de verdad y has anotado qué mejorar.</p>'))return;
 m.hecha=true;m.fecha=today();m.sig=objOf(d,x);viewKey=null;const up=checkLevel();save();render();window.scrollTo(0,0);note(up?(D.fin?'Nivel 4 superado.':'Nivel superado. Empieza el nivel '+D.nivel+'.'):'Misión completada.')}
function edit(i,mid){const m=mid!=null?D.misiones.find(q=>q.id===mid):null,d=m&&defK(m.key);const r=i==null?{frente:d?d.f:'',confirmado:today(),mision:mid??''}:D.registro[i];
 const opts=D.misiones.filter(q=>defK(q.key)).map(q=>`<option value="${q.id}" ${+r.mision===q.id?'selected':''}>N${q.lvl} · ${esc(defK(q.key).t)}</option>`).join('');
 const fld=([k,l,o])=>{const id='f_'+k,v=r[k]??'';if(Array.isArray(o))return `<label for="${id}">${l}</label><select id="${id}"><option value="">— Elige —</option>${o.map(x=>`<option value="${esc(x)}" ${v===x?'selected':''}>${esc(k==='frente'?FRN[x]:x)}</option>`).join('')}</select>`;return `<label for="${id}">${l}</label><input id="${id}" type="${o==='date'?'date':o==='num'?'number':'text'}" ${o==='num'?'inputmode="decimal" step="any" min="0"':''} value="${esc(v)}">`};
 $('#nav').hidden=true;document.body.classList.add('nonav');
 $('#v').innerHTML=`<section class="form" aria-labelledby="ft"><div class="k">Registro</div><h1 class="h2" id="ft">${i==null?'NUEVA FILA':'EDITAR FILA'}</h1><label for="f_mision">Misión vinculada</label><select id="f_mision"><option value="">— Ninguna —</option>${opts}</select>${RF.map(fld).join('')}
 <p class="xs mut">Tengo exige cantidad, ubicación exacta y fecha de confirmación. Pon cantidad numérica y unidad (L, raciones, Wh…) para calcular la autonomía. Si dejas la revisión vacía se calcula sola: 6 meses (agua, comida, pilas), 12 meses documentos y lo aprendido, la medicación por su caducidad.</p>
 <div class="row end"><button type="button" class="gh" onclick="render()">Cancelar</button><button type="button" class="btn" onclick="sv(${i??'null'})">Guardar</button></div></section>`;window.scrollTo(0,0);$('#f_recurso').focus()}
async function sv(i){const r={};RF.forEach(([k])=>r[k]=$('#f_'+k).value.trim());r.mision=$('#f_mision').value?+$('#f_mision').value:'';
 if(!r.recurso)return note('Falta el recurso.');if(!r.frente)return note('Elige el frente.');if(!r.estado)return note('Elige el estado.');
 if(r.estado==='Tengo'&&(!(r.cantidad||r.cantNum)||!r.ubicacion||!r.confirmado))return note('Para «Tengo» hacen falta cantidad, ubicación exacta y fecha de confirmación.');
 if(r.cantNum&&!r.unidad)return note('Elige la unidad de la cantidad.');
 if(!r.revision)r.revision=revDefault(r);
 const old=i==null?null:D.registro[i];if(old)Object.keys(old).forEach(k=>{if(!(k in r))r[k]=old[k]});
 if(!r.id)r.id=uid();r.misionKey=r.mision?keyOfMid(+r.mision)||'':'';if(r.estado==='Aprendido')r._o=r._o||D.dev;else if(r._o===D.dev)delete r._o;touch(r);
 if(i==null)D.registro.push(r);else D.registro[i]=r;
 if(r.mision)D.repasos.forEach(x=>{if(!x.resuelto&&x.mid===r.mision){x.resuelto=today();const m=D.misiones.find(q=>q.id===x.mid),d=m&&defK(m.key);if(d)m.sig=objOf(d)}});
 save();render();note('Guardado.')}
async function del(i){if(await ask(`<h2>¿Borrar «${esc(D.registro[i].recurso)}»?</h2><p>Si era la prueba de una misión, sus XP dejan de contar.</p>`,'Borrar','Cancelar')){tombstone('registro',D.registro[i]);D.registro.splice(i,1);save();render()}}
async function wipe(){if(!await ask('<h2>¿Borrar todos tus datos?</h2><p><b>No se puede deshacer.</b> Se borran de este móvil tu perfil, las fichas, misiones, registro, Unidad, amigos y simulacros. No afecta a lo que ya hayas compartido con otros.</p><p>Exporta antes una copia si la quieres.</p><label for="wipeIn" class="k">Escribe BORRAR para confirmar</label><input id="wipeIn" autocomplete="off" autocapitalize="characters">','Borrar todo','Cancelar'))return;if(($('#wipeIn').value||'').trim().toUpperCase()!=='BORRAR'){note('No se ha borrado nada: escribe BORRAR para confirmar.');return}{sub=null;LS.removeItem(KEY);LS.removeItem('ohara');D=null;wz=null;startMode=null;render()}}

/* ===================== Copia de seguridad ===================== */
function backupDue(){if(!D.misiones.some(m=>m.hecha)&&D.registro.length<3)return false;const sn=D.cfg.backupSnooze;if(sn&&sn>today())return false;const last=D.cfg.lastBackup;return !last||last<=ymd(new Date(Date.now()-30*864e5))}
function snoozeBackup(){const x=new Date();x.setDate(x.getDate()+7);D.cfg.backupSnooze=ymd(x);save();render()}
async function exportar(){const name='planb-copia-'+today()+'.json',json=JSON.stringify({app:'planb',ver:D.ver||8,av:APPV,fecha:new Date().toISOString(),data:D},null,2),blob=new Blob([json],{type:'application/json'});let shared=false;
 try{const f=new File([blob],name,{type:'application/json'});if(navigator.canShare&&navigator.canShare({files:[f]})&&/iPhone|iPad|Android/.test(navigator.userAgent)){await navigator.share({files:[f]});shared=true}}catch(e){if(e&&e.name==='AbortError')return}
 if(!shared){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500)}
 D.cfg.lastBackup=today();delete D.cfg.backupSnooze;save();render();note('Copia creada: '+name)}
function importar(el){const f=el.files[0];el.value='';if(!f)return;f.text().then(async t=>{let x;try{x=JSON.parse(t)}catch(e){return note('Archivo no válido.')}const data=x&&x.app==='planb'&&x.data?x.data:x;
 if(!data||typeof data!=='object'||!(Array.isArray(data.registro)||data.hogar||data.perfil))return note('Ese archivo no es una copia de Plan B.');
 if(!await ask(`<h2>¿Sustituir todos los datos?</h2><p>Se reemplaza lo de este dispositivo por la copia${x.fecha?' del '+esc(fmtD(String(x.fecha).slice(0,10))):''}.</p>`,'Sustituir','Cancelar'))return;
 D=data;migrate();save();applyCfg();wz=null;askedFill=false;boot();note('Copia restaurada.')})}

/* ===================== Modo emergencia ===================== */
function where(keys,re){if(!D||!D.registro)return[];const ids=new Set(D.misiones.filter(m=>keys.includes(m.key)).map(m=>m.id));const ks=new Set(keys);return D.registro.filter(r=>r.estado!=='Deseo'&&r.ubicacion&&(ids.has(+r.mision)||ks.has(r.misionKey)||(re&&re.test(r.recurso||'')))).map(r=>`${r.recurso}: ${r.ubicacion}`)}
/* v5: EMG/openEmg/renderEmg se sustituyen por los árboles «Tengo un problema» (app5.js). */

/* ===================== Instalación ===================== */
const isStandalone=()=>!!(navigator.standalone||matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: minimal-ui)').matches);
function platform(){const ua=navigator.userAgent||'',ios=/iPhone|iPad|iPod/.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1),and=/Android/.test(ua);
 if(ios)return /CriOS|FxiOS|EdgiOS|OPiOS|GSA\//.test(ua)?'ios-other':'ios-safari';
 if(and)return /SamsungBrowser/.test(ua)?'and-samsung':/Firefox/.test(ua)?'and-firefox':/Chrome/.test(ua)&&!/OPR|EdgA|; wv\)/.test(ua)?'and-chrome':'and-other';return 'other'}
function renderGate(){const pf=platform();let steps;
 if(pf==='ios-safari')steps=['Pulsa <b>Compartir</b>: el cuadrado con la flecha hacia arriba.','Elige <b>Añadir a pantalla de inicio</b>. Si no aparece, desliza la lista hacia abajo.','Pulsa <b>Añadir</b> y abre Plan B desde el <b>icono</b> nuevo.'];
 else if(pf==='ios-other')steps=['Este navegador no puede instalar apps en este móvil.','Copia la dirección y ábrela en el <b>navegador que viene con el móvil</b>.','Allí: <b>Compartir</b> → <b>Añadir a pantalla de inicio</b> → abre desde el icono.'];
 else if(pf==='and-chrome')steps=deferredPrompt?['Pulsa <b>Instalar</b> aquí abajo.','Abre Plan B desde el <b>icono</b> nuevo.']:['Abre el menú <b>⋮</b>, arriba a la derecha.','Elige <b>Instalar app</b> o <b>Añadir a pantalla de inicio</b>.','Abre Plan B desde el <b>icono</b> nuevo.'];
 else if(pf==='and-samsung')steps=['Abre el menú <b>≡</b>, abajo.','Elige <b>Añadir página a</b> → <b>Pantalla de inicio</b>.','Abre Plan B desde el <b>icono</b>.'];
 else if(pf==='and-firefox')steps=['Abre el menú <b>⋮</b>.','Elige <b>Instalar</b> o <b>Añadir a pantalla de inicio</b>.','Abre Plan B desde el <b>icono</b>.'];
 else if(pf==='and-other')steps=['Puede que este navegador no permita instalar apps.','Abre esta dirección en el <b>navegador principal</b> del móvil.','Menú <b>⋮</b> → <b>Instalar app</b>, y abre desde el icono.'];
 else steps=['Plan B está pensada para móvil.','Abre esta dirección en el navegador de tu móvil.','Instálala en la pantalla de inicio y ábrela desde el icono.'];
 return `${bigHelp()}<section class="gate" aria-labelledby="gt"><div class="k">Antes de empezar</div><h1 class="h2" id="gt">INSTALA PLAN B</h1><p class="lead">Estás en una pestaña del navegador. Instálala en la pantalla de inicio para que funcione sin conexión y guarde tus datos en la app.</p>
 <ol class="steps lg">${steps.map(s=>`<li>${s}</li>`).join('')}</ol>${pf==='and-chrome'&&deferredPrompt?'<button type="button" class="btn wide" onclick="installNow()">Instalar</button>':''}
 <div class="card inv"><div class="k">▲ Importante</div><p class="sm">Lo que guardes en esta pestaña <b>no pasa</b> a la app instalada: cada una guarda sus datos por separado.</p></div>
 <p class="center"><button type="button" class="link" onclick="sessionStorage.setItem('planbGate','1');boot()">Continuar en el navegador (solo para pruebas)</button></p></section>`}
async function installNow(){if(!deferredPrompt)return;deferredPrompt.prompt();try{await deferredPrompt.userChoice}catch(e){}deferredPrompt=null;render()}
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(gateOn())render()});
addEventListener('appinstalled',()=>{deferredPrompt=null});
const gateOn=()=>!isStandalone()&&!sessionStorage.getItem('planbGate');

/* ===================== Render ===================== */
function header(){$('#sub').textContent=D&&D.hogar&&!wz?(D.fin?'Nivel 4 · completo':`Nivel ${D.nivel} · ${['72 h','2 sem.','1 mes','3+ meses'][D.nivel-1]}`):''}
function render(){header();const v=$('#v'),nav=$('#nav');
 if(gateOn()){v.innerHTML=renderGate();nav.hidden=true;document.body.classList.add('nonav');return}
 if(!wz&&(!D||!D.hogar)&&typeof renderStart==='function'){v.innerHTML=renderStart();nav.hidden=true;document.body.classList.add('nonav');return}
 if(wz||!D||!D.hogar){if(!wz){startWz('onb');return}v.innerHTML=renderWz();nav.hidden=true;document.body.classList.add('nonav');return}
 nav.hidden=false;document.body.classList.remove('nonav');
 const ad=activeDef();if(ad)ensureInst(ad.k);
 v.innerHTML=V[tab]();nav.innerHTML=NAV.map(([k,l])=>`<button type="button" class="${k===tab?'on':''}" ${k===tab?'aria-current="page"':''} onclick="go('${k}')">${svgI(k)}<span>${l}</span></button>`).join('')}
function go(k){tab=k;viewKey=null;sub=null;try{history.replaceState(null,'','#'+({p:'panel',m:'mision',n:'niveles',g:'guia',r:'registro',e:'equipo',f:'perfil'})[k])}catch(e){}window.scrollTo(0,0);render();const h=$('#v h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true})}}
function boot(){migrate();if(D&&D.hogar){save();applyCfg();if(!askedFill&&!gateOn()&&unanswered()){askedFill=true;startWz('fill');return}}render()}
if('serviceWorker'in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
/* boot() se llama al final de app5.js */
