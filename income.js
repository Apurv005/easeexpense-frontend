// const apiURL = "http://127.0.0.1:4000/api";
const apiURL = "https://expapp-d0ezekckc8egdddd.australiacentral-01.azurewebsites.net/api";


document.getElementById("logoutButton").addEventListener("click", logout);
// Add expense
document.addEventListener("DOMContentLoaded", function () {
  // Fetch expenses when the page loads
  if (checkAuth()) {
    fetchIncomes();
  }
});



// Logout Function
function logout() {

  let confirmLogout = confirm("Are you sure you want to logout?");
  if(!confirmLogout){
    return;
  }
  document.cookie = "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/index.html";
}

// Add Income
document.getElementById("saveIncomeBtn").addEventListener("click",async function (e) {
  e.preventDefault();
    let source = document.getElementById("incomeSource").value;
    let description = document.getElementById("incomeDescription").value;
    let amount = document.getElementById("incomeAmount").value;
    let date = document.getElementById("incomeDate").value;

    if (!source || !description || !amount || !date) {
        alert("Please fill in all fields.");
        return;
    }

    const expenseData = {
        source,
        description,
        amount: parseFloat(amount),
        date
    };

    try {
        // Call the backend API to save expense
        const response = await fetch(`${apiURL}/incomes/post-income`, {  // Replace with actual API URL
            method: "POST",
            headers: {
                "Authorization": `Bearer ${getAuthToken()}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(expenseData)
        });

        if (!response.ok) {
            throw new Error("Failed to save income.");
        }
        // Reset form fields
        source = "";
        description = "";
        amount = "";
        date = "";

        // Show Success Alert
        document.getElementById("add-income-success-alert").classList.remove("d-none");
        document.getElementById("add-income-success-alert").textContent = "Income successfully saved!";

                // Close the modal after a short delay
                setTimeout(() => {
                  let modalElement = document.getElementById("addIncomeModal");
                  let modalInstance = bootstrap.Modal.getInstance(modalElement);
                  modalInstance.hide();
              }, 1000); // Delay to show success message
    } catch (error) {
        console.error("Error saving income:", error);
        alert("Error saving income. Please try again.");
    }
});

// Fetch Income
function fetchIncomes() {
  const tableBody = document.getElementById("incomeTableBody");
  tableBody.innerHTML = `
      <tr id="loadingRow">
        <td colspan="6" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    `; // Show loading spinner in the table

  fetch(`${apiURL}/incomes/get-all-income`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`, // Replace with actual function to retrieve token
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      populateIncomeTable(data);
    })
    .catch((error) => {
      console.error("Error fetching income", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load data</td></tr>`;
    });
}

function populateIncomeTable(incomes) {
  const tableBody = document.getElementById("incomeTableBody");
  tableBody.innerHTML = ""; // Clear existing rows

  if (incomes.count === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No income found.</td></tr>`;
    return;
  }

  incomes.incomes.forEach((income, index) => {
    const newRow = document.createElement("tr");

    newRow.setAttribute("data-id", income.id); // Store UUID in data-id attribute

    newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${income.source}</td>
            <td>${income.description}</td>
            <td>${income.amount}</td>
            <td>${income.date}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editModelDisp(this)">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteIncome('${
                  income.id
                }')">Delete</button>
            </td>
        `;

    tableBody.appendChild(newRow);
  });
}

// Edit Model Show Function
function editModelDisp(button) {
  const row = button.closest("tr");
  const incomeId = row.getAttribute("data-id"); // Fetch UUID from data-id
  const source = row.cells[1].innerText;
  
  const description = row.cells[2].innerText;
  const amount = row.cells[3].innerText;
  const date = row.cells[4].innerText;

  // Populate the modal fields
  document.getElementById("editIncomeSource").value = source;
  document.getElementById("editIncomeDescription").value = description;
  document.getElementById("editIncomeAmount").value = amount;
  document.getElementById("editIncomeDate").value = date;

  // Store the expense ID in a hidden field
  document.getElementById("editIncomeId").value = incomeId;


  // Show the edit modal
  let editModal = new bootstrap.Modal(
    document.getElementById("editIncomeModal")
  );
  editModal.show();
}

// Function to Edit Income
// // Function to Save Edited Expense
document
  .getElementById("editIncomeForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const incomeId = document.getElementById("editIncomeId").value; // UUID
    const source = document.getElementById("editIncomeSource").value;
    const description = document.getElementById("editIncomeDescription").value;
    const amount = document.getElementById("editIncomeAmount").value;
    const date = document.getElementById("editIncomeDate").value;

    const updatedIncome = {
      source,
      description,
      amount: parseFloat(amount),
      date,
    };

    try {
      const response = await fetch(
        `${apiURL}/incomes/update-income/${incomeId}`,
        {
          method: "PUT", // Use PUT to update
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedIncome),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update income.");
      }

      let incomeEditSuccessAlert = document.getElementById(
        "edit-income-success-alert"
      );

      // Show Success Alert
      incomeEditSuccessAlert.classList.remove("d-none");
      incomeEditSuccessAlert.textContent = "Income Updated successfully!";

      // Close the modal after a short delay
      setTimeout(() => {
        let modalElement = document.getElementById("editIncomeModal");
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        incomeEditSuccessAlert.classList.add("d-none");
        modalInstance.hide();

      }, 500); // Delay to show success message

      // Refresh income list (fetch again)
      fetchIncomes();
    } catch (error) {
      console.error("Error updating income:", error);
      alert("Error updating income. Please try again.");
    }
  });


// Delete Income Function
function deleteIncome(incomeId) {
  if (confirm("Are you sure you want to delete this income?")) {
    fetch(`${apiURL}/incomes/delete-income/${incomeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          fetchIncomes(); // Refresh table after deletion
        } else {
          console.error("Failed to delete income");
        }
      })
      .catch((error) => console.error("Error deleting income:", error));
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