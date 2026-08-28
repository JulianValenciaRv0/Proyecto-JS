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

  // 1. Obtener datos principales y extra (credits, keywords, recommendations, videos, images)
  const appendParams = type === 'person' 
    ? 'combined_credits' 
    : 'credits,keywords,recommendations,videos,images';

  const data = await obtenerDatosAPI(`/${type}/${id}`, { append_to_response: appendParams });

  // 1.5 Obtener reseñas (Reviews) sin filtro de idioma para garantizar que haya datos en Social
  if (data && type !== 'person') {
    const reviewsData = await obtenerDatosAPI(`/${type}/${id}/reviews`, { language: '' });
    if (reviewsData) {
      data.reviews = reviewsData;
    }
  }

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
  const anio = fecha ? new Date(fecha).getFullYear() : '';
  const posterUrl = data.poster_path ? `${URL_IMAGEN}${data.poster_path}` : URL_PLACEHOLDER;
  const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '';
  const generos = data.genres?.length ? data.genres.map(g => g.name).join(', ') : 'No especificado';
  const generosHTML = data.genres?.length ? data.genres.map(g => `<span class="detail-genre">${g.name}</span>`).join('') : '<span class="detail-genre">No especificado</span>';
  const calificacion = data.vote_average ? Math.round(data.vote_average * 10) : 0;
  const duracion = type === 'movie' && data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : type === 'tv' && data.episode_run_time?.length ? `${data.episode_run_time[0]}m` : '';
  const equipo = data.credits?.crew?.filter(c => ['Director', 'Screenplay', 'Creator', 'Writer', 'Novel'].includes(c.job)).slice(0, 4) || [];
  const equipoHTML = equipo.map(c => `<div class="detail-credit"><p>${c.name}</p><span>${c.job}</span></div>`).join('');
  const trailers = data.videos?.results?.filter(v => v.site === 'YouTube').slice(0, 5) || [];
  const backdrops = data.images?.backdrops?.slice(0, 8) || [];
  const reviews = data.reviews?.results?.slice(0, 4) || [];
  const estado = data.status || '-';
  const idiomaOrig = data.original_language?.toUpperCase() || '-';

  const castHTML = (data.credits?.cast || []).slice(0, 10).map(actor => {
    const foto = actor.profile_path ? `${URL_IMAGEN}${actor.profile_path}` : URL_PLACEHOLDER;
    return `<article class="detail-cast-card"><a href="detalles.html?id=${actor.id}&type=person"><div class="detail-cast-image"><img src="${foto}" alt="${actor.name}" loading="lazy" onerror="this.src='${URL_PLACEHOLDER}'"></div><div class="detail-cast-copy"><p>${actor.name}</p><span>${actor.character || 'Reparto'}</span></div></a></article>`;
  }).join('');

  const trailersHTML = trailers.map(v => `<article class="detail-video-card"><div class="video-container"><iframe src="https://www.youtube.com/embed/${v.key}" title="${v.name}" loading="lazy" allowfullscreen></iframe></div><p title="${v.name}">${v.name}</p></article>`).join('');
  const mediaHTML = backdrops.map(img => `<div class="media-image-card detail-still"><img src="https://image.tmdb.org/t/p/w500${img.file_path}" alt="Fotograma de ${titulo}" loading="lazy"></div>`).join('');

  const reviewsHTML = reviews.map(r => {
    let avatarUrl = '';
    if (r.author_details?.avatar_path) avatarUrl = r.author_details.avatar_path.startsWith('/http') ? r.author_details.avatar_path.substring(1) : `${URL_IMAGEN}${r.author_details.avatar_path}`;
    const avatar = avatarUrl ? `<img src="${avatarUrl}" alt="${r.author}" onerror="this.style.display='none'">` : r.author.charAt(0).toUpperCase();
    const rating = r.author_details?.rating ? `<div class="review-rating-badge">★ ${r.author_details.rating}/10</div>` : '';
    return `<article class="review-card"><div class="review-header"><div class="review-author-avatar">${avatar}</div><div class="review-author-info"><h4>${r.author}</h4><p>${formatearFecha(r.created_at)}</p></div>${rating}</div><div class="review-content">${r.content.replace(/\n/g, '<br>')}</div></article>`;
  }).join('');

  const recsHTML = (data.recommendations?.results || []).slice(0, 8).map(r => {
    const fondo = r.backdrop_path ? `${URL_IMAGEN}${r.backdrop_path}` : URL_PLACEHOLDER;
    const nombre = r.title || r.name;
    const recFecha = r.release_date || r.first_air_date;
    return `<article class="detail-rec-card"><a href="detalles.html?id=${r.id}&type=${type}"><div class="detail-rec-image"><img src="${fondo}" alt="${nombre}" loading="lazy"></div><div class="detail-rec-copy"><div><p title="${nombre}">${nombre}</p><span>${recFecha ? new Date(recFecha).getFullYear() : ''}</span></div><strong>${Math.round(r.vote_average * 10)}%</strong></div></a></article>`;
  }).join('');

  const keyList = type === 'movie' ? data.keywords?.keywords : data.keywords?.results;
  const keywordsHTML = keyList?.length ? keyList.map(k => `<span class="detail-keyword">${k.name}</span>`).join('') : '<span class="detail-keyword">Sin palabras clave</span>';
  const factsExtra = type === 'movie'
    ? `<div class="detail-fact"><span>Presupuesto</span><strong>${formatearMoneda(data.budget)}</strong></div><div class="detail-fact"><span>Ingresos</span><strong>${formatearMoneda(data.revenue)}</strong></div>`
    : `<div class="detail-fact"><span>Tipo</span><strong>${data.type || '-'}</strong></div><div class="detail-fact"><span>Canal original</span><strong>${data.networks?.map(n => n.name).join(', ') || '-'}</strong></div>`;

  contenedorDetalles.innerHTML = `
    <article class="movie-detail">
      <section class="detail-hero" style="--detail-backdrop: url('${backdropUrl}')">
        <div class="detail-hero-shade"></div>
        <div class="detail-hero-grid">
          <div class="detail-poster-wrap"><span class="detail-index">CINEVERSE / ${type === 'movie' ? 'PELÍCULA' : 'SERIE'}</span><img src="${posterUrl}" alt="Póster de ${titulo}" class="detail-poster" onerror="this.src='${URL_PLACEHOLDER}'"><span class="detail-poster-caption">${anio || 'CineVerse'} · ${idiomaOrig}</span></div>
          <div class="detail-hero-copy"><div class="detail-genres">${generosHTML}</div><h1>${titulo}</h1><div class="detail-meta"><span>${formatearFecha(fecha)}</span>${duracion ? `<span>${duracion}</span>` : ''}<span>${generos}</span></div>${data.tagline ? `<p class="detail-tagline">“${data.tagline}”</p>` : ''}<div class="detail-actions"><div class="detail-score" aria-label="Puntuación: ${calificacion} por ciento"><strong>${calificacion}<small>%</small></strong><span>Puntuación<br>de usuario</span></div>${trailers.length ? `<button onclick="abrirTrailerModal('${trailers[0].key}')" class="btn-ver-trailer"><span aria-hidden="true">▶</span> Ver tráiler</button>` : ''}${type === 'movie' ? `<a href="reserva.html?tmdbId=${data.id}" class="detail-booking">Reservar o comprar <span aria-hidden="true">↗</span></a>` : ''}</div></div>
        </div><span class="detail-scroll-cue">DESCUBRIR <i></i></span>
      </section>
      <section class="detail-story detail-shell"><div class="detail-story-heading"><span class="section-kicker">Dentro de la historia</span><h2>Una mirada<br><em>más cercana.</em></h2></div><div class="detail-story-copy"><span class="detail-chapter">01 / SINOPSIS</span><p>${data.overview || 'Sin descripción disponible.'}</p>${equipoHTML ? `<div class="detail-credits">${equipoHTML}</div>` : ''}</div></section>
      <section class="detail-section detail-cast-section"><div class="detail-shell"><div class="detail-section-heading"><div><span class="detail-chapter">02 / EN ESCENA</span><h2>Rostros de la historia</h2></div><p>El reparto principal que da vida a este universo.</p></div><div class="detail-cast-track horizontal-scroller-simple">${castHTML || '<p>Reparto no disponible.</p>'}</div></div></section>
      ${(trailers.length || backdrops.length) ? `<section class="detail-section detail-media-section detail-shell"><div class="detail-section-heading"><div><span class="detail-chapter">03 / ARCHIVO VISUAL</span><h2>Detrás de la pantalla</h2></div><p>Tráileres, escenas e imágenes de la producción.</p></div>${trailers.length ? `<div class="detail-media-label">Vídeos</div><div class="detail-video-track horizontal-scroller-simple">${trailersHTML}</div>` : ''}${backdrops.length ? `<div class="detail-media-label">Fotogramas</div><div class="detail-stills-track horizontal-scroller-simple">${mediaHTML}</div>` : ''}</section>` : ''}
      <section class="detail-info-band"><div class="detail-shell detail-info-grid"><div><span class="detail-chapter">04 / DATOS DE PRODUCCIÓN</span><h2>La obra<br>en contexto.</h2></div><div class="detail-facts"><div class="detail-fact"><span>Estado</span><strong>${estado}</strong></div><div class="detail-fact"><span>Idioma original</span><strong>${idiomaOrig}</strong></div>${factsExtra}</div><div class="detail-keywords"><span>Temas y palabras clave</span><div>${keywordsHTML}</div></div></div></section>
      ${reviews.length ? `<section class="detail-section detail-reviews detail-shell"><div class="detail-section-heading"><div><span class="detail-chapter">05 / COMUNIDAD</span><h2>Lo que deja la historia</h2></div><p>Lecturas y opiniones de otros espectadores.</p></div><div class="detail-reviews-grid">${reviewsHTML}</div>${data.reviews?.total_results > 4 ? `<p class="detail-more-reviews">${data.reviews.total_results} reseÃ±as publicadas</p>` : ''}</section>` : ''}
      <section class="detail-section detail-recommendations"><div class="detail-shell"><div class="detail-section-heading"><div><span class="detail-chapter">SIGUIENTE FUNCIÓN</span><h2>Continúa explorando</h2></div><p>Historias que comparten algo con esta.</p></div><div class="detail-rec-track horizontal-scroller-simple">${recsHTML || '<p>No tenemos suficientes datos para sugerir recomendaciones.</p>'}</div></div></section>
    </article>
    <div id="trailer-modal" class="trailer-modal-overlay" onclick="cerrarTrailerModal(event)"><div class="trailer-modal-content"><button class="btn-cerrar-modal" onclick="cerrarTrailerModal()">×</button><div class="video-container" id="trailer-modal-video"></div></div></div>`;
}

function renderDetallesMediaLegacy(data, type) {
  const titulo = data.title || data.name;
  const fecha = data.release_date || data.first_air_date;
  const posterUrl = data.poster_path ? `${URL_IMAGEN}${data.poster_path}` : URL_PLACEHOLDER;
  const backdropUrl = data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : '';
  const generos = data.genres?.length ? data.genres.map(g => g.name).join(', ') : 'No especificado';
  const generosHTML = data.genres?.length
    ? data.genres.map(g => `<span class="detail-genre">${g.name}</span>`).join('')
    : '<span class="detail-genre">No especificado</span>';
  const calificacion = data.vote_average ? Math.round(data.vote_average * 10) : 0;
  
  const duracion = type === 'movie' && data.runtime 
    ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` 
    : type === 'tv' && data.episode_run_time?.length 
      ? `${data.episode_run_time[0]}m` : '';

  const equipoPrincipal = data.credits?.crew 
    ? data.credits.crew.filter(c => ['Director', 'Screenplay', 'Creator', 'Writer', 'Novel'].includes(c.job)).slice(0, 4)
    : [];

  const equipoHTML = equipoPrincipal.map(c => `
    <div class="detail-credit">
      <p>${c.name}</p>
      <span>${c.job}</span>
    </div>
  `).join('');

  // Reparto (Cast)
  const cast = data.credits?.cast ? data.credits.cast.slice(0, 10) : [];
  const castHTML = cast.map(actor => {
    const actorFoto = actor.profile_path ? `${URL_IMAGEN}${actor.profile_path}` : URL_PLACEHOLDER;
    return `
      <article class="detail-cast-card">
        <a href="detalles.html?id=${actor.id}&type=person">
          <div class="detail-cast-image"><img src="${actorFoto}" alt="${actor.name}" loading="lazy" onerror="this.src='${URL_PLACEHOLDER}'"></div>
          <div class="detail-cast-copy">
            <p>${actor.name}</p>
            <span>${actor.character || 'Reparto'}</span>
          </div>
        </a>
      </article>
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
      <article class="detail-rec-card">
        <a href="detalles.html?id=${r.id}&type=${type}">
          <div class="detail-rec-image"><img src="${recFondo}" alt="${rTitle}" loading="lazy"></div>
          <div class="detail-rec-copy">
            <div><p title="${rTitle}">${rTitle}</p><span>${rDate ? new Date(rDate).getFullYear() : ''}</span></div>
            <strong>${rCalificacion}%</strong>
          </div>
        </a>
      </article>
    `;
  }).join('');

  // Keywords
  const keyList = type === 'movie' ? data.keywords?.keywords : data.keywords?.results;
  const keywordsHTML = keyList ? keyList.map(k => `
    <span class="detail-keyword">${k.name}</span>
  `).join('') : 'No hay palabras clave';

  const estado = data.status || '-';
  const idiomaOrig = data.original_language ? data.original_language.toUpperCase() : '-';
  
  let sidebarFinanciero = '';
  if (type === 'movie') {
    sidebarFinanciero = `
      <div class="detail-fact"><span>Presupuesto</span><strong>${formatearMoneda(data.budget)}</strong></div>
      <div class="detail-fact"><span>Ingresos</span><strong>${formatearMoneda(data.revenue)}</strong></div>
    `;
  } else {
    sidebarFinanciero = `
      <div class="detail-fact"><span>Tipo</span><strong>${data.type || '-'}</strong></div>
      <div class="detail-fact"><span>Canal original</span><strong>${data.networks ? data.networks.map(n => n.name).join(', ') : '-'}</strong></div>
    `;
  }

  // Trailers
  const trailers = data.videos?.results ? data.videos.results.filter(v => v.site === 'YouTube').slice(0, 5) : [];
  const trailersHTML = trailers.map(v => `
    <article class="detail-video-card">
      <div class="video-container">
        <iframe src="https://www.youtube.com/embed/${v.key}" title="${v.name}" allowfullscreen></iframe>
      </div>
      <p title="${v.name}">${v.name}</p>
    </article>
  `).join('');

  // Media (Backdrops)
  const backdrops = data.images?.backdrops ? data.images.backdrops.slice(0, 8) : [];
  const mediaHTML = backdrops.map(img => `
    <div class="media-image-card detail-still">
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
            
            ${type === 'movie' ? `
              <a href="reserva.html?tmdbId=${data.id}" class="btn-primary" style="text-decoration:none; display:inline-flex; align-items:center; gap:0.5rem; padding: 0.8rem 1.5rem; box-shadow: var(--shadow-neon);">
                Reservar o comprar
              </a>
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
