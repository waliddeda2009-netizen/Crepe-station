//==================================
// CREPE STATION JS - COMPLETE
// Firebase + Products + Categories
// Extras Popup + Cart + Notifications
//==================================

import { db } from "../firebase.js";

import {
    collection,
    getDocs,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

//==================================
// RESTAURANT OPEN / CLOSED
//==================================

const restaurantClosed = document.getElementById("restaurantClosed");
const heroOrderButton = document.getElementById("heroOrderButton");

function getEgyptTime(){
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone:"Africa/Cairo",
        hour:"numeric",
        minute:"numeric",
        second:"numeric",
        hour12:false
    }).formatToParts(new Date());

    const result = {hour:0, minute:0, second:0};

    parts.forEach(part=>{
        if(part.type === "hour") result.hour = Number(part.value);
        if(part.type === "minute") result.minute = Number(part.value);
        if(part.type === "second") result.second = Number(part.value);
    });

    return result;
}

function isRestaurantOpen(){
    const time = getEgyptTime();
    const currentMinutes = time.hour * 60 + time.minute;
    const openAtNoon = 12 * 60;
    const closeAtMorning = 5 * 60 + 30;

    return currentMinutes >= openAtNoon || currentMinutes <= closeAtMorning;
}

function updateRestaurantStatus(){
    if(!restaurantClosed) return;

    const open = isRestaurantOpen();

    restaurantClosed.classList.toggle("active", !open);
    restaurantClosed.setAttribute("aria-hidden", String(open));

    if(heroOrderButton){
        heroOrderButton.style.pointerEvents = open ? "auto" : "none";
        heroOrderButton.style.opacity = open ? "1" : ".5";
    }
}

updateRestaurantStatus();
setInterval(updateRestaurantStatus, 1000);

//==================================
// LOGO / HEADER
//==================================

const heroLogo = document.getElementById("hero-logo");
const header = document.querySelector("header");

if(heroLogo && header){
    window.addEventListener("scroll",()=>{
        if(window.scrollY > 120){
            heroLogo.classList.add("hide");
            header.classList.add("scrolled","active");
        }else{
            heroLogo.classList.remove("hide");
            header.classList.remove("scrolled","active");
        }
    });
}else if(header){
    header.classList.add("scrolled","active");
}

//==================================
// ORDER BUTTON
//==================================

const orderBtn = document.querySelector(".order-btn-main");

if(orderBtn){
    orderBtn.addEventListener("click",e=>{
        if(!isRestaurantOpen()){
            e.preventDefault();
            updateRestaurantStatus();
            showNotification("We're currently closed","Ordering is unavailable now.");
            return;
        }

        const menuSection = document.querySelector("#menu");

        if(menuSection){
            e.preventDefault();
            menuSection.scrollIntoView({behavior:"smooth"});
        }
    });
}

//==================================
// SIDEBAR
//==================================

const menuBtn = document.querySelector(".menu-circle");
const bubbleMenu = document.querySelector(".bubble-menu");
const menuIcon = document.querySelector(".menu-circle i");

function closeBubbleMenu(){
    if(!bubbleMenu || !menuBtn || !menuIcon) return;
    bubbleMenu.classList.remove("active");
    menuBtn.classList.remove("active");
    menuIcon.className = "fa-solid fa-bars";
}

if(menuBtn && bubbleMenu && menuIcon){
    menuBtn.addEventListener("click",e=>{
        e.stopPropagation();

        const active = bubbleMenu.classList.toggle("active");
        menuBtn.classList.toggle("active",active);
        menuIcon.className = active
            ? "fa-solid fa-xmark"
            : "fa-solid fa-bars";
    });

    document.querySelectorAll(".bubble-menu a").forEach(link=>{
        link.addEventListener("click",closeBubbleMenu);
    });

    document.addEventListener("click",e=>{
        if(!menuBtn.contains(e.target) && !bubbleMenu.contains(e.target)){
            closeBubbleMenu();
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
    item.style.opacity = "0";
    item.style.transform = "translateY(40px)";
    item.style.transition = ".8s ease";
});

function showAnimation(){
    animatedItems.forEach(item=>{
        if(item.getBoundingClientRect().top < window.innerHeight - 80){
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
        }
    });
}

window.addEventListener("scroll",showAnimation);
showAnimation();

//==================================
// FIREBASE DATA
//==================================

const productsContainer = document.getElementById("products");
const categoriesContainer = document.getElementById("categories");
const offersContainer = document.getElementById("offers");

let allProducts = [];
let allExtras = [];
let activeCategory = null;

//==================================
// LOAD CATEGORIES
//==================================

async function loadCategories(){
    if(!categoriesContainer) return;

    categoriesContainer.innerHTML = "";

    try{
        const snapshot = await getDocs(collection(db,"categories"));

        snapshot.forEach(item=>{
            const category = item.data();

            const card = document.createElement("div");
            card.className = "category-card";
            card.dataset.category = category.name || "";

            const title = document.createElement("h3");
            title.textContent = category.name || "Category";

            card.appendChild(title);
            categoriesContainer.appendChild(card);

            card.addEventListener("click",()=>{
                const categoryName = card.dataset.category;

                if(activeCategory === categoryName){
                    activeCategory = null;
                    document.querySelectorAll(".category-card")
                        .forEach(c=>c.classList.remove("active"));
                    displayProducts(allProducts);
                    return;
                }

                activeCategory = categoryName;

                document.querySelectorAll(".category-card")
                    .forEach(c=>c.classList.remove("active"));

                card.classList.add("active");
                filterProducts(categoryName);
            });
        });

    }catch(error){
        console.error("Error loading categories:",error);
    }
}

//==================================
// LOAD PRODUCTS
//==================================

async function loadProducts(){
    if(!productsContainer) return;

    productsContainer.innerHTML = "";

    try{
        const snapshot = await getDocs(collection(db,"products"));

        allProducts = [];

        snapshot.forEach(item=>{
            allProducts.push({
                id:item.id,
                ...item.data()
            });
        });

        displayProducts(allProducts);

    }catch(error){
        console.error("Error loading products:",error);
        productsContainer.innerHTML =
            `<p style="color:#aaa;text-align:center;grid-column:1/-1;">Unable to load menu.</p>`;
    }
}

//==================================
// DISPLAY PRODUCTS
//==================================

function displayProducts(products){
    if(!productsContainer) return;

    productsContainer.innerHTML = "";

    if(products.length === 0){
        productsContainer.innerHTML =
            `<p style="color:#aaa;text-align:center;grid-column:1/-1;">No products found.</p>`;
        return;
    }

    products.forEach(product=>{
        const card = document.createElement("div");
        card.className = "menu-card";
        card.dataset.id = product.id;
        card.dataset.name = product.name || "Product";
        card.dataset.price = Number(product.price) || 0;

        const image = document.createElement("img");
        image.src = product.image || "images/no-image.png";
        image.alt = product.name || "Product";

        const name = document.createElement("h3");
        name.textContent = product.name || "Product";

        const description = document.createElement("p");
        description.textContent = product.description || "";

        const price = document.createElement("strong");
        price.textContent = `${Number(product.price) || 0} EGP`;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "add-btn";
        button.textContent = "Add";

        card.append(image,name,description,price,button);
        productsContainer.appendChild(card);
    });
}

//==================================
// FILTER
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

    offersContainer.innerHTML = "";

    try{
        const snapshot = await getDocs(collection(db,"offers"));

        snapshot.forEach(item=>{
            const offer = item.data();

            const card = document.createElement("div");
            card.className = "menu-card";

            const image = document.createElement("img");
            image.src = offer.image || "images/no-image.png";
            image.alt = offer.name || "Offer";

            const name = document.createElement("h3");
            name.textContent = offer.name || "Offer";

            const description = document.createElement("p");
            description.textContent = offer.description || "";

            const price = document.createElement("strong");
            price.textContent = `${Number(offer.newPrice ?? offer.price) || 0} EGP`;

            card.append(image,name,description,price);
            offersContainer.appendChild(card);
        });

    }catch(error){
        console.error("Error loading offers:",error);
    }
}

//==================================
// LOAD EXTRAS
//==================================

async function loadExtras(){
    try{
        const snapshot = await getDocs(collection(db,"extras"));

        allExtras = [];

        snapshot.forEach(item=>{
            allExtras.push({
                id:item.id,
                ...item.data()
            });
        });

        allExtras = allExtras.filter(extra=>{
            return extra.type === "product" || !extra.type;
        });

    }catch(error){
        console.error("Error loading extras:",error);
        allExtras = [];
    }
}

//==================================
// CART
//==================================

let cart = [];

try{
    cart = JSON.parse(localStorage.getItem("cart")) || [];
}catch{
    cart = [];
}

const cartBox = document.getElementById("cartBox");
const cartOverlay = document.getElementById("cartOverlay");
const openCart = document.getElementById("openCart");
const closeCart = document.getElementById("closeCart");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");
const cartCount = document.getElementById("cartCount");

function saveCart(){
    localStorage.setItem("cart",JSON.stringify(cart));
}

function getCartTotal(){
    return cart.reduce((sum,item)=>{
        return sum + Number(item.unitPrice || item.price || 0) * Number(item.quantity || 0);
    },0);
}

function getCartCount(){
    return cart.reduce((sum,item)=>{
        return sum + Number(item.quantity || 0);
    },0);
}

//==================================
// CART OPEN / CLOSE
//==================================

function openCartBox(){
    if(!isRestaurantOpen()){
        updateRestaurantStatus();
        showNotification("We're currently closed","Ordering is unavailable now.");
        return;
    }

    if(!cartBox || !cartOverlay) return;

    cartBox.classList.add("active");
    cartOverlay.classList.add("active");
    document.body.classList.add("cart-open");
    updateCart();
}

function closeCartBox(){
    if(!cartBox || !cartOverlay) return;

    cartBox.classList.remove("active");
    cartOverlay.classList.remove("active");
    document.body.classList.remove("cart-open");
}

if(openCart){
    openCart.addEventListener("click",()=>{
        if(cartBox?.classList.contains("active")){
            closeCartBox();
        }else{
            openCartBox();
        }
    });
}

if(closeCart) closeCart.addEventListener("click",closeCartBox);
if(cartOverlay) cartOverlay.addEventListener("click",closeCartBox);

//==================================
// CART ITEM KEY
// Different extras = different cart item
//==================================

function extrasSignature(extras=[]){
    return extras
        .map(extra=>`${extra.id}:${extra.quantity}`)
        .sort()
        .join("|");
}

function makeCartItemKey(product,extras=[]){
    return `${product.id}__${extrasSignature(extras)}`;
}

//==================================
// ADD FINAL ITEM TO CART
//==================================

function addConfiguredItem(product,extras,quantity){
    const key = makeCartItemKey(product,extras);

    const unitExtrasTotal = extras.reduce((sum,extra)=>{
        return sum + Number(extra.price || 0) * Number(extra.quantity || 0);
    },0);

    const unitPrice = Number(product.price || 0) + unitExtrasTotal;

    const existing = cart.find(item=>item.key === key);

    if(existing){
        existing.quantity += quantity;
    }else{
        cart.push({
            key,
            id:product.id,
            name:product.name || "Product",
            description:product.description || "",
            image:product.image || "images/no-image.png",
            price:Number(product.price || 0),
            extras:extras.map(extra=>({
                id:extra.id,
                name:extra.name,
                price:Number(extra.price || 0),
                quantity:Number(extra.quantity || 0)
            })),
            unitPrice,
            quantity
        });
    }

    saveCart();
    updateCart();
}

//==================================
// UPDATE CART
//==================================

function updateCart(){
    if(!cartItems) return;

    cartItems.innerHTML = "";

    if(cart.length === 0){
        cartItems.innerHTML = `
            <div class="cart-empty">
                <i class="fa-solid fa-cart-shopping"></i>
                <h4>Your cart is empty</h4>
                <p>Add something delicious from the menu.</p>
            </div>
        `;
    }

    cart.forEach((item,index)=>{
        const wrapper = document.createElement("div");
        wrapper.className = "cart-item";

        const extrasHTML = item.extras?.length
            ? `<div class="cart-extras">
                ${item.extras.map(extra=>`
                    <div class="cart-extra-line">
                        <span>+ ${escapeHTML(extra.name)} × ${extra.quantity}</span>
                        <span>${extra.price * extra.quantity} EGP</span>
                    </div>
                `).join("")}
               </div>`
            : "";

        wrapper.innerHTML = `
            <div class="cart-item-top">
                <img class="cart-item-image"
                     src="${escapeAttribute(item.image)}"
                     alt="${escapeAttribute(item.name)}">

                <div class="cart-item-info">
                    <h4>${escapeHTML(item.name)}</h4>
                    <p class="cart-item-description">${escapeHTML(item.description || "")}</p>
                    <span class="cart-item-price">${Number(item.unitPrice || item.price)} EGP / item</span>
                </div>
            </div>

            ${extrasHTML}

            <div class="cart-item-bottom">
                <div class="quantity-control">
                    <button type="button" data-cart-action="minus" data-index="${index}">
                        <i class="fa-solid fa-minus"></i>
                    </button>

                    <strong>${item.quantity}</strong>

                    <button type="button" data-cart-action="plus" data-index="${index}">
                        <i class="fa-solid fa-plus"></i>
                    </button>
                </div>

                <button type="button"
                        class="remove-cart-item"
                        data-cart-action="remove"
                        data-index="${index}">
                    <i class="fa-solid fa-trash"></i> Remove
                </button>
            </div>
        `;

        cartItems.appendChild(wrapper);
    });

    if(cartTotal) cartTotal.textContent = getCartTotal();
    if(cartCount) cartCount.textContent = getCartCount();
}

//==================================
// CART BUTTONS
//==================================

if(cartItems){
    cartItems.addEventListener("click",e=>{
        const button = e.target.closest("[data-cart-action]");
        if(!button) return;

        const index = Number(button.dataset.index);
        const action = button.dataset.cartAction;
        const item = cart[index];

        if(!item) return;

        if(action === "plus"){
            item.quantity++;
        }

        if(action === "minus"){
            item.quantity--;

            if(item.quantity <= 0){
                cart.splice(index,1);
            }
        }

        if(action === "remove"){
            cart.splice(index,1);
        }

        saveCart();
        updateCart();
    });
}

//==================================
// PRODUCT POPUP
//==================================

const productPopup = document.getElementById("productPopup");
const productPopupOverlay = document.getElementById("productPopupOverlay");
const closeProductPopup = document.getElementById("closeProductPopup");
const popupProductName = document.getElementById("popupProductName");
const popupProductImage = document.getElementById("popupProductImage");
const popupProductDescription = document.getElementById("popupProductDescription");
const popupProductPrice = document.getElementById("popupProductPrice");
const productExtrasList = document.getElementById("productExtrasList");
const popupQty = document.getElementById("popupQty");
const popupQtyMinus = document.getElementById("popupQtyMinus");
const popupQtyPlus = document.getElementById("popupQtyPlus");
const popupTotal = document.getElementById("popupTotal");
const saveProductBtn = document.getElementById("saveProductBtn");

let popupProduct = null;
let popupQuantity = 1;
let selectedExtras = [];

//==================================
// OPEN PRODUCT POPUP
//==================================

function openProductPopup(product){
    if(!isRestaurantOpen()){
        updateRestaurantStatus();
        showNotification("We're currently closed","Ordering is unavailable now.");
        return;
    }

    if(!productPopup || !productPopupOverlay) return;

    popupProduct = product;
    popupQuantity = 1;
    selectedExtras = [];

    popupProductName.textContent = product.name || "Product";
    popupProductImage.src = product.image || "images/no-image.png";
    popupProductImage.alt = product.name || "Product";
    popupProductDescription.textContent = product.description || "Freshly prepared for you.";
    popupProductPrice.textContent = Number(product.price || 0);

    renderPopupExtras();
    updatePopupTotal();

    productPopup.classList.add("active");
    productPopupOverlay.classList.add("active");
    productPopup.setAttribute("aria-hidden","false");
    document.body.classList.add("popup-open");
}

function closeProductPopupBox(){
    if(!productPopup || !productPopupOverlay) return;

    productPopup.classList.remove("active");
    productPopupOverlay.classList.remove("active");
    productPopup.setAttribute("aria-hidden","true");
    document.body.classList.remove("popup-open");

    popupProduct = null;
    popupQuantity = 1;
    selectedExtras = [];
}

if(closeProductPopup) closeProductPopup.addEventListener("click",closeProductPopupBox);
if(productPopupOverlay) productPopupOverlay.addEventListener("click",closeProductPopupBox);

//==================================
// RENDER EXTRAS
//==================================

function renderPopupExtras(){
    if(!productExtrasList) return;

    productExtrasList.innerHTML = "";

    if(allExtras.length === 0){
        productExtrasList.innerHTML =
            `<div class="no-extras">No extras available for this product.</div>`;
        return;
    }

    allExtras.forEach(extra=>{
        const stockTracked = Boolean(extra.trackStock);
        const outOfStock = stockTracked && Number(extra.quantity || 0) <= 0;

        const option = document.createElement("label");
        option.className = "extra-option" + (outOfStock ? " extra-out" : "");
        option.dataset.id = extra.id;

        option.innerHTML = `
            <input type="checkbox" ${outOfStock ? "disabled" : ""}>
            <span class="extra-option-check">
                <i class="fa-solid fa-check"></i>
            </span>

            <span class="extra-option-info">
                <strong>${escapeHTML(extra.name || "Extra")}</strong>
                <small>${escapeHTML(extra.description || "")}</small>
            </span>

            <span class="extra-option-price">
                +${Number(extra.price || 0)} EGP
            </span>
        `;

        if(!outOfStock){
            option.addEventListener("click",e=>{
                e.preventDefault();

                const checkbox = option.querySelector("input");
                checkbox.checked = !checkbox.checked;
                option.classList.toggle("selected",checkbox.checked);

                const index = selectedExtras.findIndex(x=>x.id === extra.id);

                if(checkbox.checked){
                    if(index === -1){
                        selectedExtras.push({
                            id:extra.id,
                            name:extra.name || "Extra",
                            price:Number(extra.price || 0),
                            quantity:1
                        });
                    }
                }else{
                    if(index !== -1){
                        selectedExtras.splice(index,1);
                    }
                }

                updatePopupTotal();
            });
        }

        productExtrasList.appendChild(option);
    });
}

//==================================
// POPUP QUANTITY
//==================================

if(popupQtyMinus){
    popupQtyMinus.addEventListener("click",()=>{
        popupQuantity = Math.max(1,popupQuantity - 1);
        updatePopupTotal();
    });
}

if(popupQtyPlus){
    popupQtyPlus.addEventListener("click",()=>{
        popupQuantity++;
        updatePopupTotal();
    });
}

function updatePopupTotal(){
    if(!popupProduct) return;

    if(popupQty) popupQty.textContent = popupQuantity;

    const extrasTotal = selectedExtras.reduce((sum,extra)=>{
        return sum + Number(extra.price || 0) * Number(extra.quantity || 0);
    },0);

    const total =
        (Number(popupProduct.price || 0) + extrasTotal) *
        popupQuantity;

    if(popupTotal) popupTotal.textContent = total;
}

//==================================
// SAVE PRODUCT
//==================================

if(saveProductBtn){
    saveProductBtn.addEventListener("click",()=>{
        if(!popupProduct) return;

        addConfiguredItem(
            popupProduct,
            selectedExtras,
            popupQuantity
        );

        const productName = popupProduct.name || "Product";

        closeProductPopupBox();

        animateCartIcon();

        showNotification(
            "Added to cart",
            `${productName} added with ${selectedExtras.length} extra option${selectedExtras.length === 1 ? "" : "s"}.`
        );

        // المطلوب: السلة تفتح تلقائيا بعد Save
        setTimeout(()=>{
            openCartBox();
        },350);
    });
}

//==================================
// ADD BUTTON
//==================================

document.addEventListener("click",e=>{
    const addButton = e.target.closest(".add-btn");

    if(!addButton) return;

    if(!isRestaurantOpen()){
        updateRestaurantStatus();
        showNotification("We're currently closed","Ordering is unavailable now.");
        return;
    }

    const card = addButton.closest(".menu-card");
    if(!card) return;

    const product = allProducts.find(item=>item.id === card.dataset.id);

    if(!product) return;

    // Add button -> notification/cart animation -> product popup
    animateCartIcon();

    showNotification(
        "Choose your extras",
        `${product.name || "Product"} is ready to customize.`
    );

    setTimeout(()=>{
        openProductPopup(product);
    },450);
});

//==================================
// CHECKOUT
//==================================

const checkoutBtn = document.getElementById("checkoutBtn");

if(checkoutBtn){
    checkoutBtn.addEventListener("click",()=>{
        if(cart.length === 0){
            showNotification("Your cart is empty","Add a product before checkout.");
            return;
        }

        saveCart();
        window.location.href = "checkout.html";
    });
}

//==================================
// NOTIFICATION
//==================================

let notificationTimer = null;

window.showNotification = function(title,message=""){
    const box = document.getElementById("appNotification");
    const titleElement = document.getElementById("notificationTitle");
    const textElement = document.getElementById("notificationText");

    if(!box || !titleElement || !textElement) return;

    titleElement.textContent = title;
    textElement.textContent = message;

    box.classList.remove("show");

    void box.offsetWidth;

    box.classList.add("show");

    clearTimeout(notificationTimer);

    notificationTimer = setTimeout(()=>{
        box.classList.remove("show");
    },2800);
};

//==================================
// CART ICON ANIMATION
//==================================

function animateCartIcon(){
    if(!openCart) return;

    openCart.classList.remove("cart-bump");

    void openCart.offsetWidth;

    openCart.classList.add("cart-bump");

    setTimeout(()=>{
        openCart.classList.remove("cart-bump");
    },650);
}

//==================================
// HTML SAFETY
//==================================

function escapeHTML(value){
    return String(value ?? "")
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");
}

function escapeAttribute(value){
    return escapeHTML(value);
}

//==================================
// START APP
//==================================

updateCart();

await Promise.all([
    loadCategories(),
    loadProducts(),
    loadOffers(),
    loadExtras()
]);

//==================================
// ABOUT / FEEDBACK PAGES
// SHARED PAGE SYSTEM
//==================================


//==================================
// INNER PAGE HEADER
// Same logo animation idea as index
//==================================

const innerPage = document.body.classList.contains("inner-page");
const currentHeader = document.querySelector("header");
const currentHeaderLogo = document.getElementById("header-logo");

if(innerPage && currentHeader){

    currentHeader.classList.add("scrolled");
    currentHeader.classList.add("active");

    if(currentHeaderLogo){
        currentHeaderLogo.style.opacity = "1";
        currentHeaderLogo.style.transform = "scale(1)";
    }

}


//==================================
// ABOUT SCROLL REVEAL
//==================================

const aboutRevealItems = document.querySelectorAll(".about-reveal");

if(aboutRevealItems.length){

    const revealObserver = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if(entry.isIntersecting){

                    entry.target.classList.add("visible");

                    revealObserver.unobserve(entry.target);

                }

            });

        },
        {
            threshold:.12
        }
    );

    aboutRevealItems.forEach(item=>{
        revealObserver.observe(item);
    });

}


//==================================
// FEEDBACK PAGE
//==================================

const feedbackForm =
    document.getElementById("feedbackForm");

const feedbackSuccess =
    document.getElementById("feedbackSuccess");

const feedbackRatingInput =
    document.getElementById("feedbackRating");

const ratingValue =
    document.getElementById("ratingValue");

const starRating =
    document.getElementById("starRating");

const feedbackTypeInput =
    document.getElementById("feedbackType");

const feedbackTypes =
    document.getElementById("feedbackTypes");

const feedbackMessage =
    document.getElementById("feedbackMessage");

const messageCounter =
    document.getElementById("messageCounter");

const whatsappOne =
    document.getElementById("whatsappOne");

const whatsappTwo =
    document.getElementById("whatsappTwo");


//==================================
// HALF STAR RATING
// Click left/right side of star
//==================================

let selectedRating = 0;

if(starRating){

    const stars = [...starRating.querySelectorAll("button")];

    stars.forEach((star,index)=>{

        star.addEventListener("click",event=>{

            const rect = star.getBoundingClientRect();

            const clickX =
                event.clientX - rect.left;

            const isHalf =
                clickX < rect.width / 2;

            selectedRating =
                isHalf
                    ? index + .5
                    : index + 1;

            updateStars();

        });

    });


    function updateStars(){

        stars.forEach((star,index)=>{

            const ratingNumber = index + 1;

            const icon =
                star.querySelector("i");

            star.classList.remove("active");

            icon.className = "fa-solid fa-star";

            if(selectedRating >= ratingNumber){

                star.classList.add("active");

                icon.className =
                    "fa-solid fa-star";

            }else if(
                selectedRating >= ratingNumber - .5
            ){

                star.classList.add("active");

                icon.className =
                    "fa-solid fa-star-half-stroke";

            }

        });


        if(feedbackRatingInput){
            feedbackRatingInput.value =
                selectedRating;
        }

        if(ratingValue){
            ratingValue.textContent =
                `${selectedRating} / 5`;
        }

    }

}


//==================================
// FEEDBACK TYPE
//==================================

if(feedbackTypes){

    const typeButtons =
        feedbackTypes.querySelectorAll(".feedback-type");

    typeButtons.forEach(button=>{

        button.addEventListener("click",()=>{

            typeButtons.forEach(item=>{
                item.classList.remove("selected");
            });

            button.classList.add("selected");

            if(feedbackTypeInput){
                feedbackTypeInput.value =
                    button.dataset.type || "";
            }

        });

    });

}


//==================================
// MESSAGE COUNTER
//==================================

if(feedbackMessage && messageCounter){

    feedbackMessage.addEventListener("input",()=>{

        messageCounter.textContent =
            feedbackMessage.value.length;

    });

}


//==================================
// WHATSAPP LINKS
//==================================

const WHATSAPP_ONE =
    "https://wa.me/message/F7W35X5N36DID1";

const WHATSAPP_TWO =
    "https://wa.me/message/54SHGUF5PUNFN1";


//==================================
// CREATE WHATSAPP MESSAGE
//==================================

function createWhatsAppMessage(){

    const name =
        document.getElementById("feedbackName")?.value.trim() || "";

    const rating =
        feedbackRatingInput?.value || "0";

    const type =
        feedbackTypeInput?.value || "";

    const message =
        feedbackMessage?.value.trim() || "";


    return `Hello Crepe Station,

Feedback from: ${name}
Rating: ${rating}/5
Type: ${type}

Message:
${message}

Sent from Crepe Station website.`;

}


//==================================
// SAVE FEEDBACK TO FIREBASE
//==================================

if(feedbackForm){

    feedbackForm.addEventListener("submit",async event=>{

        event.preventDefault();


        const name =
            document.getElementById("feedbackName")
            ?.value.trim() || "";

        const rating =
            Number(feedbackRatingInput?.value || 0);

        const type =
            feedbackTypeInput?.value || "";

        const message =
            feedbackMessage?.value.trim() || "";


        // Validation

        if(!name){

            showNotification(
                "Name required",
                "Please enter your name."
            );

            return;
        }


        if(rating <= 0){

            showNotification(
                "Rating required",
                "Please choose a rating."
            );

            return;
        }


        if(!type){

            showNotification(
                "Choose feedback type",
                "Please choose the type of your feedback."
            );

            return;
        }


        if(!message){

            showNotification(
                "Message required",
                "Please write your feedback."
            );

            return;
        }


        const sendButton =
            document.getElementById("feedbackSendBtn");


        if(sendButton){

            sendButton.classList.add("loading");

            sendButton.innerHTML = `
                <span>Sending...</span>
                <i class="fa-solid fa-spinner fa-spin"></i>
            `;

        }


        try{

            const { addDoc, collection, serverTimestamp } =
                await import(
                    "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js"
                );


            await addDoc(
                collection(db,"feedback"),
                {
                    name,
                    rating,
                    type,
                    message,
                    createdAt:serverTimestamp(),
                    source:"website"
                }
            );


            // WhatsApp message

            const encodedMessage =
                encodeURIComponent(
                    createWhatsAppMessage()
                );


            if(whatsappOne){

                whatsappOne.href =
                    `${WHATSAPP_ONE}?text=${encodedMessage}`;

            }


            if(whatsappTwo){

                whatsappTwo.href =
                    `${WHATSAPP_TWO}?text=${encodedMessage}`;

            }


            // Hide form

            feedbackForm.style.display =
                "none";


            // Show success

            if(feedbackSuccess){

                feedbackSuccess.classList.add("show");

                setTimeout(()=>{

                    feedbackSuccess.scrollIntoView({
                        behavior:"smooth",
                        block:"center"
                    });

                },100);

            }


        }catch(error){

            console.error(
                "Feedback error:",
                error
            );


            showNotification(
                "Something went wrong",
                "We couldn't send your feedback. Please try again."
            );


            if(sendButton){

                sendButton.classList.remove("loading");

                sendButton.innerHTML = `
                    <span>Send Feedback</span>
                    <i class="fa-solid fa-paper-plane"></i>
                `;

            }

        }

    });

}