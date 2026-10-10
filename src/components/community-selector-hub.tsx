"use client";

import React, { useState } from "react";
import { Icon } from "./icon";
import { CommunityModel } from "../data/communitiesData";

interface CommunitySelectorHubProps {
  onToggleMenu?: () => void;
  requestedSection?: string;
  communities: CommunityModel[];
  onSelectCommunity: (id: string) => void;
  onOpenAddModal: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function CommunitySelectorHub({
  onToggleMenu,
  requestedSection,
  communities,
  onSelectCommunity,
  onOpenAddModal,
  userEmail = "Jonatan Cusac",
  onLogout,
}: CommunitySelectorHubProps) {
  const [search, setSearch] = useState("");
  const [showAllNotices, setShowAllNotices] = useState(false);

  const filtered = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.cif.toLowerCase().includes(search.toLowerCase())
  );
  const totalNotices = communities.reduce((total, community) => total + community.communications.length, 0);

  return (
    <div className="hub-page">
      {/* Barra superior de cabecera */}
      <header className="hub-topbar">
        <div className="hub-brand">
          {onToggleMenu && <button className="mobile-menu" type="button" onClick={onToggleMenu} aria-label="Abrir menú"><Icon name="menu" /></button>}
          <div className="hub-logo">F</div>
          <div>
            <strong>FincaFlow</strong>
            <small>Panel de Comunidades</small>
          </div>
        </div>

        <div className="hub-topbar-right">
          <div className="hub-user-pill">
            <div className="hub-user-avatar">JC</div>
            <div className="hub-user-text">
              <strong>{userEmail}</strong>
              <small>Administrador</small>
            </div>
          </div>
          {onLogout && (
            <button
              className="hub-logout-btn"
              onClick={onLogout}
              title="Cerrar sesión"
            >
              <Icon name="arrow" size={14} /> Salir
            </button>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="hub-container">
        <div className="hub-heading"><h1>Comunidades</h1><p>{requestedSection && requestedSection !== "Comunidades" ? `Selecciona una comunidad para abrir ${requestedSection.toLowerCase()}.` : "Selecciona una comunidad para acceder a su gestión."}</p></div>
        {/* Barra de búsqueda y botón añadir */}
        <div className="hub-actions-bar">
          <div className="hub-search-wrapper">
            <Icon name="search" size={18} />
            <input
              id="hub-search-input"
              type="text"
              placeholder="Buscar por nombre, dirección o CIF…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                className="hub-search-clear"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </div>

          <button
            id="hub-btn-new-community"
            className="primary"
            style={{ height: "44px", padding: "0 20px" }}
            onClick={onOpenAddModal}
          >
            <Icon name="plus" size={17} />
            Nueva comunidad
          </button>
        </div>

        {/* Cuadrícula de tarjetas/casillas de comunidades */}
        <div className="hub-grid">
          {filtered.map((comm) => {
            const numOwners = comm.owners?.length || comm.totalOwners || 0;
            return (
              <div
                key={comm.id}
                id={`hub-card-${comm.id}`}
                className="hub-card"
                onClick={() => onSelectCommunity(comm.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelectCommunity(comm.id);
                  }
                }}
              >
                <div
                  className="hub-card-header"
                  style={{ background: comm.gradient || "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}
                >
                  <div className="hub-card-avatar" style={{ background: comm.avatarBg || "#1e3d30" }}>
                    {comm.avatarInitials || comm.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="hub-card-tag">{comm.portals} Portales</div>
                </div>

                <div className="hub-card-body">
                  <div className="hub-card-main-info">
                    <h3>{comm.name}</h3>
                    <p title={comm.location}>
                      <Icon name="building" size={13} /> {comm.location}
                    </p>
                    <small>CIF: {comm.cif}</small>
                  </div>

                  <div className="hub-card-metrics">
                    <div>
                      <b>{comm.totalUnits}</b>
                      <span>Viviendas</span>
                    </div>
                    <div>
                      <b>{numOwners}</b>
                      <span>Propietarios</span>
                    </div>
                    <div>
                      <b style={{ color: comm.pendingPaymentsCount > 0 ? "#b75b4f" : "#287052" }}>
                        {comm.pendingPaymentsCount}
                      </b>
                      <span>Pdtes. pago</span>
                    </div>
                  </div>

                  <div className="hub-card-action">
                    <span>Abrir panel de gestión</span>
                    <Icon name="arrow" size={16} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* Tarjeta rápida para añadir nueva */}
          <button
            type="button"
            id="hub-card-add-new"
            className="hub-card-add"
            onClick={onOpenAddModal}
          >
            <div className="hub-card-add-icon">
              <Icon name="plus" size={26} />
            </div>
            <strong>Registrar nueva comunidad</strong>
            <span>Configura un nuevo edificio, portales y propietarios</span>
          </button>
        </div>

        {filtered.length === 0 && (
          <div className="hub-empty">
            <Icon name="search" size={32} />
            <h3>No se encontraron comunidades</h3>
            <p>No coincide ninguna comunidad con el criterio "{search}".</p>
            <button
              className="owner-action-btn"
              style={{ margin: "14px auto 0", padding: "8px 16px" }}
              onClick={() => setSearch("")}
            >
              Borrar filtro
            </button>
          </div>
        )}

        <section style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid #e5ece8" }}>
          <button
            type="button"
            onClick={() => setShowAllNotices((isOpen) => !isOpen)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "16px",
              padding: "18px 20px",
              border: "1px solid #d8e6df",
              borderRadius: "12px",
              background: "#f4faf7",
              color: "#1c503b",
              cursor: "pointer",
              textAlign: "left",
            }}
            aria-expanded={showAllNotices}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ display: "grid", placeItems: "center", width: "38px", height: "38px", borderRadius: "50%", background: "#257454", color: "#fff" }}>
                <Icon name="bell" size={19} />
              </span>
              <span>
                <strong style={{ display: "block" }}>Avisos y noticias de todas las comunidades</strong>
                <small style={{ color: "#647c70" }}>Pulsa para verlos separados por comunidad</small>
              </span>
            </span>
            <strong style={{ fontSize: "18px" }}>{totalNotices}</strong>
          </button>

          {showAllNotices && (
            <div style={{ marginTop: "12px", display: "grid", gap: "12px" }}>
              {communities.map((community) => (
                <article key={community.id} className="data-panel" style={{ padding: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                    <div>
                      <strong>{community.name}</strong>
                      <small style={{ display: "block", marginTop: "3px", color: "#72847a" }}>{community.location}</small>
                    </div>
                    <span className="status">{community.communications.length} avisos</span>
                  </div>
                  {community.communications.map((notice, index) => (
                    <button
                      type="button"
                      key={`${notice.title}-${index}`}
                      onClick={() => onSelectCommunity(community.id)}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "10px", padding: "9px 0", border: 0, borderTop: index ? "1px solid #edf0ee" : 0, background: "transparent", cursor: "pointer", textAlign: "left" }}
                    >
                      <em className={`type ${notice.tone}`}>{notice.type}</em>
                      <span>
                        <strong style={{ display: "block", fontSize: "12px" }}>{notice.title}</strong>
                        <small style={{ color: "#72847a" }}>{notice.time}</small>
                      </span>
                    </button>
                  ))}
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
