document.documentElement.classList.add('js-enabled');

// Helper to ensure DOMContentLoaded events run even if script runs after DOM is parsed
function runAfterDOMContentLoaded(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

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
    document.documentElement.setAttribute('lang', lang);
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


runAfterDOMContentLoaded(() => {
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

  initializeContactForm();
});

runAfterDOMContentLoaded(() => {
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

runAfterDOMContentLoaded(() => {
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

// Hero Slider Auto-Play Logic
runAfterDOMContentLoaded(() => {
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length === 0) return;

  let currentSlide = 0;

  function nextSlide() {
    slides[currentSlide].classList.remove("active");
    currentSlide = (currentSlide + 1) % slides.length;
    slides[currentSlide].classList.add("active");
  }

  // Change slide every 7 seconds
  setInterval(nextSlide, 7000);
});

// Contact Form Submission Handler
function initializeContactForm() {
  const form = document.getElementById('secure-communication-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Create or locate message container
    let statusMsg = form.querySelector('.form-status-msg');
    if (!statusMsg) {
      statusMsg = document.createElement('div');
      statusMsg.className = 'form-status-msg';
      form.appendChild(statusMsg);
    }

    // Get current language to show correct loading text
    const currentLang = localStorage.getItem('siteLang') || 'en';
    const loadingText = currentLang === 'en' ? 'Sending message...' : 'സന്ദേശം അയക്കുന്നു...';

    statusMsg.className = 'form-status-msg loading';
    statusMsg.innerHTML = `<i class="fas fa-spinner fa-spin"></i> <span>${loadingText}</span>`;

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;

    try {
      const formData = new FormData();
      formData.append('name', document.getElementById('frm-name').value);
      formData.append('email', document.getElementById('frm-email').value);
      formData.append('phone', document.getElementById('phone').value);
      formData.append('message', document.getElementById('frm-message').value);

      const response = await fetch('send_mail.php', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (result.status === 'success') {
        statusMsg.className = 'form-status-msg success';
        statusMsg.innerHTML = `<i class="fas fa-circle-check"></i> <span>${result.message}</span>`;
        form.reset();
      } else {
        statusMsg.className = 'form-status-msg error';
        statusMsg.innerHTML = `<i class="fas fa-circle-xmark"></i> <span>${result.message}</span>`;
      }
    } catch (error) {
      console.error('Mail send error:', error);
      const errorMsg = currentLang === 'en' 
        ? 'Failed to send message. Please check your internet connection and try again.'
        : 'സന്ദേശം അയക്കാൻ കഴിഞ്ഞില്ല. ദയവായി നിങ്ങളുടെ ഇന്റർനെറ്റ് കണക്ഷൻ പരിശോധിക്കുക.';
      statusMsg.className = 'form-status-msg error';
      statusMsg.innerHTML = `<i class="fas fa-circle-xmark"></i> <span>${errorMsg}</span>`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnHTML;
    }
  });
}