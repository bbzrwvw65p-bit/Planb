/* Plan B 8.0.1 · Contenido: interruptor «Encendido» en la fila, producción propia, batería propia del aparato,
   habilidades recomendadas según el hogar. Sin marcas ni modelos. Lo que es decisión propia va marcado «recomendación de Plan B». */
'use strict';
/* ---------- 3 · «Encendido» sale de la ficha: va en la fila de la lista. El dato (r.enc) se conserva igual. ---------- */
const DROP801=k=>k!=='enc';
F7.energia.kinds['Aparato']=F7.energia.kinds['Aparato'].filter(f=>DROP801(f[0]));
F7.com.kinds['Equipo']=F7.com.kinds['Equipo'].filter(f=>DROP801(f[0]));
/* Horas al día (opcional): si lo dejas vacío, un aparato encendido cuenta 24 horas, como hasta ahora */
F7.energia.kinds['Aparato'].splice(2,0,['horasDia','Horas al día que está encendido','num','horasDia',1]);
F7.com.kinds['Equipo'].push(['horasDia','Horas al día que está encendido','num','horasDia',1]);
/* 12 · Aparato con batería propia: capacidad y carga, solo si «Cómo se conecta» es «Batería propia» */
F7.energia.kinds['Aparato'].push(
 ['bpWh','Capacidad de su batería (Wh)','num','bateriaPropia',1,['conex','Batería propia']],
 ['bpMah','O capacidad en mAh','num','mah',1,['conex','Batería propia']],
 ['bpCarga','Carga ahora (%)','num',null,1,['conex','Batería propia']]);
/* Producción: generador y manivela o dinamo, con las horas al día que los usarías (lo pones tú; Plan B no lo supone) */
F7.energia.kinds['Generador'].push(['horasDia','Horas al día que lo usarías','num','produccion',1]);
F7.energia.kinds['Manivela o dinamo']=[['w','Potencia que da (W)','num','produccion'],['horasDia','Horas al día que le darías','num','produccion',1]];
Object.assign(GL7,{
 encendido:['Encendido','Está en cada fila de la lista, no dentro de la ficha. Si gasta (un aparato, una radio enchufada, una cocina eléctrica), suma a lo que el hogar necesita cada día. Si produce (placa solar, generador, manivela o dinamo), suma a la producción del día. Baterías y pilas no llevan interruptor: son la reserva. Los aparatos médicos y la nevera de medicinas vienen encendidos.'],
 horasDia:['Horas al día','Las horas que suele estar encendido. Si lo dejas vacío, Plan B cuenta 24 horas, que es el caso de un aparato que no se apaga (nevera, aparato médico, router). Consumo del día = vatios × número de aparatos × horas.'],
 bateriaPropia:['Batería propia del aparato','La batería que lleva dentro el aparato solo sirve para ese aparato: no se suma a la reserva común. Plan B la gasta primero en ese aparato y, cuando se acaba, el aparato pasa a tirar de la reserva común. Si solo sabes los mAh, Plan B los pasa a Wh con 3,7 V, como en las baterías USB.'],
 produccion:['Producción propia','Lo que generas cada día con generador o manivela o dinamo: vatios × horas al día que tú pones. Plan B no calcula cuánto combustible gasta un generador: mira la etiqueta o el manual. Solo cuenta si la fila está encendida.']});
/* 11 · Habilidades recomendadas según el hogar: opcionales, dan XP y no bloquean subir.
   Solo fichas que ya existen y cuyo texto habla de ese grupo de personas. */
const SKREC801=[
 ['atrag',x=>(x.P||[]).some(bebe)?'hay un bebé en casa (la ficha tiene los pasos para bebés)':(x.P||[]).some(nino)?'hay niños en casa':''],
 ['quem',x=>(x.P||[]).some(nino)?'hay niños en casa (la ficha habla de bebés y niños)':''],
 ['calima',x=>(x.P||[]).some(p=>p.edad==='65+')?'hay personas mayores (la ficha las cuenta como sensibles)':(x.P||[]).some(p=>p.cronica==='Sí')?'alguien tiene una enfermedad crónica':''],
 ['calor',x=>(x.P||[]).some(p=>p.cronica==='Sí'||p.med==='Sí')?'alguien tiene una enfermedad crónica o medicación diaria (la ficha dice cuándo buscar atención)':'']];
