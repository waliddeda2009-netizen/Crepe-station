//==================================
// CREPE STATION ORDER STATUS JS
// FINAL CLEAN VERSION
//==================================


import { db } from "../firebase.js";


import {

doc,
onSnapshot,
updateDoc,
collection,
addDoc,
serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




//==================================
// ELEMENTS
//==================================


const statusIcon =
document.getElementById("statusIcon");


const statusTitle =
document.getElementById("statusTitle");


const statusMessage =
document.getElementById("statusMessage");


const orderNumber =
document.getElementById("orderNumber");


const deliveryTime =
document.getElementById("deliveryTime");


const customerTimer =
document.getElementById("customerTimer");


const timerTitle =
document.getElementById("timerTitle");


const orderItems =
document.getElementById("orderItems");


const orderTotal =
document.getElementById("orderTotal");



const cancelOrderBtn =
document.getElementById("cancelOrderBtn");


const cancelOverlay =
document.getElementById("cancelOverlay");


const confirmCancel =
document.getElementById("confirmCancel");


const closeCancel =
document.getElementById("closeCancel");






//==================================
// VARIABLES
//==================================


let timerInterval=null;


let currentOrder=null;






//==================================
// PHONE NOTIFICATION
//==================================


function showPhoneNotification(title,text){


let note=document.createElement("div");


note.className="mobile-toast";


note.innerHTML=`

<strong>${title}</strong>

<br>

<span>${text}</span>

`;



document.body.appendChild(note);




setTimeout(()=>{


note.classList.add("show");


},100);





setTimeout(()=>{


note.classList.remove("show");



setTimeout(()=>{


note.remove();


},400);



},3500);



}






//==================================
// GET CURRENT ORDER
//==================================


const orderId =

localStorage.getItem("currentOrder");




if(!orderId){


statusTitle.innerText="No Order Found";


statusMessage.innerText=

"We couldn't find your order.";



}

else{



const orderRef =

doc(db,"orders",orderId);





onSnapshot(orderRef,(snapshot)=>{



if(snapshot.exists()){



currentOrder={


id:orderId,


...snapshot.data()


};



showStatus(currentOrder);



}

else{


statusTitle.innerText="Order Not Found";


}



});



}
//==================================
// SHOW ORDER ITEMS
//==================================


function showOrderItems(order){


if(!orderItems) return;



orderItems.innerHTML="";





(order.items || []).forEach(item=>{



let extras="";



if(item.selectedExtras && item.selectedExtras.length){



extras=item.selectedExtras.map(extra=>{


return `

<div class="extra">

+ ${extra.name}

</div>

`;



}).join("");



}





orderItems.innerHTML+=`

<div class="order-item">


<div>

${item.name}

× ${item.quantity || 1}

</div>



<strong>

${item.price || 0} EGP

</strong>



${extras}


</div>

`;



});






if(orderTotal){



orderTotal.innerText=

(order.total || 0)+" EGP";


}



}







//==================================
// SHOW STATUS
//==================================


function showStatus(order){

    clearTimer();



orderNumber.innerText=

"#"+(order.orderNumber || "---");



showOrderItems(order);





//==================================
// CANCEL BUTTON CONTROL
//==================================


if(cancelOrderBtn){



if(

order.status==="Pending"

||

order.status==="Preparing"

||

order.status==="Delivery"

||

!order.status

){


cancelOrderBtn.style.display="flex";

cancelOrderBtn.disabled=false;


}

else{


cancelOrderBtn.style.display="none";

cancelOrderBtn.disabled=true;


}


}






//==================================
// PENDING
//==================================


if(order.status==="Pending" || !order.status){



statusIcon.innerHTML=

`

<i class="fa-solid fa-clock"></i>

`;



statusTitle.innerText=

"Order Received";



statusMessage.innerText=

"Your order is waiting for kitchen confirmation.";



deliveryTime.innerText="";



clearTimer();


customerTimer.innerText="";



}






//==================================
// PREPARING
//==================================


else if(order.status==="Preparing"){



statusIcon.innerHTML=

`

<i class="fa-solid fa-fire"></i>

`;



statusTitle.innerText=

"Preparing";



statusMessage.innerText=

"Kitchen is preparing your meal.";




startCustomerTimer(

order.remainingTime ?? order.preparingTime,

"Preparing Time"

);



}






//==================================
// DELIVERY
//==================================


else if(order.status==="Delivery"){


statusIcon.innerHTML=
`
<i class="fa-solid fa-motorcycle"></i>
`;


statusTitle.innerText="On The Way";


statusMessage.innerText=
"Your order is with delivery driver.";


clearTimer();

customerTimer.innerText="";


deliveryTime.innerText=
"Expected Delivery : 25 - 40 Minutes";


}






//==================================
// DELIVERED
//==================================


else if(order.status==="Delivered"){



statusIcon.innerHTML=

`

<i class="fa-solid fa-check"></i>

`;



statusTitle.innerText=

"Delivered";



statusMessage.innerText=

"Your order has arrived. Enjoy your meal ❤️";



deliveryTime.innerText="";


customerTimer.innerText="";


clearTimer();



}






//==================================
// CANCELLED
//==================================


else if(order.status==="Cancelled"){



statusIcon.innerHTML=

`

<i class="fa-solid fa-ban"></i>

`;



statusTitle.innerText=

"Cancelled";



statusMessage.innerText=

"Your order has been cancelled.";



deliveryTime.innerText="";


customerTimer.innerText="";


clearTimer();



if(cancelOrderBtn){

cancelOrderBtn.style.display="none";

}



}




updateSteps(order.status);



}
//==================================
// CUSTOMER TIMER
//==================================


function startCustomerTimer(time,title){

clearTimer();


if(!time || !customerTimer){

return;

}



let seconds = time;



if(timerTitle){

timerTitle.innerText = title;

}



// عرض الوقت أول ما يفتح

showCustomerTime(seconds);





timerInterval = setInterval(async()=>{


seconds--;



if(seconds <= 0){


clearTimer();


customerTimer.innerText="Arriving Soon";



if(currentOrder){


await updateDoc(

doc(db,"orders",currentOrder.id),

{

remainingTime:0

}

);


}



return;


}





showCustomerTime(seconds);





// حفظ الوقت الحالي في Firestore

if(currentOrder){


await updateDoc(

doc(db,"orders",currentOrder.id),

{

remainingTime:seconds

}

);


}




},1000);



}







function showCustomerTime(seconds){


let minutes = Math.floor(seconds / 60);


let sec = seconds % 60;



customerTimer.innerText =

String(minutes).padStart(2,"0")

+

":"

+

String(sec).padStart(2,"0");


}







//==================================
// CLEAR TIMER
//==================================


function clearTimer(){



if(timerInterval){


clearInterval(timerInterval);


timerInterval=null;


}


}








//==================================
// STATUS PROGRESS
//==================================


function updateSteps(status){



const steps =

document.querySelectorAll(".step");




steps.forEach(step=>{


step.classList.remove("active");


});





let count=1;





if(status==="Preparing"){


count=2;


}



else if(status==="Delivery"){


count=3;


}



else if(status==="Delivered"){


count=4;


}





for(let i=0;i<count;i++){



if(steps[i]){


steps[i].classList.add("active");


}



}



}








//==================================
// OPEN CANCEL POPUP
//==================================


if(cancelOrderBtn){



cancelOrderBtn.onclick=()=>{



if(!currentOrder)
return;





// منع الفتح لو Delivered


if(currentOrder.status==="Delivered"){



showPhoneNotification(

"Cannot Cancel",

"Order already delivered"

);



return;


}




cancelOverlay.style.display="flex";



};



}






//==================================
// CLOSE CANCEL POPUP
//==================================


if(closeCancel){



closeCancel.onclick=()=>{



cancelOverlay.style.display="none";



};



}







//==================================
// CLICK OUTSIDE POPUP
//==================================


if(cancelOverlay){



cancelOverlay.onclick=(e)=>{



if(e.target===cancelOverlay){



cancelOverlay.style.display="none";



}



};



}
//==================================
// CONFIRM CANCEL ORDER
//==================================


if(confirmCancel){



confirmCancel.onclick=async()=>{



if(!currentOrder)
return;





// منع الإلغاء بعد التسليم


if(currentOrder.status==="Delivered"){



cancelOverlay.style.display="none";



showPhoneNotification(

"Cannot Cancel",

"Order already delivered"

);



return;



}





cancelOverlay.style.display="none";






try{



// تحديث حالة الأوردر


await updateDoc(

doc(db,"orders",currentOrder.id),

{


status:"Cancelled",

cancelledAt:Date.now(),

cancelledBy:"Customer",

cancelReason:"Customer cancelled the order"


}

);







// حفظ نسخة في cancelled


await addDoc(

collection(db,"cancelled"),

{


...currentOrder,


status:"Cancelled",


cancelledBy:"Customer",


cancelReason:"Customer cancelled the order",


createdAt:serverTimestamp()


}

);








if(cancelOrderBtn){


cancelOrderBtn.style.display="none";


}







showPhoneNotification(

"Order Cancelled",

"Your order has been cancelled successfully"

);






}



catch(error){



console.log(error);



showPhoneNotification(

"Error",

"Cancel failed"

);



}



};



}