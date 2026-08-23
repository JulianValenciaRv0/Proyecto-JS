# Guía práctica: uso de The Movie Database (TMDB) API con JavaScript

## 1. Objetivo

En esta práctica aprenderás a consumir una API REST utilizando JavaScript y `fetch()`.

Usaremos **The Movie Database (TMDB)** para:

- Obtener una lista de películas.
- Mostrar películas populares.
- Consultar películas en cartelera.
- Buscar películas por nombre.
- Obtener información detallada de una película.
- Mostrar los pósteres.
- Manejar errores.
- Trabajar con paginación.
- Construir una pequeña aplicación web.

------

# 2. ¿Qué es TMDB?

**TMDB — The Movie Database** es una base de datos de películas, series, actores y contenido audiovisual.

Su API permite realizar solicitudes HTTP como:

```text
GET
```

Por ejemplo:

```text
https://api.themoviedb.org/3/movie/popular
```

Esta solicitud obtiene películas populares.

------

# 3. Requisitos

Para realizar la práctica necesitamos:

- Navegador web.
- Visual Studio Code.
- HTML.
- JavaScript.
- Una cuenta en TMDB.
- Una API Key de TMDB.
- Conexión a Internet.

------

# 4. Obtener la API Key

Después de crear una cuenta en TMDB debemos ir a:

```text
Settings
   ↓
API
```

TMDB proporciona dos credenciales:

```text
API Read Access Token

API Key
```

Para esta práctica utilizaremos:

```text
API Key
```

La clave tiene una estructura similar a:

```text
xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Nunca debemos publicar nuestra API Key en repositorios públicos.

------

# 5. Estructura básica de una petición

La URL base de TMDB es:

```text
https://api.themoviedb.org/3
```

Para obtener películas populares utilizamos:

```text
/movie/popular
```

Por lo tanto:

```text
https://api.themoviedb.org/3/movie/popular
```

Ahora agregamos nuestra API Key:

```text
?api_key=TU_API_KEY
```

La URL completa sería:

```text
https://api.themoviedb.org/3/movie/popular?api_key=TU_API_KEY
```

También podemos solicitar la información en español:

```text
&language=es-ES
```

Resultado:

```text
https://api.themoviedb.org/3/movie/popular?api_key=TU_API_KEY&language=es-ES
```

------

# 6. Primera prueba desde el navegador

Copia la dirección:

```text
https://api.themoviedb.org/3/movie/popular?api_key=TU_API_KEY&language=es-ES
```

Reemplaza:

```text
TU_API_KEY
```

por tu API Key real.

Si la petición funciona correctamente veremos un JSON.

Ejemplo simplificado:

```json
{
    "page": 1,
    "results": [
        {
            "id": 12345,
            "title": "Una película",
            "overview": "Descripción de la película",
            "poster_path": "/imagen.jpg",
            "release_date": "2026-05-20",
            "vote_average": 7.8
        }
    ],
    "total_pages": 500,
    "total_results": 10000
}
```

------

# 7. Entender la respuesta

La respuesta contiene una propiedad muy importante:

```javascript
results
```

`results` es un arreglo de películas.

```javascript
data.results
```

Cada elemento representa una película.

Por ejemplo:

```javascript
{
    id: 12345,
    title: "Una película",
    overview: "Descripción...",
    poster_path: "/imagen.jpg",
    vote_average: 7.8
}
```

------

# 8. Crear nuestro proyecto

Creamos una carpeta:

```text
tmdb-app
```

Dentro:

```text
tmdb-app
│
├── index.html
├── app.js
└── style.css
```

------

# 9. Crear el HTML

Archivo:

```text
index.html
```

Código:

```html
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Películas TMDB</title>

    <link rel="stylesheet" href="style.css">
</head>

<body>

    <h1>Películas populares</h1>

    <div id="peliculas"></div>

    <script src="app.js"></script>

</body>

</html>
```

El elemento:

```html
<div id="peliculas"></div>
```

será utilizado para colocar las películas obtenidas desde TMDB.

------

# 10. Consumir la API con fetch()

En:

```text
app.js
```

creamos:

```javascript
const API_KEY = "TU_API_KEY";

const URL =
    `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`;

fetch(URL)
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error(error);
    });
```

Abrimos:

```text
F12
```

y luego:

```text
Console
```

Deberíamos observar el objeto recibido desde TMDB.

------

# 11. Utilizar async/await

También podemos escribir la petición de una manera más moderna.

```javascript
const API_KEY = "TU_API_KEY";

async function obtenerPeliculas() {

    const url =
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`;

    const response = await fetch(url);

    const data = await response.json();

    console.log(data);
}

obtenerPeliculas();
```

------

# 12. Obtener solamente las películas

La información que necesitamos está dentro de:

```javascript
data.results
```

Ejemplo:

```javascript
async function obtenerPeliculas() {

    const url =
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`;

    const response = await fetch(url);

    const data = await response.json();

    console.log(data.results);
}
```

------

# 13. Recorrer las películas

Podemos utilizar:

```javascript
forEach()
```

Ejemplo:

```javascript
data.results.forEach(pelicula => {

    console.log(pelicula.title);

});
```

Ahora aparecerán solamente los nombres de las películas.

------

# 14. Mostrar las películas en HTML

Podemos modificar el DOM.

```javascript
const contenedor = document.querySelector("#peliculas");
```

Después:

```javascript
data.results.forEach(pelicula => {

    contenedor.innerHTML += `
        <div>
            <h2>${pelicula.title}</h2>

            <p>${pelicula.overview}</p>

            <p>
                Calificación:
                ${pelicula.vote_average}
            </p>
        </div>
    `;

});
```

Código completo:

```javascript
const API_KEY = "TU_API_KEY";

async function obtenerPeliculas() {

    const url =
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`;

    const response = await fetch(url);

    const data = await response.json();

    const contenedor =
        document.querySelector("#peliculas");

    data.results.forEach(pelicula => {

        contenedor.innerHTML += `
            <div>

                <h2>
                    ${pelicula.title}
                </h2>

                <p>
                    ${pelicula.overview}
                </p>

                <p>
                    Calificación:
                    ${pelicula.vote_average}
                </p>

            </div>
        `;

    });

}

obtenerPeliculas();
```

------

# 15. Mostrar los pósteres

TMDB devuelve una propiedad:

```javascript
poster_path
```

Ejemplo:

```text
/imagen123.jpg
```

Pero esa no es todavía la dirección completa de la imagen.

TMDB utiliza como base:

```text
https://image.tmdb.org/t/p/
```

Podemos seleccionar un tamaño:

```text
w500
```

Entonces:

```text
https://image.tmdb.org/t/p/w500
```

Finalmente agregamos:

```javascript
pelicula.poster_path
```

Ejemplo:

```javascript
const URL_IMAGEN =
    "https://image.tmdb.org/t/p/w500";
```

Y:

```html
<img src="${URL_IMAGEN}${pelicula.poster_path}">
```

------

# 16. Mostrar título, póster y descripción

```javascript
const API_KEY = "TU_API_KEY";

const URL_IMAGEN =
    "https://image.tmdb.org/t/p/w500";

async function obtenerPeliculas() {

    const url =
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`;

    const response = await fetch(url);

    const data = await response.json();

    const contenedor =
        document.querySelector("#peliculas");

    data.results.forEach(pelicula => {

        contenedor.innerHTML += `
            <div class="pelicula">

                <img
                    src="${URL_IMAGEN}${pelicula.poster_path}"
                    alt="${pelicula.title}"
                >

                <h2>
                    ${pelicula.title}
                </h2>

                <p>
                    ${pelicula.overview}
                </p>

                <strong>
                    ⭐ ${pelicula.vote_average}
                </strong>

            </div>
        `;

    });

}

obtenerPeliculas();
```

------

# 17. Agregar estilos

En:

```text
style.css
```

podemos utilizar:

```css
body {
    font-family: Arial, sans-serif;
    margin: 30px;
}

#peliculas {
    display: grid;
    grid-template-columns:
        repeat(auto-fill, minmax(220px, 1fr));
    gap: 20px;
}

.pelicula {
    border: 1px solid #ccc;
    padding: 15px;
    border-radius: 8px;
}

.pelicula img {
    width: 100%;
    border-radius: 8px;
}
```

Ahora las películas aparecerán como una cuadrícula de tarjetas.

------

# 18. Diferentes listas de películas

TMDB tiene diferentes endpoints.

## Películas populares

```text
/movie/popular
```

Ejemplo:

```text
https://api.themoviedb.org/3/movie/popular
```

------

## Películas en cartelera

```text
/movie/now_playing
```

Ejemplo:

```text
https://api.themoviedb.org/3/movie/now_playing
```

------

## Películas mejor calificadas

```text
/movie/top_rated
```

------

## Próximos estrenos

```text
/movie/upcoming
```

------

# 19. Buscar una película

También podemos buscar películas por nombre.

El endpoint es:

```text
/search/movie
```

Ejemplo:

```text
https://api.themoviedb.org/3/search/movie
```

Debemos agregar:

```text
query
```

Por ejemplo:

```text
query=Batman
```

La petición sería:

```javascript
const url =
    `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=Batman&language=es-ES`;
```

------

# 20. Crear un buscador

Modificamos el HTML:

```html
<h1>Buscar películas</h1>

<input
    type="text"
    id="buscar"
    placeholder="Nombre de película">

<button id="btnBuscar">
    Buscar
</button>

<div id="peliculas"></div>
```

------

# 21. Buscar desde JavaScript

```javascript
const API_KEY = "TU_API_KEY";

const URL_IMAGEN =
    "https://image.tmdb.org/t/p/w500";

const boton =
    document.querySelector("#btnBuscar");

boton.addEventListener("click", buscarPeliculas);

async function buscarPeliculas() {

    const texto =
        document.querySelector("#buscar").value;

    const url =
        `https://api.themoviedb.org/3/search/movie` +
        `?api_key=${API_KEY}` +
        `&query=${encodeURIComponent(texto)}` +
        `&language=es-ES`;

    const response = await fetch(url);

    const data = await response.json();

    mostrarPeliculas(data.results);
}
```

------

# 22. Crear una función reutilizable

Podemos separar la responsabilidad de mostrar las películas:

```javascript
function mostrarPeliculas(peliculas) {

    const contenedor =
        document.querySelector("#peliculas");

    contenedor.innerHTML = "";

    peliculas.forEach(pelicula => {

        contenedor.innerHTML += `
            <div class="pelicula">

                <img
                    src="${URL_IMAGEN}${pelicula.poster_path}"
                    alt="${pelicula.title}"
                >

                <h2>
                    ${pelicula.title}
                </h2>

                <p>
                    ⭐ ${pelicula.vote_average}
                </p>

            </div>
        `;

    });
}
```

Ahora:

```javascript
async function buscarPeliculas() {

    const texto =
        document.querySelector("#buscar").value;

    const url =
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(texto)}&language=es-ES`;

    const response = await fetch(url);

    const data = await response.json();

    mostrarPeliculas(data.results);
}
```

------

# 23. Obtener los detalles de una película

Cada película tiene un:

```javascript
id
```

Ejemplo:

```javascript
pelicula.id
```

Para obtener información detallada utilizamos:

```text
/movie/{movie_id}
```

Por ejemplo:

```text
/movie/157336
```

La petición sería:

```javascript
async function obtenerDetalle(id) {

    const url =
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=es-ES`;

    const response = await fetch(url);

    const pelicula = await response.json();

    console.log(pelicula);
}
```

Podemos llamar:

```javascript
obtenerDetalle(157336);
```

------

# 24. Manejo básico de errores

No deberíamos asumir que todas las solicitudes funcionan correctamente.

Podemos verificar:

```javascript
response.ok
```

Ejemplo:

```javascript
async function obtenerPeliculas() {

    try {

        const response = await fetch(
            `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`
        );

        if (!response.ok) {
            throw new Error(
                `Error HTTP: ${response.status}`
            );
        }

        const data = await response.json();

        mostrarPeliculas(data.results);

    } catch (error) {

        console.error(
            "Error al consultar TMDB:",
            error
        );

    }
}
```

------

# 25. Problema común: API Key incorrecta

Si aparece:

```json
{
    "status_code": 7,
    "status_message":
        "Invalid API key: You must be granted a valid key.",
    "success": false
}
```

significa que TMDB no reconoce la API Key.

Debemos verificar que estamos utilizando:

```text
API Key
```

y no:

```text
API Read Access Token
```

cuando utilizamos:

```text
?api_key=
```

------

# 26. Manejar películas sin póster

No todas las películas tienen:

```javascript
poster_path
```

Por eso conviene validar:

```javascript
const poster = pelicula.poster_path
    ? `${URL_IMAGEN}${pelicula.poster_path}`
    : "sin-imagen.jpg";
```

Luego:

```html
<img src="${poster}">
```

------

# 27. Paginación

TMDB devuelve las películas por páginas.

En el JSON encontramos:

```json
{
    "page": 1,
    "total_pages": 500
}
```

Podemos solicitar otra página:

```text
&page=2
```

Ejemplo:

```javascript
let pagina = 1;

async function obtenerPeliculas() {

    const url =
        `https://api.themoviedb.org/3/movie/popular` +
        `?api_key=${API_KEY}` +
        `&language=es-ES` +
        `&page=${pagina}`;

    const response = await fetch(url);

    const data = await response.json();

    mostrarPeliculas(data.results);
}
```

------

# 28. Botón siguiente página

HTML:

```html
<button id="anterior">
    Anterior
</button>

<button id="siguiente">
    Siguiente
</button>
```

JavaScript:

```javascript
document
    .querySelector("#siguiente")
    .addEventListener("click", () => {

        pagina++;

        obtenerPeliculas();

    });
```

Para retroceder:

```javascript
document
    .querySelector("#anterior")
    .addEventListener("click", () => {

        if (pagina > 1) {

            pagina--;

            obtenerPeliculas();

        }

    });
```

------

# 29. Código completo del proyecto

## index.html

```html
<!DOCTYPE html>
<html lang="es">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0">

    <title>TMDB Movies</title>

    <link
        rel="stylesheet"
        href="style.css">

</head>

<body>

    <h1>🎬 Películas</h1>

    <section>

        <input
            id="buscar"
            type="text"
            placeholder="Buscar película">

        <button id="btnBuscar">
            Buscar
        </button>

    </section>

    <div id="peliculas"></div>

    <div>

        <button id="anterior">
            ← Anterior
        </button>

        <button id="siguiente">
            Siguiente →
        </button>

    </div>

    <script src="app.js"></script>

</body>

</html>
```

------

## app.js

```javascript
const API_KEY = "TU_API_KEY";

const URL_API =
    "https://api.themoviedb.org/3";

const URL_IMAGEN =
    "https://image.tmdb.org/t/p/w500";

let pagina = 1;


async function obtenerPeliculas() {

    try {

        const url =
            `${URL_API}/movie/popular` +
            `?api_key=${API_KEY}` +
            `&language=es-ES` +
            `&page=${pagina}`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }

        const data = await response.json();

        mostrarPeliculas(data.results);

    } catch (error) {

        console.error(error);

    }
}


function mostrarPeliculas(peliculas) {

    const contenedor =
        document.querySelector("#peliculas");

    contenedor.innerHTML = "";

    peliculas.forEach(pelicula => {

        const poster = pelicula.poster_path
            ? `${URL_IMAGEN}${pelicula.poster_path}`
            : "sin-imagen.jpg";

        contenedor.innerHTML += `

            <article class="pelicula">

                <img
                    src="${poster}"
                    alt="${pelicula.title}">

                <h2>
                    ${pelicula.title}
                </h2>

                <p>
                    ⭐
                    ${pelicula.vote_average.toFixed(1)}
                </p>

                <p>
                    ${pelicula.release_date || "Sin fecha"}
                </p>

            </article>

        `;

    });
}


async function buscarPeliculas() {

    const texto =
        document
            .querySelector("#buscar")
            .value
            .trim();

    if (!texto) {
        return;
    }

    try {

        const url =
            `${URL_API}/search/movie` +
            `?api_key=${API_KEY}` +
            `&query=${encodeURIComponent(texto)}` +
            `&language=es-ES`;

        const response = await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Error HTTP ${response.status}`
            );

        }

        const data = await response.json();

        mostrarPeliculas(data.results);

    } catch (error) {

        console.error(error);

    }
}


document
    .querySelector("#btnBuscar")
    .addEventListener(
        "click",
        buscarPeliculas
    );


document
    .querySelector("#siguiente")
    .addEventListener(
        "click",
        () => {

            pagina++;

            obtenerPeliculas();

        }
    );


document
    .querySelector("#anterior")
    .addEventListener(
        "click",
        () => {

            if (pagina > 1) {

                pagina--;

                obtenerPeliculas();

            }

        }
    );


obtenerPeliculas();
```

------

## style.css

```css
body {
    font-family: Arial, sans-serif;
    margin: 30px;
    background: #f5f5f5;
}

h1 {
    text-align: center;
}

section {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-bottom: 30px;
}

input {
    padding: 10px;
    width: 300px;
}

button {
    padding: 10px 20px;
    cursor: pointer;
}

#peliculas {
    display: grid;
    grid-template-columns:
        repeat(auto-fill, minmax(220px, 1fr));
    gap: 25px;
}

.pelicula {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    padding-bottom: 15px;
}

.pelicula img {
    width: 100%;
}

.pelicula h2,
.pelicula p {
    padding: 0 15px;
}
```

------

# 30. Flujo de funcionamiento

La aplicación funciona de la siguiente manera:

```text
Usuario
   ↓
Navegador
   ↓
JavaScript
   ↓
fetch()
   ↓
TMDB API
   ↓
respuesta HTTP
   ↓
JSON
   ↓
response.json()
   ↓
data.results
   ↓
forEach()
   ↓
DOM
   ↓
Tarjetas de películas
```

------

# 31. Conceptos de JavaScript utilizados

Esta práctica permite trabajar varios conceptos importantes.

### Variables

```javascript
const API_KEY = "...";
```

### Funciones

```javascript
function mostrarPeliculas() {

}
```

### Funciones asíncronas

```javascript
async function obtenerPeliculas() {

}
```

### Promesas

```javascript
await fetch(url);
```

### Objetos

```javascript
pelicula.title
```

### Arreglos

```javascript
data.results
```

### Iteración

```javascript
peliculas.forEach(...)
```

### Manipulación del DOM

```javascript
document.querySelector()
```

### Eventos

```javascript
addEventListener()
```

### Template literals

```javascript
`${pelicula.title}`
```

### Manejo de excepciones

```javascript
try {

} catch (error) {

}
```

------

# 32. Ejercicios prácticos

## Ejercicio 1

Mostrar en consola todas las películas populares.

El resultado esperado:

```text
Película 1
Película 2
Película 3
...
```

------

## Ejercicio 2

Mostrar solamente:

- Título.
- Fecha de lanzamiento.
- Calificación.

------

## Ejercicio 3

Mostrar el póster de cada película.

Utilizar:

```text
poster_path
```

------

## Ejercicio 4

Crear tarjetas con:

```text
Póster
Título
Descripción
Calificación
Fecha
```

------

## Ejercicio 5

Crear un buscador que permita escribir:

```text
Batman
```

y consultar:

```text
/search/movie
```

------

## Ejercicio 6

Agregar botones:

```text
Anterior
Siguiente
```

para trabajar con la paginación.

------

## Ejercicio 7

Mostrar un mensaje cuando una película no tenga póster.

Por ejemplo:

```text
Imagen no disponible
```

------

## Ejercicio 8

Crear botones para consultar:

```text
Populares

Mejor calificadas

En cartelera

Próximos estrenos
```

Los endpoints serán:

```text
/movie/popular

/movie/top_rated

/movie/now_playing

/movie/upcoming
```

------

# 33. Reto final

Construir una aplicación denominada:

```text
Movie Explorer
```

La aplicación deberá permitir:

- Ver películas populares.
- Ver películas en cartelera.
- Ver películas mejor calificadas.
- Buscar películas.
- Mostrar póster.
- Mostrar título.
- Mostrar descripción.
- Mostrar calificación.
- Mostrar fecha de estreno.
- Navegar entre páginas.
- Consultar los detalles de una película.
- Manejar errores de conexión.

La estructura propuesta es:

```text
Movie Explorer
│
├── Buscador
│
├── Categorías
│   ├── Populares
│   ├── Cartelera
│   ├── Mejor calificadas
│   └── Próximamente
│
├── Listado de películas
│   └── Tarjetas
│
├── Detalle de película
│
└── Paginación
```

------

# 34. Buenas prácticas

Para ejercicios educativos podemos trabajar con:

```javascript
const API_KEY = "TU_API_KEY";
```

Sin embargo, debemos entender que una API Key escrita directamente en JavaScript ejecutado en el navegador **puede ser observada por el usuario**.

Para una aplicación real sería recomendable utilizar:

```text
Frontend
   ↓
Backend propio
   ↓
TMDB API
```

Por ejemplo:

```text
React
   ↓
Spring Boot / Node.js / .NET
   ↓
TMDB
```

La credencial quedaría almacenada en el servidor y no directamente en el navegador.

------

# 35. Resumen

Para consumir TMDB debemos comprender cinco pasos fundamentales:

```text
1. Obtener la API Key

        ↓

2. Construir la URL

        ↓

3. Realizar fetch()

        ↓

4. Convertir la respuesta a JSON

        ↓

5. Utilizar data.results
```

Ejemplo mínimo:

```javascript
const API_KEY = "TU_API_KEY";

async function peliculas() {

    const response = await fetch(
        `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES`
    );

    const data = await response.json();

    console.log(data.results);
}

peliculas();
```

Y para mostrar el póster:

```javascript
const poster =
    `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
```

Con estos conceptos ya podemos desarrollar una aplicación web completa que consuma una **API REST real utilizando JavaScript, `fetch`, Promesas, `async/await`, JSON, eventos y manipulación del DOM**.