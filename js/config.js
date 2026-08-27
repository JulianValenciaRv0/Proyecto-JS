/**
 * CONFIGURACIÓN PRINCIPAL DE LA API DE TMDB
 * 
 * Contiene la API Key proporcionada para la práctica y las URLs base de la API y las imágenes.
 */

// Clave API de TMDB (suministrada para la práctica)
const API_KEY = "eb980c23c749ef9f4d30bbb2114f8a58";

// URL base de la API REST de TMDB (versión 3)
const URL_API = "https://api.themoviedb.org/3";

// URL base para cargar imágenes/pósteres en resolución w780 para mejor calidad
const URL_IMAGEN = "https://image.tmdb.org/t/p/w780";

// Ruta al archivo de imagen por defecto cuando no hay póster disponible
const URL_PLACEHOLDER = "../media/placeholder.svg";
const URL_PLACEHOLDER_LOCAL = "./media/placeholder.svg";
