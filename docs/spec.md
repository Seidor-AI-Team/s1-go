# Spec — S1-GO: Motor de Oportunidades Go/NoGo

## Problema
Macroconsult analiza licitaciones de SEACE, DevAID, BID, Banco Mundial, etc. manualmente:
- 90 horas/semana por personal senior
- Costo: ~US$200K/año
- Frecuencia actual: 2x/semana | Target: en tiempo real
- Riesgo: se pierden oportunidades por no detectarlas a tiempo

## Solución Target
Pipeline automatizado que:
1. Ingesta oportunidades (mock en POC, scraping real en MVP)
2. Analiza el TdR con IA
3. Puntúa el fit con Macroconsult (0-100)
4. Genera recomendación Go/NoGo con justificación

## Capacidades de Macroconsult (Base de conocimiento mock)

### Sectores de experiencia
- Economía y finanzas (★★★★★)
- Política fiscal y presupuesto (★★★★★)
- Mercados de capital y banca (★★★★)
- Minería y energía (★★★★)
- Agricultura y desarrollo rural (★★★)
- Salud pública (★★★)
- Transporte e infraestructura (★★★)
- Tecnología e innovación (★★)
- Educación (★★)

### Tipos de consultoría
- Estudios económicos y de mercado ✓
- Evaluación de impacto ✓
- Diseño de políticas públicas ✓
- Asesoría regulatoria ✓
- Valorización de empresas ✓
- Due diligence financiero ✓

### Requisitos comunes que SÍ cumplimos
- Experiencia en estudios similares (últimos 10 años)
- Staff con maestría/doctorado en economía
- Experiencia en proyectos BID, BM, CAF
- Capacidad de trabajo en español e inglés

## Oportunidades Mock (15 licitaciones)
Ver `data/oportunidades.json` para la lista completa.
Incluye: SEACE (Perú), DevAID, BID, Banco Mundial, USAID, ONU.

## Reglas de Scoring

### Score por Dimensión
```
TOTAL = sector_match + capacidad + viabilidad + estrategico + (10 - riesgo)
```

| Dimensión | Peso | Alto (max pts) | Bajo (0 pts) |
|-----------|------|----------------|--------------|
| Sector match | 25 | Sector core | Sector desconocido |
| Capacidad técnica | 25 | Tenemos todas las competencias | Falta experiencia clave |
| Viabilidad operativa | 20 | Plazo razonable, sin requisitos imposibles | Plazo <15 días, requisitos inalcanzables |
| Potencial estratégico | 20 | Alto monto, cliente estratégico | Bajo monto, cliente sin potencial |
| Riesgo (inverso) | 10 | Sin riesgos | Muchos requisitos eliminatorios |

### Decisión Final
- Score ≥ 70: **GO** 🟢 — Preparar propuesta
- Score 40-69: **REVISAR** 🟡 — Requiere análisis adicional por senior
- Score < 40: **NO-GO** 🔴 — Archivar automáticamente

## Pantallas

### Pantalla 1: Dashboard de Oportunidades
- Resumen: total | GO | REVISAR | NO-GO
- Filtros: status | sector | fuente | fecha límite
- Tabla/cards con: título, fuente, sector, monto, fecha límite, score, status
- Botón "Analizar" por oportunidad no procesada
- Botón "Analizar todas" (batch)

### Pantalla 2: Detalle de Oportunidad
- Header: título, fuente, fecha publicación, fecha límite
- Resumen ejecutivo del TdR (generado por IA)
- Scorecard visual con los 5 dimensiones (barras de progreso)
- Score total + badge Go/NoGo
- Justificación narrativa
- Requisitos clave detectados
- Riesgos identificados

## API Endpoints

### GET /api/oportunidades
Lista todas con su score (si ya fue analizada).

### GET /api/oportunidades/{id}
Detalle completo de una oportunidad.

### POST /api/oportunidades/{id}/analizar
Ejecuta el pipeline de scoring para una oportunidad.

### POST /api/oportunidades/batch-analizar
Analiza todas las oportunidades pendientes.

## Criterios de Éxito
- KPI #1 Eficiencia: 90h/semana → < 2h/semana de revisión humana
- KPI #2 Precisión: ≥ 85% de oportunidades bien clasificadas (validado por senior)
- KPI #3 Incremento: +230% en propuestas presentadas (de 3 a 10/mes)
