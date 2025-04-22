const user = JSON.parse(localStorage.getItem('user'));
if (!user) {
    console.log('No user found, redirecting to login page...');
    window.location.href = 'login.html';
} else {
    document.querySelector('#usernameDisplay').textContent = user.username;
}

function logOut(){
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}