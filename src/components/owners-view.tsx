"use client";

import React, { useState } from "react";
import { Icon } from "./icon";
import { OwnerModel, CommunityModel } from "../data/communitiesData";

interface OwnersManagerProps {
  currentCommunity: CommunityModel;
  onAddOwner: (newOwner: OwnerModel) => void;
  onAddExampleOwners: () => void;
  notify: (msg: string) => void;
}

export const sampleOwnersBank = [
  {
    name: "Carmen Morales Delgado",
    homePrefix: "Portal 1 · 2º A",
    email: "carmen.morales@ejemplo.es",
    phone: "+34 612 34 56 78",
    dni: "45892147K",
    coefficient: "3,15%",
    payment: "Al día" as const,
  },
  {
    name: "David Sánchez Lozano",
    homePrefix: "Portal 2 · 1º B",
    email: "david.sanchez@ejemplo.es",
    phone: "+34 678 90 12 34",
    dni: "28741598M",
    coefficient: "2,85%",
    payment: "Al día" as const,
  },
  {
    name: "Elena Vázquez Ríos",
    homePrefix: "Portal 2 · Ático C",
    email: "elena.vazquez@ejemplo.es",
    phone: "+34 654 32 10 98",
    dni: "52147896X",
    coefficient: "4,10%",
    payment: "Pendiente" as const,
  },
  {
    name: "Fernando Gil Ramos",
    homePrefix: "Portal 3 · Bajo A",
    email: "fernando.gil@ejemplo.es",
    phone: "+34 633 45 67 89",
    dni: "36985214P",
    coefficient: "2,90%",
    payment: "Al día" as const,
  },
  {
    name: "Isabel Castro Méndez",
    homePrefix: "Portal 1 · 3º B",
    email: "isabel.castro@ejemplo.es",
    phone: "+34 644 11 22 33",
    dni: "14785236R",
    coefficient: "3,20%",
    payment: "Pendiente" as const,
  },
];

export function OwnersView({
  currentCommunity,
  onAddOwner,
  onAddExampleOwners,
  notify,
}: OwnersManagerProps) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "Al día" | "Pendiente">("todos");
  const [showModal, setShowModal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState<OwnerModel | null>(null);

  const filteredOwners = currentCommunity.owners.filter((o) => {
    const matchesQuery =
      o.name.toLowerCase().includes(filter.toLowerCase()) ||
      o.home.toLowerCase().includes(filter.toLowerCase()) ||
      o.email.toLowerCase().includes(filter.toLowerCase());

    const matchesStatus =
      statusFilter === "todos" ? true : o.payment === statusFilter;

    return matchesQuery && matchesStatus;
  }).sort((a, b) => {
    const portalNumber = (home: string) => {
      const match = home.match(/(?:bloque|portal)\s*(\d+)/i);
      return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
    };
    return portalNumber(a.home) - portalNumber(b.home)
      || a.home.localeCompare(b.home, "es", { numeric: true, sensitivity: "base" });
  });

  const upToDateCount = currentCommunity.owners.filter(
    (o) => o.payment === "Al día"
  ).length;
  const pendingCount = currentCommunity.owners.filter(
    (o) => o.payment === "Pendiente"
  ).length;

  return (
    <div>
      {/* Barra de herramientas y filtros */}
      <div className="module-toolbar">
        <label className="module-search">
          <Icon name="search" size={17} />
          <input
            id="owners-search-input"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={`Buscar por nombre, piso o email en ${currentCommunity.name}…`}
          />
        </label>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            id="filter-all-owners"
            style={{
              backgroundColor: statusFilter === "todos" ? "#edf7f2" : "#fff",
              borderColor: statusFilter === "todos" ? "#257454" : "var(--line)",
              color: statusFilter === "todos" ? "#257454" : "inherit",
              fontWeight: statusFilter === "todos" ? 700 : 400,
            }}
            onClick={() => setStatusFilter("todos")}
          >
            Todos ({currentCommunity.owners.length})
          </button>
          <button
            id="filter-paid-owners"
            style={{
              backgroundColor: statusFilter === "Al día" ? "#edf7f2" : "#fff",
              borderColor: statusFilter === "Al día" ? "#257454" : "var(--line)",
              color: statusFilter === "Al día" ? "#257454" : "inherit",
              fontWeight: statusFilter === "Al día" ? 700 : 400,
            }}
            onClick={() => setStatusFilter("Al día")}
          >
            Al día ({upToDateCount})
          </button>
          <button
            id="filter-pending-owners"
            style={{
              backgroundColor: statusFilter === "Pendiente" ? "#faeae7" : "#fff",
              borderColor: statusFilter === "Pendiente" ? "#b75b4f" : "var(--line)",
              color: statusFilter === "Pendiente" ? "#b75b4f" : "inherit",
              fontWeight: statusFilter === "Pendiente" ? 700 : 400,
            }}
            onClick={() => setStatusFilter("Pendiente")}
          >
            Pendientes ({pendingCount})
          </button>
        </div>

        <div style={{ display: "flex", gap: "8px", marginLeft: "auto" }}>
          <button
            id="btn-add-sample-owners"
            className="owner-action-btn"
            onClick={() => {
              onAddExampleOwners();
              notify(`Generados nuevos propietarios de ejemplo para ${currentCommunity.name}`);
            }}
            title="Añadir lote de propietarios de ejemplo"
          >
            <Icon name="users" size={14} /> Añadir lote de ejemplo
          </button>
          <button
            id="btn-create-owner"
            className="primary"
            style={{ height: "39px" }}
            onClick={() => setShowModal(true)}
          >
            <Icon name="plus" size={16} /> Nuevo propietario
          </button>
        </div>
      </div>

      {/* Tabla de propietarios */}
      <div className="data-panel">
        <div className="data-head owners-head">
          <span>Propietario / Titular</span>
          <span>Vivienda / Coef.</span>
          <span>Contacto</span>
          <span>Estado Cuota</span>
          <span>Acciones</span>
          <span></span>
        </div>

        {filteredOwners.length === 0 ? (
          <div
            style={{
              padding: "40px 20px",
              textAlign: "center",
              color: "#6b7d74",
              background: "#fff",
            }}
          >
            <p style={{ margin: 0, fontSize: "14px", fontWeight: 600 }}>
              No se encontraron propietarios con los filtros actuales
            </p>
            <p style={{ margin: "6px 0 16px", fontSize: "12px", color: "#8d9d95" }}>
              Puedes registrar un nuevo propietario o generar datos de ejemplo rápidamente.
            </p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                className="primary"
                onClick={() => setShowModal(true)}
              >
                <Icon name="plus" size={16} /> Crear propietario
              </button>
              <button
                className="owner-action-btn"
                style={{ padding: "8px 14px", fontSize: "12px" }}
                onClick={() => {
                  onAddExampleOwners();
                  notify(`Generados propietarios de ejemplo para ${currentCommunity.name}`);
                }}
              >
                Cargar propietarios de ejemplo
              </button>
            </div>
          </div>
        ) : (
          filteredOwners.map((o) => (
            <div
              className="data-row owners-row"
              key={o.email + o.home}
              onClick={() => setSelectedOwner(o)}
            >
              <span className="person">
                <i>{o.initials}</i>
                <div>
                  <strong>{o.name}</strong>
                  <small>{o.dni ? `DNI: ${o.dni}` : "Censo oficial"}</small>
                </div>
              </span>

              <span>
                <strong>{o.home}</strong>
                {o.coefficient ? (
                  <span className="coef-pill">Coef: {o.coefficient}</span>
                ) : (
                  <small>Portal comunitario</small>
                )}
              </span>

              <span>
                <strong>{o.email}</strong>
                <small>{o.phone || "+34 600 00 00 00"}</small>
              </span>

              <span>
                <em className={o.payment === "Al día" ? "paid" : "debt"}>
                  {o.payment}
                </em>
              </span>

              <span>
                <button
                  type="button"
                  className="owner-action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedOwner(o);
                  }}
                >
                  Ver ficha
                </button>
              </span>

              <Icon name="arrow" size={16} />
            </div>
          ))
        )}
      </div>

      {/* Modal para crear un propietario manual o con plantillas rápidas */}
      {showModal && (
        <CreateOwnerModal
          currentCommunity={currentCommunity}
          onClose={() => setShowModal(false)}
          onCreate={(owner) => {
            onAddOwner(owner);
            setShowModal(false);
            notify(`Propietario ${owner.name} añadido a ${currentCommunity.name}`);
          }}
        />
      )}

      {/* Modal Ficha Detallada del Propietario */}
      {selectedOwner && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setSelectedOwner(null)}
        >
          <div
            className="modal"
            style={{ width: "min(520px, 100%)" }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <small>FICHA DE PROPIETARIO · {currentCommunity.name.toUpperCase()}</small>
                <h2>{selectedOwner.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOwner(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "12px 14px",
                background: "#f4f8f6",
                borderRadius: "10px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  backgroundColor: "#257454",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: "14px",
                }}
              >
                {selectedOwner.initials}
              </div>
              <div>
                <strong style={{ fontSize: "14px", color: "#1a2c23" }}>
                  {selectedOwner.home}
                </strong>
                <div style={{ fontSize: "11px", color: "#61746b", marginTop: "2px" }}>
                  {selectedOwner.dni ? `Documento: ${selectedOwner.dni} · ` : ""}
                  Coeficiente de participación: {selectedOwner.coefficient || "3,25%"}
                </div>
              </div>
              <span
                style={{ marginLeft: "auto" }}
                className={selectedOwner.payment === "Al día" ? "status" : "status neutral"}
              >
                {selectedOwner.payment}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "8px" }}>
                <small style={{ color: "#778780", fontSize: "10px", display: "block" }}>Correo electrónico</small>
                <strong style={{ fontSize: "12px", color: "#223" }}>{selectedOwner.email}</strong>
              </div>
              <div style={{ padding: "10px", border: "1px solid var(--line)", borderRadius: "8px" }}>
                <small style={{ color: "#778780", fontSize: "10px", display: "block" }}>Teléfono de contacto</small>
                <strong style={{ fontSize: "12px", color: "#223" }}>{selectedOwner.phone || "+34 611 22 33 44"}</strong>
              </div>
            </div>

            <div style={{ padding: "12px", border: "1px solid var(--line)", borderRadius: "8px", marginBottom: "16px" }}>
              <small style={{ color: "#778780", fontSize: "10px", display: "block", marginBottom: "4px" }}>
                Historial con la administración
              </small>
              <p style={{ margin: 0, fontSize: "11px", color: "#475950", lineHeight: 1.5 }}>
                Registrado en el censo de <strong>{currentCommunity.name}</strong>. Convocatorias de juntas y comunicaciones generales habilitadas por email.
              </p>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setSelectedOwner(null)}
              >
                Cerrar
              </button>
              <button
                className="primary"
                type="button"
                onClick={() => {
                  notify(`Notificación enviada a ${selectedOwner.email}`);
                  setSelectedOwner(null);
                }}
              >
                Enviar comunicación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CreateOwnerModal({
  currentCommunity,
  onClose,
  onCreate,
}: {
  currentCommunity: CommunityModel;
  onClose: () => void;
  onCreate: (owner: OwnerModel) => void;
}) {
  const [tab, setTab] = useState<"manual" | "sample">("manual");
  const [name, setName] = useState("");
  const [home, setHome] = useState(`Portal 1 · 1º A`);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dni, setDni] = useState("");
  const [coefficient, setCoefficient] = useState("3,12%");
  const [payment, setPayment] = useState<"Al día" | "Pendiente">("Al día");

  function applyQuickTemplate(sample: typeof sampleOwnersBank[0]) {
    setName(sample.name);
    setHome(sample.homePrefix);
    setEmail(sample.email);
    setPhone(sample.phone);
    setDni(sample.dni);
    setCoefficient(sample.coefficient);
    setPayment(sample.payment);
    setTab("manual");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    const initials = name
      .trim()
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "PR";

    const newOwner: OwnerModel = {
      id: `owner-${Date.now()}`,
      initials,
      name: name.trim(),
      home: home.trim() || `Portal 1 · 1º A`,
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, ".")}@ejemplo.com`,
      phone: phone.trim() || "+34 600 12 34 56",
      dni: dni.trim() || "00000000X",
      coefficient: coefficient.trim() || "3,00%",
      payment,
    };

    onCreate(newOwner);
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        style={{ width: "min(500px, 100%)" }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <div>
            <small>NUEVO PROPIETARIO · {currentCommunity.name.toUpperCase()}</small>
            <h2>Alta de Propietario</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar">
            ×
          </button>
        </div>

        {/* Selector de pestañas: Manual vs Plantillas de Ejemplo */}
        <div className="tab-group">
          <button
            type="button"
            className={`tab-btn ${tab === "manual" ? "is-active" : ""}`}
            onClick={() => setTab("manual")}
          >
            Formulario manual
          </button>
          <button
            type="button"
            className={`tab-btn ${tab === "sample" ? "is-active" : ""}`}
            onClick={() => setTab("sample")}
          >
            Elegir de plantilla de ejemplo ✨
          </button>
        </div>

        {tab === "sample" ? (
          <div>
            <p style={{ fontSize: "11px", color: "#667a70", margin: "0 0 10px" }}>
              Selecciona una ficha de propietario de ejemplo para rellenar los datos automáticamente:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "320px", overflowY: "auto" }}>
              {sampleOwnersBank.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    border: "1px solid var(--line)",
                    borderRadius: "8px",
                    background: "#fff",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                  onClick={() => applyQuickTemplate(sample)}
                >
                  <div>
                    <strong style={{ display: "block", fontSize: "12px", color: "#192821" }}>
                      {sample.name}
                    </strong>
                    <small style={{ color: "#778780", fontSize: "10px" }}>
                      {sample.homePrefix} · {sample.email}
                    </small>
                  </div>
                  <span
                    style={{
                      fontSize: "9px",
                      padding: "3px 8px",
                      borderRadius: "5px",
                      backgroundColor: sample.payment === "Al día" ? "#e6f2ec" : "#fae9e5",
                      color: sample.payment === "Al día" ? "#287052" : "#b2594d",
                      fontWeight: 700,
                    }}
                  >
                    {sample.payment}
                  </span>
                </button>
              ))}
            </div>
            <div className="modal-actions" style={{ marginTop: "16px" }}>
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <label>
              Nombre completo
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Ej. Carmen Morales Delgado"
                autoFocus
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "10px" }}>
              <label>
                Vivienda asignada
                <input
                  name="home"
                  value={home}
                  onChange={(e) => setHome(e.target.value)}
                  required
                  placeholder="Ej. Portal 1 · 2º A"
                />
              </label>

              <label>
                Coeficiente (% cuota)
                <input
                  name="coefficient"
                  value={coefficient}
                  onChange={(e) => setCoefficient(e.target.value)}
                  placeholder="Ej. 3,15%"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label>
                Email
                <input
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="propietario@email.com"
                />
              </label>

              <label>
                Teléfono
                <input
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+34 612 34 56 78"
                />
              </label>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <label>
                DNI / NIE
                <input
                  name="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  placeholder="Ej. 12345678Z"
                />
              </label>

              <label>
                Estado de recibos
                <select
                  name="payment"
                  value={payment}
                  onChange={(e) => setPayment(e.target.value as "Al día" | "Pendiente")}
                >
                  <option value="Al día">Al día</option>
                  <option value="Pendiente">Pendiente de pago</option>
                </select>
              </label>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={onClose}>
                Cancelar
              </button>
              <button className="primary" type="submit">
                Guardar propietario
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
