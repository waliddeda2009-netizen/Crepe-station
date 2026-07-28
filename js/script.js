//==================================
//        CREPE STATION JS
//==================================



//==================================
// LOGO MOVEMENT
//==================================


const heroLogo = document.getElementById("hero-logo");

const header = document.querySelector("header");



if(heroLogo && header){


    window.addEventListener("scroll",()=>{


        if(window.scrollY > 120){


            heroLogo.classList.add("hide");


            header.classList.add("scrolled");

            header.classList.add("active");


        }else{


            heroLogo.classList.remove("hide");


            header.classList.remove("scrolled");

            header.classList.remove("active");


        }


    });



}else{


    if(header){


        header.classList.add("scrolled");

        header.classList.add("active");


    }


}







//==================================
// ORDER BUTTON
//==================================


const orderBtn = document.querySelector(".order-btn-main");



if(orderBtn){


    orderBtn.addEventListener("click",(e)=>{


        const menuSection = document.querySelector("#menu");



        if(menuSection){


            e.preventDefault();


            menuSection.scrollIntoView({

                behavior:"smooth"

            });


        }


    });


}







//==================================
// SIDEBAR MENU
//==================================


const menuBtn = document.querySelector(".menu-circle");

const bubbleMenu = document.querySelector(".bubble-menu");

const menuIcon = document.querySelector(".menu-circle i");




if(menuBtn && bubbleMenu && menuIcon){



    menuBtn.addEventListener("click",(e)=>{


        e.stopPropagation();


        bubbleMenu.classList.toggle("active");


        menuBtn.classList.toggle("active");



        if(bubbleMenu.classList.contains("active")){


            menuIcon.className = "fa-solid fa-xmark";


        }else{


            menuIcon.className = "fa-solid fa-bars";


        }



    });




    document.querySelectorAll(".bubble-menu a")
    .forEach(link=>{


        link.addEventListener("click",()=>{


            bubbleMenu.classList.remove("active");


            menuBtn.classList.remove("active");


            menuIcon.className="fa-solid fa-bars";


        });


    });




    document.addEventListener("click",(e)=>{


        if(
            !menuBtn.contains(e.target)
            &&
            !bubbleMenu.contains(e.target)
        ){


            bubbleMenu.classList.remove("active");


            menuBtn.classList.remove("active");


            menuIcon.className="fa-solid fa-bars";


        }


    });


}

//==================================
// SCROLL ANIMATION
//==================================


const animatedItems = document.querySelectorAll(

".coming-soon, .offer-box, .about-box, .feedback-box"

);



animatedItems.forEach(item=>{


    item.style.opacity="0";


    item.style.transform="translateY(40px)";


    item.style.transition=".8s ease";


});





function showAnimation(){


    animatedItems.forEach(item=>{


        const position =

        item.getBoundingClientRect().top;



        if(position < window.innerHeight - 80){


            item.style.opacity="1";


            item.style.transform="translateY(0)";


        }



    });


}




window.addEventListener("scroll",showAnimation);


showAnimation();








//==================================
// FIREBASE
//==================================


import { db } from "../firebase.js";



import {


collection,

getDocs


} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";








//==================================
// ELEMENTS
//==================================


const productsContainer =

document.getElementById("products");



const categoriesContainer =

document.getElementById("categories");



const offersContainer =

document.getElementById("offers");






let allProducts = [];



let activeCategory = null;






//==================================
// LOAD CATEGORIES
//==================================


async function loadCategories(){


    if(!categoriesContainer) return;



    categoriesContainer.innerHTML="";



    const snapshot = await getDocs(

        collection(db,"categories")

    );




    snapshot.forEach((item)=>{


        const category = item.data();




        categoriesContainer.innerHTML += `


        <div class="category-card"

        data-category="${category.name}">


            <h3>

            ${category.name}

            </h3>


        </div>


        `;


    });






    document.querySelectorAll(".category-card")
    .forEach(card=>{



        card.addEventListener("click",()=>{



            const categoryName =

            card.dataset.category;




            if(activeCategory === categoryName){



                activeCategory=null;



                document.querySelectorAll(".category-card")
                .forEach(item=>{


                    item.classList.remove("active");


                    item.querySelector("h3").innerHTML =

                    item.dataset.category;


                });



                displayProducts(allProducts);


                return;


            }






            activeCategory = categoryName;






            document.querySelectorAll(".category-card")
            .forEach(item=>{


                item.classList.remove("active");


                item.querySelector("h3").innerHTML =

                item.dataset.category;


            });






            card.classList.add("active");



            card.querySelector("h3").innerHTML =

            categoryName + " ×";





            filterProducts(categoryName);



        });



    });



}
//==================================
// LOAD PRODUCTS
//==================================


async function loadProducts(){


    if(!productsContainer) return;



    productsContainer.innerHTML="";



    const snapshot = await getDocs(

        collection(db,"products")

    );





    allProducts=[];





    snapshot.forEach((item)=>{



        allProducts.push({


            id:item.id,


            ...item.data()



        });



    });





    displayProducts(allProducts);



}







//==================================
// DISPLAY PRODUCTS
//==================================


function displayProducts(products){



    if(!productsContainer) return;





    productsContainer.innerHTML="";







    products.forEach(product=>{



        productsContainer.innerHTML += `



        <div class="menu-card"

        data-id="${product.id}"

        data-name="${product.name}"

        data-price="${product.price}">






            <img

            src="${product.image || 'images/no-image.png'}"

            alt="${product.name}">







            <h3>

            ${product.name}

            </h3>







            <p>

            ${product.description || ""}

            </p>







            <strong>

            ${product.price} EGP

            </strong>







            <button class="add-btn">

            Add

            </button>





        </div>



        `;



    });



}









//==================================
// FILTER PRODUCTS
//==================================


function filterProducts(category){



    const filtered = allProducts.filter(product=>{



        return product.category === category;



    });





    displayProducts(filtered);



}







//==================================
// LOAD OFFERS
//==================================


async function loadOffers(){



    if(!offersContainer) return;





    offersContainer.innerHTML="";






    const snapshot = await getDocs(

        collection(db,"offers")

    );







    snapshot.forEach((item)=>{



        const offer = item.data();






        offersContainer.innerHTML += `



        <div class="menu-card">





            <img

            src="${offer.image || 'images/no-image.png'}"

            alt="${offer.name}">







            <h3>

            ${offer.name}

            </h3>







            <p>

            ${offer.description || ""}

            </p>







            <strong>

            ${offer.newPrice || offer.price} EGP

            </strong>





        </div>



        `;



    });



}
//==================================
//        CART SYSTEM
//==================================


let cart = [];




//==================================
// ELEMENTS
//==================================


const cartBox = document.getElementById("cartBox");

const cartOverlay = document.getElementById("cartOverlay");

const openCart = document.getElementById("openCart");

const closeCart = document.getElementById("closeCart");

const cartItems = document.getElementById("cartItems");

const cartTotal = document.getElementById("cartTotal");

const cartCount = document.getElementById("cartCount");







//==================================
// OPEN / CLOSE CART
//==================================


function openCartBox(){


    if(cartBox && cartOverlay){


        cartBox.classList.add("active");


        cartOverlay.classList.add("active");


    }


}





function closeCartBox(){


    if(cartBox && cartOverlay){


        cartBox.classList.remove("active");


        cartOverlay.classList.remove("active");


    }


}







if(openCart){


    openCart.addEventListener("click",()=>{


        if(cartBox.classList.contains("active")){


            closeCartBox();


        }else{


            openCartBox();


        }


    });


}







if(closeCart){


    closeCart.addEventListener(

        "click",

        closeCartBox

    );


}







if(cartOverlay){


    cartOverlay.addEventListener(

        "click",

        closeCartBox

    );


}








//==================================
// ADD TO CART
//==================================


function addToCart(product){



    let item = cart.find((p)=>{


        return p.id === product.id;


    });





    if(item){


        item.quantity += 1;


    }else{


        cart.push({


            id:product.id,


            name:product.name,


            price:Number(product.price),


            quantity:1



        });


    }





    updateCart();


}








//==================================
// UPDATE CART
//==================================


function updateCart(){



    if(!cartItems) return;



    cartItems.innerHTML="";



    let total = 0;

    let count = 0;





    cart.forEach(item=>{


        total += item.price * item.quantity;


        count += item.quantity;





        cartItems.innerHTML += `


        <div class="cart-item">


            <div>


                <h4>

                ${item.name}

                </h4>



                <span>

                ${item.price} EGP

                x ${item.quantity}

                </span>


            </div>




            <button onclick="removeFromCart('${item.id}')">


                <i class="fa-solid fa-trash"></i>


            </button>



        </div>


        `;



    });







    if(cartTotal){


        cartTotal.innerText = total;


    }





    if(cartCount){


        cartCount.innerText = count;


    }



}









//==================================
// REMOVE FROM CART
//==================================


window.removeFromCart=function(id){



    cart = cart.filter(item=>{


        return item.id !== id;


    });



    updateCart();



};









//==================================
// ADD BUTTON CONNECTION
//==================================


document.addEventListener("click",(e)=>{



    if(e.target.classList.contains("add-btn")){



        const card = e.target.closest(".menu-card");




        const product = {


            id:card.dataset.id,


            name:card.dataset.name,


            price:Number(card.dataset.price)



        };





        addToCart(product);



    }



});









//==================================
// CHECKOUT
//==================================


const checkoutBtn = document.getElementById("checkoutBtn");



if(checkoutBtn){


    checkoutBtn.addEventListener("click",()=>{



        if(cart.length === 0){


            alert("Your cart is empty");


            return;


        }



        alert("Order Ready");


        console.log(cart);



    });


}






        console.log("Customer Order:",cart);





        alert("Order Ready");













//==================================
// START APP
//==================================


loadCategories();


loadProducts();


loadOffers();