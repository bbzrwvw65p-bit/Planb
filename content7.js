/* Plan B 7.0.0 · Contenido: escalera de niveles, kit por nivel, secciones del Refugio, áreas de «Tú» y explicaciones.
   Cada cifra oficial lleva su fuente con enlace. Lo que es decisión propia se marca «recomendación de Plan B». */
'use strict';
const SRC7={
 pc:['Protección Civil · Autoprotección','https://www.proteccioncivil.es/coordinacion/gestion-de-riesgos/autoproteccion'],
 ue:['Comisión Europea · Unión de Preparación (2025)','https://commission.europa.eu/topics/preparedness_en'],
 fema:['Agencia federal de emergencias de EE. UU. (FEMA) · Kit','https://www.ready.gov/kit'],
 msb:['Agencia sueca de contingencias civiles (MSB)','https://www.msb.se/sv/rad-till-privatpersoner/broschyren-om-krisen-eller-kriget-kommer/'],
 cr:['Cruz Roja · Botiquín de primeros auxilios en casa','https://www2.cruzroja.es/web/ahora/-/todo-lo-que-debe-tener-botiquin-primeros-auxilios-casa'],
 pvgis:['Comisión Europea · PVGIS','https://re.jrc.ec.europa.eu/pvg_tools/es/'],
 efsaE:['EFSA · Valores de referencia de energía (2013)','https://www.efsa.europa.eu/en/efsajournal/pub/3005'],
 efsaP:['EFSA · Valores de referencia de proteína (2012)','https://www.efsa.europa.eu/en/efsajournal/pub/2557'],
 lejia:['Salud Navarra · Lejía para desinfectar agua','https://portalsalud.navarra.es/documents/11746728/60815232/09DocUSODELEJIAdesinfeccinaguaconsumo.pdf/a433d57f-45cd-5c2e-bf82-ecda01731a56'],
 mesh:['Red en malla abierta · web del proyecto','https://meshtastic.org/']};
const PB='recomendación de Plan B';
/* Escalera de niveles (sustituye a 72 h / 2 semanas / 1 mes / 3 meses) */
const NIV7=[
 {t:'24 horas',d:1,o:'Un apagón o un corte de un día.',src:'Primer escalón: '+PB+'.',s:[]},
 {t:'72 horas',d:3,o:'El mínimo oficial: tres días en casa sin ayuda de fuera.',src:'Comisión Europea (Unión de Preparación, 2025) y Protección Civil.',s:['ue','pc']},
 {t:'2 semanas',d:14,o:'Un desastre local: en la DANA el agua tardó semanas en volver.',src:'Guías oficiales de reserva de dos semanas (FEMA).',s:['fema']},
 {t:'1 mes',d:30,o:'Objetivo avanzado, no es norma oficial.',src:'Objetivo de Plan B. La medicación crónica para un mes sí tiene base oficial: la recomendación sueca (MSB).',s:['msb'],adv:true},
 {t:'Autosuficiente',d:null,o:'Opcional: el hogar repone lo que gasta. No hace falta para completar la app; en un piso muchas cosas pueden no ser posibles.',src:'Objetivo de Plan B, no recomendación oficial: las guías oficiales no pasan de 2 semanas para comida y agua.',s:[],adv:true,opt:true}];
const GOAL7=lv=>(NIV7[Math.min(lv,4)-1]||{}).d||30;
/* Misiones de la 6.1 en la escalera nueva (clave → nivel). 0 = se conserva pero no se muestra. */
const LV7={luz:1,cuadro:1,comida:1,nevera:1,movil:1,radio:1,botiquin:1,medicacion:1,medelec:1,seguridad:1,simulacro:1,
 agua:2,sanea:2,termico:2,efectivo:2,documentos:2,plan:2,cocinar:2,botiquin2:2,auxilios:2,tratar:2,mochila:2,mascotas:2,evacsim:2,
 agua14:3,despensa14:3,fifo:3,energia2:3,higiene:3,walkies:3,vecinos:3,vehiculo:3,evacuacion:3,digital:3,semanadespensa:3,
 inventario:4,medcronica:4,energia3:4,seghogar:4,finanzas:4,reparaciones:4,barrio:4,radioaf:4,navegacion:4,comunidad:4,reubicacion:4,mantenimiento:4,auditoria:4,auxilios2:4,autonomo:4,
 huerto:5,autosuf:5,conservas:5,energia4:5,lluvia:5,despensa3:0};
/* Áreas de «Tú» (los antiguos atributos: Recursos pasa al Refugio y no puntúa; Resiliencia se reparte entre Respuesta y Red) */
const ATR7=[['hab','Habilidades'],['rsp','Respuesta'],['res','Resolución'],['red','Red']];
const AMAP7={hab:{hab:1},rsp:{rsp:1},res:{res:1},red:{red:1},rsl:{rsp:.5,red:.5},rec:{}};
/* Secciones del Refugio */
const SEC7=[['agua','Agua'],['higiene','Higiene'],['comida','Comida'],['cocina','Cocina'],['energia','Energía'],['botiquin','Botiquín'],['medic','Medicación'],['com','Comunicaciones'],['doc','Documentos'],['dinero','Dinero'],['evac','Evacuación'],['otros','Seguridad y otros']];
const SECN7=Object.fromEntries(SEC7);
const FR2SEC={agua:'agua',comida:'comida',energia:'energia',salud:'botiquin',com:'com',seg:'otros',doc:'doc',evac:'evac'};
const SEC2FR={agua:'agua',higiene:'salud',comida:'comida',cocina:'comida',energia:'energia',botiquin:'salud',medic:'salud',com:'com',doc:'doc',dinero:'doc',evac:'evac',otros:'seg'};
/* Formularios por sección. Campo: [clave, etiqueta, tipo|opciones, término para explicar, opcional] */
const GRUPOS7=['Cereales y féculas','Legumbres','Carne, pescado o huevo','Lácteos o alternativas','Fruta y verdura','Frutos secos y grasas','Otros'];
const ETQ7=['Vegetariano','Vegano','Sin gluten','Sin lactosa','Sin frutos secos'];
const CONEX7=['USB-A o USB-C','Enchufe de 230 V','Toma de mechero de 12 V','Pilas AA o AAA','Batería propia'];
const GRUPOE7=['Luz','Comunicaciones','Nevera de medicinas','Aparato médico','Cocina','Otros'];
const BOT_B7=['Guantes de látex o vinilo','Toallitas de alcohol (para las manos)','Suero fisiológico','Antiséptico','Gasas','Esparadrapo','Tiritas','Tijeras de punta redondeada','Pinzas sin dientes'];
const BOT_C7=[...BOT_B7,'Mascarilla de protección facial','Vendas hemostáticas','Pañuelo triangular','Vendas de diferentes tamaños'];
const COM7=['Radio AM/FM','Receptor o escáner','Walkie PMR446','Walkie de doble banda','Emisora CB 27 MHz','Estación de radioaficionado','Mensajero por satélite','Nodo de malla (radio de largo alcance)','Internet por satélite','Batería para móviles'];
const COMG7={'Radio AM/FM':'enterarse','Receptor o escáner':'enterarse','Walkie PMR446':'hablar','Walkie de doble banda':'enterarse','Emisora CB 27 MHz':'hablar','Estación de radioaficionado':'hablar','Mensajero por satélite':'ayuda','Nodo de malla (radio de largo alcance)':'hablar','Internet por satélite':'hablar','Batería para móviles':'hablar'};
const DOCS7=['DNI o NIE','Pasaporte','Tarjeta sanitaria','Carné de conducir','Libro de familia','Escrituras o contrato de alquiler','Seguros','Informes médicos','Recetas','Contactos clave en papel'];
const HIG7=['Toallitas húmedas','Gel sin aclarado','Champú en seco','Váter de emergencia y bolsas','Papel higiénico','Compresas o tampones','Pañales','Bolsas de basura','Otro'];
const COC7=['Bombona de butano','Bombona de propano','Cartucho de camping','Gas natural de red','Vitrocerámica o inducción','Hornillo eléctrico','Microondas','Barbacoa','Hornillo de alcohol','Otra'];
const F7={
 agua:{kinds:{'Envases':[['n','Número de envases','num'],['litros','Litros de cada uno','num'],['potable','¿Es agua potable?',['Sí','No'],'potable'],['caduca','Caducidad o fecha de llenado','date']],
  'Depósito o aljibe':[['litros','Litros que tiene ahora','num'],['potable','¿Es agua potable?',['Sí','No'],'potable']],
  'Potabilizar':[['metodo','Método',['Filtro','Pastillas','Lejía apta para agua de bebida','Hervir'],'potabilizar'],['litrosTrat','Litros que puede tratar todavía','num',null,1],['caduca','Caducidad','date',null,1]]}},
 higiene:{kinds:{'Artículo':[['articulo','Artículo',HIG7,'higieneSeco'],['dias','¿Para cuántos días del hogar?','num']]}},
 comida:{kinds:{'Alimento':[['n','Número de envases','num','envase'],['kcal','kcal de cada envase','num','kcal'],['prot','Proteína de cada envase (g)','num','proteina',1],['grupo','Grupo',GRUPOS7,'grupos'],['etq','Etiquetas',ETQ7,'dietas','multi'],['cocinar','¿Hay que cocinarlo?',['No','Sí']],['caduca','Caducidad','date']]}},
 cocina:{kinds:{'Forma de cocinar':[['tipo','Tipo',COC7,'cocinaSinRed'],['n','Cuántas (bombonas o cartuchos)','num',null,1],['peso','Kg de gas de cada bombona o g de cada cartucho','num',null,1],['consumo','Consumo de la etiqueta (g/h o W)','num',null,1],['horas','Horas de fuego al día','num','horasFuego',1],['diasDecl','Si no hay datos: días que calculas','num',null,1]]}},
 energia:{kinds:{'Estación o batería grande':[['wh','Capacidad (Wh)','num','wh'],['carga','Carga ahora (%)','num',null,1]],
  'Batería portátil USB':[['wh','Capacidad (Wh)','num','wh',1],['mah','O capacidad en mAh','num','mah',1],['carga','Carga ahora (%)','num',null,1]],
  'Pilas':[['n','Número de pilas','num'],['tipoPila','Tamaño',['AA','AAA','C','D','9 V','Otra']]],
  'Aparato':[['w','Potencia (W)','num','w'],['n','Cuántos','num',null,1],['grupo','Grupo',GRUPOE7],['conex','Cómo se conecta',CONEX7,'comoConecta']],
  'Placa solar':[['w','Potencia (W)','num','placa'],['cargaA','Qué carga','@bat'],['coloc','Colocación',['Fija mirando al sur','Plegable que vas moviendo','No lo sé']],['subio','Prueba: Wh que subió la batería solo con sol','num','pruebaSolar',1],['fechaPrueba','Fecha de la prueba','date',null,1]]}},
 botiquin:{kinds:{'Elemento':[['elemento','Elemento',BOT_C7,'botiquin'],['cant','Cantidad','num',null,1],['caduca','Caducidad','date',null,1]]}},
 com:{kinds:{'Equipo':[['opcion','Qué es',COM7,'@com'],['canal','Canal, subtono o frecuencia acordada','text',null,1]]}},
 doc:{kinds:{'Documento':[['persona','De quién','@per'],['documento','Documento',DOCS7],['papel','Copia en papel',['Sí','No'],'papel'],['digital','Copia digital sin conexión',['Sí','No'],'digitalOff'],['original','Dónde está el original','text',null,1],['caduca','Caducidad','date',null,1]]}},
 dinero:{kinds:{'Efectivo':[['importe','Importe (€)','num','efectivo'],['donde','Dónde',['Casa','Mochila de evacuación','Vehículo']]]}},
 evac:{kinds:{'Mochila':[['persona','De quién','@per'],['pesoKg','Peso (kg)','num',null,1]],'Ruta':[['modo','Cómo',['A pie','En vehículo']],['probada','Fecha en que la recorristeis','date','rutaProbada',1]],'Destino':[['tipo','Destino',['Fuera de la zona','Punto que indique Protección Civil']]]}},
 otros:{kinds:{'Otro':[['cantNum','Cantidad','num',null,1]]}}};
/* Explicaciones: cada nombre y concepto se puede tocar */
const GL7={
 otros:['Reparar y mantener','Herramientas básicas y lo necesario para arreglar lo que se rompa en casa sin depender de nadie ('+PB+').'],
 refugio:['Refugio','La casa: cuántos días aguanta cada sección (agua, comida, energía…) frente al objetivo de tu nivel. No da XP.'],
 tu:['«Tú»','Lo que sabes hacer y has demostrado: Habilidades, Respuesta, Resolución y Red. Es lo único que da XP.'],
 declarado:['Declarado','Lo has apuntado con «Ya lo tengo». Cuenta para los días del Refugio, pero no da XP hasta comprobarlo.'],
 comprobado:['Comprobado','Lo has probado con su misión (test, tiempo o cantidad). Cuenta para los días y da XP en «Tú».'],
 porRevisar:['Por revisar','Ha caducado o toca revisarlo. No quita tu nivel, pero bloquea la subida al siguiente.'],
 cadPronto:['Caduca pronto','Falta un mes o menos para que caduque.'],
 xp:['XP','Puntos de experiencia de «Tú». Solo cuenta lo demostrado: lo declarado da 0.'],
 rangos:['Rangos','Progreso dentro de cada nivel: Iniciado, Aspirante, Preparado y Consolidado, según tus XP de «Tú».'],
 hab:['Habilidades','Fichas «Cómo se hace» que has practicado y aprobado con su test (Aprobada). Caducan y hay que repasarlas.'],
 rsp:['Respuesta','Simulacros cronometrados: tu mejor tiempo cuenta, con un mínimo creíble.'],
 res:['Resolución','Árboles de decisión recorridos, casos acertados y preguntas «No lo sé» averiguadas (una vez por pregunta).'],
 red:['Red','Personas y su papel, punto de encuentro, contacto de fuera de tu zona y quién ayuda a quién.'],
 envase:['Envase','Cada lata, paquete o botella. Se apunta cuántos tienes y lo que trae cada uno según su etiqueta.'],
 potable:['Agua potable','Agua apta para beber tal cual. La no potable solo cuenta si tienes forma de potabilizarla.'],
 potabilizar:['Potabilizar','Hacer el agua apta para beber: filtro, pastillas, lejía apta para agua de bebida o hervir (hervir gasta combustible).',SRC7.lejia],
 higieneSeco:['Higiene en seco','Lavarse y mantener la casa limpia sin gastar agua: toallitas, gel sin aclarado, champú en seco, váter de emergencia, papel y compresas.'],
 kcal:['kcal','La energía que da cada envase. Está en la etiqueta. Lo que necesita cada persona sale de sus datos en Equipo (fórmula de Mifflin-St Jeor por la actividad, EFSA).',SRC7.efsaE],
 proteina:['Proteína','Gramos de proteína de cada envase, según la etiqueta. Referencia: 0,83 g por kg de peso y día en adultos (EFSA).',SRC7.efsaP],
 grupos:['Grupos de alimentos','Para que la reserva sea equilibrada conviene tener de varios grupos. El aviso de equilibrio es una '+PB+'.'],
 dietas:['Dietas y alergias','Las dietas y alergias de cada persona filtran qué comida cuenta para ella.'],
 cocinaSinRed:['Cocinar sin red','Cómo calentarías comida sin luz ni gas de red. Si no hay ninguna forma, solo cuenta la comida que no necesita cocinarse.'],
 horasFuego:['Horas de fuego al día','Si no lo sabes, Plan B usa 1 hora al día ('+PB+').'],
 wh:['Wh (vatios hora)','La energía que guarda una batería. Una batería de 500 Wh da 50 W durante unas 10 horas, menos las pérdidas.'],
 w:['W (vatios)','Lo que gasta un aparato mientras funciona. Suele estar en la etiqueta o en el cargador.'],
 mah:['mAh','Capacidad que ponen las baterías portátiles. Plan B la pasa a Wh con 3,7 V, la tensión de sus celdas.'],
 estacion:['Estación de energía','Batería grande con enchufes de 230 V, USB y 12 V. Carga aparatos de casa.'],
 bateriaUSB:['Batería portátil USB','Batería pequeña para cargar móviles y aparatos USB. No da 230 V, por eso se cuenta aparte.'],
 perdidas:['Pérdidas','Al cargar y convertir energía se pierde una parte. Plan B descuenta un 15 % ('+PB+').'],
 comoConecta:['Cómo se conecta','Por dónde se carga o se enchufa el aparato. Sirve para saber qué baterías pueden alimentarlo.'],
 placa:['Placa solar','Convierte la luz del sol en electricidad para cargar una batería. Se apunta su potencia en W.'],
 pvgis:['PVGIS','Herramienta de la Comisión Europea con la radiación solar media de cada lugar. Plan B lleva dentro sus valores por provincia y mes (sin internet), con un 14 % de pérdidas del sistema, el valor por defecto de PVGIS.',SRC7.pvgis],
 cielo:['Cielo','Soleado usa el cielo despejado de PVGIS; a ratos, la media de PVGIS; nublado, solo la luz difusa media de PVGIS (aproximación de Plan B). Si no marcas nada, se usa «a ratos».'],
 balance:['Balance diario','Lo que dan tus placas en un día frente a tu consumo básico. ↑ positivo, = justo, ↓ negativo.'],
 pruebaSolar:['Prueba solar','Carga una batería solo con sol y apunta cuántos Wh subió. Con eso la generación pasa a Comprobada.'],
 consumoBasico:['Consumo básico','Luz y carga de móviles: 12 Wh por móvil y 10 Wh de luz al día ('+PB+').'],
 botiquin:['Botiquín','Lista de Cruz Roja para casa. Básico (N1): selección de Plan B de esa lista. Completo (N2): la lista entera. No lleva medicamentos.',SRC7.cr],
 medicacion:['Medicación','Por persona: nombre, dosis diaria, unidades y caducidad. Es privada. Plan B no da consejos de dosis: habla con tu médico o farmacéutico.'],
 'Radio AM/FM':['Radio AM/FM','Noticias y alertas oficiales sin internet. Mejor de pilas, manivela o solar.'],
 'Receptor o escáner':['Receptor o escáner','Solo escucha: emisoras, servicios y radioaficionados. No transmite.'],
 'Walkie PMR446':['Walkie PMR446','Habla con otros walkies a corta distancia, sin licencia. Acordad canal y subtono.'],
 'Walkie de doble banda':['Walkie de doble banda','Escucha VHF/UHF; para transmitir hace falta licencia de radioaficionado.'],
 'Emisora CB 27 MHz':['Emisora CB 27 MHz','Más alcance, sobre todo desde el coche o con antena fija, sin licencia.'],
 'Estación de radioaficionado':['Estación de radioaficionado','Largo alcance y redes de emergencia, con licencia.'],
 'Mensajero por satélite':['Mensajero por satélite','Mensajes cortos o SOS sin cobertura.'],
 'Nodo de malla (radio de largo alcance)':['Nodo de malla','Aparato pequeño que se empareja con el móvil y manda mensajes de texto sin cobertura ni internet; cada nodo reenvía los mensajes de los demás; sin licencia.',SRC7.mesh],
 'Internet por satélite':['Internet por satélite','Conexión a internet por antena cuando no hay red. Necesita electricidad.'],
 'Batería para móviles':['Batería para móviles','Carga los móviles sin red. Se apunta también en Energía.'],
 papel:['Copia en papel','Fotocopia guardada en sitio seco, por si no hay electricidad.'],
 digitalOff:['Copia digital sin conexión','Archivo guardado en el móvil o un pendrive, que se abre sin internet. Plan B no guarda documentos ni números.'],
 efectivo:['Efectivo','Para comida y agua, farmacia, combustible o transporte, salir de casa y pagos urgentes. Mejor billetes pequeños y monedas.'],
 gastoDia:['Gasto básico diario','Lo que gasta tu hogar al día por persona en lo básico. Lo pones tú. Efectivo = personas × gasto × días del nivel ('+PB+').'],
 rutaProbada:['Ruta probada','La habéis recorrido de verdad, a pie o en vehículo.'],
 mochila:['Mochila de evacuación','Una por persona, lista para salir. Lo que lleva sale del Refugio sin duplicar.'],
 nivel5:['Autosuficiente','Nivel opcional: el hogar repone lo que gasta (agua, comida, energía, cocina, higiene). Se demuestra con una misión larga.']};
/* Kit por nivel. chk(R,x) → true, false o null (no aplica). */
const KIT7=[
 [1,'agua','Agua potable para el nivel','potable',R=>R.s.agua.d>=R.goal],
 [1,'comida','Comida que no necesita cocinarse','envase',R=>R.s.comida.dNoCook>=Math.min(R.goal,1)],
 [1,'energia','Luz sin red: una linterna o frontal por persona','w',(R,x)=>R.luces>=Math.max(1,x.n||1)],
 [1,'energia','Una batería cargada para los móviles','bateriaUSB',R=>R.usbWh>0||R.stWh>0],
 [1,'com','Una radio AM/FM con pilas','Radio AM/FM',R=>R.com.includes('Radio AM/FM')],
 [1,'doc','Contactos clave en papel','papel',R=>R.contactosPapel],
 [1,'medic','Medicación habitual para el día','medicacion',R=>R.s.medic.d==null?null:R.s.medic.d>=1],
 [1,'botiquin','Botiquín básico','botiquin',R=>BOT_B7.every(e=>R.bot.includes(e))],
 [2,'cocina','Una forma de cocinar sin red, o solo comida sin cocinar','cocinaSinRed',R=>R.s.cocina.d>=3||R.s.comida.dNoCook>=3],
 [2,'higiene','Higiene en seco para 3 días','higieneSeco',R=>R.s.higiene.d>=3],
 [2,'botiquin','Botiquín completo (Cruz Roja)','botiquin',R=>BOT_C7.every(e=>R.bot.includes(e))],
 [2,'medic','Medicación para 3 días','medicacion',R=>R.s.medic.d==null?null:R.s.medic.d>=3],
 [2,'dinero','Efectivo para 3 días','efectivo',R=>R.s.dinero.d==null?false:R.s.dinero.d>=3],
 [2,'doc','Documentos con copia en papel y digital sin conexión','digitalOff',R=>R.docsOk],
 [2,'evac','Mochila de evacuación por persona','mochila',(R,x)=>R.mochilas>=Math.max(1,x.n||1)],
 [2,'evac','Punto de encuentro y contacto de fuera de tu zona','red',R=>R.puntoExt],
 [3,'agua','Agua almacenada más una forma de potabilizar','potabilizar',R=>R.potab],
 [3,'comida','Comida para 2 semanas, equilibrada por grupos','grupos',R=>R.s.comida.d>=14&&!R.faltanGrupos.length],
 [3,'cocina','Combustible o energía para cocinar 2 semanas','cocinaSinRed',R=>R.s.cocina.d>=14||R.s.comida.dNoCook>=14],
 [3,'energia','Generación propia o reserva para luz y comunicaciones','placa',R=>R.s.energia.d>=14||R.solarWh>0],
 [3,'medic','Medicación para 2 semanas','medicacion',R=>R.s.medic.d==null?null:R.s.medic.d>=14],
 [3,'dinero','Efectivo para 2 semanas','efectivo',R=>R.s.dinero.d==null?false:R.s.dinero.d>=14],
 [3,'com','Una forma de hablar con tu gente sin cobertura','Walkie PMR446',R=>R.com.some(c=>['Walkie PMR446','Emisora CB 27 MHz','Estación de radioaficionado','Nodo de malla (radio de largo alcance)','Mensajero por satélite'].includes(c))],
 [3,'evac','Rutas de evacuación probadas y destino','rutaProbada',R=>R.rutaProbada&&R.destino],
 [4,'comida','Comida y medios de agua para 1 mes','envase',R=>R.s.comida.d>=30&&(R.s.agua.d>=30||R.potab)],
 [4,'medic','Medicación crónica para 1 mes (MSB)','medicacion',R=>R.s.medic.d==null?null:R.s.medic.d>=30],
 [4,'energia','Energía sostenible con generación propia','balance',R=>R.solarBal>=0&&R.solarWh>0],
 [4,'com','Comunicación a larga distancia','Estación de radioaficionado',R=>R.com.some(c=>['Estación de radioaficionado','Mensajero por satélite','Internet por satélite','Emisora CB 27 MHz'].includes(c))],
 [4,'evac','Red de apoyo organizada: quién ayuda a quién','red',R=>R.puntoExt],
 [4,'otros','Un kit para reparar y mantener cosas','otros',R=>R.reparar]];
/* N5 · Autosuficiente: criterios que se marcan con su prueba */
const N5C=[['agua','Agua: fuente propia o que se renueve (lluvia o pozo) y potabilización comprobada'],['comida','Comida: producción propia y conservación, cubriendo una parte demostrada de lo que coméis'],['energia','Energía: balance diario positivo comprobado varios días con cielo «a ratos»'],['cocina','Cocina que no depende de combustible comprado'],['higiene','Higiene, residuos y salud sin servicios externos, con la medicación crónica cubierta al máximo que permita el médico'],['hab','Habilidades de mantener y reparar'],['red','Red organizada'],['semana','Misión larga: una semana viviendo solo de lo propio']];
