/**
 * UTILIDADES DE RENDERIZADO PARA EL DOM
 * 
 * Funciones reutilizables encargadas de generar el HTML dinámico
 * para las tarjetas de películas, series, personas y la paginación.
 */

// Formatea la fecha de AAAA-MM-DD a un texto más amigable (ej: "15 de mayo de 2024")
function formatearFecha(fechaStr) {
  if (!fechaStr) return "Fecha no disponible";
  const opciones = { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    return new Date(fechaStr).toLocaleDateString('es-ES', opciones);
  } catch (e) {
    return fechaStr;
  }
}

// Devuelve la clase CSS adecuada según la calificación (Verde >= 7, Amarillo >= 5, Rojo < 5)
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

  // Insignia de galardón si la vista es Awards
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

// Renderiza una tarjeta de Persona (Actor/Directores)
function crearTarjetaPersona(persona, isRoot = false) {
  const placeholder = isRoot ? URL_PLACEHOLDER_LOCAL : URL_PLACEHOLDER;
  const fotoUrl = persona.profile_path ? `${URL_IMAGEN}${persona.profile_path}` : placeholder;
  
  // Trabajos conocidos
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

// Renderiza la barra de navegación de paginación
function renderPaginacion(contenedor, paginaActual, totalPaginas, onCambiarPagina) {
  if (!contenedor) return;

  // Limitamos totalPaginas a un máximo de 500 por límites de TMDB API
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

  // Event Listeners para los botones de la paginación
  const btnAnterior = contenedor.querySelector('#btn-anterior');
  const btnSiguiente = contenedor.querySelector('#btn-siguiente');

  if (btnAnterior && paginaActual > 1) {
    btnAnterior.addEventListener('click', () => onCambiarPagina(paginaActual - 1));
  }

  if (btnSiguiente && paginaActual < maxPaginas) {
    btnSiguiente.addEventListener('click', () => onCambiarPagina(paginaActual + 1));
  }
}
