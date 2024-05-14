const API_URL = 'http://ec2-3-137-174-126.us-east-2.compute.amazonaws.com/BancoV1/';

function goHome() {
    window.location.href = '../sites/index.html';
}

function goCreate() {
    window.location.href = '../sites/create.html';
}


async function validateUserInDatabase(clientId, errorMessage) {
    try {
        const response = await fetch(API_URL + "user/" + clientId, {
            headers: new Headers({ 'Content-type': 'application/json' }),
        });
        const result = await response.json();

        if (response.status == 200) {
            errorMessage.textContent = result.data.name + " " + result.data.last_name;
            errorMessage.style.color = "green";
            return true;
        } else if (response.status < 500) {
            errorMessage.textContent = "Cédula no registrada en el sistema";
            errorMessage.style.color = "red";
            return false;
        } else {
            errorMessage.textContent = "Error al consultar la cédula";
            errorMessage.style.color = "red";
            return false;
        }
    } catch (error) {
        errorMessage.textContent = "Error al consultar la cédula";
        errorMessage.style.color = "red";
        return false;
    }
}


document.getElementById("client-form").onsubmit = async function (event) {
    event.preventDefault();
    var clientId = document.getElementById("client-id").value;
    var errorMessage = document.getElementById("error-message");
    if (clientId.trim() === "") {
        errorMessage.textContent = "Por favor ingrese la cédula del cliente";
        errorMessage.style.color = "red";
        return false;
    } else if (isNaN(clientId)) {
        errorMessage.textContent = "Por favor ingrese una cédula válida";
        errorMessage.style.color = "red";
        return false;
    } else if (parseInt(clientId) < 1) {
        errorMessage.textContent = "Por favor ingrese una cédula válida";
        errorMessage.style.color = "red";
        return false;
    }
    else {
        const isValid = validateUserInDatabase(clientId, errorMessage);
        if (isValid) {
            console.log("Llegue bueb");
        }
        return isValid;
    }
};


