/* Plan B 8.0.0 · Contenido de la fase 2: fuentes al día, «Para tu nivel» por sección, «Ha pasado algo», cuestionario nuevo,
   modo zombi y aviso legal. Cada cifra oficial lleva su fuente; lo que es decisión propia va marcado «recomendación de Plan B». */
'use strict';
const REV8='2026-11-23'; /* última revisión de contenidos */
/* ---------- Fuentes (verificadas el 23 nov 2026) ---------- */
Object.assign(SRC7,{
 ue:['Comisión Europea · SWD(2026) 826, autosuficiencia de 72 horas (PDF)','https://ec.europa.eu/echo/files/policies/preparedness/guidelines_preparedness_selfsufficiency.pdf'],
 msb:['Agencia sueca de defensa civil (MCF, antes MSB)','https://www.mcf.se/sv/rad-till-privatpersoner/broschyren-om-krisen-eller-kriget-kommer/'],
 who:['OMS · Cuánta agua hace falta en emergencias (nota técnica 9)','https://www.who.int/docs/default-source/wash-documents/wash-in-emergencies/technical-notes-on-wash-in-emergencies/who-tn-09-how-much-water-is-needed.pdf'],
 femaW:['Ready.gov (FEMA) · Agua','https://www.ready.gov/water'],
 sit:['Servicio de Información Toxicológica (Ministerio de Justicia)','https://www.mjusticia.gob.es/es/institucional/organismos/instituto-nacional/servicios/servicio-informacion/servicio-informacion1'],
 cp:['BOE · Orden de 23 de enero de 1984 (código postal)','https://www.boe.es/diario_boe/txt.php?id=BOE-A-1984-3487'],
 efsaS:['EFSA · Tablas resumen de valores de referencia (2017)','https://www.efsa.europa.eu/sites/default/files/assets/DRV_Summary_tables_jan_17.pdf'],
 legal:['thedotapps · formulario de contacto','https://thedotapps.com/#ContactForm1']});
NIV7[3].src='Objetivo de Plan B. La medicación crónica para un mes sí tiene base oficial: la recomendación sueca (MCF, antes MSB).';
NIV7[1].src='Comisión Europea (SWD(2026) 826, al menos 72 horas) y Protección Civil.';
const TEL_SIT='91 562 04 20';
/* Nombres cortos para la cabecera */
const NIVS8=['24 h','72 h','2 sem','1 mes'];
/* ---------- Niveles en modo zombi ---------- */
const ZNIV8=['Primera noche','Aguantar el asedio','Refugio seguro','Colonia','Renacer'];
const ZNIVS8=['1.ª noche','Asedio','Refugio','Colonia','Renacer'];
const ZMIS8=[
 [1,'z1','Luz que no se ve desde fuera','Esta noche, con la luz de emergencia encendida, sal a la calle y mira si se ve desde fuera. Tapa lo que se vea.'],
 [1,'z2','Ruido cero','Pasad 15 minutos en casa sin hacer ruido: móviles en silencio y sin vibración, sin aparatos. Apuntad qué hacía ruido.'],
 [2,'z3','Puertas y ventanas','Revisa que todas las puertas y ventanas cierran bien y sabes cómo atrancarlas por dentro.'],
 [2,'z4','La señal','Acordad una señal en silencio (un golpe, una luz, una palabra) para «todo bien» y otra para «peligro».'],
 [3,'z5','Turnos de guardia','Haced una noche de turnos: quién vigila, cuánto tiempo y cómo despierta al siguiente sin ruido.'],
 [3,'z6','Salida de emergencia','Busca una segunda salida de casa y recórrela a oscuras con la linterna en rojo.'],
 [4,'z7','La colonia','Reúne a dos vecinos de confianza y repartid quién tiene qué: agua, botiquín, radio, herramientas.'],
 [4,'z8','Mapa sin móvil','Dibuja en papel un mapa del barrio con el punto de encuentro, las fuentes de agua y la farmacia.'],
 [5,'z9','Renacer','Una semana viviendo de lo propio, como el nivel Autosuficiente, contada como diario de supervivencia.']];
/* ---------- Botiquín: lista de Cruz Roja (4 feb 2025) + vendas hemostáticas explicadas ---------- */
const BOT_CR8=['Guantes de látex o vinilo','Toallitas de alcohol (para las manos)','Suero fisiológico','Antiséptico','Gasas','Esparadrapo','Tiritas','Tijeras de punta redondeada','Pinzas sin dientes','Pañuelo triangular','Vendas de diferentes tamaños'];
BOT_C7.splice(0,BOT_C7.length,...BOT_CR8,'Vendas hemostáticas');
F7.botiquin.kinds['Elemento'][0][2]=BOT_C7;
/* ---------- Seguridad y fondo de intercambio ---------- */
const SEG8=['Mascarilla de protección facial','Silbato','Llave inglesa o alicates','Abrelatas manual','Plástico y cinta adhesiva','Detector de humo','Extintor','Manta térmica','Mantas o sacos de dormir','Herramientas para reparar','Otro'];
const FONDO8=['Pilas','Café','Azúcar','Sal','Aceite','Mecheros','Pastillas o filtros para potabilizar','Bolsas de basura','Jabón','Analgésicos sin receta','Semillas','Otro'];
F7.otros.kinds={'Seguridad':[['articulo','Qué es',SEG8,'seguridad'],['cantNum','Cantidad','num',null,1],['caduca','Caducidad','date',null,1]],'Otro':[['cantNum','Cantidad','num',null,1]]};
F7.dinero.kinds['Fondo de intercambio']=[['articulo','Qué es',FONDO8,'fondo'],['cantNum','Cantidad','num',null,1],['caduca','Caducidad','date',null,1]];
/* ---------- Energía: casilla «Encendido», pilas y generador ---------- */
F7.energia.kinds['Aparato'].push(['enc','Encendido todo el día','chk','encendido',1]);
F7.energia.kinds['Pilas']=[['n','Número de pilas','num'],['tipoPila','Tamaño',['AA','AAA','C','D','9 V','Otra']],['clase','Tipo',['De usar y tirar','Recargables'],'pilasClase'],
 ['caduca','Caducidad','date',null,1,['clase','De usar y tirar']],['cargador','¿Tienes cargador?',['Sí','No'],null,1,['clase','Recargables']],['comoCarga','Cómo se carga el cargador',['USB','Enchufe de 230 V','Toma de mechero de 12 V','Solar','No lo sé'],null,1,['clase','Recargables']]];
F7.energia.kinds['Generador']=[['w','Potencia (W)','num','w',1],['combustible','Litros de combustible guardados','num',null,1]];
F7.com.kinds['Equipo'].push(['w','Potencia (W) si va enchufado','num','w',1],['enc','Encendido todo el día','chk','encendido',1]);
/* ---------- Agua: forma de lavarse si se corta el agua ---------- */
const HIGF8={'Toallitas y gel sin agua':null,'Palangana':7.5,'Ducha corta':15};
const PRES8=['Nada','Menos de 20 €','De 20 a 50 €','De 50 a 100 €','Más de 100 €'];
const PRES_MAP8={'Nada':'Nada','Poco':'Menos de 20 €','Moderado':'De 20 a 50 €','Amplio':'De 50 a 100 €'};
/* ---------- Cuestionario: preguntas nuevas, sin borrar las respuestas antiguas ---------- */
(function(){
 const p2=PQ.find(s=>s.id==='p2');if(p2){const old=['ocup','dist','horario','transp','fuera'];p2.q=p2.q.filter(q=>!old.includes(q.k));
  p2.q.push({k:'diaDonde',l:'Un día de trabajo o de clase, ¿dónde está?',ty:'one',o:['Fuera de casa','En casa','A veces fuera y a veces en casa','No trabaja ni estudia'],c:p=>!bebe(p),f:'evac'},
   {k:'vuelta',l:'Si se cortan las carreteras o el transporte, ¿cuánto tardaría en volver a pie?',ty:'one',o:['Menos de 30 min','De 30 min a 2 h','Más de 2 h','No podría volver a pie'],c:p=>['Fuera de casa','A veces fuera y a veces en casa'].includes(p.diaDonde),f:'evac'},
   {k:'noches',l:'¿Pasa noches fuera de casa? (turnos de noche, guardias, viajes)',ty:'one',o:['No','Algunas noches','Muchas noches'],c:p=>!bebe(p),f:'evac'});
  const it=p2.q.find(q=>q.k==='intol');if(it){it.l='¿Algo más que no come? (lo que no esté en la dieta ni en las restricciones)';it.opt=true}
  /* Restricciones justo después de la dieta: se pregunta una vez */
  const ri=p2.q.findIndex(q=>q.k==='restr'),di=p2.q.findIndex(q=>q.k==='dieta');if(ri>-1&&di>-1&&ri!==di+1){const [r]=p2.q.splice(ri,1);p2.q.splice(di+1,0,r)}}
 const p1=PQ.find(s=>s.id==='p1');if(p1){p1.q=p1.q.filter(q=>q.k!=='duerme');const al=p1.q.find(q=>q.k==='alergias');if(al)al.l='Alergias (a medicamentos, alimentos, picaduras…)'}
 const zona=HQ.find(s=>s.id==='zona');if(zona&&!zona.q.some(q=>q.k==='cp'))zona.q.splice(1,0,{k:'cp',l:'Código postal',ty:'text',ph:'Ej.: 28001',nada:'Prefiero no decirlo',opt:true,hint:'Opcional. Solo se usa en este móvil para saber tu provincia (sol, islas y clima). No sale de aquí.',f:'evac'});
 const cerca=HQ.find(s=>s.id==='cerca');if(cerca){const c=cerca.q.find(q=>q.k==='carretera');if(c){c.l='¿Se llega a tu casa en coche por una sola carretera?';c.hint='Importa si esa carretera se corta (desprendimiento, riada o incendio): tardarían más el reparto, la ambulancia y los bomberos. Si tienes tiendas, farmacia y centro de salud cerca, el riesgo es bajo.'}}
 const serv=HQ.find(s=>s.id==='serv');if(serv&&!serv.q.some(q=>q.k==='higieneForma'))serv.q.push({k:'higieneForma',l:'Si se corta el agua, ¿cómo os lavaríais?',ty:'one',o:Object.keys(HIGF8),hint:'Cambia el agua que Plan B calcula: sin agua, 4 L por persona y día (6 con calor); palangana, 7,5 L; ducha corta, 15 L (mínimos de la OMS).',f:'agua'});
 const pref=HQ.find(s=>s.id==='pref');if(pref){const pr=pref.q.find(q=>q.k==='presupuesto');if(pr){pr.l='Presupuesto al mes para esto';pr.o=PRES8}}
})();
/* ---------- Código postal → provincia (las dos primeras cifras, BOE 1984 y 1995) ---------- */
const CP8=['Álava','Albacete','Alicante','Almería','Ávila','Badajoz','Illes Balears','Barcelona','Burgos','Cáceres','Cádiz','Castellón','Ciudad Real','Córdoba','A Coruña','Cuenca','Girona','Granada','Guadalajara','Gipuzkoa','Huelva','Huesca','Jaén','León','Lleida','La Rioja','Lugo','Madrid','Málaga','Murcia','Navarra','Ourense','Asturias','Palencia','Las Palmas','Pontevedra','Salamanca','Santa Cruz de Tenerife','Cantabria','Segovia','Sevilla','Soria','Tarragona','Teruel','Toledo','Valencia','Valladolid','Bizkaia','Zamora','Zaragoza','Ceuta','Melilla'];
const provOfCP=cp=>{const m=/^\s*(\d{2})\d{3}\s*$/.exec(String(cp||''));if(!m)return null;const n=+m[1];return n>=1&&n<=52?CP8[n-1]:null};
const ISLAS8=['Illes Balears','Las Palmas','Santa Cruz de Tenerife'];
/* ---------- Explicaciones nuevas o corregidas ---------- */
Object.assign(GL7,{
 perdidas:['Pérdidas','Al cargar y convertir energía se pierde una parte. Plan B descuenta un 15 % al cargar ('+PB+').'],
 consumoBasico:['Consumo básico','Lo que gasta tu casa al día sin red: 12 Wh por móvil, 5 Wh de luz por persona, lo que marques «Encendido» (vatios × 24 h), los aparatos médicos, la nevera de medicinas y la cocina eléctrica si la apuntas ('+PB+').'],
 encendido:['Encendido todo el día','Márcalo si el aparato tiene que estar siempre funcionando (nevera de medicinas, aparato médico, router…). Plan B suma sus vatios × 24 horas al consumo diario. Los aparatos médicos y la nevera de medicinas vienen marcados.'],
 pilasClase:['Pilas','De usar y tirar: aguantan años guardadas; apunta la caducidad. Recargables: hace falta el cargador y una forma de cargarlo sin red; Plan B te recuerda cargarlas cada 3 meses ('+PB+').'],
 gastoDia:['Gasto diario (opcional)','Si quieres, pon lo que gasta tu casa al día por persona en lo básico y Plan B te dice para cuántos días llega tu efectivo. No es obligatorio.'],
 efectivo:['Efectivo','Para comprar lo básico si fallan las tarjetas o los cajeros (Comisión Europea: billetes pequeños y monedas). Desde 2 semanas, también para recibos o un transporte. En 1 mes no se pide más dinero: si no hay nada que comprar, el dinero no sirve.',[SRC7.ue[0],SRC7.ue[1]]],
 fondo:['Fondo de intercambio','Cosas baratas que ya usas, que no caducan pronto y que escasean en un corte largo: pilas, café, azúcar, sal, aceite, mecheros, pastillas o filtros para potabilizar, bolsas de basura, jabón, analgésicos sin receta y semillas. Se van rotando. Lo que más vale es lo que sabes hacer: primeros auxilios, arreglar cosas o tener noticias por radio. Ningún organismo oficial habla de trueque: es una '+PB+'.'],
 seguridad:['Seguridad y otros','Lo que ayuda a protegerse y a apañarse en casa: mascarilla y silbato para pedir ayuda, llave o alicates para cerrar suministros, abrelatas manual, plástico y cinta para confinarse (Ready.gov, FEMA).',[SRC7.fema[0],SRC7.fema[1]]],
 'Mascarilla de protección facial':['Mascarilla','Filtra polvo y humo, por ejemplo tras un derrumbe o con calima. Está en la lista básica de Ready.gov (FEMA). No está en la lista del botiquín de Cruz Roja, por eso va en Seguridad.',[SRC7.fema[0],SRC7.fema[1]]],
 'Vendas hemostáticas':['Vendas hemostáticas','Vendas o gasas que ayudan a parar una hemorragia fuerte. Se venden en farmacias. Ojo: no están en la lista de Cruz Roja para el botiquín de casa; las incluye Plan B por si una herida sangra mucho mientras llega la ayuda. Si no la quieres, pulsa «Omitir» y anota por qué.'],
 botiquin:['Botiquín','Lista de Cruz Roja para casa (sin medicamentos). Básico (N1): una selección de Plan B de esa lista. Completo (N2): la lista entera más vendas hemostáticas, explicadas aparte. Si tienes otra cosa que hace lo mismo, pulsa «Omitir» y anota el motivo.',SRC7.cr],
 sit:['Información Toxicológica','Servicio de Información Toxicológica: '+TEL_SIT+', 24 horas, todos los días. Para intoxicaciones (productos de limpieza, setas, medicamentos…). Si la persona está grave, llama al 112.',[SRC7.sit[0],SRC7.sit[1]]],
 aguaBeber:['Agua para beber','Lo mínimo para beber: 1,5 L por persona y día (Protección Civil). Plan B pide 4 L por persona y día para beber, cocinar e higiene básica (Ready.gov: un galón, unos 3,8 L), 6 L con calor, y más si eliges lavaros con palangana o ducha corta (OMS).',[SRC7.who[0],SRC7.who[1]]],
 higieneForma:['Cómo os lavaríais','Sin agua (toallitas y gel): 4 L por persona y día (6 con calor). Palangana: 7,5 L, el mínimo de la OMS para beber, cocinar e higiene básica. Ducha corta: 15 L, el mínimo de la OMS y Esfera en emergencias. Cambia el agua que te pide Plan B.',[SRC7.who[0],SRC7.who[1]]],
 temporada:['Calor y frío por la fecha','Si has marcado veranos muy calurosos u olas de calor, de junio a septiembre Plan B pide 6 L de agua por persona y día. Si has marcado inviernos fríos o nieve, de noviembre a marzo añade abrigo a tu lista. Regla de Plan B.'],
 cp:['Código postal','Las dos primeras cifras son la provincia (BOE). Plan B solo usa eso: elige tu provincia para el sol y sabe si estás en una isla. No sale de este móvil.',[SRC7.cp[0],SRC7.cp[1]]],
 proteinaNinos:['Proteína por edad','EFSA da gramos por kilo según la edad: 1,14 g/kg al año, 0,92 entre los 3 y 12 años y 0,90 de 13 a 17; 0,83 en adultos. Sin peso, Plan B usa el peso de referencia de EFSA para la edad más alta del grupo, para no quedarse corto. Los bebés (0–2) comen aparte: leche o papillas.',[SRC7.efsaS[0],SRC7.efsaS[1]]],
 aislado:['Si se corta tu acceso','En una isla, con una sola carretera o en una casa aislada, si además las tiendas o el hospital quedan lejos, la ayuda y el reparto pueden tardar más. Plan B te sugiere ir un nivel por delante en agua y comida. El objetivo no cambia ('+PB+').'],
 senal:['Señal de vida','Si vives solo: acuerda con tu contacto de fuera una hora al día para decir «estoy bien» en una emergencia (mensaje, llamada perdida o walkie). Si no avisas, sabe que tiene que llamar o pedir que alguien vaya ('+PB+').'],
 hervir:['Hervir gasta combustible','Hervir el agua no potable gasta cocina: Plan B suma 6 minutos de fuego por litro (llevar a ebullición y mantener 1 minuto, OMS), o 100 Wh por litro si es eléctrica (lo que cuesta calentar 1 L de 20 a 100 °C, más pérdidas). '+PB+'.'],
 generador:['Generador','Da electricidad con combustible. Nunca dentro de casa ni en el garaje: el humo tiene monóxido de carbono.']});
/* ---------- Kit por nivel: cambios aprobados ---------- */
(function(){const rm=(lv,t)=>{const i=KIT7.findIndex(k=>k[0]===lv&&k[2]===t);if(i>-1)KIT7.splice(i,1);return i};
 const put=(lv,t,row)=>{const i=KIT7.findIndex(k=>k[0]===lv&&k[2]===t);if(i>-1)KIT7[i]=row;else KIT7.push(row)};
 put(1,'Botiquín básico',[1,'botiquin','Botiquín básico','botiquin',R=>BOT_B7.every(e=>R.has('botiquin',e))]);
 put(2,'Botiquín completo (Cruz Roja)',[2,'botiquin','Botiquín completo (Cruz Roja) y vendas hemostáticas','botiquin',R=>BOT_C7.every(e=>R.has('botiquin',e))]);
 put(2,'Efectivo para 3 días',[2,'dinero','Efectivo en billetes pequeños y monedas','efectivo',R=>R.s.dinero.eur>0&&(R.s.dinero.d==null||R.s.dinero.d>=3)]);
 put(3,'Efectivo para 2 semanas',[3,'dinero','Efectivo también para recibos o un transporte','efectivo',R=>R.s.dinero.eur>0&&(R.s.dinero.d==null||R.s.dinero.d>=14)]);
 put(4,'Comida y medios de agua para 1 mes',[4,'comida','Comida para 1 mes; agua para 14 días y forma de potabilizar','envase',R=>R.s.comida.d>=30&&R.s.agua.d>=14&&R.potab]);
 put(4,'Medicación crónica para 1 mes (MSB)',[4,'medic','Medicación crónica para 1 mes (MCF)','medicacion',R=>R.s.medic.d==null?null:R.s.medic.d>=30]);
 put(4,'Energía sostenible con generación propia',[4,'energia','Energía para 1 mes: reserva, generación propia o generador','generador',R=>R.s.energia.d>=30||R.solarWh>0||R.generador]);
 put(4,'Comunicación a larga distancia',[4,'com','Recibir y enviar avisos a distancia (también receptor de onda corta)','Receptor o escáner',R=>R.com.some(c=>['Estación de radioaficionado','Mensajero por satélite','Internet por satélite','Emisora CB 27 MHz','Receptor o escáner','Nodo de malla (radio de largo alcance)'].includes(c))]);
 KIT7.push([2,'otros','Mascarilla de protección facial','Mascarilla de protección facial',R=>R.has('otros','Mascarilla de protección facial')]);
 KIT7.push([4,'dinero','Un pequeño fondo de intercambio ('+PB+')','fondo',R=>R.fondo||R.has('dinero','Fondo de intercambio')]);
 KIT7.sort((a,b)=>a[0]-b[0])})();
/* Un examen por nivel: el de 72 horas autónomo pasa a N2; N4 se queda con la auditoría. */
LV7.autonomo=2;CUR.forEach(d=>{if(d.k==='autonomo')d.lv=2});
/* ---------- «Ha pasado algo» (incidencias del hogar) ---------- */
const HPA8=[
 ['luz','Se ha ido la luz','apagon',null],
 ['agua','El agua está cortada o sale turbia','agua',null],
 ['fuga','Hay una fuga o se inunda','inunda',null],
 ['humo','Hay humo o un fuego pequeño','fuegocasa',null],
 ['gas','Huele a gas','cogas','gas'],
 ['tiempo','Temporal, lluvia fuerte o calor','tiempo',null],
 ['sismo','Ha habido un terremoto','sismo',null],
 ['sincom','No hay móvil ni internet','sincom',null],
 ['pagos','No funciona el pago con tarjeta','pagos',null],
 ['salir','Hay que salir de casa','evac',null]];
/* ---------- Misión en pareja para quien vive solo ---------- */
PAR.push({k:'par_senal',t:'Avisar a tu contacto',a:'red',f:'com',d:'A la hora acordada, manda tu «señal de vida» a tu contacto de fuera sin usar datos (llamada perdida o mensaje). Comprobad que le ha llegado.'});
/* ---------- Aviso legal ---------- */
const LEGAL8=()=>`<h2>Aviso legal</h2><p class="sm">Plan B es una <b>guía</b> para preparar tu casa. <b>No es un servicio de emergencias</b>: si hay peligro, llama al <b>112</b>. Violencia de género: <b>016</b> (también por WhatsApp en el 600 000 016).</p>
<p class="sm">No sustituye a médicos, bomberos, Protección Civil ni otros profesionales.</p>
<p class="sm">Tus datos se quedan en este móvil: sin cuentas ni servidor.</p>
<p class="sm">Los cálculos son estimaciones con valores medios publicados por sus fuentes (Comisión Europea, OMS, EFSA, Protección Civil, Cruz Roja, PVGIS…). Las fuentes y sus textos son de sus autores. Lo que es decisión propia va marcado «recomendación de Plan B».</p>
<p class="sm">El uso de la app es responsabilidad de quien la usa, también la licencia de radio cuando haga falta.</p>
<p class="xs mut">Última revisión de contenidos: ${fmtD(REV8)}. Contacto: <a href="${SRC7.legal[1]}" target="_blank" rel="noopener">formulario de thedotapps ↗</a></p>`;

/* ===================== Auditoría de textos aprobada por Joel (23/11/2026) ===================== */
/* 1 · Agua: «Fecha de llenado» (agua del grifo, se cambia a los 6 meses) y «Caducidad» (agua comprada), cada una en su campo */
const LLENADO_M=6;
F7.agua.kinds['Envases']=[['n','Número de envases','num'],['litros','Litros de cada uno','num'],['potable','¿Es agua potable?',['Sí','No'],'potable'],
 ['origen','¿Comprada o del grifo?',['Comprada','Del grifo (la llenaste tú)'],'aguaOrigen'],
 ['caduca','Caducidad (la de la etiqueta)','date',null,1,['origen','Comprada']],
 ['llenado','Fecha de llenado','date','aguaOrigen',1,['origen','Del grifo (la llenaste tú)']]];
GL7.aguaOrigen=['Agua comprada o del grifo','Comprada: apunta la caducidad de la etiqueta. Del grifo: apunta el día que la llenaste; Plan B la pone «Por revisar» a los 6 meses, que es cuando Ready.gov aconseja cambiar el agua guardada.',[SRC7.femaW[0],SRC7.femaW[1]]];
/* 5 · Guía › Escenarios: la escalera actual N1–N5 (la de antes era 72 h / 2 semanas / 1 mes / 3 meses) */
DUR.splice(0,DUR.length,
 {lv:1,t:'24 horas',n:'Un apagón o un corte de un día: tiras de lo que hay en casa. Primer escalón ('+PB+').'},
 {lv:2,t:'72 horas',n:'Vives de lo que tienes en casa tres días. Es lo que piden la Comisión Europea y Protección Civil.'},
 {lv:3,t:'2 semanas',n:'Agua y comida para 14 días, y rotar lo que se gasta (guías oficiales de reserva de dos semanas).'},
 {lv:4,t:'1 mes',n:'Objetivo avanzado de Plan B, sin cifra oficial: entran la rutina, la salud y la ayuda entre vecinos.'},
 {lv:5,t:'Autosuficiente',n:'Opcional y no oficial: el hogar repone lo que gasta.'});
Object.assign(NIV_ESC,{1:'eme',2:'eme',3:'eme',4:'cri',5:'cri'});
/* 14 · Comida y alergias: se preguntan una sola vez, juntas: «Dieta», «Restricciones», «Alergias» */
(function(){const p1=PQ.find(s=>s.id==='p1'),p2=PQ.find(s=>s.id==='p2');if(!p1||!p2)return;
 const ai=p1.q.findIndex(q=>q.k==='alergias');if(ai>-1){const[a]=p1.q.splice(ai,1);a.l='Alergias (a alimentos, medicamentos, picaduras…)';
  const ri=p2.q.findIndex(q=>q.k==='restr'),di=p2.q.findIndex(q=>q.k==='dieta');p2.q.splice(ri>-1?ri+1:di>-1?di+1:0,0,a)}
 /* «Intolerancias o lo que no come» ya no se pregunta: lo cubren Restricciones y Alergias. Las respuestas guardadas se conservan y se siguen mostrando. */
 p2.q=p2.q.filter(q=>q.k!=='intol');const r=p2.q.find(q=>q.k==='restr');if(r)r.l='Restricciones';p2.t='Comida y día a día'})();
GL7.dietas=['Dieta, restricciones y alergias','Se preguntan una vez por persona. Filtran qué comida cuenta para cada una: si algo no lo puede comer, no suma a sus días.'];
/* Repaso propio · preguntas en singular si vive una sola persona */
const solo8=()=>{const h=(typeof wz!=='undefined'&&wz&&wz.draft&&wz.draft.hogar)||(typeof D!=='undefined'&&D&&D.hogar)||{};return h.nper===1};
[['higieneForma','Si se corta el agua, ¿cómo te lavarías?'],['cocina','¿Con qué cocinas?'],['acs','¿Con qué calientas el agua?']].forEach(([k,s1])=>HQ.forEach(sc=>{const q=sc.q.find(q=>q.k===k);if(q){const pl=q.l;Object.defineProperty(q,'l',{get:()=>solo8()?s1:pl,configurable:true,enumerable:true})}}));
/* 21 · Comprobaciones del kit con sus propios campos */
(function(){const put=(lv,t,row)=>{const i=KIT7.findIndex(k=>k[0]===lv&&k[2]===t);if(i>-1)KIT7[i]=row;else KIT7.push(row)};
 put(4,'Red de apoyo organizada: quién ayuda a quién',[4,'evac','Red de apoyo organizada: quién ayuda a quién','red',R=>X().solo?R.puntoExt:ans(D.hogar&&D.hogar.quienCuida)]);
 /* 22 · N4: reserva de 30 días, placa probada o generador; el balance solar positivo queda en N5 */
 put(4,'Energía para 1 mes: reserva, generación propia o generador',[4,'energia','Energía para 1 mes: reserva de 30 días, placa probada o generador','generador',R=>R.s.energia.d>=30||R.placaProbada||R.generador]);
 KIT7.sort((a,b)=>a[0]-b[0])})();
/* 3 · El punto de encuentro y el contacto de fuera son el mismo dato que en Guía › Plan sin red */
(function(){const ap=HQ.find(s=>s.q.some(q=>q.k==='punto'));if(!ap)return;const p=ap.q.find(q=>q.k==='punto'),e=ap.q.find(q=>q.k==='contactoExt');
 if(p)p.hint='Es el mismo dato que «Punto de encuentro cerca de casa» en Guía › Plan sin red: si cambias uno, cambia el otro.';
 if(e)e.hint='Es el mismo dato que en Guía › Plan sin red.'})();
