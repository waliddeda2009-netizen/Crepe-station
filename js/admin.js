//==================================
// CREPE STATION ADMIN LOGIN
//==================================


const loginForm = document.getElementById("loginForm");


loginForm.addEventListener("submit", function(e){

    e.preventDefault();


    let username = document.getElementById("username").value;

    let password = document.getElementById("password").value;

    let error = document.getElementById("error-message");



    if(username === "admin" && password === "1234"){


        localStorage.setItem("adminLogin","true");


        window.location.href="dashboard.html";


    }else{


        error.innerHTML="Wrong username or password";


    }



});