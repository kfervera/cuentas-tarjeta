// Nombres cortos armados a mano (no Intl.DateTimeFormat): la abreviatura de
// mes en es-PE agrega un punto final ("25-ago.") y depende de los datos CLDR
// del runtime, que pueden variar entre entornos (local vs. Vercel).
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// `fecha` viene como 'YYYY-MM-DD' (columna `date` de Postgres) — se parsean
// los componentes directo del string en vez de pasarlo a `new Date()`, que lo
// interpretaría como UTC y podría correrse un día en husos horarios detrás de
// UTC (como Perú).
export function formatFecha(fecha: string | null): string {
  if (!fecha) return "—";

  const [, month, day] = fecha.split("-").map(Number);
  return `${day} ${MESES[month - 1]}`;
}
