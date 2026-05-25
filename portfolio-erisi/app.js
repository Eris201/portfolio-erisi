/* ==========================================================================
   Data paths (defaults live in /data for easy editing)
   ========================================================================== */
const DATA_PORTFOLIO_URL = "data/portfolio.json";
const DATA_GUESTBOOK_URL = "data/guestbook.json";

/* Inlined fallbacks if JSON fetch fails (e.g. opened as file://) */
const FALLBACK_PORTFOLIO = [
  { id: "w1", section: "web", title: "Gjimnazi Ulpiana School Portal", category: "Portal", image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=600&q=80", tags: ["HTML5", "CSS3", "JavaScript"], liveUrl: "https://github.com", description: "Multi-role school interface with schedules, grades, and admin tools." },
  { id: "w2", section: "web", title: "Family Coffee Business Platform", category: "Catalog", image: "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=600&q=80", tags: ["JavaScript", "CSS Grid"], liveUrl: "https://github.com", description: "Product catalog with stock tracking and filters." },
  { id: "l1", section: "lab", title: "Windmill Electricity Generator", category: "Clean Power", image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=80", tags: ["Hardware Design", "Wiring"], liveUrl: "", description: "Windmill build with alternator wiring and battery charging." },
  { id: "l2", section: "lab", title: "Battery Storage System Grid", category: "Hardware", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=600&q=80", tags: ["Battery Cells", "Grid Circuit"], liveUrl: "", description: "Cell bank for storage load balancing and backup power." },
  { id: "l3", section: "lab", title: "Multimedia Creative Showcase", category: "Multimedia", image: "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=600&q=80", tags: ["Video Editing", "UI Designs"], liveUrl: "https://youtube.com", description: "Video edits, presentations, and UI concept work." }
];

const FALLBACK_GUESTBOOK = [
  { id: "c2", author: "admin", role: "admin", message: "Welcome to the guestbook! Sign up locally to leave a message.", date: "2026-05-25" }
];

/* State references */
let portfolioItems = [];
let guestbookComments = [];
let users = [];
let currentUser = null;

/* ==========================================================================
   DOM Elements Caches
   ========================================================================== */
const header = document.querySelector(".header");
const navMenu = document.getElementById("nav-menu");
const hamburgerBtn = document.getElementById("hamburger-btn");
const navLinks = document.querySelectorAll(".nav-link");

// Authentication Buttons & Badges
const authTriggerBtn = document.getElementById("auth-trigger-btn");
const userProfileBadge = document.getElementById("user-profile-badge");
const profileAvatarChar = document.getElementById("profile-avatar-char");
const profileUsernameDisplay = document.getElementById("profile-username-display");
const authLogoutBtn = document.getElementById("auth-logout-btn");

// Admin Dashboard triggers
const addWebProjectBtn = document.getElementById("add-web-project-btn");
const addLabProjectBtn = document.getElementById("add-lab-project-btn");

// Editable Content fields
const aboutBioText = document.getElementById("about-bio-text");
const statProjects = document.getElementById("stat-projects-count");
const statStack = document.getElementById("stat-stack-count");
const statSatisfaction = document.getElementById("stat-satisfaction");

// Guestbook DOM nodes
const guestbookForm = document.getElementById("guestbook-form");
const guestbookAuthPrompt = document.getElementById("guestbook-auth-prompt");
const guestbookLoginBtn = document.getElementById("guestbook-login-btn");
const guestbookMessageInput = document.getElementById("guestbook-message");
const guestbookStreamContainer = document.getElementById("guestbook-stream-container");

// Contact form DOM
const contactForm = document.getElementById("contact-form");
const toastContainer = document.getElementById("toast-container");

// Modals
const authModal = document.getElementById("auth-modal");
const authModalClose = document.getElementById("auth-modal-close");
const tabLoginBtn = document.getElementById("tab-login-btn");
const tabSignupBtn = document.getElementById("tab-signup-btn");
const loginView = document.getElementById("login-view");
const signupView = document.getElementById("signup-view");

const loginForm = document.getElementById("login-form");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginPwToggle = document.getElementById("login-pw-toggle");
const loginErrorMsg = document.getElementById("login-error-msg");

const signupForm = document.getElementById("signup-form");
const signupUsernameInput = document.getElementById("signup-username");
const signupEmailInput = document.getElementById("signup-email");
const signupPasswordInput = document.getElementById("signup-password");
const signupPwToggle = document.getElementById("signup-pw-toggle");
const signupErrorMsg = document.getElementById("signup-error-msg");

const projectModal = document.getElementById("project-modal");
const projectModalClose = document.getElementById("project-modal-close");
const projectModalCancel = document.getElementById("project-modal-cancel");
const projectForm = document.getElementById("project-form");
const projectModalTitle = document.getElementById("project-modal-title");

// Project Form Inputs
const projectIdInput = document.getElementById("project-id-input");
const projectTitleInput = document.getElementById("project-title-input");
const projectSectionInput = document.getElementById("project-section-input");
const projectTechInput = document.getElementById("project-tech-input");
const projectCategoryInput = document.getElementById("project-category-input");
const projectImageInput = document.getElementById("project-image-input");
const projectLiveInput = document.getElementById("project-live-input");
const projectDescriptionInput = document.getElementById("project-description-input");

/* ==========================================================================
   Application Initialization
   ========================================================================== */
async function init() {
  // 0. Storage Migration Check (Force fresh rich defaults load once)
  if (!localStorage.getItem("erisi_storage_version_v2")) {
    localStorage.removeItem("erisi_portfolio_items");
    localStorage.removeItem("erisi_bio_text");
    localStorage.removeItem("erisi_stat_projects");
    localStorage.removeItem("erisi_stat_stack");
    localStorage.removeItem("erisi_stat_satisfaction");
    localStorage.removeItem("erisi_guestbook_items");
    localStorage.setItem("erisi_storage_version_v2", "v2");
  }

  // 1. Load JSON defaults, then storage / session
  await loadDefaultDataFiles();
  loadUsers();
  loadPortfolioItems();
  loadGuestbookComments();
  loadAboutDetails();
  checkActiveSession();

  // 2. Render & wire UI
  renderWebProjects();
  renderLabProjects();
  renderGuestbookComments();
  setupEventListeners();
  initTypingAnimation();
  initScrollSpy();
  initThemeSelector();
  initSearchListeners();
  initProjectFilters();
  initScrollTopButton();
  initTimelineAccordion();
  initWindmillSimulator();

  refreshIcons();
}

async function loadDefaultDataFiles() {
  try {
    const [portfolioRes, guestbookRes] = await Promise.all([
      fetch(DATA_PORTFOLIO_URL),
      fetch(DATA_GUESTBOOK_URL)
    ]);
    if (portfolioRes.ok) {
      window.__DEFAULT_PORTFOLIO_ITEMS = await portfolioRes.json();
    } else {
      window.__DEFAULT_PORTFOLIO_ITEMS = FALLBACK_PORTFOLIO;
    }
    if (guestbookRes.ok) {
      window.__DEFAULT_GUESTBOOK_COMMENTS = await guestbookRes.json();
    } else {
      window.__DEFAULT_GUESTBOOK_COMMENTS = FALLBACK_GUESTBOOK;
    }
  } catch {
    window.__DEFAULT_PORTFOLIO_ITEMS = FALLBACK_PORTFOLIO;
    window.__DEFAULT_GUESTBOOK_COMMENTS = FALLBACK_GUESTBOOK;
  }
}

function getDefaultPortfolioItems() {
  return window.__DEFAULT_PORTFOLIO_ITEMS || FALLBACK_PORTFOLIO;
}

function getDefaultGuestbookComments() {
  return window.__DEFAULT_GUESTBOOK_COMMENTS || FALLBACK_GUESTBOOK;
}

/* ==========================================================================
   Data Loaders & Persistence (localStorage / sessionStorage)
   ========================================================================== */
function loadUsers() {
  try {
    const storedUsers = localStorage.getItem("portfolio_users");
    if (storedUsers) {
      users = JSON.parse(storedUsers);
      return;
    }
  } catch {
    localStorage.removeItem("portfolio_users");
  }
  {
    // Generate default admin account
    const defaultAdmin = {
      username: "admin",
      email: "admin@erisi.com",
      password: "erisi1234",
      role: "admin"
    };
    users = [defaultAdmin];
    localStorage.setItem("portfolio_users", JSON.stringify(users));
  }
}

function loadPortfolioItems() {
  try {
    const storedItems = localStorage.getItem("erisi_portfolio_items");
    if (storedItems) {
      portfolioItems = JSON.parse(storedItems);
      return;
    }
  } catch {
    localStorage.removeItem("erisi_portfolio_items");
  }
  {
    const defaults = getDefaultPortfolioItems();
    portfolioItems = defaults.length ? [...defaults] : [];
    if (portfolioItems.length) {
      localStorage.setItem("erisi_portfolio_items", JSON.stringify(portfolioItems));
    }
  }
}

function loadGuestbookComments() {
  try {
    const storedComments = localStorage.getItem("erisi_guestbook_items");
    if (storedComments) {
      guestbookComments = JSON.parse(storedComments);
      return;
    }
  } catch {
    localStorage.removeItem("erisi_guestbook_items");
  }
  {
    const defaults = getDefaultGuestbookComments();
    guestbookComments = defaults.length ? [...defaults] : [];
    if (guestbookComments.length) {
      localStorage.setItem("erisi_guestbook_items", JSON.stringify(guestbookComments));
    }
  }
}

function loadAboutDetails() {
  if (!aboutBioText) return;

  const bio = localStorage.getItem("erisi_bio_text");
  if (bio) aboutBioText.innerText = bio;

  const count = localStorage.getItem("erisi_stat_projects");
  if (count && statProjects) statProjects.innerText = count;

  const stack = localStorage.getItem("erisi_stat_stack");
  if (stack && statStack) statStack.innerText = stack;

  const satisfaction = localStorage.getItem("erisi_stat_satisfaction");
  if (satisfaction && statSatisfaction) statSatisfaction.innerText = satisfaction;
}

function checkActiveSession() {
  try {
    const sessionUser = sessionStorage.getItem("erisi_session_user");
    if (sessionUser) {
      currentUser = JSON.parse(sessionUser);
      setAuthStateUI(true);
      return;
    }
  } catch {
    sessionStorage.removeItem("erisi_session_user");
  }
  currentUser = null;
  setAuthStateUI(false);
}

/* ==========================================================================
   Rendering Portfolio Items (Web & Lab Showcase Grids)
   ========================================================================== */
let webSearchQuery = "";
let labSearchQuery = "";
let webCategoryFilter = "all";
let labCategoryFilter = "all";

function renderWebProjects() {
  const webGrid = document.getElementById("web-projects-grid");
  webGrid.innerHTML = "";

  let webItems = portfolioItems.filter(item => item.section === "web");

  if (webCategoryFilter !== "all") {
    webItems = webItems.filter(item => item.category === webCategoryFilter);
  }

  if (webSearchQuery.trim() !== "") {
    const q = webSearchQuery.toLowerCase();
    webItems = webItems.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) || 
      item.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  if (webItems.length === 0) {
    webGrid.innerHTML = getEmptyGridHTML();
    refreshIcons();
    return;
  }

  webItems.forEach(item => {
    webGrid.appendChild(createProjectCardDOM(item));
  });

  refreshIcons();
}

function renderLabProjects() {
  const labGrid = document.getElementById("lab-projects-grid");
  labGrid.innerHTML = "";

  let labItems = portfolioItems.filter(item => item.section === "lab");

  if (labCategoryFilter !== "all") {
    labItems = labItems.filter(item => item.category === labCategoryFilter);
  }

  if (labSearchQuery.trim() !== "") {
    const q = labSearchQuery.toLowerCase();
    labItems = labItems.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.description.toLowerCase().includes(q) || 
      item.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  if (labItems.length === 0) {
    labGrid.innerHTML = getEmptyGridHTML();
    refreshIcons();
    return;
  }

  labItems.forEach(item => {
    labGrid.appendChild(createProjectCardDOM(item));
  });

  refreshIcons();
}

function getEmptyGridHTML() {
  return `
    <div class="glass-card no-projects-card">
      <i data-lucide="folder-x"></i>
      <h3>No projects found</h3>
      <p>Try another filter or search term.</p>
    </div>
  `;
}

function createProjectCardDOM(item) {
  const card = document.createElement("div");
  card.className = "glass-card project-card";
  card.setAttribute("data-id", item.id);

  // Process tech chips
  const chipsHtml = item.tags
    .map(tag => `<span class="card-chip">${escapeHTML(tag.trim())}</span>`)
    .join("");

  // Edit / Delete overlay for admin user
  const adminOverlay = (currentUser && currentUser.role === "admin")
    ? `
      <div class="admin-card-overlay-actions">
        <button class="btn-card-admin edit-action" onclick="triggerEditProject('${item.id}')" title="Edit Showcase">
          <i data-lucide="edit-3"></i>
        </button>
        <button class="btn-card-admin delete-action" onclick="triggerDeleteProject('${item.id}')" title="Delete Showcase">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `
    : "";

  let linkHtml = item.liveUrl
    ? `<a href="${escapeHTML(item.liveUrl)}" target="_blank" class="card-link-item"><i data-lucide="external-link"></i> Link / Code</a>`
    : "";

  if (item.id === "l1") {
    linkHtml += `<button class="card-link-item btn-sim-trigger" onclick="openWindmillSimulator()"><i data-lucide="play-circle"></i> Output Simulator</button>`;
  }

  card.innerHTML = `
    ${adminOverlay}
    <div class="img-cover-wrapper">
      <img class="img-cover" src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy" decoding="async" onerror="this.src='https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80'">
      <div class="img-overlay-dark"></div>
      <span class="card-cat-badge">${escapeHTML(item.category)}</span>
    </div>
    <div class="card-details-box">
      <h3 class="card-title">${escapeHTML(item.title)}</h3>
      <p class="card-text-desc">${escapeHTML(item.description)}</p>
      <div class="card-chips">${chipsHtml}</div>
      <div class="card-hyperlinks">${linkHtml}</div>
    </div>
  `;

  return card;
}

/* ==========================================================================
   Rendering Guestbook Comments Section
   ========================================================================== */
function renderGuestbookComments() {
  guestbookStreamContainer.innerHTML = "";

  if (guestbookComments.length === 0) {
    guestbookStreamContainer.innerHTML = `
      <div class="no-comments-indicator">
        <p>No comments posted. Be the first to leave a message!</p>
      </div>
    `;
    return;
  }

  // Render from newest to oldest
  const reversed = [...guestbookComments].reverse();

  reversed.forEach(comment => {
    const card = document.createElement("div");
    card.className = "comment-card";
    card.setAttribute("data-id", comment.id);

    const isAuthorAdmin = comment.role === "admin";
    const authorClass = isAuthorAdmin ? "comment-author role-admin" : "comment-author";
    
    // Trash delete capability
    const canDelete = currentUser && (currentUser.role === "admin" || currentUser.username === comment.author);
    const deleteBtn = canDelete
      ? `<button class="btn-delete-comment" onclick="deleteComment('${comment.id}')" title="Delete Message"><i data-lucide="trash-2"></i></button>`
      : "";

    card.innerHTML = `
      ${deleteBtn}
      <div class="comment-meta">
        <span class="${authorClass}">
          <i data-lucide="user"></i>
          ${escapeHTML(comment.author)}
        </span>
        <span class="comment-date">${escapeHTML(comment.date)}</span>
      </div>
      <p class="comment-body">${escapeHTML(comment.message)}</p>
    `;

    guestbookStreamContainer.appendChild(card);
  });

  refreshIcons();
}

/* ==========================================================================
   Auth State Interface Logic
   ========================================================================== */
function setAuthStateUI(loggedIn) {
  if (loggedIn && currentUser) {
    // 1. Hide Login trigger, show profile panel
    authTriggerBtn.classList.add("hidden");
    userProfileBadge.classList.remove("hidden");
    profileAvatarChar.innerText = currentUser.username.charAt(0).toUpperCase();
    profileUsernameDisplay.innerText = currentUser.username;

    // 2. Adjust Guestbook board forms
    guestbookAuthPrompt.classList.add("hidden");
    guestbookForm.classList.remove("hidden");

    // 3. Check for Admin Privileges
    if (currentUser.role === "admin") {
      document.body.classList.add("admin-active");
      addWebProjectBtn.classList.remove("hidden");
      addLabProjectBtn.classList.remove("hidden");

      // Enable text editable sections
      aboutBioText.contentEditable = "true";
      statProjects.contentEditable = "true";
      statStack.contentEditable = "true";
      statSatisfaction.contentEditable = "true";

      setupContentEditableSaving();
    } else {
      disableAdminUI();
    }
  } else {
    // Logged Out State
    authTriggerBtn.classList.remove("hidden");
    userProfileBadge.classList.add("hidden");

    guestbookForm.classList.add("hidden");
    guestbookAuthPrompt.classList.remove("hidden");

    disableAdminUI();
  }

  // Refresh grids for admin actions overlays toggle
  renderWebProjects();
  renderLabProjects();
  renderGuestbookComments();
}

function disableAdminUI() {
  document.body.classList.remove("admin-active");
  addWebProjectBtn.classList.add("hidden");
  addLabProjectBtn.classList.add("hidden");

  // Disable text editable sections
  aboutBioText.contentEditable = "false";
  statProjects.contentEditable = "false";
  statStack.contentEditable = "false";
  statSatisfaction.contentEditable = "false";
}

function setupContentEditableSaving() {
  const saveInputText = (key, element) => {
    // Remove old listeners to avoid multiple attachments
    const newElement = element.cloneNode(true);
    element.parentNode.replaceChild(newElement, element);

    newElement.addEventListener("blur", () => {
      localStorage.setItem(key, newElement.innerText.trim());
      showToast("Changes saved automatically", "info");
    });

    newElement.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });
  };

  saveInputText("erisi_bio_text", aboutBioText);
  saveInputText("erisi_stat_projects", statProjects);
  saveInputText("erisi_stat_stack", statStack);
  saveInputText("erisi_stat_satisfaction", statSatisfaction);
}

/* ==========================================================================
   Toast Alert Messages
   ========================================================================== */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;

  let iconName = "check-circle";
  if (type === "error") iconName = "alert-circle";
  if (type === "info") iconName = "info";

  toast.innerHTML = `
    <i data-lucide="${iconName}"></i>
    <span>${message}</span>
  `;

  toastContainer.appendChild(toast);
  refreshIcons();

  // Slide-out and remove timeout
  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3500);
}

/* ==========================================================================
   DOM Event Listeners Setup
   ========================================================================== */
function closeMobileNav() {
  hamburgerBtn.classList.remove("open");
  navMenu.classList.remove("open");
  document.body.classList.remove("nav-open");
  hamburgerBtn.setAttribute("aria-expanded", "false");
}

function setupEventListeners() {
  // Mobile Hamburger Toggle
  hamburgerBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const willOpen = !navMenu.classList.contains("open");
    hamburgerBtn.classList.toggle("open", willOpen);
    navMenu.classList.toggle("open", willOpen);
    document.body.classList.toggle("nav-open", willOpen);
    hamburgerBtn.setAttribute("aria-expanded", willOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (navMenu.classList.contains("open") && !navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
      closeMobileNav();
    }
  });

  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      closeMobileNav();
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeMobileNav();
    authModal.classList.remove("open");
    projectModal.classList.remove("open");
    const windmillModal = document.getElementById("windmill-modal");
    if (windmillModal) windmillModal.classList.remove("open");
  });

  // Sticky Scroll Header shadow
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Modal show triggers
  authTriggerBtn.addEventListener("click", () => {
    openAuthModal("login");
  });

  guestbookLoginBtn.addEventListener("click", () => {
    openAuthModal("login");
  });

  authModalClose.addEventListener("click", () => authModal.classList.remove("open"));

  // Toggle Login/Signup view tabs
  tabLoginBtn.addEventListener("click", () => switchAuthTab("login"));
  tabSignupBtn.addEventListener("click", () => switchAuthTab("signup"));

  // Password visibility buttons
  loginPwToggle.addEventListener("click", () => togglePasswordVisibility(loginPasswordInput, loginPwToggle));
  signupPwToggle.addEventListener("click", () => togglePasswordVisibility(signupPasswordInput, signupPwToggle));

  // Sign In handler
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginErrorMsg.classList.remove("is-visible");

    const usernameOrEmail = loginUsernameInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;

    const userMatch = users.find(u => 
      (u.username.toLowerCase() === usernameOrEmail || u.email.toLowerCase() === usernameOrEmail) && 
      u.password === password
    );

    if (userMatch) {
      currentUser = {
        username: userMatch.username,
        email: userMatch.email,
        role: userMatch.role
      };
      sessionStorage.setItem("erisi_session_user", JSON.stringify(currentUser));
      setAuthStateUI(true);
      authModal.classList.remove("open");
      showToast(`Welcome back, ${currentUser.username}!`, "success");
    } else {
      loginErrorMsg.classList.add("is-visible");
      showToast("Verification failed", "error");
    }
  });

  // Sign Up handler
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    signupErrorMsg.classList.remove("is-visible");

    const username = signupUsernameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value;

    // Standard validations
    if (username.length < 3) {
      showToast("Username must be at least 3 characters", "error");
      return;
    }
    if (password.length < 4) {
      showToast("Password must be at least 4 characters", "error");
      return;
    }

    // Uniqueness checks
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase() || u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      signupErrorMsg.classList.add("is-visible");
      showToast("Username or email already in use", "error");
      return;
    }

    // Save account
    const newUser = { username, email, password, role: "user" };
    users.push(newUser);
    localStorage.setItem("portfolio_users", JSON.stringify(users));

    // Auto-login new user
    currentUser = { username: newUser.username, email: newUser.email, role: newUser.role };
    sessionStorage.setItem("erisi_session_user", JSON.stringify(currentUser));
    
    setAuthStateUI(true);
    authModal.classList.remove("open");
    showToast("Registration completed successfully!", "success");
  });

  // Logout trigger
  authLogoutBtn.addEventListener("click", () => {
    currentUser = null;
    sessionStorage.removeItem("erisi_session_user");
    setAuthStateUI(false);
    showToast("Logged out successfully", "info");
  });

  // Guestbook comment submit
  guestbookForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!currentUser) return;

    const message = guestbookMessageInput.value.trim();
    if (message.length === 0) return;

    const newComment = {
      id: "c_" + Date.now().toString(),
      author: currentUser.username,
      role: currentUser.role,
      message: message,
      date: new Date().toISOString().split("T")[0]
    };

    guestbookComments.push(newComment);
    localStorage.setItem("erisi_guestbook_items", JSON.stringify(guestbookComments));

    renderGuestbookComments();
    guestbookMessageInput.value = "";
    // Remove active floating label states
    guestbookMessageInput.placeholder = " ";
    showToast("Message published on guestbook", "success");
  });

  // Project Managers Close Modal triggers
  projectModalClose.addEventListener("click", () => projectModal.classList.remove("open"));
  projectModalCancel.addEventListener("click", () => projectModal.classList.remove("open"));

  // Web and Lab Add Triggers
  addWebProjectBtn.addEventListener("click", () => openProjectModal("web"));
  addLabProjectBtn.addEventListener("click", () => openProjectModal("lab"));

  // Project Form Submit Handler (CRUD Save/Update)
  projectForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id = projectIdInput.value;
    const title = projectTitleInput.value.trim();
    const section = projectSectionInput.value;
    const tags = projectTechInput.value.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const category = projectCategoryInput.value;
    const image = projectImageInput.value.trim();
    const liveUrl = projectLiveInput.value.trim();
    const description = projectDescriptionInput.value.trim();

    if (id) {
      // Edit Update
      const index = portfolioItems.findIndex(item => item.id === id);
      if (index !== -1) {
        portfolioItems[index] = { id, section, title, category, image, tags, liveUrl, description };
        showToast("Item modified successfully", "success");
      }
    } else {
      // Create Add
      const newItem = {
        id: "p_" + Date.now().toString(),
        section,
        title,
        category,
        image,
        tags,
        liveUrl,
        description
      };
      portfolioItems.push(newItem);
      showToast("Item created successfully", "success");
    }

    // Sync localStorage and Re-render
    localStorage.setItem("erisi_portfolio_items", JSON.stringify(portfolioItems));
    projectModal.classList.remove("open");
    
    renderWebProjects();
    renderLabProjects();
    refreshProjectFilterBars();
  });

  // Contact Form Simulated Submission
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector(".btn-submit-contact");
    const originalContent = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Sending Message...</span> <i class="spinner"></i>`;

    setTimeout(() => {
      showToast("Thank you! Message sent successfully. Erisi will reach out shortly.", "success");
      contactForm.reset();
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalContent;
    }, 1500);
  });

  // Close modals on overlay backdrop click
  window.addEventListener("click", (e) => {
    if (e.target === authModal) authModal.classList.remove("open");
    if (e.target === projectModal) projectModal.classList.remove("open");
    const windmillModal = document.getElementById("windmill-modal");
    if (windmillModal && e.target === windmillModal) windmillModal.classList.remove("open");
  });
}

/* ==========================================================================
   Modal Controls Helpers
   ========================================================================== */
function openAuthModal(mode) {
  authModal.classList.add("open");
  switchAuthTab(mode);
}

function switchAuthTab(mode) {
  loginErrorMsg.classList.remove("is-visible");
  signupErrorMsg.classList.remove("is-visible");

  if (mode === "login") {
    tabLoginBtn.classList.add("active");
    tabSignupBtn.classList.remove("active");
    loginView.classList.remove("hidden");
    signupView.classList.add("hidden");
    loginUsernameInput.focus();
  } else {
    tabLoginBtn.classList.remove("active");
    tabSignupBtn.classList.add("active");
    loginView.classList.add("hidden");
    signupView.classList.remove("hidden");
    signupUsernameInput.focus();
  }
}

function togglePasswordVisibility(inputField, buttonToggle) {
  const isPw = inputField.type === "password";
  inputField.type = isPw ? "text" : "password";
  
  const icon = buttonToggle.querySelector("i");
  if (isPw) {
    icon.setAttribute("data-lucide", "eye-off");
  } else {
    icon.setAttribute("data-lucide", "eye");
  }
  refreshIcons();
}

function openProjectModal(sectionMode) {
  projectForm.reset();
  projectIdInput.value = "";
  
  // Set default section mode selector
  projectSectionInput.value = sectionMode;
  projectModalTitle.innerText = sectionMode === "web" ? "Add Web Project" : "Add Hardware Showcase";
  
  projectModal.classList.add("open");
}

/* ==========================================================================
   CRUD Interface Actions (Global / Window scope hooks)
   ========================================================================== */
window.triggerEditProject = function(id) {
  const item = portfolioItems.find(p => p.id === id);
  if (!item) return;

  projectIdInput.value = item.id;
  projectTitleInput.value = item.title;
  projectSectionInput.value = item.section;
  projectTechInput.value = item.tags.join(", ");
  projectCategoryInput.value = item.category;
  projectImageInput.value = item.image;
  projectLiveInput.value = item.liveUrl || "";
  projectDescriptionInput.value = item.description;

  projectModalTitle.innerText = "Edit Showcase Item";
  projectModal.classList.add("open");
};

window.triggerDeleteProject = function(id) {
  if (confirm("Are you sure you want to remove this showcase item?")) {
    portfolioItems = portfolioItems.filter(p => p.id !== id);
    localStorage.setItem("erisi_portfolio_items", JSON.stringify(portfolioItems));
    
    renderWebProjects();
    renderLabProjects();
    refreshProjectFilterBars();
    showToast("Showcase item deleted", "info");
  }
};

window.deleteComment = function(commentId) {
  if (confirm("Are you sure you want to delete this message?")) {
    guestbookComments = guestbookComments.filter(c => c.id !== commentId);
    localStorage.setItem("erisi_guestbook_items", JSON.stringify(guestbookComments));
    renderGuestbookComments();
    showToast("Guestbook message deleted", "info");
  }
};

/* ==========================================================================
   Escaping Text Inputs for DOM injection
   ========================================================================== */
function escapeHTML(str) {
  if (!str) return "";
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

/* ==========================================================================
   Micro-interactions typing effects
   ========================================================================== */
function initTypingAnimation() {
  const textElement = document.getElementById("typed-text");
  const words = ["Web Portals", "Clean Energy Labs", "Laravel Backends", "Hardware Storage Grids"];
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let speed = 90;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      textElement.innerText = currentWord.substring(0, charIndex - 1);
      charIndex--;
      speed = 40;
    } else {
      textElement.innerText = currentWord.substring(0, charIndex + 1);
      charIndex++;
      speed = 90;
    }

    if (!isDeleting && charIndex === currentWord.length) {
      speed = 1800; // end of word pause
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      speed = 400; // pause before next word
    }

    setTimeout(type, speed);
  }

  type();
}

/* ==========================================================================
   ScrollSpy Active Nav indicators
   ========================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  
  window.addEventListener("scroll", () => {
    let scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute("id");
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.add("active");
      } else {
        document.querySelector(`.nav-menu a[href*=${sectionId}]`)?.classList.remove("active");
      }
    });
  });
}

/* ==========================================================================
   Advanced Interactive Modules
   ========================================================================== */

function initThemeSelector() {
  const themeSwitcher = document.getElementById("theme-switcher");
  if (!themeSwitcher) return;

  const dots = themeSwitcher.querySelectorAll(".theme-dot");
  
  const savedTheme = localStorage.getItem("erisi_theme_color") || "emerald";
  applyTheme(savedTheme);

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const theme = dot.getAttribute("data-theme");
      applyTheme(theme);
    });
  });

  function applyTheme(themeName) {
    document.body.classList.remove("theme-blue", "theme-pink", "theme-orange");
    dots.forEach(d => d.classList.remove("active"));

    if (themeName !== "emerald") {
      document.body.classList.add("theme-" + themeName);
    }

    const activeDot = themeSwitcher.querySelector(`.theme-dot[data-theme="${themeName}"]`);
    if (activeDot) activeDot.classList.add("active");

    localStorage.setItem("erisi_theme_color", themeName);
  }
}

function initSearchListeners() {
  const webSearchInput = document.getElementById("web-search-input");
  const labSearchInput = document.getElementById("lab-search-input");

  if (webSearchInput) {
    webSearchInput.addEventListener("input", (e) => {
      webSearchQuery = e.target.value;
      renderWebProjects();
    });
  }

  if (labSearchInput) {
    labSearchInput.addEventListener("input", (e) => {
      labSearchQuery = e.target.value;
      renderLabProjects();
    });
  }
}

function getCategoriesForSection(section) {
  const cats = portfolioItems
    .filter(item => item.section === section)
    .map(item => item.category)
    .filter(Boolean);
  return [...new Set(cats)];
}

function buildProjectFilterBar(barEl) {
  if (!barEl) return;
  const section = barEl.dataset.section;
  const activeFilter = section === "web" ? webCategoryFilter : labCategoryFilter;
  const categories = getCategoriesForSection(section);

  let html = `<button type="button" class="filter-chip${activeFilter === "all" ? " active" : ""}" data-filter="all">All</button>`;
  categories.forEach(cat => {
    const isActive = activeFilter === cat ? " active" : "";
    html += `<button type="button" class="filter-chip${isActive}" data-filter="${escapeHTML(cat)}">${escapeHTML(cat)}</button>`;
  });
  barEl.innerHTML = html;
}

function refreshProjectFilterBars() {
  buildProjectFilterBar(document.getElementById("web-filter-bar"));
  buildProjectFilterBar(document.getElementById("lab-filter-bar"));
  refreshIcons();
}

function initProjectFilters() {
  refreshProjectFilterBars();

  document.querySelectorAll(".filter-bar").forEach(bar => {
    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-chip");
      if (!btn || !bar.contains(btn)) return;

      bar.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      if (bar.dataset.section === "web") {
        webCategoryFilter = filter;
        renderWebProjects();
      } else {
        labCategoryFilter = filter;
        renderLabProjects();
      }
    });
  });
}

function initScrollTopButton() {
  const btn = document.getElementById("scroll-top-btn");
  if (!btn) return;

  window.addEventListener("scroll", () => {
    btn.classList.toggle("visible", window.scrollY > 500);
  }, { passive: true });

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initTimelineAccordion() {
  const timelineItems = document.querySelectorAll(".timeline-item");
  
  const timelineChecklists = [
    [
      { text: "Routing & Route Parameters", checked: true },
      { text: "Eloquent Database Relationships", checked: true },
      { text: "Middleware Authentication Gateways", checked: false },
      { text: "Queued Jobs & Event Mailers", checked: false }
    ],
    [
      { text: "JSX Components & Functional Props", checked: true },
      { text: "Hooks integration (useState / useEffect)", checked: false },
      { text: "Context API Global State Manager", checked: false },
      { text: "Tailwind Styling Directives", checked: false }
    ],
    [
      { text: "CORS Configurations & Rate Limiting", checked: false },
      { text: "JWT / Sanctum API Authentication", checked: false },
      { text: "PostgreSQL Query Optimizations", checked: false },
      { text: "GraphQL API Schemas", checked: false }
    ],
    [
      { text: "Arduino Electrical Wiring Grids", checked: true },
      { text: "Python serial library data readers", checked: false },
      { text: "Local storage cache updates", checked: false },
      { text: "LLM API connector controllers", checked: false }
    ]
  ];

  timelineItems.forEach((item, index) => {
    item.addEventListener("click", () => {
      const isAlreadyExpanded = item.classList.contains("expanded");
      
      timelineItems.forEach(t => t.classList.remove("expanded"));
      
      if (!isAlreadyExpanded) {
        item.classList.add("expanded");
        
        let checklistContainer = item.querySelector(".timeline-checklist");
        if (!checklistContainer) {
          checklistContainer = document.createElement("div");
          checklistContainer.className = "timeline-checklist";
          
          const listData = timelineChecklists[index] || [];
          checklistContainer.innerHTML = listData
            .map(task => {
              const iconName = task.checked ? "check-square" : "square";
              const classStr = task.checked ? "checklist-item checked" : "checklist-item";
              return `
                <div class="${classStr}">
                  <i data-lucide="${iconName}"></i>
                  <span>${escapeHTML(task.text)}</span>
                </div>
              `;
            })
            .join("");
            
          item.appendChild(checklistContainer);
          refreshIcons();
        }
      } else {
        item.classList.remove("expanded");
      }
    });
  });
}

function initWindmillSimulator() {
  const slider = document.getElementById("wind-speed-slider");
  const closeBtn = document.getElementById("windmill-modal-close");
  const modal = document.getElementById("windmill-modal");

  if (!slider) return;

  slider.addEventListener("input", (e) => {
    const wSpeed = parseFloat(e.target.value);
    updateSimulatorData(wSpeed);
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.remove("open"));
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.remove("open");
    });
  }
}

function updateSimulatorData(wSpeed) {
  const speedLabel = document.getElementById("wind-speed-val");
  const rpmLabel = document.getElementById("metric-rpm");
  const voltageLabel = document.getElementById("metric-voltage");
  const currentLabel = document.getElementById("metric-current");
  const powerLabel = document.getElementById("metric-power");
  const banner = document.getElementById("sim-status-banner");
  const bannerText = document.getElementById("sim-status-text");
  const rotor = document.getElementById("windmill-rotor");

  speedLabel.innerText = wSpeed.toFixed(1) + " m/s";

  let rpm = 0;
  let voltage = 0;
  let current = 0;
  let power = 0;
  let isOverload = wSpeed > 22;

  if (wSpeed > 0 && !isOverload) {
    rpm = Math.round(wSpeed * 60);
    voltage = parseFloat((wSpeed * 0.96).toFixed(2));
    current = parseFloat((wSpeed * 0.4).toFixed(2));
    power = parseFloat((voltage * current).toFixed(2));
  }

  rpmLabel.innerText = rpm;
  voltageLabel.innerText = voltage.toFixed(2) + " V";
  currentLabel.innerText = current.toFixed(2) + " A";
  powerLabel.innerText = power.toFixed(2) + " W";

  if (isOverload) {
    banner.className = "sim-status-banner warning";
    bannerText.innerText = "[WARNING] High wind speeds (>22 m/s)! Automated brake circuit tripped to prevent alternator burnout. Power cut to 0W.";
    rotor.style.animation = "none";
    
    rpmLabel.innerText = "0";
    voltageLabel.innerText = "0.00 V";
    currentLabel.innerText = "0.00 A";
    powerLabel.innerText = "0.00 W";
  } else if (wSpeed === 0) {
    banner.className = "sim-status-banner info";
    bannerText.innerText = "Turbine is currently idle. Increase wind speed using the slider.";
    rotor.style.animation = "none";
  } else {
    banner.className = "sim-status-banner info";
    bannerText.innerText = "Generator output is operating normally in optimal wind levels.";
    
    const duration = 12 / wSpeed;
    rotor.style.animation = `spin ${duration.toFixed(3)}s linear infinite`;
  }
}

window.openWindmillSimulator = function() {
  const modal = document.getElementById("windmill-modal");
  if (modal) {
    modal.classList.add("open");
    const slider = document.getElementById("wind-speed-slider");
    if (slider) {
      slider.value = 8;
      updateSimulatorData(8);
    }
  }
};

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Bootstrapping Application
window.addEventListener("DOMContentLoaded", () => {
  init().catch((err) => {
    console.error("Portfolio init failed:", err);
  });
});
