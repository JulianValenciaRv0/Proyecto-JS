/**
 * LÓGICA DE LA PÁGINA PRINCIPAL (HOME)
 * 
 * Gestiona el consumo de endpoints para las secciones de Tendencias y Lo más popular.
 */

// Elementos del DOM
const scrollerTendencias = document.querySelector('#scroller-tendencias');
const scrollerPopular = document.querySelector('#scroller-popular');
const togglesTendencias = document.querySelectorAll('#toggle-tendencias .toggle-btn');
const togglesPopular = document.querySelectorAll('#toggle-popular .toggle-btn');
const formBuscarHome = document.querySelector('#form-buscar-home');
const inputBuscarHome = document.querySelector('#input-buscar-home');

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

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
  
  // Cargar por defecto
  cargarTendencias('day');
  cargarPopular('movie');

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
