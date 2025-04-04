// const apiURL = "http://127.0.0.1:4000/api";
const apiURL = "https://expapp-d0ezekckc8egdddd.australiacentral-01.azurewebsites.net/api";

// Add expense
document.addEventListener("DOMContentLoaded", function () {

  // Fetch expenses when the page loads
  if (checkAuth()) {
    fetchExpenses();
    fetchCategories();
  }
});

function fetchExpenses() {
  const tableBody = document.getElementById("expenseTableBody");
  tableBody.innerHTML = `
      <tr id="loadingRow">
        <td colspan="6" class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </td>
      </tr>
    `; // Show loading spinner in the table

  fetch(`${apiURL}/expenses/get-all-expense`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`, // Replace with actual function to retrieve token
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      populateExpenseTable(data);
    })
    .catch((error) => {
      console.error("Error fetching expenses:", error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Failed to load data</td></tr>`;
    });
}

function populateExpenseTable(expenses) {
  const tableBody = document.getElementById("expenseTableBody");
  tableBody.innerHTML = ""; // Clear existing rows

  if (expenses.count === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">No expenses found.</td></tr>`;
    return;
  }

  expenses.expenses.forEach((expense, index) => {
    const newRow = document.createElement("tr");

    newRow.setAttribute("data-id", expense.id); // Store UUID in data-id attribute

    newRow.innerHTML = `
            <td>${index + 1}</td>
            <td>${expense.category}</td>
            <td>${expense.title}</td>
            <td>${expense.description}</td>
            <td>${expense.amount}</td>
            <td>${expense.date}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editExpense(this)">Edit</button>
                <button class="btn btn-danger btn-sm" onclick="deleteExpense('${
                  expense.id
                }')">Delete</button>
            </td>
        `;

    tableBody.appendChild(newRow);
  });
}

// Add Expense:
document
  .getElementById("saveExpenseBtn")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const category = document.getElementById("expenseCategory").value;
    const title = document.getElementById("expenseTitle").value;
    const description = document.getElementById("expenseDescription").value;
    const amount = document.getElementById("expenseAmount").value;
    const date = document.getElementById("expenseDate").value;

    if (!category || !title || !description || !amount || !date) {
      alert("Please fill in all fields.");
      return;
    }

    const expenseData = {
      category,
      title,
      description,
      amount: parseFloat(amount),
      date,
    };

    try {
      // Call the backend API to save expense
      const response = await fetch(
        `${apiURL}/expenses/post-expense`,
        {
          // Replace with actual API URL
          method: "POST",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(expenseData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save expense.");
      }
      // Reset form fields
      document.getElementById("expenseCategory").value = "";
      document.getElementById("expenseDescription").value = "";
      document.getElementById("expenseTitle").value = "";
      document.getElementById("expenseAmount").value = "";
      document.getElementById("expenseDate").value = "";

      // Show Success Alert
      document
        .getElementById("add-expense-success-alert")
        .classList.remove("d-none");
      document.getElementById("add-expense-success-alert").textContent =
        "Expense successfully saved!";

      // Close the modal after a short delay
      setTimeout(() => {
        let modalElement = document.getElementById("addExpenseModal");
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
      }, 1000); // Delay to show success message

      fetchExpenses();
    } catch (error) {
      console.error("Error saving expense:", error);
      alert("Error saving expense. Please try again.");
    }
  });

// Edit Expense:
// Function to Open Edit Modal with Existing Data
function editExpense(button) {
  console.log("136:", button);

  const row = button.closest("tr");
  const expenseId = row.getAttribute("data-id"); // Fetch UUID from data-id
  const category = row.cells[1].innerText;
  const title = row.cells[2].innerText;
  const description = row.cells[3].innerText;
  const amount = row.cells[4].innerText;
  const date = row.cells[5].innerText;

  // Populate the modal fields
  document.getElementById("editExpenseCategory").value = category;
  document.getElementById("editExpenseTitle").value = title;
  document.getElementById("editExpenseDescription").value = description;
  document.getElementById("editExpenseAmount").value = amount;
  document.getElementById("editExpenseDate").value = date;

  // Store the expense ID in a hidden field
  document.getElementById("editExpenseId").value = expenseId;

  // Show the edit modal
  let editModal = new bootstrap.Modal(
    document.getElementById("editExpenseModal")
  );
  editModal.show();
}

// // Function to Save Edited Expense
document
  .getElementById("editExpenseForm")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const expenseId = document.getElementById("editExpenseId").value; // UUID
    const category = document.getElementById("editExpenseCategory").value;
    const title = document.getElementById("editExpenseTitle").value;
    const description = document.getElementById("editExpenseDescription").value;
    const amount = document.getElementById("editExpenseAmount").value;
    const date = document.getElementById("editExpenseDate").value;

    const updatedExpense = {
      category,
      title,
      description,
      amount: parseFloat(amount),
      date,
    };

    try {
      const response = await fetch(
        `${apiURL}/expenses/update-expense/${expenseId}`,
        {
          method: "PUT", // Use PUT to update
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedExpense),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update expense.");
      }

      let expenseEditSuccessAlert = document.getElementById(
        "edit-expense-success-alert"
      );

      // Show Success Alert
      expenseEditSuccessAlert.classList.remove("d-none");
      expenseEditSuccessAlert.textContent = "Expese Updated successfully!";

      // Close the modal after a short delay
      setTimeout(() => {
        let modalElement = document.getElementById("editExpenseModal");
        let modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();
      }, 500); // Delay to show success message

      // Refresh expense list (fetch again)
      fetchExpenses();
    } catch (error) {
      console.error("Error updating expense:", error);
      alert("Error updating expense. Please try again.");
    }
  });

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

function deleteExpense(expenseId) {
  console.log("Expense ID:", expenseId);
  if (confirm("Are you sure you want to delete this expense?")) {
    fetch(`${apiURL}/expenses/delete-expense/${expenseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getAuthToken()}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (response.ok) {
          fetchExpenses(); // Refresh table after deletion
        } else {
          console.error("Failed to delete expense");
        }
      })
      .catch((error) => console.error("Error deleting expense:", error));
  }
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


function fetchCategories() {
  fetch(`${apiURL}/admin-users/`)  // Adjust this URL as per your backend
      .then(response => response.json())
      .then(categories => {
          let categoryDropdown = document.getElementsByClassName("expCategory");
          
          categoryDropdown.innerHTML = '<option value="" disabled selected>Select a category</option>'; // Reset options

          for (let dropdown of categoryDropdown) {  // Loop through all dropdowns
            dropdown.innerHTML = '<option value="" disabled selected>Select a category</option>'; // Reset options

            categories.forEach(category => {
                let option = document.createElement("option");
                option.value = category.name;
                option.textContent = category.name;
                dropdown.appendChild(option);
            });
        }
      })
      .catch(error => console.error("Error fetching categories:", error));
}

document.getElementById("logoutButton").addEventListener("click", logout);

// Logout Function
function logout() {
  let confirmLogout = confirm("Are you sure you want to logout?");
  if (!confirmLogout) {
    return;
  }
  document.cookie =
    "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  window.location.href = "/index.html";
}
