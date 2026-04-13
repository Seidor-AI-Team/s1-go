"""
S1-GO: Motor de Oportunidades Go/NoGo
Backend FastAPI
"""
import os
import json
import copy
from pathlib import Path
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from scoring import score_oportunidad

load_dotenv()

app = FastAPI(title="S1-GO — Motor Oportunidades Go/NoGo", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5178", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = Path(__file__).parent / "data" / "oportunidades.json"
_state: dict = {}


def load_data() -> dict:
    with open(DATA_PATH, encoding="utf-8") as f:
        return json.load(f)


def get_state() -> dict:
    if not _state:
        data = load_data()
        _state["oportunidades"] = {op["id"]: copy.deepcopy(op) for op in data["oportunidades"]}
        _state["capacidades"] = data["capacidades_macroconsult"]
    return _state


def get_summary(op: dict) -> dict:
    return {
        "id": op["id"],
        "titulo": op["titulo"],
        "fuente": op["fuente"],
        "entidad": op["entidad"],
        "sector": op["sector"],
        "tipo": op["tipo"],
        "monto_estimado": op["monto_estimado"],
        "moneda": op["moneda"],
        "fecha_limite": op["fecha_limite"],
        "duracion_meses": op["duracion_meses"],
        "estado": op["estado"],
        "score": op.get("analisis", {}).get("score_final") if op.get("analisis") else None,
        "recomendacion": op.get("analisis", {}).get("recomendacion") if op.get("analisis") else None,
    }


@app.get("/")
def root():
    state = get_state()
    total = len(state["oportunidades"])
    analizadas = sum(1 for op in state["oportunidades"].values() if op.get("analisis"))
    go = sum(1 for op in state["oportunidades"].values() if (op.get("analisis") or {}).get("recomendacion") == "GO")
    revisar = sum(1 for op in state["oportunidades"].values() if (op.get("analisis") or {}).get("recomendacion") == "REVISAR")
    no_go = sum(1 for op in state["oportunidades"].values() if (op.get("analisis") or {}).get("recomendacion") == "NO-GO")
    return {"total": total, "analizadas": analizadas, "GO": go, "REVISAR": revisar, "NO-GO": no_go}


@app.get("/api/oportunidades")
def list_oportunidades(status: str = None, sector: str = None):
    state = get_state()
    ops = list(state["oportunidades"].values())

    if status:
        ops = [op for op in ops if (op.get("analisis") or {}).get("recomendacion") == status.upper()
               or (status.lower() == "pendiente" and not op.get("analisis"))]
    if sector:
        ops = [op for op in ops if sector.lower() in op.get("sector", "").lower()]

    return {
        "oportunidades": [get_summary(op) for op in ops],
        "stats": root(),
    }


@app.get("/api/oportunidades/{op_id}")
def get_oportunidad(op_id: str):
    state = get_state()
    if op_id not in state["oportunidades"]:
        raise HTTPException(status_code=404, detail="Oportunidad no encontrada")
    return state["oportunidades"][op_id]


@app.post("/api/oportunidades/{op_id}/analizar")
async def analizar_oportunidad(op_id: str):
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY no configurada")

    state = get_state()
    if op_id not in state["oportunidades"]:
        raise HTTPException(status_code=404, detail="Oportunidad no encontrada")

    op = state["oportunidades"][op_id]
    result = await score_oportunidad(op)

    # Guardar análisis en state
    op["analisis"] = {
        "score_final": result.get("score_final"),
        "recomendacion": result.get("recomendacion"),
        "justificacion": result.get("justificacion"),
        "clasificacion": result.get("clasificacion"),
        "match_score": result.get("match_score"),
        "errores": result.get("errores", []),
    }
    op["estado"] = "analizado"

    return {
        "id": op_id,
        "titulo": op["titulo"],
        "analisis": op["analisis"],
    }


@app.post("/api/oportunidades/batch-analizar")
async def batch_analizar():
    """Analiza todas las oportunidades pendientes."""
    if not os.getenv("OPENAI_API_KEY"):
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY no configurada")

    state = get_state()
    pendientes = [op_id for op_id, op in state["oportunidades"].items() if not op.get("analisis")]
    resultados = []

    for op_id in pendientes[:5]:  # Limitar a 5 para el POC (evitar timeout)
        op = state["oportunidades"][op_id]
        result = await score_oportunidad(op)
        op["analisis"] = {
            "score_final": result.get("score_final"),
            "recomendacion": result.get("recomendacion"),
            "justificacion": result.get("justificacion"),
            "clasificacion": result.get("clasificacion"),
            "match_score": result.get("match_score"),
        }
        op["estado"] = "analizado"
        resultados.append({"id": op_id, "score": result.get("score_final"), "rec": result.get("recomendacion")})

    return {"procesadas": len(resultados), "resultados": resultados}


@app.post("/api/reset")
def reset():
    _state.clear()
    get_state()
    return {"status": "reseteado"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
