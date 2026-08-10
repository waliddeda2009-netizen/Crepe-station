// ==================================
// CREPE STATION
// SALES HISTORY JS
// ==================================


// ==================================
// FIREBASE
// ==================================

import { db } from "../firebase.js";

import {
    collection,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ==================================
// ELEMENTS
// ==================================

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


// ==================================
// VARIABLES
// ==================================

let completedOrders = [];

let cancelledOrders = [];

let currentFilter = "all";


// ==================================
// LOAD COMPLETED ORDERS
// ==================================

onSnapshot(
    collection(db, "orders"),

    (snapshot) => {

        completedOrders = [];

        snapshot.forEach((item) => {

            const order = {
                id: item.id,
                ...item.data()
            };


            if (order.status === "Delivered") {

                completedOrders.push(order);

            }

        });


        updatePage();

    },

    (error) => {

        console.error(
            "Error loading completed orders:",
            error
        );

        completedOrdersBox.innerHTML =
            `<p class="empty-history">
                Unable to load completed orders.
            </p>`;

    }
);


// ==================================
// LOAD CANCELLED ORDERS
// ==================================

onSnapshot(
    collection(db, "cancelled"),

    (snapshot) => {

        cancelledOrders = [];

        snapshot.forEach((item) => {

            cancelledOrders.push({

                id: item.id,

                ...item.data()

            });

        });


        updatePage();

    },

    (error) => {

        console.error(
            "Error loading cancelled orders:",
            error
        );

        cancelledOrdersBox.innerHTML =
            `<p class="empty-history">
                Unable to load cancelled orders.
            </p>`;

    }
);


// ==================================
// FILTER BUTTONS
// ==================================

todayFilter?.addEventListener(
    "click",
    () => {

        setFilter("today");

    }
);


monthFilter?.addEventListener(
    "click",
    () => {

        setFilter("month");

    }
);


allFilter?.addEventListener(
    "click",
    () => {

        setFilter("all");

    }
);


// ==================================
// SET FILTER
// ==================================

function setFilter(filter) {

    currentFilter = filter;

    updateFilterButtons();

    updatePage();

}


// ==================================
// UPDATE FILTER BUTTONS
// ==================================

function updateFilterButtons() {

    todayFilter?.classList.toggle(
        "active",
        currentFilter === "today"
    );


    monthFilter?.classList.toggle(
        "active",
        currentFilter === "month"
    );


    allFilter?.classList.toggle(
        "active",
        currentFilter === "all"
    );

}


// ==================================
// UPDATE PAGE
// ==================================

function updatePage() {

    const completed =
        filterOrders(completedOrders);


    const cancelled =
        filterOrders(cancelledOrders);


    displayCompleted(completed);

    displayCancelled(cancelled);

    calculateTotals();

}


// ==================================
// GET ORDER DATE
// ==================================

function getOrderDate(order) {

    if (!order?.createdAt) {

        return null;

    }


    try {

        if (
            typeof order.createdAt.toDate ===
            "function"
        ) {

            return order.createdAt.toDate();

        }


        if (
            order.createdAt instanceof Date
        ) {

            return order.createdAt;

        }


        const date =
            new Date(order.createdAt);


        if (!isNaN(date.getTime())) {

            return date;

        }

    } catch (error) {

        console.error(
            "Invalid order date:",
            error
        );

    }


    return null;

}


// ==================================
// FILTER ORDERS
// ==================================

function filterOrders(list) {

    if (currentFilter === "all") {

        return sortOrders(list);

    }


    const now = new Date();


    const filtered = list.filter((order) => {

        const date =
            getOrderDate(order);


        if (!date) {

            return false;

        }


        // TODAY

        if (currentFilter === "today") {

            return (

                date.getDate() ===
                now.getDate()

                &&

                date.getMonth() ===
                now.getMonth()

                &&

                date.getFullYear() ===
                now.getFullYear()

            );

        }


        // THIS MONTH

        if (currentFilter === "month") {

            return (

                date.getMonth() ===
                now.getMonth()

                &&

                date.getFullYear() ===
                now.getFullYear()

            );

        }


        return true;

    });


    return sortOrders(filtered);

}


// ==================================
// SORT ORDERS
// ==================================

function sortOrders(list) {

    return [...list].sort((a, b) => {

        const dateA =
            getOrderDate(a)?.getTime() || 0;

        const dateB =
            getOrderDate(b)?.getTime() || 0;


        return dateB - dateA;

    });

}


// ==================================
// DISPLAY COMPLETED
// ==================================

function displayCompleted(list) {

    completedOrdersBox.innerHTML = "";


    if (list.length === 0) {

        completedOrdersBox.innerHTML =

            `<p class="empty-history">
                No Completed Orders
            </p>`;

        return;

    }


    list.forEach((order) => {

        const div =
            document.createElement("div");


        div.className =
            "history-row";


        div.innerHTML = `

            <div>

                <h3>
                    #${order.orderNumber || "---"}
                </h3>

                <p>
                    ${escapeHTML(
                        order.customerName ||
                        "Customer"
                    )}
                </p>

            </div>


            <strong>
                ${formatMoney(order.total)}
                EGP
            </strong>

        `;


        div.addEventListener(
            "click",
            () => showDetails(order)
        );


        completedOrdersBox.appendChild(div);

    });

}


// ==================================
// DISPLAY CANCELLED
// ==================================

function displayCancelled(list) {

    cancelledOrdersBox.innerHTML = "";


    if (list.length === 0) {

        cancelledOrdersBox.innerHTML =

            `<p class="empty-history">
                No Cancelled Orders
            </p>`;

        return;

    }


    list.forEach((order) => {

        const div =
            document.createElement("div");


        div.className =
            "history-row";


        div.innerHTML = `

            <div>

                <h3>
                    #${order.orderNumber || "---"}
                </h3>

                <p>
                    ${escapeHTML(
                        order.customerName ||
                        "Customer"
                    )}
                </p>

            </div>


            <strong>
                ${formatMoney(order.total)}
                EGP
            </strong>

        `;


        div.addEventListener(
            "click",
            () => showDetails(order)
        );


        cancelledOrdersBox.appendChild(div);

    });

}


// ==================================
// CALCULATE TOTALS
// ==================================

function calculateTotals() {

    let completeSum = 0;

    let cancelSum = 0;

    let todaySum = 0;

    let monthSum = 0;


    const now = new Date();


    // ==================================
    // COMPLETED
    // ==================================

    completedOrders.forEach((order) => {

        const price =
            Number(order.total) || 0;


        completeSum += price;


        const date =
            getOrderDate(order);


        if (!date) {

            return;

        }


        // TODAY

        if (

            date.getDate() ===
            now.getDate()

            &&

            date.getMonth() ===
            now.getMonth()

            &&

            date.getFullYear() ===
            now.getFullYear()

        ) {

            todaySum += price;

        }


        // THIS MONTH

        if (

            date.getMonth() ===
            now.getMonth()

            &&

            date.getFullYear() ===
            now.getFullYear()

        ) {

            monthSum += price;

        }

    });


    // ==================================
    // CANCELLED
    // ==================================

    cancelledOrders.forEach((order) => {

        cancelSum +=
            Number(order.total) || 0;

    });


    // ==================================
    // UPDATE UI
    // ==================================

    completedTotal.textContent =
        `${formatMoney(completeSum)} EGP`;


    cancelledTotal.textContent =
        `${formatMoney(cancelSum)} EGP`;


    todayTotal.textContent =
        `${formatMoney(todaySum)} EGP`;


    monthTotal.textContent =
        `${formatMoney(monthSum)} EGP`;

}


// ==================================
// SHOW ORDER DETAILS
// ==================================

function showDetails(order) {

    if (!detailsOverlay || !detailsContent) {

        return;

    }


    const items =
        Array.isArray(order.items)
            ? order.items
            : [];


    detailsContent.innerHTML = `

        <div class="detail-item">

            <strong>
                Order:
            </strong>

            #${order.orderNumber || "---"}

        </div>


        <div class="detail-item">

            <strong>
                Customer:
            </strong>

            ${escapeHTML(
                order.customerName ||
                "-"
            )}

        </div>


        <div class="detail-item">

            <strong>
                Phone:
            </strong>

            ${escapeHTML(
                order.customerPhone ||
                "-"
            )}

        </div>


        <div class="detail-item">

            <strong>
                Address:
            </strong>

            ${escapeHTML(
                order.customerAddress ||
                "-"
            )}

        </div>


        <div class="detail-item">

            <strong>
                Status:
            </strong>

            ${escapeHTML(
                order.status ||
                "Cancelled"
            )}

        </div>


        <hr
            style="
                border:0;
                border-top:
                1px solid
                rgba(255,255,255,.15);
                margin:18px 0;
            "
        >


        <h3
            style="
                color:#d4af37;
                margin-bottom:15px;
            "
        >
            Items
        </h3>

    `;


    // ==================================
    // ITEMS
    // ==================================

    if (items.length === 0) {

        detailsContent.innerHTML += `

            <p class="empty-history">
                No items found.
            </p>

        `;

    } else {

        items.forEach((item) => {

            const itemName =
                escapeHTML(
                    item.name ||
                    "Product"
                );


            const quantity =
                Number(item.quantity) || 1;


            const price =
                Number(item.price) || 0;


            detailsContent.innerHTML += `

                <div class="detail-item">

                    <strong>
                        ${itemName}
                    </strong>

                    <br>

                    Quantity:
                    ${quantity}

                    <br>

                    Price:
                    ${formatMoney(price)}
                    EGP

                    ${
                        item.note
                            ? `
                                <br>
                                📝
                                ${escapeHTML(
                                    item.note
                                )}
                              `
                            : ""
                    }

                </div>

            `;

        });

    }


    // ==================================
    // TOTAL
    // ==================================

    detailsContent.innerHTML += `

        <div
            class="detail-item"
            style="
                margin-top:15px;
                border-color:
                rgba(212,175,55,.4);
            "
        >

            <strong
                style="
                    color:#d4af37;
                    font-size:20px;
                "
            >
                Total:
                ${formatMoney(order.total)}
                EGP
            </strong>

        </div>

    `;


    // ==================================
    // OPEN POPUP
    // ==================================

    detailsOverlay.classList.add("show");

    detailsOverlay.setAttribute(
        "aria-hidden",
        "false"
    );


    document.body.style.overflow =
        "hidden";

}


// ==================================
// CLOSE DETAILS
// ==================================

function hideDetails() {

    if (!detailsOverlay) {

        return;

    }


    detailsOverlay.classList.remove("show");

    detailsOverlay.setAttribute(
        "aria-hidden",
        "true"
    );


    document.body.style.overflow =
        "";

}


// ==================================
// CLOSE BUTTON
// ==================================

closeDetails?.addEventListener(
    "click",
    hideDetails
);


// ==================================
// CLOSE WHEN CLICKING OUTSIDE
// ==================================

detailsOverlay?.addEventListener(
    "click",
    (event) => {

        if (
            event.target ===
            detailsOverlay
        ) {

            hideDetails();

        }

    }
);


// ==================================
// ESC KEY
// ==================================

document.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Escape" &&
            detailsOverlay?.classList.contains("show")
        ) {

            hideDetails();

        }

    }
);


// ==================================
// FORMAT MONEY
// ==================================

function formatMoney(value) {

    const number =
        Number(value) || 0;


    return number.toLocaleString(
        "en-US",
        {
            maximumFractionDigits: 2
        }
    );

}


// ==================================
// ESCAPE HTML
// ==================================

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


// ==================================
// INITIAL FILTER STATE
// ==================================

updateFilterButtons();