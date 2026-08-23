/**
 * SERVICIO API - PETICIONES HTTP GET CON FETCH Y ASYNC/AWAIT
 * 
 * Función auxiliar para realizar peticiones HTTP GET a cualquier endpoint de TMDB.
 * Incorpora los parámetros requeridos como api_key y language=es-ES.
 */

async function obtenerDatosAPI(endpoint, parametrosAdicionales = {}) {
  try {
    // 1. Construimos los parámetros de la URL
    const params = new URLSearchParams({
      api_key: API_KEY,
      language: 'es-ES',
      ...parametrosAdicionales
    });

    // 2. Armamos la URL completa del endpoint
    const url = `${URL_API}${endpoint}?${params.toString()}`;

    // 3. Hacemos la petición HTTP GET con fetch()
    const respuesta = await fetch(url);

    // 4. Verificamos si la respuesta fue exitosa (código 200-299)
    if (!respuesta.ok) {
      throw new Error(`Error en la petición HTTP: ${respuesta.status}`);
    }

    // 5. Convertimos la respuesta a formato JSON
    const datos = await respuesta.json();
    return datos;

  } catch (error) {
    console.error("Error al consultar la API de TMDB:", error);
    return null;
  }
}
