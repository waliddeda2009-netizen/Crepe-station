//==================================
// CREPE STATION CATEGORIES JS
//==================================


//==================================
// FIREBASE
//==================================


import { db } from "../firebase.js";


import {

collection,
addDoc,
getDocs,
deleteDoc,
doc,
updateDoc,
getDoc

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";




//==================================
// ELEMENTS
//==================================


const categoryForm = document.getElementById("categoryForm");

const categoryName = document.getElementById("categoryName");

const categoriesList = document.getElementById("categoriesList");

const categoryProducts = document.getElementById("categoryProducts");

const saveCategoryBtn = document.getElementById("saveCategoryBtn");

const logoutBtn = document.getElementById("logoutBtn");



let editId = null;






//==================================
// LOAD CATEGORIES
//==================================


async function loadCategories(){


    categoriesList.innerHTML = "";



    const snapshot = await getDocs(

        collection(db,"categories")

    );



    snapshot.forEach((item)=>{


        const category = item.data();



        categoriesList.innerHTML += `


        <div class="category-card">


            <h3>

            ${category.name}

            </h3>



            <button

            class="view-btn"

            onclick="viewCategoryProducts('${category.name}')">


            View Products


            </button>





            <button

            class="edit-btn"

            onclick="editCategory('${item.id}')">


            Edit


            </button>





            <button

            class="delete-btn"

            onclick="deleteCategory('${item.id}')">


            Delete


            </button>



        </div>


        `;



    });



}









//==================================
// ADD / UPDATE CATEGORY
//==================================


categoryForm.addEventListener("submit", async(e)=>{


    e.preventDefault();



    const name = categoryName.value.trim();




    if(name === "") return;







    if(editId){



        await updateDoc(

            doc(db,"categories",editId),

            {

                name:name

            }

        );



        editId = null;



        saveCategoryBtn.innerText = "Add Category";



    }

    else{



        await addDoc(

            collection(db,"categories"),

            {

                name:name,

                createdAt:Date.now()

            }

        );



    }






    categoryForm.reset();



    loadCategories();



});









//==================================
// EDIT CATEGORY
//==================================


window.editCategory = async(id)=>{


    const categorySnap = await getDoc(

        doc(db,"categories",id)

    );



    const category = categorySnap.data();




    categoryName.value = category.name;



    editId = id;



    saveCategoryBtn.innerText = "Update Category";



};









//==================================
// DELETE CATEGORY WITH CHECK
//==================================


window.deleteCategory = async(id)=>{



    const confirmDelete = confirm(

        "Delete this category?"

    );



    if(!confirmDelete) return;






    // GET CATEGORY NAME


    const categorySnap = await getDoc(

        doc(db,"categories",id)

    );



    const category = categorySnap.data();








    // CHECK PRODUCTS


    const productsSnapshot = await getDocs(

        collection(db,"products")

    );



    let hasProducts = false;





    productsSnapshot.forEach((item)=>{


        const product = item.data();




        if(product.category === category.name){


            hasProducts = true;


        }



    });









    if(hasProducts){


        alert(

        "Cannot delete this category because it has products."

        );


        return;


    }








    // DELETE CATEGORY


    await deleteDoc(

        doc(db,"categories",id)

    );



    alert("Category Deleted");



    loadCategories();



};









//==================================
// VIEW PRODUCTS INSIDE CATEGORY
//==================================


window.viewCategoryProducts = async function(categoryName){



    categoryProducts.innerHTML = "";



    const snapshot = await getDocs(

        collection(db,"products")

    );



    let found = false;





    snapshot.forEach((item)=>{


        const product = item.data();




        if(product.category === categoryName){



            found = true;





            categoryProducts.innerHTML += `


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



            </div>



            `;



        }



    });








    if(!found){


        categoryProducts.innerHTML = `

        <p>

        No Products In This Category

        </p>

        `;


    }






    // SCROLL TO PRODUCTS


    categoryProducts.scrollIntoView({

        behavior:"smooth"

    });



};









//==================================
// LOGOUT
//==================================


if(logoutBtn){


    logoutBtn.addEventListener("click",()=>{


        localStorage.removeItem("adminLogin");


        window.location.href="admin.html";


    });


}









//==================================
// START
//==================================


loadCategories();