"""
scoring.py — Motor de scoring Go/NoGo usando LangGraph
Pipeline: clasificar → match → score → recomendar
"""
import os
import json
from typing import TypedDict, Optional
from openai import AsyncOpenAI
from langgraph.graph import StateGraph, END

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---- Capacidades de Macroconsult ----
CAPACIDADES = {
    "sectores": {
        "economía": 5, "finanzas": 5, "política fiscal": 5, "presupuesto": 5,
        "mercados de capital": 4, "banca": 4, "minería": 4, "energía": 4,
        "agricultura": 3, "salud": 3, "transporte": 3, "infraestructura": 3,
        "tecnología": 2, "educación": 2, "medio ambiente": 3
    },
    "tipos": ["estudio económico", "evaluación de impacto", "política pública", "asesoría regulatoria",
              "valorización", "due diligence", "análisis de mercado", "investigación", "análisis económico"],
    "organismos": ["BID", "Banco Mundial", "CAF", "USAID", "PNUD", "SMV", "MEF", "BCRP", "SBS",
                   "Sunat", "OSIPTEL", "SBS", "OPS", "ONU"],
    "red_flags": ["SAP Partner", "Oracle Partner", "SIAF", "implementación ERP", "certificación técnica",
                  "presencia física", "software", "construcción", "ingeniería civil", "obra"]
}

# ---- Estado del grafo ----
class ScoringState(TypedDict):
    oportunidad: dict
    clasificacion: Optional[dict]
    match_score: Optional[dict]
    score_final: Optional[int]
    recomendacion: Optional[str]
    justificacion: Optional[str]
    errores: list[str]


# ---- Nodos del grafo ----

async def clasificar(state: ScoringState) -> ScoringState:
    """Clasifica la oportunidad: sector, tipo, complejidad."""
    op = state["oportunidad"]

    prompt = f"""Analiza esta oportunidad de consultoría y clasifícala:

Título: {op['titulo']}
Entidad: {op['entidad']}
Descripción: {op['descripcion_corta']}
TdR (extracto): {op.get('tdr_texto', '')[:800]}
Requisitos clave: {op.get('requisitos_clave', [])}

Responde SOLO con JSON:
{{
  "sector_principal": "economía | finanzas | política fiscal | minería | etc.",
  "tipo_consultoria": "estudio económico | evaluación de impacto | etc.",
  "complejidad": "alta | media | baja",
  "requiere_trabajo_campo": true|false,
  "requiere_presencia_regional": true|false,
  "idiomas_requeridos": ["español"],
  "red_flags": ["lista de requisitos que Macroconsult NO puede cumplir, vacía si ninguno"],
  "resumen_tdr": "Resumen ejecutivo del TdR en 2-3 oraciones"
}}"""

    try:
        resp = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0,
        )
        clasificacion = json.loads(resp.choices[0].message.content)
        return {**state, "clasificacion": clasificacion}
    except Exception as e:
        return {**state, "errores": state["errores"] + [f"Error clasificación: {e}"]}


async def calcular_match(state: ScoringState) -> ScoringState:
    """Calcula el score de match por dimensión."""
    if not state.get("clasificacion"):
        return state

    op = state["oportunidad"]
    cls = state["clasificacion"]

    # Sector match (25 pts)
    sector = cls.get("sector_principal", "").lower()
    sector_pts = 0
    for s, pts in CAPACIDADES["sectores"].items():
        if s in sector or sector in s:
            sector_pts = min(25, pts * 5)
            break

    # Tipo consultoría (25 pts)
    tipo = cls.get("tipo_consultoria", "").lower()
    tipo_pts = 0
    for t in CAPACIDADES["tipos"]:
        if t in tipo or tipo in t:
            tipo_pts = 25
            break
    if tipo_pts == 0 and any(kw in tipo for kw in ["análisis", "estudio", "evaluación"]):
        tipo_pts = 15

    # Viabilidad operativa (20 pts)
    viabilidad_pts = 20
    red_flags = cls.get("red_flags", [])
    for flag in CAPACIDADES["red_flags"]:
        if any(flag.lower() in r.lower() for r in red_flags):
            viabilidad_pts = max(0, viabilidad_pts - 10)
    if cls.get("requiere_presencia_regional"):
        viabilidad_pts = max(0, viabilidad_pts - 5)

    # Potencial estratégico (20 pts)
    monto = op.get("monto_estimado", 0)
    moneda = op.get("moneda", "PEN")
    monto_usd = monto / 3.7 if moneda == "PEN" else monto
    estrategico_pts = min(20, int(monto_usd / 10000))  # 1 pt por cada 10K USD

    entidad = op.get("entidad", "")
    for org in CAPACIDADES["organismos"]:
        if org in entidad:
            estrategico_pts = min(20, estrategico_pts + 5)
            break

    # Riesgo (10 pts inverso)
    riesgo_pts = 10
    if len(red_flags) > 2:
        riesgo_pts -= len(red_flags) * 2
    riesgo_pts = max(0, riesgo_pts)

    score_total = sector_pts + tipo_pts + viabilidad_pts + estrategico_pts + riesgo_pts
    score_total = min(100, score_total)

    match_score = {
        "sector_match": sector_pts,
        "capacidad_tecnica": tipo_pts,
        "viabilidad_operativa": viabilidad_pts,
        "potencial_estrategico": estrategico_pts,
        "riesgo_inverso": riesgo_pts,
        "total": score_total,
        "red_flags_detectados": red_flags,
    }

    return {**state, "match_score": match_score, "score_final": score_total}


async def recomendar(state: ScoringState) -> ScoringState:
    """Genera la recomendación y justificación."""
    if not state.get("score_final"):
        return state

    score = state["score_final"]
    op = state["oportunidad"]
    cls = state.get("clasificacion", {})
    match = state.get("match_score", {})

    if score >= 70:
        rec = "GO"
    elif score >= 40:
        rec = "REVISAR"
    else:
        rec = "NO-GO"

    prompt = f"""Eres un analista senior de Macroconsult evaluando una oportunidad de licitación.

Oportunidad: {op['titulo']}
Score: {score}/100
Decisión: {rec}

Puntos por dimensión:
- Sector match: {match.get('sector_match', 0)}/25
- Capacidad técnica: {match.get('capacidad_tecnica', 0)}/25
- Viabilidad operativa: {match.get('viabilidad_operativa', 0)}/20
- Potencial estratégico: {match.get('potencial_estrategico', 0)}/20
- Riesgo (inverso): {match.get('riesgo_inverso', 0)}/10

Red flags: {match.get('red_flags_detectados', [])}
Resumen TdR: {cls.get('resumen_tdr', '')}

Escribe la justificación de la recomendación en 3-4 oraciones concisas.
Menciona específicamente qué hace que esta oportunidad sea {rec} para Macroconsult."""

    try:
        resp = await client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=200,
        )
        justificacion = resp.choices[0].message.content
    except Exception as e:
        justificacion = f"Score {score}/100 — {rec}. Error generando justificación: {e}"

    return {**state, "recomendacion": rec, "justificacion": justificacion}


# ---- Construir el grafo ----

def build_scoring_graph():
    graph = StateGraph(ScoringState)
    graph.add_node("clasificar", clasificar)
    graph.add_node("calcular_match", calcular_match)
    graph.add_node("recomendar", recomendar)

    graph.set_entry_point("clasificar")
    graph.add_edge("clasificar", "calcular_match")
    graph.add_edge("calcular_match", "recomendar")
    graph.add_edge("recomendar", END)

    return graph.compile()


_pipeline = None

def get_pipeline():
    global _pipeline
    if _pipeline is None:
        _pipeline = build_scoring_graph()
    return _pipeline


async def score_oportunidad(oportunidad: dict) -> dict:
    """Ejecuta el pipeline completo y retorna el análisis."""
    pipeline = get_pipeline()

    initial_state: ScoringState = {
        "oportunidad": oportunidad,
        "clasificacion": None,
        "match_score": None,
        "score_final": None,
        "recomendacion": None,
        "justificacion": None,
        "errores": [],
    }

    result = await pipeline.ainvoke(initial_state)
    return result
