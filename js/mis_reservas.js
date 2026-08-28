/**
 * HISTORIAL DE RESERVAS Y COMPRAS
 * Los registros antiguos con estado "confirmed" se consideran compras.
 */

let profileUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const userStr = sessionStorage.getItem('cineverse_user');
    if (!userStr) {
        window.location.href = '../index.html';
        return;
    }

    profileUser = JSON.parse(userStr);
    await loadBookings();
});

async function loadBookings() {
    const reservedContainer = document.getElementById('reservedTicketsContainer');
    const purchasedContainer = document.getElementById('purchasedTicketsContainer');

    try {
        const response = await fetch(`${JSON_SERVER_URL}/reservations?userId=${profileUser.id}&_sort=createdAt&_order=desc`);
        if (!response.ok) throw new Error('No se pudo consultar el historial');

        const bookings = await response.json();
        const reserved = bookings.filter(booking => booking.status === 'reserved');
        const purchased = bookings.filter(booking => booking.status === 'purchased' || booking.status === 'confirmed');

        document.getElementById('reservedCount').textContent = reserved.length;
        document.getElementById('purchasedCount').textContent = purchased.length;
        renderTickets(reserved, reservedContainer, false);
        renderTickets(purchased, purchasedContainer, true);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        const errorHtml = `
            <div class="no-reservations">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ff4b4b;"></i>
                <h2>Error de conexión</h2>
                <p>No pudimos cargar tus boletas. Verifica que json-server esté activo.</p>
            </div>`;
        reservedContainer.innerHTML = errorHtml;
        purchasedContainer.innerHTML = errorHtml;
    }
}

function renderTickets(bookings, container, isPurchased) {
    if (bookings.length === 0) {
        container.innerHTML = `
            <div class="no-reservations compact-empty">
                <i class="fa-solid ${isPurchased ? 'fa-receipt' : 'fa-clock'}"></i>
                <h3>${isPurchased ? 'Aún no tienes compras' : 'No tienes reservas pendientes'}</h3>
                <p>${isPurchased ? 'Las boletas pagadas aparecerán en esta sección.' : 'Puedes apartar asientos desde cualquier película con funciones disponibles.'}</p>
                ${isPurchased ? '' : '<a href="../index.html" class="btn-primary empty-action">Ver películas</a>'}
            </div>`;
        return;
    }

    container.innerHTML = bookings.map(booking => createTicket(booking, isPurchased)).join('');
}

function createTicket(booking, isPurchased) {
    const createdDate = new Date(booking.createdAt).toLocaleDateString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric'
    });
    const seatCodes = booking.seats.map(seat => seat.seatCode).join(', ');
    const ticketId = `CV-${String(booking.id).padStart(5, '0')}`;
    const roomLabel = booking.roomName || `Sala ${booking.roomId}`;
    const functionLabel = booking.functionDate
        ? `${booking.functionDate} · ${booking.functionTime}`
        : createdDate;

    return `
        <article class="ticket-card ${isPurchased ? 'ticket-purchased' : 'ticket-reserved'}">
            <div class="ticket-header">
                <span class="ticket-status"><i class="fa-solid ${isPurchased ? 'fa-check' : 'fa-clock'}"></i> ${isPurchased ? 'COMPRADA' : 'RESERVADA'}</span>
                <h3 class="ticket-title">${booking.movieTitle}</h3>
            </div>
            <div class="ticket-body">
                <div class="ticket-info">
                    <div class="info-group"><span class="info-label">Sala</span><span class="info-value">${roomLabel}</span></div>
                    <div class="info-group"><span class="info-label">Función</span><span class="info-value">${functionLabel}</span></div>
                    <div class="info-group"><span class="info-label">Cantidad</span><span class="info-value">${booking.quantity} boleta(s)</span></div>
                </div>
                ${isPurchased ? `<div class="ticket-qr"><i class="fa-solid fa-qrcode"></i><span>${ticketId}</span></div>` : ''}
            </div>
            <div class="ticket-footer">
                <span class="ticket-seats">Asientos: ${seatCodes}</span>
                <span class="ticket-total">$${booking.total.toLocaleString()}</span>
            </div>
            ${isPurchased ? '' : `
                <div class="ticket-payment">
                    <p>Los asientos están apartados, pero el pago sigue pendiente.</p>
                    <button class="btn-primary btn-pay-reservation" onclick="payReservation(${booking.id}, this)">Pagar ahora</button>
                </div>`}
        </article>`;
}

window.payReservation = async function(reservationId, button) {
    button.disabled = true;
    button.textContent = 'Procesando pago...';

    try {
        const reservationResponse = await fetch(`${JSON_SERVER_URL}/reservations/${reservationId}`);
        if (!reservationResponse.ok) throw new Error('Reserva no encontrada');
        const reservation = await reservationResponse.json();

        const availabilityResponse = await fetch(`${JSON_SERVER_URL}/functionSeats?functionId=${reservation.functionId}`);
        if (!availabilityResponse.ok) throw new Error('No se pudo consultar los asientos');
        const functionSeats = await availabilityResponse.json();
        const reservedSeatIds = new Set(reservation.seats.map(seat => seat.seatId));
        const seatsToSell = functionSeats.filter(item => reservedSeatIds.has(item.seatId));

        for (const seat of seatsToSell) {
            const seatResponse = await fetch(`${JSON_SERVER_URL}/functionSeats/${seat.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'sold' })
            });
            if (!seatResponse.ok) throw new Error('No se pudo actualizar un asiento');
        }

        const paymentResponse = await fetch(`${JSON_SERVER_URL}/reservations/${reservationId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'purchased', paidAt: new Date().toISOString() })
        });
        if (!paymentResponse.ok) throw new Error('No se pudo registrar el pago');

        await loadBookings();
    } catch (error) {
        console.error('Error paying reservation:', error);
        alert('No fue posible completar el pago. Inténtalo nuevamente.');
        button.disabled = false;
        button.textContent = 'Pagar ahora';
    }
};
