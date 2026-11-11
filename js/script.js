
const menuToggle = document.getElementById("menuToggle");
const navigation = document.getElementById("navigation");

if (menuToggle && navigation) {
    function setMenuOpen(isOpen) {
        navigation.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Tutup menu" : "Buka menu"
        );
        menuToggle.classList.toggle("is-open", isOpen);
    }

    menuToggle.addEventListener("click", function () {
        setMenuOpen(menuToggle.getAttribute("aria-expanded") !== "true");
    });

    navigation.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
            setMenuOpen(false);
        });
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && navigation.classList.contains("active")) {
            setMenuOpen(false);
            menuToggle.focus();
        }
    });

    document.addEventListener("click", function (event) {
        if (
            navigation.classList.contains("active") &&
            event.target instanceof Node &&
            !navigation.contains(event.target) &&
            !menuToggle.contains(event.target)
        ) {
            setMenuOpen(false);
        }
    });

    window.matchMedia("(min-width: 961px)").addEventListener("change", function (event) {
        if (event.matches) {
            setMenuOpen(false);
        }
    });
}

const clientCarousel = document.querySelector(".client-carousel");
const clientLists = clientCarousel?.querySelectorAll(".client-list");

if (clientCarousel && clientLists?.length === 2) {
    const [firstList, secondList] = clientLists;
    const originalItems = Array.from(firstList.children).map(function (item) {
        return item.cloneNode(true);
    });

    function fillClientCarousel() {
        if (!originalItems.length || !clientCarousel.clientWidth) return;

        firstList.replaceChildren(...originalItems.map(function (item) {
            return item.cloneNode(true);
        }));

        const itemWidth = firstList.firstElementChild?.getBoundingClientRect().width || 188;
        const gap = parseFloat(getComputedStyle(firstList).columnGap) || 20;
        const targetWidth = clientCarousel.clientWidth + itemWidth + gap;
        let index = 0;

        while (firstList.getBoundingClientRect().width < targetWidth) {
            firstList.appendChild(originalItems[index % originalItems.length].cloneNode(true));
            index += 1;
        }

        secondList.replaceChildren(...Array.from(firstList.children).map(function (item) {
            const duplicate = item.cloneNode(true);
            duplicate.querySelectorAll("img").forEach(function (image) {
                image.alt = "";
                image.loading = "eager";
            });
            return duplicate;
        }));

        const groupWidth = firstList.getBoundingClientRect().width;
        clientCarousel.querySelector(".client-track").style.animationDuration =
            Math.max(28, groupWidth / 22) + "s";
    }

    fillClientCarousel();
    let carouselResizeTimer;
    window.addEventListener("resize", function () {
        window.clearTimeout(carouselResizeTimer);
        carouselResizeTimer = window.setTimeout(fillClientCarousel, 120);
    });
}

document.querySelectorAll(".currentYear").forEach(function (element) {
    element.textContent = new Date().getFullYear();
});

const articleGrid = document.getElementById("articleGrid");

if (articleGrid) {
    const articleCards = Array.from(articleGrid.querySelectorAll(".editorial-card"));
    const articleSearch = document.getElementById("articleSearch");
    const articleFilters = document.querySelectorAll("[data-article-filter]");
    const articleResults = document.getElementById("articleResults");
    const articleEmpty = document.getElementById("articleEmpty");
    let selectedCategory = "*";

    function normalizeArticleText(value) {
        return value.toLocaleLowerCase("id-ID").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    function updateArticleList() {
        const query = normalizeArticleText(articleSearch.value.trim());
        let visibleCount = 0;

        articleCards.forEach(function (card) {
            const matchesCategory = selectedCategory === "*" || card.dataset.category === selectedCategory;
            const matchesQuery = normalizeArticleText(card.textContent).includes(query);
            const isVisible = matchesCategory && matchesQuery;
            card.hidden = !isVisible;
            if (isVisible) visibleCount += 1;
        });

        articleResults.textContent = "Ditemukan " + visibleCount + " artikel.";
        articleEmpty.hidden = visibleCount !== 0;
    }

    articleFilters.forEach(function (button) {
        button.addEventListener("click", function () {
            selectedCategory = button.dataset.articleFilter;
            articleFilters.forEach(function (filterButton) {
                const isActive = filterButton === button;
                filterButton.classList.toggle("is-active", isActive);
                filterButton.setAttribute("aria-pressed", String(isActive));
            });
            updateArticleList();
        });
    });

    articleSearch.addEventListener("input", updateArticleList);
    updateArticleList();
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if ("IntersectionObserver" in window && !prefersReducedMotion) {
    const revealTargets = document.querySelectorAll(
        "main > section, .featured-article, .service-card, .service-card-secondary, " +
        ".program-card, .team-card, .gallery-item, .editorial-card, .approach-step, " +
        ".hero-copy, .hero-photo, .page-hero > .container, .article-hero-content"
    );

    document.body.classList.add("motion-enabled");
    revealTargets.forEach(function (element) {
        element.classList.add("reveal-on-scroll");
    });

    document.querySelectorAll(
        ".service-grid, .service-grid-secondary, .program-grid, .program-card-grid, " +
        ".team-grid, .gallery-grid, .editorial-grid, .approach-steps"
    ).forEach(function (group) {
        Array.from(group.children).forEach(function (element, index) {
            element.style.setProperty("--reveal-delay", Math.min(index, 4) * 70 + "ms");
        });
    });

    const revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -36px 0px"
    });

    revealTargets.forEach(function (element) {
        revealObserver.observe(element);
    });
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.querySelectorAll("[required]").forEach(function (input) {
        input.addEventListener("input", function () {
            input.setCustomValidity("");
        });
    });

    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const name = String(formData.get("name")).trim();
        const contact = String(formData.get("contact")).trim();
        const message = String(formData.get("message")).trim();

        const fields = [
            { id: "name", value: name },
            { id: "contact", value: contact },
            { id: "message", value: message }
        ];
        const emptyField = fields.find(function (field) {
            return field.value.length === 0;
        });

        if (emptyField) {
            const input = document.getElementById(emptyField.id);
            input.setCustomValidity("Mohon isi bagian ini sebelum mengirim pesan.");
            input.reportValidity();
            return;
        }

        const text = [
            "Halo Sinergi Business Solution, saya ingin berdiskusi.",
            "",
            "Nama: " + name,
            "Kontak: " + contact,
            "",
            "Kebutuhan:",
            message
        ].join("\n");

        window.open(
            "https://wa.me/6281235863440?text=" + encodeURIComponent(text),
            "_blank",
            "noopener,noreferrer"
        );
    });
}
