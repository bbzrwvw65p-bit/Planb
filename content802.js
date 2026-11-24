/* Plan B 8.0.2 · Contenido: energía en 4 grupos (acumuladores, generadores, iluminación, dispositivos), «Otro» en las listas,
   omitir con doble confirmación y aviso de suministro esencial. Sin marcas ni modelos. Lo que es decisión propia va marcado. */
'use strict';
/* ---------- 1 · Energía en 4 grupos. Los nombres internos de siempre se conservan (no hay que migrar nada salvo las luces). ---------- */
const LUZ_E802=['Linterna','Frontal','Farolillo eléctrico','Otra luz eléctrica'],LUZ_N802=['Velas','Barritas químicas','Farolillo de aceite','Otra luz sin electricidad'];
const EK=F7.energia.kinds,grpE=EK['Aparato'].find(f=>f[0]==='grupo');if(grpE)grpE[2]=GRUPOE7.filter(g=>g!=='Luz');
EK['Generador'].splice(1,0,['consumoLh','Consumo de combustible (litros por hora, de la etiqueta o el manual)','num','combustibleGen',1]);
F7.energia.kinds={
 'Estación o batería grande':EK['Estación o batería grande'],'Batería portátil USB':EK['Batería portátil USB'],'Pilas':EK['Pilas'],
 'Otro acumulador':[['wh','Capacidad (Wh), si la sabes','num','wh',1],['carga','Carga ahora (%)','num',null,1]],
 'Placa solar':EK['Placa solar'],'Generador':EK['Generador'],
 'Aerogenerador pequeño':[['w','Potencia (W)','num','eolica'],['whNormal','Wh que da en un día normal, si lo sabes','num','eolica',1]],
 'Manivela o dinamo':EK['Manivela o dinamo'],
 'Otro generador':[['w','Potencia (W)','num','produccion',1],['horasDia','Horas al día que lo usarías','num','produccion',1]],
 'Iluminación':[['tipoLuz','Qué es',[...LUZ_E802,...LUZ_N802],'iluminacion'],['n','Cuántas','num'],
  ['w','Potencia (W)','num','w',1,['tipoLuz',LUZ_E802.join('|')]],['conex','Cómo se carga o funciona',CONEX7.filter(c=>c!=='Batería propia'),'comoConecta',1,['tipoLuz',LUZ_E802.join('|')]],
  ['horasDia','Horas al día que está encendida','num','horasDia',1,['tipoLuz',LUZ_E802.join('|')]],
  ['horasLuz','Horas de luz de cada una (dato de la etiqueta)','num','horasLuz',1,['tipoLuz',LUZ_N802.join('|')]]],
 'Aparato':EK['Aparato']};
const EGRP802=[['Acumuladores','acumuladores',['Estación o batería grande','Batería portátil USB','Pilas','Otro acumulador']],
 ['Generadores','generadores',['Placa solar','Generador','Aerogenerador pequeño','Manivela o dinamo','Otro generador']],
 ['Iluminación','iluminacion',['Iluminación']],['Dispositivos','dispositivos',['Aparato']]];
const KLAB802={'Generador':'Generador de combustible','Aparato':'Dispositivo','Otro acumulador':'Otro','Otro generador':'Otro','Iluminación':'Luz'};
const klab802=k=>KLAB802[k]||k;
/* ---------- 4 · Elementos nuevos y «Otro» ---------- */
['Termómetro','Suero oral','Otro'].forEach(x=>{if(!BOT_C7.includes(x))BOT_C7.push(x)});
['Silbato de señales','Espejo de señales','Antena externa','Otro'].forEach(x=>{if(!COM7.includes(x))COM7.push(x)});
Object.assign(COMG7,{'Silbato de señales':'ayuda','Espejo de señales':'ayuda'});
['Cartilla de vacunas','Papeles de los animales','Papeles del vehículo','Otro'].forEach(x=>{if(!DOCS7.includes(x))DOCS7.push(x)});
if(!COC7.includes('Otra'))COC7.push('Otra');
/* ---------- Suministro esencial (verificado: Ley 24/2013 del Sector Eléctrico, art. 52; MITECO) ---------- */
const SUMESS802=['MITECO · Suministros esenciales','https://www.miteco.gob.es/es/energia/energia-electrica/electricidad/contratacion-suministro/cortes-suministro.html'];
const SUMESS_TXT802='Si en casa hay un equipo médico que necesita la luz para mantener con vida a una persona, puedes pedir que tu punto de luz se reconozca como «suministro esencial» (Ley 24/2013 del Sector Eléctrico, artículo 52). Se acredita ante tu empresa distribuidora (la que figura en la factura para averías) con un certificado médico. Así no te pueden cortar la luz por impago, pero no evita las averías ni los apagones: habla con su médico o centro de salud de qué hacer si se va la luz y ten su teléfono a mano.';
Object.assign(GL7,{
 acumuladores:['Acumuladores','Lo que guarda energía para usarla después: estaciones o baterías grandes, baterías USB, pilas u otro (por ejemplo, la batería del coche con un inversor). Son tu reserva y no llevan interruptor.'],
 generadores:['Generadores','Lo que produce electricidad: placa solar, generador de combustible, aerogenerador pequeño, manivela o dinamo, u otro. Para subir de nivel solo cuentan el combustible guardado y el sol de un día nublado; el viento no, porque no hay un dato fiable de un día sin viento.'],
 iluminacion:['Luz','Linterna, frontal o farolillo eléctrico: llevan vatios e interruptor, gastan de la reserva y cuentan para «una luz por persona». Velas, barritas químicas o farolillo de aceite: se apuntan con las horas de luz de la etiqueta y suman como luz de apoyo, pero no cuentan como luz por persona. Las velas, nunca sin vigilar, lejos de cortinas y de lo que pueda arder, y con la habitación ventilada (recomendación de Plan B). Ready.gov aconseja tener una linterna por persona.',['Ready.gov · Power outages','https://www.ready.gov/power-outages']],
 horasLuz:['Horas de luz','Las que dice la etiqueta o el envase para cada unidad. Plan B las suma: unidades × horas = horas de luz de apoyo.'],
 dispositivos:['Dispositivos','Aparatos que gastan energía: nevera de medicinas, aparato médico, router, radio, cargadores… Llevan interruptor «Encendido», horas al día y, si la tienen, su batería propia.'],
 combustibleGen:['Combustible del generador','Litros guardados ÷ litros por hora = horas de marcha; horas × potencia = Wh, menos el 15 % de pérdidas. Si falta el dato de litros o de consumo, Plan B cuenta 0. El consumo está en la etiqueta o el manual. Úsalo siempre al aire libre y lejos de ventanas y puertas: el humo tiene monóxido de carbono (Ready.gov).',['Ready.gov · Power outages','https://www.ready.gov/power-outages']],
 eolica:['Aerogenerador pequeño','Plan B no lo cuenta para subir de nivel: no hay un dato fiable de cuánto da un día sin viento. Si sabes los Wh de un día normal, se muestran aparte como producción normal.'],
 sumEsencial:['Suministro esencial',SUMESS_TXT802,SUMESS802],
 'Silbato de señales':['Silbato de señales','Para pedir ayuda sin gastar la voz.'],
 'Espejo de señales':['Espejo de señales','Para hacer señales con el reflejo del sol a quien te busca de lejos.'],
 'Antena externa':['Antena externa','Mejora la recepción de una radio o emisora. Sigue las instrucciones de tu equipo.'],
 'Otro':['Otro','Algo que no está en la lista. Escribe su nombre arriba: es obligatorio.']});
