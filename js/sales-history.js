 //==================================
 // CREPE STATION SALES HISTORY JS
 //==================================


import { db } from "../firebase.js";


import {

collection,
onSnapshot,
doc,
getDoc

}

from

"https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




//==================================
// ELEMENTS
//==================================


const completedOrdersBox =
document.getElementById("completedOrders");


const cancelledOrdersBox =
document.getElementById("cancelledOrders");



const completedTotal =
document.getElementById("completedTotal");


const cancelledTotal =
document.getElementById("cancelledTotal");


const todayTotal =
document.getElementById("todayTotal");


const monthTotal =
document.getElementById("monthTotal");



const todayFilter =
document.getElementById("todayFilter");


const monthFilter =
document.getElementById("monthFilter");


const allFilter =
document.getElementById("allFilter");



const detailsOverlay =
document.getElementById("detailsOverlay");


const detailsContent =
document.getElementById("detailsContent");


const closeDetails =
document.getElementById("closeDetails");






//==================================
// VARIABLES
//==================================


let completedOrders=[];

let cancelledOrders=[];

let currentFilter="all";






//==================================
// LOAD COMPLETED
//==================================


onSnapshot(

collection(db,"orders"),

(snapshot)=>{


completedOrders=[];



snapshot.forEach(item=>{


let order={

id:item.id,

...item.data()

};



if(order.status==="Delivered"){


completedOrders.push(order);


}



});



updatePage();



}

);






//==================================
// LOAD CANCELLED
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



updatePage();



}

);









//==================================
// FILTER BUTTONS
//==================================


todayFilter.onclick=()=>{

currentFilter="today";

updatePage();

};



monthFilter.onclick=()=>{

currentFilter="month";

updatePage();

};



allFilter.onclick=()=>{

currentFilter="all";

updatePage();

};









//==================================
// UPDATE PAGE
//==================================


function updatePage(){



let completed = filterOrders(completedOrders);


let cancelled = filterOrders(cancelledOrders);




displayCompleted(completed);


displayCancelled(cancelled);




calculateTotals();

}





//==================================
// FILTER
//==================================


function filterOrders(list){



if(currentFilter==="all"){


return list;


}




let now=new Date();



return list.filter(order=>{



let date =
order.createdAt?.toDate
?
order.createdAt.toDate()
:
new Date(
order.createdAt || Date.now()
);



if(currentFilter==="today"){



return (

date.getDate()===now.getDate()

&&

date.getMonth()===now.getMonth()

&&

date.getFullYear()===now.getFullYear()

);



}





if(currentFilter==="month"){



return (

date.getMonth()===now.getMonth()

&&

date.getFullYear()===now.getFullYear()

);



}



});



}







//==================================
// DISPLAY COMPLETED
//==================================


function displayCompleted(list){



completedOrdersBox.innerHTML="";



if(list.length===0){


completedOrdersBox.innerHTML=

"<p>No Completed Orders</p>";

return;


}




list.forEach(order=>{



let div=document.createElement("div");



div.className="history-row";



div.innerHTML=`

<div>

<h3>

#${order.orderNumber || "---"}

</h3>


<p>

${order.customerName || "Customer"}

</p>

</div>



<strong>

${order.total || 0} EGP

</strong>

`;



div.onclick=()=>showDetails(order);



completedOrdersBox.appendChild(div);



});



}








//==================================
// DISPLAY CANCELLED
//==================================


function displayCancelled(list){



cancelledOrdersBox.innerHTML="";



if(list.length===0){


cancelledOrdersBox.innerHTML=

"<p>No Cancelled Orders</p>";

return;


}





list.forEach(order=>{



let div=document.createElement("div");



div.className="history-row";



div.innerHTML=`

<div>

<h3>

#${order.orderNumber || "---"}

</h3>



<p>

${order.customerName || "Customer"}

</p>


</div>



<strong>

${order.total || 0} EGP

</strong>


`;



div.onclick=()=>showDetails(order);



cancelledOrdersBox.appendChild(div);



});



}









//==================================
// TOTALS
//==================================


function calculateTotals(){



let completeSum=0;

let cancelSum=0;

let todaySum=0;

let monthSum=0;




let now=new Date();





completedOrders.forEach(order=>{



let price =
Number(order.total || 0);



completeSum+=price;



let date =
order.createdAt?.toDate
?
order.createdAt.toDate()
:
new Date();




if(

date.getDate()===now.getDate()

&&

date.getMonth()===now.getMonth()

&&

date.getFullYear()===now.getFullYear()

){


todaySum+=price;


}




if(

date.getMonth()===now.getMonth()

&&

date.getFullYear()===now.getFullYear()

){


monthSum+=price;


}




});






cancelledOrders.forEach(order=>{


cancelSum += Number(order.total || 0);



});







completedTotal.innerText=

completeSum+" EGP";



cancelledTotal.innerText=

cancelSum+" EGP";



todayTotal.innerText=

todaySum+" EGP";



monthTotal.innerText=

monthSum+" EGP";



}









//==================================
// DETAILS
//==================================


function showDetails(order){



detailsContent.innerHTML=`

<h3>

Order #${order.orderNumber || "---"}

</h3>


<p>

Customer:

${order.customerName || "-"}

</p>


<p>

Phone:

${order.customerPhone || "-"}

</p>


<p>

Address:

${order.customerAddress || "-"}

</p>



<hr>



`;







(order.items || []).forEach(item=>{



detailsContent.innerHTML+=`

<div class="detail-item">


${item.name}

×

${item.quantity || 1}


<br>


${item.price || 0} EGP


${item.note ?

"<br>📝 "+item.note

:""}


</div>

`;



});





detailsContent.innerHTML+=`

<h3>

Total:

${order.total || 0} EGP

</h3>


`;




detailsOverlay.style.display="flex";


}







if(closeDetails){


closeDetails.onclick=()=>{


detailsOverlay.style.display="none";


};


}




if(detailsOverlay){


detailsOverlay.onclick=(e)=>{


if(e.target===detailsOverlay){


detailsOverlay.style.display="none";


}


};


}