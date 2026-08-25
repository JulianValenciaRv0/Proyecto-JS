/**
 * LÓGICA DEL APARTADO DE PELÍCULAS CON FILTROS DISCOVER
 * 
 * Gestiona el consumo de endpoints para películas (populares, cartelera, próximos, top rated),
 * búsqueda por texto y filtrado avanzado (/discover/movie).
 */

// Estado global de películas
let categoriaActual = 'popular';
let paginaActual = 1;
let busquedaActual = '';
let usandoFiltros = false;
let filtrosAplicados = {};
let generosPeliculas = [];

// Elementos del DOM
const gridPeliculas = document.querySelector('#grid-peliculas');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const sidebarContainer = document.querySelector('#sidebar-filtros-container');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');
const botonesSubcat = document.querySelectorAll('#subcats-peliculas .subcat-btn');
const linksDropdown = document.querySelectorAll('.dropdown-menu a[data-cat]');
const btnToggleMovil = document.querySelector('#btn-toggle-filtros-movil');

// Cargar catálogo de películas desde TMDB API
async function cargarPeliculas() {
  gridPeliculas.innerHTML = '<div class="cargando-spinner">Cargando películas...</div>';

  let data = null;

  if (busquedaActual) {
    data = await obtenerDatosAPI('/search/movie', {
      query: busquedaActual,
      page: paginaActual
    });
  } else if (usandoFiltros) {
    const paramsDiscover = {
      page: paginaActual,
      sort_by: filtrosAplicados.sort_by || 'popularity.desc',
      with_genres: filtrosAplicados.with_genres || '',
      'primary_release_date.gte': filtrosAplicados.fechaDesde || '',
      'primary_release_date.lte': filtrosAplicados.fechaHasta || '',
      with_original_language: filtrosAplicados.with_original_language || '',
      'vote_average.gte': filtrosAplicados['vote_average.gte'] || ''
    };

    data = await obtenerDatosAPI('/discover/movie', paramsDiscover);
  } else {
    data = await obtenerDatosAPI(`/movie/${categoriaActual}`, {
      page: paginaActual
    });
  }

  if (!data || !data.results || data.results.length === 0) {
    gridPeliculas.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron películas</h3>
        <p>Intenta ajustando los filtros de búsqueda o seleccionando otra categoría.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  // Renderizar tarjetas de películas
  gridPeliculas.innerHTML = data.results
    .map(pelicula => crearTarjetaMedia(pelicula, true, false, true))
    .join('');

  // Renderizar la paginación
  renderPaginacion(
    contenedorPaginacion,
    paginaActual,
    data.total_pages,
    (nuevaPagina) => {
      paginaActual = nuevaPagina;
      cargarPeliculas();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  );
}

// Cargar lista de géneros e inicializar el Sidebar de Filtros
async function inicializarFiltros() {
  const resGeneros = await obtenerDatosAPI('/genre/movie/list');
  if (resGeneros && resGeneros.genres) {
    generosPeliculas = resGeneros.genres;
  }

  renderSidebarFiltros(
    sidebarContainer,
    true,
    generosPeliculas,
    (nuevosFiltros) => {
      filtrosAplicados = nuevosFiltros;
      usandoFiltros = true;
      busquedaActual = '';
      inputBuscar.value = '';
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarPeliculas();
    },
    () => {
      filtrosAplicados = {};
      usandoFiltros = false;
      categoriaActual = 'popular';
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.toggle('activo', b.dataset.cat === 'popular'));
      cargarPeliculas();
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

  cargarPeliculas();
}

// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
  // Se removió inicializarPantallaBienvenida de aquí, ahora va en home.js

  const params = new URLSearchParams(window.location.search);
  const searchUrl = params.get('search');
  if (searchUrl) {
    busquedaActual = searchUrl;
    inputBuscar.value = searchUrl;
  }

  inicializarFiltros();
  cargarPeliculas();

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
      cargarPeliculas();
    }
  });

  if (btnToggleMovil && sidebarContainer) {
    btnToggleMovil.addEventListener('click', () => {
      sidebarContainer.classList.toggle('abierto');
    });
  }
});
