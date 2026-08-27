/**
 * LÓGICA DE AUTENTICACIÓN (LOGIN Y REGISTRO) - CINEVERSE
 */

const JSON_SERVER_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    inicializarNavegacionAuth();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', manejarLogin);
    }

    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', manejarRegistro);
    }
});

/**
 * Muestra el menú de autenticación en la barra de navegación dependiendo
 * de si el usuario tiene sesión iniciada o no.
 */
function inicializarNavegacionAuth() {
    const authMenu = document.getElementById('authMenu');
    if (!authMenu) return; // Si no existe el contenedor, salir (ej. páginas de auth puras que no tienen navbar completo)

    const userStr = sessionStorage.getItem('cineverse_user');
    
    if (userStr) {
        const user = JSON.parse(userStr);
        // Determinamos si estamos en la raíz o en un subdirectorio para el link correcto
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('Proyecto-JS/');
        const reservasPath = isRoot ? 'pages/mis_reservas.html' : 'mis_reservas.html';

        // Usuario logueado
        authMenu.innerHTML = `
            <div class="profile-dropdown">
                <button class="profile-btn">
                    <i class="fa-solid fa-circle-user"></i>
                    <span>${user.fullName.split(' ')[0]}</span>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.7rem; margin-left: 0.3rem;"></i>
                </button>
                <div class="dropdown-menu">
                    <div class="dropdown-header">
                        <span class="dropdown-name">${user.fullName}</span>
                        <span class="dropdown-email">${user.email}</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="${reservasPath}" class="dropdown-item">
                        <i class="fa-solid fa-ticket"></i> Mis Reservas
                    </a>
                    <div class="dropdown-divider"></div>
                    <button id="btnLogout" class="dropdown-item text-danger">
                        <i class="fa-solid fa-right-from-bracket"></i> Cerrar sesión
                    </button>
                </div>
            </div>
        `;
        
        const profileBtn = authMenu.querySelector('.profile-btn');
        const dropdownMenu = authMenu.querySelector('.dropdown-menu');
        
        profileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!authMenu.contains(e.target)) {
                dropdownMenu.classList.remove('active');
            }
        });
        
        document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
    } else {
        // Usuario invitado
        // Determinamos si estamos en la raíz o en un subdirectorio para el link correcto
        const isRoot = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('Proyecto-JS/');
        const loginPath = isRoot ? 'pages/login.html' : 'login.html';
        
        authMenu.innerHTML = `
            <a href="${loginPath}" class="btn-login-nav">Iniciar Sesión</a>
        `;
    }
}

async function manejarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('authError');

    try {
        const response = await fetch(`${JSON_SERVER_URL}/users?email=${email}&password=${password}`);
        const users = await response.json();

        if (users.length > 0) {
            // Login exitoso
            const user = users[0];
            sessionStorage.setItem('cineverse_user', JSON.stringify({ id: user.id, fullName: user.fullName, email: user.email }));
            window.location.href = '../index.html'; // Redirige al inicio
        } else {
            // Fallo login
            errorMsg.textContent = "Correo o contraseña incorrectos.";
            errorMsg.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        errorMsg.textContent = "Error de conexión con el servidor.";
        errorMsg.classList.remove('hidden');
    }
}

async function manejarRegistro(e) {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('authError');

    if (password !== confirmPassword) {
        errorMsg.textContent = "Las contraseñas no coinciden.";
        errorMsg.classList.remove('hidden');
        return;
    }

    try {
        // Verificar si el correo ya existe
        const checkResponse = await fetch(`${JSON_SERVER_URL}/users?email=${email}`);
        const existingUsers = await checkResponse.json();

        if (existingUsers.length > 0) {
            errorMsg.textContent = "Este correo ya está registrado.";
            errorMsg.classList.remove('hidden');
            return;
        }

        // Crear nuevo usuario
        const newUser = {
            fullName,
            email,
            password // NOTA: En producción esto debe ir encriptado (ej. bcrypt)
        };

        const createResponse = await fetch(`${JSON_SERVER_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUser)
        });

        if (createResponse.ok) {
            const savedUser = await createResponse.json();
            // Iniciar sesión automáticamente
            sessionStorage.setItem('cineverse_user', JSON.stringify({ id: savedUser.id, fullName: savedUser.fullName, email: savedUser.email }));
            window.location.href = '../index.html';
        } else {
            throw new Error("Error al crear usuario");
        }

    } catch (error) {
        console.error("Error en registro:", error);
        errorMsg.textContent = "Error de conexión con el servidor.";
        errorMsg.classList.remove('hidden');
    }
}

function cerrarSesion() {
    sessionStorage.removeItem('cineverse_user');
    window.location.reload();
}
