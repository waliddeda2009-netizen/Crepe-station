//==================================
// CREPE STATION CHECKOUT JS
//==================================

import { db } from "../firebase.js";

import {
collection,
addDoc,
serverTimestamp,
getDocs,
doc,
getDoc,
setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


//==================================
// CART
//==================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];

let allExtras = [];

let productExtras = [];

let orderExtras = [];

let selectedOrderExtras = [];


const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const confirmOrder = document.getElementById("confirmOrder");


//==================================
// LOAD EXTRAS
//==================================

async function loadExtras(){

const snapshot = await getDocs(
collection(db,"extras")
);


allExtras=[];


snapshot.forEach(item=>{

allExtras.push({

id:item.id,

...item.data()

});

});



productExtras = allExtras.filter(extra=>

extra.type==="product"

);



orderExtras = allExtras.filter(extra=>

extra.type==="order"

);



displayCheckout();


}


//==================================
// CALCULATE TOTAL
//==================================

function calculateTotal(){

let total=0;


cart.forEach(item=>{


total += item.price * item.quantity;



if(item.selectedExtras){


item.selectedExtras.forEach(extra=>{


total += extra.price * item.quantity;


});


}


});



selectedOrderExtras.forEach(extra=>{


total += extra.price;


});



return total;

}
//==================================
// DISPLAY CHECKOUT
//==================================

function displayCheckout(){

if(!checkoutItems) return;


checkoutItems.innerHTML="";


cart.forEach((item,index)=>{


if(!item.selectedExtras){

item.selectedExtras=[];

}



let extrasText="";



if(item.selectedExtras.length){


extrasText=item.selectedExtras.map(extra=>`


<div class="selected-extra">

+ ${extra.name} (${extra.price} EGP)

</div>


`).join("");



}



checkoutItems.innerHTML += `


<div class="checkout-item">


<h4>

${item.name}

</h4>



<p>

${item.quantity} × ${item.price} EGP

</p>



<div class="product-extra-box">


${extrasText}



<button

class="add-product-extra"

onclick="openProductExtras(${index})">

+ Add Extras

</button>




<textarea

class="product-note"

placeholder="Add note for this item..."

oninput="saveItemNote(${index},this.value)"
>${item.note || ""}</textarea>



</div>



</div>


`;



});





checkoutItems.innerHTML += `


<div class="order-extra-section">


<button

class="add-order-extra"

onclick="openOrderExtras()">

+ Order Extras

</button>


</div>


`;





if(checkoutTotal){

checkoutTotal.innerText =
calculateTotal()+" EGP";


}


}



//==================================
// OPEN PRODUCT EXTRAS
//==================================

window.openProductExtras=function(index){


let html=`


<div class="extras-popup">


<h2>
Choose Extras
</h2>


`;



productExtras.forEach(extra=>{


let checked = cart[index].selectedExtras.some(
e=>e.id===extra.id
);


html += `


<label class="extra-option">


<input

type="checkbox"

${checked ? "checked":""}

onchange="toggleProductExtra(${index},'${extra.id}')">


<span>

${extra.name}

</span>



<b>

+${extra.price} EGP

</b>


</label>


`;


});



html += `


<button onclick="closeExtrasPopup()">

Done

</button>


</div>


`;



showExtrasPopup(html);


}





//==================================
// TOGGLE PRODUCT EXTRA
//==================================

window.toggleProductExtra=function(index,id){


const extra = productExtras.find(e=>e.id===id);


if(!extra)return;



let item = cart[index];


let exist = item.selectedExtras.find(
e=>e.id===id
);



if(exist){


item.selectedExtras =
item.selectedExtras.filter(
e=>e.id!==id
);


}else{


item.selectedExtras.push(extra);


}



localStorage.setItem(
"cart",
JSON.stringify(cart)
);


displayCheckout();


}
//==================================
// ORDER EXTRAS
//==================================


window.openOrderExtras=function(){


let html=`


<div class="extras-popup">


<h2>

Order Extras

</h2>


`;



orderExtras.forEach(extra=>{


let checked = selectedOrderExtras.some(
e=>e.id===extra.id
);



html += `


<label class="extra-option">


<input

type="checkbox"

${checked ? "checked":""}

onchange="toggleOrderExtra('${extra.id}')">


<span>

${extra.name}

</span>



<b>

+${extra.price} EGP

</b>


</label>


`;


});



html += `


<button onclick="closeExtrasPopup()">

Done

</button>


</div>


`;



showExtrasPopup(html);


}





window.toggleOrderExtra=function(id){


const extra =
orderExtras.find(e=>e.id===id);



if(!extra)return;



const exist =
selectedOrderExtras.find(e=>e.id===id);



if(exist){


selectedOrderExtras =
selectedOrderExtras.filter(
e=>e.id!==id
);



}else{


selectedOrderExtras.push(extra);


}



displayCheckout();


}





//==================================
// POPUP
//==================================


function showExtrasPopup(content){


let popup=document.createElement("div");


popup.id="extrasPopup";


popup.innerHTML=content;


document.body.appendChild(popup);


}




window.closeExtrasPopup=function(){


let popup =
document.getElementById("extrasPopup");



if(popup){

popup.remove();

}


displayCheckout();


}





//==================================
// SAVE NOTE
//==================================


window.saveItemNote=function(index,note){


cart[index].note=note;


localStorage.setItem(

"cart",

JSON.stringify(cart)

);


}





//==================================
// ORDER NUMBER
//==================================


async function getOrderNumber(){


const counterRef =
doc(
db,
"counters",
"dailyOrders"
);



const counterSnap =
await getDoc(counterRef);



const now = new Date();



const today =

now.getDate()
.toString()
.padStart(2,"0")
+
"-"
+
(now.getMonth()+1)
.toString()
.padStart(2,"0")
+
"-"
+
now.getFullYear();




let count=1;



if(counterSnap.exists()){


let data=counterSnap.data();



if(data.date===today){


count=data.count+1;


}



}



await setDoc(counterRef,{

date:today,

count:count

});




return count.toString().padStart(3,"0");



}
//==================================
// SEND ORDER
//==================================


if(confirmOrder){


confirmOrder.addEventListener("click",async()=>{



const name =
document.getElementById("customerName").value;



const phone =
document.getElementById("customerPhone").value;



const address =
document.getElementById("customerAddress").value;





if(!name || !phone || !address){


showNotification("Please fill all fields");

return;


}





if(cart.length===0){


showNotification("Your cart is empty");


return;


}





try{



const orderNumber =
await getOrderNumber();





const orderRef = await addDoc(

collection(db,"orders"),

{


customerName:name,


customerPhone:phone,


customerAddress:address,


orderNumber:orderNumber,



items:cart,



orderExtras:selectedOrderExtras,



total:calculateTotal(),



// مهم: أول حالة
status:"Pending",



// لا يوجد عداد قبل قبول الأدمن

preparingTime:0,

deliveryRemainingTime:0,



createdAt:serverTimestamp()



}

);






// حفظ رقم الأوردر للعميل

localStorage.setItem(

"currentOrder",

orderRef.id

);







showNotification("Order Sent Successfully");





localStorage.removeItem("cart");






window.location.href="order-status.html";





}catch(error){



console.log(error);



showNotification("Error Sending Order");



}




});


}





//==================================
// START
//==================================


displayCheckout();


loadExtras();
window.showNotification = function(message){


const box = document.getElementById("appNotification");

const text = document.getElementById("notificationText");


if(!box || !text) return;



text.innerText = message;


box.classList.add("show");



setTimeout(()=>{

box.classList.remove("show");

},3000);



}