**SECCIÓN 1: DEFINICIÓN DEL PROBLEMA (20 min)**

**Template**** proyectado:**

**POC CHARTER - IA LAB GRUPO MACRO**

**Caso**: MOTOR OPORTUNIDADES (GO/NO GO)

Fecha: 16 de Febrero, 2026

**DEFINICIÓN DEL PROBLEMA**

**PROBLEMA ESPECÍFICO QUE RESOLVEMOS:**[^1]

Las consultorías llegan a Macroconsult a través de dos medios: por búsqueda directa de la empresa y por licitaciones (el más importante). Cuando recurrimos al medio de licitación, tomamos mucho tiempo identificando convocatorias de potencial interés para la empresa. Tenemos que entrar a los buscadores privados (por ejemplo, Devaid) o públicos (por ejemplo, SEACE) y descargar manualmente aquellos proyectos que, por el título o abstract, parezcan ajustarse a nuestras capacidades. Luego, entre aquellos que parezcan de interés, es necesario leerlos íntegramente con algún nivel de detalle e incorporarlos o descartarlos. Esto se hace sobre todas las convocatorias de potencial interés, que pueden llegar a decenas. 

El proceso se hace dos veces por semana por personal senior. No puede ser hecho por personal junior porque para analizar las convocatorias y priorizarlas, se requiere conocimiento de las habilidades y experiencia disponibles en la empresa y eso sólo puede ser hecho por un analista senior o más, que tienen conocimiento de la empresa. 

Todo lo anterior resulta costoso, lento e ineficiente.

**Validación en sala:**

Usuarios piloto: ¿Esta descripción refleja su realidad? ¿Sí/No?

Sponsor: ¿Este es realmente el dolor #1? ¿Sí/No?

Frank (TI): ¿Algo técnicamente imposible aquí? ¿Sí/No?

**PROCESO ACTUAL (AS-IS) - PASO**** A PASO:**[^2]

**Tiempo total del proceso**: 90 horas 

**Frecuencia**: 1 veces por semana (sujeto a disponibilidad de tiempo)

**Costo Anual directo**[^3]

    Primera parte:US$ 41,500 anuales

    Segunda parte: US$ 160,000 anuales

**Costo de oportunidad**: US$ 200,000

**¿POR QUÉ NO LO HAN RESUELTO ANTES?**

Porque la tecnología (las técnicas de webscraping, por ejemplo) no era conocida y no estaba disponibles para el equipo.

Falta de prioridad. La carga laboral se impone frente a la búsqueda de soluciones 

Se buscó atender el problema con suscripciones a motores de búsqueda (DevAID)

No teníamos sponsor dentro de la empresa que prestara suficiente atención a esto.

**SECCIÓN 2: SOLUCIÓN PROPUESTA (25 min)**

**2. SOLUCIÓN PROPUESTA – QUÉ CONSTRUIREMOS**

Se construirá un pipeline automatizado con participación de múltiples agentes de IA que ejecuten las actividades repetitivas. 

**2.1. ****PROCESO OBJETIVO (TO-BE) - CÓMO SERÁ CON IA:**

**SUBPROCESO 1**

**Paso 1. ****Captura automatizada de convocatorias**

Se creará un agente de obtención de información de las páginas web con el siguiente detalle mínimo:

Acceder automáticamente a portales (SEACE, DevAid, Banco Mundial, BID, ONG, etc.).

Descargar las convocatorias nuevas o actualizadas.

Extraer título, fechas, entidad, documentos, links, requisitos.

Normalizar y enviar esos datos al siguiente agente del pipeline

Este paso se compone de dos subprocesos:**
**

a. Robot de scraping / API collector

Conectores automáticos a SEACE, DevAID, Banco Mundial, BID, páginas de ONG, y cualquier portal configurable.

Frecuencia: cada 30–60 minutos.

Extrae título, código, entidad, fecha de publicación, fecha límite, documento de TdR, monto estimado, tipo de consultoría.

El robot tendrá los passwords de la empresa para acceder las páginas necesarias.

b. Normalización y almacenamiento

Limpieza automática (tipo de documento, fechas, moneda, sector).

TdR procesado con OCR y clasificación semántica.

Guardado en un índice de búsqueda tipo Elasticsearch.

Dolor eliminado: ingreso a múltiples portales, login repetitivo, lectura manual inicial, pérdida de oportunidades por no revisar a tiempo.

**Paso 2. ****Clasificación automática y relevamiento preliminar**

Este agente lee las convocatorias y hacer un pronóstico para ver el grado en que hace match con nuestras experiencias institucionales.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      


2.1. Modelo de NLP para clasificación temática

El sistema categoriza por sector, disciplina, país, tipo de estudio, nivel de complejidad metodológica, duración probable, etc.

2.2. Scoring de match con capacidades institucionales[^4]

Motor de reglas + modelo predictivo que compara:
• Requisitos del TdR
• Experiencia previa almacenada en la BD de proyectos
• CVs del staff y consultores asociados
• Historial de adjudicaciones

Produce un puntaje: 0–100.

2.3. Filtro automático

Convocatorias con score bajo (<40): archivadas automáticamente.

Intermedias (40–70): revisadas semanalmente por un analista.

Altas (>70): pasan al análisis automatizado del TdR.

Dolor eliminado: lectura manual de títulos y abstracts, clasificación lenta, errores por saturación.

**Paso ****3****. ****Análisis automatizado del ****TdR**


3.1. Lectura semántica del documento[^5]

El sistema detecta riesgos:
• Requisitos obligatorios
• Complejidad metodológica
• Necesidad de alianzas
• Plazos inviables
• Campos con información faltante o ambigua

3.2. Resumen ejecutivo automático

Tres niveles:

Resumen de una página

Requisitos clave

Riesgos + sugerencia de estrategia

3.3. Recomendación automática

Genera recomendaciones sobre postular o no

Justificación basada en datos.

Intervención humana:

Jefe de área y/o senior revisan recomendaciones para oportunidades con score >70.

**Paso 4. ****Reunión ****interna para decidir postulación**


4.1. Reunión interna de senior y jefe de área para decir. Esto ocurre dos veces por semana y el insumo son los documentos generados en el paso anterior con Score de 70 o más. 

4.2. Asignación de responsabilidades entre junior y practicante con tiempo disponible.

 Con esta actividad termina el subproceso 1.

**SUBPROCESO 2**

**Paso 5. ****Elaboración automatizada de propuesta administrativa****
**

5.1. Expediente automatizado

El sistema arma automáticamente:
• Ficha de experiencia institucional - basado en base de datos de credenciales + sustentos (contratos, constancias, facturas + notas de abono)
• CVs actualizados según el formato solicitado (requiere base de datos de CVs comprehensivos + sustentos)
• Formatos administrativos solicitados
• Experiencia relevante extraída desde la BD

5.2. Validación automática de requisitos

Chequea si falta algún soporte, formato o documento.

Señala inconsistencias antes de enviar.

Intervención humana:[^6]

Practicante completa formatos que faltaran y que no pudieran ser hechos por IA

Junior solo revisa que los documentos generados estén completos.

**Paso 6. ****Elaboración de propuesta técnica**


6.1. Junior brinda instrucciones a IA para armar la propuesta metodológica de acuerdo a lo conversado con Senior y Jefe de área en paso 4.

6.2. Generador preliminar semiautomático de propuesta metodológica

Basado en plantillas adaptativas e indicaciones de analista:
• Metodología por sector / tipo de proyecto
• Cronogramas parametrizados
• Matrices de actividades

Ajuste fino con IA según el TdR e indicaciones de junior

6.3. Costeo 

Senior elabora el costo

Basado en costos históricos, tarifas del staff y parámetros del cliente o los TdR.

Verifica restricciones del TdR (técnicas específicas, límites de honorarios).

Intervención humana:

Senior revisa y ajusta componentes metodológicos de mayor complejidad.

Jefe de área revisa y valida costeo.

**TIEMPO TOTAL PROCESO NUEVO**: 24 horas (vs. 90 horas antes)

**REDUCCIÓN**:  70%+ en tiempo

**2.****2**** ALCANCE DEL POC — LO QUE HARÁ / NO HARÁ**

**✅**** HARÁ:**

• Monitorear oportunidades (SEACE/DevAID/otras) a diario y normalizarlas.

• Extraer requisitos duros/operativos de TdR y puntuar Go/No Go (con explicación y trazas de acuerdo al scoring).

• Generar expediente administrativo base (CV de la firma y CVs de consultores en formato solicitado).

• Panel de priorización con métricas y alertas; checklist de cumplimiento 100% contra requisitos.

**❌**** NO HARÁ:**

• Postular automáticamente sin revisión humana.

• Scraping agresivo o sin respetar términos de uso de los portales.

• Costear consultorias

• Enviar propuestas.

• Inventar credenciales o citar proyectos no existentes en el RAG.

**2.****3**** ****ARQUITECTURA ****Y STACK TÉCNICO (ALTO NIVEL)**[^7]

**Capas y servicios:**

1. Capa de adquisición de datos (scraping, APIs, descarga de TdR)
• Lenguajes: Python (el estándar para scraping y automatización).
• Librerías de scraping: Selenium 

• OCR para PDF escaneados: Tesseract OCR (open source).


2. Capa de procesamiento semántico y clasificación (NLP, match scoring)
• Modelos de lenguaje (LLM) para leer TdR y clasificarlos: GPT-5.1 (vía API).
• Embeddings para match técnico: OpenAI text-embedding-3-large.
• Motor de búsqueda semántica: Elasticsearch + ELSER (embedding nativo).
• Motor de reglas para validar requisitos: Una regla definida en Python.


3. Capa de almacenamiento (base de datos y repositorio documental)
• Base de datos estructurada: PostgreSQL (datos tabulares).

• Base documental y vectorial: S3 para almacenar PDFs y Pinecone para embeddings.


4. Capa de automatización de CVs, expedientes y plantillas
• LLM (OpenAI GPT Models) con prompts adecuados para para la elaboración de plantillas según indicaciones de practicante.

5. Agente técnico (metodología, cronograma)
• LLM con instrucciones (prompt engineering) para producir la metodología según indicaciones de junior.


**SECCIÓN 3: DATOS Y FUENTES (20 min)**

**3. ****DATOS Y FUENTES - LO MÁS CRÍTICO DEL POC**

**3.1. ****INVENTARIO DE DATOS NECESARIOS:**

**Tabla de Fuentes de ****Datos**[^8]

**3.2. ****DISPONIBILIDAD Y RESPONSABLES (completar ahora):**

**Base de credenciales (****Sharepoint****)**:

Ubicación exacta: [ ]

Estructura carpetas: Carpetas por proyecto -> Informes finales | Contrato | Constancias | Facturas y notas de abono

Permisos SEIDOR: ⏳ Frank gestiona

ETA permisos: [ ]

Documentos relevantes: Numeroso. Base de últimos 5 años

Metadata: ❌ No existe

**Base ****comprehensiva de ****CVs**** de consultores ****(****Sharepoint****)**:

Ubicación exacta: [ ]

Estructura carpetas: Carpetas por consultor -> Documentos de sustento de estudios| constancias de trabajo

Permisos SEIDOR: ⏳ Frank gestiona

ETA permisos: [ ]

Documentos relevantes: Numeroso. Base de últimos 5 años

Metadata: ❌ No existe

**Páginas web (****DEVAID****, SEACE, ****etc****)**

Acceso disponible: ✅ SÍ 

Tipo: Terminal 

Credenciales: ✅ Tenemos 

Responsable accesos: [Alvaro Monge + amonge@macroconsult.pe]

ETA acceso para SEIDOR: [ ]

Restricciones de uso: [ ]

¿Podemos usar datos en IA?: ✅ SÍ (validar licencia ahora con [responsable])

**3.3. ****PREPARACIÓN DE DATOS (timeline crítico):**

**FASE 1 – Infraestructura y Base Técnica (Días 1–****30****)**

Objetivo: montar cimientos, definir estándares, y construir flujo mínimo funcional.

Requerimientos técnicos y funcionales

Arquitectura aprobada

Creación del repositorio y CI/CD

Implementación del Orquestador (workflow + API)

Módulo de ingesta básica:
– carga de documentos
– OCR para PDFs/imagenes
– Clasificación IA inicial

Normalización inicial de documentos (JSON estructural)

Setup de vector DB para embeddings

Entregable: Minimum Viable Product (MVP) que recibe documentos y los clasifica con OCR + IA.

**FASE 2 – Inteligencia Cognitiva y Automatización (Días 31–60)**

Objetivo: implementar el sistema central.

Motor de análisis de TdR con LLM

Motor de extracción y normalización de CVs

Matching semántico (similaridad embeddings)

Módulo de detección de inconsistencias

Prototipo de llenado automático de plantillas

Pruebas internas con 10–20 casos reales

Setup de monitoreo (latencia, errores, logs semánticos)

Entregable: Sistema que ya lee TdR, analiza CVs y rellena plantillas.

**FASE ****3 – Producción y Refinamiento (Días 61–90)**[^9]

Objetivo: convertir el sistema en una herramienta de producción y validación segura.

Motor completo de documentos (Word y PDF)

Estilizador avanzado (calidad profesional de escritura)

Validador IA de coherencia total

Integración con los sistemas existentes de la empresa

Interfaz para revisión humana 

Documentación técnica completa

Entrenamiento del equipo usuario interno

Entregable: Plataforma funcional 100% automatizada para análisis de TdR, procesamiento de CVs y generación de documentos listos para cliente.

**3.4. ****CALIDAD DE DATOS - CRITERIOS DE ACEPTACIÓN:**

Para que el POC arranque, necesitamos MÍNIMO:

Base de credenciales completamente organizada y depurada, al menos 7 últimos años.

Base comprehensiva de CVs

Protocolos de llenado de las bases de credenciales y CVs.

**SECCIÓN 4: CRITERIOS DE ÉXITO (30 min)**

**4.1. ****CRITERIOS DE ÉXITO - CÓMO MEDIMOS SI FUNCIONA**

**KPIs PRIMARIOS (Must-have para Go):**

**KPI #1 – ****EFICACIA **

**KPI #****2**** – EFICIENCIA (El más importante)**

**KPI #****3**** – PRECISIÓN (Calidad de respuestas)**

**KPI #****4**** – ADOPCIÓN (¿La gente lo usa?)**

**KPIs SECUNDARIOS (Nice to have):**

# de errores técnicos reportados (0 target)

**DECISIÓN GO/NO-GO (La regla clara):**

Al final del día 60, evaluamos:

IMPORTANTE: Esta decisión la toma el Sponsor basado en datos, 

no en intuición. SEIDOR presenta datos, Sponsor decide.


| Paso | Actividades principales​ | Tiempo | Quién​ | Herramienta | Dolor / Fricción​ |
| --- | --- | --- | --- | --- | --- |
| PRIMER SUB PROCESO |  |  |  |  |  |
| Entrar a los buscadores | Acceder con usuario y contraseña | 5 minutos | - Senior 
- Jefe de área | DevAID
SEACE
Página web BM, BID, ONG, etc. | Proceso repetitivo en cada búsqueda
Pérdida de tiempo |
| Búsqueda amplia de oportunidades | Lectura de títulos
Lectura de abstracts
Categorización | 2 horas | - Senior
- Jefe de área | Manual | Proceso lento
Pérdida de convocatorias no identificadas a tiempo
No se ejecuta la actividad si personal tien tiempo ocupado |
| Filtro preliminar | Identificación preliminar de convocatorias con mayor potencial (match entre requerimientos y capacidades) | 30 minutos | - Senior
- Jefe de área | Manual | Dificultad para calificar  rápidamente credenciales de Macroconsult 
Agotamiento |
| Análisis, revisión y Priorización | - Lectura de los TdR, requisitos, plazos 
- Elección de aquellos que hacen match con nuestros intereses y posibilidades | 5 horas | - Senior
- Jefe de área | Manual 
PDF
Word | Pérdida de tiempo
Dificultad para identificar riesgos o complejidades en los TdR |
| Reunión para elección de convocatorias | Discusión de pares
Elección de convocatorias a presentarse
Asignación de analistas y practicantes responsables de armado de propuestas | 30 minutos | - Senior
- Jefe de área | Manual | Puede no haber personal disponible para armar la propuesta |
| SEGUNDO SUBPROCESO |  |  |  |  |  |
| Elab. Propuestas |  |  |  |  |  |
| Administrativa | Expediente, CVs, recopilación de soportes | 32 horas | Practicante
Senior | Manual
BD de proyectos | Proceso lento, sujeto a error |
| Técnica | Propuesta metodológica y costeo | 32 horas | Junior
Senior | Manual | Proceso complejo |
| Integración | Unificación de secciones y control de calidad | 4 horas | Senior | Manual | Proceso lento |
| Revisión final | Ajuste y validación | 8 horas | Jefe de Área | Manual | Proceso lento |


| Fuente | Datos específicos | Período | Formato |
| --- | --- | --- | --- |
| Base de credenciales
(Sharepoint) | Listado de proyectos con detalles: nombre de cliente, nombre de proyecto, monto, período, etc. | - | Excel
JSON |
|  | Contratos | - | PDF |
|  | Constancias | - | PDF |
| Base comprehensiva de CVs de consultores (Sharepoint) | Documentos de sustento académico | - | PDF
Word |
|  | Constancias de trabajo pasados | - | PDF |
| Páginas web de instituciones | SEACE | - | PDF |
|  | DEVAID | - | PDF |
|  |  |  |  |


| Elemento | Detalle |
| --- | --- |
| Métrica | Número de propuestas presentadas |
| Baseline actual | 3/mes |
| Target POC | 10/mes — (230% incremento) |
| Medición | Casos reales en días 61 a 90 |
| Responsable de medición | Yohnny Campana |
| Criterio Go / No-Go | • GO: ≥200% incremento
• Revisión: si <150% de incremento |


| Elemento | Detalle |
| --- | --- |
| Métrica | Tiempo promedio para el armado de propuestas |
| Baseline actual | 90 horas |
| Target POC | 24 horas — (70% reducción) |
| Medición | Time-tracking de casos reales en días 61 a 90 |
| Responsable de medición | Yohnny Campana |
| Criterio Go / No-Go | • GO: ≥70% reducción 
• Revisión: si <[Z-10]%, analizar causa raíz + decidir |


| Elemento | Detalle |
| --- | --- |
| Métrica | % de convocatorias identificadas por el sistema en los que se llega a postular |
| Target | ≥ 85% |
| Medición | • Porcentaje de postulaciones sobre convocatorias identificadas |
| Responsable | Yohnny Campana |
| Criterio Go / No-Go | • GO: ≥ 80% 
• Revisar y reevaluar sistema: <80% |


| Elemento | Detalle |
| --- | --- |
| Métrica | Numero de reuniones de coordinación entre jefe de área y senior / número de convocatorias identificadas |
| Target | 80% |
| Medición | % de reuniones de revisión realizadas |
| Periodo de medición | Días 61 a 90 |
| Criterio Go / No-Go | • GO: ≥ 80%
• Investigar: si 80% |


| Resultado | Condición | Acción requerida |
| --- | --- | --- |
| ✅ GO — Pasar a MVP producción | Si se cumplen ≥ 3 de 4 KPIs primarios | Avanzar a desarrollo de MVP |
| ⚠️ ITERAR — 2 semanas adicionales | Si se cumplen 2 de 4 KPIs primarios | Análisis de causa raíz + plan de mejora |
| ❌ PAUSAR / PIVOTAR | Si se cumple ≤ 1 de 4 KPIs primarios | Decidir entre re-diseñar el caso o seleccionar otro |


|  |  |
| --- | --- |
|  |  |
|  |  |
|  |  |
|  |  |


---

## Comentarios

[^1]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "PROBLEMA ESPECÍFICO QUE RESOLVEMOS:..."
  > El problema está bien descrito desde la perspectiva operativa, pero sería recomendable explicitar con mayor claridad el impacto estratégico para la firma. Se sugiere agregar explícitamente: - Impacto en crecimiento de ingresos - Pérdida de oportunidades por detección tardía - Limitaciones de escalabilidad del modelo actual Esto ayuda a que el Directorio entienda que no es solo eficiencia operativa, sino una palanca de crecimiento comercial.

[^2]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "PROCESO ACTUAL (AS-IS) - PASO A PASO:..."
  > El proceso está bien documentado en términos de tareas, pero faltaría incorporar dos elementos importantes para el análisis ejecutivo: Tasa de conversión actual - Número de licitaciones analizadas vs propuestas enviadas - Número de propuestas enviadas vs adjudicadas Nivel de pérdida de oportunidades - Convocatorias detectadas tarde - Convocatorias no detectadas Esto permitirá medir con mayor precisión el impacto real del sistema propuesto.

[^3]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "Costo Anual directo..."
  > Los costos están estimados correctamente, pero sería recomendable explicar la metodología de cálculo. Se sugiere especificar: - Costo hora promedio de senior / junior - Número de procesos por semana - Horas efectivas dedicadas al proceso Esto dará mayor solidez a la justificación económica del proyecto frente al directorio.

[^4]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "2.2. Scoring de match con capacidades institucionales..."
  > El modelo de scoring es uno de los componentes más críticos del sistema. Se recomienda especificar las variables principales del modelo, por ejemplo: - sector económico - país - monto estimado - experiencia institucional relevante - experiencia del staff - complejidad metodológica - historial de adjudicaciones Esto permitirá explicar mejor cómo se genera el score 0-100.

[^5]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "3.1. Lectura semántica del documento..."
  > La lectura semántica de TdR es una funcionalidad clave. Se recomienda especificar que el sistema también deberá detectar: - requisitos obligatorios eliminatorios - número mínimo de proyectos similares - requisitos de consorcio - restricciones geográficas - experiencia mínima del equipo Esto mejora significativamente la utilidad del sistema para decisiones Go/NoGo tempranas.

[^6]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "Intervención humana:..."
  > La automatización de propuestas es una oportunidad de alto impacto, pero también implica riesgos de calidad técnica. Se recomienda explicitar que: - la generación metodológica será asistida por IA pero siempre validada por un analista - el sistema usará plantillas institucionales preaprobadas Esto asegura consistencia con el estándar técnico de la firma.

[^7]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "2.3 ARQUITECTURA Y STACK TÉCNICO (ALTO NIVEL)..."
  > La arquitectura es sólida, pero sería recomendable agregar un componente explícito de control de calidad y trazabilidad. Ejemplo: - logs de decisiones del modelo - justificación del scoring - trazabilidad de documentos utilizados Esto es importante para auditoría interna y confianza del usuario.

[^8]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "Tabla de Fuentes de Datos..."
  > El principal riesgo del proyecto parece estar en la calidad y organización de los datos internos, particularmente: - base de credenciales - base de CVs Se recomienda incluir explícitamente una fase de data preparation, que probablemente será el principal esfuerzo inicial del proyecto. Sin esta preparación, el sistema podría tener limitaciones importantes en la calidad del matching.

[^9]: **Autor:** Arvinder Ludhiarich | **Fecha:** 2026-03-03
  **Contexto:** "FASE 3 – Producción y Refinamiento (Días 61–90)..."
  > El timeline de 90 días es razonable para un POC funcional, pero sería recomendable aclarar: - ¿Qué funcionalidades son mínimas para el POC? - ¿Cuáles corresponden a una fase posterior de escalamiento? Esto evitará expectativas excesivas durante el piloto.
