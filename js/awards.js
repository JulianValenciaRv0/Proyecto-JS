/**
 * LÓGICA DEL APARTADO DE AWARDS & GALARDONES CON FILTROS DISCOVER
 * 
 * Presenta las producciones mejor calificadas y aclamadas por la crítica y audiencia,
 * resaltando galardones mediante llamadas HTTP GET.
 */

// Estado global de awards
let tipoActual = 'peliculas_top'; // peliculas_top, series_top, obras_maestras
let paginaActual = 1;
let busquedaActual = '';
let usandoFiltros = false;
let filtrosAplicados = {};
let generosAwards = [];

// Elementos del DOM
const gridAwards = document.querySelector('#grid-awards');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const sidebarContainer = document.querySelector('#sidebar-filtros-container');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');
const botonesSubcat = document.querySelectorAll('#subcats-awards .subcat-btn');
const btnToggleMovil = document.querySelector('#btn-toggle-filtros-movil');

// Cargar galardonados desde la API de TMDB
async function cargarAwards() {
  gridAwards.innerHTML = '<div class="cargando-spinner">Cargando producciones galardonadas...</div>';

  let data = null;
  const esMovie = tipoActual !== 'series_top';

  if (busquedaActual) {
    data = await obtenerDatosAPI(esMovie ? '/search/movie' : '/search/tv', {
      query: busquedaActual,
      page: paginaActual
    });
  } else if (usandoFiltros) {
    const endpoint = esMovie ? '/discover/movie' : '/discover/tv';
    const paramsDiscover = {
      page: paginaActual,
      sort_by: filtrosAplicados.sort_by || 'vote_average.desc',
      with_genres: filtrosAplicados.with_genres || '',
      [esMovie ? 'primary_release_date.gte' : 'first_air_date.gte']: filtrosAplicados.fechaDesde || '',
      [esMovie ? 'primary_release_date.lte' : 'first_air_date.lte']: filtrosAplicados.fechaHasta || '',
      with_original_language: filtrosAplicados.with_original_language || '',
      'vote_average.gte': filtrosAplicados['vote_average.gte'] || '7.5'
    };

    data = await obtenerDatosAPI(endpoint, paramsDiscover);
  } else if (tipoActual === 'peliculas_top') {
    data = await obtenerDatosAPI('/movie/top_rated', { page: paginaActual });
  } else if (tipoActual === 'series_top') {
    data = await obtenerDatosAPI('/tv/top_rated', { page: paginaActual });
  } else if (tipoActual === 'obras_maestras') {
    data = await obtenerDatosAPI('/discover/movie', {
      page: paginaActual,
      'vote_average.gte': '8.3',
      sort_by: 'vote_average.desc'
    });
  }

  if (!data || !data.results || data.results.length === 0) {
    gridAwards.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron producciones galardonadas</h3>
        <p>Intenta ajustando los filtros de búsqueda.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  // Renderizar tarjetas con la insignia de galardón (esAward = true)
  gridAwards.innerHTML = data.results
    .map(item => crearTarjetaMedia(item, esMovie, true, false))
    .join('');

  // Renderizar la paginación
  renderPaginacion(
    contenedorPaginacion,
    paginaActual,
    data.total_pages,
    (nuevaPagina) => {
      paginaActual = nuevaPagina;
      cargarAwards();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  );
}

// Cargar géneros e inicializar Sidebar de Filtros
async function inicializarFiltros() {
  const esMovie = tipoActual !== 'series_top';
  const resGeneros = await obtenerDatosAPI(esMovie ? '/genre/movie/list' : '/genre/tv/list');
  if (resGeneros && resGeneros.genres) {
    generosAwards = resGeneros.genres;
  }

  renderSidebarFiltros(
    sidebarContainer,
    esMovie,
    generosAwards,
    (nuevosFiltros) => {
      filtrosAplicados = nuevosFiltros;
      usandoFiltros = true;
      busquedaActual = '';
      inputBuscar.value = '';
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarAwards();
    },
    () => {
      filtrosAplicados = {};
      usandoFiltros = false;
      tipoActual = 'peliculas_top';
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.toggle('activo', b.dataset.tipo === 'peliculas_top'));
      cargarAwards();
    }
  );
}

// Cambiar subcategoría de Awards
function cambiarTipoAward(nuevoTipo) {
  tipoActual = nuevoTipo;
  usandoFiltros = false;
  busquedaActual = '';
  inputBuscar.value = '';
  paginaActual = 1;

  botonesSubcat.forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.tipo === nuevoTipo);
  });

  inicializarFiltros();
  cargarAwards();
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  // Pantalla de bienvenida removida de aquí (solo en home)

  inicializarFiltros();
  cargarAwards();

  botonesSubcat.forEach(btn => {
    btn.addEventListener('click', () => cambiarTipoAward(btn.dataset.tipo));
  });

  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBuscar.value.trim();
    if (texto) {
      busquedaActual = texto;
      usandoFiltros = false;
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarAwards();
    }
  });

  if (btnToggleMovil && sidebarContainer) {
    btnToggleMovil.addEventListener('click', () => {
      sidebarContainer.classList.toggle('abierto');
    });
  }
});
