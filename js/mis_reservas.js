/**
 * LÓGICA DE MIS RESERVAS
 */

document.addEventListener('DOMContentLoaded', async () => {
    const ticketsContainer = document.getElementById('ticketsContainer');
    const userStr = sessionStorage.getItem('cineverse_user');
    
    if (!userStr) {
        // Redirigir si no hay sesión
        window.location.href = '../index.html';
        return;
    }

    const currentUser = JSON.parse(userStr);
    
    try {
        const response = await fetch(`${JSON_SERVER_URL}/reservations?userId=${currentUser.id}&_sort=createdAt&_order=desc`);
        const reservations = await response.json();
        
        if (reservations.length === 0) {
            ticketsContainer.innerHTML = `
                <div class="no-reservations">
                    <i class="fa-solid fa-ticket-simple"></i>
                    <h2>Aún no tienes reservas</h2>
                    <p>¡Explora nuestra cartelera y reserva tus asientos hoy!</p>
                    <a href="../index.html" class="btn-primary" style="margin-top: 1.5rem; display: inline-block; text-decoration: none;">Ver Películas</a>
                </div>
            `;
            return;
        }

        renderTickets(reservations, ticketsContainer);

    } catch (error) {
        console.error('Error fetching reservations:', error);
        ticketsContainer.innerHTML = `
            <div class="no-reservations">
                <i class="fa-solid fa-triangle-exclamation" style="color: #ff4b4b;"></i>
                <h2>Error de conexión</h2>
                <p>No pudimos cargar tus reservas. Verifica tu conexión e inténtalo de nuevo.</p>
            </div>
        `;
    }
});

function renderTickets(reservations, container) {
    container.innerHTML = '';
    
    reservations.forEach(res => {
        const dateObj = new Date(res.createdAt);
        const purchaseDate = dateObj.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
        
        // Simular que el json-server también nos da los detalles de la función, 
        // pero como solo tenemos roomId y functionId en reserva, mostraremos datos básicos
        // Idealmente, se podría hacer un join en la BD o tener la fecha/hora en la reserva.
        // Para este proyecto, mostramos Sala, y la fecha de compra o placeholder.
        
        const seatCodes = res.seats.map(s => s.seatCode).join(', ');
        const ticketId = `CV-${res.id.toString().padStart(5, '0')}`;
        
        const ticketHtml = `
            <div class="ticket-card">
                <div class="ticket-header">
                    <span class="ticket-status"><i class="fa-solid fa-check"></i> ${res.status.toUpperCase()}</span>
                    <h3 class="ticket-title">${res.movieTitle}</h3>
                </div>
                
                <div class="ticket-body">
                    <div class="ticket-info">
                        <div class="info-group">
                            <span class="info-label">Sala</span>
                            <span class="info-value">Sala ${res.roomId}</span>
                        </div>
                        <div class="info-group">
                            <span class="info-label">Cantidad</span>
                            <span class="info-value">${res.quantity} Ticket(s)</span>
                        </div>
                        <div class="info-group">
                            <span class="info-label">Fecha de Compra</span>
                            <span class="info-value">${purchaseDate}</span>
                        </div>
                    </div>
                    
                    <div class="ticket-qr">
                        <i class="fa-solid fa-qrcode"></i>
                        <span>${ticketId}</span>
                    </div>
                </div>
                
                <div class="ticket-footer">
                    <span class="ticket-seats">Asientos: ${seatCodes}</span>
                    <span class="ticket-total">$${res.total.toLocaleString()}</span>
                </div>
            </div>
        `;
        
        container.innerHTML += ticketHtml;
    });
}
