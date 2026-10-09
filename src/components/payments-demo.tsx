import React, { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import { CommunityModel } from "../data/communitiesData";

type Quota = { reference: string; home: string; concept: string; due: string; issued: number; paid: number };
type Snapshot = { rows: Quota[]; source: string; updated: string };
const headers = ["Referencia", "Vivienda", "Concepto", "Vencimiento", "Cuota", "Cobrado"];
const money = (cents: number) => (cents / 100).toLocaleString("es-ES", { style: "currency", currency: "EUR" });
const today = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
const validDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;

export function quotaStatus(row: Quota, date: string) {
  if (row.paid === row.issued) return "Pagado";
  if (row.due >= date) return "Por vencer";
  return row.paid > 0 ? "Pago parcial" : "Vencido";
}

function amount(value: unknown, row: number) {
  const normalized = typeof value === "string" ? value.trim().replace(",", ".") : value;
  if (normalized === "" || normalized === null || normalized === undefined || !/^\d+(\.\d{1,2})?$/.test(String(normalized))) {
    throw new Error(`Fila ${row}: introduce importes positivos con hasta dos decimales, sin símbolos ni separadores de miles.`);
  }
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents)) throw new Error(`Fila ${row}: importe fuera de rango.`);
  return cents;
}

export function parseQuotaRows(raw: Record<string, unknown>[], homes: string[]): Quota[] {
  if (!raw.length) throw new Error("La hoja Cuotas está vacía.");
  if (raw.length > 5000) throw new Error("El prototipo admite un máximo de 5.000 cuotas por archivo.");
  const missing = headers.filter(header => !(header in raw[0]));
  if (missing.length) throw new Error(`Faltan columnas: ${missing.join(", ")}.`);
  const seen = new Set<string>();
  return raw.map((input, index) => {
    const row = index + 2;
    const reference = String(input.Referencia ?? "").trim();
    const home = String(input.Vivienda ?? "").trim();
    const concept = String(input.Concepto ?? "").trim();
    const due = String(input.Vencimiento ?? "").trim();
    if (!reference || !concept) throw new Error(`Fila ${row}: faltan referencia o concepto.`);
    if (seen.has(reference)) throw new Error(`Fila ${row}: referencia repetida (${reference}).`);
    seen.add(reference);
    if (!homes.includes(home)) throw new Error(`Fila ${row}: la vivienda «${home}» no pertenece al censo actual. Copia su identificador del ejemplo.`);
    if (!validDate(due)) throw new Error(`Fila ${row}: usa una fecha válida en formato AAAA-MM-DD.`);
    const issued = amount(input.Cuota, row);
    const paid = amount(input.Cobrado, row);
    if (!issued || paid > issued) throw new Error(`Fila ${row}: la cuota debe ser mayor que cero y el cobro no puede superar la cuota.`);
    return { reference, home, concept, due, issued, paid };
  });
}

export function sample(homes: string[]): Quota[] {
  const year = today().slice(0, 4);
  return [...new Set(homes)].flatMap((home, index) => ["01", "04", "07", "10"].map((month, quarter) => ({
    reference: `DEMO-${year}-${index + 1}-T${quarter + 1}`,
    home, concept: `Cuota ${quarter + 1}º trimestre ${year}`, due: `${year}-${month}-05`, issued: 24000,
    paid: `${year}-${month}-05` > today() ? 0 : quarter < 3 || index % 3 === 0 ? 24000 : index % 3 === 1 ? 12000 : 0,
  })));
}

export function PaymentsDemo({ community }: { community: CommunityModel }) {
  const storageKey = `fincaflow-quota-demo-v1-${community.id}`;
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [preview, setPreview] = useState<Snapshot | null>(null);
  const [message, setMessage] = useState("");
  const [home, setHome] = useState("");
  const [busy, setBusy] = useState(false);
  const request = useRef(0);
  const homes = [...new Set(community.owners.map(owner => owner.home))];
  useEffect(() => {
    request.current += 1;
    setBusy(false);
    setSnapshot(null); setPreview(null); setHome(""); setMessage("");
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data = JSON.parse(stored) as Snapshot;
        if (!Array.isArray(data.rows) || typeof data.source !== "string" || typeof data.updated !== "string" || data.rows.some(row => !row.reference || !row.home || !validDate(row.due) || !Number.isSafeInteger(row.issued) || !Number.isSafeInteger(row.paid) || row.issued <= 0 || row.paid < 0 || row.paid > row.issued)) throw new Error();
        // Update only the old generated example; never rewrite an imported ledger.
        if (data.source === "Ejemplo ficticio" && data.rows.some(row => row.reference.endsWith("-SEP"))) {
          const updated = { rows: sample(homes), source: "Ejemplo ficticio", updated: new Date().toISOString() };
          localStorage.setItem(storageKey, JSON.stringify(updated));
          setSnapshot(updated);
        } else setSnapshot(data);
      }
    } catch { setMessage("No se pudo recuperar el resumen guardado. Puedes volver a cargar el ejemplo."); }
    return () => { request.current += 1; };
  }, [storageKey]);

  function save(data: Snapshot) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
      setSnapshot(data); setPreview(null); setMessage("Resumen de prueba guardado en este navegador.");
    } catch { setMessage("No se pudo guardar. El resumen anterior permanece sin cambios."); }
  }

  async function importFile(file?: File) {
    setPreview(null); setMessage("");
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage("El archivo debe ocupar menos de 5 MB."); return; }
    setBusy(true);
    const currentRequest = ++request.current;
    try {
      const buffer = await file.arrayBuffer();
      if (currentRequest !== request.current) return;
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets.Cuotas;
      if (!sheet) throw new Error("El archivo debe contener una hoja llamada Cuotas.");
      const rows = parseQuotaRows(XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" }), homes);
      setPreview({ rows, source: file.name, updated: new Date().toISOString() });
    } catch (error) { if (currentRequest === request.current) setMessage(error instanceof Error ? error.message : "No se pudo leer el Excel."); }
    finally { if (currentRequest === request.current) setBusy(false); }
  }

  function download() {
    const workbook = XLSX.utils.book_new();
    const exportRows = snapshot?.rows ?? sample(homes);
    const sheet = XLSX.utils.json_to_sheet(exportRows.map(row => ({
      Comunidad: community.name,
      Propietario: community.owners.filter(owner => owner.home === row.home).map(owner => owner.name).join(" / ") || "Sin titular en el censo actual",
      Referencia: row.reference, Vivienda: row.home, Concepto: row.concept,
      Vencimiento: row.due, Cuota: row.issued / 100, Cobrado: row.paid / 100,
    })), { header: ["Comunidad", "Propietario", ...headers] });
    sheet["!cols"] = [30, 32, 24, 32, 30, 18, 14, 14].map(wch => ({ wch }));
    XLSX.utils.book_append_sheet(workbook, sheet, "Cuotas");
    const notes = XLSX.utils.aoa_to_sheet([
      ["Comunidad", community.name], ["CIF", community.cif],
      ["Exportado", today()], ["Origen", snapshot?.source ?? "Ejemplo ficticio sobre el censo actual"],
      ["Importante", "Prototipo. Los importes no acreditan pagos bancarios reales."],
      ["Ejemplo de cuotas", "240 euros trimestrales por vivienda: 4 cuotas, 960 euros anuales. Vencimientos de ejemplo: 5 de enero, abril, julio y octubre."],
      ["Cómo rellenar", "Cuota y Cobrado en euros. Cobrado es el total acumulado; 0 si no ha pagado."],
      ["Vencimiento", "Texto AAAA-MM-DD. Referencia única por cuota."],
      ["Importación", "La hoja Cuotas sustituye el resumen completo tras confirmar la vista previa."],
      ["Censo", "Solo incluye viviendas y titulares cargados; no representa necesariamente el censo completo."],
    ]);
    notes["!cols"] = [{ wch: 20 }, { wch: 100 }];
    XLSX.utils.book_append_sheet(workbook, notes, "Información");
    const filename = community.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
    XLSX.writeFile(workbook, `cuotas-${filename}-${today()}.xlsx`);
  }

  const data = preview || snapshot;
  const rows = data?.rows || [];
  const date = today();
  const issued = rows.reduce((sum, row) => sum + row.issued, 0);
  const paid = rows.reduce((sum, row) => sum + row.paid, 0);
  const overdue = rows.filter(row => row.due < date).reduce((sum, row) => sum + row.issued - row.paid, 0);
  const upcoming = rows.filter(row => row.due >= date).reduce((sum, row) => sum + row.issued - row.paid, 0);

  return <section className="payments-demo" aria-label="Resumen de cuotas de prueba">
    <div className="payments-demo-header"><div><span className="payments-demo-tag">PROTOTIPO · DATOS DE PRUEBA</span><h2>Cuotas y pagos de propietarios</h2><p>{community.name} · Ejemplo: 240 € trimestrales por vivienda (960 € al año). Simulación independiente del estado de cuota de los propietarios.</p></div></div>
    <div className="payments-demo-actions">
      <button disabled={!homes.length || busy || !!preview} onClick={() => { setPreview({ rows: sample(homes), source: "Ejemplo ficticio", updated: new Date().toISOString() }); setMessage(""); }}>Cargar ejemplo ficticio</button>
      <button disabled={!homes.length || !!preview} onClick={download}>Descargar Excel de esta comunidad</button>
      <label className="payments-import">{busy ? "Leyendo archivo…" : "Importar Excel de prueba"}<input disabled={busy || !!preview} type="file" accept=".xlsx,.xls" onChange={event => { void importFile(event.target.files?.[0]); event.target.value = ""; }} /></label>
    </div>
    <p className="payments-demo-help">El Excel incluye los propietarios y viviendas del censo actual de {community.name}, con las cuotas del resumen guardado o importes ficticios si todavía no hay resumen. Rellena Cobrado con el total recibido (0 si no ha pagado). El archivo confirmado sustituye el resumen completo, sin duplicar importes. Sin conexión bancaria ni envíos.</p>
    {message && <p role="status" className="payments-demo-message">{message}</p>}
    {!homes.length && <p>Añade primero viviendas y propietarios a esta comunidad.</p>}
    {preview && <div className="payments-preview" role="status"><div><strong>Vista previa · {preview.rows.length} cuotas</strong><p>Revisa la tabla antes de aceptar. Sustituirá el resumen de prueba de {community.name}.</p></div><button onClick={() => setPreview(null)}>Cancelar</button><button className="primary" onClick={() => save({ ...preview, updated: new Date().toISOString() })}>Confirmar resumen</button></div>}
    {data ? <>
      <div className="payments-summary">
        <div><span>Cuotas emitidas</span><strong>{money(issued)}</strong></div><div><span>Cobrado registrado</span><strong>{money(paid)}</strong></div><div className="payments-overdue"><span>Vencido pendiente</span><strong>{money(overdue)}</strong></div><div><span>Pendiente por vencer</span><strong>{money(upcoming)}</strong></div>
      </div>
      <div className="payments-table-heading"><p>Origen: <strong>{data.source}</strong> · {new Date(data.updated).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p><label>Vivienda<select value={home} onChange={event => setHome(event.target.value)}><option value="">Todas las viviendas</option>{[...new Set(rows.map(row => row.home))].map(value => <option key={value}>{value}</option>)}</select></label></div>
      <div className="payments-table-scroll"><table><caption>Cuotas de prueba · Importes en euros · Vencimientos a {date}</caption><thead><tr><th>Vivienda / referencia</th><th>Concepto</th><th>Vencimiento</th><th>Cuota</th><th>Cobrado</th><th>Pendiente</th><th>Estado</th></tr></thead><tbody>{rows.filter(row => !home || row.home === home).map(row => <tr key={row.reference}><td>{row.home}<small>{row.reference}</small></td><td>{row.concept}</td><td>{row.due}</td><td>{money(row.issued)}</td><td>{money(row.paid)}</td><td>{money(row.issued - row.paid)}</td><td><span className={`payments-state ${row.paid === row.issued ? "paid" : row.due < date ? "debt" : ""}`}>{quotaStatus(row, date)}</span></td></tr>)}</tbody></table></div>
    </> : <div className="payments-empty"><strong>Sin resumen cargado</strong><p>Carga el ejemplo para explorar cuotas pagadas, pagos parciales y vencimientos futuros.</p></div>}
  </section>;
}
