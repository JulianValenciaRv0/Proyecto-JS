const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../db.json');

// Leer db.json actual
const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// 1. Crear Salas
const rooms = [
  { id: 1, name: "Sala 1 (3D)", rows: 6, seatsPerRow: 8, capacity: 48 },
  { id: 2, name: "Sala 2 (VIP)", rows: 4, seatsPerRow: 6, capacity: 24 },
  { id: 3, name: "Sala 3 (Estandar)", rows: 6, seatsPerRow: 8, capacity: 48 }
];

// 2. Crear Asientos
const seats = [];
let seatId = 1;
const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

rooms.forEach(room => {
  for (let r = 0; r < room.rows; r++) {
    for (let c = 1; c <= room.seatsPerRow; c++) {
      let location = "Centro";
      if (c <= 2) location = "Izquierda";
      if (c >= room.seatsPerRow - 1) location = "Derecha";
      if (r === 0) location += " - Frontal";
      if (r === room.rows - 1) location += " - Posterior";

      seats.push({
        id: seatId++,
        roomId: room.id,
        row: rowLetters[r],
        number: c,
        seatCode: `${rowLetters[r]}${c}`,
        location: location,
        type: room.name.includes("VIP") ? "vip" : "standard"
      });
    }
  }
});

// 3. Crear Funciones para películas populares (IDs de TMDB)
// 533535: Deadpool & Wolverine
// 1022789: Inside Out 2
// 519182: Despicable Me 4
// 718821: Twisters
// 1226578: Longlegs
// 1083381: La señal del apocalipsis (maybe)
const movieIds = [533535, 1022789, 519182, 718821, 1226578, 969681, 1368337, 1288445, 1323244, 1621552, 1084244, 1339713, 1108427, 634649, 1315772];
const functions = [];
const functionSeats = [];
let functionId = 1;
let functionSeatId = 1;

// Fechas para hoy y mañana
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const formatDate = (date) => date.toISOString().split('T')[0];

movieIds.forEach((movieId, index) => {
  // Asignar una o dos salas por película
  const room1 = rooms[index % 3];
  const room2 = rooms[(index + 1) % 3];

  // Función 1 (Hoy, tarde)
  functions.push({
    id: functionId,
    movieId: movieId,
    roomId: room1.id,
    date: formatDate(today),
    time: "15:00",
    price: room1.name.includes("VIP") ? 25000 : 15000
  });

  // Función 2 (Hoy, noche)
  functions.push({
    id: functionId + 1,
    movieId: movieId,
    roomId: room2.id,
    date: formatDate(today),
    time: "20:30",
    price: room2.name.includes("VIP") ? 25000 : 15000
  });

  // Función 3 (Mañana, noche)
  functions.push({
    id: functionId + 2,
    movieId: movieId,
    roomId: room1.id,
    date: formatDate(tomorrow),
    time: "18:00",
    price: room1.name.includes("VIP") ? 25000 : 15000
  });

  functionId += 3;
});

// 4. Crear functionSeats (Disponibilidad de asientos por función)
// Inicialmente todos están 'available' (libres)
functions.forEach(func => {
  const roomSeats = seats.filter(s => s.roomId === func.roomId);
  roomSeats.forEach(seat => {
    functionSeats.push({
      id: functionSeatId++,
      functionId: func.id,
      seatId: seat.id,
      status: 'available'
    });
  });
});

db.rooms = rooms;
db.seats = seats;
db.functions = functions;
db.functionSeats = functionSeats;

fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));

console.log('✅ Base de datos inicializada correctamente con salas, asientos y funciones.');
