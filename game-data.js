// ============================================================
// EXPEDIENTE 64 — DATOS DEL JUEGO v0.2
// Todo el contenido editable vive aquí.
// ============================================================

const GAME_DATA = {

  intro: [
    { text: "EXPEDIENTE 64", sub: "Sourceseal Global Protocol" },
    { text: "Cada día, documentos y pruebas son alterados\nantes de llegar a un juicio.", sub: "" },
    { text: "Tu trabajo es encontrar lo que es real,\nconectar las pistas, y obtener la verdad.", sub: "" },
    { text: "NIVEL 1", sub: "Oficina de investigación" }
  ],

  // ---------------------------------------------------------
  // NIVEL 1 — Oficina + Pizarra de deducción
  // ---------------------------------------------------------
  level1: {
    name: "NIVEL 1 — OFICINA DE INVESTIGACIÓN",
    objective: "Revisa el computador y el celular. Luego conecta las pistas en la pizarra.",
    openingCinematic: {
      waypoints: [
        { pos: [0, 1.6, 6], lookAt: [0, 1.6, -3], hold: 1.0 },
        { pos: [-3, 1.6, 0], lookAt: [0, 1.3, -3.3], hold: 1.0 },
        { pos: [0, 1.6, 1.5], lookAt: [0, 1.3, -3.3], hold: 0.5 },
      ],
      text: "El expediente llegó esta mañana. Algo no cuadra."
    },
    computerFiles: [
      {
        id: "doc_01", title: "Contrato_RevisiónFinal.pdf",
        meta: "Modificado 03:14 AM — Autor desconocido",
        tag: "doc", tagLabel: "DOCUMENTO",
        detail: "La fecha de firma fue alterada digitalmente. El metadato original fue eliminado.",
        clueId: "clue_fecha_alterada",
      },
      {
        id: "audio_01", title: "Grabación_Llamada_0427.mp3",
        meta: "Duración 2:14 — Calidad comprometida",
        tag: "audio", tagLabel: "AUDIO",
        detail: "Voz que coincide con el patrón vocal del testigo principal. Cortes sospechosos en 0:42 y 1:18.",
        clueId: "clue_voz_testigo",
      },
      {
        id: "video_01", title: "CamSeguridad_EntradaPrincipal.mp4",
        meta: "Timestamp incompatible con el registro del edificio",
        tag: "video", tagLabel: "VIDEO",
        detail: "El video muestra una hora distinta a la registrada en el sistema de acceso.",
        clueId: "clue_timestamp_falso",
      },
    ],
    phoneFiles: [
      {
        id: "msg_01", title: "Mensajes — Contacto oculto",
        meta: "Conversación eliminada, recuperada parcialmente",
        tag: "doc", tagLabel: "MENSAJES",
        detail: "\"...si alguien pregunta, el documento se firmó el lunes, no el jueves...\"",
        clueId: "clue_mensaje_encubrimiento",
      },
      {
        id: "loc_01", title: "Historial de ubicación",
        meta: "Inconsistencia geográfica detectada",
        tag: "doc", tagLabel: "UBICACIÓN",
        detail: "El dispositivo registra una ubicación distinta a la declarada en el testimonio oficial.",
        clueId: "clue_ubicacion_falsa",
      },
    ],
    // Pizarra de deducción: el jugador debe unir estas pistas en los pares correctos
    deductionBoard: {
      title: "PIZARRA DE INVESTIGACIÓN — CONECTA LA EVIDENCIA",
      clues: [
        { id: "clue_fecha_alterada", label: "Fecha de firma alterada" },
        { id: "clue_mensaje_encubrimiento", label: "Mensaje: \"firmó el lunes, no el jueves\"" },
        { id: "clue_timestamp_falso", label: "Timestamp de cámara incompatible" },
        { id: "clue_ubicacion_falsa", label: "Ubicación no coincide con testimonio" },
        { id: "clue_voz_testigo", label: "Voz del testigo con cortes sospechosos" },
      ],
      // Conexiones correctas que el jugador debe encontrar (no direccionales)
      correctPairs: [
        ["clue_fecha_alterada", "clue_mensaje_encubrimiento"],
        ["clue_timestamp_falso", "clue_ubicacion_falsa"],
      ],
      conclusion: "Conclusión: el documento fue firmado después de lo declarado, y alguien manipuló los registros para cubrirlo. El testigo sabe más de lo que dijo.",
    },
  },

  toLevel2: [
    { text: "La pizarra está completa.", sub: "" },
    { text: "Pero falta una pieza. Hay que verla en persona.", sub: "" },
    { text: "NIVEL 2", sub: "En camino — barrio residencial" }
  ],

  // ---------------------------------------------------------
  // NIVEL 2 — Auto + Sigilo en el barrio
  // ---------------------------------------------------------
  level2: {
    name: "NIVEL 2 — VERIFICACIÓN EN TERRENO",
    objective: "Verifica en el celular, luego cruza el barrio sin ser visto.",
    phoneFiles: [
      {
        id: "v2_check_01", title: "Verificación de dirección",
        meta: "Comparando con registro del expediente",
        tag: "doc", tagLabel: "VERIFICACIÓN",
        detail: "La dirección coincide con la registrada en el Nivel 1.",
      },
      {
        id: "v2_check_02", title: "Reconocimiento facial — Transeúnte",
        meta: "Coincidencia 87%",
        tag: "video", tagLabel: "CÁMARA",
        detail: "Una persona del video de seguridad del Nivel 1 fue detectada cerca de aquí hace 12 minutos.",
      },
    ],
    stealthSection: {
      objective: "Cruza el barrio hasta la entrada de la tienda sin que el vigilante te detecte.",
      guardPatrol: [
        { pos: [-3, 0, -6], hold: 2 },
        { pos: [2, 0, -6], hold: 2 },
        { pos: [2, 0, -9], hold: 2 },
        { pos: [-3, 0, -9], hold: 2 },
      ],
      guardVisionRange: 5,
      guardVisionAngle: 0.6, // radianes, medio-ángulo del cono
      hidingSpots: [
        { pos: [-4.5, 0, -7.5], label: "Detrás del contenedor" },
        { pos: [3.5, 0, -7], label: "Detrás del auto estacionado" },
      ],
      destination: { pos: [0, 0, -11], label: "Entrada — Tienda de comida rápida" },
      onDetected: "El vigilante te vio. Vuelve a un punto de cobertura para que pierda tu rastro.",
    },
    driveDestination: "Oficina — Edificio corporativo",
  },

  toLevel3: [
    { text: "Entraste sin ser visto.", sub: "" },
    { text: "Ahora hay que llegar al fondo de todo esto.", sub: "" },
    { text: "NIVEL 3", sub: "Oficina ejecutiva" }
  ],

  // ---------------------------------------------------------
  // NIVEL 3 — Oficina lujosa + Interrogatorio
  // ---------------------------------------------------------
  level3: {
    name: "NIVEL 3 — OFICINA EJECUTIVA",
    objective: "Revisa la evidencia final, luego confronta al sospechoso.",
    computerFiles: [
      {
        id: "l3_doc_01", title: "Transferencia_Confidencial.xlsx",
        meta: "Acceso restringido — Nivel ejecutivo",
        tag: "doc", tagLabel: "DOCUMENTO",
        detail: "Registro financiero que confirma el pago relacionado con la alteración del contrato.",
      },
      {
        id: "l3_video_01", title: "Reunión_SalaDirectorio.mp4",
        meta: "Grabación interna no autorizada",
        tag: "video", tagLabel: "VIDEO",
        detail: "Se discute la necesidad de \"ajustar las fechas antes de que alguien revise el expediente\".",
      },
    ],
    phoneFiles: [
      {
        id: "l3_audio_01", title: "Nota de voz interceptada",
        meta: "Remitente: Dirección Ejecutiva",
        tag: "audio", tagLabel: "AUDIO",
        detail: "\"...el sello de Sourceseal va a detectar la alteración. Hay que actuar antes de que se complete la verificación...\"",
      },
    ],
    // Diálogo de interrogatorio final — árbol simple de 2-3 ramas
    interrogation: {
      npcName: "Director Ejecutivo",
      openingLine: "No sé qué cree que encontró aquí, pero le sugiero que tenga cuidado con sus acusaciones.",
      nodes: {
        start: {
          npcLine: "No sé qué cree que encontró aquí, pero le sugiero que tenga cuidado con sus acusaciones.",
          options: [
            { text: "Tengo el registro financiero. Y la grabación de la sala de juntas.", next: "pressure_evidence" },
            { text: "Solo quiero entender qué pasó con la fecha del contrato.", next: "soft_approach" },
          ]
        },
        pressure_evidence: {
          npcLine: "Eso... eso pudo ser sacado de contexto.",
          options: [
            { text: "El sello de Sourceseal ya verificó la cadena de custodia. No hay contexto que valga.", next: "confession" },
            { text: "Entonces explíqueme el contexto.", next: "stall" },
          ]
        },
        soft_approach: {
          npcLine: "Un error administrativo. Nada más.",
          options: [
            { text: "Un 'error administrativo' que coincide con una transferencia confidencial el mismo día.", next: "pressure_evidence" },
          ]
        },
        stall: {
          npcLine: "Mire, todos cometemos errores bajo presión...",
          options: [
            { text: "Eso no es una explicación. Es una confesión a medias.", next: "confession" },
          ]
        },
        confession: {
          npcLine: "Está bien. Sí, alteramos la fecha. Necesitábamos tiempo antes de que esto saliera a la luz.",
          options: [], // termina la conversación
          isEnding: true,
        },
      }
    },
  },

  ending: [
    { text: "Confesión obtenida. Evidencia sellada.", sub: "" },
    { text: "Ya no puede ser alterada, borrada ni negada.", sub: "" },
    { text: "SOURCESEAL GLOBAL PROTOCOL", sub: "La verdad ahora tiene un protocolo." },
    { text: "FIN DEL EXPEDIENTE 64", sub: "Gracias por jugar" }
  ],
};
