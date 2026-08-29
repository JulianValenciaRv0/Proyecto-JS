/**
 * LÓGICA DEL APARTADO DE SERIES DE TV CON FILTROS DISCOVER
 * 
 * Gestiona el consumo de endpoints para series de televisión,
 * búsqueda por texto y filtrado avanzado (/discover/tv).
 */

// Estado global de series
let categoriaActual = 'popular';
let paginaActual = 1;
let busquedaActual = '';
let usandoFiltros = false;
let filtrosAplicados = {};
let generosSeries = [];

// Elementos del DOM
const gridSeries = document.querySelector('#grid-series');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const sidebarContainer = document.querySelector('#sidebar-filtros-container');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');
const botonesSubcat = document.querySelectorAll('#subcats-series .subcat-btn');
const linksDropdown = document.querySelectorAll('.dropdown-menu a[data-cat]');
const btnToggleMovil = document.querySelector('#btn-toggle-filtros-movil');

// Cargar catálogo de series desde TMDB API
async function cargarSeries() {
  gridSeries.innerHTML = '<div class="cargando-spinner">Cargando series de televisión...</div>';

  let data = null;

  if (busquedaActual) {
    data = await obtenerDatosAPI('/search/tv', {
      query: busquedaActual,
      page: paginaActual
    });
  } else if (usandoFiltros) {
    const paramsDiscover = {
      page: paginaActual,
      sort_by: filtrosAplicados.sort_by || 'popularity.desc',
      with_genres: filtrosAplicados.with_genres || '',
      'first_air_date.gte': filtrosAplicados.fechaDesde || '',
      'first_air_date.lte': filtrosAplicados.fechaHasta || '',
      with_original_language: filtrosAplicados.with_original_language || '',
      'vote_average.gte': filtrosAplicados['vote_average.gte'] || ''
    };

    data = await obtenerDatosAPI('/discover/tv', paramsDiscover);
  } else {
    data = await obtenerDatosAPI(`/tv/${categoriaActual}`, {
      page: paginaActual
    });
  }

  if (!data || !data.results || data.results.length === 0) {
    gridSeries.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron series de televisión</h3>
        <p>Intenta ajustando los filtros de búsqueda o seleccionando otra categoría.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  // Renderizar tarjetas de series (esPelicula = false)
  gridSeries.innerHTML = data.results
    .map(serie => crearTarjetaMedia(serie, false, false, false))
    .join('');

  // Renderizar la paginación
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

// Cargar lista de géneros de TV e inicializar el Sidebar de Filtros
async function inicializarFiltros() {
  const resGeneros = await obtenerDatosAPI('/genre/tv/list');
  if (resGeneros && resGeneros.genres) {
    generosSeries = resGeneros.genres;
  }

  renderSidebarFiltros(
    sidebarContainer,
    false, // esPelicula = false
    generosSeries,
    (nuevosFiltros) => {
      filtrosAplicados = nuevosFiltros;
      usandoFiltros = true;
      busquedaActual = '';
      inputBuscar.value = '';
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarSeries();
    },
    () => {
      filtrosAplicados = {};
      usandoFiltros = false;
      categoriaActual = 'popular';
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.toggle('activo', b.dataset.cat === 'popular'));
      cargarSeries();
    }
  );
}

// Cambiar categoría rápida
function cambiarCategoria(nuevaCategoria) {
  categoriaActual = nuevaCategoria;
  usandoFiltros = false;
  busquedaActual = '';
  inputBuscar.value = '';
  paginaActual = 1;

  botonesSubcat.forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.cat === nuevaCategoria);
  });

  cargarSeries();
}

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
  // Pantalla de bienvenida removida de aquí (solo en home)

  // Verificar si viene una categoría por URL (?cat=...)
  const params = new URLSearchParams(window.location.search);
  const catUrl = params.get('cat');
  if (catUrl && ['popular', 'airing_today', 'on_the_air', 'top_rated'].includes(catUrl)) {
    categoriaActual = catUrl;
  }

  inicializarFiltros();
  cargarSeries();

  botonesSubcat.forEach(btn => {
    btn.addEventListener('click', () => cambiarCategoria(btn.dataset.cat));
  });

  linksDropdown.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarCategoria(link.dataset.cat);
    });
  });

  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBuscar.value.trim();
    if (texto) {
      busquedaActual = texto;
      usandoFiltros = false;
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarSeries();
    }
  });

  if (btnToggleMovil && sidebarContainer) {
    btnToggleMovil.addEventListener('click', () => {
      sidebarContainer.classList.toggle('abierto');
    });
  }
});
