//==================================
// CREPE STATION PRODUCTS JS
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


const productForm = document.getElementById("productForm");

const productsList = document.getElementById("productsList");

const saveProductBtn = document.getElementById("saveProductBtn");

const categorySelect = document.getElementById("productCategory");



let editId = null;





//==================================
// LOAD CATEGORIES
//==================================


async function loadCategories(){


    if(!categorySelect) return;



    categorySelect.innerHTML = `

    <option value="">
    Select Category
    </option>

    `;



    const snapshot = await getDocs(

        collection(db,"categories")

    );



    snapshot.forEach((item)=>{


        const category = item.data();



        categorySelect.innerHTML += `

        <option value="${category.name}">

        ${category.name}

        </option>

        `;


    });



}






//==================================
// LOAD PRODUCTS
//==================================


async function loadProducts(){


    productsList.innerHTML = "";



    const snapshot = await getDocs(

        collection(db,"products")

    );



    snapshot.forEach((item)=>{


        const product = item.data();



        productsList.innerHTML += `


        <div class="product-card">



        <img src="${product.image || 'images/no-image.png'}">





        <h3>

        ${product.name}

        </h3>





        <p>

        ${product.description || ""}

        </p>





        <p>

        Price: ${product.price} EGP

        </p>





        <p>

        Category: ${product.category || ""}

        </p>





        <button

        class="edit-btn"

        onclick="editProduct('${item.id}')">

        Edit

        </button>






        <button

        class="delete-btn"

        onclick="deleteProduct('${item.id}')">

        Delete

        </button>




        </div>



        `;



    });



}







//==================================
// ADD / UPDATE PRODUCT
//==================================


productForm.addEventListener("submit", async(e)=>{


    e.preventDefault();




    const productData = {



        name:

        document.getElementById("productName").value.trim(),




        image:

        document.getElementById("productImage").value.trim(),





        description:

        document.getElementById("productDescription").value.trim(),





        price:

        Number(
        document.getElementById("productPrice").value
        ),





        category:

        document.getElementById("productCategory").value,





        trackStock:

        document.getElementById("trackStock").checked




    };





    if(editId){



        await updateDoc(

            doc(db,"products",editId),

            productData

        );



        alert("Product Updated");



        editId = null;



        saveProductBtn.innerText = "Add Product";



    }

    else{



        await addDoc(

            collection(db,"products"),

            {

                ...productData,

                quantity:0,

                available:true,

                createdAt:Date.now()

            }

        );



        alert("Product Added");


    }





    productForm.reset();



    loadProducts();



});








//==================================
// EDIT PRODUCT
//==================================


window.editProduct = async(id)=>{


    const productSnap = await getDoc(

        doc(db,"products",id)

    );



    const product = productSnap.data();





    document.getElementById("productName").value =
    product.name || "";



    document.getElementById("productImage").value =
    product.image || "";



    document.getElementById("productDescription").value =
    product.description || "";



    document.getElementById("productPrice").value =
    product.price || "";



    document.getElementById("productCategory").value =
    product.category || "";



    document.getElementById("trackStock").checked =
    product.trackStock || false;




    editId = id;



    saveProductBtn.innerText = "Update Product";



};









//==================================
// DELETE PRODUCT
//==================================


window.deleteProduct = async(id)=>{


    if(confirm("Delete this product?")){


        await deleteDoc(

            doc(db,"products",id)

        );


        loadProducts();


    }



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
// START
//==================================


loadCategories();

loadProducts();