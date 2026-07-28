//==================================
// CREPE STATION MAIN JS
//==================================



//==================================
// HEADER + LOGO
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
// SIDEBAR
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


menuIcon.className="fa-solid fa-xmark";


}else{


menuIcon.className="fa-solid fa-bars";


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

".coming-soon"

);




animatedItems.forEach(item=>{


item.style.opacity="0";

item.style.transform="translateY(40px)";

item.style.transition=".8s ease";


});





function showAnimation(){


animatedItems.forEach(item=>{


const position = item.getBoundingClientRect().top;



if(position < window.innerHeight - 80){


item.style.opacity="1";

item.style.transform="translateY(0)";


}



});


}




window.addEventListener("scroll",showAnimation);


showAnimation();