/* Plan B v6 · Fichas «Cómo se hace» y ayuda ante la violencia doméstica.
   Lo esencial va escrito aquí y funciona sin conexión. Los enlaces (↗) solo amplían: necesitan internet,
   la app nunca los abre sola y solo se abren si el usuario los toca (target _blank, rel noopener noreferrer).
   Cada enlace se comprobó con curl (HTTP 200) el 16 nov 2026. */
'use strict';
const LNK_FECHA='16 nov 2026';
const S52={SAN22:'Ministerio de Sanidad · Salud Pública ante la calima (nota de prensa, 16 mar 2022)',AEP22:'Asociación Española de Pediatría · Recomendaciones ante una tormenta de polvo o arena (2022)',SCS:'Servicio Canario de la Salud · Recomendaciones ante episodios de calima',ERC25:'Consejo Europeo de Resucitación (ERC, guías 2025, traducción oficial al castellano)',ERC21:'Consejo Europeo de Resucitación (ERC, guías 2021, traducción oficial del CERCP)',CR:'Cruz Roja Española',SAN:'Ministerio de Sanidad',NAV:'Salud Pública de Navarra (Gobierno de Navarra)',CDC:'CDC',CONS:'Ministerio de Derechos Sociales, Consumo y Agenda 2030',PC:'Protección Civil (Escuela Nacional, Manual de primera intervención, 2018)',C112:'112 Canarias',IGU:'Ministerio de Igualdad · Delegación del Gobierno contra la Violencia de Género',ICI:'Instituto Canario de Igualdad (Gobierno de Canarias)',INT:'Ministerio del Interior · AlertCops',ANAR:'Fundación ANAR',CWF:'Canadian Women\u2019s Foundation (Signal for Help)'};
/* Enlaces externos: u = dirección, t = qué es, o = quién lo publica */
const LNK={
 erc_svb:{u:'https://www.erc.edu/media/50fl1gsg/04_gl2025_bls_es_v10.pdf',t:'Guías ERC 2025: Soporte vital básico (PDF en castellano)',o:'ERC'},
 erc_ped:{u:'https://aesp-rcp.es/Documentos_web_AESP/Guias_ERC_2025/ERC%20Guidelines%202025%20PALS%20ESP.pdf',t:'Guías ERC 2025: Soporte vital pediátrico (PDF en castellano)',o:'ERC · traducción oficial AESP-RCP'},
 erc_pa:{u:'https://www.erc.edu/media/ko2fcyce/12_gl2025_first-aid_es_v10.pdf',t:'Guías ERC 2025: Primeros auxilios (PDF en castellano)',o:'ERC'},
 erc21:{u:'https://semicyuc.org/wp-content/uploads/2021/09/RCP-Guias-ERC-2021-01-Resumen-Traduccion-oficial-CERCP.pdf',t:'Guías ERC 2021: resumen ejecutivo (PDF, incluye quemaduras)',o:'ERC · CERCP · SEMICYUC'},
 cr_dea:{u:'https://www2.cruzroja.es/web/ahora/-/por-que-todo-mundo-deberia-aprender-utilizar-desfibrilador',t:'Por qué todo el mundo debería aprender a usar un desfibrilador',o:'Cruz Roja Española'},
 cr_pls:{u:'https://www2.cruzroja.es/web/ahora/-/que-es-la-posicion-lateral-de-seguridad-y-cuando-se-utiliza',t:'Qué es la posición lateral de seguridad y cuándo se usa',o:'Cruz Roja Española'},
 cr_atrag:{u:'https://www2.cruzroja.es/es/web/ahora/-/qu-c3-a9-hacer-ante-un-atragantamiento',t:'Qué hacer ante un atragantamiento',o:'Cruz Roja Española'},
 cercp:{u:'https://cercp.org/',t:'Consejo Español de RCP: formación en RCP',o:'CERCP'},
 san_calor:{u:'https://www.sanidad.gob.es/areas/promocionPrevencion/lesiones/temperaturasExtremas/docs/TemperaturasExtremas_ProtegetedelCalor.pdf',t:'En verano protégete del calor (PDF)',o:'Ministerio de Sanidad'},
 nav_lejia:{u:'https://portalsalud.navarra.es/documents/11746728/60815232/09DocUSODELEJIAdesinfeccinaguaconsumo.pdf/a433d57f-45cd-5c2e-bf82-ecda01731a56',t:'Uso de lejía para desinfectar el agua de consumo (PDF, tabla de dosis)',o:'Salud Pública de Navarra'},
 gas:{u:'https://www.dsca.gob.es/es/consumo/preguntas-frecuentes/que-debo-hacer-si-noto-olor-gas-casa',t:'¿Qué debo hacer si noto olor a gas en casa?',o:'Ministerio de Consumo'},
 pc_ext:{u:'https://www.proteccioncivil.es/documents/20121/91988/Manual-de-primera-intervencion-2018.pdf/7434f9ad-0b15-a72d-2c4a-ea7e6617e6c0',t:'Manual de primera intervención: uso del extintor, apartado 2.6 (PDF)',o:'Protección Civil'},
 c112_inc:{u:'https://www.112canarias.com/112/consejos-ante-un-incendio-urbano/',t:'Consejos ante un incendio urbano',o:'112 Canarias'},
 vg016:{u:'https://violenciagenero.igualdad.gob.es/informacion-3/recursos/telefono016/',t:'016: teléfono, WhatsApp, correo y chat',o:'Delegación del Gobierno contra la Violencia de Género'},
 vgrastro:{u:'https://www.lamoncloa.gob.es/serviciosdeprensa/notasprensa/igualdad/paginas/2026/telefono-016-que-es.aspx',t:'Teléfono 016: qué es, cómo funciona y cómo borrar el rastro',o:'La Moncloa · Igualdad (2026)'},
 vgque:{u:'https://violenciagenero.igualdad.gob.es/informacion-3/quehacer/',t:'Qué hacer: si la sufres, si la sufre alguien de tu entorno o si la presencias',o:'Delegación del Gobierno contra la Violencia de Género'},
 atenpro:{u:'https://violenciagenero.igualdad.gob.es/informacion-3/recursos/serviciotecnico/',t:'ATENPRO: servicio de atención y protección',o:'Delegación del Gobierno contra la Violencia de Género'},
 alertcops:{u:'https://alertcops.ses.mir.es/publico/alertcops/actualidad/detalle-actualidad.html?noticia=AlertCops-refuerza-la-protecci-n-de-colectivos-vulnerables-con-mejoras-en-el-Bot-n-SOS',t:'AlertCops: Botón SOS para víctimas de violencia de género',o:'Ministerio del Interior'},
 ici112:{u:'https://www.gobiernodecanarias.org/icigualdad/servicios/servicio112/',t:'Canarias: servicio de atención a víctimas de violencia del 112',o:'Instituto Canario de Igualdad'},
 anar:{u:'https://www.anar.org/que-hacemos/telefono-chat-anar/',t:'Teléfono y chat ANAR de ayuda a niños y adolescentes',o:'Fundación ANAR'},
 vg2020:{u:'https://www.igualdad.gob.es/comunicacion/sala-de-prensa/datosvgestadoalarma/',t:'Peticiones de ayuda durante el estado de alarma de 2020',o:'Ministerio de Igualdad'},
  snczi:{u:'https://gis.miteco.gob.es/web/snczi/',t:'Visor oficial de zonas inundables (SNCZI)',o:'Ministerio para la Transición Ecológica y el Reto Demográfico'},
  san_calima:{u:'https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=5686',t:'Salud Pública recomienda minimizar la exposición a la calima',o:'Ministerio de Sanidad'},
  aep_calima:{u:'https://www.aeped.es/enfamilia/actualidad/recomendaciones-aep-ante-una-tormenta-polvo-arena',t:'Recomendaciones ante una tormenta de polvo o arena',o:'Asociación Española de Pediatría'},
  scs_calima:{u:'https://www3.gobiernodecanarias.org/noticias/sanidad-recomienda-a-las-personas-mas-sensibles-extremar-las-precauciones-ante-el-episodio-de-calima-4/',t:'Sanidad recomienda extremar las precauciones ante la calima',o:'Gobierno de Canarias · Servicio Canario de la Salud'},
  cwf:{u:'https://canadianwomen.org/signal-for-help/',t:'Signal for Help: la señal de ayuda con la mano (en inglés)',o:'Canadian Women\u2019s Foundation'}};

/* Fichas. sec: [{h: título, s: [pasos]}] · act: botones de llamada [tel, texto] · links: claves de LNK */
const FICHAS=[
 {k:'rcp',t:'RCP: reanimación cardiopulmonar',d:'Si alguien no responde y no respira con normalidad.',
  sec:[{h:'Adulto o adolescente',s:[
   'Comprueba que la zona es segura para ti.',
   'Háblale fuerte y sacúdele con suavidad los hombros: «¿Se encuentra bien?».',
   'Si no responde, llama al 112 y pon el altavoz (manos libres). Deja el móvil a tu lado: el operador te guía. Si hay alguien más, que llame y que busque un desfibrilador (DEA).',
   'Ponle boca arriba. Abre la vía aérea: una mano en la frente, inclina la cabeza hacia atrás y levanta el mentón con dos dedos.',
   'Mira, escucha y siente si respira con normalidad, no más de 10 segundos. Boquear o respirar lento y con ruido NO es respirar con normalidad. Si dudas, actúa como si no respirara.',
   'Arrodíllate a su lado. Talón de una mano en el centro del pecho (mitad inferior del esternón), la otra mano encima y los dedos entrelazados.',
   'Brazos rectos y hombros justo encima de tus manos. Hunde el pecho entre 5 y 6 cm y suelta del todo cada vez, a un ritmo de 100 a 120 por minuto (casi 2 por segundo).',
   'Si te han enseñado a dar ventilaciones: cada 30 compresiones, 2 insuflaciones. Mantén la frente y el mentón, tapa la nariz, sella su boca con la tuya y sopla 1 segundo, lo justo para que el pecho empiece a subir.',
   'Si no sabes o no puedes dar ventilaciones: solo compresiones, sin parar.',
   'En cuanto llegue el DEA, enciéndelo y sigue su voz. Pega los parches en el pecho desnudo; si hay otra persona, que siga con las compresiones mientras tanto. Nadie toca a la persona mientras el DEA analiza o da la descarga.',
   'Si está en una cama, no pierdas tiempo en bajarla: empieza ahí y hunde un poco más.',
   'No pares hasta que respire con normalidad, llegue ayuda y te releve, o no puedas más.']},
   {h:'Niño o niña (de 1 año a la adolescencia)',s:[
   'Llama al 112 con el altavoz antes de empezar o, si hay alguien más, que llame mientras tú empiezas.',
   'Abre la vía aérea (frente y mentón) y empieza con 5 insuflaciones.',
   'Después, 30 compresiones y 2 insuflaciones, y repite. (La pauta 15:2 es para quien tiene formación pediátrica específica.)',
   'Compresiones en la mitad inferior del esternón, con una o dos manos según su tamaño, hundiendo al menos un tercio del pecho, a 100-120 por minuto.',
   'El DEA también sirve en niños: úsalo en cuanto esté y sigue su voz.']},
   {h:'Bebé (menos de 1 año)',s:[
   'Llama al 112 con el altavoz: el operador te guía paso a paso.',
   'Abre la vía aérea y da 5 insuflaciones cubriendo con tu boca su boca y su nariz, durante 1 segundo cada una.',
   'Compresiones con la técnica de los dos pulgares: rodea su pecho con las manos y presiona con los dos pulgares sobre la mitad inferior del esternón, hundiendo al menos un tercio del pecho, a 100-120 por minuto.',
   'Sigue con 30 compresiones y 2 insuflaciones hasta que llegue ayuda o haya signos claros de vida.']}],
  src:[S52.ERC25],links:['erc_svb','erc_ped','cr_dea','cercp'],nota:'La práctica en un curso con maniquí no la sustituye ninguna ficha.'},
 {k:'pls',t:'Posición lateral de seguridad',d:'Si no responde pero respira con normalidad.',
  sec:[{h:'Pasos',s:[
   'Úsala solo si respira con normalidad y no hay que hacer RCP. Si boquea o no respira bien, empieza la RCP.',
   'No la uses si sospechas un golpe fuerte en la cabeza, el cuello o la espalda (caída, accidente), salvo que haya un peligro que obligue a moverla.',
   'Persona boca arriba, con las piernas estiradas. Arrodíllate a su lado.',
   'El brazo más cercano a ti, estirado en ángulo recto con el cuerpo.',
   'El otro brazo, cruzado sobre el pecho, con el dorso de su mano apoyado en su mejilla más cercana a ti.',
   'Dobla la rodilla de la pierna más alejada y, tirando de ella con suavidad, gira el cuerpo hacia ti.',
   'Deja la cabeza un poco inclinada hacia atrás para que respire y pueda salir el vómito. La pierna doblada evita que se vuelva a girar.',
   'Llama al 112 si aún no lo has hecho. No la dejes sola y vigila que siga respirando: si deja de hacerlo con normalidad, ponla boca arriba y empieza la RCP.']}],
  src:[S52.CR,S52.ERC25],links:['cr_pls','erc_pa']},
 {k:'atrag',t:'Atragantamiento',d:'De repente no puede hablar, toser ni respirar.',
  sec:[{h:'Adulto o niño mayor de 1 año',s:[
   'Pregúntale: «¿Te estás atragantando?». Si puede toser, anímale a toser fuerte y no hagas nada más.',
   'Si no puede toser o la tos ya no sirve: inclínale hacia delante y dale hasta 5 golpes fuertes en la espalda, entre los omóplatos.',
   'Si no sale: hasta 5 compresiones abdominales (maniobra de Heimlich). Ponte detrás, rodéale con los brazos, pon el puño justo por encima del ombligo, agárralo con la otra mano y tira fuerte hacia dentro y hacia arriba.',
   'Alterna 5 golpes y 5 compresiones hasta que salga o pierda el conocimiento. Que alguien llame al 112.',
   'Si pierde el conocimiento: túmbale boca arriba, llama al 112 y empieza la RCP.',
   'No metas los dedos a ciegas en la boca.',
   'Si le han hecho compresiones abdominales, que le vea un médico después aunque esté bien.']},
   {h:'Bebé (menos de 1 año)',s:[
   'Ponle boca abajo sobre tu antebrazo, con el antebrazo apoyado en tu pierna. Sujétale la cabeza con la mano y mantenla más baja que el pecho.',
   'Dale hasta 5 golpes fuertes entre los omóplatos.',
   'Si no sale: dale la vuelta, boca arriba sobre tus rodillas, y haz hasta 5 compresiones en el pecho con los dos pulgares sobre el esternón, más bruscas que en la RCP.',
   'Alterna 5 y 5. Para en cuanto tosa, llore o respire con ruido.',
   'Llama al 112 cuanto antes. Si pierde el conocimiento, empieza la RCP con 5 insuflaciones.']}],
  src:[S52.CR,S52.ERC25],links:['cr_atrag','erc_pa','erc_ped']},
 {k:'hemo',t:'Hemorragia grave',d:'Sangre que sale mucho o a chorro.',
  sec:[{h:'Presión directa',s:[
   'Llama o que alguien llame al 112.',
   'Aprieta fuerte y sin soltar directamente sobre la herida, con la mano o con una gasa o un paño limpio.',
   'Si el paño se empapa, no lo quites: pon otro encima y sigue apretando.',
   'Cuando deje de sangrar, sujeta el apósito con una venda apretada.']},
   {h:'Torniquete (brazo o pierna, solo si la presión no basta)',s:[
   'Si la hemorragia de un brazo o una pierna pone en peligro la vida y no para apretando, pon un torniquete cuanto antes. Mejor uno comercial: los improvisados funcionan peor.',
   'Colócalo alrededor del brazo o la pierna, entre 5 y 7 cm por encima de la herida y nunca sobre una articulación.',
   'Apriétalo hasta que la sangre disminuya y pare. Puede doler.',
   'Anota la hora en el propio torniquete. No lo aflojes: solo lo retira un profesional sanitario.',
   'En bebés y niños con brazos o piernas demasiado pequeños para un torniquete, sigue con presión directa.']}],
  src:[S52.ERC25],links:['erc_pa']},
 {k:'quem',t:'Quemaduras',d:'Por fuego, líquidos o superficies calientes.',
  sec:[{h:'Pasos',s:[
   'Aleja a la persona de lo que la quema.',
   'Enfría la quemadura con agua fresca, no helada, durante al menos 20 minutos.',
   'En bebés, niños y quemaduras grandes, vigila que no cojan frío.',
   'No pongas pomadas, hielo ni remedios caseros, y no rompas las ampollas.',
   'Cubre sin apretar con un apósito limpio o con film transparente.',
   'Llama al 112 si es grande, si está en la cara, las manos, los genitales o las articulaciones, o si es un niño.']}],
  src:[S52.ERC21],links:['erc21']},
 {k:'calor',t:'Golpe de calor',d:'Piel caliente, más de 40 °C, confusión o desmayo.',
  sec:[{h:'Golpe de calor: urgencia vital',s:[
   'Señales: piel caliente y enrojecida, a veces sin sudor; fiebre de más de 40 °C; pulso rápido; confusión, convulsiones o desmayo.',
   'Llama al 112 ya.',
   'Mientras llega la ayuda, lleva a la persona a un sitio fresco.',
   'Bájale la temperatura con paños fríos o con un baño de agua fría.',
   'No le des nada de beber.']},
   {h:'Agotamiento por calor (más leve)',s:[
   'Señales: dolor de cabeza, náuseas, mareo, mucho sudor, piel fría y pálida.',
   'Ve a un sitio fresco, afloja la ropa, bebe agua a sorbitos y ponte paños húmedos.',
   'Busca atención sanitaria si tiene una enfermedad crónica, vomita o los síntomas empeoran o duran más de 1 hora.']}],
  src:[S52.SAN],links:['san_calor']},
 {k:'agua',t:'Potabilizar agua',d:'Cuando el agua del grifo no es potable.',
  sec:[{h:'Hervir',s:[
   'Si está turbia, fíltrala antes con un paño limpio.',
   'Hiérvela a borbotones durante 1 minuto (3 minutos por encima de 2.000 m de altitud).',
   'Déjala enfriar y guárdala en recipientes limpios y tapados.']},
   {h:'Lejía',s:[
   'Usa solo lejía que diga en la etiqueta «apta para la desinfección del agua de bebida», sin perfume ni detergente.',
   'Usa la dosis de su etiqueta. Si no la indica, mira en el envase cuántos gramos de cloro por litro tiene: con 40 g/L, 1 gota por litro de agua (2 gotas cada 2 L); con 20 g/L, 2 gotas por litro.',
   'Remueve con algo limpio y espera al menos 30 minutos antes de beberla.',
   'Si el agua está turbia y no puedes filtrarla, usa el doble.',
   'La lejía quema la piel y los ojos: manéjala con cuidado.']}],
  src:[S52.NAV,S52.CDC],links:['nav_lejia']},
 {k:'gas',t:'Olor a gas y llave del gas',d:'Qué hacer si huele a gas y cómo cortarlo.',
  sec:[{h:'Si huele a gas',s:[
   'No toques interruptores ni enchufes, no enciendas llamas ni mecheros.',
   'Cierra la llave de paso del gas si puedes hacerlo sin riesgo.',
   'Abre puertas y ventanas.',
   'Sal de casa y llama desde fuera al 112 o al teléfono de urgencias de tu distribuidora de gas (está en la factura). No uses el ascensor.',
   'No intentes reparar la fuga. No vuelvas a abrir la llave hasta que lo revise un profesional.']},
   {h:'Antes: localiza tu llave',s:[
   'Localiza la llave de paso del gas de tu casa y comprueba que sabes cerrarla y abrirla. Si tienes dudas sobre tu instalación, pregunta a tu distribuidora o a un instalador autorizado.']}],
  src:[S52.CONS,S52.C112],links:['gas','c112_inc']},
 {k:'extintor',t:'Usar un extintor',d:'Solo para un fuego pequeño que acaba de empezar.',
  sec:[{h:'Antes de usarlo',s:[
   'Solo sirve en un fuego que empieza. Si es grande o hay mucho humo, sal, cierra la puerta y llama al 112.',
   'Ten la salida a tu espalda.',
   'Lee la etiqueta: el tipo de fuego para el que sirve. Comprueba que la aguja del manómetro está en la zona verde.']},
   {h:'Pasos',s:[
   'Quita el precinto y el pasador de seguridad.',
   'Haz un disparo corto de prueba antes de acercarte.',
   'Sujétalo un poco inclinado, sin ponerte encima, y no te acerques demasiado al fuego.',
   'Apunta a la base de las llamas.',
   'Al aire libre, ponte de espaldas al viento.',
   'No pierdas de vista la zona apagada: puede reavivarse.',
   'Aceite ardiendo en una sartén: nunca agua; tapa la sartén.']}],
  src:[S52.PC,S52.C112],links:['pc_ext','c112_inc']},
 {k:'calima',t:'Calima o polvo en suspensión',d:'Cuando el aire está cargado de polvo y baja la calidad del aire.',
  sec:[{h:'En casa',s:[
   'Mantén cerradas puertas y ventanas.',
   'Si usas aire acondicionado, ponlo en recirculación para que entre menos polvo.',
   'Limpia el polvo de las superficies con paños húmedos.',
   'Bebe líquido y evita los ambientes secos.',
   'Reduce la actividad al aire libre y no hagas ejercicio intenso mientras dure.']},
   {h:'Si tienes que salir',s:[
   'Usa una mascarilla bien colocada y ajustada, mejor FFP2 o FFP3: las quirúrgicas reducen algo, pero no evitan respirar el polvo.',
   'Si conduces: luces encendidas y menos velocidad, porque baja mucho la visibilidad.']},
   {h:'Personas sensibles',s:[
   'Niños, mayores y personas con enfermedades respiratorias o del corazón: mejor no salir y quedarse con puertas y ventanas cerradas.',
   'Con asma u otra enfermedad respiratoria crónica: sigue tu tratamiento y ten la medicación cerca.',
   'Si empeoran los síntomas respiratorios, llama al 112.']}],
  src:[S52.SAN22,S52.AEP22,S52.SCS],links:['san_calima','aep_calima','scs_calima']},
 {k:'vg',t:'Violencia doméstica o de pareja',vg:true,noScore:true,d:'Recursos oficiales, cómo pedir ayuda con discreción y qué hacer si eres testigo.',
  act:[['112','Llamar al 112 · peligro ahora'],['016','Llamar al 016 · gratuito, 24 h']],
  sec:[{h:'Si hay peligro ahora',s:[
   'Llama al 112. También puedes llamar al 091 (Policía Nacional) o al 062 (Guardia Civil).',
   'En Canarias, el 112 tiene un servicio especializado en violencia de género del Instituto Canario de Igualdad, las 24 horas, que coordina la emergencia con el dispositivo de emergencia para mujeres agredidas (DEMA) de cada isla.',
   'AlertCops (Ministerio del Interior): si te has identificado en la app como víctima de violencia de género (código AVDG y DNI o NIE), pulsa el Botón SOS 5 veces en menos de 6 segundos. Envía tu ubicación y 10 segundos de audio a la policía más cercana.']},
   {h:'016: información y ayuda',s:[
   'Para todas las formas de violencia contra las mujeres, y también para familiares y personas del entorno.',
   'Gratuito, confidencial, las 24 horas. Atiende en 53 idiomas por teléfono. Asesoramiento jurídico de 8 a 22 h, todos los días.',
   'WhatsApp: 600 000 016 (solo mensajes, no admite llamadas).',
   'Correo: 016-online@igualdad.gob.es. También hay chat en la web de la Delegación del Gobierno contra la Violencia de Género.',
   'Para personas sordas o con dificultades del habla: además de WhatsApp, correo y chat, el teléfono de texto 900 116 016.']},
   {h:'Pedir ayuda con discreción',s:[
   'La llamada al 016 no aparece en la factura, pero puede quedar en el registro de llamadas del móvil. Bórrala después. Pasos orientativos, no oficiales, que cambian según el móvil: en la app de teléfono, abre las llamadas recientes y borra esa llamada (deslizándola o manteniéndola pulsada). Algunos móviles ya no guardan las llamadas al 016.',
   'Por escrito no se oye: WhatsApp 600 000 016 o correo. Si alguien revisa tu móvil, borra después la conversación.',
   'Señal de ayuda con la mano (Signal for Help, creada por la Canadian Women\u2019s Foundation): palma abierta hacia la otra persona, dobla el pulgar sobre la palma y cierra los demás dedos encima. Sirve en persona o en videollamada. No es un código oficial en España y no todo el mundo la conoce.',
   'Plan B no anota que has abierto esta ficha ni este árbol, y no guarda qué pantallas consultas. Usa «Salir rápido» para volver al panel.']},
   {h:'Si eres testigo o vecino',s:[
   'Si oyes o ves una agresión, llama al 112 y di con precisión el lugar (calle, número, piso). La violencia de género es un delito público.',
   'No te pongas en peligro.',
   'Si crees que alguien de tu entorno la sufre: no la presiones ni la juzgues, hazle saber que estás ahí. El 016 también te orienta a ti.',
   'Si ves la señal de ayuda con la mano: contacta con esa persona de forma segura, mejor con preguntas de sí o no, y deja que decida qué necesita. No siempre quiere que llames a la policía. Si hay peligro inmediato, llama al 112.']},
   {h:'Niños, niñas y adolescentes',s:[
   'Peligro inmediato: 112.',
   'Teléfono ANAR de ayuda a niños y adolescentes: 900 20 20 10, gratuito y confidencial, para cualquier problema, también la violencia. En Canarias también responde el 116 111.',
   'Si eres menor y crees que alguien de tu entorno sufre violencia de género, también puedes llamar a ANAR.']},
   {h:'Personas mayores o dependientes',s:[
   'Peligro inmediato: 112. Para denunciar: 091 o 062.',
   'Si es una mujer, el 016 también la atiende.',
   'Los servicios sociales de tu ayuntamiento pueden valorar su situación.']},
   {h:'En apagones, confinamientos y crisis',s:[
   'Estar encerrados en casa aumenta el riesgo. Durante el estado de alarma de 2020 (14 de marzo a 20 de junio), las peticiones de ayuda al 016 subieron un 57,9 % y las llamadas un 41,4 % respecto al mismo periodo de 2019 (Ministerio de Igualdad).',
   'El 016 se declaró servicio esencial y siguió funcionando las 24 horas.',
   'Sin cobertura de tu compañía, el 112 entra por cualquier red disponible.']},
   {h:'ATENPRO',s:[
   'Servicio de atención y protección con móvil y localización, las 24 horas, para víctimas que no conviven con el agresor y participan en los programas de atención especializada de su comunidad.',
   'Se pide en los servicios sociales del ayuntamiento. Información: 900 22 22 92.']}],
  src:[S52.IGU,S52.ICI,S52.INT,S52.ANAR,S52.CWF],links:['vg016','vgrastro','vgque','alertcops','atenpro','ici112','anar','vg2020','cwf']}];
const fichaDef=k=>FICHAS.find(f=>f.k===k);

/* Enlaces de «Cómo se hace» en árboles y misiones */
const FICHA_EN={h_rcp:['rcp'],h_pls:['pls','rcp'],h_atrag:['atrag','rcp'],h_sangre:['hemo'],h_quem:['quem'],k_golpe:['calor'],k_fin:['calor'],w_trat:['agua'],g_gas:['gas'],s_salir:['gas'],e_prep:['gas'],f_peq:['extintor'],f_aceite:['extintor'],h_otro:['pls','rcp'],v_peligro:[]};
const MIS_FICHA={auxilios:['rcp','pls','atrag','hemo','quem'],auxilios2:['rcp','pls','atrag','hemo'],botiquin:['hemo','quem'],botiquin2:['hemo','quem'],seguridad:['extintor','gas'],tratar:['agua'],cuadro:['gas']};

/* Árbol «Violencia doméstica o de pareja» */
const T5_VG={id:'vg',t:'Violencia doméstica o de pareja',direct:true,vg:true,start:'vg0',n:{
 vg0:{q:'¿A quién le está pasando?',o:[['A mí: pareja, expareja o alguien de casa','vg1'],['A un niño, niña o adolescente','vg_menor'],['A una persona mayor o dependiente','vg_mayor'],['Soy testigo o vecino','vg_test']]},
 vg1:{q:'¿Hay peligro ahora mismo?',o:[['Sí, ahora','vg_ya'],['No ahora, pero pasa o tengo miedo','vg2'],['No lo sé','vg_ya']]},
 vg_ya:{fin:'Peligro ahora',call:true,s:['Llama al 112. También 091 (Policía Nacional) o 062 (Guardia Civil).','Si estás en Canarias, el 112 tiene un servicio especializado en violencia de género, las 24 horas.','Con AlertCops y el perfil de víctima de violencia de género: Botón SOS 5 veces en menos de 6 segundos (ubicación y 10 s de audio a la policía).','Cuando estés a salvo, el 016 te informa y asesora, gratis y las 24 horas.'],tel:[['091','091'],['062','062']],ficha:['vg'],src:[S52.IGU,S52.ICI,S52.INT]},
 vg2:{q:'¿Puedes llamar ahora sin que te oigan?',o:[['Sí','vg_hablar'],['No, necesito discreción','vg_disc']]},
 vg_hablar:{fin:'Pedir ayuda y asesoramiento',s:['Llama al 016: gratuito, confidencial y las 24 horas. Atiende en 53 idiomas y da asesoramiento jurídico de 8 a 22 h.','La llamada no sale en la factura, pero puede quedar en el registro de llamadas del móvil: bórrala después (ver la ficha).','Si estás en peligro en algún momento: 112.','Si no convives con el agresor, pregunta por ATENPRO en los servicios sociales de tu ayuntamiento.'],tel:[['016','Llamar al 016']],ficha:['vg'],src:[S52.IGU]},
 vg_disc:{fin:'Pedir ayuda con discreción',s:['Escribe sin que se oiga: WhatsApp 600 000 016 (solo mensajes) o correo 016-online@igualdad.gob.es. Si alguien revisa tu móvil, borra después la conversación.','Si llamas al 016, borra después la llamada de Recientes (pasos orientativos en la ficha): no sale en la factura, pero sí puede quedar en el móvil.','En persona o en videollamada: señal de ayuda con la mano. Palma hacia la otra persona, pulgar doblado sobre la palma y los demás dedos cerrados encima. No es oficial en España: no todo el mundo la conoce.','Si hay peligro: 112.'],ficha:['vg'],src:[S52.IGU,S52.CWF]},
 vg_test:{fin:'Si eres testigo o vecino',call:true,s:['Si oyes o ves una agresión, llama al 112 y di con precisión el lugar: calle, número y piso.','No te pongas en peligro.','Si crees que alguien de tu entorno la sufre: no la presiones ni la juzgues; dile que estás ahí. El 016 también te orienta a ti.','Si eres menor de edad: ANAR, 900 20 20 10.'],tel:[['016','016']],ficha:['vg'],src:[S52.IGU,S52.CWF]},
 vg_menor:{fin:'Violencia hacia un menor',call:true,s:['Si hay peligro inmediato, llama al 112.','Teléfono ANAR de ayuda a niños y adolescentes: 900 20 20 10, gratuito y confidencial. En Canarias también el 116 111.','Para denunciar: 091 (Policía Nacional) o 062 (Guardia Civil).'],tel:[['900202010','ANAR 900 20 20 10']],ficha:['vg'],src:[S52.ANAR,S52.IGU]},
 vg_mayor:{fin:'Violencia hacia una persona mayor o dependiente',call:true,s:['Si hay peligro inmediato, llama al 112.','Para denunciar: 091 (Policía Nacional) o 062 (Guardia Civil).','Si es una mujer, el 016 también la atiende.','Los servicios sociales de tu ayuntamiento pueden valorar su situación.'],tel:[['091','091'],['062','062']],ficha:['vg'],src:[S52.IGU]}}};
T5.push(T5_VG);
