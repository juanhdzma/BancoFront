const API_URL = 'http://ec2-3-137-174-126.us-east-2.compute.amazonaws.com/BancoV1/';

function goHome() {
    window.location.href = '../sites/home.html';
}

function goLogin() {
    window.location.href = '../sites/clienteLogin.html';
}

document.getElementById("register-form").onsubmit = async function (event) {
    event.preventDefault();
    var clientId = document.getElementById("cedula").value;
    var clientPhone = document.getElementById("telefono").value;
    var clientName = document.getElementById("nombre").value;
    var clientLastName = document.getElementById("apellido").value;
    var errorMessage = document.getElementById("error-message");

    // Validate cedula
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
    } //Validate Phone
    else if (clientPhone.trim() === "") {
        errorMessage.textContent = "Por favor ingrese el teléfono del cliente";
        errorMessage.style.color = "red";
        return false;
    } else if (isNaN(clientPhone)) {
        errorMessage.textContent = "Por favor ingrese un teléfono válido";
        errorMessage.style.color = "red";
        return false;
    } else if (parseInt(clientPhone) < 1 || clientPhone.length != 10) {
        errorMessage.textContent = "Por favor ingrese un teléfono válido";
        errorMessage.style.color = "red";
        return false;
    } //Validate Name and LastName
    else if (clientName.trim() === "" || clientLastName.trim() === "") {
        errorMessage.textContent = "Por favor ingrese el nombre y apellido del cliente";
        errorMessage.style.color = "red";
        return false;
    } else if (!isNaN(clientName) || !isNaN(clientLastName)) {
        errorMessage.textContent = "Por favor ingrese un nombre y apellido válido";
        errorMessage.style.color = "red";
        return false;
    } // After validation 
    else {
        const object = {
            id: clientId,
            phone: clientPhone,
            name: clientName,
            last_name: clientLastName
        }
        const isValid = sendCreateRequest(object, errorMessage);
        if (isValid) {
        }
        return isValid;
    }
};

async function sendCreateRequest(object, errorMessage) {
    try {
        const response = await fetch(API_URL + "user/", {
            method: 'POST',
            headers: new Headers({ 'Content-type': 'application/json' }),
            body: JSON.stringify(object)
        });
        const result = await response.json();

        if (response.status == 201) {
            errorMessage.textContent = "Usuario creado correctamente";
            errorMessage.style.color = "green";
            return true;
        } else if (response.status == 409) {
            errorMessage.textContent = "Ya existe un usuario registrado con esa cédula o teléfono";
            errorMessage.style.color = "red";
            return false;
        } else {
            errorMessage.textContent = "Error al crear el usuario";
            errorMessage.style.color = "red";
            return false;
        }
    } catch (error) {
        errorMessage.textContent = "Error al crear el usuario";
        errorMessage.style.color = "red";
        return false;
    }
}