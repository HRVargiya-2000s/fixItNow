window.addEventListener("error", (e) => {
  if (e.message.includes("translate-page") || e.message.includes("save-page")) {
    e.preventDefault()
  }
})

// ========================================
// THEME TOGGLE (Light/Dark Mode)
// ========================================

const themeToggle = document.getElementById("themeToggle")
const htmlElement = document.documentElement

// Check for saved theme preference or default to 'light'
const currentTheme = localStorage.getItem("theme") || "light"
htmlElement.setAttribute("data-theme", currentTheme)

// Update icon based on current theme
function updateThemeIcon(theme) {
  const icon = themeToggle?.querySelector("i")
  if (!icon) return

  if (theme === "dark") {
    icon.classList.remove("fa-moon")
    icon.classList.add("fa-sun")
  } else {
    icon.classList.remove("fa-sun")
    icon.classList.add("fa-moon")
  }
}

updateThemeIcon(currentTheme)

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const theme = htmlElement.getAttribute("data-theme")
    const newTheme = theme === "light" ? "dark" : "light"

    htmlElement.setAttribute("data-theme", newTheme)
    localStorage.setItem("theme", newTheme)
    updateThemeIcon(newTheme)
  })
}

// ========================================
// AUTHENTICATION & USER MANAGEMENT
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] Main.js DOMContentLoaded")

  if (window.unifiedAuth) {
    await window.unifiedAuth.waitForInit()
    console.log("[v0] Auth initialized in main.js")
    updateNavigation()
  }

  // Initialize other features only once
  initializeSearch()
  initializeFilters()
})

async function updateNavigation() {
  const loginLink = document.querySelector(".btn-nav-login")
  if (!loginLink) {
    console.log("[v0] Login link not found")
    return
  }

  const userData = window.unifiedAuth?.getUserData()
  console.log("[v0] User data:", userData)

  if (userData && userData.loggedIn) {
    loginLink.innerHTML = `
      <div class="profile-viewer">
        <div class="profile-avatar">
          <i class="fas fa-user-circle"></i>
        </div>
        <div class="profile-menu">
          <div class="profile-header">
            <div class="profile-avatar-large">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="profile-info">
              <p class="profile-name">${userData.displayName || "User"}</p>
              <p class="profile-email">${userData.email || ""}</p>
            </div>
          </div>
          <div class="profile-divider"></div>
          <button type="button" class="profile-menu-item" id="profileMyIssuesBtn">
            <i class="fas fa-list-check"></i> My Issues
          </button>
          <div class="profile-divider"></div>
          <button class="profile-menu-item logout-btn" id="logoutBtn">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    `

    const profileViewer = loginLink.querySelector(".profile-viewer")
    if (profileViewer) {
      // Prevent the outer anchor from navigating to the login page when clicked
      try {
        loginLink.removeAttribute('href')
        loginLink.setAttribute('role', 'button')
        loginLink.style.cursor = 'pointer'
        // ensure click won't navigate (use onclick so it doesn't add duplicate listeners)
        loginLink.onclick = function (ev) { ev.preventDefault(); }
      } catch (e) {
        // ignore
      }
      // Toggle menu on avatar click
      const profileAvatar = profileViewer.querySelector(".profile-avatar")
      if (profileAvatar) {
        profileAvatar.addEventListener("click", (e) => {
          e.preventDefault()
          e.stopPropagation()
          const menu = profileViewer.querySelector(".profile-menu")
          menu.classList.toggle("active")
        })
      }

      // Close menu when clicking outside
      document.addEventListener("click", (e) => {
        if (!profileViewer.contains(e.target)) {
          const menu = profileViewer.querySelector(".profile-menu")
          if (menu) menu.classList.remove("active")
        }
      })
    }

    // Add logout functionality
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async (e) => {
        e.preventDefault()
        showToast("Logging out...", "info")
        await window.unifiedAuth.logout()
        setTimeout(() => {
          // Choose a relative path so redirect works from both root and pages subfolders
          const path = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html'
          window.location.href = path
        }, 500)
      })
    }
    // My Issues button (relative navigation) - attach handler if present
    const myIssuesBtn = document.getElementById('profileMyIssuesBtn')
    if (myIssuesBtn) {
      myIssuesBtn.addEventListener('click', (e) => {
        e.preventDefault()
        // If we're already inside /pages/, navigate to the sibling page file; otherwise use pages/my-issues.html
        const target = window.location.pathname.includes('/pages/') ? 'my-issues.html' : 'pages/my-issues.html'
        window.location.href = target
      })
    }
    } else {
    // Show login link
    loginLink.innerHTML = '<i class="fas fa-user"></i>'
    loginLink.title = "Login"
    // Use a relative path so the link works from both root and pages subfolders
    loginLink.href = window.location.pathname.includes('/pages/') ? '../pages/login.html' : 'pages/login.html'
  }
}

function showToast(message, type = "info") {
  const toast = document.createElement("div")
  toast.className = `toast toast-${type}`
  toast.innerHTML = `
    <i class="fas fa-${type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"}"></i>
    <span>${message}</span>
  `

  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === "success" ? "#10b981" : type === "error" ? "#ef4444" : "#3b82f6"};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    animation: slideInRight 0.3s ease;
    max-width: 400px;
  `

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => toast.remove(), 300)
  }, 3000)
}

// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

const navToggle = document.getElementById("navToggle")
const navMenu = document.getElementById("navMenu")

if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active")

    // Change icon
    const icon = navToggle.querySelector("i")
    if (navMenu.classList.contains("active")) {
      icon.classList.remove("fa-bars")
      icon.classList.add("fa-times")
    } else {
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    }
  })

  // Close menu when clicking on a link
  const navLinks = navMenu.querySelectorAll("a")
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("active")
      const icon = navToggle.querySelector("i")
      icon.classList.remove("fa-times")
      icon.classList.add("fa-bars")
    })
  })
}

// ========================================
// SEARCH FUNCTIONALITY WITH SUGGESTIONS
// ========================================

const searchInput = document.getElementById("searchInput")
const searchSuggestions = document.getElementById("searchSuggestions")

// Sample repair guides data
const repairGuides = [
  { title: "Fix a Leaking Faucet", category: "plumbing", difficulty: "easy" },
  { title: "Replace Light Switch", category: "electrical", difficulty: "easy" },
  { title: "Change a Flat Tire", category: "vehicle", difficulty: "easy" },
  { title: "Unclog a Drain", category: "plumbing", difficulty: "easy" },
  { title: "Replace Outlet", category: "electrical", difficulty: "medium" },
  { title: "Fix Running Toilet", category: "plumbing", difficulty: "medium" },
  { title: "Change Car Oil", category: "vehicle", difficulty: "medium" },
  { title: "Replace Car Battery", category: "vehicle", difficulty: "easy" },
  { title: "Fix Squeaky Door Hinge", category: "furniture", difficulty: "easy" },
  { title: "Repair Refrigerator", category: "appliance", difficulty: "advanced" },
  { title: "Install Ceiling Fan", category: "electrical", difficulty: "advanced" },
  { title: "Fix AC Not Cooling", category: "hvac", difficulty: "medium" },
]

if (searchInput && searchSuggestions) {
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim()

    if (query.length === 0) {
      searchSuggestions.classList.remove("active")
      searchSuggestions.innerHTML = ""
      return
    }

    // Filter guides based on query
    const matches = repairGuides.filter(
      (guide) => guide.title.toLowerCase().includes(query) || guide.category.toLowerCase().includes(query),
    )

    if (matches.length > 0) {
      searchSuggestions.innerHTML = matches
        .slice(0, 5) // Show max 5 suggestions
        .map(
          (guide) => `
                    <div class="suggestion-item" data-category="${guide.category}">
                        <i class="fas fa-search"></i> ${guide.title}
                        <span style="float: right; color: var(--text-light); font-size: 0.85rem;">
                            ${guide.difficulty}
                        </span>
                    </div>
                `,
        )
        .join("")

      searchSuggestions.classList.add("active")

      // Add click event to suggestions
      document.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
          const category = item.getAttribute("data-category")
          window.location.href = `pages/repair-guide.html?category=${category}`
        })
      })
    } else {
      searchSuggestions.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-info-circle"></i> No results found
                </div>
            `
      searchSuggestions.classList.add("active")
    }
  })

  // Close suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
      searchSuggestions.classList.remove("active")
    }
  })
}

// ========================================
// CATEGORY & DIFFICULTY FILTERS
// ========================================

const categoryFilter = document.getElementById("categoryFilter")
const difficultyFilter = document.getElementById("difficultyFilter")
const categoryGrid = document.getElementById("categoryGrid")

if (categoryFilter && difficultyFilter && categoryGrid) {
  categoryFilter.addEventListener("change", filterCards)
  difficultyFilter.addEventListener("change", filterCards)
}

function filterCards() {
  const selectedCategory = categoryFilter.value
  const selectedDifficulty = difficultyFilter.value
  const cards = categoryGrid.querySelectorAll(".category-card")

  cards.forEach((card) => {
    const cardCategory = card.getAttribute("data-category")
    const cardDifficulty = card.getAttribute("data-difficulty")

    const categoryMatch = selectedCategory === "all" || cardCategory === selectedCategory
    const difficultyMatch = selectedDifficulty === "all" || cardDifficulty === selectedDifficulty

    if (categoryMatch && difficultyMatch) {
      card.style.display = "block"
      card.classList.add("fade-in")
    } else {
      card.style.display = "none"
    }
  })
}

// ========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================================

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault()
    const target = document.querySelector(this.getAttribute("href"))
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  })
})

// ========================================
// CARD HOVER ANIMATIONS
// ========================================

const cards = document.querySelectorAll(".category-card")
cards.forEach((card, index) => {
  // Stagger animation on load
  card.style.animationDelay = `${index * 0.1}s`

  // Add 3D tilt effect on hover (optional enhancement)
  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = (y - centerY) / 10
    const rotateY = (centerX - x) / 10

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`
  })

  card.addEventListener("mouseleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)"
  })
})

// ========================================
// CONSOLE WELCOME MESSAGE
// ========================================

console.log("%c🔧 Welcome to FixItNow! 🔧", "color: #2563eb; font-size: 20px; font-weight: bold;")
console.log("%cEmpowering self-reliance through visual repair guides", "color: #10b981; font-size: 14px;")

// ========================================
// INITIALIZATION FUNCTIONS
// ========================================

// Initialize search functionality
function initializeSearch() {
  const searchInput = document.getElementById("searchInput")
  const searchSuggestions = document.getElementById("searchSuggestions")

  if (!searchInput || !searchSuggestions) return

  // Sample repair guides data (will be replaced with API call)
  const repairGuides = [
    { title: "Fix a Leaking Faucet", category: "plumbing", difficulty: "easy" },
    { title: "Replace Light Switch", category: "electrical", difficulty: "easy" },
    { title: "Change a Flat Tire", category: "vehicle", difficulty: "easy" },
    { title: "Unclog a Drain", category: "plumbing", difficulty: "easy" },
    { title: "Replace Outlet", category: "electrical", difficulty: "medium" },
    { title: "Fix Running Toilet", category: "plumbing", difficulty: "medium" },
    { title: "Change Car Oil", category: "vehicle", difficulty: "medium" },
    { title: "Replace Car Battery", category: "vehicle", difficulty: "easy" },
    { title: "Fix Squeaky Door Hinge", category: "furniture", difficulty: "easy" },
    { title: "Repair Refrigerator", category: "appliance", difficulty: "advanced" },
    { title: "Install Ceiling Fan", category: "electrical", difficulty: "advanced" },
    { title: "Fix AC Not Cooling", category: "hvac", difficulty: "medium" },
  ]

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim()

    if (query.length === 0) {
      searchSuggestions.classList.remove("active")
      searchSuggestions.innerHTML = ""
      return
    }

    // Filter guides based on query
    const matches = repairGuides.filter(
      (guide) => guide.title.toLowerCase().includes(query) || guide.category.toLowerCase().includes(query),
    )

    if (matches.length > 0) {
      searchSuggestions.innerHTML = matches
        .slice(0, 5) // Show max 5 suggestions
        .map(
          (guide) => `
                    <div class="suggestion-item" data-category="${guide.category}">
                        <i class="fas fa-search"></i> ${guide.title}
                        <span style="float: right; color: var(--text-light); font-size: 0.85rem;">
                            ${guide.difficulty}
                        </span>
                    </div>
                `,
        )
        .join("")

      searchSuggestions.classList.add("active")

      // Add click event to suggestions
      document.querySelectorAll(".suggestion-item").forEach((item) => {
        item.addEventListener("click", () => {
          const category = item.getAttribute("data-category")
          window.location.href = `pages/repair-guide.html?category=${category}`
        })
      })
    } else {
      searchSuggestions.innerHTML = `
                <div class="suggestion-item">
                    <i class="fas fa-info-circle"></i> No results found
                </div>
            `
      searchSuggestions.classList.add("active")
    }
  })

  // Close suggestions when clicking outside
  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target) && !searchSuggestions.contains(e.target)) {
      searchSuggestions.classList.remove("active")
    }
  })
}

// Initialize filters
function initializeFilters() {
  const categoryFilter = document.getElementById("categoryFilter")
  const difficultyFilter = document.getElementById("difficultyFilter")
  const categoryGrid = document.getElementById("categoryGrid")

  if (!categoryFilter || !difficultyFilter || !categoryGrid) return

  const filterCards = () => {
    const selectedCategory = categoryFilter.value
    const selectedDifficulty = difficultyFilter.value
    const cards = categoryGrid.querySelectorAll(".category-card")

    cards.forEach((card) => {
      const cardCategory = card.getAttribute("data-category")
      const cardDifficulty = card.getAttribute("data-difficulty")

      const categoryMatch = selectedCategory === "all" || cardCategory === selectedCategory
      const difficultyMatch = selectedDifficulty === "all" || cardDifficulty === selectedDifficulty

      if (categoryMatch && difficultyMatch) {
        card.style.display = "block"
        card.classList.add("fade-in")
      } else {
        card.style.display = "none"
      }
    })
  }

  categoryFilter.addEventListener("change", filterCards)
  difficultyFilter.addEventListener("change", filterCards)
}
