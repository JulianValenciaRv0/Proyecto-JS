/**
 * LÓGICA DEL APARTADO DE PELÍCULAS
 * 
 * Gestiona el consumo de endpoints para películas (populares, en cartelera,
 * próximos estrenos, mejor calificadas), la búsqueda y la ordenación.
 */

// Variables de estado
let categoriaActual = 'popular'; // Endpoints: popular, now_playing, upcoming, top_rated
let paginaActual = 1;
let busquedaActual = '';
let listaPeliculas = [];

// Elementos del DOM
const gridPeliculas = document.querySelector('#grid-peliculas');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');
const selectOrdenar = document.querySelector('#select-ordenar');
const botonesSubcat = document.querySelectorAll('#subcats-peliculas .subcat-btn');
const linksDropdown = document.querySelectorAll('.dropdown-menu a[data-cat]');

// Cargar películas desde la API de TMDB
async function cargarPeliculas() {
  gridPeliculas.innerHTML = '<div class="cargando-spinner">🎬 Cargando películas...</div>';

  let data = null;

  // Si el usuario realizó una búsqueda por texto
  if (busquedaActual) {
    data = await obtenerDatosAPI('/search/movie', {
      query: busquedaActual,
      page: paginaActual
    });
  } else {
    // Si consulta por categoría (/movie/popular, /movie/now_playing, etc.)
    data = await obtenerDatosAPI(`/movie/${categoriaActual}`, {
      page: paginaActual
    });
  }

  if (!data || !data.results || data.results.length === 0) {
    gridPeliculas.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron películas</h3>
        <p>Intenta con otros términos de búsqueda o cambia de categoría.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  // Guardamos la lista de películas
  listaPeliculas = data.results;

  // Aplicamos la ordenación seleccionada
  ordenarYMostrarPeliculas();

  // Renderizamos la paginación
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

// Ordenar y renderizar las películas en el DOM
function ordenarYMostrarPeliculas() {
  const criterio = selectOrdenar.value;
  let peliculasOrdenadas = [...listaPeliculas];

  if (criterio === 'calificacion') {
    peliculasOrdenadas.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
  } else if (criterio === 'fecha') {
    peliculasOrdenadas.sort((a, b) => new Date(b.release_date || 0) - new Date(a.release_date || 0));
  } else if (criterio === 'populares') {
    peliculasOrdenadas.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  }

  // Generamos el HTML dinámico reutilizando crearTarjetaMedia
  gridPeliculas.innerHTML = peliculasOrdenadas
    .map(pelicula => crearTarjetaMedia(pelicula, true, false, true))
    .join('');
}

// Cambiar de categoría (Populares, Cartelera, Próximos, Top Rated)
function cambiarCategoria(nuevaCategoria) {
  categoriaActual = nuevaCategoria;
  busquedaActual = '';
  inputBuscar.value = '';
  paginaActual = 1;

  // Actualizamos estado activo de botones
  botonesSubcat.forEach(btn => {
    if (btn.dataset.cat === nuevaCategoria) {
      btn.classList.add('activo');
    } else {
      btn.classList.remove('activo');
    }
  });

  cargarPeliculas();
}

// Escuchadores de Eventos
document.addEventListener('DOMContentLoaded', () => {
  // Carga inicial
  cargarPeliculas();

  // Evento para botones de subcategorías
  botonesSubcat.forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarCategoria(btn.dataset.cat);
    });
  });

  // Evento para el menú desplegable en el header
  linksDropdown.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      cambiarCategoria(link.dataset.cat);
    });
  });

  // Evento para el formulario de búsqueda
  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBuscar.value.trim();
    if (texto) {
      busquedaActual = texto;
      paginaActual = 1;
      // Quitamos estado activo de subcategorías al buscar
      botonesSubcat.forEach(b => b.classList.remove('activo'));
      cargarPeliculas();
    }
  });

  // Evento para el selector de ordenación
  selectOrdenar.addEventListener('change', () => {
    ordenarYMostrarPeliculas();
  });
});
