const serverUrl = 'https://amomonika.duckdns.org'
const port = 3000

async function submitLogin(event) {
    event.preventDefault();

    const username = document.querySelector('#loginForm input[type="text"]').value.trim();
    const password = document.querySelector('#loginForm input[type="password"]').value.trim();

    const response = await fetch(`${serverUrl}:${port}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    } 
    else{
        alert(data.message);
    }
}
document.querySelector('#loginForm').addEventListener('submit', submitLogin);

async function submitRegister(event) {
    event.preventDefault();

    const username = document.querySelector('#registerForm input[type="text"]').value.trim();
    const password = document.querySelector('#registerForm input[type="password"]').value.trim();

    const response = await fetch(`${serverUrl}:${port}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    const data = await response.json();
    if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'dashboard.html';
    } 
    else {
        alert(data.message);
    }
}
document.querySelector('#registerForm').addEventListener('submit', submitRegister);

function changeToRegister(){
    document.querySelector('#loginContainer').style.display = 'none';
    document.querySelector('#registerContainer').style.display = 'block';
    document.querySelector('#registerForm input[type="text"]').focus();
}

function changeToLogin(){
    document.querySelector('#loginContainer').style.display = 'block';
    document.querySelector('#registerContainer').style.display = 'none';
    document.querySelector('#loginForm input[type="text"]').focus();
}
