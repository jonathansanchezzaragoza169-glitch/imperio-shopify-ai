#!/usr/bin/env python3
"""
IMPERIO SHOPIFY AI - SCRIPT DE INICIO REAL
==========================================

Este script arranca todo el sistema 24/7:

1. Verifica que Python y dependencias estan instaladas
2. Verifica que MongoDB esta corriendo
3. Arranca el backend FastAPI
4. Arranca el frontend React
5. Activa el motor autonomo 24/7

USO:
    python3 start.py

REQUISITOS:
    - Python 3.10+
    - Node.js 18+
    - MongoDB (local o Atlas)
    - Archivo .env configurado (copia .env.example)
"""

import subprocess
import sys
import os
import time
import signal

def check_python():
    """Verifica Python 3.10+"""
    version = sys.version_info
    print(f"[CHECK] Python {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print("[ERROR] Necesitas Python 3.10+. Descarga de python.org")
        sys.exit(1)
    print("[OK] Python OK")


def check_env():
    """Verifica que .env existe"""
    env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
    if not os.path.exists(env_path):
        print("[ERROR] Falta backend/.env")
        print("        Copia backend/.env.example a backend/.env y edita con tus credenciales:")
        print("        cp backend/.env.example backend/.env")
        print("        nano backend/.env")
        sys.exit(1)

    with open(env_path) as f:
        content = f.read()
    if "tu_key" in content or "tu-tienda" in content:
        print("[WARN] .env tiene valores de ejemplo. Edita con tus credenciales reales.")
        print("       El sistema arrancara pero no conectara a Shopify ni LLM hasta que lo edites.")
    else:
        print("[OK] .env configurado")


def check_mongodb():
    """Verifica que MongoDB esta disponible"""
    try:
        result = subprocess.run(
            [sys.executable, "-c",
             "import pymongo; c=pymongo.MongoClient('mongodb://localhost:27017', serverSelectionTimeoutMS=2000); c.server_info(); print('MongoDB OK')"],
            capture_output=True, text=True, timeout=10
        )
        if "MongoDB OK" in result.stdout:
            print("[OK] MongoDB local OK")
            return True
    except Exception:
        pass

    # Check if MONGO_URL in .env points to Atlas
    env_path = os.path.join(os.path.dirname(__file__), "backend", ".env")
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                if line.startswith("MONGO_URL=") and "mongodb+srv" in line:
                    print("[OK] MongoDB Atlas configurado en .env")
                    return True

    print("[WARN] MongoDB no detectado localmente.")
    print("       Opciones:")
    print("       1. Instala MongoDB: sudo apt install mongodb && sudo systemctl start mongodb")
    print("       2. Usa MongoDB Atlas gratis: https://cloud.mongodb.com (copia URL en .env)")
    return False


def install_backend_deps():
    """Instala dependencias de Python"""
    req_path = os.path.join(os.path.dirname(__file__), "backend", "requirements.txt")
    print("[INSTALL] Instalando dependencias de Python...")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", req_path],
        capture_output=False
    )
    if result.returncode != 0:
        print("[ERROR] Error instalando dependencias. Ejecuta manualmente:")
        print(f"        pip install -r {req_path}")
        sys.exit(1)
    print("[OK] Dependencias Python instaladas")


def install_frontend_deps():
    """Instala dependencias de Node.js"""
    frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
    node_modules = os.path.join(frontend_path, "node_modules")
    if os.path.exists(node_modules):
        print("[OK] Frontend ya tiene node_modules")
        return

    print("[INSTALL] Instalando dependencias de Node.js (puede tardar 2-5 min)...")
    result = subprocess.run(
        ["npm", "install"], cwd=frontend_path, capture_output=False
    )
    if result.returncode != 0:
        print("[ERROR] Error instalando npm. Ejecuta manualmente:")
        print(f"        cd frontend && npm install")
        sys.exit(1)
    print("[OK] Dependencias Node.js instaladas")


def start_backend():
    """Arranca el backend FastAPI"""
    print("[START] Arrancando backend (puerto 8001)...")
    backend_path = os.path.join(os.path.dirname(__file__), "backend")
    proc = subprocess.Popen(
        [sys.executable, "server.py"],
        cwd=backend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    time.sleep(3)
    if proc.poll() is not None:
        print("[ERROR] Backend murio al arrancar. Revisa:")
        print("        cd backend && python server.py")
        sys.exit(1)
    print(f"[OK] Backend arrancado (PID {proc.pid}) en http://localhost:8001")
    return proc


def start_frontend():
    """Arranca el frontend React"""
    print("[START] Arrancando frontend (puerto 3000)...")
    frontend_path = os.path.join(os.path.dirname(__file__), "frontend")
    proc = subprocess.Popen(
        ["npm", "start"],
        cwd=frontend_path,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    time.sleep(5)
    print(f"[OK] Frontend arrancado (PID {proc.pid}) en http://localhost:3000")
    return proc


def main():
    print("=" * 60)
    print("  IMPERIO SHOPIFY AI - INICIO DEL SISTEMA 24/7")
    print("=" * 60)
    print()

    # 1. Check Python
    check_python()

    # 2. Check .env
    check_env()

    # 3. Check MongoDB
    check_mongodb()

    # 4. Install deps
    print()
    install_backend_deps()
    install_frontend_deps()

    # 5. Start everything
    print()
    backend_proc = start_backend()
    frontend_proc = start_frontend()

    print()
    print("=" * 60)
    print("  SISTEMA ARRANCADO!")
    print("=" * 60)
    print()
    print("  Dashboard:  http://localhost:3000")
    print("  Backend API: http://localhost:8001/api")
    print("  Docs API:    http://localhost:8001/docs")
    print()
    print("  Pestanas disponibles:")
    print("  - IMASD (agentes buscando beneficio)")
    print("  - 24/7 (Quick Start, scheduler)")
    print("  - Suscripciones (PayPal, Shopify)")
    print("  - Wallet (dinero, tarjetas, banco)")
    print("  - Conectores (24 servicios)")
    print("  - Herramientas (32+ herramientas)")
    print("  - Y mas...")
    print()
    print("  AUTO-CONNECT: El sistema conecta todo solo.")
    print("  Si pusiste tus keys en .env, ya estan conectadas.")
    print()
    print("  Presiona Ctrl+C para parar todo.")
    print()

    try:
        while True:
            time.sleep(1)
            if backend_proc.poll() is not None:
                print("[ERROR] Backend se detuvo")
                break
            if frontend_proc.poll() is not None:
                print("[WARN] Frontend se detuvo (puede ser normal en produccion)")
    except KeyboardInterrupt:
        print("\n[STOP] Parando sistema...")
        backend_proc.terminate()
        frontend_proc.terminate()
        print("[OK] Sistema detenido. Hasta pronto!")


if __name__ == "__main__":
    main()
