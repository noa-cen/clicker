document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("revolution-form");
    const partiInput = document.getElementById("parti");
    const descriptionContainer = document.getElementById("description");

    const savedParti = localStorage.getItem("parti");
    const savedChefImage = localStorage.getItem("chef-image");

    if (savedParti) {
        partiInput.value = savedParti;
    }
    if (savedChefImage) {
        document.getElementById(savedChefImage).checked = true;
    }

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const parti = partiInput.value;
        const chefImages = document.querySelectorAll(".chef-image");

        if (parti){
            localStorage.setItem("parti", parti);
        }

        chefImages.forEach(chef=>{
            chef.addEventListener("click",()=>{
                const chefId = chefImages.id;
                localStorage.setItem("chef-image",chefId);
             })
        })

        showToast("Toutes les bonnes choses ont un début !");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    });

    const descriptions = {
        chef1: "Rachel Keke, militante ouvrière, a mené la grève de l'hôtel Ibis en 2019 pour de meilleures conditions de travail.",
        chef2: "Karl Marx, philosophe et économiste, critique le capitalisme et prône le socialisme dans son Manifeste du Parti Communiste.",
        chef3: "Olympe de Gouges, dramaturge et militante féministe, a écrit la Déclaration des droits de la femme en 1791."
    };

    const formContainer = document.querySelector('.form-container');
    formContainer.parentNode.insertBefore(descriptionContainer, formContainer);

    const updateDescription = (chefId) => {
        descriptionContainer.style.display = "block";
        descriptionContainer.textContent = descriptions[chefId];
    };

    const chef1Label = document.querySelector('label[for="chef1"]');
    const chef2Label = document.querySelector('label[for="chef2"]');
    const chef3Label = document.querySelector('label[for="chef3"]');

    if (chef1Label) {
        chef1Label.addEventListener("mouseover", () => updateDescription("chef1"));
        chef1Label.addEventListener("mouseout", () => descriptionContainer.style.display = "none");
    }
    if (chef2Label) {
        chef2Label.addEventListener("mouseover", () => updateDescription("chef2"));
        chef2Label.addEventListener("mouseout", () => descriptionContainer.style.display = "none");
    }
    if (chef3Label) {
        chef3Label.addEventListener("mouseover", () => updateDescription("chef3"));
        chef3Label.addEventListener("mouseout", () => descriptionContainer.style.display = "none");
    }
});

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000); 
}