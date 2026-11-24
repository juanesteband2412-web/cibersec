
(() => {
  "use strict";

  const $ = (selector, root = document) =>
    root.querySelector(selector);

  const $$ = (selector, root = document) =>
    [...root.querySelectorAll(selector)];

  const clock = $("#clock");
  const lastUpdated = $("#lastUpdated");
  const scanButton = $("#scanButton");
  const toast = $("#toast");
  const toastMessage = $("#toastMessage");
  const eventRows = $("#eventRows");
  const eventFilter = $("#eventFilter");
  const visibleCount = $("#visibleCount");
  const menuToggle = $("#menuToggle");
  const sidebar = $("#sidebar");

  let toastTimer;
  let scanCount = 0;

  // RELOJ EN TIEMPO REAL
  function updateClock() {
    const now = new Date();

    clock.textContent = now.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  }

  // NOTIFICACIONES
  function showToast(message) {
    toastMessage.textContent = message;
    toast.classList.add("show");

    window.clearTimeout(toastTimer);

    toastTimer = window.setTimeout(() => {
      toast.classList.remove("show");
    }, 3200);
  }

  // FILTRO DE EVENTOS
  function applyEventFilter() {
    const filter = eventFilter.value;
    let count = 0;

    $$("tr", eventRows).forEach(row => {
      const visible =
        filter === "all" || row.dataset.type === filter;

      row.hidden = !visible;

      if (visible) count++;
    });

    visibleCount.textContent = String(count);
  }

  // AGREGAR EVENTO AL REGISTRO
  function addScanEvent() {
    const now = new Date().toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });

    const row = document.createElement("tr");
    row.dataset.type = "safe";

    const eventCell = document.createElement("td");

    const dot = document.createElement("span");
    dot.className = "event-dot info";

    eventCell.append(
      dot,
      document.createTextNode(
        "Revisión de seguridad completada"
      )
    );

    const sourceCell = document.createElement("td");
    sourceCell.className = "mono";
    sourceCell.textContent = "Sistema local";

    const timeCell = document.createElement("td");
    timeCell.textContent = `Hoy, ${now}`;

    const stateCell = document.createElement("td");

    const tag = document.createElement("span");
    tag.className = "tag tag-safe";
    tag.textContent = "Correcto";

    stateCell.append(tag);

    row.append(
      eventCell,
      sourceCell,
      timeCell,
      stateCell
    );

    eventRows.prepend(row);

    applyEventFilter();
  }

  // SIMULACIÓN DE REVISIÓN DE SEGURIDAD
  function runDemoScan() {
    if (scanButton.disabled) return;

    scanButton.disabled = true;

    scanButton.innerHTML =
      '<span class="scan-symbol">◌</span> Revisando...';

    scanButton.setAttribute("aria-busy", "true");

    window.setTimeout(() => {
      scanCount++;

      addScanEvent();

      lastUpdated.textContent = "ahora mismo";

      scanButton.disabled = false;

      scanButton.innerHTML =
        '<span class="scan-symbol">⌕</span> Ejecutar revisión <span class="button-arrow">↗</span>';

      scanButton.removeAttribute("aria-busy");

      showToast(
        `Revisión ${scanCount} completada. No se detectaron incidentes críticos.`
      );

    }, 1500);
  }

  // EXPORTAR REGISTROS CSV
  function exportLog() {
    const rows = $$("tr", eventRows)
      .filter(row => !row.hidden);

    const csv = [
      ["Evento", "Origen", "Fecha y hora", "Estado"],

      ...rows.map(row =>
        [...row.cells].map(cell =>
          cell.textContent.trim()
        )
      )

    ].map(row =>
      row.map(value =>
        `"${value.replaceAll('"', '""')}"`
      ).join(",")
    ).join("\n");

    const blob = new Blob(
      ["\uFEFF" + csv],
      { type: "text/csv;charset=utf-8;" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "registro-anti-hack.csv";

    document.body.append(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);

    showToast("Registro exportado en formato CSV.");
  }

  // BOTÓN DE REVISIÓN
  scanButton.addEventListener(
    "click",
    runDemoScan
  );

  // FILTROS
  eventFilter.addEventListener(
    "change",
    applyEventFilter
  );

  // EXPORTAR
  $("#exportButton").addEventListener(
    "click",
    exportLog
  );

  // MOSTRAR TODOS LOS EVENTOS
  $("#showAllButton").addEventListener("click", () => {
    eventFilter.value = "all";

    applyEventFilter();

    showToast(
      "Mostrando todos los eventos disponibles."
    );
  });

  // RANGO DEL GRÁFICO
  $("#rangeButton").addEventListener("click", () => {
    showToast(
      "El gráfico muestra datos ilustrativos de los últimos 7 días."
    );
  });

  // CAMBIAR TEMA
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("light-mode");

    const isLight =
      document.body.classList.contains("light-mode");

    $("#themeToggle").setAttribute(
      "aria-label",
      isLight
        ? "Activar modo oscuro"
        : "Activar modo claro"
    );

    showToast(
      isLight
        ? "Modo claro activado."
        : "Modo oscuro activado."
    );
  });

  // MENÚ PARA CELULARES
  menuToggle.addEventListener("click", () => {
    const isOpen = sidebar.classList.toggle("open");

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Cerrar menú" : "Abrir menú"
    );
  });

  // NAVEGACIÓN
  $$(".nav-link", sidebar).forEach(link => {

    link.addEventListener("click", () => {

      $$(".nav-link", sidebar).forEach(item => {
        item.classList.remove("active");
      });

      link.classList.add("active");

      sidebar.classList.remove("open");

      menuToggle.setAttribute(
        "aria-expanded",
        "false"
      );
    });

  });

  // INICIALIZACIÓN
  updateClock();

  window.setInterval(updateClock, 1000);

  applyEventFilter();

})();
