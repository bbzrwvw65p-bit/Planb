/* Plan B v6 · Contenido (v4 + territorio España): preguntas del perfil, misiones por nivel y modo emergencia.
   Sin suposiciones: una respuesta sin contestar es undefined; «No lo sé» se guarda como '?'. */
'use strict';
const NS='?';
const ATR=[['rec','Recursos'],['hab','Habilidades'],['res','Resolución'],['rsp','Respuesta'],['rsl','Resiliencia'],['red','Red']];
const FR=[['agua','Agua'],['comida','Comida'],['energia','Energía'],['salud','Salud'],['com','Comunicaciones'],['seg','Seguridad'],['doc','Documentos y dinero'],['evac','Evacuación']];
const ATRN=Object.fromEntries(ATR),FRN=Object.fromEntries(FR);

/* ===== Países y números de emergencia ===== */
const PAISES=[['España','112'],['Portugal','112'],['Francia','112'],['Italia','112'],['Alemania','112'],['Irlanda','112 o 999'],['Andorra','112'],['Reino Unido','999 o 112'],['Estados Unidos','911'],['Canadá','911'],['México','911'],['Argentina','911'],['Colombia','123'],['Chile','131 ambulancia · 132 bomberos · 133 policía'],['Perú','106 SAMU · 116 bomberos · 105 policía'],['Ecuador','911'],['Uruguay','911'],['Venezuela','911'],['Otro','']];
const UE_PAISES=['España','Portugal','Francia','Italia','Alemania','Irlanda'];

/* ===== Preguntas =====
 ty: one | multi | num | text   · ex: opción exclusiva en multi · c: condición sobre el ámbito
 f: frente al que da XP averiguarla si se respondió «No lo sé» */
const RIESGOS=['Terremotos','Volcán','Incendios forestales','Ninguno especial'];
/* v6: temperaturas y fenómenos del tiempo, en dos preguntas */
const TEMPS=['Templado todo el año','Veranos muy calurosos','Inviernos muy fríos con heladas','Veranos muy calurosos e inviernos fríos'];
const FENOM=['Olas de calor','Calima o polvo en suspensión','Lluvias torrenciales o DANA','Viento fuerte o temporales','Nieve o hielo','Niebla densa','Humedad alta casi siempre','Sequía o restricciones de agua','Ninguno de estos'];
const CERCA_H='«Cerca» quiere decir a la vista o a menos de unos 15 minutos andando. Es un criterio práctico de Plan B, no oficial.';
const isY=v=>v==='Sí';
const HQ=[
{id:'casa',t:'Quién vive en casa',h:'Cada persona y cada animal tendrá su propia ficha.',q:[
 {k:'nper',l:'Personas que viven en casa (contándote)',ty:'num',min:1,max:12,f:'res'},
 {k:'animales',l:'¿Hay animales en casa?',ty:'one',o:['Sí','No'],f:'evac'},
 {k:'nmasc',l:'¿Cuántos?',ty:'num',min:1,max:10,c:h=>h.animales==='Sí',f:'evac'}],only:'onb'},
{id:'viv',t:'Vivienda',h:'Cómo es tu casa. Cambia cómo se guarda agua, cómo se sale y cuánto se puede almacenar.',q:[
 {k:'vivienda',l:'Tipo de vivienda',ty:'one',o:['Piso','Casa','Otra'],f:'evac'},
 {k:'planta',l:'¿En qué planta?',ty:'one',o:['Bajo','1.ª a 3.ª','4.ª o más'],c:h=>h.vivienda==='Piso',f:'evac'},
 {k:'ascensor',l:'¿Hay ascensor?',ty:'one',o:['Sí','No'],c:h=>h.vivienda==='Piso',f:'evac'},
 {k:'regimen',l:'Régimen',ty:'one',o:['Propiedad','Alquiler','Otro'],f:'doc'},
 {k:'exterior',l:'Espacio exterior',ty:'multi',o:['Terraza o balcón','Patio o jardín','Ninguno'],ex:'Ninguno',f:'seg'},
 {k:'trastero',l:'¿Trastero, garaje o sótano?',ty:'one',o:['Sí','No'],f:'comida'},
 {k:'almacen',l:'Espacio para guardar reservas',ty:'one',o:['Muy poco','Algo','Mucho'],f:'comida'}]},
{id:'zona',t:'Zona',h:'Dónde vives. Plan B usa la normativa y los teléfonos de España (112); lo demás te lo preguntamos.',q:[
 {k:'municipio',l:'Municipio o zona',ty:'text',ph:'Escríbelo como quieras',f:'evac'},
 {k:'entorno',l:'Entorno',ty:'one',o:['Urbano','Pueblo','Rural o aislado'],f:'evac'},
 {k:'isla',l:'¿Vives en una isla?',ty:'one',o:['Sí','No'],f:'comida'}]},
{id:'cerca',t:'¿Qué hay cerca?',h:'Lo que hay cerca decide qué emergencias te tocan. '+CERCA_H,q:[
 {k:'cerca',l:'¿Qué hay cerca de casa?',ty:'multi',o:['Costa','Barranco, río o rambla','Monte o zona forestal','Industria química o puerto','Aeropuerto','Nada de esto'],ex:'Nada de esto',hint:CERCA_H,f:'evac'},
 {k:'indPlan',l:'¿Te ha llegado información de su plan de emergencia?',ty:'one',o:['Sí','No'],c:h=>Array.isArray(h.cerca)&&h.cerca.includes('Industria química o puerto'),f:'seg'},
 {k:'inundable',l:'¿Tu casa está en zona inundable?',ty:'one',o:['Sí','No'],hint:'Puedes mirarlo en el visor oficial de zonas inundables (SNCZI). Si no lo sabes, marca «No lo sé».',link:'snczi',f:'evac'},
 {k:'hospital',l:'Hospital o urgencias más cercano',ty:'one',o:['Menos de 15 min','15 a 45 min','Más de 45 min'],f:'salud'},
 {k:'super',l:'Supermercado más cercano',ty:'one',o:['Menos de 15 min','15 a 45 min','Más de 45 min'],f:'comida'},
 {k:'carretera',l:'¿Se llega a tu casa por una sola carretera?',ty:'one',o:['Sí','No'],f:'evac'},
 {k:'riesgos',l:'Otros riesgos conocidos de tu zona',ty:'multi',o:RIESGOS,ex:'Ninguno especial',f:'seg'}]},
{id:'clima',t:'Clima',h:'El tiempo que hace donde vives activa avisos, escenarios y fichas.',q:[
 {k:'temp',l:'Temperaturas a lo largo del año',ty:'one',o:TEMPS,f:'salud'},
 {k:'fenom',l:'¿Qué fenómenos se dan en tu zona?',ty:'multi',o:FENOM,ex:'Ninguno de estos',f:'seg'}]},
{id:'serv',t:'Agua, luz, internet y móvil',h:'De dónde vienen tus suministros. No damos nada por hecho.',q:[
 {k:'agua',l:'¿De dónde llega el agua?',ty:'one',o:['Red municipal','Aljibe o depósito','Pozo','Otra'],f:'agua'},
 {k:'bomba',l:'¿Hay bomba de presión o de pozo?',ty:'one',o:['Sí','No'],f:'agua'},
 {k:'elec',l:'¿De dónde llega la electricidad?',ty:'multi',o:['Red eléctrica','Placas solares con batería','Generador','Sin electricidad'],ex:'Sin electricidad',f:'energia'},
 {k:'internet',l:'Internet en casa',ty:'multi',o:['Fibra o cable','Datos móviles','Satélite','Ninguno'],ex:'Ninguno',f:'com'},
 {k:'mismaComp',l:'¿Usáis todos la misma compañía de móvil?',ty:'one',o:['Sí','No'],c:h=>typeof h.nper==='number'&&h.nper>1,f:'com'}]},
{id:'cocina',t:'Cocina, agua caliente y frío',q:[
 {k:'cocina',l:'¿Con qué cocináis?',ty:'multi',o:['Eléctrica','Butano o propano','Gas natural','Leña','Solar'],f:'comida'},
 {k:'acs',l:'¿Con qué calentáis el agua?',ty:'multi',o:['Eléctrica','Butano o propano','Gas natural','Leña','Solar','No hay agua caliente'],ex:'No hay agua caliente',f:'energia'},
 {k:'nevera',l:'¿Hay nevera?',ty:'one',o:['Sí','No'],f:'comida'},
 {k:'congelador',l:'¿Hay congelador?',ty:'one',o:['Sí','No'],f:'comida'},
 {k:'sabeCuadro',l:'¿Sabes dónde está el cuadro eléctrico?',ty:'one',o:['Sí','No'],f:'seg'},
 {k:'sabeLlave',l:'¿Sabes dónde está la llave de paso del agua?',ty:'one',o:['Sí','No'],f:'agua'}]},
{id:'trans',t:'Transporte',h:'Si hay vehículos, cada uno tendrá su ficha.',q:[
 {k:'nveh',l:'¿Cuántos vehículos hay en casa?',ty:'num',min:0,max:8,f:'evac'},
 {k:'altern',l:'Otras formas de moverte',ty:'multi',o:['Transporte público','Bicicleta','A pie','Taxi','Ninguna'],ex:'Ninguna',f:'evac'}]},
{id:'dinero',t:'Dinero y papeles',q:[
 {k:'efectivo',l:'¿Hay efectivo en casa para emergencias?',ty:'one',o:['Sí','No'],f:'doc'},
 {k:'copias',l:'¿Copias de los documentos?',ty:'one',o:['En papel','Digitales','Ambas','No'],f:'doc'},
 {k:'seguro',l:'¿Seguro de hogar?',ty:'one',o:['Sí','No'],f:'doc'}]},
{id:'apoyo',t:'Red de apoyo',q:[
 {k:'vecinos',l:'¿Algún vecino de confianza?',ty:'one',o:['Sí','No'],f:'seg'},
 {k:'familia',l:'¿Familia o amigos cerca?',ty:'one',o:['Sí','No'],f:'evac'},
 {k:'punto',l:'Punto de encuentro acordado',ty:'text',ph:'Ej.: puerta del colegio',nada:'Aún no hay',f:'evac'},
 {k:'contactoExt',l:'Contacto fuera de la zona',ty:'text',ph:'Nombre y teléfono',nada:'Aún no hay',f:'com'},
 {k:'casaAlt',l:'¿Hay otra casa a la que ir?',ty:'one',o:['Sí','No'],f:'evac'}]},
{id:'pref',t:'Tus preferencias',h:'Para ajustar el ritmo y el gasto de las misiones.',q:[
 {k:'presupuesto',l:'Presupuesto al mes para esto',ty:'one',o:['Nada','Poco','Moderado','Amplio'],f:'doc'},
 {k:'tiempo',l:'Tiempo a la semana',ty:'one',o:['15 min','30 min','1 hora','Más'],f:'res'},
 {k:'preocupa',l:'Lo que más te preocupa',ty:'multi',o:['Apagones','Cortes de agua','Fallos de pagos','Ciberataques','Desastres naturales','Conflictos','Epidemias','Problemas de abastecimiento'],f:'seg'}]}];

const EDADES=['0–2','3–12','13–17','18–64','65+'];
const bebe=p=>p.edad==='0–2',nino=p=>p.edad==='0–2'||p.edad==='3–12',adulto=p=>p.edad==='18–64'||p.edad==='65+';
const PQ=[
{id:'p1',t:'Datos y salud',q:[
 {k:'alias',l:'Nombre o apodo',ty:'text',ph:'Como quieras llamarle',f:'res'},
 {k:'edad',l:'Edad',ty:'one',o:EDADES,f:'salud'},
 {k:'duerme',l:'¿Duerme en casa?',ty:'one',o:['Siempre','A veces'],f:'evac'},
 {k:'med',l:'Medicación diaria',ty:'one',o:['Ninguna','Sí'],f:'salud'},
 {k:'medFrio',l:'¿Alguna necesita nevera?',ty:'one',o:['Sí','No'],c:p=>p.med==='Sí',f:'salud'},
 {k:'aparato',l:'Aparatos médicos',ty:'one',o:['Ninguno','Sí, con electricidad','Sí, sin electricidad'],f:'energia'},
 {k:'alergias',l:'Alergias',ty:'text',ph:'Cuáles',nada:'Ninguna',f:'salud'},
 {k:'cronica',l:'¿Enfermedad crónica?',ty:'one',o:['No','Sí'],f:'salud'},
 {k:'movil',l:'Movilidad',ty:'one',o:['Sin limitación','Reducida','Silla de ruedas','Encamada'],f:'evac'},
 {k:'sentidos',l:'Vista y oído',ty:'multi',o:['Sin problemas','Ve mal','Oye mal'],ex:'Sin problemas',f:'com'},
 {k:'embarazo',l:'¿Embarazo o lactancia?',ty:'one',o:['No','Embarazo','Lactancia'],opt:true,c:p=>(p.edad==='13–17'||p.edad==='18–64')&&p.sexo!=='Hombre',f:'salud'}]},
{id:'pc',t:'Cuerpo (opcional)',h:'Todo es opcional: sirve para estimar el agua y la energía de cada persona. No va nunca en la tarjeta de Amigos y en la Unidad solo si su dueño lo marca al compartir.',q:[
 {k:'sexo',l:'Sexo',ty:'one',o:['Mujer','Hombre','Prefiero no decirlo'],opt:true,f:'salud'},
 {k:'edadN',l:'Edad exacta en años',ty:'n',min:18,max:110,unit:'años',opt:true,c:p=>p.edad==='18–64'||p.edad==='65+',f:'salud'},
 {k:'peso',l:'Peso aproximado',ty:'n',min:2,max:250,unit:'kg',opt:true,f:'salud'},
 {k:'altura',l:'Altura aproximada',ty:'n',min:40,max:230,unit:'cm',opt:true,f:'salud'}]},
{id:'p2',t:'Alimentación y rutina',q:[
 {k:'dieta',l:'Dieta',ty:'one',o:['Omnívora','Vegetariana','Vegana','Otra'],c:p=>!bebe(p),f:'comida'},
 {k:'lactante',l:'¿Cómo se alimenta?',ty:'multi',o:['Pecho','Leche de fórmula','Papillas o purés'],c:bebe,f:'comida'},
 {k:'intol',l:'Intolerancias o lo que no come',ty:'text',ph:'Ej.: sin gluten, lactosa',nada:'Nada',f:'comida'},
 {k:'cantidad',l:'¿Cuánto come?',ty:'one',o:['Poco','Normal','Mucho'],c:p=>!bebe(p),f:'comida'},
 {k:'ocup',l:'¿Dónde pasa el día?',ty:'one',o:['Trabaja fuera','Estudia fuera','En casa','Teletrabajo','Mixto'],c:p=>!bebe(p),f:'evac'},
 {k:'dist',l:'Distancia a ese sitio',ty:'one',o:['Menos de 2 km','2 a 10 km','10 a 30 km','Más de 30 km'],c:p=>p.ocup&&!['En casa','Teletrabajo',NS].includes(p.ocup),f:'evac'},
 {k:'horario',l:'Horario',ty:'one',o:['Mañana','Tarde','Noche','Turnos','Variable'],c:p=>p.ocup&&!['En casa',NS].includes(p.ocup),f:'evac'},
 {k:'transp',l:'¿Cómo va?',ty:'multi',o:['A pie','Coche o moto','Transporte público','Bicicleta','Le llevan'],c:p=>p.ocup&&!['En casa','Teletrabajo',NS].includes(p.ocup),f:'evac'},
 {k:'fuera',l:'Tiempo fuera de casa',ty:'one',o:['Casi nada','Media jornada','Jornada completa','Días seguidos'],c:p=>!bebe(p),f:'evac'}]},
{id:'p3',t:'Comunicación y habilidades',c:p=>!nino(p)||p.edad===undefined||p.edad===NS,q:[
 {k:'tieneMovil',l:'¿Tiene móvil?',ty:'one',o:['Sí','No'],f:'com'},
 {k:'walkie',l:'¿Sabe usar un walkie?',ty:'one',o:['Sí','No'],f:'com'},
 {k:'contacto',l:'¿A quién llamaría primero?',ty:'text',ph:'Nombre y teléfono',f:'com'},
 {k:'habil',l:'Sabe…',ty:'multi',o:['Primeros auxilios','Nadar','Conducir','Cocinar sin luz','Cortar agua y luz','Usar los equipos de casa','Nada de esto'],ex:'Nada de esto',hint:'Solo informativo: no da puntos. Las habilidades puntúan en Guía · Cómo se hace, con práctica y un test corto.',f:'seg'},
 {k:'limit',l:'Limitaciones',ty:'multi',o:['No puede cargar peso','No puede subir escaleras','Ansiedad o miedos fuertes','Ninguna'],ex:'Ninguna',f:'salud'},
 {k:'impres',l:'Imprescindibles que debe tener a mano',ty:'text',ph:'Gafas, audífono, prótesis…',nada:'Nada',f:'salud'}]},
{id:'p3n',t:'Comunicación y cuidados',c:p=>nino(p)&&p.edad!==undefined&&p.edad!==NS,q:[
 {k:'contacto',l:'¿A quién avisar si le pasa algo fuera?',ty:'text',ph:'Nombre y teléfono',f:'com'},
 {k:'habil',l:'Sabe…',ty:'multi',o:['Nadar','Decir su dirección y un teléfono','Nada de esto'],ex:'Nada de esto',c:p=>p.edad==='3–12',f:'seg'},
 {k:'limit',l:'Limitaciones',ty:'multi',o:['Ansiedad o miedos fuertes','Necesita que le lleven en brazos','Ninguna'],ex:'Ninguna',f:'salud'},
 {k:'impres',l:'Imprescindibles que debe tener a mano',ty:'text',ph:'Chupete, peluche, gafas…',nada:'Nada',f:'salud'}]}];
const VEH_TIPO=['Coche','Moto','Furgoneta','Otro'],VEH_MOTOR=['Gasolina o diésel','Híbrido','Híbrido enchufable','Eléctrico'],VEH_NIVEL=['Casi vacío','Por la mitad','Casi lleno'];
const VQ=[{id:'v1',t:'Ficha del vehículo',q:[
 {k:'tipo',l:'Tipo',ty:'one',o:VEH_TIPO,f:'evac'},
 {k:'motor',l:'¿Qué lo mueve?',ty:'one',o:VEH_MOTOR,f:'evac'},
 {k:'dep',l:'¿Cómo suele estar el depósito?',ty:'one',o:VEH_NIVEL,c:v=>v.motor!=='Eléctrico',f:'evac'},
 {k:'bat',l:'¿Cómo suele estar la batería?',ty:'one',o:VEH_NIVEL,c:v=>v.motor==='Eléctrico'||v.motor==='Híbrido enchufable',f:'energia'}]}];
const MQ=[{id:'m1',t:'Ficha del animal',q:[
 {k:'nombre',l:'Nombre',ty:'text',ph:'Su nombre',f:'evac'},
 {k:'especie',l:'Especie',ty:'one',o:['Perro','Gato','Ave','Otro'],f:'evac'},
 {k:'peso',l:'Peso',ty:'one',o:['Menos de 5 kg','5 a 15 kg','15 a 30 kg','Más de 30 kg'],f:'agua'},
 {k:'comida',l:'Comida',ty:'one',o:['Pienso seco','Comida húmeda','Dieta especial','Otra'],f:'comida'},
 {k:'medm',l:'¿Medicación?',ty:'one',o:['No','Sí'],f:'salud'},
 {k:'transportin',l:'¿Transportín o correa para sacarlo?',ty:'one',o:['Sí','No','No le hace falta'],f:'evac'}]}];

/* ===== Fuentes ===== */
const S={UE:'UE · Estrategia de la Unión de Preparación (2025)',PC:'Protección Civil',CR:'Cruz Roja',FE:'FEMA / Ready.gov',OMS:'OMS',CDC:'CDC',SAN:'Ministerio de Sanidad',USDA:'USDA / FoodSafety.gov',EFSA:'EFSA (energía de referencia)',EFSAW:'EFSA · Valores dietéticos de referencia para el agua (2010)',EFSAE:'EFSA · Valores dietéticos de referencia para la energía (2013)',MSJ:'Mifflin y St Jeor, Am J Clin Nutr 1990;51:241-7',ARC:'Cruz Roja Americana',SHK:'FEMA · Agáchate, cúbrete, agárrate',UIT:'Normativa nacional de radioaficionados',GEN:'Guía general, sin cifra oficial'};

/* ===== Niveles ===== */
const NIV=[
 {t:'72 horas',o:'Aguantar tres días en casa sin ayuda de fuera.',src:'Recomendación de la UE (Estrategia de la Unión de Preparación, 2025) y de Protección Civil.'},
 {t:'2 semanas',o:'Vivir 14 días sin comprar ni depender de la red.',src:'Cruz Roja Americana y CDC: reserva de 2 semanas en casa.'},
 {t:'1 mes',o:'Una crisis larga: despensa rotativa, salud, dinero y barrio.',src:'Extensión de las guías oficiales; no hay cifra oficial de 1 mes.'},
 {t:'3 meses o más',o:'Resiliencia: habilidades, autosuficiencia parcial y comunidad.',src:'Avanzado, no oficial: viene de la comunidad de preparación, no de organismos públicos.',adv:true}];
const RANGOS=['Iniciado','Aspirante','Preparado','Consolidado'];

/* ===== Misiones =====
 ty: i = registro (prueba en el registro) · s = saber hacer (lo has hecho tú) · d = simulacro · x = examen (simulacro del nivel)
 a: atributos (1–2) · f: frente · min: duración · tm: cronómetros [clave, qué se mide, objetivo en s] · c: se muestra si devuelve true */
const c=(b,s)=>b?s:'';
const M=(k,lv,t,ty,a,f,min,src,w,o,more)=>Object.assign({k,lv,t,ty,a,f,min,src,w,o},more||{});
const L=x=>x.n?`${x.Ltot} L`:`${x.Lpp} L por persona`;
const CUR=[
/* ---------- NIVEL 1 · 72 h ---------- */
M('luz',1,'Luz','i',['rec','rsl'],'energia',20,[S.PC,S.UE],
 x=>'Si se va la corriente de noche, lo primero que pierdes es moverte por casa con seguridad. El móvil no cuenta: su batería es para comunicarte.'+c(x.anyMov,' Con alguien de movilidad reducida, una luz junto a su cama evita caídas.')+c(x.anyKid,' Los niños se asustan menos con una luz propia.'),
 x=>`Localiza cada linterna o frontal de casa, enciéndela y comprueba que funciona. Lo ideal es una por persona${x.n?` (${x.n})`:''}, con pilas de repuesto. Anota modelo, pilas o carga y ubicación exacta.`,
 {tm:[['luz','Encontrar luz con la casa a oscuras',60,5]]}),
M('cuadro',1,'Cuadro eléctrico y llave de paso','s',['hab','res'],'seg',20,[S.PC,S.FE],
 x=>'Saber cortar la luz o el agua en segundos evita daños en una fuga, un cortocircuito o al volver la corriente (los picos estropean aparatos).'+c(x.piso,' En un piso, la llave de paso puede estar en la cocina, el baño o el rellano.')+c(x.h.sabeCuadro==='No'||x.h.sabeLlave==='No',' Dijiste que aún no sabes dónde está alguno: esta misión es para eso.'),
 x=>'Encuentra el cuadro eléctrico y la llave de paso. Baja y sube el interruptor general y cierra y abre la llave tú mismo. Pega una etiqueta con lo que hace cada uno.'+c(x.gasCanal,' Localiza también la llave del gas.'),
 {tm:[['corte','Cortar la luz general y cerrar el agua',90,10]],c:x=>!x.sinElec||x.aguaRedLike}),
M('agua',1,'Agua para 72 horas','i',['rec'],'agua',30,[S.PC,S.FE],
 x=>`Para beber hacen falta al menos 1,5 L por persona y día (Protección Civil). Para beber, cocinar e higiene básica, unos 4 L (FEMA: 1 galón).${c(x.calor,' Con calor, la parte que se bebe puede doblarse (Ready.gov): contamos 6 L en total por persona.')}${c(x.anyPreg,' En embarazo se suman 0,3 L y en lactancia 0,7 L al día (EFSA).')} ${x.n?`Para tu hogar: ${x.Lday} L al día${x.petL?` (incluye ${x.petL} L para los animales)`:''}, ${x.Lday*3} L para 72 h.`:'Aún no sabemos cuántos sois: calcula por persona.'}`+c(x.bombaRisk,' Tu agua depende de una bomba: sin luz puede que no salga nada del grifo.')+c(x.anyFormula,' La leche de fórmula se prepara con agua: cuenta también esa.')+c(x.alto,' Sin ascensor o en planta alta, mejor garrafas de 5 L que puedas subir.'),
 x=>`Reúne ${x.n?x.Lday*3+' L':(x.Lpp*3)+' L por persona'} de agua embotellada en un sitio fresco y oscuro. Anota litros, ubicación y caducidad.`,{q:x=>x.Lday*3}),
M('comida',1,'Comida que no necesita cocinar','i',['rec'],'comida',30,[S.UE,S.PC,S.FE],
 x=>(x.cocinaElec?'Cocinas con electricidad: si se va la luz, no hay comida caliente. ':x.cocinaKnown?'Aunque cocines sin electricidad, en una emergencia lo más fiable es comida que no necesita fuego. ':'En una emergencia lo más fiable es comida que se come tal cual. ')+`La UE recomienda poder aguantar 72 h con reservas propias, y Ready.gov aconseja comida que no necesite nevera, cocina ni preparación.${x.kcal?` Para tu hogar son unas ${x.kcal.toLocaleString('es-ES')} kcal al día (orientativo, no oficial).`:''}`+x.dietTxt+c(x.anyBaby,' Para el bebé: su leche o papillas para 3 días.')+c(x.pets.length,' Y 3 días de comida para los animales.'),
 x=>`Junta comida para 3 días para ${x.quien} que se coma sin cocinar ni nevera, y un abrelatas manual. Anota cantidad en raciones (persona·día), ubicación y caducidad.`),
M('nevera',1,'Nevera y congelador en un corte','s',['hab','res'],'comida',15,[S.USDA,S.FE],
 x=>'Con la puerta cerrada, la nevera mantiene el frío unas 4 horas; un congelador lleno, unas 48 h (24 h si está a medias). Lo perecedero que pase 2 horas o más por encima de 4 °C se tira.'+c(x.medFrio,` ${x.medFrioQ} toma medicación que necesita frío: si el corte dura más de un día, consulta su prospecto o a la farmacia (Ready.gov).`)+c(x.h.nevera===NS||x.h.congelador===NS,' Aún no nos has dicho si hay nevera o congelador.'),
 x=>'Decide con tu hogar la regla: en un corte, nevera y congelador no se abren. Pega en la nevera una nota con qué se come primero y la regla de las 2 horas a más de 4 °C. Que lo sepas explicar tú.'+c(x.medFrio,' Ten una nevera portátil y acumuladores de frío para la medicación.'),
 {c:x=>!(x.h.nevera==='No'&&x.h.congelador==='No')}),
M('movil',1,'Energía para el móvil','i',['rec','rsl'],'com',20,[S.UE,S.FE],
 x=>'El móvil es tu enlace con familia y avisos. Una batería externa cargada da varios días de margen si lo usas poco.'+c(x.vehElec,' No cuentes con el coche eléctrico como fuente de reserva: puede no tener carga.')+c(x.vehComb,' El cargador de coche sirve de plan secundario, al aire libre y con combustible.')+c(x.solar,' Tus placas con batería ayudan, pero una batería pequeña sigue siendo útil si hay que salir.')+c(x.mismaComp,' Usáis todos la misma compañía: si falla su red, os quedáis sin móvil a la vez. Una segunda línea de otra compañía (por ejemplo en eSIM, si vuestros móviles lo admiten) sirve de respaldo.'),
 x=>`Carga al 100 % una batería externa y comprueba que carga ${x.moviles>1?'los móviles de casa':'tu móvil'} con su cable. Anota capacidad (mAh o Wh), ubicación y fecha de carga.`),
M('radio',1,'Información: radio','i',['rec','rsl'],'com',15,[S.PC,S.UE],
 x=>'Si caen la luz y las redes, la radio sigue dando los avisos oficiales.'+c(x.rural||x.isla,' En tu entorno puede ser la única fuente fiable durante horas.')+c(x.anyDeaf,' Alguien de casa oye mal: acordad cómo le pasaréis los avisos.'),
 ()=>'Consigue o localiza una radio a pilas o de dinamo, sintoniza una emisora local y apunta su frecuencia en un papel junto a la radio.'),
M('botiquin',1,'Botiquín básico','i',['rec'],'salud',20,[S.CR],
 x=>'En una emergencia suben los pequeños accidentes en casa y la farmacia puede estar cerrada.'+c(x.hospLejos,' Tu hospital está a más de 45 min.')+c(x.anyKid,' Con niños: antitérmico infantil y termómetro. Apunta junto al botiquín la dosis por peso que te haya indicado su pediatra; Plan B nunca la calcula.')+c(x.allergyTxt,' Alergias en casa: '+x.allergyTxt+'.'),
 ()=>'Revisa tu botiquín: gasas estériles, vendas, esparadrapo, tiritas, antiséptico, suero fisiológico, guantes, tijeras, pinzas, termómetro y analgésico. Anota dónde está y lo que caduca antes.'),
M('medicacion',1,'Medicación','i',['rec','res'],'salud',20,[S.ARC,S.FE],
 x=>(x.medN?`${x.medQ} ${x.medN>1?'toman':'toma'} medicación diaria. Cruz Roja Americana recomienda reserva para 7 días y una lista con nombre, dosis y alergias.`:x.medUnknown?'Aún no sabemos si alguien toma medicación diaria.':'Nadie toma medicación diaria según tus respuestas, pero conviene una lista de alergias y de lo que se toma a veces.')+c(x.medFrio,' Alguna necesita frío: plan con nevera portátil.'),
 x=>x.medN?'Ten reserva de 7 días de cada medicación diaria y una lista en papel con nombre, dosis, médico y alergias de cada persona. Anótalo en el registro con su caducidad.':'Haz una lista en papel con alergias y medicación ocasional de cada persona, y guárdala con el botiquín. Anótalo en el registro.'),
M('medelec',1,'Aparato médico sin luz','i',['rsl','res'],'salud',30,[S.FE,S.CR],
 x=>`${x.elecDevQ} usa un aparato médico eléctrico. Un apagón no puede dejarle sin él.`,
 ()=>'Apunta el consumo del aparato (W) y cuántas horas lo necesita al día. Consigue una batería o alternativa que lo cubra 72 h, y avisa a tu compañía eléctrica y a tu centro de salud de que dependéis de él. Anótalo.',{c:x=>x.elecDev}),
M('sanea',1,'Váter e higiene sin agua','i',['rsl','rec'],'salud',15,[S.FE,S.OMS],
 x=>'Sin agua corriente, el váter deja de funcionar en la primera descarga. Es un problema de salud, no de comodidad.'+c(x.bombaRisk,' Si tu agua depende de una bomba, pasará en cuanto se vaya la luz.')+c(x.anyBaby,' Con bebé: pañales y toallitas para 3 días.'),
 ()=>'Prepara un kit de bolsas resistentes, bridas y algo absorbente (serrín o arena) para el váter, más toallitas y gel. Anota dónde está.'),
M('termico',1,'Calor y frío sin luz','i',['rsl','rec'],'salud',20,[S.SAN,S.FE],
 x=>(x.calor&&x.frio?'En tu zona hay calor y frío intensos.':x.calor?'Sin aire ni ventilador, el calor es un riesgo serio, sobre todo para mayores, bebés y enfermos.':x.frio?'Sin calefacción la casa se enfría rápido; el frío es peligroso de noche.':'Una noche sin calefacción o un día de calor sin ventilador se nota.')+c(x.anyOld||x.anyBaby,' En casa hay personas más sensibles a la temperatura.')+c(x.lenaHeat,' La leña calienta sin red, pero exige ventilación y detector de CO.'),
 x=>x.calor&&!x.frio?'Prepara un plan fresco: ventilador a pilas o USB, agua extra y la habitación más fresca elegida. Anota qué tienes y dónde.':'Prepara mantas o sacos para cada persona y elige la habitación que mejor guarda el calor'+c(x.calor,'; para el calor, ventilador a pilas y la habitación más fresca')+'. Anota qué tienes y dónde.'),
M('seguridad',1,'Fuego y monóxido (CO)','s',['hab','res'],'seg',20,[S.CDC,S.FE],
 x=>'En los apagones muchos sustos vienen de velas, braseros, hornillos o generadores: el monóxido de carbono no huele y mata. Generadores y hornillos, siempre fuera y a más de 6 m de puertas y ventanas (CDC).'+c(x.combustion,' Cocinas o calientas con llama: ventila siempre y ten detector de CO.'),
 ()=>'Repasa con tu hogar las reglas: velas nunca sin vigilar, nada de braseros, hornillos ni generadores dentro de casa. Comprueba si tienes extintor y detector de humo y de CO, y que funcionan. Cómo usar el extintor y qué hacer si huele a gas: «Cómo se hace». Que lo sepas explicar tú.'),
M('efectivo',1,'Efectivo','i',['rsl','rec'],'doc',10,[S.UE,S.FE],
 x=>'Sin luz o sin red no funcionan datáfonos ni cajeros.'+c(x.superLejos||x.isla,' En tu zona reabastecerse tarda más, así que el efectivo da margen.')+c(x.h.efectivo==='Sí',' Dijiste que tienes: aquí lo verificas.'),
 ()=>'Guarda efectivo en billetes pequeños y monedas para unos días de compras básicas, en un sitio que sepan los adultos. Anota dónde está (la cantidad es opcional).'),
M('documentos',1,'Documentos','i',['rec','rsl'],'doc',20,[S.UE,S.PC],
 x=>'Si tienes que salir con prisa, poder demostrar quién eres o tener la tarjeta sanitaria evita problemas.'+c(x.h.seguro==='Sí',' Incluye la póliza del seguro de hogar.'),
 x=>'Haz fotocopias del documento de identidad'+c(x.n>1,' de cada persona')+', tarjeta sanitaria y pólizas, y una lista de teléfonos clave en papel. Guárdalo en una funda estanca y anota dónde está.'),
M('plan',1,'Plan del hogar','s',['red','res'],'evac',30,[S.PC,S.FE],
 x=>{const r=x.riskList;return 'Si pasa algo y no hay cobertura, todos deben saber dónde reunirse y a quién llamar.'+c(r.length,' Por dónde vives, ten en cuenta: '+r.join(', ')+'.')+c(x.helpQ,` Decide quién ayuda a ${x.helpQ} y cómo.`)+c(x.awayQ,` ${x.awayQ} pasa mucho tiempo fuera: incluye cómo volver o dónde esperar.`)+c(x.emer,` Número de emergencias: ${x.emer}.`)},
 x=>(x.n===1?'Elige':'Acordad')+' un punto de encuentro cerca de casa y otro fuera del barrio, y escribe en papel tres teléfonos clave y el número de emergencias.'+c(x.n>1,' Que cada persona lo lleve encima.')+' Apúntalo también en tu perfil.'),
M('simulacro',1,'Simulacro: tarde sin luz','x',['res','hab'],'energia',300,[S.PC,S.UE],
 x=>'Es el examen del nivel: vivir unas horas sin luz enseña más que cualquier lista. Se mide tu respuesta con tiempos reales.'+c(x.medFrio,' Antes, saca la medicación que necesita frío a una nevera portátil.')+c(x.elecDev,' No cortes la luz al aparato médico: usa su batería o déjalo fuera del simulacro.'),
 x=>`Una tarde, ${x.sinElec?'pasa 4 a 6 horas sin usar ningún aparato':'baja el interruptor general durante 4 a 6 horas'}${x.h.nevera==='Sí'?', con la nevera cerrada':''}. Cronometra: encontrar luz a oscuras, localizar a todos${x.n===1?' (o a tu contacto)':''} y cerrar el agua. Al terminar, anota lo que mejorarías.`,
 {tm:[['luz','Encontrar luz con la casa a oscuras',60,5],['todos','Localizar o reunir a todos',600,15],['agua','Cerrar la llave de paso',90,5]]}),
/* ---------- NIVEL 2 · 2 semanas ---------- */
M('agua14',2,'Agua para 2 semanas','i',['rec'],'agua',30,[S.ARC,S.CDC],
 x=>`Cruz Roja Americana y los CDC recomiendan reserva de 2 semanas en casa. ${x.n?`Son ${x.Lday*14} L para tu hogar.`:`Son ${x.Lpp*14} L por persona.`} Se llega poco a poco.`+c(x.alto,' En planta alta, garrafas manejables repartidas.')+c(x.aljibe,' Tu aljibe o pozo es una gran reserva si puedes sacar agua sin bomba.')+c(x.almacenPoco,' Tienes poco espacio: busca huecos bajo camas y armarios.'),
 x=>`Almacena al menos la mitad (${x.n?Math.round(x.Lday*7)+' L':x.Lpp*7+' L por persona'}) en garrafas cerradas en un sitio fresco. Anota litros, ubicación y fecha.`,{q:x=>x.Lday*14}),
M('tratar',2,'Potabilizar agua','s',['hab','rsl'],'agua',30,[S.OMS,S.CDC,'Salud Pública de Navarra'],
 ()=>'Si se acaba el agua segura, tienes que poder hacer potable otra: hervir, desinfectar o filtrar.',
 ()=>'Aprende y prueba un método con 1 litro: hervir a borbotones 1 minuto (3 min por encima de 2.000 m), o lejía apta para agua de bebida (sin perfume ni detergente): la dosis de su etiqueta; si no la indica, con lejía de 40 g de cloro por litro, 1 gota por litro de agua clara (con 20 g/L, 2 gotas), mezclar y esperar 30 min; si está turbia, fíltrala antes y, si no puedes, usa el doble. Pasos en «Cómo se hace». Hazlo tú.'),
M('despensa14',2,'Despensa de 2 semanas','i',['rec'],'comida',40,[S.ARC],
 x=>'Dos semanas de comida que ya coméis, no comida rara que nadie toca.'+x.dietTxt+c(x.isla,' En una isla el reabastecimiento llega en barco: un temporal o un problema en el puerto vacía estantes en días.')+c(x.kcal,` Unas ${(x.kcal*14).toLocaleString('es-ES')} kcal en total (orientativo).`),
 x=>`Completa comida para 14 días para ${x.quien} con lo que coméis normalmente. Anota lo principal en raciones, ubicación y caducidad.`),
M('fifo',2,'Rotación de la despensa','s',['hab','res'],'comida',20,[S.FE],
 ()=>'Una despensa que no rota caduca. Lo primero que entra es lo primero que sale.',
 ()=>'Ordena la despensa con lo más antiguo delante y marca las fechas en grande. Usa algo de ella esta semana y repón detrás.'),
M('cocinar',2,'Cocinar sin red','i',['rsl','rec'],'comida',30,[S.FE,S.CDC],
 x=>(x.cocinaElec&&!x.cocinaLlama?'Cocinas con electricidad: sin red no hay comida caliente.':x.cocinaLlama?'Ya cocinas sin red eléctrica: asegúrate de tener combustible para 2 semanas.':'Necesitas una forma de calentar comida sin red.')+' Un hornillo de camping se usa solo al aire libre: el CO mata.'+c(x.piso&&x.terraza,' En un piso, en el balcón o la terraza, nunca dentro.'),
 x=>x.lena?'Comprueba que tienes leña seca para 2 semanas y una forma de encender sin electricidad. Anota cantidad y ubicación.':x.cocinaLlama?'Comprueba que tienes bombonas o combustible de repuesto para 2 semanas. Anota cantidad y ubicación.':'Ten un hornillo con cartuchos de repuesto y pruébalo una vez al aire libre. Anota modelo, cartuchos y ubicación.'),
M('energia2',2,'Energía para varios días','i',['rsl','rec'],'energia',40,[S.UE,S.FE],
 x=>'Más allá del móvil: luz, radio y carga durante días.'+c(x.solar,' Ya tienes placas con batería: comprueba cuántos días cubre lo esencial.')+c(x.vehElec,' El coche eléctrico no es tu plan de energía.')+c(x.elecDev,' Incluye el consumo del aparato médico.'),
 x=>x.solar?'Mide cuántas horas aguanta tu batería solar con lo esencial y sin sol, y anota capacidad (Wh).':'Consigue una estación de energía portátil o un panel solar pequeño con batería y comprueba que carga tus aparatos. Anota capacidad en Wh y ubicación.'),
M('higiene',2,'Higiene y residuos','i',['rec','rsl'],'salud',20,[S.FE,S.OMS],
 x=>'Dos semanas sin servicios normales: la higiene evita enfermedades.'+c(x.anyBaby,' Pañales y toallitas para 2 semanas.')+c(x.anyPreg,' Productos de lactancia o embarazo.'),
 ()=>'Reúne jabón, gel hidroalcohólico, toallitas, bolsas de basura resistentes y productos de higiene para 14 días. Anota qué tienes y dónde.'),
M('auxilios',2,'Primeros auxilios básicos','s',['hab'],'salud',60,[S.CR],
 x=>'Un botiquín sin saber usarlo es medio botiquín.'+c(x.hospLejos,' Con el hospital lejos, saber actuar es clave.')+c(x.faKnown,` ${x.faKnown} ya sabe primeros auxilios: practicad juntos.`),
 ()=>'Haz un curso básico de primeros auxilios (Cruz Roja u otra entidad acreditada) y practica una RCP y una cura. Mientras tanto, los pasos de RCP, posición lateral de seguridad, atragantamiento, hemorragias y quemaduras están en «Cómo se hace». Solo cuenta si lo has hecho tú.'),
M('botiquin2',2,'Botiquín ampliado','i',['rec'],'salud',20,[S.CR],
 x=>'Para dos semanas sin farmacia, el botiquín básico se queda corto.'+c(x.medN,' Medicación diaria: Cruz Roja Americana recomienda 7 días de reserva; para este nivel de 2 semanas, intenta llegar a 14 días si tu médico o tu farmacia lo permiten (propuesta de Plan B, no oficial).'),
 ()=>'Añade vendas, suero oral, antidiarreico, pinzas, guantes, manta térmica y un manual de primeros auxilios en papel. Anota lo que añades y su caducidad.'),
M('walkies',2,'Comunicaciones sin red','i',['red','rsl'],'com',30,[S.PC,S.FE],
 x=>'Si cae la red móvil, hace falta otra forma de hablar y un plan de quién llama a quién.'+c(x.rural,' En zona rural los walkies tienen menos alcance por el relieve.')+c(x.satInternet,' Tu internet por satélite ayuda si hay energía, pero no cubre fuera de casa.')+c(x.mismaComp,' Todos usáis la misma compañía de móvil: es un punto débil. Valorad una eSIM o una línea de otra compañía como respaldo. El 112 entra por cualquier red disponible.'),
 x=>`Ten un par de walkies ${x.eu?'PMR446 (uso libre en la UE)':x.us?'FRS (uso libre en EE. UU.)':'de uso libre según la normativa de tu país'}, pruébalos entre habitaciones y acordad un canal. Anótalo.`,{c:x=>x.n!==1||x.h.vecinos==='Sí'||x.h.familia==='Sí'}),
M('vecinos',2,'Vecinos y red de apoyo','s',['red'],'seg',30,[S.CR,S.UE],
 x=>'En las primeras horas de una crisis la ayuda más cercana son los vecinos.'+c(x.helpQ,' Con alguien que necesita ayuda en casa, un vecino de confianza cambia mucho.')+c(x.rural,' En zona rural el vecino más cercano puede estar lejos: acordadlo antes.')+c(x.n===1,' Vives solo: es tu primera red.'),
 ()=>'Habla con al menos un vecino o persona cercana: intercambiad teléfonos y acordad avisaros en una emergencia. Hazlo tú.'),
M('mochila',2,'Mochila de emergencia','i',['rec','res'],'evac',40,[S.UE,S.CR,S.FE],
 x=>`Si hay que salir de casa no hay tiempo de hacer maletas. Una por persona${x.n?` (${x.n})`:''}.`+c(x.medN,' Con la medicación dentro.')+c(x.imprTxt,' Imprescindibles: '+x.imprTxt+'.')+c(x.volc,' En zona volcánica: mascarillas FFP2 y gafas para la ceniza.'),
 ()=>'Prepara una mochila de 72 h por persona: agua, comida, linterna, radio, botiquín, copia de documentos, ropa, efectivo y cargador. Anótala en el registro.'),
M('mascotas',2,'Animales','i',['rec','res'],'evac',30,[S.FE],
 x=>`En una evacuación ${x.petNames} también necesita${x.pets.length>1?'n':''} su plan: comida, agua, transportín o correa y cartilla.`+c(x.petMed,' Y su medicación.'),
 ()=>'Prepara un kit de 3 días por animal con transportín o correa, comida, agua y cartilla. Anota dónde está.',{c:x=>x.pets.length>0}),
M('vehiculo',2,'Vehículo listo','i',['rec','rsl'],'evac',20,[S.FE],
 x=>'Si hay que irse, un depósito vacío o una batería baja te deja atrapado.'+c(x.vehBajo,' Según tus respuestas suele ir casi vacío: '+x.vehBajo+'.')+c(x.vehElec,' En un apagón los puntos de carga no funcionan: la batería que tengas es la que hay.')+c(x.vehComb,' Sin luz, las gasolineras pueden no poder servir.')+c(x.unaCarretera,' Tu casa tiene una sola carretera de acceso: sal pronto si avisan.'),
 x=>`Acostúmbrate a no bajar de la mitad en cada vehículo: ${x.vehPlan||'medio depósito o la mitad de la batería'}. Deja en cada uno agua, linterna, manta y cargador. Anótalo en el registro.`,{c:x=>x.vehs}),
M('evacuacion',2,'Rutas de evacuación','s',['res','hab'],'evac',60,[S.PC],
 x=>{const r=x.routeTips;return 'Saber por dónde salir antes de necesitarlo.'+c(r.length,' Según tus riesgos: '+r.join('; ')+'.')+c(x.anyMov,' La ruta tiene que poder hacerla quien tiene movilidad reducida.')+c(x.h.nveh===0,' Sin vehículo: planifica a pie o en transporte público.')+c(x.unaCarretera,' Con una sola carretera, busca una salida alternativa a pie.')+c(x.ind&&x.h.indPlan!=='Sí',' Tienes cerca una industria química o un puerto: pregunta en tu ayuntamiento o en Protección Civil por su plan de emergencia exterior, que dice cómo avisan y qué hacer.')+c(x.h.inundable==='Sí',' Tu casa está en zona inundable: la ruta tiene que llevar a zonas altas.')},
 x=>`Elige dos rutas de salida de tu zona y recórrelas al menos una vez ${x.vehs?'a pie o en vehículo':'a pie o en transporte público'}. Apúntalas en el plan del hogar.`),
M('digital',2,'Copias digitales cifradas','i',['rsl'],'doc',30,[S.UE],
 ()=>'Si se pierden los papeles, una copia cifrada y sin nube permite rehacerlo todo.',
 ()=>'Escanea los documentos clave y guárdalos cifrados en un pendrive con contraseña que sepáis, sin subirlos a ninguna nube. Anota dónde está.'),
M('evacsim',2,'Simulacro: salir de casa','d',['res'],'evac',30,[S.PC,S.FE],
 x=>'Lo que no se practica no sale bien con prisa. Mide cuánto tardáis en salir con lo necesario.'+c(x.pets.length,' Con los animales incluidos.')+c(x.anyMov||x.anyBaby,' Con quien necesita ayuda para salir.'),
 x=>`Sin avisar antes, da la señal y cronometra hasta que ${x.n===1?'estés':'estéis todos'} fuera con las mochilas${x.pets.length?', los animales':''} y la puerta cerrada. Después id al punto de encuentro.`,{tm:[['salir','Salir de casa con las mochilas',600,30]]}),
M('semanadespensa',2,'Examen: semana de despensa','x',['res','rsl'],'comida',600,[S.FE,S.UE],
 ()=>'Examen del nivel: demostrar que tu despensa y tu agua funcionan en la vida real.',
 ()=>'Durante 7 días, comed solo de vuestra despensa y reserva, sin ir a comprar. Un día, cronometra encontrar a oscuras el botiquín y la radio. Anota qué faltó y repón.',{tm:[['buscar','Encontrar botiquín y radio a oscuras',120,10]]}),
/* ---------- NIVEL 3 · 1 mes ---------- */
M('inventario',3,'Despensa de 1 mes e inventario','i',['rec','res'],'comida',60,[S.FE],
 x=>'Un mes solo funciona con inventario: sabes qué hay, cuánto y cuándo caduca.'+x.dietTxt+c(x.isla,' En una isla, una crisis de transporte marítimo puede durar semanas.')+c(x.almacenPoco,' Con poco espacio, prioriza lo más calórico por volumen: legumbres, arroz, aceite, frutos secos.'),
 ()=>'Crea un inventario de la despensa y amplía hacia un mes de básicos: legumbres, arroz, pasta, aceite, conservas. Anota raciones y caducidades.'),
M('lluvia',3,'Agua alternativa','i',['rsl'],'agua',60,[S.OMS],
 x=>x.aljibe?'Tu aljibe o pozo es una reserva enorme si puedes sacar agua sin bomba y mantenerla limpia.':'Recoger agua de lluvia, donde esté permitido, da agua para limpieza y váter. Para beber hay que potabilizarla.',
 x=>x.aljibe?'Revisa la limpieza del depósito o pozo y prepara una forma manual de sacar agua (bomba manual o cubo). Anótalo.':'Ten bidones extra o una recogida de lluvia sencilla si tu municipio lo permite. Anótalo.',{c:x=>x.aljibe||x.exteriorSi||x.casa}),
M('medcronica',3,'Salud para un mes','i',['res','rec'],'salud',30,[S.SAN,S.FE],
 x=>(x.medN?'Para un mes, la medicación diaria necesita un plan hablado con el médico.':'La salud que se descuida en tiempos normales se complica en una crisis larga.')+c(x.cronN,' Hay enfermedad crónica en casa.')+c(x.hospLejos,' Con el hospital lejos, más aún.'),
 x=>x.medN?'Pregunta a tu médico cómo tener una reserva legal de la medicación diaria y anótala con caducidad. Ten copia de los informes.':'Revisa con tu médico o farmacia qué conviene tener en casa y haz las revisiones pendientes (dentista, vista).'),
M('energia3',3,'Energía robusta','i',['rsl'],'energia',60,[S.UE],
 x=>'Para semanas, la energía tiene que recargarse sola.'+c(x.calor,' Con mucho sol, la solar es la opción lógica.')+c(x.piso&&!x.terraza,' Sin terraza, busca paneles plegables para ventana.'),
 ()=>'Dimensiona un sistema solar con batería para lo esencial (luz, radio, carga y lo médico). Anota potencia (W) y capacidad (Wh).'),
M('seghogar',3,'Seguridad física del hogar','i',['rsl','rec'],'seg',60,[S.PC,S.FE],
 x=>'En crisis largas, una casa segura da tranquilidad.'+c(x.sism,' En zona sísmica, fija muebles altos.')+c(x.costa,' En costa, revisa cierres ante temporales.')+c(x.forestal,' Junto al monte, limpia vegetación seca alrededor.'),
 ()=>'Revisa cerraduras, puertas y ventanas y fija estanterías o muebles altos. Anota lo que hiciste.'),
M('finanzas',3,'Fondo de reserva','i',['rsl'],'doc',30,[S.UE],
 ()=>'Una crisis larga suele traer problemas de ingresos.',
 ()=>'Separa un fondo de emergencia en una cuenta aparte, según tus posibilidades, y algo más de efectivo. Anota que existe y dónde.'),
M('reparaciones',3,'Reparaciones básicas','s',['hab'],'seg',60,[S.FE],
 ()=>'Sin técnicos disponibles, saber arreglar un grifo o un enchufe es autonomía.',
 ()=>'Haz tú una reparación básica real: un grifo, un fusible o un enchufe (siempre sin tensión). Ten una caja de herramientas a mano.'),
M('barrio',3,'Red de barrio','s',['red'],'seg',60,[S.CR,S.UE],
 x=>'En crisis largas resiste mejor la comunidad que la persona sola.'+c(x.rural,' En tu entorno esa red es aún más necesaria.'),
 ()=>'Organiza o únete a una red de vecinos: grupo de contacto, quién sabe hacer qué y a quién ayudar. Hazlo tú.'),
M('huerto',3,'Germinados o huerto','s',['hab','rsl'],'comida',60,[S.GEN],
 x=>x.patio||x.casa?'Un huerto pequeño da comida fresca y una habilidad que no se pierde.':'Sin patio no hace falta huerto: germinados y macetas dan comida fresca en días.',
 x=>x.patio||x.casa?'Cultiva un bancal pequeño con dos o tres cultivos fáciles. Cuenta cuando hayas cosechado tú.':'Haz germinados en un bote y cultiva algo en maceta. Cuenta cuando hayas cosechado tú.'),
M('auditoria',3,'Examen: auditoría y fin de semana autónomo','x',['res','rsl'],'energia',900,[S.UE,S.FE],
 ()=>'Examen del nivel: comprobar que el sistema rota y funciona sin red.',
 x=>`Revisa todo el registro (caducidades, cargas, cantidades) y pasa un fin de semana sin compras y${x.sinElec?'':' sin red eléctrica'}. Cronometra cuánto tardas en tener luz, radio y contacto con todos.`,{tm:[['restaurar','Luz, radio y contacto con todos',900,30]]}),
/* ---------- NIVEL 4 · 3+ meses (avanzado, no oficial) ---------- */
M('despensa3',4,'Despensa de 3 meses','i',['rec'],'comida',60,[S.GEN],
 x=>'Tres meses de comida es una reserva avanzada: solo tiene sentido con rotación.'+x.dietTxt,
 ()=>'Amplía la despensa hacia 3 meses de básicos que ya coméis, con inventario y rotación. Anota raciones.'),
M('autosuf',4,'Autosuficiencia parcial','s',['hab','rsl'],'comida',60,[S.GEN],
 x=>x.patio||x.casa?'Un huerto productivo con semillas propias reduce dependencia.':'Sin patio, la autosuficiencia es parcial: germinados, macetas y semillas.',
 ()=>'Produce una parte de tu comida durante una temporada y guarda semillas propias. Solo cuenta lo cosechado.'),
M('energia4',4,'Energía autónoma','i',['rsl'],'energia',60,[S.GEN],
 ()=>'La última dependencia que se corta es la red eléctrica.',
 ()=>'Asegura que lo esencial de la casa funciona con tu energía una semana. Anota el sistema.'),
M('auxilios2',4,'Primeros auxilios avanzados','s',['hab'],'salud',60,[S.CR],
 ()=>'En una crisis larga, la ayuda médica puede tardar.',
 ()=>'Haz un curso avanzado de primeros auxilios en una entidad acreditada. Solo cuenta si lo has hecho tú.'),
M('radioaf',4,'Radioaficionado','s',['hab','red'],'com',60,[S.UIT],
 x=>'Cuando caen todas las redes, los radioaficionados siguen comunicando.'+c(x.isla,' Desde una isla, es la forma de hablar con el exterior.'),
 x=>`Obtén la licencia de radioaficionado ${x.pais==='España'?'(examen oficial del Ministerio)':'de tu país'} y haz tu primer contacto.`),
M('navegacion',4,'Orientarse sin GPS','s',['hab'],'evac',60,[S.GEN],
 ()=>'Sin satélites ni datos, un mapa en papel y una brújula siguen funcionando.',
 ()=>'Recorre una ruta conocida usando solo mapa en papel y brújula. Hazlo tú.'),
M('comunidad',4,'Comunidad organizada','s',['red'],'seg',60,[S.CR,S.UE],
 ()=>'La resiliencia a largo plazo es colectiva.',
 ()=>'Participa en una organización local (voluntariado de protección civil, Cruz Roja, asociación vecinal). Cuenta cuando estés dentro.'),
M('reubicacion',4,'Plan de reubicación','i',['red','res'],'evac',60,[S.PC],
 x=>'Algunas crisis obligan a irse por mucho tiempo.'+c(x.isla,' En una isla, piensa cómo y a dónde saldrías.')+c(x.h.casaAlt==='Sí',' Ya tienes otra casa: ahora, el plan.'),
 ()=>'Define un lugar alternativo donde vivir, cómo llegar y qué llevar. Anótalo en el registro.'),
M('conservas',4,'Conservas caseras','s',['hab'],'comida',60,[S.SAN],
 ()=>'Conservar comida alarga la despensa. Mal hecho es peligroso (botulismo).',
 ()=>'Haz una tanda de conservas siguiendo una guía oficial de seguridad alimentaria. Solo cuenta si lo has hecho tú.'),
M('mantenimiento',4,'Mantenimiento del sistema','s',['res'],'doc',60,[S.FE],
 ()=>'Un sistema sin mantenimiento se degrada. Revisarlo cada seis meses basta.',
 ()=>'Fija dos fechas al año para revisar todo el registro y hazlo una vez completo.'),
M('autonomo',4,'Examen final: 72 horas autónomo','x',['res','rsl'],'energia',4320,[S.GEN],
 ()=>'Examen final: demostrar que el hogar funciona solo.',
 x=>`Vivid 72 horas sin ${x.sinElec?'':'red eléctrica ni '}compras, con vuestra agua, comida, energía y comunicaciones. Cronometra la salida de emergencia y anota lo aprendido.`,{tm:[['salir','Salir de casa con las mochilas',600,30]]})];
