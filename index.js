const signUpButton = document.getElementById("signupButton");
const loginButton = document.getElementById("loginButton");
const signUpWarning = document.getElementById("signup-warning");
const signupSuccessAlert = document.getElementById("signup-success-alert");
const signinForm = document.getElementById("signin-form");
const signinErrorAlert = document.getElementById("signin-error-alert");
const signinSuccessAlert = document.getElementById("signin-success-alert");
// const apiUrl = "http://127.0.0.1:4000/api";
const apiUrl = "https://expensebackend-ajhkhddvaphrhefv.australiaeast-01.azurewebsites.net/api";

// Handle Sign-Up
document.getElementById("signupButton").addEventListener("click", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById(
    "signupConfirmPassword"
  ).value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;

  if (!email || !password || !confirmPassword || !firstName || !lastName) {
    signUpWarning.innerText = "Please fill in all fields.";
    return;
  }

  if (password !== confirmPassword) {
    signUpWarning.innerText = "Passwords do not match.";
  }

  const userData = {
    email: email,
    password: password,
    first_name: firstName,
    last_name: lastName,
  };

  fetch(`${apiUrl}/users/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(userData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        signupSuccessAlert.classList.remove("d-none"); // Show Bootstrap success alert

        setTimeout(() => {
          // Hide Sign-Up modal
          let signupModalInstance = bootstrap.Modal.getInstance(
            document.getElementById("signupModal")
          );
          if (signupModalInstance) {
            signupModalInstance.hide(); // Hide the Sign Up modal properly
          }

          // Open Sign-In modal after 3 seconds
          setTimeout(() => {
            let signinModal = new bootstrap.Modal(
              document.getElementById("signinModal")
            );
            signinModal.show();
          }, 500); // Delay to ensure modal transition smoothly
        }, 3000); // 3 seconds delay before opening Sign In modal
      } else {
        signUpWarning.innerText = data.message || "Sign-up failed.";
      }
    })
    .catch((error) => console.error("Error:", error));
});

// Handle Sign-In
signinForm.addEventListener("submit", function (event) {
  event.preventDefault(); // Prevent form from reloading

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    signinErrorAlert.textContent = "Please enter both email and password.";
    signinErrorAlert.classList.remove("d-none");
    return;
  }

  // API Request Body
  const loginData = { email, password };

  // Call Backend API
  fetch(`${apiUrl}/users/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify(loginData),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success && data.token) {
        // Store JWT Token in Cookies (Expires in 1 day)
        document.cookie = `authToken=${data.token}; path=/; max-age=86400; Secure`;

        // Hide Error Alert (If previously shown)
        signinErrorAlert.classList.add("d-none");

        // Show Success Alert
        signinSuccessAlert.classList.remove("d-none");
        signinSuccessAlert.textContent = "Login successful!";

        // Redirect User to Dashboard or Home Page
        setTimeout(() => {
          // Hide Sign-In Modal
          let signinModalInstance = bootstrap.Modal.getInstance(
            document.getElementById("signinModal")
          );
          if (signinModalInstance) {
            signinModalInstance.hide();
          }
          window.location.href = "/dashboard.html"; // Change URL as needed
        }, 2000);
      } else {
        signinErrorAlert.textContent =
          data.message || "Invalid email or password.";
        signinErrorAlert.classList.remove("d-none");
      }
    })
    .catch((error) => {
      signinErrorAlert.textContent = "Something went wrong. Please try again.";
      signinErrorAlert.classList.remove("d-none");
      console.error("Login Error:", error);
    });
});