const API_URL = 'http://ec2-3-137-174-126.us-east-2.compute.amazonaws.com/BancoV1/';

function goHome() {
    window.location.href = "../sites/index.html";
}

document.addEventListener("DOMContentLoaded", function () {
    addContentUsers();
});

async function addContentUsers() {
    const tbody = document.getElementById('usuarios-tbody');
    tbody.innerHTML = '';

    const response = await fetch(API_URL + "users", {
        headers: new Headers({ 'Content-type': 'application/json' }),
    });
    const result = await response.json();

    await result.data.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.name}</td>
                    <td>${user.last_name}</td>
                    <td>${user.phone}</td>
                `;
        tbody.appendChild(row);
    });
}