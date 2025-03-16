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