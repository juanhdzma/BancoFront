function getJsonFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const data = urlParams.get('data');
    return data ? JSON.parse(data) : null;
}

const jsonData = getJsonFromUrl();
const API_URL = 'http://ec2-3-137-174-126.us-east-2.compute.amazonaws.com/BancoV1/';
const accounts = [];
let accountsInfo;
let balance = 0;

function goHome() {
    window.location.href = "../sites/index.html";
}

document.addEventListener("DOMContentLoaded", async function () {
    accountsInfo = await getUserAccounts();
    if (accountsInfo === null) {
        return noAccountsMessage();
    }
    await fillAccountData();
    await fillRecordData();

    document.getElementById("main-container").style.display = 'block';
});

async function getUserAccounts() {
    const response = await fetch(API_URL + "accounts/" + jsonData.id, {
        headers: new Headers({ 'Content-type': 'application/json' }),
    });
    if (response.status == 200) {
        const result = (await response.json()).data;
        return result;
    } else {
        return null;
    }
}

function noAccountsMessage() {
    document.getElementById("main-container").style.display = 'none';
    document.querySelectorAll('.notFound').forEach(element => Object.assign(element.style, { display: 'inline' }));
}

async function fillAccountData() {
    const tbody = document.getElementById('accounts-tb');
    const select = document.getElementById("options");
    tbody.innerHTML = '';

    accountsInfo.forEach(account => {
        balance += account.balance;
        accounts.push(account.id);

        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${account.id}</td>
                    <td>${account.account_type}</td>
                    <td>${formatCurrency(account.balance)}</td>
                `;
        tbody.appendChild(row);

        var opt = document.createElement("option");
        opt.value = account.id;
        opt.textContent = "Cuenta #" + account.id;
        select.appendChild(opt);
    });

    document.getElementById('balance').innerHTML = formatCurrency(balance);
    document.getElementById('name').innerHTML = jsonData.name + " " + jsonData.last_name;
    document.getElementById('phone').innerHTML = formatPhone(jsonData.phone);
    document.getElementById('cedula').innerHTML = "C.C. " + jsonData.id;
}

async function fillRecordData() {
    const tmpRecord = [];
    let record;

    const fetchPromises = accounts.map(async id => {
        const response = await fetch(API_URL + "record/" + id, {
            headers: new Headers({ 'Content-type': 'application/json' }),
        });
        if (response.status == 200) {
            const result = await response.json();
            tmpRecord.push(result.data);
        }
    });

    await Promise.all(fetchPromises).then(() => {
        record = tmpRecord.reduce((acc, val) => acc.concat(val), []);
        record.sort((a, b) => new Date(b.transaction_datetime) - new Date(a.transaction_datetime));

        const removeDuplicates = (array, key) => {
            const map = new Map();
            array.forEach(item => map.set(item[key], item));
            return Array.from(map.values());
        };

        record = removeDuplicates(record, 'id');
    });

    if (record.length === 0) {
        document.querySelectorAll('.table-wrapper-full .notFoundImage').forEach(element => Object.assign(element.style, { display: 'flex' }));
        document.querySelectorAll('.noRecordMessage').forEach(element => Object.assign(element.style, { display: 'flex' }));
        document.getElementById('history-table').style.display = 'none';
    } else {
        const tbody = document.getElementById('history-tb');
        tbody.innerHTML = '';

        record.forEach(record => {
            const row = document.createElement('tr');
            const sourceAccount = record.source_account ? record.source_account : 'Sucursal';
            const formattedDate = formatDate(record.transaction_datetime);

            let valueColor = 'black';
            const isSourceInAccounts = accounts.includes(record.source_account);
            const isDestinationInAccounts = accounts.includes(record.destination_account);

            if (isSourceInAccounts && !isDestinationInAccounts) {
                valueColor = 'red';
            } else if (!isSourceInAccounts && isDestinationInAccounts) {
                valueColor = 'green';
            }

            row.innerHTML = `
                    <td>${record.id}</td>
                    <td>${formattedDate}</td>
                    <td>${sourceAccount}</td>
                    <td>${record.destination_account}</td>
                    <td style="color: ${valueColor}; font-weight: bold;">${formatCurrency(record.value)}</td>
                `;
            tbody.appendChild(row);
        });
    }
}

document.getElementById("transferir-form").onsubmit = async function (event) {
    event.preventDefault();
    const destinationAccount = document.getElementById("destination_account");
    const valueConsigment = document.getElementById("value");
    const sourceAccount = document.getElementById("options");
    var errorMessage = document.getElementById("error-message-tranferir");

    if (sourceAccount.value === ""){
        errorMessage.textContent = "Por favor seleccione la cuenta de origen";
        errorMessage.style.color = "red";
        return false;
    }else if (accounts.indexOf(parseInt(sourceAccount.value)) === -1) {
        errorMessage.textContent = "Por favor ingrese una de sus cuentas como origen";
        errorMessage.style.color = "red";
        return false;
    } else if (destinationAccount.value.trim() === "") {
        errorMessage.textContent = "Por favor ingrese la cuenta de destino";
        errorMessage.style.color = "red";
        return false;
    } else if (isNaN(destinationAccount.value)) {
        errorMessage.textContent = "Por favor ingrese una cuenta de destino válida";
        errorMessage.style.color = "red";
        return false;
    } else if (parseInt(destinationAccount.value) < 1) {
        errorMessage.textContent = "Por favor ingrese una cuenta de destino válida";
        errorMessage.style.color = "red";
        return false;
    } else if (valueConsigment.value < 0 || valueConsigment.value === '') {
        errorMessage.textContent = "Por favor ingrese un valor de transferencia válido";
        errorMessage.style.color = "red";
        return false;
    } else if (destinationAccount.value.toString() == sourceAccount.value) {
        errorMessage.textContent = "Ambas cuentas no pueden ser iguales";
        errorMessage.style.color = "red";
        return false;
    } else {
        const object = {
            source_account: sourceAccount.value,
            destination_account: destinationAccount.value,
            value: valueConsigment.value
        }
        const responsesJSON = await sendTransferRequest(object, errorMessage);
        if (responsesJSON) {
            showConfirmationPopup("Transferencia realizada exitosamente");
            errorMessage.textContent = '';
            sourceAccount.innerHTML = '<option value="" disabled selected>Cuenta de Origen</option>';
            destinationAccount.value = '';
            valueConsigment.value = '';
            await fillRecordData();
            await fillAccountData();
        }
        return responsesJSON;
    }
};

async function sendTransferRequest(object, errorMessage) {
    try {
        const response = await fetch(API_URL + "transfer", {
            method: 'POST',
            headers: new Headers({ 'Content-type': 'application/json' }),
            body: JSON.stringify(object)
        });
        const result = await response.json();

        if (response.status == 200) {
            return true;
        } else if (result.message == 'Saldo insuficiente para transferir') {
            errorMessage.textContent = "Saldo insuficiente para transferir";
            errorMessage.style.color = "red";
            return false;
        } else if (result.message == 'La cuenta de destino no existe') {
            errorMessage.textContent = "La cuenta de destino no existe";
            errorMessage.style.color = "red";
            return false;
        } else {
            errorMessage.textContent = "Error al realizar transferencia";
            errorMessage.style.color = "red";
            return false;
        }
    } catch (error) {
        errorMessage.textContent = "Error al realizar transferencia";
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

function formatCurrency(number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(number);
}

function formatPhone(number) {
    const areaCode = number.slice(0, 3);
    const centralOfficeCode = number.slice(3, 6);
    const lineNumber = number.slice(6, 10);

    return `+57 ${areaCode} (${centralOfficeCode}) ${lineNumber}`;
}

function formatDate(dateString) {
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date(dateString));
}