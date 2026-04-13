# AGENTS.md — S1-GO: Motor de Oportunidades Go/NoGo

## Contexto del Proyecto
Eres un agente trabajando en la POC **más estratégica** para **Macroconsult**.
El problema: analistas senior dedican 90h/semana buscando y analizando licitaciones (SEACE, DevAID, BID, Banco Mundial). Costo: ~US$200K/año en horas senior.
La solución: pipeline de agentes que ingesta oportunidades → las clasifica → las puntúa (0-100) contra las capacidades de la firma → genera recomendación Go/NoGo con justificación.

## Reglas Críticas
- **El scraping real se mockea** — las licitaciones vienen de `data/oportunidades.json`.
- El **scoring engine es el corazón** — debe ser transparente y explicable.
- La UI es un dashboard de oportunidades estilo "Kanban" o tabla con filtros.
- Cada score debe venir con justificación (trazabilidad).
- Código simple. No sobre-ingeniar. LangGraph solo si simplifica, no complica.

## Stack Técnico
- **Backend:** Python 3.11 + FastAPI + LangGraph (para el pipeline de scoring)
- **IA:** OpenAI API (`gpt-4o` para análisis de TdR)
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS v4
- **Variable de entorno:** `OPENAI_API_KEY`

## Estructura
```
S1-GO/
├── AGENTS.md
├── README.md
├── docs/spec.md
├── backend/
│   ├── main.py         # FastAPI app
│   ├── scoring.py      # Motor de scoring (LangGraph pipeline)
│   ├── analyzer.py     # Análisis de TdR con OpenAI
│   └── requirements.txt
├── frontend/
│   └── src/App.tsx     # Dashboard de oportunidades
└── data/
    └── oportunidades.json  # Mock licitaciones (SEACE/DevAID simulados)
```

## Flujo Principal del Scoring (Pipeline)
1. **Ingesta:** Leer oportunidad del mock (título, resumen, TdR, requisitos)
2. **Clasificación:** Categorizar por sector, tipo, complejidad
3. **Matching:** Comparar requisitos contra capacidades de Macroconsult
4. **Scoring:** Calcular score 0-100 con justificación por dimensión
5. **Recomendación:** GO (>70) / REVISAR (40-70) / NO-GO (<40)

## Dimensiones del Score
- **Sector match** (25 pts): ¿Es un sector donde tenemos experiencia?
- **Capacidad técnica** (25 pts): ¿Tenemos las competencias requeridas?
- **Viabilidad operativa** (20 pts): ¿Podemos cumplir plazos y requisitos?
- **Potencial estratégico** (20 pts): ¿Vale la pena el esfuerzo?
- **Riesgo** (10 pts, inverso): Requisitos complejos, plazos inviables

## Lo Que Debe Funcionar
- [ ] Dashboard con lista de oportunidades y su score Go/NoGo
- [ ] Filtros por estado (GO/REVISAR/NO-GO) y sector
- [ ] Vista detallada de una oportunidad con análisis completo
- [ ] Botón "Analizar con IA" que ejecuta el scoring para una oportunidad
- [ ] Justificación del score por dimensión

## Variables de Entorno
```
OPENAI_API_KEY=sk-...
```
