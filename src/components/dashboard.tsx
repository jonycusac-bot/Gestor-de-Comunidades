"use client";

import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { Icon } from "./icon";
import { CommunityMeetings } from "./community-meetings";
import { CommunityDocuments } from "./community-documents";
import { PaymentsDemo } from "./payments-demo";
import { EmailCommunications } from "./email-communications";
import { OwnerMessages } from "./owner-messages";
import { PrivateMessages } from "./private-messages";
import { useSession } from "./auth-gate";
import { initialCommunitiesList, CommunityModel, OwnerModel } from "../data/communitiesData";
import { OwnersView, sampleOwnersBank } from "./owners-view";
import { CommunitySelectorHub } from "./community-selector-hub";

const nav = [
  ["building", "Comunidades"],
  ["users", "Propietarios"],
  ["bell", "Avisos y noticias"],
  ["folder", "Documentos"],
  ["calendar", "Juntas"],
  ["message", "Comunicaciones"],
  ["message", "Mensajes"],
  ["wallet", "Economía"],
] as const;

const communitiesStorageKey = "fincaflow-custom-communities";
const activeCommunityStorageKey = "fincaflow-active-community";

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase("es-ES");
}

function withOwnerStats(community: CommunityModel, owners: OwnerModel[]): CommunityModel {
  const pendingPaymentsCount = owners.filter((owner) => owner.payment === "Pendiente").length;
  return {
    ...community,
    owners,
    totalOwners: owners.length,
    pendingPaymentsCount,
    pendingPaymentsPercent: owners.length
      ? `${((pendingPaymentsCount / owners.length) * 100).toFixed(1).replace(".0", "")}%`
      : "0%",
  };
}

export function Dashboard() {
  const [active, setActive] = useState<string>("Comunidades");
  const [sidebar, setSidebar] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Communities state
  const [communities, setCommunities] = useState<CommunityModel[]>(() => {
    try {
      const saved = localStorage.getItem(communitiesStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return initialCommunitiesList;
  });

  // Selected community: null means the user is at the initial main selection screen
  // Cada acceso empieza en el selector de comunidades, que es la página principal de la demo.
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddCommunityModal, setShowAddCommunityModal] = useState(false);
  const [communityModalOwnerMode, setCommunityModalOwnerMode] = useState<"sample" | "manual" | "import">("sample");
  const [importedOwners, setImportedOwners] = useState<OwnerModel[] | null>(null);
  const [importedCommunityCounts, setImportedCommunityCounts] = useState<{ portals: number; units: number } | null>(null);
  const [communityPendingDeletion, setCommunityPendingDeletion] = useState<CommunityModel | null>(null);
  const [communityDeletionConfirmed, setCommunityDeletionConfirmed] = useState(false);

  // Get current active community object if one is chosen
  const currentCommunity =
    communities.find((c) => c.id === selectedCommunityId) || communities[0];

  function action(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  function handleSelectCommunity(id: string) {
    setSelectedCommunityId(id);
    setDropdownOpen(false);
    setActive(selectedCommunityId ? "Comunidades" : active);
    setSidebar(false);
    const target = communities.find((c) => c.id === id);
    if (target) {
      action(`Comunidad abierta: ${target.name}`);
    }
  }

  function handleReturnToHub() {
    setSelectedCommunityId(null);
    setActive("Comunidades");
    setSidebar(false);
    setDropdownOpen(false);
  }

  function requestCommunityDeletion(id: string) {
    const target = communities.find((community) => community.id === id);
    if (target) {
      setCommunityDeletionConfirmed(false);
      setCommunityPendingDeletion(target);
    }
  }

  function confirmCommunityDeletion() {
    if (!communityPendingDeletion) return;
    const updatedCommunities = communities.filter((community) => community.id !== communityPendingDeletion.id);
    setCommunities(updatedCommunities);
    try {
      localStorage.setItem(communitiesStorageKey, JSON.stringify(updatedCommunities));
    } catch {
      // ignore
    }
    setCommunityPendingDeletion(null);
    setCommunityDeletionConfirmed(false);
    setSelectedCommunityId(null);
    action(`Comunidad dada de baja: ${communityPendingDeletion.name}`);
  }

  function handleAddOwnerToCurrentCommunity(newOwner: OwnerModel) {
    const email = normalizeEmail(newOwner.email);
    if (currentCommunity.owners.some((owner) => normalizeEmail(owner.email) === email)) {
      action("Ya existe un propietario con ese correo en esta comunidad");
      return false;
    }

    const updatedCommunities = communities.map((comm) => {
      if (comm.id === currentCommunity.id) {
        const nextOwners = [newOwner, ...comm.owners];
        return withOwnerStats(comm, nextOwners);
      }
      return comm;
    });

    setCommunities(updatedCommunities);
    try {
      localStorage.setItem(communitiesStorageKey, JSON.stringify(updatedCommunities));
    } catch {
      // ignore
    }
    return true;
  }

  function handleUpdateOwner(original: OwnerModel, updated: OwnerModel) {
    const index = currentCommunity.owners.indexOf(original);
    if (index < 0) { action("No se encontró el propietario en esta comunidad"); return false; }
    if (currentCommunity.owners.some((owner, i) => i !== index && normalizeEmail(owner.email) === normalizeEmail(updated.email))) {
      action("Ya existe un propietario con ese correo en esta comunidad"); return false;
    }
    const next = communities.map(comm => comm.id === currentCommunity.id
      ? withOwnerStats(comm, comm.owners.map((owner, i) => i === index ? { ...updated, id: original.id } : owner)) : comm);
    try { localStorage.setItem(communitiesStorageKey, JSON.stringify(next)); }
    catch { action("No se pudieron guardar los cambios en el navegador"); return false; }
    setCommunities(next);
    return true;
  }
  function handleAddSampleOwnersToCurrentCommunity() {
    const nextSampleOwners: OwnerModel[] = sampleOwnersBank.map((s, idx) => {
      const initials = s.name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

      return {
        id: `owner-sample-${Date.now()}-${idx}`,
        initials,
        name: s.name,
        home: s.homePrefix,
        email: s.email,
        phone: s.phone,
        dni: s.dni,
        coefficient: s.coefficient,
        payment: s.payment,
      };
    });

    const updatedCommunities = communities.map((comm) => {
      if (comm.id === currentCommunity.id) {
        // avoid duplicate emails
        const existingEmails = new Set(comm.owners.map((owner) => normalizeEmail(owner.email)));
        const toAdd = nextSampleOwners.filter((owner) => !existingEmails.has(normalizeEmail(owner.email)));
        return withOwnerStats(comm, [...toAdd, ...comm.owners]);
      }
      return comm;
    });

    setCommunities(updatedCommunities);
    try {
      localStorage.setItem(communitiesStorageKey, JSON.stringify(updatedCommunities));
    } catch {
      // ignore
    }
    const addedCount = updatedCommunities.find((community) => community.id === currentCommunity.id)!.owners.length - currentCommunity.owners.length;
    action(addedCount ? `${addedCount} propietarios de ejemplo añadidos` : "Los propietarios de ejemplo ya están cargados");
  }

  async function handleExcelImport(file: File | undefined) {
    if (!file) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const sheetName = workbook.SheetNames.find((name) => name.trim().toLocaleLowerCase("es-ES") === "propietarios");
      if (!sheetName) throw new Error('No se encontró la pestaña "Propietarios".');

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], { defval: "" });
      const requiredColumns = ["Portal / Bloque", "Planta", "Puerta", "Nombre del propietario"];
      const headers = Object.keys(rows[0] || {});
      const missingColumns = requiredColumns.filter((column) => !headers.includes(column));
      if (missingColumns.length) throw new Error(`Faltan columnas obligatorias: ${missingColumns.join(", ")}.`);

      const seenEmails = new Set<string>();
      const owners = rows.map((row, index): OwnerModel => {
        const portal = String(row["Portal / Bloque"] || "").trim();
        const floor = String(row["Planta"] || "").trim();
        const door = String(row["Puerta"] || "").trim();
        const name = String(row["Nombre del propietario"] || "").trim();
        const email = normalizeEmail(String(row.Email || ""));

        if (!portal || !floor || !door || !name) throw new Error(`La fila ${index + 2} necesita portal, planta, puerta y propietario.`);
        if (email && seenEmails.has(email)) throw new Error(`El correo ${email} está repetido (fila ${index + 2}).`);
        if (email) seenEmails.add(email);

        const rawCoefficient = row["Coeficiente de propiedad (%)"];
        const numericCoefficient = typeof rawCoefficient === "number"
          ? rawCoefficient <= 1 ? rawCoefficient * 100 : rawCoefficient
          : Number(String(rawCoefficient || "").replace("%", "").replace(",", "."));
        const coefficient = Number.isFinite(numericCoefficient) && numericCoefficient > 0
          ? `${numericCoefficient.toLocaleString("es-ES", { maximumFractionDigits: 4 })}%`
          : undefined;
        const payment = String(row["Estado de pago"] || "").trim().toLocaleLowerCase("es-ES") === "pendiente" ? "Pendiente" : "Al día";
        const initials = name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "PR";

        return {
          id: `owner-import-${Date.now()}-${index}`,
          initials,
          name,
          home: `${portal} · ${floor} ${door}`,
          email: email || `sin-correo-${Date.now()}-${index}@ejemplo.local`,
          phone: String(row["Teléfono"] || "").trim() || undefined,
          dni: String(row["DNI/NIF"] || "").trim() || undefined,
          coefficient,
          payment,
        };
      });

      if (!owners.length) throw new Error("La pestaña Propietarios no contiene viviendas para importar.");
      setImportedOwners(owners);
      setImportedCommunityCounts({ portals: new Set(rows.map((row) => String(row["Portal / Bloque"] || "").trim())).size, units: owners.length });
      setCommunityModalOwnerMode("import");
      action(`${owners.length} viviendas preparadas desde ${file.name}`);
    } catch (cause) {
      setImportedOwners(null);
      setImportedCommunityCounts(null);
      action(cause instanceof Error ? cause.message : "No se pudo leer el archivo Excel.");
    }
  }

  function handleCreateCommunity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;

    const location = String(form.get("location") || "Málaga").trim();
    let portals = Math.max(1, Number(form.get("portals") || 2));
    let totalUnits = Math.max(1, Number(form.get("totalUnits") || 32));
    const cif = String(form.get("cif") || `H-${Math.floor(10000000 + Math.random() * 90000000)}`);
    const ownerMode = String(form.get("ownerMode") || "sample");

    if (communities.some((community) => community.name.trim().toLocaleLowerCase("es-ES") === name.toLocaleLowerCase("es-ES") && community.location.trim().toLocaleLowerCase("es-ES") === location.toLocaleLowerCase("es-ES"))) {
      action("Ya existe una comunidad con ese nombre y ubicación");
      return;
    }

    let initialOwners: OwnerModel[] = [];

    if (ownerMode === "import") {
      if (!importedOwners || !importedCommunityCounts) {
        action("Selecciona un archivo Excel válido antes de crear la comunidad");
        return;
      }
      initialOwners = importedOwners;
      portals = importedCommunityCounts.portals;
      totalUnits = importedCommunityCounts.units;
    } else if (ownerMode === "sample") {
      // Create initial sample owners tailored to the portals
      initialOwners = sampleOwnersBank.map((s, idx) => ({
        id: `owner-init-${Date.now()}-${idx}`,
        initials: s.name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase(),
        name: s.name,
        home: s.homePrefix,
        email: s.email,
        phone: s.phone,
        dni: s.dni,
        coefficient: s.coefficient,
        payment: s.payment,
      }));
    } else {
      // Manual primary owner specified in form
      const ownerName = String(form.get("ownerName") || "Presidente / Propietario Inicial").trim();
      const ownerHome = String(form.get("ownerHome") || "Portal 1 · 1º A").trim();
      const ownerEmail = String(form.get("ownerEmail") || "contacto@comunidad.es").trim();
      const ownerPhone = String(form.get("ownerPhone") || "+34 600 00 00 00").trim();
      const ownerPayment = (form.get("ownerPayment") as "Al día" | "Pendiente") || "Al día";

      const initials = ownerName
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "PR";

      initialOwners = [
        {
          id: `owner-${Date.now()}`,
          initials,
          name: ownerName,
          home: ownerHome,
          email: ownerEmail,
          phone: ownerPhone,
          coefficient: "4,50%",
          payment: ownerPayment,
        },
      ];
    }

    const newComm: CommunityModel = {
      id: `comm-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      location,
      cif,
      portals,
      totalUnits,
      totalOwners: initialOwners.length,
      openCommunications: 1,
      pendingPaymentsCount: initialOwners.filter((o) => o.payment === "Pendiente").length,
      pendingPaymentsPercent: `${Math.round((initialOwners.filter((o) => o.payment === "Pendiente").length / initialOwners.length) * 100) || 5}%`,
      totalDocuments: 12,
      newDocumentsMonth: 2,
      gradient: "linear-gradient(135deg, #1d4ed8, #3b82f6)",
      avatarBg: "#2563eb",
      avatarInitials: name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase() || "NC",
      communications: [
        {
          type: "Consulta",
          title: "Bienvenida y alta en portal comunitario",
          meta: initialOwners[0]?.home || "Portal 1 · 1º A",
          person: initialOwners[0]?.name || "Administración FincaFlow",
          time: "Recién creada",
          tone: "blue",
        },
      ],
      owners: initialOwners,
      documents: [
        {
          title: "Estatutos y Normas de Régimen Interno",
          category: "Estatutos",
          date: "Hoy",
          files: "1 archivo",
          status: "Publicado",
        },
      ],
      events: [
        {
          day: "15",
          month: "OCT",
          title: "Junta de Constitución y Cargos",
          time: "19:00 · Salón de actos",
          status: "Convocada",
        },
      ],
      attentionItems: [
        {
          icon: "check",
          tone: "blue",
          title: "Comunidad recién dada de alta",
          subtitle: `${initialOwners.length} propietarios asignados inicialmente`,
        },
      ],
    };

    const next = [...communities, newComm];
    setCommunities(next);
    try {
      localStorage.setItem(communitiesStorageKey, JSON.stringify(next));
    } catch {
      // ignore
    }
    setShowAddCommunityModal(false);
    setImportedOwners(null);
    setImportedCommunityCounts(null);
    handleSelectCommunity(newComm.id);
    action(`Comunidad "${newComm.name}" creada con ${initialOwners.length} propietarios de ejemplo`);
  }

  // Close dropdown on escape key
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setDropdownOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const managementSidebar = (
      <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
        <div
          className="brand"
          style={{ cursor: "pointer" }}
          onClick={handleReturnToHub}
          title="Volver a la selección de comunidades"
        >
          <span className="brand-mark">
            <Icon name="building" size={22} />
          </span>
          <span>
            Finca<span>Flow</span>
          </span>
        </div>

        <div className="workspace-label">
          {selectedCommunityId ? currentCommunity.name.toUpperCase() : "GESTIÓN DE COMUNIDADES"}
        </div>
        <nav>
          {nav.map(([icon, label]) => (
            <button
              id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={active === label || (label === "Comunidades" && active === "Listado de comunidades") ? "active" : ""}
              onClick={() => {
                setActive(label === "Comunidades" ? (selectedCommunityId ? "Listado de comunidades" : "Comunidades") : label);
                if (!selectedCommunityId && label !== "Comunidades") action(`Selecciona una comunidad para abrir ${label.toLowerCase()}`);
                setSidebar(false);
              }}
              key={label}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {selectedCommunityId && label === "Avisos y noticias" && (
                <b>{currentCommunity.openCommunications}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => { setActive("Configuración"); setSidebar(false); if (!selectedCommunityId) action("Selecciona una comunidad para abrir su configuración"); }}>
            <Icon name="settings" />
            <span>Configuración</span>
          </button>
          <div className="profile">
            <div className="avatar">JC</div>
            <div>
              <strong>Jonatan Cusac</strong>
              <small>Administrador general</small>
            </div>
            <Icon name="arrow" size={16} />
          </div>
        </div>
      </aside>
  );

  // If no community is selected yet (or user returned to the list), render the Community Selector Hub
  if (!selectedCommunityId) {
    return (
      <>
        <div className="app-shell hub-shell">
        {managementSidebar}
        <CommunitySelectorHub
          onToggleMenu={() => setSidebar(!sidebar)}
          requestedSection={active}
          communities={communities}
          onSelectCommunity={handleSelectCommunity}
          onOpenAddModal={() => setShowAddCommunityModal(true)}
        />
        </div>
        {sidebar && <button className="scrim" onClick={() => setSidebar(false)} aria-label="Cerrar menú" />}

        {/* Modal de Crear Comunidad accesible desde el Hub */}
        {showAddCommunityModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowAddCommunityModal(false)}
          >
            <div className="modal community-create-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head">
                <div>
                  <small>NUEVA COMUNIDAD</small>
                  <h2>Alta de comunidad</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddCommunityModal(false)}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleCreateCommunity}>
                <label>
                  Nombre de la comunidad / edificio
                  <input
                    name="name"
                    required
                    placeholder="Ej. Residencial Puerta del Mar"
                    autoFocus
                  />
                </label>
                <label>
                  Dirección completa y ciudad
                  <input
                    name="location"
                    required
                    placeholder="Ej. Calle Mayor 14, Valencia"
                  />
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <label>
                    Nº de portales / bloques
                    <input
                      name="portals"
                      type="number"
                      defaultValue={2}
                      min={1}
                      max={50}
                      required
                    />
                  </label>
                  <label>
                    Nº de viviendas
                    <input
                      name="totalUnits"
                      type="number"
                      defaultValue={48}
                      min={1}
                      max={500}
                      required
                    />
                  </label>
                </div>
                <label>
                  CIF Comunitario (opcional)
                  <input name="cif" placeholder="Ej. H-12345678" />
                </label>

                <section className="community-excel-import" aria-label="Importar nueva comunidad desde Excel">
  <span className="community-excel-badge">ALTA DESDE EXCEL</span>
  <h3>Importar nueva comunidad desde Excel</h3>
  <p>Carga tu plantilla con propietarios y viviendas. Calcularemos automáticamente el número de portales y viviendas.</p>
  <label className="community-excel-button">
    Seleccionar archivo Excel
    <input type="file" accept=".xlsx,.xls" onChange={(event) => handleExcelImport(event.target.files?.[0])} />
  </label>
  <small>{importedCommunityCounts && communityModalOwnerMode === "import"
    ? `✓ Archivo listo: ${importedCommunityCounts.units} viviendas · ${importedCommunityCounts.portals} portales`
    : 'Archivos .xlsx o .xls · Hoja «Propietarios»'}</small>
</section>
{/* Configuración de propietarios iniciales */}
                <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <small style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                    OTRAS OPCIONES · ALTA MANUAL O DE EJEMPLO
                  </small>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                    <button
                      type="button"
                      onClick={() => setCommunityModalOwnerMode("sample")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        border: "1px solid",
                        borderColor: communityModalOwnerMode === "sample" ? "var(--primary)" : "var(--border)",
                        background: communityModalOwnerMode === "sample" ? "#eff6ff" : "#fff",
                        color: communityModalOwnerMode === "sample" ? "var(--primary)" : "var(--text)",
                        cursor: "pointer",
                      }}
                    >
                      Generar 5 propietarios de ejemplo
                    </button>
                    <button
                      type="button"
                      onClick={() => setCommunityModalOwnerMode("manual")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                        border: "1px solid",
                        borderColor: communityModalOwnerMode === "manual" ? "var(--primary)" : "var(--border)",
                        background: communityModalOwnerMode === "manual" ? "#eff6ff" : "#fff",
                        color: communityModalOwnerMode === "manual" ? "var(--primary)" : "var(--text)",
                        cursor: "pointer",
                      }}
                    >
                      Añadir 1 propietario manual
                    </button>
                  </div>

                  <input type="hidden" name="ownerMode" value={communityModalOwnerMode} />

                  {communityModalOwnerMode === "sample" ? (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px" }}>
                      💡 Se autogenerarán 5 propietarios realistas (con DNI, teléfonos, correos y coeficientes de participación) para que puedas probar la comunidad de inmediato.
                    </p>
                  ) : communityModalOwnerMode === "manual" ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
                      <label style={{ gridColumn: "1 / -1" }}>
                        Nombre y apellidos
                        <input name="ownerName" placeholder="Ej. Carlos Mendoza Gil" defaultValue="Carlos Mendoza Gil" />
                      </label>
                      <label>
                        Vivienda asignada
                        <input name="ownerHome" placeholder="Ej. Portal 1 · 1º A" defaultValue="Portal 1 · 1º A" />
                      </label>
                      <label>
                        Email
                        <input name="ownerEmail" type="email" placeholder="carlos@ejemplo.es" defaultValue="carlos@ejemplo.es" />
                      </label>
                      <label>
                        Teléfono
                        <input name="ownerPhone" placeholder="+34 611 22 33 44" defaultValue="+34 611 22 33 44" />
                      </label>
                      <label>
                        Estado de cuotas
                        <select name="ownerPayment" defaultValue="Al día">
                          <option value="Al día">Al día</option>
                          <option value="Pendiente">Pendiente</option>
                        </select>
                      </label>
                    </div>
                  ) : (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px" }}>
                      {importedCommunityCounts
                        ? `Archivo listo: ${importedCommunityCounts.units} viviendas de ${importedCommunityCounts.portals} portales. Los datos sustituirán los campos manuales.`
                        : "Elige la plantilla Excel para cargar propietarios y viviendas."}
                    </p>
                  )}
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowAddCommunityModal(false)}
                  >
                    Cancelar
                  </button>
                  <button className="primary" type="submit">
                    Crear comunidad
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {notice && (
          <aside className="toast" role="status">
            <Icon name="check" size={16} />
            <span>{notice}</span>
          </aside>
        )}
      </>
    );
  }

  return (
    <div className="app-shell">
      {managementSidebar}

      <main>
        <header>
          <button
            className="mobile-menu"
            onClick={() => setSidebar(!sidebar)}
            aria-label="Abrir menú"
          >
            <Icon name="menu" />
          </button>

          {/* Selector de Comunidades Interactivo */}
          <div className="community-picker">
            <small>Comunidad activa</small>
            <button
              id="community-picker-btn"
              className={`community-picker-btn ${dropdownOpen ? "is-open" : ""}`}
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="Seleccionar comunidad activa"
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  backgroundColor: currentCommunity.avatarBg,
                  display: "inline-block",
                }}
              />
              <span>{currentCommunity.name}</span>
              <span className="chevron">⌄</span>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="community-dropdown-backdrop"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="community-dropdown" role="menu" id="community-selector-menu">
                  <div className="community-dropdown-header">
                    <span>Comunidades ({communities.length})</span>
                    <span style={{ color: "#257454", fontWeight: 700 }}>
                      Activa: {currentCommunity.name.split(" ")[0]}
                    </span>
                  </div>

                  <div className="community-dropdown-list">
                    {communities.map((comm) => {
                      const isSelected = comm.id === currentCommunity.id;
                      return (
                        <button
                          key={comm.id}
                          id={`dropdown-community-${comm.id}`}
                          className={`community-dropdown-item ${
                            isSelected ? "is-selected" : ""
                          }`}
                          onClick={() => handleSelectCommunity(comm.id)}
                        >
                          <div
                            className="community-dropdown-avatar"
                            style={{ background: comm.avatarBg }}
                          >
                            {comm.avatarInitials}
                          </div>
                          <div className="community-dropdown-info">
                            <strong>{comm.name}</strong>
                            <small>
                              {comm.location} · {comm.portals} portales
                            </small>
                            <span>
                              {comm.totalUnits} viviendas · {comm.pendingPaymentsCount} pdtes.
                            </span>
                          </div>
                          {isSelected && (
                            <span className="community-dropdown-badge">Activa</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="community-dropdown-footer">
                    <button
                      id="dropdown-view-all-communities"
                      onClick={() => {
                        setDropdownOpen(false);
                        handleReturnToHub();
                      }}
                    >
                      <Icon name="building" size={13} />
                      Ver todas
                    </button>
                    <button
                      id="dropdown-new-community-btn"
                      onClick={() => {
                        setDropdownOpen(false);
                        setShowAddCommunityModal(true);
                      }}
                    >
                      <Icon name="plus" size={13} />
                      Nueva comunidad
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="header-tools">
            <button
              id="header-change-community-btn"
              className="switch-community-btn"
              onClick={handleReturnToHub}
              title="Volver al selector de comunidades"
            >
              <Icon name="grid" size={13} />
              <span>Cambiar comunidad</span>
            </button>
            <label className="search">
              <Icon name="search" size={18} />
              <input
                placeholder={`Buscar en ${currentCommunity.name.split(" ")[0]}…`}
              />
            </label>
            <button
              className="round"
              onClick={() => setActive("Avisos y noticias")}
              aria-label="Ver avisos"
            >
              <Icon name="bell" size={19} />
              <i />
            </button>
          </div>
        </header>

        <div className="content">
          {active !== "Resumen" ? (
            <ModuleView
              active={active}
              currentCommunity={currentCommunity}
              onUpdateOwner={handleUpdateOwner}
              onAddOwner={handleAddOwnerToCurrentCommunity}
              onAddSampleOwners={handleAddSampleOwnersToCurrentCommunity}
              onRequestDeleteCommunity={requestCommunityDeletion}
              communities={communities}
              onSelectCommunity={handleSelectCommunity}
              onOpenAddModal={() => setShowAddCommunityModal(true)}
              onNavigate={setActive}
              notify={action}
            />
          ) : (
            <>
              <section className="welcome">
                <div>
                  <p>RESUMEN DE COMUNIDAD</p>
                  <h1>{currentCommunity.name}</h1>
                  <span>Información principal y actividad reciente de la comunidad.</span>
                </div>
                <button
                  className="primary"
                  onClick={() => setShowAddCommunityModal(true)}
                >
                  <Icon name="plus" size={18} /> Crear nuevo
                </button>
              </section>

              {/* Estadísticas de la comunidad activa */}
              <section className="stats">
                <article>
                  <div className="stat-icon green">
                    <Icon name="building" />
                  </div>
                  <div>
                    <small>Viviendas</small>
                    <strong>{currentCommunity.totalUnits}</strong>
                    <span>
                      <em>{currentCommunity.totalOwners}</em> con propietario
                    </span>
                  </div>
                </article>
                <article>
                  <div className="stat-icon blue">
                    <Icon name="message" />
                  </div>
                  <div>
                    <small>Avisos activos</small>
                    <strong>{currentCommunity.openCommunications}</strong>
                    <span>
                      <em>2 nuevas</em> esta semana
                    </span>
                  </div>
                </article>
                <article>
                  <div className="stat-icon amber">
                    <Icon name="wallet" />
                  </div>
                  <div>
                    <small>Pendientes de pago</small>
                    <strong>{currentCommunity.pendingPaymentsCount}</strong>
                    <span>{currentCommunity.pendingPaymentsPercent} de viviendas</span>
                  </div>
                </article>
                <article>
                  <div className="stat-icon violet">
                    <Icon name="folder" />
                  </div>
                  <div>
                    <small>Documentos</small>
                    <strong>{currentCommunity.totalDocuments}</strong>
                    <span>
                      <em>{currentCommunity.newDocumentsMonth} nuevos</em> este mes
                    </span>
                  </div>
                </article>
              </section>

              <div className="dashboard-grid">
                {/* Avisos de la comunidad activa */}
                <section className="panel communications">
                  <div className="panel-head">
                    <div>
                      <h2>Avisos recientes</h2>
                      <p>Información pendiente de revisar</p>
                    </div>
                    <button onClick={() => setActive("Avisos y noticias")}>
                      Ver todas <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  <div className="communication-list">
                    {currentCommunity.communications.map((item) => (
                      <button
                        className="communication"
                        key={item.title}
                        onClick={() => action(`Abriendo: ${item.title}`)}
                      >
                        <span className={`type ${item.tone}`}>{item.type}</span>
                        <div>
                          <strong>{item.title}</strong>
                          <small>
                            {item.meta} · {item.person}
                          </small>
                        </div>
                        <time>{item.time}</time>
                        <Icon name="arrow" size={16} />
                      </button>
                    ))}
                  </div>
                </section>

                {/* Acciones rápidas */}
                <section className="panel quick">
                  <div className="panel-head">
                    <div>
                      <h2>Acciones rápidas</h2>
                      <p>Las tareas más frecuentes en {currentCommunity.name}</p>
                    </div>
                  </div>
                  <div className="quick-grid">
                    <button onClick={() => action("Formulario de documento preparado")}>
                      <span className="stat-icon violet">
                        <Icon name="folder" />
                      </span>
                      <strong>Subir documento</strong>
                      <small>PDF, actas y presupuestos</small>
                    </button>
                    <button onClick={() => action("Editor de avisos preparado")}>
                      <span className="stat-icon blue">
                        <Icon name="bell" />
                      </span>
                      <strong>Publicar aviso</strong>
                      <small>A toda la comunidad</small>
                    </button>
                    <button onClick={() => setActive("Propietarios")}>
                      <span className="stat-icon green">
                        <Icon name="users" />
                      </span>
                      <strong>Nuevo propietario</strong>
                      <small>Gestionar y añadir</small>
                    </button>
                    <button onClick={() => action("Nueva junta preparada")}>
                      <span className="stat-icon amber">
                        <Icon name="calendar" />
                      </span>
                      <strong>Convocar junta</strong>
                      <small>Crear orden del día</small>
                    </button>
                  </div>
                </section>

                {/* Próximos eventos de la comunidad activa */}
                <section className="panel upcoming">
                  <div className="panel-head">
                    <div>
                      <h2>Próximos eventos</h2>
                      <p>Agenda de {currentCommunity.name}</p>
                    </div>
                    <button onClick={() => setActive("Juntas")}>
                      Ver calendario <Icon name="arrow" size={15} />
                    </button>
                  </div>
                  {currentCommunity.events.map((ev) => (
                    <div className="event" key={ev.title}>
                      <div className={`date ${ev.pale ? "pale" : ""}`}>
                        <b>{ev.day}</b>
                        <span>{ev.month}</span>
                      </div>
                      <div>
                        <strong>{ev.title}</strong>
                        <small>
                          <Icon name="clock" size={14} /> {ev.time}
                        </small>
                      </div>
                      <span className={`status ${ev.statusClass || ""}`}>{ev.status}</span>
                    </div>
                  ))}
                </section>

                {/* Atención requerida */}
                <section className="panel pending">
                  <div className="panel-head">
                    <div>
                      <h2>Atención requerida</h2>
                      <p>Tareas que necesitan seguimiento</p>
                    </div>
                  </div>
                  {currentCommunity.attentionItems.map((att) => (
                    <button
                      key={att.title}
                      onClick={() => action(`Gestionando: ${att.title}`)}
                    >
                      <span className={`attention ${att.tone}`}>
                        <Icon name={att.icon} size={18} />
                      </span>
                      <div>
                        <strong>{att.title}</strong>
                        <small>{att.subtitle}</small>
                      </div>
                      <Icon name="arrow" size={16} />
                    </button>
                  ))}
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      {sidebar && (
        <button
          className="scrim"
          onClick={() => setSidebar(false)}
          aria-label="Cerrar menú"
        />
      )}

      {notice && (
        <div className="toast">
          <Icon name="check" size={18} />
          {notice}
        </div>
      )}

      {/* Modal para crear nueva comunidad */}
      {showAddCommunityModal && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowAddCommunityModal(false)}
        >
          <form
            className="modal community-create-modal"
            onSubmit={handleCreateCommunity}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <small>ALTA DE COMUNIDAD</small>
                <h2>Añadir nueva comunidad</h2>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCommunityModal(false)}
              >
                ×
              </button>
            </div>
            <label>
              Nombre de la comunidad
              <input
                name="name"
                required
                placeholder="Ej. Residencial Los Sauces"
                autoFocus
              />
            </label>
            <label>
              Ubicación / Ciudad
              <input
                name="location"
                required
                placeholder="Ej. Marbella, Málaga"
              />
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label>
                Nº de portales
                <input
                  name="portals"
                  type="number"
                  defaultValue={3}
                  min={1}
                  max={50}
                  required
                />
              </label>
              <label>
                Nº de viviendas
                <input
                  name="totalUnits"
                  type="number"
                  defaultValue={48}
                  min={1}
                  max={500}
                  required
                />
              </label>
            </div>
            <label>
              CIF Comunitario (opcional)
              <input name="cif" placeholder="Ej. H-12345678" />
            </label>

            <section className="community-excel-import" aria-label="Importar nueva comunidad desde Excel">
  <span className="community-excel-badge">ALTA DESDE EXCEL</span>
  <h3>Importar nueva comunidad desde Excel</h3>
  <p>Carga tu plantilla con propietarios y viviendas. Calcularemos automáticamente el número de portales y viviendas.</p>
  <label className="community-excel-button">
    Seleccionar archivo Excel
    <input type="file" accept=".xlsx,.xls" onChange={(event) => handleExcelImport(event.target.files?.[0])} />
  </label>
  <small>{importedCommunityCounts && communityModalOwnerMode === "import"
    ? `✓ Archivo listo: ${importedCommunityCounts.units} viviendas · ${importedCommunityCounts.portals} portales`
    : 'Archivos .xlsx o .xls · Hoja «Propietarios»'}</small>
</section>
{/* Configuración de propietarios iniciales */}
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              <small style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                OTRAS OPCIONES · ALTA MANUAL O DE EJEMPLO
              </small>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setCommunityModalOwnerMode("sample")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    border: "1px solid",
                    borderColor: communityModalOwnerMode === "sample" ? "var(--primary)" : "var(--border)",
                    background: communityModalOwnerMode === "sample" ? "#eff6ff" : "#fff",
                    color: communityModalOwnerMode === "sample" ? "var(--primary)" : "var(--text)",
                    cursor: "pointer",
                  }}
                >
                  Generar 5 propietarios de ejemplo
                </button>
                <button
                  type="button"
                  onClick={() => setCommunityModalOwnerMode("manual")}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                    border: "1px solid",
                    borderColor: communityModalOwnerMode === "manual" ? "var(--primary)" : "var(--border)",
                    background: communityModalOwnerMode === "manual" ? "#eff6ff" : "#fff",
                    color: communityModalOwnerMode === "manual" ? "var(--primary)" : "var(--text)",
                    cursor: "pointer",
                  }}
                >
                  Añadir 1 propietario manual
                </button>
              </div>

              <input type="hidden" name="ownerMode" value={communityModalOwnerMode} />

              {communityModalOwnerMode === "sample" ? (
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px" }}>
                  💡 Se autogenerarán 5 propietarios realistas (con DNI, teléfonos, correos y coeficientes de participación) para que puedas probar la comunidad de inmediato.
                </p>
              ) : communityModalOwnerMode === "manual" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
                  <label style={{ gridColumn: "1 / -1" }}>
                    Nombre y apellidos
                    <input name="ownerName" placeholder="Ej. Carlos Mendoza Gil" defaultValue="Carlos Mendoza Gil" />
                  </label>
                  <label>
                    Vivienda asignada
                    <input name="ownerHome" placeholder="Ej. Portal 1 · 1º A" defaultValue="Portal 1 · 1º A" />
                  </label>
                  <label>
                    Email
                    <input name="ownerEmail" type="email" placeholder="carlos@ejemplo.es" defaultValue="carlos@ejemplo.es" />
                  </label>
                  <label>
                    Teléfono
                    <input name="ownerPhone" placeholder="+34 611 22 33 44" defaultValue="+34 611 22 33 44" />
                  </label>
                  <label>
                    Estado de cuotas
                    <select name="ownerPayment" defaultValue="Al día">
                      <option value="Al día">Al día</option>
                      <option value="Pendiente">Pendiente</option>
                    </select>
                  </label>
                </div>
              ) : (
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "4px 0 12px", background: "#f8fafc", padding: "10px 12px", borderRadius: "8px" }}>
                  {importedCommunityCounts
                    ? `Archivo listo: ${importedCommunityCounts.units} viviendas de ${importedCommunityCounts.portals} portales. Los datos sustituirán los campos manuales.`
                    : "Elige la plantilla Excel para cargar propietarios y viviendas."}
                </p>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setShowAddCommunityModal(false)}
              >
                Cancelar
              </button>
              <button className="primary" type="submit">
                Crear comunidad
              </button>
            </div>
          </form>
        </div>
      )}

      {communityPendingDeletion && (
        <div className="modal-backdrop" onMouseDown={() => setCommunityPendingDeletion(null)}>
          <div className="modal" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head">
              <div>
                <small>{communityDeletionConfirmed ? "SEGUNDA CONFIRMACIÓN" : "PRIMERA CONFIRMACIÓN"}</small>
                <h2>Dar de baja una comunidad</h2>
              </div>
              <button type="button" onClick={() => setCommunityPendingDeletion(null)} aria-label="Cerrar">×</button>
            </div>
            <p style={{ margin: "0 0 14px", color: "var(--text-muted)", lineHeight: 1.5 }}>
              Vas a eliminar <strong>{communityPendingDeletion.name}</strong> de esta demo, incluidos sus propietarios y datos guardados en este navegador.
            </p>
            <p style={{ margin: "0 0 18px", color: "#b2594d", fontWeight: 700 }}>
              {communityDeletionConfirmed ? "Confirma de nuevo para eliminarla definitivamente." : "Esta acción requiere una segunda confirmación."}
            </p>
            <div className="modal-actions">
              <button type="button" onClick={() => setCommunityPendingDeletion(null)}>Cancelar</button>
              {communityDeletionConfirmed ? (
                <button type="button" className="primary" style={{ background: "#b2594d" }} onClick={confirmCommunityDeletion}>
                  Sí, dar de baja definitivamente
                </button>
              ) : (
                <button type="button" className="primary" style={{ background: "#b2594d" }} onClick={() => setCommunityDeletionConfirmed(true)}>
                  Continuar con la baja
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleView({
  communities,
  onSelectCommunity,
  onOpenAddModal,
  active,
  currentCommunity,
  onUpdateOwner,
  onAddOwner,
  onAddSampleOwners,
  onRequestDeleteCommunity,
  notify,
  onNavigate,
}: {
  active: string;
  currentCommunity: CommunityModel;
  onUpdateOwner: (original: OwnerModel, updated: OwnerModel) => boolean;
  onAddOwner: (owner: OwnerModel) => boolean;
  onAddSampleOwners: () => void;
  onRequestDeleteCommunity: (id: string) => void;
  communities: CommunityModel[];
  onSelectCommunity: (id: string) => void;
  onOpenAddModal: () => void;
  onNavigate: (module: string) => void;
  notify: (message: string) => void;
}) {
  const session = useSession();
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [demoCommunications, setDemoCommunications] = useState(
    currentCommunity.communications
  );

  // Sync communications when active community changes
  useEffect(() => {
    setDemoCommunications(currentCommunity.communications);
  }, [currentCommunity.id]);

  function addCommunication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "Nueva comunicación");
    const next: Array<{
      type: "Incidencia" | "Consulta" | "Sugerencia" | "Queja";
      title: string;
      meta: string;
      person: string;
      time: string;
      tone: "red" | "blue" | "violet" | "amber";
    }> = [
      {
        type: form.get("type") as "Incidencia" | "Consulta" | "Sugerencia" | "Queja",
        title,
        meta: `Portal 1 · 1º A`,
        person: "Propietario demo",
        time: "Ahora",
        tone: "blue",
      },
      ...demoCommunications,
    ];
    setDemoCommunications(next);
    setShowForm(false);
    notify("Aviso registrado correctamente");
  }

  const title = active === "Comunidades" ? currentCommunity.name : active === "Listado de comunidades" ? "Comunidades" : active;
  const subtitles: Record<string, string> = {
    "Listado de comunidades": "Selecciona una comunidad para abrir su panel de gestión",
    Comunidades: "Panel de gestión de esta comunidad",
    "Pendientes de pago": `Cuotas pendientes de ${currentCommunity.name}`,
    Propietarios: `Propietarios, viviendas y pagos de ${currentCommunity.name}`,
    Comunicaciones: `Envía comunicados por correo a los propietarios de ${currentCommunity.name}`,
    Mensajes: session ? "Conversaciones privadas con el propietario autorizado" : "Prueba local de conversaciones con propietarios ficticios",
    Documentos: `Biblioteca documental de ${currentCommunity.name}`,
    Juntas: `Convocatorias, orden del día y actas de ${currentCommunity.name}`,
    Economía: `Control económico y cuotas de ${currentCommunity.name}`,
    "Avisos y noticias": `Información publicada a los vecinos de ${currentCommunity.name}`,
    Configuración: "Preferencias generales de la plataforma",
  };

  return (
    <section className="module-page">
      <div className="demo-banner">
        <strong>Entorno de demostración</strong>
        <span>
          Gestionando activamente: <strong>{currentCommunity.name}</strong> ({currentCommunity.location})
        </span>
        <button
          onClick={() => {
            localStorage.removeItem(communitiesStorageKey);
            localStorage.removeItem(activeCommunityStorageKey);
            notify("Datos de demo restaurados");
            window.location.reload();
          }}
        >
          Restaurar demo
        </button>
      </div>

      <div className="module-title">
        <div>
          <p>{currentCommunity.name.toUpperCase()}</p>
          <h1>{title}</h1>
          <span>{subtitles[active] || "Módulo en preparación"}</span>
        </div>
        {!["Economía", "Comunidades", "Listado de comunidades", "Pendientes de pago", "Propietarios", "Mensajes", "Comunicaciones", "Documentos", "Juntas"].includes(active) && (
          <button className="primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={18} /> Nuevo
          </button>
        )}
      </div>

      {!["Economía", "Comunidades", "Listado de comunidades", "Pendientes de pago", "Propietarios", "Mensajes", "Comunicaciones", "Juntas"].includes(active) && (
        <div className="module-toolbar">
          <label className="module-search">
            <Icon name="search" size={17} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Buscar en ${title.toLowerCase()}…`}
            />
          </label>
          {active !== "Documentos" && <><button>Todos los estados ⌄</button><button>Más recientes ⌄</button></>}
        </div>
      )}

      {active === "Comunidades" && (
        <>
          <div className="community-workspace-cards">
            <button onClick={() => onNavigate("Propietarios")}>
              <Icon name="users" size={28} /><strong>{currentCommunity.owners.length}</strong>
              <h2>Propietarios</h2><p>Consulta viviendas y fichas de propietarios</p><span>Ver propietarios →</span>
            </button>
            <button onClick={() => onNavigate("Avisos y noticias")}>
              <Icon name="bell" size={28} /><strong>{currentCommunity.communications.length}</strong>
              <h2>Avisos y noticias</h2><p>Consulta las novedades de esta comunidad</p><span>Ver avisos →</span>
            </button>
            <button onClick={() => onNavigate("Pendientes de pago")}>
              <Icon name="wallet" size={28} /><strong>{currentCommunity.owners.filter(owner => owner.payment === "Pendiente").length}</strong>
              <h2>Pendientes de pago</h2><p>Revisa los propietarios con cuotas pendientes</p><span>Ver pendientes →</span>
            </button>
          </div>
          <div className="community-workspace-details">
            <span>{currentCommunity.location} · CIF: {currentCommunity.cif} · {currentCommunity.portals} portales · {currentCommunity.totalUnits} viviendas</span>
            <button onClick={() => onRequestDeleteCommunity(currentCommunity.id)}>Dar de baja esta comunidad</button>
          </div>
        </>
      )}
      {/* Vista de Comunidades: Muestra Terrazas de Bel Air, Jardines del Sol y cualquier otra */}
      {active === "Listado de comunidades" && (
        <div className="community-cards">
          {communities.map((comm) => {
            const isSelected = comm.id === currentCommunity.id;
            return (
              <article
                key={comm.id}
                className={`community-card ${isSelected ? "featured" : ""}`}
                onClick={() => onSelectCommunity(comm.id)}
                style={
                  isSelected
                    ? {
                        borderColor: "#257454",
                        boxShadow: "0 8px 24px rgba(37,116,84,0.12)",
                      }
                    : {}
                }
              >
                <div className="community-cover" style={{ background: comm.gradient }}>
                  <Icon name="building" size={35} />
                  <span>{isSelected ? "Comunidad activa" : "Disponible"}</span>
                </div>
                <div className="community-info">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3>{comm.name}</h3>
                      <p>
                        {comm.location} · CIF: {comm.cif}
                      </p>
                    </div>
                    {isSelected && (
                      <span
                        style={{
                          fontSize: "8px",
                          background: "#e4f1eb",
                          color: "#287052",
                          padding: "4px 7px",
                          borderRadius: "5px",
                          fontWeight: 800,
                          textTransform: "uppercase",
                        }}
                      >
                        Activa
                      </span>
                    )}
                  </div>
                  <div>
                    <span>
                      <b>{comm.portals}</b> portales
                    </span>
                    <span>
                      <b>{comm.totalUnits}</b> viviendas
                    </span>
                    <span>
                      <b>{comm.totalOwners}</b> propietarios
                    </span>
                  </div>
                  <div style={{ marginTop: "14px" }}>
                    {isSelected ? (
                      <button
                        style={{ color: "#257454", fontWeight: 800 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectCommunity(comm.id);
                        }}
                      >
                        Abrir panel de comunidad <Icon name="arrow" size={15} />
                      </button>
                    ) : (
                      <button
                        id={`activate-community-${comm.id}`}
                        style={{ color: "#16785f", fontWeight: 800 }}
                        onClick={(event) => {
                          event.stopPropagation();
                          onSelectCommunity(comm.id);
                        }}
                      >
                        Seleccionar comunidad <Icon name="arrow" size={15} />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    style={{ marginTop: "12px", color: "#b2594d", fontSize: "10px", fontWeight: 700 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      onRequestDeleteCommunity(comm.id);
                    }}
                  >
                    Dar de baja esta comunidad
                  </button>
                </div>
              </article>
            );
          })}

          <button className="add-community" onClick={onOpenAddModal}>
            <span>
              <Icon name="plus" />
            </span>
            <strong>Añadir comunidad</strong>
            <small>Alta manual o importación desde Excel</small>
          </button>
        </div>
      )}

      {/* Propietarios de la comunidad activa */}
      {(active === "Propietarios" || active === "Pendientes de pago") && (
        <OwnersView
          initialStatusFilter={active === "Pendientes de pago" ? "Pendiente" : "todos"}
          currentCommunity={currentCommunity}
          onUpdateOwner={onUpdateOwner}
          onAddOwner={onAddOwner}
          onAddExampleOwners={onAddSampleOwners}
          notify={notify}
        />
      )}

      {active === "Comunicaciones" && <EmailCommunications community={currentCommunity} />}
      {active === "Mensajes" && (session
        ? currentCommunity.id === 'bel-air' ? <PrivateMessages /> : <p>La prueba privada está habilitada solo para Terrazas de Bel Air.</p>
        : <OwnerMessages key={currentCommunity.id} communityId={currentCommunity.id} communityName={currentCommunity.name} />)}

      {/* Avisos de la comunidad activa */}
      {active === "Avisos y noticias" && (
        <div className="data-panel">
          <div className="data-head communications-head">
            <span>Tipo</span>
            <span>Asunto</span>
            <span>Propietario</span>
            <span>Recibida</span>
            <span></span>
          </div>
          {demoCommunications
            .filter((r) => r.title.toLowerCase().includes(filter.toLowerCase()))
            .map((r, i) => (
              <button
                className="data-row communications-row"
                key={r.title + i}
                onClick={() => notify(`Abriendo aviso: ${r.title}`)}
              >
                <span>
                  <em className={`type ${r.tone}`}>{r.type}</em>
                </span>
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.meta}</small>
                </span>
                <span>{r.person}</span>
                <span>{r.time}</span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
        </div>
      )}

      {/* Documentos de la comunidad activa */}
      {active === "Documentos" && <CommunityDocuments key={currentCommunity.id} community={currentCommunity} filter={filter} />}

      {active === "Juntas" && <CommunityMeetings key={currentCommunity.id} community={currentCommunity} />}

      {active === "Economía" && <PaymentsDemo community={currentCommunity} />}

      {/* Módulos restantes */}
      {!["Economía", "Comunidades", "Listado de comunidades", "Pendientes de pago", "Propietarios", "Mensajes", "Comunicaciones", "Avisos y noticias", "Documentos", "Juntas"].includes(
        active
      ) && (
        <div className="empty-module">
          <span className="stat-icon green">
            <Icon
              name={
                active === "Juntas"
                  ? "calendar"
                  : active === "Economía"
                  ? "wallet"
                  : "settings"
              }
              size={28}
            />
          </span>
          <h3>
            {title} para {currentCommunity.name} está preparado
          </h3>
          <p>
            La estructura multi-comunidad está vinculada a {currentCommunity.name}.
            Sus operaciones completas se conectarán progresivamente.
          </p>
          <button
            className="primary"
            onClick={() => notify(`Acción registrada en ${currentCommunity.name}`)}
          >
            <Icon name="plus" size={17} /> Crear ejemplo
          </button>
        </div>
      )}

      {/* Modal general para nuevo registro */}
      {showForm && (
        <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}>
          <form
            className="modal"
            onSubmit={
              active === "Avisos y noticias"
                ? addCommunication
                : (e) => {
                    e.preventDefault();
                    setShowForm(false);
                    notify(
                      `Ejemplo creado en ${title} para ${currentCommunity.name}`
                    );
                  }
            }
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <small>NUEVO REGISTRO EN {currentCommunity.name.toUpperCase()}</small>
                <h2>
                  {active === "Avisos y noticias"
                    ? "Nuevo aviso"
                    : `Nuevo en ${title}`}
                </h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            {active === "Avisos y noticias" && (
              <label>
                Tipo
                <select name="type">
                  <option value="Consulta">Consulta</option>
                  <option value="Queja">Queja</option>
                  <option value="Incidencia">Incidencia</option>
                  <option value="Sugerencia">Sugerencia</option>
                </select>
              </label>
            )}
            <label>
              Título
              <input
                name="title"
                required
                placeholder="Escribe un título descriptivo"
                autoFocus
              />
            </label>
            <label>
              Descripción
              <textarea
                name="description"
                rows={4}
                placeholder="Añade la información necesaria…"
              />
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
              <button className="primary" type="submit">
                Guardar ejemplo
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
