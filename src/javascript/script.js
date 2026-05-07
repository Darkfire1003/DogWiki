let lastFormFocus = null;
let lastBrewFocus = null;

const burger = document.getElementById("burger");
const navBar = document.getElementById("navBar");
if (burger && navBar) {
  burger.addEventListener("click", function () {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", isOpen ? "false" : "true");
    burger.classList.toggle("is-active");
    navBar.classList.toggle("hidden");
  });
}

const toggleFormBtn = document.getElementById("toggleFormBtn");
const contactFormSection = document.getElementById("contactFormSection");
if (toggleFormBtn && contactFormSection) {
  toggleFormBtn.addEventListener("click", function () {
    const isHidden = contactFormSection.hidden;
    contactFormSection.hidden = !isHidden;
    contactFormSection.setAttribute("aria-hidden", isHidden ? "false" : "true");
    toggleFormBtn.setAttribute("aria-expanded", isHidden ? "true" : "false");
    if (isHidden) {
      contactFormSection.scrollIntoView({ behavior: "smooth" });
      const heading = document.getElementById("contact-heading");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        heading.focus();
      }
    }
  });
}

const contactForm = document.getElementById("contactForm");
if (contactForm) contactForm.addEventListener("submit", handleFormSubmit);

const resetBtn = document.getElementById("resetBtn");
if (resetBtn) resetBtn.addEventListener("click", resetForm);

const popupClose = document.getElementById("popupClose");
if (popupClose) popupClose.addEventListener("click", closeFormPopup);

const popupBrewClose = document.getElementById("popupBrewClose");
if (popupBrewClose) popupBrewClose.addEventListener("click", closeBrewPopup);

function validateForm() {
  let valid = true;

  const name = document.getElementById("inputName");
  const nameErr = document.getElementById("inputName-errorBox");
  if (!name.value.trim()) {
    showFieldError(name, nameErr);
    valid = false;
  } else hideFieldError(name, nameErr);

  const email = document.getElementById("inputEmail");
  const emailErr = document.getElementById("inputEmail-errorBox");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim() || !emailRegex.test(email.value.trim())) {
    showFieldError(email, emailErr);
    valid = false;
  } else hideFieldError(email, emailErr);

  const privacy = document.getElementById("privacyCheck");
  const privacyErr = document.getElementById("privacyCheck-errorBox");
  if (!privacy.checked) {
    privacyErr.hidden = false;
    privacy.setAttribute("aria-invalid", "true");
    valid = false;
  } else {
    privacyErr.hidden = true;
    privacy.removeAttribute("aria-invalid");
  }

  return valid;
}

function showFieldError(input, errBox) {
  errBox.hidden = false;
  input.setAttribute("aria-invalid", "true");
  input.classList.add("border-red-400");
}

function hideFieldError(input, errBox) {
  errBox.hidden = true;
  input.removeAttribute("aria-invalid");
  input.classList.remove("border-red-400");
}

function handleFormSubmit(event) {
  event.preventDefault();

  const errBanner = document.getElementById("formErrors");
  const errBannerText = document.getElementById("formErrorsText");
  const okBanner = document.getElementById("formSuccess");
  errBanner.hidden = true;
  okBanner.hidden = true;

  const valid = validateForm();
  if (!valid) {
    errBannerText.textContent = "Bitte fülle alle Pflichtfelder korrekt aus.";
    errBanner.hidden = false;
    const firstInvalid = document.querySelector("[aria-invalid='true']");
    if (firstInvalid) firstInvalid.focus();
    return;
  }

  const data = {
    name: document.getElementById("inputName").value.trim(),
    email: document.getElementById("inputEmail").value.trim(),
    subject: document.getElementById("inputSubject").value.trim() || "–",
    message: document.getElementById("inputMessage").value.trim() || "–",
    contactMethod:
      document.querySelector('input[name="contactMethod"]:checked').value ===
      "email"
        ? "Per E-Mail"
        : "Per Telefon",
  };

  openFormPopup(data);
}

function openFormPopup(data) {
  const popup = document.getElementById("formPopup");
  const content = document.getElementById("popup-content");

  content.innerHTML = `
    <dl class="divide-y divide-slate-100">
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Name</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.name)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">E-Mail</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.email)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Betreff</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.subject)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nachricht</dt>
        <dd class="text-slate-800 font-medium whitespace-pre-line">${escapeHtml(data.message)}</dd>
      </div>
      <div class="flex flex-col py-2">
        <dt class="text-xs font-semibold text-slate-400 uppercase tracking-wide">Bevorzugter Kontaktweg</dt>
        <dd class="text-slate-800 font-medium">${escapeHtml(data.contactMethod)}</dd>
      </div>
    </dl>
  `;

  lastFormFocus = document.activeElement;
  popup.hidden = false;
  document.body.style.overflow = "hidden";
  popup.addEventListener("keydown", trapFormFocus);
  document.addEventListener("keydown", closeFormOnEscape);
  document.getElementById("popupClose").focus();
}

function closeFormPopup() {
  const popup = document.getElementById("formPopup");
  popup.hidden = true;
  document.body.style.overflow = "";
  popup.removeEventListener("keydown", trapFormFocus);
  document.removeEventListener("keydown", closeFormOnEscape);
  if (lastFormFocus) lastFormFocus.focus();

  resetForm();
  const okBanner = document.getElementById("formSuccess");
  const okBannerText = document.getElementById("formSuccessText");
  okBannerText.textContent =
    "Vielen Dank! Deine Nachricht wurde erfolgreich übermittelt.";
  okBanner.hidden = false;
}

function closeFormOnEscape(e) {
  if (e.key === "Escape") closeFormPopup();
}

function trapFormFocus(e) {
  if (e.key !== "Tab") return;
  const popup = document.getElementById("formPopup");
  const focusable = Array.from(
    popup.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  );
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

function resetForm() {
  const form = document.getElementById("contactForm");
  if (form) form.reset();
  document.querySelectorAll(".error-box").forEach((el) => (el.hidden = true));
  const errBanner = document.getElementById("formErrors");
  if (errBanner) errBanner.hidden = true;
  document.querySelectorAll("[aria-invalid]").forEach((el) => {
    el.removeAttribute("aria-invalid");
    el.classList.remove("border-red-400");
  });
}
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* =============================
              Dog API
   ============================= */

// global container
const container = document.getElementById("container");

/* =========================
   Fetch Groups
========================= */

function fetchDogGroups() {
  fetch("https://dogapi.dog/api/v2/groups")
    .then((response) => response.json())
    .then((data) => displayGroups(data.data))
    .catch((error) => console.error("Error fetching groups:", error));
}

/* =========================
   Display Groups
========================= */

function displayGroups(groups) {
  container.innerHTML = groups
    .map(
      (group) => `
        <div
          onclick='showGroupBreeds(${JSON.stringify(group)})'
          class="relative min-h-35 bg-white rounded-xl overflow-hidden p-4 cursor-pointer"
        >
          <p class="font-semibold">
            ${group.attributes.name}
          </p>

          <img
            class="absolute right-2 bottom-2 h-14"
            src="assets/dog_gray_watermark.png"
            alt=""
          />
        </div>
      `,
    )
    .join("");
  setContainerLayout("grid");
}

/* =========================
   Show Group Breeds
========================= */

function showGroupBreeds(group) {
  fetch("https://dogapi.dog/api/v2/breeds?page[size]=50")
    .then((response) => response.json())
    .then((data) => {
      const allBreeds = data.data;

      // breed ids aus group holen
      const breedIds = group.relationships.breeds.data.map((breed) => breed.id);

      // passende breeds filtern
      const breeds = allBreeds.filter((breed) => breedIds.includes(breed.id));

      displayBreeds(group, breeds);
    })
    .catch((error) => console.error("Error fetching breeds:", error));
}

/* =========================
   Display Breeds
========================= */

function displayBreeds(group, breeds) {
  document.getElementById("breedName").innerHTML =
    `<span class="mx-1" aria-hidden="true">&larr;</span>${group.attributes.name}:`;
  container.innerHTML = breeds
    .map(
      (breed) => `
            <div
            onclick='displayBreedDetails(${JSON.stringify(breed)})' 
              class="relative min-h-35 bg-white rounded-xl overflow-hidden p-4 cursor-pointer"
            > 
              <p class="font-semibold"
              >
                ${breed.attributes.name}
              </p> 

              <img
                class="absolute right-2 bottom-2 h-14"
                src="assets/dog_gray_watermark.png"
                alt=""
              />
            </div>
          `,
    )
    .join("");
  setContainerLayout("grid");
}

function setContainerLayout(type) {
  container.className = "";

  if (type === "grid") {
    container.className =
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5 text-primary";
  }

  if (type === "detail") {
    container.className = "mt-5 text-white";
  }
}

function displayBreedDetails(breed) {
  document.getElementById("breedName").textContent =
    `${breed.attributes.name}:`;
  document.getElementById("title").innerHTML = ` 

<p class=" text-base">
      <span class="font-semibold text-secondary">
        Name:
      </span>
      ${breed.attributes.name}
    </p>`;
  container.innerHTML = `
  <div class="text-white max-w-3xl space-y-3">

    <p class="leading-7 text-base">
      <span class="font-semibold text-secondary">
        Description:<br>
      </span>
      ${breed.attributes.description || "No description"}
    </p>

    <p class="leading-7 text-base">
      <span class="font-semibold text-secondary">
        Hypoallergenic:
      </span>
      ${breed.attributes.hypoallergenic ? "Yes" : "No"}
    </p>

    <p class="leading-7 text-base">
      <span class="font-semibold text-secondary">
        Life:
      </span>
      max. ${breed.attributes.life?.max || "?"} years /
      min. ${breed.attributes.life?.min || "?"} years
    </p>

    <p class="leading-7 text-base">
      <span class="font-semibold text-secondary">
        Male weight:
      </span>
      max. ${breed.attributes.male_weight?.max || "?"} /
      min. ${breed.attributes.male_weight?.min || "?"}
    </p>

    <p class="leading-7 text-base">
      <span class="font-semibold text-secondary">
        Female weight:
      </span>
      max. ${breed.attributes.female_weight?.max || "?"} /
      min. ${breed.attributes.female_weight?.min || "?"}
    </p>

  </div>
`;
  setContainerLayout("detail");
}
/* =========================
   Init
========================= */

fetchDogGroups();

function goHome() {
  document.getElementById("breedName").textContent = ":";
  fetchDogGroups();
}

function fetchFacts() {
  fetch("https://dogapi.dog/api/v2/facts?limit=1")
    .then((response) => response.json())
    .then((data) => {
      const randomFact = data.data[0].attributes.body;
      showFact(randomFact);
    })
    .catch(() => {
      showFact("Der Hundefakt konnte gerade nicht geladen werden.");
    });
}

function showFact(randomFact) {
  document.getElementById("factPopupContent").innerHTML =
    `<p>${randomFact}</p>`;
  document.getElementById("factPopup").classList.add("is-open");
}

function closePopup() {
  document.getElementById("factPopup").classList.remove("is-open");
}

function fetchDogImage() {
  const dogPic = document.getElementById("dogPic");
  const dogLoader = document.getElementById("dogLoader");

  dogLoader.classList.remove("hidden");
  dogLoader.classList.add("flex");
  dogPic.classList.add("opacity-50");
  document.body.classList.add("waiting");

  fetch("https://dog.ceo/api/breeds/image/random")
    .then((response) => response.json())
    .then((data) => {
      const newImg = new Image();
      newImg.src = data.message;

      newImg.onload = function () {
        dogPic.src = data.message;
        dogLoader.classList.add("hidden");
        dogLoader.classList.remove("flex");
        dogPic.classList.remove("opacity-50");
        document.body.classList.remove("waiting");
      };

      newImg.onerror = function () {
        dogLoader.classList.add("hidden");
        dogLoader.classList.remove("flex");
        dogPic.classList.remove("opacity-50");
        document.body.classList.remove("waiting");
      };
    })
    .catch(() => {
      dogLoader.classList.add("hidden");
      dogLoader.classList.remove("flex");
      dogPic.classList.remove("opacity-50");
      document.body.classList.remove("waiting");
    });
}

fetchDogImage();

function showDogPic(randomDogPic) {
  document.getElementById("dogPic").innerHTML = `
    <img
      src="${randomDogPic}"
      alt="Zufälliges Hundefoto"
      class="w-full rounded-xl shadow-md"
    />
  `;
  document.getElementById("factPopup").classList.add("is-open");
}
