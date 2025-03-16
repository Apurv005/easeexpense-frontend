// apiURL = "http://127.0.0.1:4000/api";
const apiURL = "https://expensenodeapp.azurewebsites.net/api";
document.getElementById("logoutButton").addEventListener("click", logout);

// Logout Function
function logout() {

  let confirmLogout = confirm("Are you sure you want to logout?");
  if(!confirmLogout){
    return;
  }
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/index.html";
}

document.addEventListener("DOMContentLoaded",async function () {
  // Fetch expenses when the page loads
  if (checkAuth()) {
    await getReport();
    chartDisp();
  }
});

async function getReport() {
  try {
    const response = await fetch(`${apiURL}/reports/getReport`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch summary");
    }

    const data = await response.json();
    // Update the UI with fetched data
    document.getElementById("totalIncome").innerText = `$${data.data.totalIncome.toFixed(2)}`;
    document.getElementById("totalExpense").innerText = `$${data.data.totalExpense.toFixed(2)}`;
    document.getElementById("totalBalance").innerText = `$${data.data.balance.toFixed(2)}`;
  } catch (error) {
    console.error("Error fetching summary:", error);
    document.getElementById("summaryError").innerText = "Failed to load summary.";
  }
}


// Function to Get JWT Token
function getAuthToken() {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [key, value] = cookie.split("=");
    if (key === "authToken") {
      return decodeURIComponent(value); // Decode in case of encoded value
    }
  }
  return null; // Return null if token is not found
}

// Function to get cookie by name
function getCookie(name) {
  const cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

// Check for JWT Token
function checkAuth() {
  const token = getCookie("authToken"); // Assuming JWT token is stored in a cookie named "token"

  if (!token) {
    // No token found, redirect to login page
    window.location.href = "/index.html";
  }
  return true;
}


 function getChartData(){

  console.log(
   document.getElementById("totalIncome").innerText);
  
  return {
    labels: ['Income', 'Expense'],
    datasets: [{
      label: 'Income vs Expense',
      data: [document.getElementById("totalIncome").innerText.replace("$", ""), document.getElementById("totalExpense").innerText.replace("$", "")], // Example data
      backgroundColor: ['#28a745', '#dc3545'],
      borderColor: ['#28a745', '#dc3545'],
      borderWidth: 1
    }]
  };
}
 // Sample data for the Income vs Expense chart

function chartDisp(){


const incomeExpenseConfig = {
  type: 'pie',
  data: getChartData(),
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem) {
            return tooltipItem.raw + ' NZD';
          }
        }
      }
    }
  }
};

// Render the chart
const incomeExpenseChart = new Chart(
  document.getElementById('incomeExpenseChart'),
  incomeExpenseConfig
);
}