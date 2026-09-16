"use client";

import React, { useState } from "react";
import { Icon } from "./icon";
import { CommunityModel } from "../data/communitiesData";

interface CommunitySelectorHubProps {
  communities: CommunityModel[];
  onSelectCommunity: (id: string) => void;
  onOpenAddModal: () => void;
  userEmail?: string;
  onLogout?: () => void;
}

export function CommunitySelectorHub({
  communities,
  onSelectCommunity,
  onOpenAddModal,
  userEmail = "Jonatan Cusac",
  onLogout,
}: CommunitySelectorHubProps) {
  const [search, setSearch] = useState("");

  const filtered = communities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.location.toLowerCase().includes(search.toLowerCase()) ||
      c.cif.toLowerCase().includes(search.toLowerCase())
  );

  const totalViviendas = communities.reduce((acc, c) => acc + (c.totalUnits || 0), 0);
  const totalPropietarios = communities.reduce(
    (acc, c) => acc + (c.owners?.length || c.totalOwners || 0),
    0
  );
  const totalIncidencias = communities.reduce(
    (acc, c) => acc + (c.openCommunications || 0),
    0
  );

  return (
    <div className="hub-page">
      {/* Barra superior de cabecera */}
      <header className="hub-topbar">
        <div className="hub-brand">
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
        {/* Banner de bienvenida y métricas globales */}
        <section className="hub-hero">
          <div className="hub-hero-intro">
            <span className="hub-badge">PORTAL MULTI-COMUNIDAD</span>
            <h1>Selecciona una comunidad para gestionar</h1>
            <p>
              Elige el edificio o urbanización sobre el que deseas trabajar para acceder
              a su menú de propietarios, actas, juntas, contabilidad y comunicaciones.
            </p>
          </div>

          <div className="hub-stats-strip">
            <div className="hub-stat-item">
              <span>COMUNIDADES ACTIVAS</span>
              <strong>{communities.length}</strong>
            </div>
            <div className="hub-stat-item">
              <span>TOTAL INMUEBLES</span>
              <strong>{totalViviendas}</strong>
            </div>
            <div className="hub-stat-item">
              <span>CENSO PROPIETARIOS</span>
              <strong>{totalPropietarios}</strong>
            </div>
            <div className="hub-stat-item">
              <span>COMUNICACIONES</span>
              <strong>{totalIncidencias}</strong>
            </div>
          </div>
        </section>

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
      </main>
    </div>
  );
}
