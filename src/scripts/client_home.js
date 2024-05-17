// Function to get JSON data from the URL
function getJsonFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const data = urlParams.get('data');
    return data ? JSON.parse(data) : null;
}

// Get the JSON data from the URL
const jsonData = getJsonFromUrl();

// Get the output div
const outputDiv = document.getElementById('json-output');

// Print JSON data if available
if (jsonData) {
    outputDiv.innerText = JSON.stringify(jsonData, null, 2);
} else {
    outputDiv.innerText = 'No JSON data found in URL.';
}

// Example function to go back to the home page
function goHome() {
    window.location.href = '../sites/index.html'; // Replace with your actual home page URL
}