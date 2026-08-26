/**
 * LÓGICA DE DETALLES COMPLETOS
 * 
 * Obtiene la información detallada de una película, serie o persona utilizando
 * los parámetros en la URL (id y type), incluyendo reparto, equipo, recomendaciones, etc.
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

  // 1. Obtener datos principales y extra (credits, keywords, recommendations, videos, images, reviews)
  const appendParams = type === 'person' 
    ? 'combined_credits' 
    : 'credits,keywords,recommendations,videos,images,reviews';

  const data = await obtenerDatosAPI(`/${type}/${id}`, { append_to_response: appendParams });

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

function formatearMoneda(valor) {
  if (!valor) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(valor);
}

function renderDetallesMedia(data, type) {
  const titulo = data.title || data.name;
  const fecha = data.release_date || data.first_air_date;
  const posterUrl = data.poster_path ? `${URL_IMAGEN}${data.poster_path}` : URL_PLACEHOLDER;
  const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '';
  const generos = data.genres ? data.genres.map(g => g.name).join(', ') : 'No especificado';
  const calificacion = data.vote_average ? Math.round(data.vote_average * 10) : 0;
  
  const duracion = type === 'movie' && data.runtime 
    ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` 
    : type === 'tv' && data.episode_run_time?.length 
      ? `${data.episode_run_time[0]}m` : '';

  const equipoPrincipal = data.credits?.crew 
    ? data.credits.crew.filter(c => ['Director', 'Screenplay', 'Creator', 'Writer', 'Novel'].includes(c.job)).slice(0, 4)
    : [];

  const equipoHTML = equipoPrincipal.map(c => `
    <div style="flex: 1 1 45%; margin-bottom: 1rem;">
      <p style="font-weight: bold; margin:0;">${c.name}</p>
      <p style="font-size: 0.9rem; color: #ddd; margin:0;">${c.job}</p>
    </div>
  `).join('');

  // Reparto (Cast)
  const cast = data.credits?.cast ? data.credits.cast.slice(0, 10) : [];
  const castHTML = cast.map(actor => {
    const actorFoto = actor.profile_path ? `${URL_IMAGEN}${actor.profile_path}` : URL_PLACEHOLDER;
    return `
      <div style="min-width: 140px; max-width: 140px; background: var(--bg-card); border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.3); flex-shrink: 0;">
        <a href="detalles.html?id=${actor.id}&type=person" style="text-decoration:none; color:inherit;">
          <img src="${actorFoto}" alt="${actor.name}" style="width:100%; height:175px; object-fit:cover;" onerror="this.src='${URL_PLACEHOLDER}'">
          <div style="padding: 10px;">
            <p style="font-weight: bold; font-size: 0.95rem; margin: 0 0 5px 0;">${actor.name}</p>
            <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">${actor.character}</p>
          </div>
        </a>
      </div>
    `;
  }).join('');

  // Recomendaciones
  const recs = data.recommendations?.results ? data.recommendations.results.slice(0, 8) : [];
  const recsHTML = recs.map(r => {
    const recFondo = r.backdrop_path ? `${URL_IMAGEN}${r.backdrop_path}` : URL_PLACEHOLDER;
    const rTitle = r.title || r.name;
    const rDate = r.release_date || r.first_air_date;
    const rCalificacion = Math.round(r.vote_average * 10);
    return `
      <div style="min-width: 250px; flex-shrink: 0;">
        <a href="detalles.html?id=${r.id}&type=${type}" style="text-decoration:none; color:inherit;">
          <img src="${recFondo}" alt="${rTitle}" style="width:100%; border-radius: 8px; margin-bottom: 5px; height: 140px; object-fit:cover;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <p style="margin:0; font-size: 0.95rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${rTitle}">${rTitle}</p>
            <span style="font-size: 0.85rem; color:var(--text-muted); margin-left: 10px;">${rCalificacion}%</span>
          </div>
        </a>
      </div>
    `;
  }).join('');

  // Keywords
  const keyList = type === 'movie' ? data.keywords?.keywords : data.keywords?.results;
  const keywordsHTML = keyList ? keyList.map(k => `
    <span style="background: rgba(255,255,255,0.1); padding: 5px 10px; border-radius: 4px; font-size: 0.85rem; margin: 0 5px 5px 0; display: inline-block;">${k.name}</span>
  `).join('') : 'No hay palabras clave';

  const estado = data.status || '-';
  const idiomaOrig = data.original_language ? data.original_language.toUpperCase() : '-';
  
  let sidebarFinanciero = '';
  if (type === 'movie') {
    sidebarFinanciero = `
      <p style="margin: 0 0 5px 0; font-weight:bold;">Presupuesto</p>
      <p style="margin: 0 0 15px 0; font-size:0.95rem;">${formatearMoneda(data.budget)}</p>
      <p style="margin: 0 0 5px 0; font-weight:bold;">Ingresos</p>
      <p style="margin: 0 0 15px 0; font-size:0.95rem;">${formatearMoneda(data.revenue)}</p>
    `;
  } else {
    sidebarFinanciero = `
      <p style="margin: 0 0 5px 0; font-weight:bold;">Tipo</p>
      <p style="margin: 0 0 15px 0; font-size:0.95rem;">${data.type || '-'}</p>
      <p style="margin: 0 0 5px 0; font-weight:bold;">Canal Original</p>
      <p style="margin: 0 0 15px 0; font-size:0.95rem;">${data.networks ? data.networks.map(n => n.name).join(', ') : '-'}</p>
    `;
  }

  // Trailers
  const trailers = data.videos?.results ? data.videos.results.filter(v => v.site === 'YouTube').slice(0, 5) : [];
  const trailersHTML = trailers.map(v => `
    <div style="min-width: 320px; max-width: 400px; flex-shrink: 0;">
      <div class="video-container">
        <iframe src="https://www.youtube.com/embed/${v.key}" title="${v.name}" allowfullscreen></iframe>
      </div>
      <p style="margin-top: 8px; font-weight: 600; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${v.name}">${v.name}</p>
    </div>
  `).join('');

  // Media (Backdrops)
  const backdrops = data.images?.backdrops ? data.images.backdrops.slice(0, 8) : [];
  const mediaHTML = backdrops.map(img => `
    <div class="media-image-card" style="width: 300px; height: 169px;">
      <img src="https://image.tmdb.org/t/p/w500${img.file_path}" alt="Media Backdrop" loading="lazy">
    </div>
  `).join('');

  // Social (Reviews)
  const reviews = data.reviews?.results ? data.reviews.results.slice(0, 4) : [];
  const reviewsHTML = reviews.map(r => {
    let avatarUrl = '';
    if (r.author_details?.avatar_path) {
      if (r.author_details.avatar_path.startsWith('/')) {
        avatarUrl = `${URL_IMAGEN}${r.author_details.avatar_path}`;
      } else {
        avatarUrl = r.author_details.avatar_path.substring(1); // Quitar slash si viene codificado de gravatar
        if (!avatarUrl.startsWith('http')) avatarUrl = ''; // fallback
      }
    }
      
    const avatarContent = avatarUrl 
      ? `<img src="${avatarUrl}" alt="${r.author}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" onerror="this.style.display='none'">`
      : `${r.author.charAt(0).toUpperCase()}`;
      
    const ratingHtml = r.author_details?.rating 
      ? `<div class="review-rating-badge">⭐ ${r.author_details.rating}.0</div>` 
      : '';

    return `
      <div class="review-card">
        <div class="review-header">
          <div class="review-author-avatar">
            ${avatarContent}
          </div>
          <div class="review-author-info">
            <h4>Una reseña de ${r.author}</h4>
            <p>Escrita por ${r.author} el ${formatearFecha(r.created_at)}</p>
          </div>
          ${ratingHtml}
        </div>
        <div class="review-content">
          ${r.content.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
  }).join('');
  
  contenedorDetalles.innerHTML = `
    <!-- HEADER TMDB STYLE -->
    <div style="background-image: linear-gradient(to right, rgba(15,23,36, 1) 150px, rgba(15,23,36, 0.84) 100%), url('${backdropUrl}'); background-size: cover; background-position: right center; color: white;">
      <div style="display:flex; flex-wrap:wrap; gap: 2rem; padding: 2rem; max-width: 1400px; margin: 0 auto; align-items:center;">
        
        <div style="flex-shrink: 0; margin:0 auto;">
          <img src="${posterUrl}" alt="${titulo}" style="width: 300px; border-radius: 8px; box-shadow: 0 0 20px rgba(0,0,0,0.8);">
        </div>
        
        <div style="flex: 1; min-width: 300px;">
          <h1 style="font-size: 2.5rem; margin-bottom: 0;">${titulo} <span style="font-weight:400; opacity:0.8;">(${new Date(fecha).getFullYear() || ''})</span></h1>
          <p style="font-size: 1rem; margin-top: 5px; opacity:0.9; margin-bottom: 1.5rem;">
            ${formatearFecha(fecha)} &bull; ${generos} ${duracion ? `&bull; ${duracion}` : ''}
          </p>

          <div style="display:flex; align-items:center; gap: 1.5rem; margin-bottom: 1.5rem; flex-wrap: wrap;">
            <div style="display:flex; align-items:center; gap: 1rem;">
              <div style="background:var(--bg-card); width: 60px; height: 60px; border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size: 1.3rem; border: 4px solid var(--neon-cyan);">
                ${calificacion}<span style="font-size:0.6rem;">%</span>
              </div>
              <span style="font-weight:bold;">Puntuación de<br>usuario</span>
            </div>
            
            ${trailers.length > 0 ? `
              <button onclick="abrirTrailerModal('${trailers[0].key}')" class="btn-ver-trailer">
                ▶ Reproducir Tráiler
              </button>
            ` : ''}
          </div>

          <p style="font-style: italic; opacity:0.8; font-size: 1.1rem; margin-bottom:10px;">${data.tagline || ''}</p>
          
          <h3 style="margin-bottom: 10px;">Vista general</h3>
          <p style="line-height: 1.5; font-size: 1.05rem; margin-bottom: 20px; max-width: 800px;">${data.overview || 'Sin descripción disponible.'}</p>

          <div style="display:flex; flex-wrap:wrap; max-width: 600px;">
            ${equipoHTML}
          </div>
        </div>
      </div>
    </div>

    <!-- MAIN CONTENT + SIDEBAR -->
    <div style="display:flex; flex-wrap:wrap; gap: 2rem; max-width: 1400px; margin: 2rem auto; padding: 0 2rem;">
      <!-- COLUMNA PRINCIPAL -->
      <div style="flex: 3; min-width: 0;">
        
        <!-- Reparto principal -->
        <h2 style="margin-bottom: 1rem;">Reparto principal</h2>
        <div style="display:flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;" class="horizontal-scroller-simple">
          ${castHTML || '<p>Reparto no disponible.</p>'}
        </div>

        <!-- Media (Trailers) -->
        ${trailers.length > 0 ? `
          <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 2rem 0;">
          <h2 style="margin-bottom: 1rem;">Trailers y Videos</h2>
          <div style="display:flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;" class="horizontal-scroller-simple">
            ${trailersHTML}
          </div>
        ` : ''}
        
        <!-- Media (Imágenes) -->
        ${backdrops.length > 0 ? `
          <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 2rem 0;">
          <h2 style="margin-bottom: 1rem;">Imágenes (Media)</h2>
          <div style="display:flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;" class="horizontal-scroller-simple">
            ${mediaHTML}
          </div>
        ` : ''}

        <!-- Social (Reseñas) -->
        ${reviews.length > 0 ? `
          <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 2rem 0;">
          <h2 style="margin-bottom: 1rem;">Social - Reseñas</h2>
          <div style="margin-bottom: 2rem;">
            ${reviewsHTML}
            ${data.reviews?.total_results > 4 ? `<p style="font-weight: 600; cursor: pointer; color: var(--neon-cyan);">Ver las ${data.reviews.total_results} reseñas</p>` : ''}
          </div>
        ` : ''}

        <!-- Recomendaciones -->
        <hr style="border: 0; border-top: 1px solid var(--border-glass); margin: 2rem 0;">
        <h2 style="margin-bottom: 1rem;">Recomendaciones</h2>
        <div style="display:flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; margin-bottom: 2rem;" class="horizontal-scroller-simple">
          ${recsHTML || '<p>No tenemos suficientes datos para sugerir recomendaciones.</p>'}
        </div>
      </div>

      <!-- SIDEBAR -->
      <div style="flex: 1; min-width: 250px;">
        <div style="margin-bottom: 2rem;">
          <p style="margin: 0 0 5px 0; font-weight:bold;">Estado</p>
          <p style="margin: 0 0 15px 0; font-size:0.95rem;">${estado}</p>

          <p style="margin: 0 0 5px 0; font-weight:bold;">Idioma original</p>
          <p style="margin: 0 0 15px 0; font-size:0.95rem;">${idiomaOrig}</p>

          ${sidebarFinanciero}
        </div>

        <div>
          <h4 style="margin-bottom: 10px;">Palabras clave</h4>
          <div style="display:flex; flex-wrap:wrap;">
            ${keywordsHTML}
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL TRAILER -->
    <div id="trailer-modal" class="trailer-modal-overlay" onclick="cerrarTrailerModal(event)">
      <div class="trailer-modal-content">
        <button class="btn-cerrar-modal" onclick="cerrarTrailerModal()">✕</button>
        <div class="video-container" id="trailer-modal-video">
          <!-- El iframe se inyecta dinámicamente -->
        </div>
      </div>
    </div>
  `;
}

// Funciones para el Modal del Trailer
window.abrirTrailerModal = function(videoKey) {
  const modal = document.getElementById('trailer-modal');
  const videoContainer = document.getElementById('trailer-modal-video');
  
  if (modal && videoContainer) {
    videoContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoKey}?autoplay=1" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    modal.classList.add('activo');
    document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
  }
};

window.cerrarTrailerModal = function(event) {
  if (event && event.target !== document.getElementById('trailer-modal') && event.type === 'click') {
    // Si el clic fue dentro del modal pero no en el overlay, no hacer nada (a menos que sea el botón cerrar)
    if (!event.target.classList.contains('btn-cerrar-modal') && !event.target.classList.contains('trailer-modal-overlay')) {
       return;
    }
  }

  const modal = document.getElementById('trailer-modal');
  const videoContainer = document.getElementById('trailer-modal-video');
  
  if (modal && videoContainer) {
    modal.classList.remove('activo');
    videoContainer.innerHTML = ''; // Detener video
    document.body.style.overflow = ''; // Restaurar scroll
  }
};

function renderDetallesPersona(data) {
  const fotoUrl = data.profile_path ? `${URL_IMAGEN}${data.profile_path}` : URL_PLACEHOLDER;
  const biografia = data.biography || 'Biografía no disponible.';
  const genero = data.gender === 1 ? 'Femenino' : data.gender === 2 ? 'Masculino' : 'No especificado';
  
  // Extraer Known For del combined_credits
  let roles = data.combined_credits?.cast || [];
  // Ordenar por popularidad
  roles.sort((a, b) => b.popularity - a.popularity);
  const knownFor = roles.slice(0, 10);
  
  const knownForHTML = knownFor.map(r => {
    const poster = r.poster_path ? `${URL_IMAGEN}${r.poster_path}` : URL_PLACEHOLDER;
    const rTitle = r.title || r.name;
    const typeLink = r.media_type || 'movie';
    return `
      <div style="min-width: 140px; max-width: 140px; border-radius: 8px; overflow: hidden; flex-shrink: 0;">
        <a href="detalles.html?id=${r.id}&type=${typeLink}" style="text-decoration:none; color:inherit;">
          <img src="${poster}" alt="${rTitle}" style="width:100%; border-radius:8px; margin-bottom: 5px; height:210px; object-fit:cover;" onerror="this.src='${URL_PLACEHOLDER}'">
          <p style="font-size: 0.85rem; margin:0; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${rTitle}">${rTitle}</p>
        </a>
      </div>
    `;
  }).join('');

  contenedorDetalles.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; gap: 2rem; max-width: 1400px; margin: 2rem auto; padding: 0 2rem;">
      
      <!-- COLUMNA IZQUIERDA (Info Personal) -->
      <div style="flex: 1; min-width: 300px; max-width: 350px;">
        <img src="${fotoUrl}" alt="${data.name}" style="width: 100%; border-radius: 12px; margin-bottom: 2rem;">
        
        <h3 style="margin-bottom: 1rem;">Información personal</h3>
        
        <p style="margin: 0 0 5px 0; font-weight:bold;">Conocido por</p>
        <p style="margin: 0 0 15px 0; font-size:0.95rem;">${data.known_for_department || '-'}</p>

        <p style="margin: 0 0 5px 0; font-weight:bold;">Género</p>
        <p style="margin: 0 0 15px 0; font-size:0.95rem;">${genero}</p>

        <p style="margin: 0 0 5px 0; font-weight:bold;">Fecha de nacimiento</p>
        <p style="margin: 0 0 15px 0; font-size:0.95rem;">${formatearFecha(data.birthday)}</p>

        <p style="margin: 0 0 5px 0; font-weight:bold;">Lugar de nacimiento</p>
        <p style="margin: 0 0 15px 0; font-size:0.95rem;">${data.place_of_birth || '-'}</p>
        
        ${data.deathday ? `
          <p style="margin: 0 0 5px 0; font-weight:bold;">Fecha de fallecimiento</p>
          <p style="margin: 0 0 15px 0; font-size:0.95rem;">${formatearFecha(data.deathday)}</p>
        ` : ''}
      </div>

      <!-- COLUMNA DERECHA (Biografía y Known For) -->
      <div style="flex: 2; min-width: 0;">
        <h1 style="font-size: 2.5rem; margin-bottom: 1.5rem; margin-top:0;">${data.name}</h1>
        
        <h3 style="margin-bottom: 1rem;">Biografía</h3>
        <p style="line-height: 1.6; font-size: 1.05rem; white-space: pre-line; margin-bottom: 2.5rem;">${biografia}</p>
        
        <h3 style="margin-bottom: 1rem;">Conocido por</h3>
        <div style="display:flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem;" class="horizontal-scroller-simple">
          ${knownForHTML || '<p>No hay información de participaciones.</p>'}
        </div>
      </div>
    </div>
  `;
}

// Estilos dinámicos para los scrollers simples
const scrollerStyle = document.createElement('style');
scrollerStyle.innerHTML = `
  .horizontal-scroller-simple::-webkit-scrollbar {
    height: 8px;
  }
  .horizontal-scroller-simple::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.2);
    border-radius: 4px;
  }
  .horizontal-scroller-simple::-webkit-scrollbar-thumb {
    background: var(--neon-cyan, #0dcaf0);
    border-radius: 4px;
  }
`;
document.head.appendChild(scrollerStyle);

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Limpiamos los estilos que pudimos haber agregado a .detalles-main en versiones anteriores
  document.querySelector('.detalles-main').style.padding = '0';
  cargarDetalles();
});
