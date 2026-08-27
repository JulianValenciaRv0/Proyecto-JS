/**
 * LÓGICA DEL SISTEMA DE RESERVAS (CARTELERA)
 */

const API_JSON_SERVER = 'http://localhost:3000';

// Elementos del DOM
const reservaHeader = document.getElementById('reservaHeader');
const functionsContainer = document.getElementById('functionsContainer');
const stepSeats = document.getElementById('step-seats');
const seatMap = document.getElementById('seatMap');
const currentRoomName = document.getElementById('currentRoomName');
const stepCheckout = document.getElementById('step-checkout');
const checkoutForm = document.getElementById('checkoutForm');
const userNameInput = document.getElementById('userName');
const userEmailInput = document.getElementById('userEmail');
const btnConfirmReservation = document.getElementById('btnConfirmReservation');
const successModal = document.getElementById('successModal');

// Elementos del Resumen
const sumFunction = document.getElementById('sumFunction');
const sumSeats = document.getElementById('sumSeats');
const sumQuantity = document.getElementById('sumQuantity');
const sumTotal = document.getElementById('sumTotal');

// Estado de la Reserva
let movieData = null;
let currentFunction = null;
let currentRoom = null;
let functionSeatsData = []; // Array of { seatId, status, functionSeatId }
let selectedSeats = []; // Array of seat objects
let currentUser = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Verificar si hay usuario logueado
    const sessionStr = sessionStorage.getItem('cineverse_user');
    if (sessionStr) {
        currentUser = JSON.parse(sessionStr);
        userNameInput.value = currentUser.fullName;
        userEmailInput.value = currentUser.email;
    }

    // 2. Obtener tmdbId de la URL
    const params = new URLSearchParams(window.location.search);
    const tmdbId = params.get('tmdbId');

    if (!tmdbId) {
        reservaHeader.innerHTML = '<div style="text-align:center; padding: 2rem;"><h3>No se especificó ninguna película.</h3></div>';
        return;
    }

    // 3. Cargar info de la película desde TMDB
    try {
        movieData = await obtenerDatosAPI(`/movie/${tmdbId}`);
        if (movieData) {
            renderHeader(movieData);
        } else {
            throw new Error("Película no encontrada");
        }
    } catch (error) {
        reservaHeader.innerHTML = '<div style="text-align:center; padding: 2rem;"><h3>Error al cargar los datos de la película.</h3></div>';
        return;
    }

    // 4. Cargar funciones disponibles desde json-server
    await loadFunctions(tmdbId);
});

// ==========================================
// RENDERIZADO DEL HEADER
// ==========================================
function renderHeader(movie) {
    const posterUrl = movie.poster_path ? `${URL_IMAGEN}${movie.poster_path}` : URL_PLACEHOLDER;
    const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : '';
    
    reservaHeader.innerHTML = `
        <div class="reserva-header-content">
            <img src="${posterUrl}" alt="${movie.title}" class="reserva-header-poster">
            <div style="flex:1;">
                <h1 style="font-size: 2rem; margin-bottom: 0.5rem; color: white;">
                    ${movie.title} <span style="font-weight:400; opacity:0.8;">(${releaseYear})</span>
                </h1>
                <p style="color: var(--text-muted); line-height: 1.5; max-width: 800px;">
                    ${movie.overview.substring(0, 150)}...
                </p>
            </div>
        </div>
    `;
}

// ==========================================
// PASO 1: FUNCIONES
// ==========================================
async function loadFunctions(movieId) {
    try {
        const response = await fetch(`${API_JSON_SERVER}/functions?movieId=${movieId}&_expand=room`);
        const functions = await response.json();

        if (functions.length === 0) {
            functionsContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align:center; padding: 2rem; background: rgba(255,255,255,0.05); border-radius: 8px;">
                    <h3>No hay funciones programadas para esta película.</h3>
                    <p style="color:var(--text-muted); margin-top: 10px;">Intenta explorar otra película en cartelera.</p>
                </div>
            `;
            return;
        }

        functionsContainer.innerHTML = functions.map(f => `
            <div class="function-card" data-id="${f.id}" onclick="selectFunction(${f.id})">
                <div class="func-time">${f.time}</div>
                <div class="func-details">
                    <p><strong>${f.room.name}</strong></p>
                    <p>📅 ${f.date}</p>
                    <p style="color:var(--neon-cyan); margin-top:5px; font-weight:bold;">$${f.price.toLocaleString()}</p>
                </div>
            </div>
        `).join('');

        // Guardar funciones localmente
        window.movieFunctions = functions;

    } catch (error) {
        console.error("Error cargando funciones:", error);
        functionsContainer.innerHTML = '<p>Error al cargar funciones del servidor.</p>';
    }
}

window.selectFunction = async function(functionId) {
    // UI Update
    document.querySelectorAll('.function-card').forEach(c => c.classList.remove('selected'));
    document.querySelector(`.function-card[data-id="${functionId}"]`).classList.add('selected');

    // Set state
    currentFunction = window.movieFunctions.find(f => f.id === functionId);
    currentRoom = currentFunction.room;
    currentRoomName.innerText = `- ${currentRoom.name}`;

    // Reset seats
    selectedSeats = [];
    updateSummary();

    // Enable step 2
    stepSeats.classList.remove('disabled');
    
    // Smooth scroll to step 2
    stepSeats.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Load seat map
    await loadSeatMap(currentFunction.id, currentRoom.id);
};

// ==========================================
// PASO 2: MAPA DE ASIENTOS
// ==========================================
async function loadSeatMap(functionId, roomId) {
    seatMap.innerHTML = '<div style="text-align:center; padding:2rem;">Cargando mapa...</div>';
    
    try {
        // Obtener la estructura de las sillas
        const responseSeats = await fetch(`${API_JSON_SERVER}/seats?roomId=${roomId}`);
        const seats = await responseSeats.json();

        // Obtener el estado de disponibilidad para esta función específica
        const responseAvailability = await fetch(`${API_JSON_SERVER}/functionSeats?functionId=${functionId}`);
        const availability = await responseAvailability.json();

        renderSeatMap(seats, availability);
        stepCheckout.classList.remove('disabled');
    } catch (error) {
        console.error("Error cargando el mapa de asientos:", error);
        seatMap.innerHTML = '<p>Error al cargar mapa.</p>';
    }
}

function renderSeatMap(seats, availability) {
    seatMap.innerHTML = '';
    functionSeatsData = availability;

    // Agrupar por fila (A, B, C...)
    const rows = {};
    seats.forEach(s => {
        if (!rows[s.row]) rows[s.row] = [];
        rows[s.row].push(s);
    });

    Object.keys(rows).sort().forEach(rowKey => {
        const rowSeats = rows[rowKey].sort((a,b) => a.number - b.number);
        
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        // Etiqueta de la fila
        const label = document.createElement('div');
        label.className = 'seat-row-label';
        label.innerText = rowKey;
        rowDiv.appendChild(label);

        // Asientos
        rowSeats.forEach(seat => {
            const seatDiv = document.createElement('div');
            
            // Determinar estado actual
            const availRecord = availability.find(a => a.seatId === seat.id);
            const status = availRecord ? availRecord.status : 'available';

            seatDiv.className = `seat ${status}`;
            seatDiv.innerText = seat.number;
            seatDiv.dataset.seatObj = JSON.stringify({
                ...seat,
                functionSeatId: availRecord ? availRecord.id : null
            });

            if (status === 'available') {
                seatDiv.addEventListener('click', toggleSeat);
            }

            rowDiv.appendChild(seatDiv);
        });

        // Etiqueta de la fila derecha
        const labelRight = document.createElement('div');
        labelRight.className = 'seat-row-label';
        labelRight.innerText = rowKey;
        rowDiv.appendChild(labelRight);

        seatMap.appendChild(rowDiv);
    });
}

function toggleSeat(event) {
    const seatEl = event.target;
    const seatData = JSON.parse(seatEl.dataset.seatObj);

    if (seatEl.classList.contains('selected')) {
        // Deseleccionar
        seatEl.classList.remove('selected');
        selectedSeats = selectedSeats.filter(s => s.id !== seatData.id);
    } else {
        // Seleccionar
        seatEl.classList.add('selected');
        selectedSeats.push(seatData);
    }

    updateSummary();
}

// ==========================================
// PASO 3: RESUMEN Y CHECKOUT
// ==========================================
function updateSummary() {
    if (!currentFunction) return;

    const count = selectedSeats.length;
    const total = count * currentFunction.price;

    sumFunction.innerText = `${currentFunction.date} - ${currentFunction.time} (${currentRoom.name})`;
    sumSeats.innerText = count > 0 ? selectedSeats.map(s => s.seatCode).join(', ') : 'Ninguno';
    sumQuantity.innerText = count;
    sumTotal.innerText = `$${total.toLocaleString()}`;

    btnConfirmReservation.disabled = count === 0;
}

btnConfirmReservation.addEventListener('click', async () => {
    if (!currentUser) {
        alert("Debes iniciar sesión para realizar una reserva.");
        // Opcional: Redirigir al login
        window.location.href = '../pages/login.html';
        return;
    }

    if (selectedSeats.length === 0) return;
    
    // Prevenir doble clic
    btnConfirmReservation.disabled = true;
    btnConfirmReservation.innerText = 'Procesando...';

    const userId = currentUser.id;

    // 1. Crear el registro de la Reserva
    const reservationData = {
        userId: userId,
        userName: userNameInput.value,
        email: userEmailInput.value,
        movieId: currentFunction.movieId,
        movieTitle: movieData.title,
        functionId: currentFunction.id,
        roomId: currentRoom.id,
        quantity: selectedSeats.length,
        total: selectedSeats.length * currentFunction.price,
        seats: selectedSeats.map(s => ({
            seatId: s.id,
            seatCode: s.seatCode,
            location: s.location
        })),
        status: 'confirmed',
        createdAt: new Date().toISOString()
    };

    try {
        const res = await fetch(`${API_JSON_SERVER}/reservations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservationData)
        });

        if (!res.ok) throw new Error("Error al guardar reserva");

        // 2. Actualizar estado de asientos (cambiar a 'reserved')
        for (const seat of selectedSeats) {
            if (seat.functionSeatId) {
                await fetch(`${API_JSON_SERVER}/functionSeats/${seat.functionSeatId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'reserved' })
                });
            }
        }

        // 3. Mostrar Modal de Éxito
        successModal.classList.remove('hidden');

    } catch (error) {
        console.error(error);
        alert("Ocurrió un error al procesar tu reserva. Inténtalo de nuevo.");
        btnConfirmReservation.disabled = false;
        btnConfirmReservation.innerText = 'Confirmar Reserva';
    }
});
