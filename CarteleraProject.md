# SISTEMA WEB PARA LA GESTIÓN DE CARTELERA DE CINE MEDIANTE API TMDB

## 1. Introducción

El presente proyecto tiene como propósito desarrollar un **sitio web para la gestión y consulta de la cartelera de un cine**, mediante tecnologías como HTML5, CSS3 y JavaScript, aplicando conceptos de manipulación del DOM, consumo de APIs REST, programación asíncrona, gestión de datos JSON y diseño responsive.

La aplicación utilizará la **API de The Movie Database (TMDB)** como fuente externa para obtener información cinematográfica, incluyendo títulos, imágenes, géneros, duración, sinopsis, reparto, directores, valoraciones y trailers.

La información operativa propia del cine será administrada mediante **JSON Server**, incluyendo salas, funciones, horarios, precios, disponibilidad de asientos, distribución de sillas, reservas, compras y valoraciones internas.

Adicionalmente, el sistema permitirá que los usuarios seleccionen de manera visual la **silla o asiento específico que desean reservar o comprar**, identificando su ubicación dentro de la sala mediante fila y número.

------

# 2. Objetivo general

Desarrollar una aplicación web responsive para la gestión y consulta de la cartelera de un cine, integrando la API de TMDB para obtener información cinematográfica y utilizando JSON Server para gestionar funciones, salas, distribución de asientos, reservas, compras, disponibilidad y valoraciones.

------

# 3. Objetivos específicos

- Consultar información de películas mediante la API de TMDB.
- Mostrar películas disponibles en cartelera.
- Permitir búsquedas por nombre y género.
- Consultar información detallada de una película.
- Visualizar trailers.
- Consultar horarios y funciones.
- Mostrar las salas asociadas a cada función.
- Mostrar gráficamente la distribución de asientos de cada sala.
- Permitir seleccionar una o varias sillas disponibles.
- Identificar cada asiento mediante fila y número.
- Diferenciar visualmente entre asientos disponibles, seleccionados, reservados y ocupados.
- Permitir reservar asientos específicos.
- Permitir realizar compras simuladas de asientos específicos.
- Actualizar automáticamente la disponibilidad después de una reserva o compra.
- Evitar que dos usuarios puedan seleccionar una silla que ya se encuentre ocupada o reservada.
- Permitir valorar películas.
- Implementar manipulación dinámica del DOM mediante JavaScript.
- Gestionar la información mediante TMDB y JSON Server.

------

# 4. Gestión de salas y ubicación de sillas

Cada función deberá estar asociada con una sala específica.

Cada sala tendrá una distribución determinada de asientos organizada mediante:

- Filas.
- Número de silla.
- Tipo de silla.
- Ubicación.
- Estado.

Por ejemplo, una sala podrá contener las siguientes filas:

```text
                PANTALLA
         ─────────────────────

Fila A     A1 A2 A3 A4 A5 A6 A7 A8
Fila B     B1 B2 B3 B4 B5 B6 B7 B8
Fila C     C1 C2 C3 C4 C5 C6 C7 C8
Fila D     D1 D2 D3 D4 D5 D6 D7 D8
Fila E     E1 E2 E3 E4 E5 E6 E7 E8
Fila F     F1 F2 F3 F4 F5 F6 F7 F8
```

Cada asiento deberá tener un identificador único.

Ejemplo:

```json
{
  "id": 15,
  "roomId": 1,
  "row": "C",
  "number": 4,
  "seatCode": "C4",
  "location": "Centro",
  "type": "standard"
}
```

La propiedad `location` podrá utilizar valores como:

- Izquierda.
- Centro.
- Derecha.
- Frontal.
- Media.
- Posterior.

Esto permitirá informar al usuario sobre la ubicación aproximada de la silla dentro de la sala.

------

# 5. Estados de las sillas

El sistema deberá gestionar diferentes estados de los asientos.

## Disponible

La silla puede ser seleccionada.

## Seleccionada

La silla ha sido seleccionada temporalmente por el usuario antes de confirmar.

## Reservada

La silla pertenece a una reserva confirmada.

## Ocupada o vendida

La silla ya fue adquirida mediante una compra.

La interfaz deberá utilizar diferentes colores o estilos para identificar cada estado.

Por ejemplo:

- Verde: disponible.
- Amarillo o azul: seleccionada.
- Naranja: reservada.
- Rojo o gris: ocupada.

La interfaz deberá incluir una leyenda para que el usuario pueda comprender fácilmente cada estado.

------

# 6. Requerimientos funcionales actualizados

## RF-01. Visualización de cartelera

El sistema deberá mostrar las películas disponibles actualmente en el cine.

La información cinematográfica será obtenida mediante TMDB.

------

## RF-02. Búsqueda de películas

El usuario podrá buscar películas por nombre o género.

------

## RF-03. Consulta de información detallada

El usuario podrá consultar información como:

- Título.
- Poster.
- Sinopsis.
- Género.
- Duración.
- Fecha de estreno.
- Director.
- Protagonistas.
- Reparto.
- Trailer.
- Valoración.
- Funciones disponibles.

------

## RF-04. Consulta de funciones

El usuario podrá consultar las funciones disponibles para una película.

Cada función deberá mostrar:

- Fecha.
- Hora.
- Sala.
- Precio.
- Cantidad de asientos disponibles.

------

## RF-05. Selección de función

Antes de iniciar una reserva o compra, el usuario deberá seleccionar una función específica.

La selección de función determinará:

- Película.
- Sala.
- Fecha.
- Hora.
- Precio.
- Asientos disponibles.

------

## RF-06. Visualización del mapa de sillas

Una vez seleccionada una función, el sistema deberá mostrar gráficamente la distribución de las sillas correspondientes a la sala.

El mapa deberá indicar claramente:

- Ubicación de la pantalla.
- Filas.
- Número de cada asiento.
- Asientos disponibles.
- Asientos seleccionados.
- Asientos reservados.
- Asientos vendidos.

El mapa deberá generarse dinámicamente mediante JavaScript y manipulación del DOM.

------

## RF-07. Selección de silla

El usuario deberá seleccionar explícitamente una o varias sillas antes de realizar una reserva o compra.

Cada silla deberá identificarse mediante:

**Fila + Número**

Ejemplos:

- A1.
- A2.
- B5.
- C7.
- D10.

Cuando el usuario seleccione una silla, esta deberá cambiar visualmente de estado.

------

## RF-08. Información de ubicación de la silla

Cuando se seleccione una silla, el sistema deberá informar al usuario su ubicación.

Ejemplo:

```text
Silla seleccionada: C5
Fila: C
Número: 5
Ubicación: Centro de la sala
```

Si se seleccionan varias sillas:

```text
Sillas seleccionadas:
C5 - Centro
C6 - Centro
C7 - Centro
```

------

## RF-09. Selección de múltiples sillas

El sistema deberá permitir seleccionar varias sillas en una misma operación.

La cantidad de sillas seleccionadas deberá corresponder con la cantidad de tickets.

Por ejemplo:

```text
Cantidad de tickets: 3

Sillas:
C5
C6
C7
```

No deberá ser posible confirmar una compra o reserva de tres tickets si solamente se han seleccionado dos sillas.

------

## RF-10. Reserva de tickets y sillas

El sistema deberá permitir realizar una reserva asociada a una función y a sillas específicas.

El usuario deberá proporcionar:

- Nombre.
- Correo electrónico.
- Película.
- Función.
- Cantidad de tickets.
- Sillas seleccionadas.

Antes de confirmar la reserva, el sistema deberá volver a validar que todas las sillas continúen disponibles.

------

## RF-11. Registro de reserva

La reserva deberá almacenar información similar a:

```json
{
  "id": 1,
  "userName": "Juan Pérez",
  "email": "juan@email.com",
  "tmdbId": 157336,
  "functionId": 1,
  "roomId": 2,
  "quantity": 2,
  "seats": [
    {
      "seatId": 21,
      "seatCode": "C5",
      "location": "Centro"
    },
    {
      "seatId": 22,
      "seatCode": "C6",
      "location": "Centro"
    }
  ],
  "status": "confirmed"
}
```

------

## RF-12. Compra de tickets

El usuario deberá seleccionar obligatoriamente las sillas antes de realizar una compra.

El sistema mostrará un resumen con:

- Película.
- Sala.
- Fecha.
- Hora.
- Sillas.
- Cantidad de tickets.
- Precio unitario.
- Total.

Ejemplo:

```text
Película: Interestelar
Sala: Sala 2
Función: 6:30 p. m.

Sillas:
C5
C6

Cantidad: 2
Precio unitario: $18.000
Total: $36.000
```

------

## RF-13. Validación de sillas

Antes de confirmar una reserva o compra, el sistema deberá validar que:

- Se haya seleccionado una función.
- Se haya seleccionado al menos una silla.
- Las sillas seleccionadas estén disponibles.
- Ninguna silla esté reservada.
- Ninguna silla esté vendida.
- La cantidad de tickets coincida con la cantidad de sillas seleccionadas.

------

## RF-14. Actualización de estado

Después de una reserva, los asientos deberán cambiar a estado:

```text
reserved
```

Después de una compra, deberán cambiar a:

```text
sold
```

Estos estados deberán persistirse mediante JSON Server.

------

## RF-15. Prevención de doble reserva

El sistema no deberá permitir que una silla asociada con una función sea reservada o vendida más de una vez.

Antes de confirmar una operación, se deberá realizar nuevamente una consulta de disponibilidad.

------

# 7. Modelo de datos para salas

JSON Server deberá almacenar las salas disponibles.

Ejemplo:

```json
{
  "id": 1,
  "name": "Sala 1",
  "rows": 6,
  "seatsPerRow": 8,
  "capacity": 48
}
```

------

# 8. Modelo de datos para sillas

Los asientos físicos podrán almacenarse de la siguiente manera:

```json
{
  "id": 1,
  "roomId": 1,
  "row": "A",
  "number": 1,
  "seatCode": "A1",
  "location": "Frontal izquierda",
  "type": "standard"
}
```

Otro ejemplo:

```json
{
  "id": 20,
  "roomId": 1,
  "row": "C",
  "number": 4,
  "seatCode": "C4",
  "location": "Centro",
  "type": "standard"
}
```

------

# 9. Disponibilidad de asiento por función

La disponibilidad no deberá establecerse únicamente sobre la silla física, debido a que una misma silla puede encontrarse ocupada en una función y disponible en otra.

Por esta razón, se recomienda crear una colección denominada:

```text
functionSeats
```

Ejemplo:

```json
{
  "id": 1,
  "functionId": 3,
  "seatId": 20,
  "status": "available"
}
```

Cuando sea reservada:

```json
{
  "id": 1,
  "functionId": 3,
  "seatId": 20,
  "status": "reserved"
}
```

Cuando sea vendida:

```json
{
  "id": 1,
  "functionId": 3,
  "seatId": 20,
  "status": "sold"
}
```

De esta forma, la silla `C4` puede encontrarse ocupada en la función de las 6:30 p. m. pero disponible en la función de las 9:00 p. m.

------

# 10. Estructura actualizada de JSON Server

El archivo `db.json` deberá contemplar las siguientes colecciones:

```json
{
  "billboard": [],
  "functions": [],
  "rooms": [],
  "seats": [],
  "functionSeats": [],
  "reservations": [],
  "purchases": [],
  "ratings": []
}
```

------

# 11. Relación entre los datos

La estructura general será:

```text
TMDB
 │
 │ tmdbId
 ▼
Película en cartelera
 │
 ▼
Función
 │
 ├──────────────► Sala
 │                  │
 │                  ▼
 │                Sillas
 │
 ▼
Disponibilidad por función
(functionSeats)
 │
 ├──────────────► Reserva
 │
 └──────────────► Compra
```

La relación puede representarse de la siguiente manera:

```text
Película
   │
   └── Función
          │
          └── Sala
                 │
                 ├── A1
                 ├── A2
                 ├── A3
                 ├── B1
                 ├── B2
                 └── B3
```

Cada función mantendrá independientemente el estado de cada asiento.

------

# 12. Interfaz para seleccionar las sillas

La aplicación deberá incluir una interfaz visual similar a:

```text
                  PANTALLA
        ─────────────────────────

        A1  A2  A3     A4  A5  A6
        B1  B2  B3     B4  B5  B6
        C1  C2  C3     C4  C5  C6
        D1  D2  D3     D4  D5  D6
        E1  E2  E3     E4  E5  E6
```

Cada asiento deberá ser un elemento interactivo generado mediante JavaScript.

Por ejemplo:

```html
<button class="seat available" data-seat-id="15">
  C5
</button>
```

JavaScript deberá detectar el evento:

```javascript
seat.addEventListener("click", selectSeat);
```

------

# 13. Leyenda de asientos

La interfaz deberá mostrar una leyenda:

```text
🟢 Disponible
🔵 Seleccionado
🟠 Reservado
🔴 Ocupado
```

Los colores utilizados deberán mantener suficiente contraste y no deberán ser el único mecanismo utilizado para identificar el estado.

También deberán utilizarse clases CSS, textos, atributos o iconografía apropiada.

------

# 14. Resumen antes de confirmar

Antes de confirmar una reserva o compra, el sistema deberá mostrar un resumen de la operación.

Ejemplo:

```text
--------------------------------
RESUMEN DE LA RESERVA
--------------------------------

Película: Interestelar
Sala: Sala 2
Fecha: 25/08/2026
Hora: 6:30 p. m.

Sillas seleccionadas:
C5 - Centro
C6 - Centro

Cantidad de tickets: 2

Precio por ticket: $18.000
Total: $36.000

[Confirmar reserva]
[Cancelar]
```

------

# 15. Flujo de reserva actualizado

El proceso deberá seguir el siguiente flujo:

```text
Seleccionar película
        ↓
Seleccionar función
        ↓
Consultar sala
        ↓
Cargar mapa de asientos
        ↓
Consultar disponibilidad
        ↓
Seleccionar silla(s)
        ↓
Validar disponibilidad
        ↓
Ingresar datos personales
        ↓
Mostrar resumen
        ↓
Confirmar reserva
        ↓
Guardar reserva
        ↓
Actualizar silla(s) a "reserved"
        ↓
Mostrar confirmación
```

------

# 16. Flujo de compra actualizado

```text
Seleccionar película
        ↓
Seleccionar función
        ↓
Seleccionar sala
        ↓
Visualizar mapa de sillas
        ↓
Seleccionar silla(s)
        ↓
Validar disponibilidad
        ↓
Calcular cantidad
        ↓
Calcular precio
        ↓
Mostrar resumen
        ↓
Confirmar compra
        ↓
Registrar compra
        ↓
Actualizar silla(s) a "sold"
        ↓
Mostrar ticket/confirmación
```

------

# 17. Requerimiento de diseño responsive

El mapa de asientos deberá adaptarse correctamente a diferentes dispositivos.

En computadores podrá mostrarse la distribución completa de la sala.

En dispositivos móviles deberá:

- Reducir adecuadamente el tamaño de los asientos.
- Mantener visible la identificación de cada silla.
- Permitir desplazamiento horizontal si la sala contiene una gran cantidad de columnas.
- Mantener botones suficientemente grandes para interacción táctil.
- Permitir seleccionar y deseleccionar sillas fácilmente.

------

# 18. Manejo mediante DOM

El mapa de sillas deberá construirse dinámicamente mediante JavaScript.

El sistema deberá:

1. Consultar las sillas asociadas a la sala.
2. Consultar sus estados para la función seleccionada.
3. Crear los elementos HTML.
4. Agruparlos por fila.
5. Aplicar clases según su estado.
6. Registrar eventos `click`.
7. Mantener una lista de sillas seleccionadas.
8. Actualizar el resumen de compra o reserva en tiempo real.

Un arreglo de selección podrá manejarse mediante:

```javascript
const selectedSeats = [];
```

Cuando el usuario seleccione una silla, esta deberá agregarse al arreglo.

Cuando vuelva a seleccionarla, deberá eliminarse.

------

# 19. Resultado esperado

Con esta modificación, el sistema permitirá que una reserva o compra represente de forma más cercana el funcionamiento real de un cine.

El usuario no solamente seleccionará una cantidad de tickets, sino que deberá indicar exactamente **qué silla desea ocupar y dónde se encuentra ubicada dentro de la sala**.

Por ejemplo:

```text
Película: Dune
Función: 8:00 p. m.
Sala: 3
Tickets: 3

Ubicaciones:
D5 - Centro
D6 - Centro
D7 - Centro
```

La aplicación deberá mantener sincronizada esta información con JSON Server para evitar conflictos entre reservas y compras.

Esta funcionalidad permitirá demostrar de forma más completa conocimientos relacionados con manipulación del DOM, eventos, arreglos, objetos JSON, relaciones entre datos, operaciones HTTP, validaciones y actualización dinámica de interfaces web.