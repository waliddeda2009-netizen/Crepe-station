//==================================
// CREPE STATION OFFERS JS
//==================================


import { db } from "../firebase.js";


import {
    collection,
    getDocs,
    addDoc,
    deleteDoc,
    doc,
    updateDoc,
    getDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




//==================================
// ELEMENTS
//==================================


const offerForm = document.getElementById("offerForm");

const offersList = document.getElementById("offersList");

const saveOfferBtn = document.getElementById("saveOfferBtn");



let editId = null;




//==================================
// LOAD OFFERS
//==================================


async function loadOffers(){


    offersList.innerHTML = "";


    const snapshot = await getDocs(
        collection(db,"offers")
    );



    snapshot.forEach((item)=>{


        const offer = item.data();



        offersList.innerHTML += `


        <div class="offer-card">


        <img src="${offer.image || 'images/no-image.png'}">



        <h3>

        ${offer.name}

        </h3>



        <p>

        ${offer.description || ""}

        </p>



        <p>

        Price: ${offer.price} EGP

        </p>




        <button

        class="edit-btn"

        onclick="editOffer('${item.id}')">

        Edit

        </button>





        <button

        class="delete-btn"

        onclick="deleteOffer('${item.id}')">

        Delete

        </button>



        </div>


        `;



    });


}







//==================================
// ADD / UPDATE OFFER
//==================================


offerForm.addEventListener("submit", async(e)=>{


    e.preventDefault();



    const offerData = {


        name:

        document.getElementById("offerName").value,



        description:

        document.getElementById("offerDescription").value,



        image:

        document.getElementById("offerImage").value,



        price:

        Number(
        document.getElementById("offerPrice").value
        )



    };





    if(editId){



        await updateDoc(

            doc(db,"offers",editId),

            offerData

        );



        alert("Offer Updated");



        editId = null;



        saveOfferBtn.innerText =

        "Add Offer";



    }

    else{



        await addDoc(

            collection(db,"offers"),

            offerData

        );



        alert("Offer Added");


    }





    offerForm.reset();


    loadOffers();



});







//==================================
// DELETE OFFER
//==================================


window.deleteOffer = async function(id){



    await deleteDoc(

        doc(db,"offers",id)

    );



    alert("Offer Deleted");


    loadOffers();



};







//==================================
// EDIT OFFER
//==================================


window.editOffer = async function(id){



    const offerRef =

    doc(db,"offers",id);



    const offerSnap =

    await getDoc(offerRef);



    const offer =

    offerSnap.data();





    document.getElementById("offerName").value =

    offer.name || "";



    document.getElementById("offerDescription").value =

    offer.description || "";



    document.getElementById("offerImage").value =

    offer.image || "";



    document.getElementById("offerPrice").value =

    offer.price || "";





    editId = id;



    saveOfferBtn.innerText =

    "Update Offer";



};






//==================================
// LOGOUT
//==================================


const logoutBtn = document.getElementById("logoutBtn");



if(logoutBtn){


    logoutBtn.addEventListener("click",()=>{


        window.location.href = "admin.html";


    });


}







// START

loadOffers();