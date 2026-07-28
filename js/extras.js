//==================================
// CREPE STATION EXTRAS JS
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


const extraForm = document.getElementById("extraForm");

const extrasList = document.getElementById("extrasList");

const saveExtraBtn = document.getElementById("saveExtraBtn");

const trackStock = document.getElementById("trackStock");

const quantityBox = document.getElementById("quantityBox");

const searchExtra = document.getElementById("searchExtra");



let editId = null;

let allExtras = [];




//==================================
// SHOW / HIDE QUANTITY
//==================================


if(trackStock){


trackStock.addEventListener("change",()=>{


    if(trackStock.checked){


        quantityBox.style.display="block";


    }else{


        quantityBox.style.display="none";


        document.getElementById("extraQuantity").value="";


    }


});


}




//==================================
// LOAD EXTRAS
//==================================


async function loadExtras(){


    if(!extrasList) return;


    extrasList.innerHTML="";


    allExtras=[];


    const snapshot = await getDocs(

        collection(db,"extras")

    );



    snapshot.forEach((item)=>{


        allExtras.push({

            id:item.id,

            ...item.data()

        });


    });



    displayExtras(allExtras);


}
//==================================
// DISPLAY EXTRAS
//==================================


function displayExtras(extras){


    extrasList.innerHTML="";



    if(extras.length === 0){


        extrasList.innerHTML = `


        <div class="empty-box">


        <i class="fa-solid fa-box-open"></i>


        <h3>No Extras Found</h3>


        </div>


        `;


        return;


    }




    extras.forEach(extra=>{



        let stockStatus = "";



        if(extra.trackStock){


            if(extra.quantity <= 0){


                stockStatus = `

                <span class="stock out">

                Out Of Stock

                </span>

                `;


            }

            else if(extra.quantity <= 5){


                stockStatus = `

                <span class="stock low">

                Low Stock: ${extra.quantity}

                </span>

                `;


            }

            else{


                stockStatus = `

                <span class="stock available">

                Available: ${extra.quantity}

                </span>

                `;


            }


        }







        extrasList.innerHTML += `


        <div class="extra-card">


            <img

            src="${extra.image || 'images/no-image.png'}">


            <div class="extra-content">



                <h3>

                ${extra.name}

                </h3>



                <p>

                ${extra.description || ""}

                </p>



                <div class="extra-price">

                ${extra.price} EGP

                </div>




                ${stockStatus}





                <div class="card-buttons">


                <button

                class="edit-btn"

                onclick="editExtra('${extra.id}')">

                Edit

                </button>





                <button

                class="delete-btn"

                onclick="deleteExtra('${extra.id}')">

                Delete

                </button>



                </div>




            </div>



        </div>



        `;



    });



}







//==================================
// SEARCH
//==================================


if(searchExtra){


searchExtra.addEventListener("input",()=>{


    const value = searchExtra.value.toLowerCase();



    const filtered = allExtras.filter(extra=>{


        return extra.name

        .toLowerCase()

        .includes(value);



    });



    displayExtras(filtered);



});



}
//==================================
// ADD / UPDATE EXTRA
//==================================


extraForm.addEventListener("submit", async(e)=>{


    e.preventDefault();



    const extraData = {


        name:

        document.getElementById("extraName").value,



        image:

        document.getElementById("extraImage").value,



        description:

        document.getElementById("extraDescription").value,



        price:

        Number(

        document.getElementById("extraPrice").value

        ),



        trackStock:

        document.getElementById("trackStock").checked,



        quantity:

        Number(

        document.getElementById("extraQuantity").value || 0

        )


    };







    if(editId){



        await updateDoc(

            doc(db,"extras",editId),

            extraData

        );



        alert("Extra Updated");



        editId=null;



        saveExtraBtn.innerText="Add Extra";



    }else{



        await addDoc(

            collection(db,"extras"),

            extraData

        );



        alert("Extra Added");



    }







    extraForm.reset();



    quantityBox.style.display="none";



    loadExtras();



});







//==================================
// DELETE EXTRA
//==================================


window.deleteExtra = async function(id){



    await deleteDoc(

        doc(db,"extras",id)

    );



    alert("Extra Deleted");



    loadExtras();



};







//==================================
// EDIT EXTRA
//==================================


window.editExtra = async function(id){



    const extraRef = doc(db,"extras",id);



    const extraSnap = await getDoc(extraRef);



    const extra = extraSnap.data();






    document.getElementById("extraName").value =

    extra.name || "";




    document.getElementById("extraImage").value =

    extra.image || "";




    document.getElementById("extraDescription").value =

    extra.description || "";




    document.getElementById("extraPrice").value =

    extra.price || "";




    document.getElementById("trackStock").checked =

    extra.trackStock || false;





    document.getElementById("extraQuantity").value =

    extra.quantity || "";





    if(extra.trackStock){

        quantityBox.style.display="block";

    }else{

        quantityBox.style.display="none";

    }






    editId=id;



    saveExtraBtn.innerText="Update Extra";



};








//==================================
// LOGOUT
//==================================


const logoutBtn = document.getElementById("logoutBtn");



if(logoutBtn){


logoutBtn.addEventListener("click",()=>{


    window.location.href="admin.html";


});


}







//==================================
// IMAGE PREVIEW
//==================================


const imageInput = document.getElementById("extraImage");

const previewImg = document.getElementById("previewImg");



if(imageInput && previewImg){


imageInput.addEventListener("input",()=>{


    if(imageInput.value){


        previewImg.src=imageInput.value;


    }else{


        previewImg.src="images/no-image.png";


    }


});


}







//==================================
// START
//==================================


loadExtras();