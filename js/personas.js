/**
 * LÓGICA DEL APARTADO DE PERSONAS
 * 
 * Consulta y despliega a las personalidades populares de TMDB (/person/popular)
 * e implementa la búsqueda de actores y directores por nombre (/search/person).
 */

// Variables de estado
let paginaActual = 1;
let busquedaActual = '';
let listaPersonas = [];

// Elementos del DOM
const gridPersonas = document.querySelector('#grid-personas');
const contenedorPaginacion = document.querySelector('#contenedor-paginacion');
const formBuscar = document.querySelector('#form-buscar');
const inputBuscar = document.querySelector('#input-buscar');

// Cargar personas populares o buscar personas
async function cargarPersonas() {
  gridPersonas.innerHTML = '<div class="cargando-spinner">👥 Cargando personas populares...</div>';

  let data = null;

  if (busquedaActual) {
    data = await obtenerDatosAPI('/search/person', {
      query: busquedaActual,
      page: paginaActual
    });
  } else {
    data = await obtenerDatosAPI('/person/popular', {
      page: paginaActual
    });
  }

  if (!data || !data.results || data.results.length === 0) {
    gridPersonas.innerHTML = `
      <div class="mensaje-vacio">
        <h3>No se encontraron personas</h3>
        <p>Prueba buscando con otro nombre.</p>
      </div>
    `;
    contenedorPaginacion.innerHTML = '';
    return;
  }

  listaPersonas = data.results;

  // Renderizar tarjetas de personas
  gridPersonas.innerHTML = listaPersonas
    .map(persona => crearTarjetaPersona(persona, false))
    .join('');

  // Renderizar la paginación
  renderPaginacion(
    contenedorPaginacion,
    paginaActual,
    data.total_pages,
    (nuevaPagina) => {
      paginaActual = nuevaPagina;
      cargarPersonas();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  );
}

// Escuchadores de eventos
document.addEventListener('DOMContentLoaded', () => {
  cargarPersonas();

  formBuscar.addEventListener('submit', (e) => {
    e.preventDefault();
    const texto = inputBuscar.value.trim();
    if (texto) {
      busquedaActual = texto;
      paginaActual = 1;
      cargarPersonas();
    }
  });
});
