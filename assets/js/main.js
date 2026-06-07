(() => {
  "use strict";

  const config = window.PRISMIKI_CONFIG || {};
  const whatsappNumber = String(config.whatsapp || "").replace(/\D/g, "");
  const defaultMessage = "Olá! Vim pelo site da Prismiki Buffet e gostaria de solicitar um orçamento.";

  document.querySelectorAll(".js-whatsapp").forEach((link) => {
    link.href = whatsappNumber
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`
      : "#orcamento";
  });

  document.querySelectorAll(".js-email").forEach((link) => {
    link.href = config.email ? `mailto:${config.email}` : "#orcamento";
    link.textContent = config.email || "E-mail";
  });

  const menuButton = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".main-nav");

  menuButton?.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  menu?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      menu.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

  const dateInput = document.querySelector('input[name="data"]');
  if (dateInput) {
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString().split("T")[0];
    dateInput.min = localDate;
  }

  const form = document.querySelector("#quote-form");
  const status = document.querySelector("#form-status");

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    status.textContent = "";

    if (!form.checkValidity()) {
      form.reportValidity();
      status.textContent = "Preencha os campos obrigatórios antes de continuar.";
      return;
    }

    if (!whatsappNumber) {
      status.textContent = "Configure o número do WhatsApp em assets/js/config.js antes de publicar.";
      return;
    }

    const data = new FormData(form);
    const services = data.getAll("servicos");
    const eventDate = data.get("data")
      ? new Date(`${data.get("data")}T12:00:00`).toLocaleDateString("pt-BR")
      : "Não informada";

    const message = [
      "Olá! Vim pelo site da Prismiki Buffet e gostaria de solicitar um orçamento.",
      "",
      `*Nome:* ${data.get("nome")}`,
      `*Meu WhatsApp:* ${data.get("telefone")}`,
      `*Data do evento:* ${eventDate}`,
      `*Tipo de evento:* ${data.get("tipo")}`,
      `*Local:* ${data.get("local")}`,
      `*Convidados:* ${data.get("convidados")}`,
      `*Serviços:* ${services.length ? services.join(", ") : "Ainda não definido"}`,
      `*Detalhes:* ${data.get("mensagem") || "Não informado"}`
    ].join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
    status.textContent = "Mensagem preparada. O WhatsApp foi aberto em uma nova janela.";
  });


  const carousel = document.querySelector("[data-carousel]");
  if (carousel) {
    const track = carousel.querySelector(".carousel-track");
    const slides = [...carousel.querySelectorAll(".carousel-slide")];
    const previousButton = carousel.querySelector(".carousel-prev");
    const nextButton = carousel.querySelector(".carousel-next");
    const dotsContainer = carousel.querySelector(".carousel-dots");
    const modal = document.querySelector("#gallery-modal");
    const modalImage = document.querySelector("#modal-image");
    const modalCaption = document.querySelector("#modal-caption");
    let currentIndex = 0;
    let autoplayId = null;

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");
      dot.className = "carousel-dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Mostrar imagem ${index + 1}`);
      dot.addEventListener("click", () => goToSlide(index, true));
      dotsContainer.appendChild(dot);
      return dot;
    });

    function updateCarousel() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((dot, index) => dot.setAttribute("aria-current", String(index === currentIndex)));
      slides.forEach((slide, index) => slide.setAttribute("aria-hidden", String(index !== currentIndex)));
    }

    function goToSlide(index, restart = false) {
      currentIndex = (index + slides.length) % slides.length;
      updateCarousel();
      if (restart) restartAutoplay();
    }

    function startAutoplay() {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || slides.length < 2) return;
      stopAutoplay();
      autoplayId = window.setInterval(() => goToSlide(currentIndex + 1), 3000);
    }

    function stopAutoplay() {
      if (autoplayId) window.clearInterval(autoplayId);
      autoplayId = null;
    }

    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    function openModal(index) {
      const image = slides[index].querySelector("img");
      const caption = slides[index].querySelector("figcaption")?.textContent || "";
      currentIndex = index;
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
      modalCaption.textContent = caption;
      stopAutoplay();
      document.body.classList.add("modal-open");
      modal.showModal();
    }

    function updateModal(index) {
      goToSlide(index);
      const image = slides[currentIndex].querySelector("img");
      modalImage.src = image.currentSrc || image.src;
      modalImage.alt = image.alt;
      modalCaption.textContent = slides[currentIndex].querySelector("figcaption")?.textContent || "";
    }

    previousButton.addEventListener("click", () => goToSlide(currentIndex - 1, true));
    nextButton.addEventListener("click", () => goToSlide(currentIndex + 1, true));
    carousel.addEventListener("mouseenter", stopAutoplay);
    carousel.addEventListener("mouseleave", startAutoplay);
    carousel.addEventListener("focusin", stopAutoplay);
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget)) startAutoplay();
    });

    slides.forEach((slide, index) => {
      slide.querySelector(".gallery-open").addEventListener("click", () => openModal(index));
    });

    modal.querySelector(".modal-close").addEventListener("click", () => modal.close());
    modal.querySelector(".modal-prev").addEventListener("click", () => updateModal(currentIndex - 1));
    modal.querySelector(".modal-next").addEventListener("click", () => updateModal(currentIndex + 1));
    modal.addEventListener("click", (event) => {
      if (event.target === modal) modal.close();
    });
    modal.addEventListener("close", () => {
      document.body.classList.remove("modal-open");
      updateCarousel();
      startAutoplay();
    });
    modal.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") updateModal(currentIndex - 1);
      if (event.key === "ArrowRight") updateModal(currentIndex + 1);
    });

    updateCarousel();
    startAutoplay();
  }

  const year = document.querySelector("#current-year");
  if (year) year.textContent = new Date().getFullYear();
})();
