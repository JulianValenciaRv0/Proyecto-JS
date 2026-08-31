# CineVerse Explorer

Aplicación web responsive para descubrir contenido cinematográfico y simular la gestión de una cartelera de cine. El proyecto consume la API de [The Movie Database (TMDB)](https://www.themoviedb.org/) para obtener información de películas, series, personas y premios, y utiliza JSON Server como API REST local para administrar usuarios, salas, funciones, asientos y reservas.

> Proyecto académico desarrollado con HTML, CSS y JavaScript vanilla para practicar consumo de APIs REST, programación asíncrona, manipulación del DOM y persistencia de datos JSON.

## Contexto del ejercicio

El ejercicio plantea construir una experiencia de cine completa combinando dos fuentes de datos:

- **TMDB:** proporciona títulos, sinopsis, imágenes, reparto, valoraciones, videos y demás información audiovisual.
- **JSON Server:** representa la operación interna del cine, como usuarios, funciones, salas, disponibilidad de asientos y reservas.

La aplicación permite recorrer el catálogo, consultar información detallada y completar el flujo de una reserva seleccionando una función y asientos específicos.

## Objetivos de aprendizaje

- Consumir una API REST mediante `fetch()` y `async/await`.
- Construir interfaces dinámicas manipulando el DOM.
- Implementar búsquedas, filtros, categorías y paginación.
- Gestionar estados de carga y errores de las solicitudes.
- Relacionar datos provenientes de una API externa y una API local.
- Simular autenticación, reservas, compras y actualización de disponibilidad.
- Crear una interfaz adaptable a diferentes tamaños de pantalla.

## Funcionalidades

- Página de inicio con tendencias, contenido popular y recomendaciones.
- Catálogos independientes de películas, series y personas.
- Filtros por categoría y género, búsqueda y paginación.
- Fichas de detalle con sinopsis, reparto, datos técnicos, trailers, imágenes y recomendaciones.
- Sección de premios y nominaciones.
- Registro, inicio y cierre de sesión.
- Consulta de funciones por película, fecha, hora, sala y precio.
- Mapa visual de asientos con estados disponible, seleccionado, reservado y ocupado.
- Creación de reservas o compras simuladas.
- Consulta, pago y cancelación de reservas del usuario.
- Diseño responsive con navegación y componentes reutilizables.

## Tecnologías utilizadas

- HTML5
- CSS3
- JavaScript ES6+
- Fetch API
- [TMDB API v3](https://developer.themoviedb.org/docs/getting-started)
- [JSON Server](https://github.com/typicode/json-server)
- Font Awesome

## Requisitos previos

- [Node.js](https://nodejs.org/) y npm instalados.
- Conexión a Internet para consultar TMDB y cargar recursos externos.
- Una API key de TMDB si se reemplaza la clave suministrada para la práctica.

## Instalación y ejecución

1. Clona el repositorio y entra en su directorio:

   ```bash
   git clone https://github.com/JulianValenciaRv0/Proyecto-JS.git
   cd Proyecto-JS
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Inicia JSON Server y el servidor de archivos estáticos:

   ```bash
   npm run server
   ```

4. Abre en el navegador:

   ```text
   http://localhost:3000
   ```

El servidor debe permanecer activo mientras se utiliza el registro, el inicio de sesión o el módulo de reservas.

## Configuración de TMDB

La configuración se encuentra en `js/config.js`. Para utilizar otra credencial, reemplaza el valor de `API_KEY` por una API key válida de TMDB:

```javascript
const API_KEY = "TU_API_KEY";
```

En un proyecto publicado o de producción, la credencial no debe almacenarse en el código del cliente ni subirse al repositorio. Lo recomendable es consumir TMDB desde un backend y mantener allí la clave como variable de entorno.

## Estructura del proyecto

```text
Proyecto-JS/
├── css/                 # Estilos generales y de reservas
├── js/                  # Consumo de APIs, renderizado y lógica por página
├── media/               # Logotipo y recursos gráficos locales
├── pages/               # Vistas secundarias de la aplicación
├── scripts/             # Utilidades para inicializar datos locales
├── db.json              # Base de datos utilizada por JSON Server
├── index.html           # Página principal
├── GuiaPractTMDB.md     # Guía base de consumo de TMDB
├── CarteleraProject.md  # Especificación del sistema de cartelera
└── package.json         # Dependencias y comandos del proyecto
```

## Datos locales

`db.json` funciona como base de datos de demostración. Contiene la información operativa necesaria para probar el flujo de cartelera: usuarios, funciones, salas, asientos, disponibilidad y reservas.

La autenticación es una simulación con fines educativos: los datos y contraseñas se almacenan sin cifrado en JSON Server y la sesión se conserva en el navegador. No debe utilizarse este enfoque en una aplicación real.

## Flujo básico de uso

1. Explora una película desde el inicio o el catálogo.
2. Abre su ficha de detalles.
3. Regístrate o inicia sesión.
4. Selecciona una función disponible.
5. Escoge uno o varios asientos en el mapa de la sala.
6. Confirma la reserva o la compra simulada.
7. Consulta y administra el resultado desde **Mis reservas**.

## Consideraciones

- Los datos cinematográficos dependen de la disponibilidad de TMDB.
- JSON Server está pensado únicamente como backend local de desarrollo.
- El proyecto no procesa pagos reales.
- No hay una suite de pruebas automatizadas configurada actualmente.

## Autor

**Julián Valencia**

[GitHub](https://github.com/JulianValenciaRv0)

## Reconocimientos

Este producto utiliza la API de TMDB, pero no está respaldado ni certificado por TMDB.

## Licencia

Este repositorio está configurado bajo la licencia ISC. Consulta `package.json` para más información.
