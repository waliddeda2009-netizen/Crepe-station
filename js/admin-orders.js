//==================================
// CREPE STATION ADMIN ORDERS JS
// FINAL KITCHEN VERSION
//==================================


import { db } from "../firebase.js";


import {

collection,
onSnapshot,
doc,
updateDoc,
serverTimestamp

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";





//==================================
// TOAST
//==================================


function showToast(message){


let toast=document.getElementById("toast");



if(!toast){


toast=document.createElement("div");

toast.id="toast";

document.body.appendChild(toast);


}



toast.innerText=message;


toast.classList.add("show");



setTimeout(()=>{


toast.classList.remove("show");


},2500);


}







//==================================
// ELEMENTS
//==================================


const acceptBox=
document.getElementById("acceptBox");


const readyBox=
document.getElementById("readyBox");


const deliveryBox=
document.getElementById("deliveryBox");


const deliveredBox=
document.getElementById("deliveredBox");




const acceptCount=
document.getElementById("acceptCount");


const readyCount=
document.getElementById("readyCount");


const deliveryCount=
document.getElementById("deliveryCount");


const deliveredCount=
document.getElementById("deliveredCount");






const ordersOverlay=
document.getElementById("ordersOverlay");


const ordersTitle=
document.getElementById("ordersTitle");


const ordersBody=
document.getElementById("ordersBody");


const closeOrders=
document.getElementById("closeOrders");






const detailsOverlay=
document.getElementById("detailsOverlay");


const closeDetails=
document.getElementById("closeDetails");





const detailsNumber=
document.getElementById("detailsNumber");


const detailsCustomer=
document.getElementById("detailsCustomer");


const detailsPhone=
document.getElementById("detailsPhone");


const detailsAddress=
document.getElementById("detailsAddress");


const detailsItems=
document.getElementById("detailsItems");


const detailsTotal=
document.getElementById("detailsTotal");





const detailsTimer=
document.getElementById("detailsTimer");


const addTime=
document.getElementById("addTime");


const nextStatus=
document.getElementById("nextStatus");




const deliveryTimeBox=
document.getElementById("deliveryTimeBox");


const deliveryFrom=
document.getElementById("deliveryFrom");


const deliveryTo=
document.getElementById("deliveryTo");






//==================================
// VARIABLES
//==================================


let orders=[];


let currentOrder=null;


let timer=null;





//==================================
// LOAD ORDERS
//==================================


onSnapshot(

collection(db,"orders"),


(snapshot)=>{


orders=[];



snapshot.forEach(item=>{


orders.push({

id:item.id,

...item.data()

});


});



updateCounters();


}



);





//==================================
// COUNTERS
//==================================


function updateCounters(){



if(acceptCount){


acceptCount.innerText=


orders.filter(order=>

!order.status ||

order.status==="Pending"

).length;


}





if(readyCount){


readyCount.innerText=


orders.filter(order=>

order.status==="Preparing"

).length;


}





if(deliveryCount){


deliveryCount.innerText=


orders.filter(order=>

order.status==="Delivery"

).length;


}





if(deliveredCount){


deliveredCount.innerText=


orders.filter(order=>

order.status==="Delivered"

).length;


}



}
//==================================
// OPEN STATUS BOXES
//==================================


if(acceptBox){


acceptBox.onclick=()=>{


showOrders("Pending");


};


}




if(readyBox){


readyBox.onclick=()=>{


showOrders("Preparing");


};


}





if(deliveryBox){


deliveryBox.onclick=()=>{


showOrders("Delivery");


};


}





if(deliveredBox){


deliveredBox.onclick=()=>{


showOrders("Delivered");


};


}








//==================================
// SHOW ORDERS
//==================================


function showOrders(status){



let filtered=orders.filter(order=>{



if(status==="Pending"){


return !order.status ||

order.status==="Pending";


}





return order.status===status;



});





if(filtered.length===0){



showToast("No Orders");



ordersOverlay.style.display="none";


return;


}







ordersTitle.innerText=

status+" Orders";




ordersBody.innerHTML="";





filtered.forEach(order=>{



let row=document.createElement("div");



row.className="order-row";





row.innerHTML=`

<h3>

#${order.orderNumber || "---"}

</h3>


<p>

${order.customerName || "Customer"}

</p>


<p>

${order.total || 0} EGP

</p>


`;







row.onclick=()=>{


showDetails(order);


};




ordersBody.appendChild(row);



});






ordersOverlay.style.display="flex";



}







//==================================
// CLOSE ORDERS
//==================================


if(closeOrders){



closeOrders.onclick=()=>{


ordersOverlay.style.display="none";


};


}





if(ordersOverlay){



ordersOverlay.onclick=(e)=>{



if(e.target===ordersOverlay){


ordersOverlay.style.display="none";


}


};


}








//==================================
// SHOW DETAILS
//==================================


function showDetails(order){



currentOrder=order;





detailsNumber.innerText=

"#"+(order.orderNumber || "---");





detailsCustomer.innerText=

order.customerName || "-";





detailsPhone.innerText=

order.customerPhone || "-";





detailsAddress.innerText=

order.customerAddress || "-";






detailsTotal.innerText=

(order.total || 0)+" EGP";






detailsItems.innerHTML="";






(order.items || []).forEach(item=>{



let div=document.createElement("div");



div.className="item";




div.innerHTML=

`

<div>

${item.name}

×

${item.quantity || 1}

</div>


<div>

${item.price || 0} EGP

</div>


<div>

📝 ${item.note || "No Note"}

</div>

`;



detailsItems.appendChild(div);



});








// إظهار وقت التوصيل عند التحضير فقط


if(deliveryTimeBox){



if(order.status==="Preparing"){


deliveryTimeBox.style.display="block";


}

else{


deliveryTimeBox.style.display="none";


}


}






startTimer(order);



updateButton(order.status || "Pending");




detailsOverlay.style.display="flex";



}







//==================================
// CLOSE DETAILS
//==================================


function closeDetailsBox(){



detailsOverlay.style.display="none";



clearInterval(timer);



currentOrder=null;



}







if(closeDetails){


closeDetails.onclick=closeDetailsBox;


}





if(detailsOverlay){



detailsOverlay.onclick=(e)=>{



if(e.target===detailsOverlay){


closeDetailsBox();


}



};


}
//==================================
// TIMER SYSTEM
//==================================


function formatTime(seconds){


let minutes=Math.floor(seconds/60);


let sec=seconds%60;


return (

String(minutes).padStart(2,"0")

+

":"

+

String(sec).padStart(2,"0")

);

}








function startTimer(order){


clearInterval(timer);



if(order.status==="Delivered"){


detailsTimer.innerText="Completed";


if(addTime){

addTime.style.display="none";

}


return;


}





let seconds = 
order.remainingTime 
?? 
order.preparingTime 
?? 
2100;





if(!order.status || order.status==="Pending"){



if(addTime){

addTime.style.display="block";

}



showTime(seconds);


return;


}






if(order.status==="Preparing"){



if(addTime){

addTime.style.display="block";

}



seconds =
order.remainingTime 
?? 
order.preparingTime 
?? 
2100;



}







if(order.status==="Delivery"){



seconds =
order.deliveryRemainingTime 
?? 
0;



if(addTime){

addTime.style.display="none";

}



}







runTimer(seconds);



}










function runTimer(seconds){


clearInterval(timer);



showTime(seconds);




timer=setInterval(async()=>{



if(seconds<=0){



clearInterval(timer);



showTime(0);



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





seconds--;



showTime(seconds);





if(currentOrder){



currentOrder.remainingTime=seconds;



await updateDoc(

doc(db,"orders",currentOrder.id),

{

remainingTime:seconds

}

);


}





},1000);



}










function showTime(seconds){


detailsTimer.innerText=

formatTime(seconds);


}








//==================================
// ADD TIME BUTTON
//==================================


if(addTime){



addTime.onclick=async()=>{



if(!currentOrder)

return;





let time=

currentOrder.preparingTime || 2100;



time+=900;





// في New الحد 60 دقيقة


if(

!currentOrder.status ||

currentOrder.status==="Pending"

){



if(time>3600){


time=3600;


}


}






await updateDoc(



doc(db,"orders",currentOrder.id),


{


preparingTime:time


}


);






currentOrder.preparingTime=time;



showTime(time);



showToast("Time Updated");



};


}








//==================================
// BUTTON TEXT
//==================================


function updateButton(status){



if(!nextStatus)

return;





nextStatus.disabled=false;





if(!status || status==="Pending"){


nextStatus.innerText="Accept";


}





else if(status==="Preparing"){


nextStatus.innerText="Ready";


}





else if(status==="Delivery"){


nextStatus.innerText="Delivered";


}





else{


nextStatus.innerText="Completed";


nextStatus.disabled=true;


}



}
//==================================
// CHANGE ORDER STATUS
//==================================


if(nextStatus){



nextStatus.onclick=async()=>{



if(!currentOrder)

return;





// Pending -> Preparing

if(!currentOrder.status || currentOrder.status==="Pending"){

let time=currentOrder.preparingTime || 2100;


await updateDoc(
doc(db,"orders",currentOrder.id),
{
status:"Preparing",
preparingTime:time,
startedPreparingAt:Date.now()
}
);





showToast("Order Accepted");



closeDetailsBox();



return;


}








//==============================
// Preparing -> Delivery Ready
//==============================


if(currentOrder.status==="Preparing"){



let from=

Number(deliveryFrom.value);



let to=

Number(deliveryTo.value);






if(!from || !to){



showToast("Enter Delivery Time");


return;


}







let seconds=

((from+to)/2)*60;






await updateDoc(



doc(db,"orders",currentOrder.id),


{


status:"Delivery",


deliveryRemainingTime:seconds,


deliveryTime:{


from:from,


to:to


},


deliveryStartedAt:Date.now()


}


);






showToast("Sent Delivery");



closeDetailsBox();



return;



}








//==============================
// Delivery -> Delivered
//==============================


if(currentOrder.status==="Delivery"){



await updateDoc(



doc(db,"orders",currentOrder.id),


{


status:"Delivered",


deliveredAt:Date.now()


}


);






showToast("Delivered");



closeDetailsBox();



}



};


}







//==================================
// CANCELLED ORDERS
//==================================


const cancelledBtn =
document.getElementById("cancelledBtn");


const cancelledOverlay =
document.getElementById("cancelledOverlay");


const closeCancelled =
document.getElementById("closeCancelled");


const cancelledBody =
document.getElementById("cancelledBody");


const cancelCount =
document.getElementById("cancelCount");



let cancelledOrders=[];





//==================================
// LOAD CANCELLED ORDERS
//==================================


onSnapshot(

collection(db,"cancelled"),


(snapshot)=>{


cancelledOrders=[];



snapshot.forEach(item=>{


cancelledOrders.push({

id:item.id,

...item.data()

});


});




// تحديث الرقم بجانب Cancelled Orders


if(cancelCount){


let count = cancelledOrders.length;



cancelCount.innerText = count;



if(count > 0){


cancelCount.style.display="flex";


}else{


cancelCount.style.display="none";


}


}



}

);







//==================================
// OPEN CANCELLED POPUP
//==================================


if(cancelledBtn){


cancelledBtn.onclick=(e)=>{


e.preventDefault();



if(!cancelledBody)
return;




cancelledBody.innerHTML="";





if(cancelledOrders.length===0){



cancelledBody.innerHTML=`

<p>
No Cancelled Orders
</p>

`;



}

else{



cancelledOrders.forEach(order=>{



let div=document.createElement("div");



div.className="cancelled-row";



div.innerHTML=`

<h3>

#${order.orderNumber || "---"}

</h3>



<p>

${order.customerName || "Customer"}

</p>



<p>

${order.total || 0} EGP

</p>


`;



cancelledBody.appendChild(div);



});



}







cancelledOverlay.style.display="flex";



};


}






//==================================
// CLOSE CANCELLED POPUP
//==================================


if(closeCancelled){



closeCancelled.onclick=()=>{


cancelledOverlay.style.display="none";


};


}





if(cancelledOverlay){



cancelledOverlay.onclick=(e)=>{



if(e.target===cancelledOverlay){


cancelledOverlay.style.display="none";


}



};


}








//==================================
// HELP POPUP
//==================================


const howToUseBtn=
document.getElementById("howToUseBtn");


const helpOverlay=
document.getElementById("helpOverlay");


const closeHelp=
document.getElementById("closeHelp");




if(howToUseBtn){



howToUseBtn.onclick=(e)=>{


e.preventDefault();


helpOverlay.style.display="flex";


};



}





if(closeHelp){


closeHelp.onclick=()=>{


helpOverlay.style.display="none";


};


}







console.log(

"Crepe Station Admin Orders Loaded Successfully"

);