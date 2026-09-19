/* =========================================================
   UP YATRA - MAIN JAVASCRIPT
   =========================================================
   Features:
   - Destination Loading
   - Advanced Search
   - Category Filters
   - Interactive Map
   - Favourites
   - Smart Trip Planner
   - Contact Form
   - Gallery Lightbox
   - Dark Mode
   - Mobile Menu
   - Scroll Reveal
   - Progress Bar
   - Back To Top
   - Live Weather
   - Real UPSTDC Stays
   - WhatsApp Contact for Stays
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let destinations = [];
let favorites = new Set();

let currentFilter = "All";
let currentSearch = "";

let currentModalSlug = null;

let galleryItems = [];
let galleryIndex = 0;

let weatherData = null;


/* =========================================================
   SHORTCUT
========================================================= */

const $ = (id) => document.getElementById(id);


/* =========================================================
   API HELPER
========================================================= */

async function api(url, options = {}) {

    try {

        const response = await fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        });

        const contentType =
            response.headers.get("content-type") || "";

        let data = {};

        if (contentType.includes("application/json")) {

            data = await response.json();

        } else {

            const text = await response.text();

            throw new Error(
                text || `Server error: ${response.status}`
            );

        }

        if (!response.ok) {

            throw new Error(
                data.error ||
                data.message ||
                `Request failed: ${response.status}`
            );

        }

        return data;

    } catch (error) {

        console.error("API Error:", error);

        throw error;

    }

}


/* =========================================================
   PAGE LOAD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "UP Yatra JavaScript loaded successfully"
        );

        try {

            await loadDestinations();

            await loadFavorites();

        } catch (error) {

            console.error(
                "Initial loading error:",
                error
            );

            showToast(
                "Website data load nahi ho pa raha."
            );

        }

        setupFilters();
        setupSearch();
        setupUI();
        setupGallery();
        setupModal();
        setupPlanner();
        setupContactForm();
        setupWeather();
        setupStay();
        setupReveal();

        updateProgress();

    }
);


/* =========================================================
   LOAD DESTINATIONS
========================================================= */

async function loadDestinations() {

    try {

        const data =
            await api("/api/destinations");

        if (Array.isArray(data)) {

            destinations = data;

        } else {

            destinations = [];

            console.error(
                "Invalid destinations response:",
                data
            );

        }

        console.log(
            "Destinations loaded:",
            destinations.length
        );

        renderDestinations();


        const planDestination =
            $("planDestination");

        if (planDestination) {

            planDestination.innerHTML =
                destinations.map(destination => {

                    return `
                        <option value="${escapeHtml(
                            destination.slug
                        )}">
                            ${escapeHtml(
                                destination.name
                            )}
                        </option>
                    `;

                }).join("");

        }

    } catch (error) {

        console.error(
            "Destination loading error:",
            error
        );

        throw error;

    }

}


/* =========================================================
   LOAD FAVOURITES
========================================================= */

async function loadFavorites() {

    try {

        const data =
            await api("/api/favorites");

        if (Array.isArray(data)) {

            favorites =
                new Set(data);

        } else {

            favorites =
                new Set();

        }

        updateFavoriteUI();

    } catch (error) {

        console.error(
            "Favorites loading error:",
            error
        );

        favorites =
            new Set();

        updateFavoriteUI();

    }

}


/* =========================================================
   SEARCHABLE DESTINATION TEXT
========================================================= */

function getSearchableText(destination) {

    return [

        destination.name,
        destination.category,
        destination.location,
        destination.short,
        destination.description,
        destination.food,
        destination.places,
        destination.best_time,
        destination.slug

    ]
    .filter(
        value =>
            value !== null &&
            value !== undefined
    )
    .join(" ")
    .toLowerCase();

}


/* =========================================================
   FILTER DESTINATIONS
========================================================= */

function getFilteredDestinations() {

    let filtered =
        [...destinations];

    if (
        currentFilter &&
        currentFilter !== "All"
    ) {

        filtered =
            filtered.filter(destination => {

                return String(
                    destination.category || ""
                ).toLowerCase() ===
                String(
                    currentFilter
                ).toLowerCase();

            });

    }

    if (
        currentSearch &&
        currentSearch.trim() !== ""
    ) {

        const searchText =
            currentSearch
                .trim()
                .toLowerCase();

        filtered =
            filtered.filter(destination => {

                return getSearchableText(
                    destination
                ).includes(searchText);

            });

    }

    return filtered;

}


/* =========================================================
   RENDER DESTINATIONS
========================================================= */

function renderDestinations() {

    const grid =
        $("destinationGrid");

    if (!grid) {

        console.error(
            "destinationGrid not found!"
        );

        return;

    }

    const filtered =
        getFilteredDestinations();

    if (!filtered.length) {

        grid.innerHTML = `

            <div
                class="muted"
                style="
                    grid-column:1/-1;
                    padding:50px 20px;
                    text-align:center;
                "
            >

                <div
                    style="
                        font-size:42px;
                        margin-bottom:12px;
                    "
                >
                    🔍
                </div>

                <h3>
                    No UP destination found
                </h3>

                <p>
                    Search ya category change karke
                    dobara try karo.
                </p>

                <button
                    class="btn primary"
                    style="margin-top:18px;"
                    onclick="clearSearch()"
                >
                    Show All Destinations
                </button>

            </div>

        `;

        return;

    }

    grid.innerHTML =
        filtered.map(destination => {

            const slug =
                String(
                    destination.slug || ""
                );

            const name =
                String(
                    destination.name || ""
                );

            const image =
                String(
                    destination.image || ""
                );

            const category =
                String(
                    destination.category || ""
                );

            const location =
                String(
                    destination.location || ""
                );

            const short =
                String(
                    destination.short || ""
                );

            const isFavorite =
                favorites.has(slug);

            return `

                <article
                    class="destination-card reveal visible"
                >

                    <div class="card-image">

                        <img
                            src="${escapeHtml(image)}"
                            alt="${escapeHtml(name)}"
                            loading="lazy"
                            onerror="this.style.display='none'"
                        >

                        <span class="tag card-tag">
                            ${escapeHtml(category)}
                        </span>

                        <button
                            type="button"
                            class="heart ${
                                isFavorite
                                    ? "saved"
                                    : ""
                            }"
                            onclick="toggleFavorite('${escapeJs(slug)}')"
                            aria-label="Save ${escapeHtml(name)}"
                        >
                            ${
                                isFavorite
                                    ? "♥"
                                    : "♡"
                            }
                        </button>

                    </div>

                    <div class="card-body">

                        <span class="muted">
                            📍 ${escapeHtml(location)}
                        </span>

                        <h3>
                            ${escapeHtml(name)}
                        </h3>

                        <p>
                            ${escapeHtml(short)}
                        </p>

                        <div class="card-actions">

                            <button
                                type="button"
                                class="small-btn main"
                                onclick="openDestination('${escapeJs(slug)}')"
                            >
                                Explore
                            </button>

                            <button
                                type="button"
                                class="small-btn"
                                onclick="chooseForPlanner('${escapeJs(slug)}')"
                            >
                                Plan
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("");

}


/* =========================================================
   CATEGORY FILTERS
========================================================= */

function setupFilters() {

    const filterButtons =
        document.querySelectorAll(".filter");

    filterButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                filterButtons.forEach(
                    item =>
                        item.classList.remove("active")
                );

                this.classList.add("active");

                currentFilter =
                    this.dataset.filter ||
                    "All";

                renderDestinations();

                const section =
                    $("destinations");

                if (section) {

                    section.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

                }

            }
        );

    });

}


/* =========================================================
   SEARCH SETUP
========================================================= */

function setupSearch() {

    const searchInput =
        $("heroSearch");

    const searchButton =
        $("searchBtn");

    if (!searchInput) {

        console.error(
            "heroSearch input not found!"
        );

        return;

    }

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                performSearch(
                    searchInput.value
                );

            }
        );

    }

    searchInput.addEventListener(
        "keydown",
        function (event) {

            if (event.key === "Enter") {

                event.preventDefault();

                performSearch(
                    searchInput.value
                );

            }

        }
    );

    searchInput.addEventListener(
        "input",
        function () {

            const value =
                this.value.trim();

            if (value === "") {

                currentSearch = "";

                renderDestinations();

                return;

            }

            if (value.length >= 2) {

                currentSearch =
                    value;

                renderDestinations();

            }

        }
    );

}


/* =========================================================
   PERFORM SEARCH
========================================================= */

function performSearch(value) {

    const query =
        String(value || "").trim();

    if (!query) {

        currentSearch = "";

        renderDestinations();

        scrollToDestinations();

        showToast(
            "Showing all UP destinations"
        );

        return;

    }

    currentSearch =
        query;

    renderDestinations();

    const searchText =
        query.toLowerCase();

    const matches =
        destinations.filter(
            destination =>
                getSearchableText(
                    destination
                ).includes(searchText)
        );

    scrollToDestinations();

    if (matches.length > 0) {

        showToast(
            `${matches.length} destination${
                matches.length > 1
                    ? "s"
                    : ""
            } found`
        );

    } else {

        showToast(
            "No matching UP destination found"
        );

    }

}


/* =========================================================
   SCROLL TO DESTINATIONS
========================================================= */

function scrollToDestinations() {

    const section =
        $("destinations");

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

window.clearSearch =
function () {

    const input =
        $("heroSearch");

    if (input) {

        input.value = "";

    }

    currentSearch = "";
    currentFilter = "All";

    document
        .querySelectorAll(".filter")
        .forEach(button => {

            button.classList.remove(
                "active"
            );

        });

    const allButton =
        document.querySelector(
            '.filter[data-filter="All"]'
        );

    if (allButton) {

        allButton.classList.add(
            "active"
        );

    }

    renderDestinations();
    scrollToDestinations();

};


/* =========================================================
   OPEN DESTINATION
========================================================= */

window.openDestination =
function (slug) {

    const destination =
        destinations.find(
            item =>
                String(item.slug) ===
                String(slug)
        );

    if (!destination) {

        showToast(
            "Destination details not found"
        );

        return;

    }

    currentModalSlug =
        destination.slug;

    const modal =
        $("destinationModal");

    if (!modal) return;

    const modalImage =
        $("modalImage");

    if (modalImage) {

        modalImage.src =
            destination.image || "";

        modalImage.alt =
            destination.name || "";

    }

    if ($("modalCategory")) {

        $("modalCategory").textContent =
            destination.category || "";

    }

    if ($("modalTitle")) {

        $("modalTitle").textContent =
            destination.name || "";

    }

    if ($("modalDescription")) {

        $("modalDescription").textContent =
            destination.description || "";

    }

    if ($("modalLocation")) {

        $("modalLocation").textContent =
            destination.location || "";

    }

    if ($("modalTime")) {

        $("modalTime").textContent =
            destination.best_time || "";

    }

    if ($("modalFood")) {

        $("modalFood").textContent =
            destination.food || "";

    }

    if ($("modalPlaces")) {

        $("modalPlaces").textContent =
            destination.places || "";

    }

    if ($("modalMap")) {

        $("modalMap").href =
            `https://www.google.com/maps/search/?api=1&query=${
                encodeURIComponent(
                    `${destination.name}, Uttar Pradesh`
                )
            }`;

    }

    if ($("modalFav")) {

        $("modalFav").textContent =
            favorites.has(destination.slug)
                ? "♥ Saved Favourite"
                : "♡ Save Favourite";

    }

    modal.classList.remove("hidden");

    document.body.style.overflow =
        "hidden";

};


/* =========================================================
   CLOSE DESTINATION MODAL
========================================================= */

function closeDestinationModal() {

    const modal =
        $("destinationModal");

    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }

    document.body.style.overflow = "";

}


/* =========================================================
   MODAL SETUP
========================================================= */

function setupModal() {

    const modal =
        $("destinationModal");

    const closeButton =
        $("modalClose");

    const favouriteButton =
        $("modalFav");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeDestinationModal
        );

    }

    if (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    closeDestinationModal();

                }

            }
        );

    }

    if (favouriteButton) {

        favouriteButton.addEventListener(
            "click",
            function () {

                if (currentModalSlug) {

                    toggleFavorite(
                        currentModalSlug
                    );

                }

            }
        );

    }

}


/* =========================================================
   PLANNER DESTINATION
========================================================= */

window.chooseForPlanner =
function (slug) {

    const planner =
        $("planner");

    const select =
        $("planDestination");

    if (!select) {

        showToast(
            "Planner is not available"
        );

        return;

    }

    select.value = slug;

    if (planner) {

        planner.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

};


/* =========================================================
   FAVOURITES
========================================================= */

window.toggleFavorite =
async function (slug) {

    try {

        if (favorites.has(slug)) {

            await api(
                `/api/favorites/${encodeURIComponent(slug)}`,
                {
                    method: "DELETE"
                }
            );

            favorites.delete(slug);

            showToast(
                "Removed from favourites"
            );

        } else {

            await api(
                "/api/favorites",
                {
                    method: "POST",
                    body: JSON.stringify({
                        slug: slug
                    })
                }
            );

            favorites.add(slug);

            showToast(
                "Added to favourites ♥"
            );

        }

        renderDestinations();
        updateFavoriteUI();

        if (currentModalSlug === slug) {

            const modalFav =
                $("modalFav");

            if (modalFav) {

                modalFav.textContent =
                    favorites.has(slug)
                        ? "♥ Saved Favourite"
                        : "♡ Save Favourite";

            }

        }

    } catch (error) {

        console.error(
            "Favorite error:",
            error
        );

        showToast(
            error.message ||
            "Favourite update failed"
        );

    }

};


/* =========================================================
   FAVOURITE COUNT
========================================================= */

function updateFavoriteUI() {

    const count =
        $("favCount");

    if (count) {

        count.textContent =
            favorites.size;

    }

}


/* =========================================================
   SHOW FAVOURITES
========================================================= */

function showFavorites() {

    const saved =
        destinations.filter(
            destination =>
                favorites.has(
                    destination.slug
                )
        );

    if (!saved.length) {

        showToast(
            "No favourites saved yet"
        );

        return;

    }

    currentSearch = "";

    const grid =
        $("destinationGrid");

    if (!grid) return;

    grid.innerHTML =
        saved.map(destination => {

            return `

                <article
                    class="destination-card reveal visible"
                >

                    <div class="card-image">

                        <img
                            src="${escapeHtml(
                                destination.image || ""
                            )}"
                            alt="${escapeHtml(
                                destination.name || ""
                            )}"
                            loading="lazy"
                        >

                        <span class="tag card-tag">
                            ${escapeHtml(
                                destination.category || ""
                            )}
                        </span>

                        <button
                            type="button"
                            class="heart saved"
                            onclick="toggleFavorite('${escapeJs(
                                destination.slug
                            )}')"
                        >
                            ♥
                        </button>

                    </div>

                    <div class="card-body">

                        <span class="muted">
                            📍
                            ${escapeHtml(
                                destination.location || ""
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                destination.name || ""
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                destination.short || ""
                            )}
                        </p>

                        <div class="card-actions">

                            <button
                                type="button"
                                class="small-btn main"
                                onclick="openDestination('${escapeJs(
                                    destination.slug
                                )}')"
                            >
                                Explore
                            </button>

                            <button
                                type="button"
                                class="small-btn"
                                onclick="chooseForPlanner('${escapeJs(
                                    destination.slug
                                )}')"
                            >
                                Plan
                            </button>

                        </div>

                    </div>

                </article>

            `;

        }).join("");

    scrollToDestinations();

    showToast(
        `${saved.length} favourite destination${
            saved.length > 1
                ? "s"
                : ""
        }`
    );

}


/* =========================================================
   SMART TRIP PLANNER
========================================================= */

function setupPlanner() {

    const plannerForm =
        $("plannerForm");

    if (!plannerForm) return;

    plannerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const result =
                $("plannerResult");

            if (!result) return;

            result.classList.remove("hidden");

            result.innerHTML = `

                <p class="muted">
                    Creating your smart itinerary...
                </p>

            `;

            try {

                const data =
                    await api(
                        "/api/plan",
                        {
                            method: "POST",
                            body: JSON.stringify({

                                destination:
                                    $("planDestination")
                                        ?.value,

                                days:
                                    $("planDays")
                                        ?.value,

                                budget:
                                    $("planBudget")
                                        ?.value,

                                travel_type:
                                    $("planType")
                                        ?.value

                            })
                        }
                    );

                const days =
                    Array.isArray(data.days)
                        ? data.days
                        : [];

                result.innerHTML = `

                    <p class="eyebrow">
                        YOUR PERSONALIZED PLAN
                    </p>

                    <h3>
                        ${escapeHtml(
                            data.title || ""
                        )}
                    </h3>

                    <p class="muted">
                        ${escapeHtml(
                            data.description || ""
                        )}
                    </p>

                    <div class="plan-days">

                        ${
                            days.map(day => `

                                <div class="day-box">

                                    <b>
                                        Day
                                        ${escapeHtml(
                                            day.day
                                        )}
                                    </b>

                                    <h4>
                                        ${escapeHtml(
                                            day.title || ""
                                        )}
                                    </h4>

                                    <p>
                                        <strong>
                                            Morning:
                                        </strong>
                                        ${escapeHtml(
                                            day.morning || ""
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Afternoon:
                                        </strong>
                                        ${escapeHtml(
                                            day.afternoon || ""
                                        )}
                                    </p>

                                    <p>
                                        <strong>
                                            Evening:
                                        </strong>
                                        ${escapeHtml(
                                            day.evening || ""
                                        )}
                                    </p>

                                </div>

                            `).join("")
                        }

                    </div>

                `;

                showToast(
                    "Trip plan generated and saved"
                );

                result.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            } catch (error) {

                console.error(
                    "Planner error:",
                    error
                );

                result.innerHTML = `

                    <p>
                        ⚠️
                        ${escapeHtml(
                            error.message ||
                            "Unable to create trip plan"
                        )}
                    </p>

                `;

            }

        }
    );

}


/* =========================================================
   CONTACT FORM
========================================================= */

function setupContactForm() {

    const form =
        $("contactForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            try {

                const data =
                    await api(
                        "/api/contact",
                        {
                            method: "POST",
                            body: JSON.stringify({

                                name:
                                    $("contactName")
                                        ?.value || "",

                                email:
                                    $("contactEmail")
                                        ?.value || "",

                                subject:
                                    $("contactSubject")
                                        ?.value || "",

                                message:
                                    $("contactMessage")
                                        ?.value || ""

                            })
                        }
                    );

                showToast(
                    data.message ||
                    "Message sent successfully"
                );

                form.reset();

            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );

                showToast(
                    error.message ||
                    "Message send nahi ho saka"
                );

            }

        }
    );

}


/* =========================================================
   INTERACTIVE UP MAP
========================================================= */

function setupMap() {

    const pins =
        document.querySelectorAll(
            ".map-pin"
        );

    pins.forEach(pin => {

        pin.addEventListener(
            "click",
            function () {

                const slug =
                    this.dataset.slug;

                if (!slug) return;

                openDestination(slug);

            }
        );

    });

}


/* =========================================================
   MAIN UI
========================================================= */

function setupUI() {

    const menuButton =
        $("menuBtn");

    const navLinks =
        $("navLinks");

    if (menuButton && navLinks) {

        menuButton.addEventListener(
            "click",
            function () {

                navLinks.classList.toggle(
                    "open"
                );

            }
        );

        navLinks
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener(
                    "click",
                    function () {

                        navLinks.classList.remove(
                            "open"
                        );

                    }
                );

            });

    }


    /* DARK MODE */

    const themeButton =
        $("themeBtn");

    if (themeButton) {

        themeButton.addEventListener(
            "click",
            function () {

                document.body.classList.toggle(
                    "dark"
                );

                localStorage.setItem(
                    "upTheme",
                    document.body.classList.contains(
                        "dark"
                    )
                        ? "dark"
                        : "light"
                );

            }
        );

    }

    if (
        localStorage.getItem("upTheme") ===
        "dark"
    ) {

        document.body.classList.add(
            "dark"
        );

    }


    /* FAVOURITES */

    const favButton =
        $("favNavBtn");

    if (favButton) {

        favButton.addEventListener(
            "click",
            showFavorites
        );

    }


    /* MAP */

    setupMap();


    /* SCROLL */

    window.addEventListener(
        "scroll",
        function () {

            updateProgress();

            const backTop =
                $("backTop");

            if (backTop) {

                backTop.style.display =
                    window.scrollY > 500
                        ? "block"
                        : "none";

            }

        }
    );


    /* BACK TO TOP */

    const backTop =
        $("backTop");

    if (backTop) {

        backTop.addEventListener(
            "click",
            function () {

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }

        );

    }

}


/* =========================================================
   GALLERY
========================================================= */

function setupGallery() {

    galleryItems =
        Array.from(
            document.querySelectorAll(
                ".gallery-item"
            )
        );

    galleryItems.forEach(
        function (item, index) {

            item.addEventListener(
                "click",
                function () {

                    openLightbox(index);

                }
            );

        }
    );

    const closeButton =
        $("lightClose");

    const previousButton =
        $("lightPrev");

    const nextButton =
        $("lightNext");

    const lightbox =
        $("lightbox");

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeLightbox
        );

    }

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                changeGallery(-1);

            }
        );

    }

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                changeGallery(1);

            }
        );

    }

    if (lightbox) {

        lightbox.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    lightbox
                ) {

                    closeLightbox();

                }

            }
        );

    }

    document.addEventListener(
        "keydown",
        function (event) {

            const box =
                $("lightbox");

            if (
                !box ||
                box.classList.contains("hidden")
            ) {

                return;

            }

            if (event.key === "Escape") {

                closeLightbox();

            }

            if (event.key === "ArrowLeft") {

                changeGallery(-1);

            }

            if (event.key === "ArrowRight") {

                changeGallery(1);

            }

        }
    );

}


/* =========================================================
   OPEN LIGHTBOX
========================================================= */

function openLightbox(index) {

    if (!galleryItems.length) {

        return;

    }

    galleryIndex = index;

    const lightbox =
        $("lightbox");

    if (!lightbox) return;

    lightbox.classList.remove(
        "hidden"
    );

    document.body.style.overflow =
        "hidden";

    updateLightbox();

}


/* =========================================================
   UPDATE LIGHTBOX
========================================================= */

function updateLightbox() {

    if (!galleryItems.length) {

        return;

    }

    const currentItem =
        galleryItems[galleryIndex];

    if (!currentItem) return;

    const image =
        $("lightboxImage");

    const counter =
        $("lightCounter");

    if (image) {

        image.src =
            currentItem.dataset.full ||
            currentItem.querySelector("img")?.src ||
            "";

    }

    if (counter) {

        counter.textContent =
            `${galleryIndex + 1} / ${galleryItems.length}`;

    }

}


/* =========================================================
   CHANGE GALLERY
========================================================= */

function changeGallery(step) {

    if (!galleryItems.length) {

        return;

    }

    galleryIndex =
        (
            galleryIndex +
            step +
            galleryItems.length
        ) %
        galleryItems.length;

    updateLightbox();

}


/* =========================================================
   CLOSE LIGHTBOX
========================================================= */

function closeLightbox() {

    const lightbox =
        $("lightbox");

    if (lightbox) {

        lightbox.classList.add(
            "hidden"
        );

    }

    document.body.style.overflow = "";

}


/* =========================================================
   SCROLL REVEAL
========================================================= */

function setupReveal() {

    const elements =
        document.querySelectorAll(
            ".reveal"
        );

    if (!("IntersectionObserver" in window)) {

        elements.forEach(
            element =>
                element.classList.add(
                    "visible"
                )
        );

        return;

    }

    const observer =
        new IntersectionObserver(
            function (entries) {

                entries.forEach(
                    function (entry) {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    }
                );

            },
            {
                threshold: 0.10
            }
        );

    elements.forEach(
        element =>
            observer.observe(element)
    );

}


/* =========================================================
   PROGRESS BAR
========================================================= */

function updateProgress() {

    const progress =
        $("progressBar");

    if (!progress) return;

    const height =
        document.documentElement.scrollHeight -
        window.innerHeight;

    const width =
        height > 0
            ? (
                window.scrollY /
                height
            ) * 100
            : 0;

    progress.style.width =
        `${Math.min(
            Math.max(width, 0),
            100
        )}%`;

}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {

    const toast =
        $("toast");

    if (!toast) {

        console.log(
            "Toast:",
            message
        );

        return;

    }

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        window.upYatraToastTimer
    );

    window.upYatraToastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2600
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(value) {

    return String(
        value ?? ""
    ).replace(
        /[&<>"']/g,
        function (character) {

            return {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            }[character];

        }
    );

}


/* =========================================================
   ESCAPE JS STRING
========================================================= */

function escapeJs(value) {

    return String(
        value ?? ""
    )
    .replace(
        /\\/g,
        "\\\\"
    )
    .replace(
        /'/g,
        "\\'"
    )
    .replace(
        /"/g,
        '\\"'
    )
    .replace(
        /\r/g,
        "\\r"
    )
    .replace(
        /\n/g,
        "\\n"
    );

}


/* =========================================================
   LIVE WEATHER
   Open-Meteo API
========================================================= */

const weatherLocations = {

    agra: {
        name: "Agra",
        latitude: 27.1767,
        longitude: 78.0081
    },

    varanasi: {
        name: "Varanasi",
        latitude: 25.3176,
        longitude: 82.9739
    },

    ayodhya: {
        name: "Ayodhya",
        latitude: 26.7922,
        longitude: 82.1998
    },

    lucknow: {
        name: "Lucknow",
        latitude: 26.8467,
        longitude: 80.9462
    },

    "mathura-vrindavan": {
        name: "Mathura - Vrindavan",
        latitude: 27.4924,
        longitude: 77.6737
    },

    prayagraj: {
        name: "Prayagraj",
        latitude: 25.4358,
        longitude: 81.8463
    },

    sarnath: {
        name: "Sarnath",
        latitude: 25.3810,
        longitude: 83.0227
    },

    jhansi: {
        name: "Jhansi",
        latitude: 25.4484,
        longitude: 78.5685
    },

    dudhwa: {
        name: "Dudhwa",
        latitude: 28.4167,
        longitude: 80.5833
    },

    "fatehpur-sikri": {
        name: "Fatehpur Sikri",
        latitude: 27.0945,
        longitude: 77.6679
    },

    vindhyachal: {
        name: "Vindhyachal",
        latitude: 25.1358,
        longitude: 82.5783
    },

    kanpur: {
        name: "Kanpur",
        latitude: 26.4499,
        longitude: 80.3319
    }

};


/* =========================================================
   WEATHER DESCRIPTION
========================================================= */

function getWeatherDescription(code) {

    const weatherCodes = {

        0: "Clear Sky ☀️",
        1: "Mainly Clear 🌤️",
        2: "Partly Cloudy ⛅",
        3: "Overcast ☁️",
        45: "Foggy 🌫️",
        48: "Foggy 🌫️",
        51: "Light Drizzle 🌦️",
        53: "Drizzle 🌦️",
        55: "Heavy Drizzle 🌧️",
        56: "Freezing Drizzle 🌧️",
        57: "Heavy Freezing Drizzle 🌧️",
        61: "Light Rain 🌦️",
        63: "Rain 🌧️",
        65: "Heavy Rain 🌧️",
        66: "Freezing Rain 🌧️",
        67: "Heavy Freezing Rain 🌧️",
        71: "Light Snow ❄️",
        73: "Snow ❄️",
        75: "Heavy Snow ❄️",
        77: "Snow Grains ❄️",
        80: "Rain Showers 🌦️",
        81: "Rain Showers 🌧️",
        82: "Heavy Rain Showers 🌧️",
        85: "Snow Showers ❄️",
        86: "Heavy Snow Showers ❄️",
        95: "Thunderstorm ⛈️",
        96: "Thunderstorm with Hail ⛈️",
        99: "Heavy Thunderstorm ⛈️"

    };

    return (
        weatherCodes[code] ||
        "Weather information unavailable"
    );

}


/* =========================================================
   GET LIVE WEATHER
========================================================= */

async function getWeather(slug) {

    const location =
        weatherLocations[slug];

    if (!location) {

        throw new Error(
            "Weather location not found"
        );

    }

    const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${location.latitude}` +
        `&longitude=${location.longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m` +
        `&timezone=Asia%2FKolkata`;

    const response =
        await fetch(url);

    if (!response.ok) {

        throw new Error(
            "Weather server error"
        );

    }

    const data =
        await response.json();

    if (!data.current) {

        throw new Error(
            "Weather data unavailable"
        );

    }

    return {

        location:
            location.name,

        temperature:
            data.current.temperature_2m,

        feelsLike:
            data.current.apparent_temperature,

        humidity:
            data.current.relative_humidity_2m,

        wind:
            data.current.wind_speed_10m,

        code:
            data.current.weather_code,

        description:
            getWeatherDescription(
                data.current.weather_code
            )

    };

}


/* =========================================================
   DISPLAY WEATHER
========================================================= */

function displayWeather(data) {

    const weatherBox =
        $("weatherResult");

    if (!weatherBox) {

        console.warn(
            "weatherResult element not found"
        );

        return;

    }

    weatherBox.innerHTML = `

        <div class="weather-card-inner">

            <div class="weather-location">

                <span class="eyebrow">
                    LIVE WEATHER
                </span>

                <h3>
                    ${escapeHtml(
                        data.location
                    )}
                </h3>

            </div>

            <div class="weather-main">

                <div class="weather-temperature">
                    ${escapeHtml(
                        data.temperature
                    )}°C
                </div>

                <div class="weather-condition">
                    ${escapeHtml(
                        data.description
                    )}
                </div>

            </div>

            <div class="weather-details">

                <div class="weather-detail">

                    <span>🌡️</span>

                    <strong>
                        Feels Like
                    </strong>

                    <b>
                        ${escapeHtml(
                            data.feelsLike
                        )}°C
                    </b>

                </div>

                <div class="weather-detail">

                    <span>💧</span>

                    <strong>
                        Humidity
                    </strong>

                    <b>
                        ${escapeHtml(
                            data.humidity
                        )}%
                    </b>

                </div>

                <div class="weather-detail">

                    <span>💨</span>

                    <strong>
                        Wind
                    </strong>

                    <b>
                        ${escapeHtml(
                            data.wind
                        )} km/h
                    </b>

                </div>

            </div>

            <p class="weather-source">
                🌐 Live weather powered by Open-Meteo
            </p>

        </div>

    `;

    weatherBox.classList.remove(
        "hidden"
    );

}


/* =========================================================
   WEATHER ERROR
========================================================= */

function showWeatherError(message) {

    const weatherBox =
        $("weatherResult");

    if (!weatherBox) return;

    weatherBox.innerHTML = `

        <div class="weather-error">

            <div style="font-size:40px;">
                ⚠️
            </div>

            <h3>
                Weather unavailable
            </h3>

            <p>
                ${escapeHtml(message)}
            </p>

        </div>

    `;

    weatherBox.classList.remove(
        "hidden"
    );

}


/* =========================================================
   LOAD WEATHER
========================================================= */

async function loadWeather(slug) {

    const weatherBox =
        $("weatherResult");

    if (weatherBox) {

        weatherBox.classList.remove(
            "hidden"
        );

        weatherBox.innerHTML = `

            <div class="weather-loading">

                <div style="font-size:40px;">
                    🌦️
                </div>

                <p>
                    Loading live weather...
                </p>

            </div>

        `;

    }

    try {

        weatherData =
            await getWeather(slug);

        displayWeather(
            weatherData
        );

    } catch (error) {

        console.error(
            "Weather Error:",
            error
        );

        showWeatherError(
            error.message ||
            "Live weather load nahi ho pa raha."
        );

    }

}


/* =========================================================
   WEATHER SETUP
========================================================= */

function setupWeather() {

    const weatherSelect =
        $("weatherDestination");

    const weatherButton =
        $("weatherBtn");

    if (!weatherSelect) {

        console.log(
            "Weather selector not found."
        );

        return;

    }

    if (weatherSelect.value) {

        loadWeather(
            weatherSelect.value
        );

    }

    if (weatherButton) {

        weatherButton.addEventListener(
            "click",
            function () {

                const slug =
                    weatherSelect.value;

                if (!slug) {

                    showToast(
                        "Please select a destination"
                    );

                    return;

                }

                loadWeather(slug);

            }
        );

    }

    weatherSelect.addEventListener(
        "change",
        function () {

            const slug =
                this.value;

            if (slug) {

                loadWeather(slug);

            }

        }
    );

}


/* =========================================================
   WEATHER FROM DESTINATION
========================================================= */

function showDestinationWeather(slug) {

    if (!weatherLocations[slug]) {

        showToast(
            "Weather information unavailable"
        );

        return;

    }

    const weatherSection =
        $("weather");

    if (weatherSection) {

        weatherSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

    const weatherSelect =
        $("weatherDestination");

    if (weatherSelect) {

        weatherSelect.value =
            slug;

    }

    loadWeather(slug);

}


window.loadWeather =
    loadWeather;

window.showDestinationWeather =
    showDestinationWeather;


/* =========================================================
   REAL STAYS
   UPSTDC PROPERTY LIST
========================================================= */

const realStays = [

    {
        id: 1,
        name: "Hotel Taj Khema",
        city: "Agra",
        location:
            "Near Eastern Gate of Taj Mahal, Tajganj, Agra, Uttar Pradesh",
        type: "UPSTDC Hotel",
        phone: "9415902742",
        image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 2,
        name: "Hotel Saket",
        city: "Ayodhya",
        location:
            "Near Ayodhya Railway Station, Ayodhya, Uttar Pradesh",
        type: "UPSTDC Hotel",
        phone: "9451090074",
        image:
            "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 3,
        name: "Hotel Gomti",
        city: "Lucknow",
        location:
            "Tej Bahadur Sapru Marg, Hazratganj, Lucknow, Uttar Pradesh",
        type: "UPSTDC Hotel",
        phone: "9453671319",
        image:
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 4,
        name: "Rahi Tourist Bungalow",
        city: "Varanasi",
        location:
            "Parade Kothi, Near Cantt Railway Station, Varanasi, Uttar Pradesh",
        type: "UPSTDC Tourist Bungalow",
        phone: "9415902707",
        image:
            "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 5,
        name: "Rahi Tourist Bungalow Sarnath",
        city: "Sarnath",
        location:
            "Sarnath Station Road, Sarnath, Varanasi, Uttar Pradesh",
        type: "UPSTDC Tourist Bungalow",
        phone: "8789773573",
        image:
            "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 6,
        name: "Rahi Ilawart Tourist Bungalow",
        city: "Prayagraj",
        location:
            "M.G. Marg, Civil Lines, Prayagraj, Uttar Pradesh",
        type: "UPSTDC Tourist Bungalow",
        phone: "9415311133",
        image:
            "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 7,
        name: "Rahi Triveni Darshan",
        city: "Prayagraj",
        location:
            "Yamuna Bank Road, Kydganj, Prayagraj, Uttar Pradesh",
        type: "UPSTDC Hotel",
        phone: "9532437599",
        image:
            "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 8,
        name: "Rahi Veerangana Tourist Bungalow",
        city: "Jhansi",
        location:
            "Civil Lines, Jhansi, Uttar Pradesh",
        type: "UPSTDC Tourist Bungalow",
        phone: "9415609450",
        image:
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 9,
        name: "Rahi Gulistan Tourist Complex",
        city: "Fatehpur Sikri",
        location:
            "Shahkuli, Fatehpur Sikri, Agra, Uttar Pradesh",
        type: "UPSTDC Tourist Complex",
        phone: "9415233448",
        image:
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85"
    },

    {
        id: 10,
        name: "Rahi Tourist Bungalow",
        city: "Kanpur",
        location:
            "Bithoor, Kanpur, Uttar Pradesh",
        type: "UPSTDC Tourist Bungalow",
        phone: "9415609464",
        image:
            "https://images.unsplash.com/photo-1601918774946-25832a4be0d6?auto=format&fit=crop&w=900&q=85"
    }

];


/* =========================================================
   STAY STATE
========================================================= */

let currentStayCity = "All";


/* =========================================================
   GOOGLE MAPS URL
========================================================= */

function getStayMapUrl(stay) {

    const query =
        encodeURIComponent(
            `${stay.name}, ${stay.location}`
        );

    return (
        `https://www.google.com/maps/search/?api=1&query=${query}`
    );

}


/* =========================================================
   WHATSAPP CONTACT URL
========================================================= */

function getStayWhatsAppUrl(stay) {

    const phone =
        String(stay.phone || "")
            .replace(/\D/g, "");

    if (!phone) {

        return "";

    }

    /*
       India country code = 91

       Agar number already 91 se start ho raha hai,
       to dobara 91 add nahi karenge.
    */

    const whatsappNumber =
        phone.startsWith("91")
            ? phone
            : `91${phone}`;

    const message =
        encodeURIComponent(
            `Hello, I want information about ${stay.name} in ${stay.city}, Uttar Pradesh.`
        );

    return (
        `https://wa.me/${whatsappNumber}?text=${message}`
    );

}


/* =========================================================
   RENDER REAL STAYS
========================================================= */

function loadRealStays(city = "All") {

    const stayGrid =
        $("stayGrid");

    if (!stayGrid) {

        return;

    }

    currentStayCity =
        city;

    let filteredStays;

    if (city === "All") {

        filteredStays =
            realStays;

    } else {

        filteredStays =
            realStays.filter(
                stay =>
                    stay.city === city
            );

    }

    if (!filteredStays.length) {

        stayGrid.innerHTML = `

            <div class="no-stays">

                <div class="no-stays-icon">
                    🏨
                </div>

                <h3>
                    No stays found
                </h3>

                <p>
                    More UP properties will be added soon.
                </p>

            </div>

        `;

        return;

    }

    stayGrid.innerHTML =
        filteredStays.map(stay => {

            const mapURL =
                getStayMapUrl(stay);

            const whatsappURL =
                getStayWhatsAppUrl(stay);

            return `

                <article
                    class="stay-card reveal visible"
                >

                    <div class="stay-image">

                        <img
                            src="${escapeHtml(
                                stay.image
                            )}"
                            alt="${escapeHtml(
                                stay.name
                            )}"
                            loading="lazy"
                            onerror="
                                this.style.display='none'
                            "
                        >

                        <span class="stay-badge">
                            ✓ Real Property
                        </span>

                    </div>

                    <div class="stay-content">

                        <span class="stay-type">
                            ${escapeHtml(
                                stay.type
                            )}
                        </span>

                        <h3>
                            ${escapeHtml(
                                stay.name
                            )}
                        </h3>

                        <p class="stay-city">
                            📍
                            ${escapeHtml(
                                stay.city
                            )},
                            Uttar Pradesh
                        </p>

                        <p class="stay-location">
                            ${escapeHtml(
                                stay.location
                            )}
                        </p>

                        <div class="stay-actions">

                            <a
                                href="${mapURL}"
                                target="_blank"
                                rel="noopener noreferrer"
                                class="btn primary"
                            >
                                📍 View Location
                            </a>

                            ${
                                whatsappURL
                                    ? `
                                        <a
                                            href="${whatsappURL}"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            class="btn dark"
                                        >
                                            📞 Contact on WhatsApp
                                        </a>
                                      `
                                    : `
                                        <button
                                            type="button"
                                            class="btn dark"
                                            onclick="showToast('Contact number not available')"
                                        >
                                            📞 Contact
                                        </button>
                                      `
                            }

                        </div>

                    </div>

                </article>

            `;

        }).join("");

}


/* =========================================================
   STAY FILTERS
========================================================= */

function initializeStayFilters() {

    const filters =
        document.querySelectorAll(
            ".stay-filter"
        );

    filters.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                filters.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );

                this.classList.add(
                    "active"
                );

                const city =
                    this.dataset.city ||
                    "All";

                loadRealStays(city);

            }
        );

    });

}


/* =========================================================
   STAY SETUP
========================================================= */

function setupStay() {

    const stayGrid =
        $("stayGrid");

    if (!stayGrid) {

        return;

    }

    loadRealStays("All");

    initializeStayFilters();

}


/* =========================================================
   STAY GLOBAL FUNCTIONS
========================================================= */

window.loadRealStays =
    loadRealStays;

window.setupStay =
    setupStay;


/* =========================================================
   FINAL INITIALIZATION
========================================================= */

console.log(
    "UP Yatra - All JavaScript modules ready"
);