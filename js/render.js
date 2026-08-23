/**
 * UTILIDADES DE RENDERIZADO PARA EL DOM (REDISEÑO CINEMÁTICO & FILTROS)
 * 
 * Funciones reutilizables encargadas de generar el HTML dinámico
 * para las tarjetas de películas, series, personas, paginación y el sidebar de filtros.
 */

// Formatea la fecha de AAAA-MM-DD a un texto amigable
function formatearFecha(fechaStr) {
  if (!fechaStr) return "Sin fecha de estreno";
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
  } catch (e) {
    return fechaStr;
  }
}

// Devuelve la clase CSS adecuada según la calificación
function obtenerClaseCalificacion(puntuacion) {
  if (puntuacion >= 7.0) return "alta";
  if (puntuacion >= 5.0) return "media";
  return "baja";
}

// Renderiza una tarjeta de Película o Serie de TV
function crearTarjetaMedia(item, esPelicula = true, esAward = false, isRoot = false) {
  const titulo = esPelicula ? item.title : item.name;
  const fecha = esPelicula ? item.release_date : item.first_air_date;
  const posterPath = item.poster_path;
  const placeholder = isRoot ? URL_PLACEHOLDER_LOCAL : URL_PLACEHOLDER;
  const posterUrl = posterPath ? `${URL_IMAGEN}${posterPath}` : placeholder;
  const calificacion = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
  const claseCalificacion = obtenerClaseCalificacion(item.vote_average || 0);

  const badgeAwardHTML = esAward ? `
    <div class="badge-award">
      🏆 TMDB Honor
    </div>
  ` : '';

  return `
    <article class="tarjeta-media">
      ${badgeAwardHTML}
      <div class="poster-wrapper">
        <img 
          src="${posterUrl}" 
          alt="${titulo || 'Sin título'}" 
          class="poster-img"
          loading="lazy"
          onerror="this.onerror=null; this.src='${placeholder}';"
        >
        <div class="badge-puntuacion ${claseCalificacion}">
          ${calificacion}
        </div>
      </div>
      <div class="tarjeta-info">
        <h3 class="tarjeta-titulo" title="${titulo || ''}">${titulo || 'Título no disponible'}</h3>
        <span class="tarjeta-fecha">📅 ${formatearFecha(fecha)}</span>
        <p class="tarjeta-resumen">${item.overview || 'Sin descripción disponible en este momento.'}</p>
      </div>
    </article>
  `;
}

// Renderiza una tarjeta de Persona (Actores/Directores)
function crearTarjetaPersona(persona, isRoot = false) {
  const placeholder = isRoot ? URL_PLACEHOLDER_LOCAL : URL_PLACEHOLDER;
  const fotoUrl = persona.profile_path ? `${URL_IMAGEN}${persona.profile_path}` : placeholder;
  
  const trabajos = persona.known_for
    ? persona.known_for.map(m => m.title || m.name).filter(Boolean).join(', ')
    : 'No especificado';

  return `
    <article class="tarjeta-persona">
      <div class="poster-wrapper">
        <img 
          src="${fotoUrl}" 
          alt="${persona.name}" 
          class="poster-img"
          loading="lazy"
          onerror="this.onerror=null; this.src='${placeholder}';"
        >
      </div>
      <div class="tarjeta-info">
        <h3 class="tarjeta-titulo">${persona.name}</h3>
        <p class="persona-conocido">🎬 <strong>Conocido por:</strong> ${trabajos}</p>
      </div>
    </article>
  `;
}

// Renderiza la barra de paginación
function renderPaginacion(contenedor, paginaActual, totalPaginas, onCambiarPagina) {
  if (!contenedor) return;

  const maxPaginas = Math.min(totalPaginas || 1, 500);

  contenedor.innerHTML = `
    <div class="paginacion-container">
      <button id="btn-anterior" class="btn-paginacion" ${paginaActual <= 1 ? 'disabled' : ''}>
        ← Anterior
      </button>
      <span class="pagina-actual-badge">Página ${paginaActual} de ${maxPaginas}</span>
      <button id="btn-siguiente" class="btn-paginacion" ${paginaActual >= maxPaginas ? 'disabled' : ''}>
        Siguiente →
      </button>
    </div>
  `;

  const btnAnterior = contenedor.querySelector('#btn-anterior');
  const btnSiguiente = contenedor.querySelector('#btn-siguiente');

  if (btnAnterior && paginaActual > 1) {
    btnAnterior.addEventListener('click', () => onCambiarPagina(paginaActual - 1));
  }

  if (btnSiguiente && paginaActual < maxPaginas) {
    btnSiguiente.addEventListener('click', () => onCambiarPagina(paginaActual + 1));
  }
}

/**
 * RENDERIZADOR DEL SIDEBAR DE FILTROS AVANZADOS TMDB
 */
function renderSidebarFiltros(contenedor, esPelicula = true, generos = [], onAplicarFiltros, onLimpiarFiltros) {
  if (!contenedor) return;

  const generosHTML = generos.map(g => `
    <span class="chip-genero" data-id="${g.id}">${g.name}</span>
  `).join('');

  contenedor.innerHTML = `
    <div class="sidebar-header">
      <h3 class="sidebar-titulo">🎛️ Filtros Avanzados</h3>
    </div>

    <!-- ORDENAR POR -->
    <div class="filtro-bloque">
      <label class="filtro-label" for="filtro-orden">Ordenar resultados por</label>
      <select id="filtro-orden" class="filtro-select">
        <option value="popularity.desc">Popularidad (Mayor a menor)</option>
        <option value="popularity.asc">Popularidad (Menor a mayor)</option>
        <option value="vote_average.desc">Calificación (Mayor a menor)</option>
        <option value="vote_average.asc">Calificación (Menor a mayor)</option>
        <option value="${esPelicula ? 'primary_release_date.desc' : 'first_air_date.desc'}">Fecha de estreno (Reciente)</option>
        <option value="${esPelicula ? 'primary_release_date.asc' : 'first_air_date.asc'}">Fecha de estreno (Antigua)</option>
      </select>
    </div>

    <!-- GÉNEROS -->
    <div class="filtro-bloque">
      <span class="filtro-label">Géneros</span>
      <div class="generos-container" id="contenedor-chips-generos">
        ${generosHTML || '<span style="color:var(--text-muted);font-size:0.8rem;">Cargando géneros...</span>'}
      </div>
    </div>

    <!-- RANGO DE FECHAS -->
    <div class="filtro-bloque">
      <span class="filtro-label">Fechas de Estreno</span>
      <div style="display:flex; flex-direction:column; gap:0.5rem;">
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Desde:</span>
          <input type="date" id="filtro-fecha-desde" class="filtro-input-date">
        </div>
        <div>
          <span style="font-size:0.75rem; color:var(--text-muted);">Hasta:</span>
          <input type="date" id="filtro-fecha-hasta" class="filtro-input-date">
        </div>
      </div>
    </div>

    <!-- IDIOMA ORIGINAL -->
    <div class="filtro-bloque">
      <label class="filtro-label" for="filtro-idioma">Idioma Original</label>
      <select id="filtro-idioma" class="filtro-select">
        <option value="">Todos los idiomas</option>
        <option value="es">Español</option>
        <option value="en">Inglés</option>
        <option value="fr">Francés</option>
        <option value="ja">Japonés</option>
        <option value="ko">Coreano</option>
        <option value="de">Alemán</option>
        <option value="it">Italiano</option>
      </select>
    </div>

    <!-- CALIFICACIÓN MÍNIMA SLIDER -->
    <div class="filtro-bloque range-container">
      <div class="range-header">
        <span class="filtro-label">Calificación Mínima</span>
        <span id="valor-calificacion-slider" style="color:var(--neon-cyan); font-weight:800;">0 ⭐</span>
      </div>
      <input type="range" id="filtro-calificacion-range" class="filtro-range" min="0" max="10" step="0.5" value="0">
    </div>

    <!-- BOTONERA -->
    <div class="filtro-acciones">
      <button type="button" id="btn-aplicar-filtros-side" class="btn-aplicar-filtros">🔍 Aplicar Filtros</button>
      <button type="button" id="btn-limpiar-filtros-side" class="btn-limpiar-filtros">🧹 Limpiar Filtros</button>
    </div>
  `;

  // Interactividad de Chips de Género
  const chipsGeneros = contenedor.querySelectorAll('.chip-genero');
  chipsGeneros.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('activo');
    });
  });

  // Slider feedback
  const sliderRange = contenedor.querySelector('#filtro-calificacion-range');
  const valorSlider = contenedor.querySelector('#valor-calificacion-slider');
  sliderRange.addEventListener('input', (e) => {
    valorSlider.textContent = `${e.target.value} ⭐`;
  });

  // Botón Aplicar
  contenedor.querySelector('#btn-aplicar-filtros-side').addEventListener('click', () => {
    const generosSeleccionados = Array.from(contenedor.querySelectorAll('.chip-genero.activo'))
      .map(c => c.dataset.id);

    const filtros = {
      sort_by: contenedor.querySelector('#filtro-orden').value,
      with_genres: generosSeleccionados.join(','),
      fechaDesde: contenedor.querySelector('#filtro-fecha-desde').value,
      fechaHasta: contenedor.querySelector('#filtro-fecha-hasta').value,
      with_original_language: contenedor.querySelector('#filtro-idioma').value,
      'vote_average.gte': sliderRange.value > 0 ? sliderRange.value : null
    };

    onAplicarFiltros(filtros);
  });

  // Botón Limpiar
  contenedor.querySelector('#btn-limpiar-filtros-side').addEventListener('click', () => {
    chipsGeneros.forEach(c => c.classList.remove('activo'));
    contenedor.querySelector('#filtro-orden').value = 'popularity.desc';
    contenedor.querySelector('#filtro-fecha-desde').value = '';
    contenedor.querySelector('#filtro-fecha-hasta').value = '';
    contenedor.querySelector('#filtro-idioma').value = '';
    sliderRange.value = 0;
    valorSlider.textContent = '0 ⭐';

    onLimpiarFiltros();
  });
}
