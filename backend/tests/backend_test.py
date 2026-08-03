"""Backend tests for Imperio Shopify AI"""
import os
import json
import time
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://master-store-builder.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------- Agents ----------
def test_get_agents_returns_10():
    r = requests.get(f"{API}/agents", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) == 10
    ids = {a["id"] for a in data}
    expected = {"productos", "automatizacion", "capital", "clonacion", "finanzas",
                "rrss", "edicion", "estetica", "ventas", "cerebro"}
    assert ids == expected
    for a in data:
        for k in ("id", "name", "role", "icon", "status", "tasks"):
            assert k in a, f"missing {k}"
        assert isinstance(a["tasks"], int)
        assert a["status"] in ("activo", "optimizando")


# ---------- Metrics ----------
def test_get_metrics_fields():
    r = requests.get(f"{API}/metrics", timeout=15)
    assert r.status_code == 200
    d = r.json()
    for k in ("ingresos", "beneficio", "tiendas", "productos", "tareas_activas", "roas"):
        assert k in d
    assert d["tiendas"] == 14
    assert isinstance(d["roas"], (int, float))
    assert d["ingresos"] > 1_000_000


# ---------- Activity ----------
def test_get_activity_returns_14():
    r = requests.get(f"{API}/activity", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    assert len(items) == 14
    for it in items:
        for k in ("id", "agent_id", "agent_name", "text", "timestamp"):
            assert k in it


# ---------- Invalid agent ----------
def test_invalid_agent_chat_404():
    r = requests.post(f"{API}/agents/invalido/chat", json={"message": "hola"}, timeout=15)
    assert r.status_code == 404


def test_invalid_agent_messages_404():
    r = requests.get(f"{API}/agents/invalido/messages", timeout=15)
    assert r.status_code == 404


# ---------- Chat SSE + persistence ----------
def test_chat_cerebro_streams_and_persists():
    # Clear prior history
    requests.delete(f"{API}/agents/cerebro/messages", timeout=15)

    msg = "Dime en una frase corta qué es dropshipping."
    r = requests.post(f"{API}/agents/cerebro/chat", json={"message": msg},
                      stream=True, timeout=60)
    assert r.status_code == 200
    assert "text/event-stream" in r.headers.get("content-type", "")

    deltas = []
    done = False
    err = None
    start = time.time()
    for raw in r.iter_lines(decode_unicode=True):
        if time.time() - start > 60:
            break
        if not raw or not raw.startswith("data: "):
            continue
        try:
            payload = json.loads(raw[6:])
        except Exception:
            continue
        if "delta" in payload:
            deltas.append(payload["delta"])
        elif payload.get("done"):
            done = True
            break
        elif "error" in payload:
            err = payload["error"]
            break

    assert err is None, f"stream error: {err}"
    assert done, "did not receive done event"
    full = "".join(deltas)
    assert len(full) > 10, f"response too short: {full!r}"

    # Persistence check
    time.sleep(1)
    r2 = requests.get(f"{API}/agents/cerebro/messages", timeout=15)
    assert r2.status_code == 200
    hist = r2.json()
    assert len(hist) >= 2
    roles = [m["role"] for m in hist]
    assert "user" in roles and "assistant" in roles
    assert any(m["role"] == "user" and msg in m["content"] for m in hist)
    assert any(m["role"] == "assistant" and len(m["content"]) > 10 for m in hist)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
