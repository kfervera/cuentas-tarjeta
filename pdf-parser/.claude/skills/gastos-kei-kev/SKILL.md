---
name: gastos-kei-kev
description: Extrae transacciones de un estado de cuenta de tarjeta (PDF protegido con contraseña), aplica las reglas de asignación Kei/Kev configuradas en Supabase, y carga el resultado en la base de datos, reemplazando el estado de cuenta anterior. Usa este skill siempre que el usuario mencione procesar/cargar/subir un estado de cuenta, un PDF de tarjeta VISA/BCP, o pida "correr el skill de gastos".
---

# Gastos Kei/Kev — extracción y carga de estado de cuenta

Este skill procesa un estado de cuenta de tarjeta de crédito (PDF con contraseña) y deja las
transacciones listas en Supabase para que la app web las muestre y el usuario las valide.

No mantiene histórico: cada corrida **reemplaza por completo** el contenido de las tablas
`transacciones` y `resumen_estado_cuenta`. Ver `database-setup.md` en la raíz del repo para el
esquema completo y las reglas de negocio.

## Requisitos previos (una sola vez)

1. Haber corrido el script SQL de `database-setup.md` en el proyecto de Supabase.
2. Variables de entorno disponibles en la sesión:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Dependencias Python instaladas: `pip install -r scripts/requirements.txt --break-system-packages`

## Flujo

### 1. Pide la ruta del PDF y la contraseña

Si el usuario no las dio en el mensaje, pregúntalas. **La contraseña nunca debe escribirse en
archivos, ni quedar en el historial de la conversación de forma persistente.** Pide al usuario que
la exporte como variable de entorno antes de correr el skill:

```bash
export GASTOS_PDF_PASSWORD='su-password'
```

Si no la exportó, `decrypt_pdf.py` la pedirá interactivamente (no la escribas tú por él).

### 2. Desencripta el PDF

```bash
python scripts/decrypt_pdf.py <ruta/al/estado.pdf> /tmp/estado_desencriptado.pdf
```

### 3. Lee el PDF desencriptado y extrae las transacciones

Usa la herramienta de lectura de archivos (`view` o equivalente) sobre
`/tmp/estado_desencriptado.pdf` para ver el contenido. Extrae **todas** las transacciones del
detalle (todas las páginas, todos los titulares) a un array JSON con este formato exacto —
cada objeto es una fila de `transacciones`:

```json
[
  {
    "fecha_proceso": "2026-07-13",
    "fecha_consumo": "2026-07-11",
    "descripcion": "ARUMA REAL PLAZA CAJAM",
    "ciudad": "CAJAMARCA",
    "titular": "KEI",
    "tipo": "consumo",
    "moneda": "PEN",
    "monto": 56.60,
    "monto_original_valor": null,
    "monto_original_moneda": null
  }
]
```

Reglas de extracción a seguir:

- **Titular**: normaliza a `"KEI"` o `"KEVIN"` según la sección del PDF donde aparece la
  transacción (el PDF agrupa las transacciones bajo el nombre del titular de cada tarjeta
  adicional). Si es un cargo administrativo sin titular (comisión, cuota del mes, seguro,
  intereses), deja `titular: null`.
- **Tipo**: `consumo` | `pago` | `cargo` | `interes` | `comision` | `saldo_anterior`. La fila
  `SALDO ANTERIOR` del PDF **sí se incluye** como una transacción más, con `tipo:
  "saldo_anterior"` y `titular: null`.
- **Monto**: los pagos (ej. "PAGO BANCA MOVIL") vienen negativos en el PDF — consérvalos como
  número negativo en `monto` (son abonos, no gastos).
- **Moneda**: usa la columna donde efectivamente aparece el monto (Soles → `"PEN"`,
  Dólares → `"USD"`). Nunca combines ambas en un solo monto convertido.
- **Monto original**: si la transacción muestra un monto en moneda extranjera distinta (ej.
  "697800.00 CHILEAN PESO" bajo una línea en dólares), guarda ese valor y esa moneda en
  `monto_original_valor` / `monto_original_moneda`. El `monto` principal sigue siendo el de
  facturación (USD o PEN).

Guarda este array en un archivo, ej. `/tmp/transacciones.json`.

### 4. Extrae el resumen del estado de cuenta

Del mismo PDF, toma el periodo de facturación y el "MONTO TOTAL FACTURADO" (separado por
moneda). Guarda un único objeto en `/tmp/resumen.json`:

```json
{
  "periodo_inicio": "2026-07-13",
  "periodo_fin": "2026-08-10",
  "monto_total_facturado_pen": 5912.24,
  "monto_total_facturado_usd": 136.96
}
```

### 5. Aplica las reglas y carga en Supabase

```bash
python scripts/apply_rules_and_load.py /tmp/transacciones.json /tmp/resumen.json
```

Este script:
- Trae las reglas actuales desde la tabla `reglas` de Supabase.
- Aplica primero reglas de tipo `comercio` (regex/substring sobre `descripcion`, evaluadas de
  la más reciente a la más antigua — la primera que matchee gana), luego reglas de tipo
  `titular`, y si nada matchea usa 50/50 por defecto.
- Calcula `monto_kei` y `monto_kev` para cada transacción y registra qué regla se usó en
  `regla_aplicada`.
- **Borra** todas las filas existentes en `transacciones` y `resumen_estado_cuenta`.
- Inserta las transacciones y el resumen nuevos.
- Imprime la validación de cuadre por moneda: suma de transacciones vs. `monto_total_facturado`
  del PDF. Si dice `REVISAR` en vez de `OK`, algo se extrajo mal — revisa el JSON antes de
  confiar en los datos cargados.

### 6. Reporta al usuario

Muestra: cuántas transacciones se cargaron, el resultado del cuadre por moneda (PEN y USD), y
cualquier transacción que haya quedado con `titular: null` fuera de los tipos administrativos
esperados (podría ser un error de extracción).

## Notas

- Este skill no crea las tablas — deben existir de antemano (`database-setup.md`).
- No pidas ni guardes la contraseña del PDF en ningún archivo del repo.
- Si el usuario quiere agregar una regla nueva por comercio, esto se hace directo en Supabase
  (tabla `reglas`, ver `database-setup.md`) — no es parte de este skill.
