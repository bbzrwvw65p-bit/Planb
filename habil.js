/* Plan B v6 · Habilidades: cada ficha «Cómo se hace» es una habilidad.
   Explicado: la has abierto (0 puntos). Aprendido: práctica marcada + test aprobado (4 de 5, el 80 %): solo esto puntúa.
   Caduca a los 12 meses: vuelve a Explicado, sus puntos quedan en pausa y deja de contar como requisito de nivel.
   Las preguntas salen del texto de cada ficha y de sus mismas fuentes. La ficha de violencia en casa nunca puntúa ni se anota. */
'use strict';
const APPV='6.1',APPV_N=61;
const SKXP=30,CURSO_XP=50,SK_PASS=.8;
/* Requisitos de nivel: habilidades Aprendidas y vigentes (se acumulan: en el nivel 2 siguen contando las del 1) */
const REQ={1:['extintor','gas','rcp','pls'],2:['agua','hemo']};
const SK_FRONT={rcp:'salud',pls:'salud',atrag:'salud',hemo:'salud',quem:'salud',calor:'salud',calima:'salud',agua:'agua',gas:'seg',extintor:'seg'};
const skFront=k=>SK_FRONT[k]||'salud';
const skList=()=>FICHAS.filter(f=>!f.vg&&!f.noScore);
const skOk=k=>{const f=fichaDef(k);return !!f&&!f.vg&&!f.noScore};
const SK_MESES=k=>(fichaDef(k)||{}).caduca||12;
const PRACT={
 rcp:'Repasa los pasos en voz alta y practica la postura y el ritmo sobre un cojín firme, nunca sobre una persona. Mejor aún, en un curso con maniquí.',
 pls:'Practica la posición con alguien que esté bien y quiera ayudarte, despacio y sin forzar.',
 atrag:'Repasa en voz alta los pasos de adulto y de bebé y practica dónde van las manos, sin hacer golpes ni compresiones sobre nadie.',
 hemo:'Practica la presión directa sobre tu propio brazo con un paño. Si tienes torniquete, aprende a colocarlo sin apretar.',
 quem:'Localiza en casa el film transparente y un apósito limpio, y repasa los pasos en voz alta.',
 calor:'Repasa las señales del golpe de calor y del agotamiento y localiza la habitación más fresca de casa.',
 calima:'Comprueba si tienes mascarillas FFP2 en casa y si tu aire acondicionado tiene modo de recirculación.',
 agua:'Mira la etiqueta de tu lejía: si dice que es apta para el agua de bebida y cuántos gramos de cloro por litro tiene.',
 gas:'Localiza la llave de paso del gas de casa y comprueba que sabes cerrarla y abrirla.',
 extintor:'Localiza el extintor más cercano (casa, portal o trabajo), lee su etiqueta y mira si la aguja del manómetro está en la zona verde.'};
/* Test: [pregunta, [respuesta correcta, incorrecta, incorrecta]] · se barajan al mostrarlas */
const TESTS={
 rcp:[['¿Cuándo empiezas la RCP?',['Si no responde y no respira con normalidad','Si respira pero está mareado','Si tose con fuerza']],
  ['Boquea o respira lento y con ruido. ¿Qué haces?',['Actúo como si no respirara: empiezo la RCP','Espero: eso es respirar con normalidad','Le pongo de lado y me voy a pedir ayuda']],
  ['¿Cuánto hundes el pecho de un adulto?',['Entre 5 y 6 cm','1 o 2 cm','Más de 10 cm']],
  ['¿A qué ritmo haces las compresiones?',['De 100 a 120 por minuto','De 30 a 40 por minuto','Una cada 5 segundos']],
  ['No sabes dar ventilaciones. ¿Qué haces?',['Solo compresiones, sin parar','Nada hasta que llegue la ambulancia','Una compresión cada 10 segundos']]],
 pls:[['¿Cuándo usas la posición lateral de seguridad?',['No responde pero respira con normalidad','No responde y no respira','Está despierto y habla']],
  ['Sospechas un golpe fuerte en el cuello o la espalda. ¿La pones de lado?',['No, salvo que un peligro obligue a moverla','Sí, siempre','Sí, y además la siento']],
  ['¿Cómo va el brazo más cercano a ti?',['Estirado en ángulo recto con el cuerpo','Debajo de su espalda','Recto por encima de la cabeza']],
  ['¿Qué rodilla doblas para girarla?',['La de la pierna más alejada, y la giras hacia ti','La más cercana, y la empujas lejos de ti','Ninguna: se gira por los hombros']],
  ['Deja de respirar con normalidad. ¿Qué haces?',['La pongo boca arriba y empiezo la RCP','La dejo de lado y espero','Le doy agua']]],
 atrag:[['Se atraganta pero puede toser. ¿Qué haces?',['Le animo a toser fuerte y no hago nada más','Le doy golpes en la espalda enseguida','Le doy agua']],
  ['Adulto que no puede toser. ¿Qué haces primero?',['Le inclino hacia delante y le doy hasta 5 golpes fuertes entre los omóplatos','Le meto los dedos en la boca','Le tumbo boca arriba']],
  ['En la maniobra de Heimlich, ¿dónde va el puño?',['Justo por encima del ombligo, y tiro hacia dentro y hacia arriba','Sobre el esternón, empujando hacia abajo','En la espalda, entre los omóplatos']],
  ['¿Qué haces con un bebé de menos de 1 año?',['5 golpes en la espalda boca abajo sobre el antebrazo y 5 compresiones en el pecho con dos pulgares','Compresiones abdominales como a un adulto','Lo pongo boca arriba y espero']],
  ['Pierde el conocimiento. ¿Qué haces?',['Le tumbo boca arriba, llamo al 112 y empiezo la RCP','Sigo con golpes de pie','Le doy agua']]],
 hemo:[['Sangra mucho. ¿Qué haces primero?',['Aprieto fuerte y sin soltar sobre la herida','Lavo la herida con agua','Espero a ver si para sola']],
  ['El paño se empapa. ¿Qué haces?',['No lo quito: pongo otro encima y sigo apretando','Lo quito y pongo uno limpio','Dejo de apretar para mirar']],
  ['¿Cuándo pones un torniquete?',['Brazo o pierna, peligro para la vida y no para apretando','En cualquier corte que sangre','En el cuello']],
  ['¿Dónde colocas el torniquete?',['Entre 5 y 7 cm por encima de la herida, nunca sobre una articulación','Sobre la rodilla o el codo','Justo encima de la herida, a 1 cm']],
  ['Ya está puesto. ¿Qué haces?',['Anoto la hora y no lo aflojo: lo retira un profesional','Lo aflojo cada 10 minutos','Lo quito cuando deje de sangrar']]],
 quem:[['¿Cómo enfrías una quemadura?',['Con agua fresca, no helada, al menos 20 minutos','Con hielo directo 5 minutos','Con agua caliente']],
  ['¿Qué no debes hacer?',['Poner pomadas, hielo o remedios caseros, o romper las ampollas','Enfriar con agua','Cubrir sin apretar']],
  ['¿Cómo la cubres?',['Sin apretar, con un apósito limpio o con film transparente','Con una venda bien apretada','Con algodón pegado a la piel']],
  ['¿Cuándo llamas al 112?',['Si es grande, en cara, manos, genitales o articulaciones, o si es un niño','Solo si sangra','Nunca por una quemadura']],
  ['Bebés y quemaduras grandes: ¿qué vigilas al enfriar?',['Que no cojan frío','Que el agua esté helada','Que no beban']]],
 calor:[['¿Cuáles son señales de golpe de calor?',['Piel caliente y enrojecida, más de 40 °C, confusión o desmayo','Piel fría y pálida con mucho sudor','Tos y estornudos']],
  ['Ante un golpe de calor, ¿qué haces primero?',['Llamo al 112 ya','Espero a ver si mejora','Le doy un analgésico']],
  ['Mientras llega la ayuda, ¿qué haces?',['La llevo a un sitio fresco y le bajo la temperatura con paños o agua fría','La abrigo','Le doy una bebida caliente']],
  ['En un golpe de calor, ¿le das de beber?',['No','Sí, mucha agua fría','Sí, una bebida azucarada']],
  ['Agotamiento por calor, más leve: ¿qué haces?',['Sitio fresco, ropa floja, agua a sorbitos y paños húmedos','Hago ejercicio para sudar','Nada, se pasa solo']]],
 calima:[['Con calima, ¿cómo tienes puertas y ventanas?',['Cerradas','Abiertas para ventilar','Da igual']],
  ['Si tienes que salir, ¿qué mascarilla es mejor?',['Una bien ajustada, mejor FFP2 o FFP3','Una de tela floja','No sirve ninguna']],
  ['¿Cómo quitas el polvo de casa?',['Con paños húmedos','Barriendo en seco y sacudiendo','Soplándolo']],
  ['¿Y el ejercicio al aire libre?',['Lo reduzco y no hago ejercicio intenso','Es buen momento para correr','Sin cambios']],
  ['A alguien con asma le empeoran los síntomas. ¿Qué haces?',['Llamo al 112','Abro las ventanas','Espero al día siguiente']]],
 agua:[['¿Cuánto hierves el agua?',['A borbotones 1 minuto (3 minutos por encima de 2.000 m)','10 segundos','Hasta que esté tibia']],
  ['El agua está turbia. ¿Qué haces antes?',['La filtro con un paño limpio','Le echo sal','Nada']],
  ['¿Qué lejía puedes usar?',['Solo la que dice «apta para la desinfección del agua de bebida», sin perfume ni detergente','Cualquier lejía','Lejía con detergente']],
  ['Lejía de 40 g/L sin dosis en la etiqueta: ¿cuánta pones?',['1 gota por litro','1 tapón por litro','10 gotas por litro']],
  ['Después de echarla, ¿qué haces?',['Remuevo y espero al menos 30 minutos','La bebo enseguida','La caliento']]],
 gas:[['Huele a gas. ¿Qué no haces?',['Tocar interruptores o enchufes o encender llamas','Abrir las ventanas','Salir de casa']],
  ['¿Qué haces si puedes sin riesgo?',['Cierro la llave del gas y abro puertas y ventanas','Cierro las ventanas para que no salga','Enciendo la campana']],
  ['¿Desde dónde llamas?',['Desde fuera de casa, al 112 o a la distribuidora','Desde la cocina','Desde el teléfono fijo de casa']],
  ['¿Usas el ascensor para salir?',['No','Sí, es más rápido','Solo si vivo arriba']],
  ['Y después, ¿qué haces?',['No reparo nada ni abro la llave hasta que lo revise un profesional','Abro la llave para comprobar','Tapo la fuga con cinta']]],
 extintor:[['¿Cuándo usas un extintor?',['Solo en un fuego pequeño que acaba de empezar','En cualquier fuego','Cuando hay mucho humo']],
  ['El fuego es grande o hay mucho humo. ¿Qué haces?',['Salgo, cierro la puerta y llamo al 112','Me acerco con el extintor','Abro las ventanas y me quedo']],
  ['¿A dónde apuntas?',['A la base de las llamas','A lo más alto de las llamas','Al humo']],
  ['¿Qué haces antes de acercarte?',['Quito precinto y pasador y hago un disparo corto de prueba','Lo agito un minuto','Nada: disparo ya al fuego']],
  ['Arde aceite en una sartén. ¿Qué haces?',['Tapo la sartén; nunca agua','Le echo agua','La llevo al fregadero']]]};

/* ---------- Estado ---------- */
function skAll(){D.skills=D.skills||{};return D.skills}
function skillOf(k){if(!D||!skOk(k))return null;const s=skAll()[k];if(!s)return null;
 /* al caducar vuelve a Explicado y hay que repetir práctica y test */
 if(s.estado==='Aprendido'&&s.caduca&&s.caduca<=today()){s.estado='Explicado';s.caducada=s.caduca;s.practica=null;s.test=null;save()}
 return s}
const skEstado=k=>{const s=skillOf(k);return s?s.estado:null};
const skVigente=k=>{const s=skillOf(k);return !!(s&&s.estado==='Aprendido'&&s.caduca>today())};
function skOpen(k){if(!D||!D.hogar||!skOk(k))return;const a=skAll();if(!a[k]){a[k]={estado:'Explicado',abierto:today()};save()}}
function skillXP(){let v=0,frozen=0;const f={};if(!D)return{v,f,frozen};
 skList().forEach(fi=>{const s=skillOf(fi.k);if(!s)return;if(skVigente(fi.k)){v+=SKXP;f[skFront(fi.k)]=(f[skFront(fi.k)]||0)+SKXP}else if(s.caducada)frozen+=SKXP});return{v,f,frozen}}
function courseXP(){let v=0;const f={};if(!D)return{v,f};skList().forEach(fi=>{const s=skillOf(fi.k);if(s&&s.curso){v+=CURSO_XP;f[skFront(fi.k)]=(f[skFront(fi.k)]||0)+CURSO_XP}});return{v,f}}
const misFichas=k=>(typeof MIS_FICHA!=='undefined'&&MIS_FICHA[k]||[]).filter(skOk);
function reqFor(lv){const out=[];for(let l=1;l<=lv;l++)(REQ[l]||[]).forEach(k=>{if(!out.includes(k))out.push(k)});return out}
const reqMissing=lv=>reqFor(lv||1).filter(k=>!skVigente(k));
const courseMedals=()=>skList().filter(f=>{const s=skillOf(f.k);return s&&s.curso}).map(f=>'Curso oficial: '+f.t);
/* Avisos: caducadas y las que caducan en menos de un mes */
function skWarn(){if(!D||!D.skills)return[];const out=[],lim=plusM(today(),1);
 skList().forEach(f=>{const s=skillOf(f.k);if(!s)return;
  if(s.estado==='Explicado'&&s.caducada)out.push({k:f.k,t:f.t+': caducada',s:`Caducó el ${fmtD(s.caducada)}. Sus puntos están en pausa: repite la práctica y el test.`});
  else if(s.estado==='Aprendido'&&s.caduca<=lim)out.push({k:f.k,t:f.t+': caduca pronto',s:`Caduca el ${fmtD(s.caduca)}. Repite el test antes para no perder sus puntos.`})});return out}

/* ---------- Interfaz ---------- */
function reqHtml(lv){const ks=reqFor(lv);if(!ks.length)return '';
 return `<div class="mins"><div class="k">Habilidades para subir</div>${ks.map(k=>{const ok=skVigente(k);return `<div class="${ok?'':'b'}"><span>${ok?'✓ ':'▲ '}${esc(fichaDef(k).t)}</span><button type="button" class="gh sm" onclick="go('g');gs('como');gfic='${k}';render();window.scrollTo(0,0)">${ok?'Ver':'Aprender'}</button></div>`}).join('')}<p class="xs mut">Aprendida = práctica marcada y test aprobado (4 de 5). Caduca a los 12 meses.</p></div>`}
function skCard(k){if(!skOk(k)||!D||!D.hogar)return '';const s=skillOf(k)||{estado:'Explicado'},ok=skVigente(k),req=Object.entries(REQ).find(([,a])=>a.includes(k));
 const t=s.test,pass=t&&t.aciertos/t.total>=SK_PASS;
 return `<section class="card skc" id="skc"><div class="row sb"><h3 class="k">Tu habilidad</h3><span class="led">${ok?'Aprendido':'Explicado'}</span></div>
 <p class="sm">${ok?`Aprendida el ${fmtD(s.aprendido)}. Caduca el ${fmtD(s.caduca)}: entonces repite práctica y test.`:s.caducada?`Caducó el ${fmtD(s.caducada)}: sus puntos están en pausa hasta que repitas práctica y test.`:'Leída: aún no da puntos. Para «Aprendido», marca la práctica y aprueba el test (4 de 5).'}</p>
 ${req?`<p class="xs mut">Requisito para superar el nivel ${req[0]}.</p>`:''}
 <ol class="steps"><li><b>Práctica.</b> ${esc(PRACT[k]||'Repasa los pasos en voz alta.')} ${s.practica?`<span class="xs db">✓ Marcada el ${fmtD(s.practica)}.</span>`:''}</li><li><b>Test.</b> 5 preguntas sacadas de esta ficha. ${t?`<span class="xs db">Último: ${t.aciertos} de ${t.total}${pass?' · aprobado':''} (${fmtD(t.fecha)}).</span>`:''}</li></ol>
 <div class="row">${s.practica?'':`<button type="button" class="gh" onclick="skPractica('${k}')">He practicado</button>`}<button type="button" class="${s.practica?'btn':'gh'}" onclick="skTest('${k}')">${t?'Repetir el test':'Hacer el test'}</button></div>
 <p class="xs mut">Aprendida da +${SKXP} XP de Habilidades. Un curso oficial da una medalla y +${CURSO_XP} XP.</p>
 ${s.curso?`<p class="sm">✓ Curso oficial: ${esc(s.curso.entidad)}${s.curso.fecha?' · '+fmtD(s.curso.fecha):''}. <button type="button" class="link" onclick="skCursoDel('${k}')">Quitar</button></p>`:`<button type="button" class="gh sm" onclick="skCurso('${k}')">He hecho un curso oficial</button>`}</section>`}
async function skPractica(k){if(!await ask(`<h2>¿Has practicado?</h2><p>${esc(PRACT[k]||'')}</p><p>Márcalo solo si lo has hecho tú.</p>`,'Sí, lo he hecho','Todavía no'))return;const s=skAll()[k]||(skAll()[k]={estado:'Explicado',abierto:today()});s.practica=today();skCheck(k);save();render();note('Práctica anotada.')}
let skT=null;
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function skTest(k){const Q=TESTS[k];if(!Q)return;skT={k,qs:Q.map(([q,o])=>({q,o:shuffle(o.map((t,i)=>({t,ok:i===0})))})),sel:{},done:false};renderSkTest()}
function renderSkTest(){const f=fichaDef(skT.k);let h=`<div class="eh"><h1 class="h2" id="ovt" tabindex="-1">TEST · ${esc(f.t.toUpperCase())}</h1><button type="button" class="gh sm" onclick="closeOv();skT=null">Cerrar</button></div><p class="sm mut">5 preguntas de la ficha. Se aprueba con 4.</p>`;
 skT.qs.forEach((q,i)=>{h+=`<fieldset class="q"><legend class="k">${i+1}. ${esc(q.q)}</legend><div class="opts col">${q.o.map((o,j)=>{const on=skT.sel[i]===j,cls=skT.done?(o.ok?' right':on?' wrong':''):'';return `<button type="button" class="opt${on?' on':''}${cls}" aria-pressed="${on}" ${skT.done?'disabled':''} onclick="skT.sel[${i}]=${j};renderSkTest()">${skT.done&&o.ok?'✓ ':''}${esc(o.t)}</button>`}).join('')}</div></fieldset>`});
 if(!skT.done)h+=`<button type="button" class="btn wide" onclick="skGrade()">Corregir</button>`;
 else{const n=skT.qs.filter((q,i)=>q.o[skT.sel[i]]&&q.o[skT.sel[i]].ok).length,ok=n/skT.qs.length>=SK_PASS,s=skillOf(skT.k);
  h+=`<div class="card ${ok?'inv':''}"><div class="k">Resultado</div><p class="sm"><b>${n} de ${skT.qs.length}.</b> ${ok?(s&&s.practica?'Aprobado: habilidad Aprendida.':'Aprobado. Te falta marcar la práctica para que sea Aprendida.'):'No aprobado: repasa la ficha y repite cuando quieras.'}</p></div><div class="row"><button type="button" class="gh" onclick="skTest('${skT.k}')">Repetir</button><button type="button" class="btn" onclick="closeOv();skT=null;render()">Cerrar</button></div>`}
 openOv(h)}
function skGrade(){if(Object.keys(skT.sel).length<skT.qs.length)return note('Responde las 5 preguntas.');skT.done=true;
 const n=skT.qs.filter((q,i)=>q.o[skT.sel[i]].ok).length,k=skT.k,s=skAll()[k]||(skAll()[k]={estado:'Explicado',abierto:today()});
 s.test={fecha:today(),aciertos:n,total:skT.qs.length};skCheck(k);save();renderSkTest()}
function skCheck(k){const s=skAll()[k];if(!s)return;const t=s.test;
 if(s.practica&&t&&t.aciertos/t.total>=SK_PASS&&s.estado!=='Aprendido'){s.estado='Aprendido';s.aprendido=today();s.caduca=plusM(today(),SK_MESES(k));delete s.caducada;checkLevel()}}
async function skCurso(k){if(!await ask(`<h2>Curso oficial</h2><p>Solo si lo has hecho tú, con una entidad acreditada (por ejemplo Cruz Roja, un servicio de emergencias o tu ayuntamiento). Da una medalla y +${CURSO_XP} XP. En Amigos solo se ve el nombre de la medalla.</p><label for="cuE" class="k">Entidad</label><input id="cuE" autocomplete="off" maxlength="60"><label for="cuF" class="k">Fecha</label><input id="cuF" type="date">`,'Guardar','Cancelar'))return;
 const e=($('#cuE').value||'').trim(),fe=$('#cuF').value||'';if(!e){note('Escribe la entidad del curso.');return}if(fe&&fe>today()){note('La fecha no puede ser futura.');return}
 const s=skAll()[k]||(skAll()[k]={estado:'Explicado',abierto:today()});s.curso={entidad:e.slice(0,60),fecha:fe};save();render();note('Curso anotado: medalla y +'+CURSO_XP+' XP.')}
async function skCursoDel(k){if(!await ask('<h2>¿Quitar el curso?</h2><p>Se quitan su medalla y sus puntos.</p>','Quitar','Cancelar'))return;delete skAll()[k].curso;save();render()}
/* Resumen para el panel (nunca incluye la ficha de violencia en casa: no es una habilidad) */
function skPanel(){if(!D||!D.hogar)return '';const L=skList(),apr=L.filter(f=>skVigente(f.k)),req=reqMissing(D.fin?4:D.nivel);
 return `<button type="button" class="card tl wide" onclick="go('g');gs('como')"><span class="k">Habilidades · Cómo se hace</span><b>${apr.length} de ${L.length} aprendidas</b><span class="xs mut">${req.length?'Para subir de nivel te falta: '+esc(req.map(k=>fichaDef(k).t).join(', '))+'.':'Requisitos del nivel cumplidos.'}</span></button>`}
