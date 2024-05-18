// Function to get JSON data from the URL
function getJsonFromUrl() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const data = urlParams.get('data');
    return data ? JSON.parse(data) : null;
}

// Get the JSON data from the URL
const jsonData = getJsonFromUrl();

function goHome() {
    window.location.href = '../sites/index.html'; // Replace with your actual home page URL
}