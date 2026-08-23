/**
 * LÓGICA DEL APARTADO DE AWARDS & GALARDONES
 * 
 * Presenta las producciones mejor calificadas y aclamadas por la crítica y audiencia,
 * resaltando galardones y medallas de excelencia mediante llamadas HTTP GET.
 */

// Variables de estado
let tipoActual = 'peliculas_top'; // peliculas_top, series_top, obras_maestras
let paginaActual = 1;
let busquedaActual = '';
let listaAwards = [];

// Elementos del DOM
const gridAwards = document.querySelector('#grid-awards');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');
const selectOrdenar = document.querySelector('#select-ordenar');
const botonesSubcat = document.querySelectorAll('#subcats-awards .subcat-btn');

// Cargar galardonados desde la API de TMDB
async function cargarAwards() {
  gridAwards.innerHTML = '<div class="cargando-spinner">🏆 Cargando producciones galardonadas...</div>';

  let data = null;
  let esPelicula = true;

  if (busquedaActual) {
    // Petición de búsqueda
    data = await obtenerDatosAPI('/search/movie', {
      query: busquedaActual,
      page: paginaActual
    });
  } else if (tipoActual === 'peliculas_top') {
    esPelicula = true;
    data = await obtenerDatosAPI('/movie/top_rated', {
      page: paginaActual
    });
  } else if (tipoActual === 'series_top') {
    esPelicula = false;
    data = await obtenerDatosAPI('/tv/top_rated', {
      page: paginaActual
    });
  } else if (tipoActual === 'obras_maestras') {
    esPelicula = true;
    data = await obtenerDatosAPI('/movie/top_rated', {
      page: paginaActual
    });
    // Filtramos producciones con puntuaciones muy altas (>= 8.5)
    if (data && data.results) {
      data.results = data.results.filter(item => (item.vote_average || 0) >= 8.3);
    }
  }

  if (!data || !data.results || data.results.length === 0) {
    gridAwards.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron obras galardonadas</h3>
        <p>Intenta con otra búsqueda o selecciona otra categoría.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  listaAwards = data.results;

  ordenarYMostrarAwards(esPelicula);

  // Paginación
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

// Ordenar y mostrar tarjetas de galardones
function ordenarYMostrarAwards(esPelicula = true) {
  const criterio = selectOrdenar.value;
  let ordenados = [...listaAwards];

  if (criterio === 'calificacion') {
    ordenados.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (criterio === 'fecha') {
    ordenados.sort((a, b) => {
      const fechaA = new Date(a.release_date || a.first_air_date || 0);
      const fechaB = new Date(b.release_date || b.first_air_date || 0);
      return fechaB - fechaA;
    });
  } else if (criterio === 'populares') {
    ordenados.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // Renderizamos pasando esAward = true para mostrar la insignia dorada
  gridAwards.innerHTML = ordenados
    .map(item => crearTarjetaMedia(item, tipoActual !== 'series_top', true, false))
    .join('');
}

// Cambiar categoría de Awards
function cambiarTipoAward(nuevoTipo) {
  tipoActual = nuevoTipo;
  busquedaActual = '';
  inputBuscar.value = '';
  paginaActual = 1;

  botonesSubcat.forEach(btn => {
    btn.classList.toggle('activo', btn.dataset.tipo === nuevoTipo);
  });

  cargarAwards();
}

// Inicializar eventos
document.addEventListener('DOMContentLoaded', () => {
  cargarAwards();

  botonesSubcat.forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarTipoAward(btn.dataset.tipo);
    });
  });

  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBuscar.value.trim();
    if (texto) {
      busquedaActual = texto;
      paginaActual = 1;
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarAwards();
    }
  });

  selectOrdenar.addEventListener('change', () => {
    ordenarYMostrarAwards();
  });
});
