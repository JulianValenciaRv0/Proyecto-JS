/**
 * LÓGICA DE DETALLES DE GALARDONES (Simulación)
 * 
 * Dado que TMDB no provee un endpoint público de Awards,
 * simularemos los ganadores mediante peticiones a /discover
 * utilizando ordenamientos de popularidad y alta calificación.
 */

const awardHeader = document.getElementById('award-header-container');
const titleEl = document.getElementById('award-title');
const descEl = document.getElementById('award-desc');
const categoriesContainer = document.getElementById('award-categories-container');

// Datos de configuración para los premios simulados
const AWARD_INFO = {
  'oscars': {
    title: 'Academy Awards (Premios Óscar)',
    desc: 'Los máximos honores de la Academia para las películas más aclamadas de los últimos años.',
    categories: [
      { name: 'Mejor Película', endpoint: '/discover/movie', params: { sort_by: 'vote_average.desc', 'vote_average.gte': '8.2', 'vote_count.gte': '3000' } },
      { name: 'Mejor Película Animada', endpoint: '/discover/movie', params: { with_genres: '16', sort_by: 'vote_average.desc', 'vote_average.gte': '8.0', 'vote_count.gte': '1500' } }
    ]
  },
  'golden_globes': {
    title: 'Golden Globe Awards',
    desc: 'La Asociación de la Prensa Extranjera premia lo mejor del cine y la televisión.',
    categories: [
      { name: 'Mejor Película (Drama)', endpoint: '/discover/movie', params: { with_genres: '18', sort_by: 'popularity.desc', 'vote_average.gte': '7.5', primary_release_year: 2024 } },
      { name: 'Mejor Serie de Televisión', endpoint: '/discover/tv', params: { sort_by: 'popularity.desc', 'vote_average.gte': '8.0', first_air_date_year: 2024 } }
    ]
  },
  'emmys': {
    title: 'Emmy Awards',
    desc: 'Reconociendo la excelencia indiscutible en la industria de la televisión y el streaming.',
    categories: [
      { name: 'Mejor Serie Dramática', endpoint: '/discover/tv', params: { with_genres: '18', sort_by: 'vote_average.desc', 'vote_count.gte': '1000' } },
      { name: 'Mejor Serie de Comedia', endpoint: '/discover/tv', params: { with_genres: '35', sort_by: 'popularity.desc', 'vote_average.gte': '7.5' } }
    ]
  },
  'bafta': {
    title: 'BAFTA Film Awards',
    desc: 'La excelencia del cine británico e internacional premiada por la Academia Británica.',
    categories: [
      { name: 'Mejor Película Británica e Internacional', endpoint: '/discover/movie', params: { sort_by: 'vote_average.desc', 'vote_average.gte': '8.0', 'vote_count.gte': '2000' } }
    ]
  }
};

async function cargarAwardDetalles() {
  const params = new URLSearchParams(window.location.search);
  const awardId = params.get('id');

  const awardData = AWARD_INFO[awardId];

  if (!awardData) {
    awardHeader.style.display = 'none';
    categoriesContainer.innerHTML = '<div class="mensaje-vacio"><h3>No se encontró el galardón solicitado.</h3><a href="awards.html" style="color:var(--neon-cyan); margin-top: 10px; display:inline-block;">Volver a Premios</a></div>';
    return;
  }

  // Setear cabecera
  titleEl.textContent = awardData.title;
  descEl.textContent = awardData.desc;

  categoriesContainer.innerHTML = '';

  // Procesar cada categoría
  for (const cat of awardData.categories) {
    const isMovie = cat.endpoint === '/discover/movie';
    const res = await obtenerDatosAPI(cat.endpoint, { ...cat.params, page: 1 });
    
    if (res && res.results && res.results.length > 0) {
      // Tomamos los 5 mejores para simular Nominados y Ganador
      const items = res.results.slice(0, 5);
      
      const categoryHtml = document.createElement('section');
      categoryHtml.className = 'category-section';
      categoryHtml.innerHTML = `
        <h2 class="category-title">${cat.name}</h2>
        <div class="grid-contenido">
          ${items.map((item, index) => {
            // El primero lo tratamos como 'Ganador'
            const isWinner = index === 0;
            return crearTarjetaPremio(item, isMovie, isWinner);
          }).join('')}
        </div>
      `;
      categoriesContainer.appendChild(categoryHtml);
    }
  }
}

// Tarjeta especializada para Awards (destaca el ganador)
function crearTarjetaPremio(item, isMovie, isWinner) {
  const tipoUrl = isMovie ? 'movie' : 'tv';
  const posterUrl = item.poster_path ? `${URL_IMAGEN}${item.poster_path}` : URL_PLACEHOLDER;
  const titulo = isMovie ? (item.title || item.original_title) : (item.name || item.original_name);
  const fechaStr = isMovie ? item.release_date : item.first_air_date;
  const calificacion = item.vote_average ? Math.round(item.vote_average * 10) : 0;
  
  // Estilo especial para ganador
  const borderStyle = isWinner ? 'border: 2px solid var(--neon-gold); box-shadow: 0 0 20px rgba(245, 158, 11, 0.4);' : '';
  const winnerBadge = isWinner ? `<div class="badge-award">🏆 GANADOR</div>` : `<div class="badge-award" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); box-shadow:none;">Nominado</div>`;

  return `
    <a href="detalles.html?id=${item.id}&type=${tipoUrl}" class="tarjeta-media" style="${borderStyle}">
      ${winnerBadge}
      <div class="poster-wrapper">
        <img src="${posterUrl}" alt="${titulo}" class="poster-img" loading="lazy">
        <div class="badge-puntuacion ${calificacion >= 70 ? 'alta' : calificacion >= 50 ? 'media' : 'baja'}">
          ${calificacion}<span style="font-size:0.6rem;">%</span>
        </div>
      </div>
      <div class="tarjeta-info">
        <h3 class="tarjeta-titulo">${titulo}</h3>
        <span class="tarjeta-fecha">${formatearFecha(fechaStr)}</span>
      </div>
    </a>
  `;
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  cargarAwardDetalles();
});
