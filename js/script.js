
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
const clientCarouselToggle = document.querySelector(".client-carousel-toggle");

if (clientCarousel && clientCarouselToggle) {
    clientCarouselToggle.addEventListener("click", function () {
        const isPaused = clientCarousel.classList.toggle("is-paused");

        clientCarouselToggle.setAttribute("aria-pressed", String(isPaused));
        clientCarouselToggle.textContent = isPaused
            ? "Lanjutkan carousel"
            : "Jeda carousel";
    });
}

document.querySelectorAll(".currentYear").forEach(function (element) {
    element.textContent = new Date().getFullYear();
});

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
