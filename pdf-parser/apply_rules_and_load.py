#!/usr/bin/env python3
"""
Aplica las reglas de asignación Kei/Kev a las transacciones extraídas de un
estado de cuenta y las carga en Supabase, reemplazando por completo el
contenido anterior de `transacciones` y `resumen_estado_cuenta` (no se
guarda histórico).

Uso:
  python apply_rules_and_load.py <transacciones.json> <resumen.json>

Variables de entorno requeridas:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""
import sys
import os
import re
import json

import requests


def get_supabase_config():
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        print("Error: faltan SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.")
        sys.exit(1)
    return url.rstrip("/"), key


def sb_request(method, url, key, path, prefer="return=representation", **kwargs):
    headers = {
        "apikey": key,
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "Prefer": prefer,
    }
    resp = requests.request(method, f"{url}/rest/v1/{path}", headers=headers, **kwargs)
    resp.raise_for_status()
    return resp


def fetch_reglas(url, key):
    resp = sb_request("GET", url, key, "reglas?select=*&order=created_at.desc")
    return resp.json()


def match_regla(tx, reglas):
    # Reglas por comercio primero (más recientes primero -> la primera que matchee gana)
    for r in reglas:
        if r["tipo"] == "comercio" and tx.get("descripcion"):
            try:
                if re.search(r["patron"], tx["descripcion"], re.IGNORECASE):
                    return r
            except re.error:
                if r["patron"].upper() in tx["descripcion"].upper():
                    return r
    # Luego reglas por titular
    for r in reglas:
        if r["tipo"] == "titular" and tx.get("titular"):
            if r["patron"].upper() == tx["titular"].upper():
                return r
    return None


def apply_rules(transacciones, reglas):
    out = []
    for tx in transacciones:
        regla = match_regla(tx, reglas)
        if regla:
            kei_pct, kev_pct = float(regla["kei_pct"]), float(regla["kev_pct"])
            regla_aplicada = f"{regla['tipo']}:{regla['patron']}"
        else:
            kei_pct, kev_pct = 50.0, 50.0
            regla_aplicada = "default:50-50"

        monto = tx["monto"]
        tx["monto_kei"] = round(monto * kei_pct / 100, 2)
        tx["monto_kev"] = round(monto * kev_pct / 100, 2)
        tx["regla_aplicada"] = regla_aplicada
        out.append(tx)
    return out


def main():
    if len(sys.argv) != 3:
        print("Uso: python apply_rules_and_load.py <transacciones.json> <resumen.json>")
        sys.exit(1)

    with open(sys.argv[1], encoding="utf-8") as f:
        transacciones = json.load(f)
    with open(sys.argv[2], encoding="utf-8") as f:
        resumen = json.load(f)

    url, key = get_supabase_config()

    reglas = fetch_reglas(url, key)
    if not reglas:
        print("Advertencia: no hay reglas cargadas en Supabase — todo caerá en 50/50.")

    transacciones = apply_rules(transacciones, reglas)

    # Borra el estado de cuenta anterior (no se guarda histórico)
    sb_request("DELETE", url, key, "transacciones?id=not.is.null", prefer="return=minimal")
    sb_request(
        "DELETE", url, key, "resumen_estado_cuenta?id=not.is.null", prefer="return=minimal"
    )

    # Inserta lo nuevo
    if transacciones:
        sb_request(
            "POST", url, key, "transacciones", prefer="return=minimal", json=transacciones
        )
    sb_request(
        "POST", url, key, "resumen_estado_cuenta", prefer="return=minimal", json=[resumen]
    )

    # Validación de cuadre por moneda
    print("\n--- Validación de cuadre ---")
    for moneda, campo in (("PEN", "monto_total_facturado_pen"), ("USD", "monto_total_facturado_usd")):
        suma = round(sum(t["monto"] for t in transacciones if t["moneda"] == moneda), 2)
        esperado = resumen.get(campo)
        estado = "OK" if esperado is not None and abs(suma - esperado) < 0.01 else "REVISAR"
        print(f"[{moneda}] suma transacciones = {suma} | total facturado PDF = {esperado} | {estado}")

    sin_titular_inesperado = [
        t for t in transacciones
        if not t.get("titular") and t.get("tipo") not in ("cargo", "interes", "comision", "saldo_anterior")
    ]
    if sin_titular_inesperado:
        print(f"\nAdvertencia: {len(sin_titular_inesperado)} transacción(es) sin titular y tipo inesperado — revisar extracción.")

    print(f"\nCargadas {len(transacciones)} transacciones en Supabase.")


if __name__ == "__main__":
    main()
