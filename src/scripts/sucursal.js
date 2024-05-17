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

document.getElementById("register-form").onsubmit = async function (event) {
    event.preventDefault();
    const clientId = document.getElementById("user_id");
    const accountType = document.querySelector('input[name="account_type"]:checked');
    var errorMessage = document.getElementById("error-message-create");

    // Validate cedula
    if (clientId.value.trim() === "") {
        errorMessage.textContent = "Por favor ingrese la cédula del cliente";
        errorMessage.style.color = "red";
        return false;
    } else if (isNaN(clientId.value)) {
        errorMessage.textContent = "Por favor ingrese una cédula válida";
        errorMessage.style.color = "red";
        return false;
    } else if (parseInt(clientId.value) < 1) {
        errorMessage.textContent = "Por favor ingrese una cédula válida";
        errorMessage.style.color = "red";
        return false;
    } else if (accountType === null) {
        errorMessage.textContent = "Por favor seleccione un tipo de cuenta";
        errorMessage.style.color = "red";
        return false;
    } else {
        const object = {
            user_id: clientId.value,
            account_type: accountType.value
        }
        const responsesJSON = await sendCreateRequest(object, errorMessage);
        if (responsesJSON) {
            showConfirmationPopup("Cuenta creada exitosamente");
            errorMessage.textContent = '';
            clientId.value = '';
            accountType.checked = false;
        }
        return responsesJSON;
    }
};


document.getElementById("consignar-form").onsubmit = async function (event) {
    event.preventDefault();
    const destinationAccount = document.getElementById("destination_account");
    const valueConsigment = document.getElementById("value");
    var errorMessage = document.getElementById("error-message-consignar");

    // Validate cedula
    if (destinationAccount.value.trim() === "") {
        errorMessage.textContent = "Por favor ingrese la cuenta del cliente";
        errorMessage.style.color = "red";
        return false;
    } else if (isNaN(destinationAccount.value)) {
        errorMessage.textContent = "Por favor ingrese una cuenta válida";
        errorMessage.style.color = "red";
        return false;
    } else if (parseInt(destinationAccount.value) < 1) {
        errorMessage.textContent = "Por favor ingrese una cuenta válida";
        errorMessage.style.color = "red";
        return false;
    } else if (valueConsigment.value < 0 || valueConsigment.value === '') {
        errorMessage.textContent = "Por favor ingrese un valor de consignación válido";
        errorMessage.style.color = "red";
        return false;
    } else {
        const object = {
            destination_account: destinationAccount.value,
            value: valueConsigment.value
        }
        const responsesJSON = await sendConsigmentRequest(object, errorMessage);
        if (responsesJSON) {
            showConfirmationPopup("Consignación realizada exitosamente");
            errorMessage.textContent = '';
            destinationAccount.value = '';
            valueConsigment.value = '';
        }
        return responsesJSON;
    }
};

document.getElementById("desactivar-form").onsubmit = async function (event) {
    event.preventDefault();
    const accountID = document.getElementById("cuenta-desactivar");
    var errorMessage = document.getElementById("error-message-deactivate");

    // Validate cedula
    if (accountID.value.trim() === "") {
        errorMessage.textContent = "Por favor ingrese la cuenta del cliente";
        errorMessage.style.color = "red";
        return false;
    } else if (isNaN(accountID.value)) {
        errorMessage.textContent = "Por favor ingrese una cuenta válida";
        errorMessage.style.color = "red";
        return false;
    } else if (parseInt(accountID.value) < 1) {
        errorMessage.textContent = "Por favor ingrese una cuenta válida";
        errorMessage.style.color = "red";
        return false;
    } else {
        const responsesJSON = await sendDeleteRequest(accountID.value, errorMessage);
        console.log(responsesJSON);
        if (responsesJSON) {
            showConfirmationPopup(responsesJSON.data);
            errorMessage.textContent = '';
            accountID.value = '';
        }
        return responsesJSON;
    }
};

async function sendConsigmentRequest(object, errorMessage) {
    try {
        const response = await fetch(API_URL + "consignment", {
            method: 'POST',
            headers: new Headers({ 'Content-type': 'application/json' }),
            body: JSON.stringify(object)
        });
        if (response.status == 200) {
            return true;
        } else if (response.status == 400) {
            errorMessage.textContent = "La cuenta no existe en la base de datos";
            errorMessage.style.color = "red";
            return false;
        } else {
            errorMessage.textContent = "Error al realizar consignación";
            errorMessage.style.color = "red";
            return false;
        }
    } catch (error) {
        errorMessage.textContent = "Error al realizar consignación";
        errorMessage.style.color = "red";
        return false;
    }
}

async function sendCreateRequest(object, errorMessage) {
    try {
        const response = await fetch(API_URL + "account", {
            method: 'POST',
            headers: new Headers({ 'Content-type': 'application/json' }),
            body: JSON.stringify(object)
        });
        if (response.status == 201) {
            return true;
        } else if (response.status == 400) {
            errorMessage.textContent = "El usuario no existe en la base de datos";
            errorMessage.style.color = "red";
            return false;
        } else {
            errorMessage.textContent = "Error al crear cuenta";
            errorMessage.style.color = "red";
            return false;
        }
    } catch (error) {
        errorMessage.textContent = "Error al crear cuenta";
        errorMessage.style.color = "red";
        return false;
    }
}

async function sendDeleteRequest(id, errorMessage) {
    try {
        const response = await fetch(API_URL + "account/" + id, {
            method: 'DELETE',
            headers: new Headers({ 'Content-type': 'application/json' })
        });
        if (response.status == 200) {
            const data = await response.json();
            return data;
        } else if (response.status == 404) {
            errorMessage.textContent = "La cuenta no existe en la base de datos";
            errorMessage.style.color = "red";
            return false;
        } else {
            errorMessage.textContent = "Error al borrar cuenta";
            errorMessage.style.color = "red";
            return false;
        }
    } catch (error) {
        errorMessage.textContent = "Error al borrar cuenta";
        errorMessage.style.color = "red";
        return false;
    }
}

function showConfirmationPopup(message) {
    const popup = document.getElementById("confirmation-popup");
    const popupMessage = document.getElementById("popup-message");
    popup.style.display = "flex";
    popupMessage.textContent = message;
    const continueButton = document.getElementById("continue-button");
    continueButton.onclick = function () {
        popup.style.display = "none";
    };
}

