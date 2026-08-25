/**
 * LÓGICA DE DETALLES
 * 
 * Obtiene la información detallada de una película, serie o persona utilizando
 * los parámetros en la URL (id y type).
 */

const contenedorDetalles = document.getElementById('contenedor-detalles');

async function cargarDetalles() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const type = params.get('type');

  if (!id || !type) {
    contenedorDetalles.innerHTML = '<div class="mensaje-vacio"><h3>No se especificó un elemento a mostrar.</h3></div>';
    return;
  }

  // 1. Obtener datos principales
  const data = await obtenerDatosAPI(`/${type}/${id}`);

  if (!data) {
    contenedorDetalles.innerHTML = '<div class="mensaje-vacio"><h3>Error al cargar los detalles.</h3></div>';
    return;
  }

  // 2. Renderizar dependiendo del tipo
  if (type === 'movie' || type === 'tv') {
    renderDetallesMedia(data, type);
  } else if (type === 'person') {
    renderDetallesPersona(data);
  }
}

function renderDetallesMedia(data, type) {
  const titulo = data.title || data.name;
  const fecha = data.release_date || data.first_air_date;
  const posterUrl = data.poster_path ? `${URL_IMAGEN}${data.poster_path}` : URL_PLACEHOLDER;
  const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '';
  const generos = data.genres ? data.genres.map(g => g.name).join(', ') : 'No especificado';
  const calificacion = data.vote_average ? data.vote_average.toFixed(1) : '0.0';

  // Opcional: mostrar un fondo con el backdrop si existe, o un color sólido.
  // Aquí usamos un layout simple en HTML.
  
  contenedorDetalles.innerHTML = `
    <div class="detalles-layout" style="display: flex; gap: 2rem; flex-wrap: wrap;">
      <div class="detalles-poster" style="flex: 1; min-width: 300px; max-width: 400px;">
        <img src="${posterUrl}" alt="${titulo}" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
      </div>
      <div class="detalles-info" style="flex: 2; min-width: 300px;">
        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--neon-cyan);">${titulo}</h1>
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1rem;">Estreno: ${formatearFecha(fecha)} &bull; ${generos}</p>
        
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
          <div class="badge-puntuacion ${obtenerClaseCalificacion(data.vote_average)}" style="position: static; font-size: 1.2rem; padding: 0.5rem 1rem;">
            ⭐ ${calificacion}
          </div>
          <span style="font-style: italic; color: #aaa;">${data.tagline || ''}</span>
        </div>

        <h3 style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Resumen</h3>
        <p style="line-height: 1.6; font-size: 1.1rem;">${data.overview || 'Sin descripción disponible.'}</p>
        
        ${type === 'movie' ? `<p style="margin-top: 1rem;"><strong>Duración:</strong> ${data.runtime} min</p>` : ''}
        ${type === 'tv' ? `<p style="margin-top: 1rem;"><strong>Temporadas:</strong> ${data.number_of_seasons} | <strong>Episodios:</strong> ${data.number_of_episodes}</p>` : ''}
      </div>
    </div>
  `;

  // Si hay backdrop, lo ponemos de fondo general opcionalmente
  if (backdropUrl) {
    document.querySelector('.detalles-main').style.backgroundImage = `linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0.7)), url(${backdropUrl})`;
    document.querySelector('.detalles-main').style.backgroundSize = 'cover';
    document.querySelector('.detalles-main').style.backgroundPosition = 'center';
  }
}

function renderDetallesPersona(data) {
  const fotoUrl = data.profile_path ? `${URL_IMAGEN}${data.profile_path}` : URL_PLACEHOLDER;
  const biografia = data.biography || 'Biografía no disponible.';
  
  contenedorDetalles.innerHTML = `
    <div class="detalles-layout" style="display: flex; gap: 2rem; flex-wrap: wrap;">
      <div class="detalles-poster" style="flex: 1; min-width: 300px; max-width: 400px;">
        <img src="${fotoUrl}" alt="${data.name}" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
      </div>
      <div class="detalles-info" style="flex: 2; min-width: 300px;">
        <h1 style="font-size: 2.5rem; margin-bottom: 0.5rem; color: var(--neon-cyan);">${data.name}</h1>
        <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1rem;"><strong>Nacimiento:</strong> ${formatearFecha(data.birthday)} ${data.place_of_birth ? `en ${data.place_of_birth}` : ''}</p>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;"><strong>Conocido por:</strong> ${data.known_for_department}</p>

        <h3 style="margin-bottom: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">Biografía</h3>
        <p style="line-height: 1.6; font-size: 1.1rem; white-space: pre-line;">${biografia}</p>
      </div>
    </div>
  `;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  cargarDetalles();
});
