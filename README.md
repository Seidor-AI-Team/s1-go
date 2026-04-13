# S1-GO — Motor de Oportunidades Go/NoGo

**POC SEIDOR IA Lab · Macroconsult**

Pipeline de IA que analiza licitaciones (SEACE, DevAID, BID, etc.) y decide automáticamente si Macroconsult debe postular.
Reduce de 90h/semana a < 2h de revisión humana.

## Setup rápido

### Backend
```bash
cd backend
cp .env.example .env
pip install -r requirements.txt
python main.py  # API en http://localhost:8001
```

### Frontend
```bash
cd frontend
npm install
npm run dev  # App en http://localhost:5178
```

## Cómo funciona
1. Dashboard con 15 oportunidades de licitación (mock SEACE/DevAID/BID)
2. Haz clic en "✨ Analizar" en cualquier oportunidad
3. El pipeline LangGraph: clasifica → calcula match → recomienda Go/NoGo
4. Ver el score por dimensión y la justificación
5. O "Analizar todas (5)" para análisis batch

## Pipeline de Scoring
- **Sector match** (25 pts): ¿Es un sector donde tenemos experiencia?
- **Capacidad técnica** (25 pts): ¿Tenemos las competencias?
- **Viabilidad operativa** (20 pts): ¿Podemos cumplir plazos y requisitos?
- **Potencial estratégico** (20 pts): ¿Vale la pena el esfuerzo?
- **Riesgo** (10 pts): Requisitos complejos, red flags

**GO** ≥70 | **REVISAR** 40-69 | **NO-GO** <40

## Stack
- Backend: Python + FastAPI + LangGraph + OpenAI GPT-4o
- Frontend: React + TypeScript + Vite + TailwindCSS v4
- Mock data: 15 licitaciones reales en `data/oportunidades.json`

## Design System
Aplicado el Design System SEIDOR oficial:
- **Background**: `#0B0D14` (dark base)
- **Cards**: `#1C1F2B` con border `#272B3A`
- **Acento**: `#1E72D9` (SEIDOR Blue)
- **Gold**: `#E8B960` (botones primarios)
- **Tipografía**: Plus Jakarta Sans (headings) + DM Sans (body)

## Estructura de carpetas
```
S1-GO/
├── backend/         # FastAPI + LangGraph
│   ├── main.py      # API endpoints
│   ├── scoring.py   # Pipeline de scoring
│   └── requirements.txt
├── frontend/        # React + Tailwind
│   ├── src/App.tsx  # Dashboard completo
│   └── src/index.css # Design System SEIDOR
└── data/
    └── oportunidades.json  # 15 licitaciones mock
```

## Puertos
- Backend: http://localhost:8001
- Frontend: http://localhost:5178
