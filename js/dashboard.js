//==================================
// CREPE STATION DASHBOARD JS
//==================================



//==================================
// ELEMENTS
//==================================


const productsCard = document.getElementById("productsCard");

const offersCard = document.getElementById("offersCard");

const extrasCard = document.getElementById("extrasCard");

const categoriesCard = document.getElementById("categoriesCard");

const logoutBtn = document.getElementById("logoutBtn");





//==================================
// OPEN PRODUCTS
//==================================


if(productsCard){

    productsCard.addEventListener("click",()=>{

        window.location.href="products.html";

    });

}







//==================================
// OPEN OFFERS
//==================================


if(offersCard){

    offersCard.addEventListener("click",()=>{

        window.location.href="offers.html";

    });

}







//==================================
// OPEN EXTRAS
//==================================


if(extrasCard){

    extrasCard.addEventListener("click",()=>{

        window.location.href="extras.html";

    });

}







//==================================
// OPEN CATEGORIES
//==================================


if(categoriesCard){

    categoriesCard.addEventListener("click",()=>{

        window.location.href="categories.html";

    });

}







//==================================
// LOGOUT
//==================================


if(logoutBtn){


    logoutBtn.addEventListener("click",()=>{


        localStorage.removeItem("adminLogin");


        window.location.href="admin.html";


    });


}