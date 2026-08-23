/**
 * LÓGICA DEL APARTADO DE SERIES DE TV
 * 
 * Gestiona los endpoints de televisión (populares, transmitiéndose hoy, 
 * en emisión, mejor calificadas), búsqueda y ordenamiento de series.
 */

// Variables de estado
let categoriaActual = 'popular'; // Endpoints: popular, airing_today, on_the_air, top_rated
let paginaActual = 1;
let busquedaActual = '';
let listaSeries = [];

// Elementos del DOM
const gridSeries = document.querySelector('#grid-series');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');
const selectOrdenar = document.querySelector('#select-ordenar');
const botonesSubcat = document.querySelectorAll('#subcats-series .subcat-btn');
const linksDropdown = document.querySelectorAll('.dropdown-menu a[data-cat]');

// Cargar series de TV desde la API de TMDB
async function cargarSeries() {
  gridSeries.innerHTML = '<div class="cargando-spinner">📺 Cargando series de televisión...</div>';

  let data = null;

  // Si hay búsqueda por texto activa
  if (busquedaActual) {
    data = await obtenerDatosAPI('/search/tv', {
      query: busquedaActual,
      page: paginaActual
    });
  } else {
    // Si consulta por categoría (/tv/popular, /tv/airing_today, /tv/on_the_air, /tv/top_rated)
    data = await obtenerDatosAPI(`/tv/${categoriaActual}`, {
      page: paginaActual
    });
  }

  if (!data || !data.results || data.results.length === 0) {
    gridSeries.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron series de televisión</h3>
        <p>Intenta con otros términos o cambia la categoría seleccionada.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  // Guardamos la lista de series
  listaSeries = data.results;

  // Ordenamos y mostramos las tarjetas
  ordenarYMostrarSeries();

  // Renderizamos la paginación
  renderPaginacion(
    contenedorPaginacion,
    paginaActual,
    data.total_pages,
    (nuevaPagina) => {
      paginaActual = nuevaPagina;
      cargarSeries();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  );
}

// Ordenar y renderizar las series en el DOM
function ordenarYMostrarSeries() {
  const criterio = selectOrdenar.value;
  let seriesOrdenadas = [...listaSeries];

  if (criterio === 'calificacion') {
    seriesOrdenadas.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (criterio === 'fecha') {
    seriesOrdenadas.sort((a, b) => new Date(b.first_air_date || 0) - new Date(a.first_air_date || 0));
  } else if (criterio === 'populares') {
    seriesOrdenadas.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // Renderizamos con crearTarjetaMedia especificando esPelicula = false
  gridSeries.innerHTML = seriesOrdenadas
    .map(serie => crearTarjetaMedia(serie, false, false, false))
    .join('');
}

// Cambiar de categoría
function cambiarCategoria(nuevaCategoria) {
  categoriaActual = nuevaCategoria;
  busquedaActual = '';
  inputBuscar.value = '';
  paginaActual = 1;

  botonesSubcat.forEach(btn => {
    if (btn.dataset.cat === nuevaCategoria) {
      btn.classList.add('activo');
    } else {
      btn.classList.remove('activo');
    }
  });

  cargarSeries();
}

// Inicialización y eventos
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si hay una categoría en la URL (?cat=...)
  const params = new URLSearchParams(window.location.search);
  const catUrl = params.get('cat');
  if (catUrl && ['popular', 'airing_today', 'on_the_air', 'top_rated'].includes(catUrl)) {
    categoriaActual = catUrl;
    botonesSubcat.forEach(b => b.classList.toggle('activo', b.dataset.cat === catUrl));
  }

  cargarSeries();

  // Evento para botones de subcategorías
  botonesSubcat.forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarCategoria(btn.dataset.cat);
    });
  });

  // Evento para los ítems del dropdown
  linksDropdown.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarCategoria(link.dataset.cat);
    });
  });

  // Evento de búsqueda
  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBuscar.value.trim();
    if (texto) {
      busquedaActual = texto;
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarSeries();
    }
  });

  // Evento de ordenamiento
  selectOrdenar.addEventListener('change', () => {
    ordenarYMostrarSeries();
  });
});
