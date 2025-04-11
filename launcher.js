document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("revolution-form");
    const partiInput = document.getElementById("parti");
    const chefInput = document.getElementById("chef");
    const chefImages = document.querySelectorAll('input[name="chef-image"]');

    const savedParti = localStorage.getItem("parti");
    const savedChef = localStorage.getItem("chef");
    const savedChefImage = localStorage.getItem("chef-image");

    if (savedParti) {
        partiInput.value = savedParti;
    }
    if (savedChef) {
        chefInput.value = savedChef;
    }
    if (savedChefImage) {
        document.getElementById(savedChefImage).checked = true;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const parti = partiInput.value;
        const chef = chefInput.value;
        const chefImage = document.querySelector('input[name="chef-image"]:checked')?.value;

        localStorage.setItem("parti", parti);
        localStorage.setItem("chef", chef);
        if (chefImage) {
            localStorage.setItem("chef-image", chefImage);
        }

        alert("Les informations ont été sauvegardées !");
        window.location.href = "index.html";
    });
});
