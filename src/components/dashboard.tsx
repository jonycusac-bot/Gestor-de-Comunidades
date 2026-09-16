"use client";

import React, { useState, useEffect } from "react";
import { Icon } from "./icon";
import { initialCommunitiesList, CommunityModel, OwnerModel } from "../data/communitiesData";
import { OwnersView, sampleOwnersBank } from "./owners-view";
import { CommunitySelectorHub } from "./community-selector-hub";

const nav = [
  ["grid", "Resumen"],
  ["building", "Comunidades"],
  ["users", "Propietarios"],
  ["message", "Comunicaciones"],
  ["bell", "Avisos y noticias"],
  ["folder", "Documentos"],
  ["calendar", "Juntas"],
  ["wallet", "Economía"],
] as const;

export function Dashboard() {
  const [active, setActive] = useState<string>("Resumen");
  const [sidebar, setSidebar] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Communities state
  const [communities, setCommunities] = useState<CommunityModel[]>(() => {
    try {
      const saved = localStorage.getItem("fincaflow-custom-communities");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return initialCommunitiesList;
  });

  // Each entry starts at the selector, including after a previous community was opened.
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAddCommunityModal, setShowAddCommunityModal] = useState(false);
  const [communityModalOwnerMode, setCommunityModalOwnerMode] = useState<"sample" | "manual">("sample");

  // Get current active community object if one is chosen
  const currentCommunity = communities.find((c) => c.id === selectedCommunityId);

  function action(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  function handleSelectCommunity(id: string) {
    const target = communities.find((c) => c.id === id);
    if (!target) return;
    setSelectedCommunityId(id);
    setDropdownOpen(false);
    setActive("Resumen");
    action(`Comunidad abierta: ${target.name}`);
  }

  function handleReturnToHub() {
    setSelectedCommunityId(null);
    setDropdownOpen(false);
  }

  function handleAddOwnerToCurrentCommunity(newOwner: OwnerModel) {
    if (!currentCommunity) return;
    const updatedCommunities = communities.map((comm) => {
      if (comm.id === currentCommunity.id) {
        const nextOwners = [newOwner, ...comm.owners];
        return {
          ...comm,
          owners: nextOwners,
          totalOwners: nextOwners.length,
        };
      }
      return comm;
    });

    setCommunities(updatedCommunities);
    try {
      localStorage.setItem("fincaflow-custom-communities", JSON.stringify(updatedCommunities));
    } catch {
      // ignore
    }
  }

  function handleAddSampleOwnersToCurrentCommunity() {
    if (!currentCommunity) return;
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
        const existingEmails = new Set(comm.owners.map((o) => o.email));
        const toAdd = nextSampleOwners.filter((o) => !existingEmails.has(o.email));
        const finalOwners = toAdd.length > 0 ? [...toAdd, ...comm.owners] : [...nextSampleOwners, ...comm.owners];
        return {
          ...comm,
          owners: finalOwners,
          totalOwners: finalOwners.length,
        };
      }
      return comm;
    });

    setCommunities(updatedCommunities);
    try {
      localStorage.setItem("fincaflow-custom-communities", JSON.stringify(updatedCommunities));
    } catch {
      // ignore
    }
  }

  function handleCreateCommunity(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") || "").trim();
    if (!name) return;

    const location = String(form.get("location") || "Málaga").trim();
    const portals = Number(form.get("portals") || 2);
    const totalUnits = Number(form.get("totalUnits") || 32);
    const cif = String(form.get("cif") || `H-${Math.floor(10000000 + Math.random() * 90000000)}`);
    const ownerMode = String(form.get("ownerMode") || "sample");

    let initialOwners: OwnerModel[] = [];

    if (ownerMode === "sample") {
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
      localStorage.setItem("fincaflow-custom-communities", JSON.stringify(next));
    } catch {
      // ignore
    }
    setShowAddCommunityModal(false);
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

  // If no community is selected yet (or user returned to the list), render the Community Selector Hub
  if (!currentCommunity) {
    return (
      <>
        <CommunitySelectorHub
          communities={communities}
          onSelectCommunity={handleSelectCommunity}
          onOpenAddModal={() => setShowAddCommunityModal(true)}
        />

        {/* Modal de Crear Comunidad accesible desde el Hub */}
        {showAddCommunityModal && (
          <div
            className="modal-backdrop"
            onClick={() => setShowAddCommunityModal(false)}
          >
            <div className="modal" onClick={(e) => e.stopPropagation()}>
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

                {/* Configuración de propietarios iniciales */}
                <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                  <small style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                    PROPIETARIOS INICIALES
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
                      Generar 6 propietarios de ejemplo
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
                      💡 Se autogenerarán 6 propietarios realistas (con DNI, teléfonos, correos y coeficientes de participación) para que puedas probar la comunidad de inmediato.
                    </p>
                  ) : (
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

        {/* Botón de acceso directo para cambiar de comunidad */}
        <div style={{ padding: "0 14px 12px" }}>
          <button
            type="button"
            className="switch-community-btn"
            style={{
              width: "100%",
              justifyContent: "space-between",
              padding: "8px 10px",
              background: "#163c2c",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e6f2eb",
              borderRadius: "8px",
              fontSize: "11px",
              fontWeight: 600,
              margin: 0,
            }}
            onClick={handleReturnToHub}
            title="Ver todas las comunidades"
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Icon name="building" size={14} />
              <span>Cambiar comunidad</span>
            </span>
            <span style={{ fontSize: "10px", opacity: 0.7 }}>◀ Salir</span>
          </button>
        </div>

        <div className="workspace-label">
          {currentCommunity.name.toUpperCase()}
        </div>
        <nav>
          {nav.map(([icon, label]) => (
            <button
              id={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
              className={active === label ? "active" : ""}
              onClick={() => {
                setActive(label);
                setSidebar(false);
              }}
              key={label}
            >
              <Icon name={icon} />
              <span>{label}</span>
              {label === "Comunicaciones" && (
                <b>{currentCommunity.openCommunications}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setActive("Configuración")}>
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
                        setActive("Comunidades");
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
              onClick={() => action("Notificaciones de la comunidad")}
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
              communities={communities}
              onSelectCommunity={handleSelectCommunity}
              onOpenAddModal={() => setShowAddCommunityModal(true)}
              onAddOwner={handleAddOwnerToCurrentCommunity}
              onAddSampleOwners={handleAddSampleOwnersToCurrentCommunity}
              notify={action}
            />
          ) : (
            <>
              <section className="welcome">
                <div>
                  <p>VIERNES, 12 DE SEPTIEMBRE</p>
                  <h1>Buenos días, Jonatan</h1>
                  <span>Aquí tienes el resumen de {currentCommunity.name}.</span>
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
                    <small>Comunicaciones abiertas</small>
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
                {/* Comunicaciones de la comunidad activa */}
                <section className="panel communications">
                  <div className="panel-head">
                    <div>
                      <h2>Comunicaciones recientes</h2>
                      <p>Consultas, quejas, incidencias y sugerencias</p>
                    </div>
                    <button onClick={() => setActive("Comunicaciones")}>
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
            className="modal"
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

            {/* Configuración de propietarios iniciales */}
            <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
              <small style={{ fontWeight: 600, color: "var(--text-muted)", display: "block", marginBottom: "8px" }}>
                PROPIETARIOS INICIALES
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
                  Generar 6 propietarios de ejemplo
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
                  💡 Se autogenerarán 6 propietarios realistas (con DNI, teléfonos, correos y coeficientes de participación) para que puedas probar la comunidad de inmediato.
                </p>
              ) : (
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
    </div>
  );
}

function ModuleView({
  active,
  currentCommunity,
  communities,
  onSelectCommunity,
  onOpenAddModal,
  onAddOwner,
  onAddSampleOwners,
  notify,
}: {
  active: string;
  currentCommunity: CommunityModel;
  communities: CommunityModel[];
  onSelectCommunity: (id: string) => void;
  onOpenAddModal: () => void;
  onAddOwner: (owner: OwnerModel) => void;
  onAddSampleOwners: () => void;
  notify: (message: string) => void;
}) {
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
    notify("Comunicación registrada correctamente");
  }

  const title = active === "Avisos y noticias" ? "Avisos y noticias" : active;
  const subtitles: Record<string, string> = {
    Comunidades: "Gestiona las comunidades asignadas y su configuración",
    Propietarios: `Propietarios, viviendas y pagos de ${currentCommunity.name}`,
    Comunicaciones: `Consultas, quejas, incidencias y sugerencias en ${currentCommunity.name}`,
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
            localStorage.clear();
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
        {active !== "Propietarios" && (
          <button className="primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={18} /> Nuevo
          </button>
        )}
      </div>

      {active !== "Propietarios" && (
        <div className="module-toolbar">
          <label className="module-search">
            <Icon name="search" size={17} />
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder={`Buscar en ${title.toLowerCase()}…`}
            />
          </label>
          <button>Todos los estados ⌄</button>
          <button>Más recientes ⌄</button>
        </div>
      )}

      {/* Vista de Comunidades: Muestra Terrazas de Bel Air, Jardines del Sol y cualquier otra */}
      {active === "Comunidades" && (
        <div className="community-cards">
          {communities.map((comm) => {
            const isSelected = comm.id === currentCommunity.id;
            return (
              <article
                key={comm.id}
                className={`community-card ${isSelected ? "featured" : ""}`}
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
                        onClick={() => notify(`Ya estás gestionando ${comm.name}`)}
                      >
                        Gestionando actualmente <Icon name="check" size={15} />
                      </button>
                    ) : (
                      <button
                        id={`activate-community-${comm.id}`}
                        style={{ color: "#16785f", fontWeight: 800 }}
                        onClick={() => onSelectCommunity(comm.id)}
                      >
                        Seleccionar comunidad <Icon name="arrow" size={15} />
                      </button>
                    )}
                  </div>
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
      {active === "Propietarios" && (
        <OwnersView
          currentCommunity={currentCommunity}
          onAddOwner={onAddOwner}
          onAddExampleOwners={onAddSampleOwners}
          notify={notify}
        />
      )}

      {/* Comunicaciones de la comunidad activa */}
      {active === "Comunicaciones" && (
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
                onClick={() => notify(`Abriendo comunicación: ${r.title}`)}
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
      {active === "Documentos" && (
        <div className="data-panel">
          <div className="data-head documents-head">
            <span>Documento</span>
            <span>Categoría</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span></span>
          </div>
          {currentCommunity.documents
            .filter((d) => d.title.toLowerCase().includes(filter.toLowerCase()))
            .map((d) => (
              <button
                className="data-row documents-row"
                key={d.title}
                onClick={() => notify(`Abriendo ${d.title}`)}
              >
                <span>
                  <strong>{d.title}</strong>
                  <small>{d.files}</small>
                </span>
                <span>{d.category}</span>
                <span>{d.date}</span>
                <span>
                  <em className={d.status === "Publicado" ? "paid" : "draft"}>
                    {d.status}
                  </em>
                </span>
                <Icon name="arrow" size={16} />
              </button>
            ))}
        </div>
      )}

      {/* Módulos restantes */}
      {!["Comunidades", "Propietarios", "Comunicaciones", "Documentos"].includes(
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
              active === "Comunicaciones"
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
                  {active === "Comunicaciones"
                    ? "Nueva comunicación"
                    : `Nuevo en ${title}`}
                </h2>
              </div>
              <button type="button" onClick={() => setShowForm(false)}>
                ×
              </button>
            </div>
            {active === "Comunicaciones" && (
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
