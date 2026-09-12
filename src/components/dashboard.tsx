"use client";

import { useState } from "react";
import { Icon } from "./icon";

const nav = [
  ["grid", "Resumen"], ["building", "Comunidades"], ["users", "Propietarios"],
  ["message", "Comunicaciones"], ["bell", "Avisos y noticias"], ["folder", "Documentos"],
  ["calendar", "Juntas"], ["wallet", "Economía"],
] as const;

const communications = [
  { type: "Incidencia", title: "Fuga de agua en garaje", meta: "Portal 2 · Bajo A", person: "María González", time: "Hace 25 min", tone: "red" },
  { type: "Consulta", title: "Horario de la piscina", meta: "Portal 4 · 2º B", person: "Carlos Romero", time: "Hace 2 h", tone: "blue" },
  { type: "Sugerencia", title: "Iluminación zona ajardinada", meta: "Portal 1 · 1º C", person: "Elena Ruiz", time: "Ayer", tone: "violet" },
  { type: "Queja", title: "Ruido durante la madrugada", meta: "Portal 3 · Ático A", person: "Antonio Martín", time: "Ayer", tone: "amber" },
];

export function Dashboard() {
  const [active, setActive] = useState("Resumen");
  const [sidebar, setSidebar] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function action(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 2600);
  }

  return <div className="app-shell">
    <aside className={`sidebar ${sidebar ? "is-open" : ""}`}>
      <div className="brand"><span className="brand-mark"><Icon name="building" size={22}/></span><span>Finca<span>Flow</span></span></div>
      <div className="workspace-label">GESTIÓN</div>
      <nav>{nav.map(([icon, label]) => <button className={active === label ? "active" : ""} onClick={() => { setActive(label); setSidebar(false); }} key={label}><Icon name={icon}/><span>{label}</span>{label === "Comunicaciones" && <b>4</b>}</button>)}</nav>
      <div className="sidebar-bottom">
        <button onClick={() => setActive("Configuración")}><Icon name="settings"/><span>Configuración</span></button>
        <div className="profile"><div className="avatar">JC</div><div><strong>Jonatan Cusac</strong><small>Administrador general</small></div><Icon name="arrow" size={16}/></div>
      </div>
    </aside>

    <main>
      <header>
        <button className="mobile-menu" onClick={() => setSidebar(!sidebar)} aria-label="Abrir menú"><Icon name="menu"/></button>
        <div className="community-picker"><small>Comunidad activa</small><button>Terrazas de Bel Air <span>⌄</span></button></div>
        <div className="header-tools"><label className="search"><Icon name="search" size={18}/><input placeholder="Buscar en la comunidad…" /></label><button className="round"><Icon name="bell" size={19}/><i/></button></div>
      </header>

      <div className="content">
        {active !== "Resumen" ? <ModuleView active={active} notify={action} /> : <>
        <section className="welcome"><div><p>VIERNES, 12 DE SEPTIEMBRE</p><h1>Buenos días, Jonatan</h1><span>Aquí tienes el resumen de Terrazas de Bel Air.</span></div><button className="primary" onClick={() => action("Menú de creación preparado")}><Icon name="plus" size={18}/> Crear nuevo</button></section>

        <section className="stats">
          <article><div className="stat-icon green"><Icon name="building"/></div><div><small>Viviendas</small><strong>86</strong><span><em>82</em> con propietario</span></div></article>
          <article><div className="stat-icon blue"><Icon name="message"/></div><div><small>Comunicaciones abiertas</small><strong>4</strong><span><em>2 nuevas</em> esta semana</span></div></article>
          <article><div className="stat-icon amber"><Icon name="wallet"/></div><div><small>Pendientes de pago</small><strong>7</strong><span>8,1% de viviendas</span></div></article>
          <article><div className="stat-icon violet"><Icon name="folder"/></div><div><small>Documentos</small><strong>124</strong><span><em>6 nuevos</em> este mes</span></div></article>
        </section>

        <div className="dashboard-grid">
          <section className="panel communications"><div className="panel-head"><div><h2>Comunicaciones recientes</h2><p>Consultas, quejas, incidencias y sugerencias</p></div><button onClick={() => setActive("Comunicaciones")}>Ver todas <Icon name="arrow" size={15}/></button></div>
            <div className="communication-list">{communications.map((item) => <button className="communication" key={item.title} onClick={() => action(`Abriendo: ${item.title}`)}><span className={`type ${item.tone}`}>{item.type}</span><div><strong>{item.title}</strong><small>{item.meta} · {item.person}</small></div><time>{item.time}</time><Icon name="arrow" size={16}/></button>)}</div>
          </section>

          <section className="panel quick"><div className="panel-head"><div><h2>Acciones rápidas</h2><p>Las tareas más frecuentes</p></div></div>
            <div className="quick-grid">
              <button onClick={() => action("Formulario de documento preparado")}><span className="stat-icon violet"><Icon name="folder"/></span><strong>Subir documento</strong><small>PDF, imágenes y más</small></button>
              <button onClick={() => action("Editor de avisos preparado")}><span className="stat-icon blue"><Icon name="bell"/></span><strong>Publicar aviso</strong><small>A toda la comunidad</small></button>
              <button onClick={() => action("Alta de propietario preparada")}><span className="stat-icon green"><Icon name="users"/></span><strong>Nuevo propietario</strong><small>Asignar a vivienda</small></button>
              <button onClick={() => action("Nueva junta preparada")}><span className="stat-icon amber"><Icon name="calendar"/></span><strong>Convocar junta</strong><small>Crear orden del día</small></button>
            </div>
          </section>

          <section className="panel upcoming"><div className="panel-head"><div><h2>Próximos eventos</h2><p>Agenda de la comunidad</p></div><button>Ver calendario <Icon name="arrow" size={15}/></button></div>
            <div className="event"><div className="date"><b>24</b><span>SEP</span></div><div><strong>Junta General Ordinaria</strong><small><Icon name="clock" size={14}/> 18:30 · Salón comunitario</small></div><span className="status">Convocada</span></div>
            <div className="event"><div className="date pale"><b>02</b><span>OCT</span></div><div><strong>Revisión sistema contra incendios</strong><small><Icon name="clock" size={14}/> 09:00 · Zonas comunes</small></div><span className="status neutral">Mantenimiento</span></div>
          </section>

          <section className="panel pending"><div className="panel-head"><div><h2>Atención requerida</h2><p>Tareas que necesitan seguimiento</p></div></div>
            <button><span className="attention red"><Icon name="alert" size={18}/></span><div><strong>2 incidencias urgentes</strong><small>Requieren una respuesta</small></div><Icon name="arrow" size={16}/></button>
            <button><span className="attention amber"><Icon name="wallet" size={18}/></span><div><strong>7 pagos pendientes</strong><small>Última actualización: hoy</small></div><Icon name="arrow" size={16}/></button>
            <button><span className="attention blue"><Icon name="check" size={18}/></span><div><strong>3 documentos en borrador</strong><small>Pendientes de publicar</small></div><Icon name="arrow" size={16}/></button>
          </section>
        </div>
        </>}
      </div>
    </main>
    {sidebar && <button className="scrim" onClick={() => setSidebar(false)} aria-label="Cerrar menú"/>}
    {notice && <div className="toast"><Icon name="check" size={18}/>{notice}</div>}
  </div>;
}

const owners = [
  { initials: "MG", name: "María González", home: "Portal 2 · Bajo A", email: "maria.gonzalez@demo.es", payment: "Al día" },
  { initials: "CR", name: "Carlos Romero", home: "Portal 4 · 2º B", email: "carlos.romero@demo.es", payment: "Al día" },
  { initials: "ER", name: "Elena Ruiz", home: "Portal 1 · 1º C", email: "elena.ruiz@demo.es", payment: "Pendiente" },
  { initials: "AM", name: "Antonio Martín", home: "Portal 3 · Ático A", email: "antonio.martin@demo.es", payment: "Al día" },
  { initials: "LS", name: "Lucía Sánchez", home: "Portal 4 · 3º A", email: "lucia.sanchez@demo.es", payment: "Pendiente" },
];

const documents = [
  { title: "Convocatoria Junta General Ordinaria", category: "Convocatorias", date: "12/09/2026", files: "2 archivos", status: "Publicado" },
  { title: "Presupuesto reparación de fachada", category: "Presupuestos", date: "08/09/2026", files: "3 archivos", status: "Publicado" },
  { title: "Informe técnico de ascensores", category: "Informes técnicos", date: "02/09/2026", files: "1 archivo", status: "Borrador" },
  { title: "Acta Junta Extraordinaria", category: "Actas", date: "17/08/2026", files: "1 archivo", status: "Publicado" },
];

function ModuleView({ active, notify }: { active: string; notify: (message: string) => void }) {
  const [filter, setFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [demoRows, setDemoRows] = useState(communications);

  function addCommunication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "Nueva comunicación");
    const next = [{ type: String(form.get("type") || "Consulta"), title, meta: "Portal 4 · 2º A", person: "Propietario demo", time: "Ahora", tone: "blue" }, ...demoRows];
    setDemoRows(next);
    localStorage.setItem("fincaflow-demo-communications", JSON.stringify(next));
    setShowForm(false);
    notify("Comunicación registrada correctamente");
  }

  const title = active === "Avisos y noticias" ? "Avisos y noticias" : active;
  const subtitles: Record<string, string> = {
    Comunidades: "Gestiona las comunidades y su estructura",
    Propietarios: "Consulta propietarios, viviendas y estado de pago",
    Comunicaciones: "Centraliza consultas, quejas, incidencias y sugerencias",
    Documentos: "Biblioteca documental de la comunidad activa",
    Juntas: "Convocatorias, orden del día y actas",
    Economía: "Control económico inicial de la comunidad",
    "Avisos y noticias": "Información publicada en el portal del propietario",
    Configuración: "Preferencias generales de la plataforma",
  };

  return <section className="module-page">
    <div className="demo-banner"><strong>Entorno de demostración</strong><span>Todos los nombres y datos son ficticios.</span><button onClick={() => { localStorage.clear(); notify("Demo restaurada"); }}>Restaurar demo</button></div>
    <div className="module-title"><div><p>TERRAZAS DE BEL AIR</p><h1>{title}</h1><span>{subtitles[active] || "Módulo en preparación"}</span></div><button className="primary" onClick={() => setShowForm(true)}><Icon name="plus" size={18}/> Nuevo</button></div>
    <div className="module-toolbar"><label className="module-search"><Icon name="search" size={17}/><input value={filter} onChange={e => setFilter(e.target.value)} placeholder={`Buscar en ${title.toLowerCase()}…`}/></label><button>Todos los estados ⌄</button><button>Más recientes ⌄</button></div>

    {active === "Comunidades" && <div className="community-cards">
      <article className="community-card featured"><div className="community-cover"><Icon name="building" size={35}/><span>Comunidad activa</span></div><div className="community-info"><h3>Terrazas de Bel Air</h3><p>Estepona, Málaga</p><div><span><b>4</b> portales</span><span><b>86</b> viviendas</span><span><b>82</b> propietarios</span></div><button onClick={() => notify("Comunidad seleccionada")}>Abrir comunidad <Icon name="arrow" size={15}/></button></div></article>
      <button className="add-community" onClick={() => setShowForm(true)}><span><Icon name="plus"/></span><strong>Añadir comunidad</strong><small>Alta manual o importación desde Excel</small></button>
    </div>}

    {active === "Propietarios" && <div className="data-panel"><div className="data-head"><span>Propietario</span><span>Vivienda</span><span>Contacto</span><span>Estado</span><span></span></div>{owners.filter(o => o.name.toLowerCase().includes(filter.toLowerCase())).map(o => <button className="data-row" key={o.name} onClick={() => notify(`Ficha de ${o.name}`)}><span className="person"><i>{o.initials}</i><strong>{o.name}</strong></span><span>{o.home}</span><span>{o.email}</span><span><em className={o.payment === "Al día" ? "paid" : "debt"}>{o.payment}</em></span><Icon name="arrow" size={16}/></button>)}</div>}

    {active === "Comunicaciones" && <div className="data-panel"><div className="data-head communications-head"><span>Tipo</span><span>Asunto</span><span>Propietario</span><span>Recibida</span><span></span></div>{demoRows.filter(r => r.title.toLowerCase().includes(filter.toLowerCase())).map((r, i) => <button className="data-row communications-row" key={r.title + i}><span><em className={`type ${r.tone}`}>{r.type}</em></span><span><strong>{r.title}</strong><small>{r.meta}</small></span><span>{r.person}</span><span>{r.time}</span><Icon name="arrow" size={16}/></button>)}</div>}

    {active === "Documentos" && <div className="data-panel"><div className="data-head documents-head"><span>Documento</span><span>Categoría</span><span>Fecha</span><span>Estado</span><span></span></div>{documents.filter(d => d.title.toLowerCase().includes(filter.toLowerCase())).map(d => <button className="data-row documents-row" key={d.title} onClick={() => notify(`Abriendo ${d.title}`)}><span><strong>{d.title}</strong><small>{d.files}</small></span><span>{d.category}</span><span>{d.date}</span><span><em className={d.status === "Publicado" ? "paid" : "draft"}>{d.status}</em></span><Icon name="arrow" size={16}/></button>)}</div>}

    {!["Comunidades", "Propietarios", "Comunicaciones", "Documentos"].includes(active) && <div className="empty-module"><span className="stat-icon green"><Icon name={active === "Juntas" ? "calendar" : active === "Economía" ? "wallet" : "settings"} size={28}/></span><h3>{title} está preparado para la siguiente fase</h3><p>La navegación ya forma parte de la demo. Sus operaciones completas se conectarán progresivamente.</p><button className="primary" onClick={() => notify("Acción registrada en la demo")}><Icon name="plus" size={17}/> Crear ejemplo</button></div>}

    {showForm && <div className="modal-backdrop" onMouseDown={() => setShowForm(false)}><form className="modal" onSubmit={active === "Comunicaciones" ? addCommunication : (e) => { e.preventDefault(); setShowForm(false); notify("Ejemplo creado correctamente"); }} onMouseDown={e => e.stopPropagation()}><div className="modal-head"><div><small>NUEVO REGISTRO</small><h2>{active === "Comunicaciones" ? "Nueva comunicación" : `Nuevo en ${title}`}</h2></div><button type="button" onClick={() => setShowForm(false)}>×</button></div>{active === "Comunicaciones" && <label>Tipo<select name="type"><option>Consulta</option><option>Queja</option><option>Incidencia</option><option>Sugerencia</option></select></label>}<label>Título<input name="title" required placeholder="Escribe un título descriptivo"/></label><label>Descripción<textarea name="description" rows={4} placeholder="Añade la información necesaria…"/></label><div className="modal-actions"><button type="button" onClick={() => setShowForm(false)}>Cancelar</button><button className="primary" type="submit">Guardar ejemplo</button></div></form></div>}
  </section>;
}
