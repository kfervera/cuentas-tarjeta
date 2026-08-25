# Base de datos — Gastos Kei/Kev

Recurso compartido entre el **skill** (extracción + escritura) y la **app web** (lectura + validación manual).

## Cómo aplicarlo

1. Entra a tu proyecto en [supabase.com](https://supabase.com) → **SQL Editor**.
2. Pega el contenido de la sección "Script SQL" completo y ejecútalo.
3. Verifica en **Table Editor** que aparezcan las 3 tablas: `transacciones`, `reglas`, `resumen_estado_cuenta`.
4. (Opcional pero recomendado) En **Table Editor → reglas**, inserta las dos reglas semilla manualmente si el script no las incluyó por algún motivo — ver sección "Reglas semilla".

Guarda este archivo (`database-setup.md`) en la raíz del repo, junto al skill y a la app, como fuente de verdad del esquema.

## Reglas de negocio que implementa este esquema

- **Personas**: fijo, solo Kei y Kev.
- **Asignación automática** (aplicada por el skill al insertar, no por trigger de DB):
  1. Reglas por `comercio` (substring/regex sobre la descripción) — prioridad por fecha de creación, la más reciente gana si hay conflicto.
  2. Reglas por `titular`: `KEI → 100% Kei`, `KEVIN → 50/50`.
  3. Si nada matchea: `50/50` por defecto.
- **Saldo anterior**: se guarda como una fila más en `transacciones` (tipo `saldo_anterior`, sin titular → cae en 50/50), para que el cuadre contra el total del PDF sea directo.
- **Moneda**: PEN y USD siempre separados, nunca se mezclan ni se convierten a un total único.
- **Montos negativos** en `transacciones.monto` = abonos/pagos (no gastos).
- **Sin histórico**: el skill borra todas las filas de `transacciones` y `resumen_estado_cuenta` antes de insertar el estado de cuenta nuevo. Solo existe el último cargado. Cualquier validación manual (`confirmado`, splits) hecha sobre la carga anterior se pierde al re-correr.
- **Cuadre de validación**: `SUM(transacciones.monto) WHERE moneda = 'PEN'` debe igualar `resumen_estado_cuenta.monto_total_facturado_pen` (mismo criterio para USD).

## Script SQL

```sql
-- ============================================
-- Gastos Kei/Kev — esquema de base de datos
-- ============================================

-- Transacciones del último estado de cuenta cargado
-- (se borra y regenera completo en cada corrida del skill)
create table transacciones (
  id uuid primary key default gen_random_uuid(),
  fecha_proceso date,
  fecha_consumo date,
  descripcion text not null,
  ciudad text,
  titular text,                      -- 'KEI' | 'KEVIN' | null
  tipo text not null,                 -- consumo | pago | cargo | interes | comision | saldo_anterior
  moneda text not null check (moneda in ('PEN','USD')),
  monto numeric not null,             -- negativo = abono/pago
  monto_original_valor numeric,       -- si vino en moneda extranjera (ej. CLP)
  monto_original_moneda text,
  monto_kei numeric not null,         -- calculado por el skill según reglas
  monto_kev numeric not null,
  regla_aplicada text,                -- qué regla se usó (transparencia/debug)
  confirmado boolean not null default false,  -- true cuando el usuario ya validó manualmente en la app
  created_at timestamptz not null default now()
);

-- Reglas de asignación automática, editable desde la app
create table reglas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('titular','comercio')),
  patron text not null,               -- valor de titular, o substring/regex de comercio
  kei_pct numeric not null check (kei_pct between 0 and 100),
  kev_pct numeric not null check (kev_pct = 100 - kei_pct),
  created_at timestamptz not null default now()  -- define prioridad: más reciente = más prioridad
);

-- Totales oficiales del PDF, para validar la suma de transacciones
create table resumen_estado_cuenta (
  id uuid primary key default gen_random_uuid(),
  periodo_inicio date,
  periodo_fin date,
  monto_total_facturado_pen numeric,
  monto_total_facturado_usd numeric,
  created_at timestamptz not null default now()
);
```

## Reglas semilla

Insertar después de crear las tablas (ajusta `patron` si los nombres exactos del titular en tus PDFs difieren):

```sql
insert into reglas (tipo, patron, kei_pct, kev_pct) values
  ('titular', 'KEI', 100, 0),
  ('titular', 'KEVIN', 50, 50);
```

Para agregar una regla nueva por comercio (ejemplo, Inkafarma siempre es de Kei):

```sql
insert into reglas (tipo, patron, kei_pct, kev_pct) values
  ('comercio', 'INKAFARMA', 100, 0);
```

Al insertarse con `created_at = now()`, esta regla queda con más prioridad que las reglas semilla por titular — el skill debe evaluar `reglas` ordenadas por `created_at desc` y aplicar la **primera que matchee** (que es la más reciente).

## Políticas RLS (acceso de la app web vía `anon key`)

La app web (`web/`) nunca usa el `service_role key` — se conecta con el `anon public key`,
acotado por Row Level Security. El skill sigue usando `service_role`, que ignora RLS, así que
estas políticas no afectan su funcionamiento. Ver `plan-web.md` (decisiones D6/D7 y sección
"Seguridad") para el detalle de por qué se decidió así.

Alcance del `anon key`:
- `transacciones`: `SELECT` y `UPDATE` sin restricción de fila (no hay concepto de dueño). Sin
  `INSERT` ni `DELETE` — la carga/borrado completo es exclusivo del skill.
- `resumen_estado_cuenta`: solo `SELECT`, como referencia de cuadre.
- `reglas`: sin política para `anon` — con RLS habilitado y sin `policy`, el acceso queda
  denegado por defecto (la app no administra reglas, ver §7 de `requerimientos-web.md`).

Ejecutar en el **SQL Editor** de Supabase, en el mismo proyecto donde ya corriste el script de
la sección anterior:

```sql
-- ============================================
-- Políticas RLS — app web "Cuentas KyK" (anon key)
-- ============================================

alter table transacciones enable row level security;
alter table resumen_estado_cuenta enable row level security;
alter table reglas enable row level security;

-- transacciones: leer y editar asignación (monto_kei/monto_kev/confirmado),
-- sin poder crear ni borrar filas desde la app.
create policy "anon puede leer transacciones"
  on transacciones for select
  to anon
  using (true);

create policy "anon puede actualizar transacciones"
  on transacciones for update
  to anon
  using (true)
  with check (true);

-- resumen_estado_cuenta: solo lectura.
create policy "anon puede leer resumen_estado_cuenta"
  on resumen_estado_cuenta for select
  to anon
  using (true);

-- reglas: sin policy para "anon" a propósito — queda sin acceso.
```

Después de ejecutarlo, verifica en **Authentication → Policies** que las 3 tablas muestren RLS
habilitado y que `transacciones`/`resumen_estado_cuenta` tengan las políticas de arriba (y
`reglas` ninguna).
