/**
 * LÓGICA DE LA PÁGINA PRINCIPAL (HOME)
 * 
 * Gestiona el consumo de endpoints para las secciones de Tendencias y Lo más popular.
 */

// Elementos del DOM
const scrollerTendencias = document.querySelector('#scroller-tendencias');
const scrollerPopular = document.querySelector('#scroller-popular');
const scrollerGratis = document.querySelector('#scroller-gratis');
const togglesTendencias = document.querySelectorAll('#toggle-tendencias .toggle-btn');
const togglesPopular = document.querySelectorAll('#toggle-popular .toggle-btn');
const togglesGratis = document.querySelectorAll('#toggle-gratis .toggle-btn');
const formBuscarHome = document.querySelector('#form-buscar-home');
const inputBuscarHome = document.querySelector('#input-buscar-home');
const bannerDinamico = document.querySelector('#home-banner-dinamico');

// Cargar Tendencias (Día o Semana)
async function cargarTendencias(timeWindow = 'day') {
  scrollerTendencias.innerHTML = '<div class="cargando-spinner">Cargando tendencias...</div>';
  
  const data = await obtenerDatosAPI(`/trending/all/${timeWindow}`);
  
  if (!data || !data.results || data.results.length === 0) {
    scrollerTendencias.innerHTML = '<div class="mensaje-vacio"><p>No se encontraron tendencias.</p></div>';
    return;
  }

  // Filtrar solo películas y series (ignorar personas en el carrusel de tendencias por ahora)
  const items = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
  
  scrollerTendencias.innerHTML = items
    .map(item => crearTarjetaMedia(item, item.media_type === 'movie', false, true))
    .join('');
}

// Cargar Lo más popular (Películas o Series)
async function cargarPopular(type = 'movie') {
  scrollerPopular.innerHTML = '<div class="cargando-spinner">Cargando lo más popular...</div>';
  
  const data = await obtenerDatosAPI(`/${type}/popular`);
  
  if (!data || !data.results || data.results.length === 0) {
    scrollerPopular.innerHTML = '<div class="mensaje-vacio"><p>No se encontró contenido popular.</p></div>';
    return;
  }

  scrollerPopular.innerHTML = data.results
    .map(item => crearTarjetaMedia(item, type === 'movie', false, true))
    .join('');
}

// Cargar Ver Gratis (Películas o Series con filtro de watch providers)
async function cargarGratis(type = 'movie') {
  scrollerGratis.innerHTML = '<div class="cargando-spinner">Cargando contenido gratuito...</div>';
  
  // Usamos discover para buscar contenido que tenga la opción free/ads en watch_monetization_types
  const endpoint = type === 'movie' ? '/discover/movie' : '/discover/tv';
  const data = await obtenerDatosAPI(endpoint, { 
    with_watch_monetization_types: 'free|ads',
    sort_by: 'popularity.desc'
  });
  
  if (!data || !data.results || data.results.length === 0) {
    scrollerGratis.innerHTML = '<div class="mensaje-vacio"><p>No se encontró contenido gratuito en este momento.</p></div>';
    return;
  }

  scrollerGratis.innerHTML = data.results
    .map(item => crearTarjetaMedia(item, type === 'movie', false, true))
    .join('');
}

// Cargar imagen de fondo aleatoria para el banner
async function cargarBannerAleatorio() {
  if (!bannerDinamico) return;
  // Obtenemos películas populares para usar como fondo
  const data = await obtenerDatosAPI('/movie/popular');
  if (data && data.results && data.results.length > 0) {
    // Escoger una película aleatoria de los top 10
    const randomIndex = Math.floor(Math.random() * 10);
    const movie = data.results[randomIndex];
    if (movie && movie.backdrop_path) {
      const imgUrl = `https://image.tmdb.org/t/p/original${movie.backdrop_path}`;
      // Aplicar como background image en el style del elemento
      bannerDinamico.style.backgroundImage = `url('${imgUrl}')`;
      
      const titleEl = bannerDinamico.querySelector('h2');
      const descEl = bannerDinamico.querySelector('p');
      const linkEl = bannerDinamico.querySelector('a.btn-primary');
      const scoreSpan = bannerDinamico.querySelector('.stars span');
      
      if (titleEl) titleEl.textContent = movie.title || movie.name;
      if (descEl) descEl.textContent = movie.overview ? (movie.overview.substring(0, 200) + '...') : 'Sin descripción disponible.';
      if (linkEl) linkEl.href = `pages/detalles.html?id=${movie.id}&type=movie`;
      if (scoreSpan) scoreSpan.textContent = `${movie.vote_average.toFixed(1)} (TMDB)`;
    }
  }
}

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar Pantalla de Inicio / Bienvenida estilo Netflix
  inicializarPantallaBienvenida(true);
  
  // Cargar por defecto
  cargarBannerAleatorio();
  cargarTendencias('day');
  cargarPopular('movie');
  cargarGratis('movie');

  // Eventos para Toggle de Tendencias
  togglesTendencias.forEach(btn => {
    btn.addEventListener('click', (e) => {
      togglesTendencias.forEach(b => b.classList.remove('activo'));
      e.target.classList.add('activo');
      cargarTendencias(e.target.dataset.time);
    });
  });

  // Eventos para Toggle de Popular
  togglesPopular.forEach(btn => {
    btn.addEventListener('click', (e) => {
      togglesPopular.forEach(b => b.classList.remove('activo'));
      e.target.classList.add('activo');
      cargarPopular(e.target.dataset.type);
    });
  });

  // Eventos para Toggle de Ver Gratis
  togglesGratis.forEach(btn => {
    btn.addEventListener('click', (e) => {
      togglesGratis.forEach(b => b.classList.remove('activo'));
      e.target.classList.add('activo');
      cargarGratis(e.target.dataset.type);
    });
  });

  // Buscador de la página principal
  if (formBuscarHome) {
    formBuscarHome.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = inputBuscarHome.value.trim();
      if (query) {
        // Redirigir a películas por ahora, pasando el parámetro
        window.location.href = `pages/peliculas.html?search=${encodeURIComponent(query)}`;
      }
    });
  }
});
