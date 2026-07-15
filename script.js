document.documentElement.classList.add('js-enabled');

// Dynamic layout component loader function
async function loadComponent(elementId, filePath, callback) {
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`Failed to fetch: ${filePath}`);
    const htmlText = await response.text();
    document.getElementById(elementId).innerHTML = htmlText;
    if (callback) callback();
  } catch (error) {
    console.error("Layout engine error loading component:", error);
  }
}

// Language toggle system
function initializeLanguageToggle() {
  const langBtn = document.getElementById('lang-toggle');
  if (!langBtn) return;

  let currentLang = localStorage.getItem('siteLang') || 'en';

  function applyLanguage(lang) {
    const elements = document.querySelectorAll('[data-en][data-ml]');
    elements.forEach(el => {
      const text = el.getAttribute('data-' + lang);
      if (text !== null) {
        // Preserve innerHTML for elements that contain HTML (like spans with gradient-text)
        if (text.includes('<')) {
          el.innerHTML = text;
        } else {
          el.textContent = text;
        }
      }
    });
    langBtn.textContent = lang === 'en' ? 'മലയാളം' : 'English';
    localStorage.setItem('siteLang', lang);
    currentLang = lang;
  }

  // Apply saved language on load
  applyLanguage(currentLang);

  // Toggle on click
  langBtn.addEventListener('click', () => {
    const newLang = currentLang === 'en' ? 'ml' : 'en';
    applyLanguage(newLang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Header
  loadComponent("global-header", "header.html", () => {
    // Automatically match and highlight the active page link
    const currentPath = window.location.pathname.split("/").pop() || "index.html";
    const navLinks = document.querySelectorAll(".nav-menu a");
    navLinks.forEach(link => {
      if (link.getAttribute("href") === currentPath) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    });

    // Initialize language toggle after header is loaded
    initializeLanguageToggle();
  });

  // 2. Inject Footer
  loadComponent("global-footer", "footer.html");

  // 3. Keep your existing IntersectionObserver scrolling animations setup below
  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("active");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: "0px 0px -40px 0px"
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const serviceNodes = document.querySelectorAll(".service-action-node");
  const displayImg = document.querySelector("#service-visual-target img");

  // Map service names to your respective image paths
  const imageMap = {
    deposit: "assets/services/deposit.png",
    loans: "assets/services/loans.png",
    other: "assets/services/other.png"
  };

  serviceNodes.forEach(node => {
    node.addEventListener("mouseenter", () => {
      // If this item is already active, do nothing
      if (node.classList.contains("active")) return;

      // 1. Clear current active state classes from list
      serviceNodes.forEach(n => n.classList.remove("active"));

      // 2. Set hovered node to active
      node.classList.add("active");

      // 3. Get the corresponding image path
      const targetService = node.getAttribute("data-service");
      if (imageMap[targetService]) {

        // Step A: Fade out the old image
        displayImg.classList.remove("fade-in-active");
        displayImg.classList.add("fade-out");

        setTimeout(() => {
          // Step B: Swap the image source
          displayImg.src = imageMap[targetService];

          // Step C: Remove fade-out and trigger the persistent enlarged active state
          displayImg.classList.remove("fade-out");
          displayImg.classList.add("fade-in-active");
        }, 200); // Matches CSS transition delay
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const communityNodes = document.querySelectorAll(".community-action-node");
  const screenImg = document.querySelector("#community-screen-viewport img");

  communityNodes.forEach(node => {
    node.addEventListener("mouseenter", () => {
      if (node.classList.contains("active")) return;

      // 1. Toggle Active Nodes Class
      communityNodes.forEach(n => n.classList.remove("active"));
      node.classList.add("active");

      // 2. Extract Data Target Backing Image 
      const targetBgUrl = node.getAttribute("data-bg");

      if (targetBgUrl) {
        // 3. Perform modern image swap transition inside screen
        screenImg.style.opacity = "0.1";

        setTimeout(() => {
          screenImg.src = targetBgUrl;
          screenImg.style.opacity = "1";
        }, 250);
      }
    });
  });
});