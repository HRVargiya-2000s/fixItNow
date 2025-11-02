// ========================================
// LOGIN FORM HANDLER
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  console.log("[v0] Login page loaded")

  const loginForm = document.getElementById("loginForm")
  if (!loginForm) {
    console.log("[v0] Login form not found")
    return
  }

  // Wait for auth to initialize
  if (window.unifiedAuth) {
    await window.unifiedAuth.waitForInit()
    console.log("[v0] Auth initialized on login page")
  }

  // Password toggle
  const togglePassword = document.getElementById("togglePassword")
  const passwordInput = document.getElementById("password")

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      const type = passwordInput.type === "password" ? "text" : "password"
      passwordInput.type = type
      togglePassword.querySelector("i").classList.toggle("fa-eye")
      togglePassword.querySelector("i").classList.toggle("fa-eye-slash")
    })
  }

  // Form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()
    console.log("[v0] Login form submitted")

    const email = document.getElementById("email").value.trim()
    const password = document.getElementById("password").value
    const loginBtn = loginForm.querySelector(".btn-submit")
    const loader = document.getElementById("loginLoader")

    // Clear previous errors
    document.getElementById("emailError").textContent = ""
    document.getElementById("passwordError").textContent = ""

    // Validate
    if (!email) {
      document.getElementById("emailError").textContent = "Email is required"
      return
    }

    if (!password) {
      document.getElementById("passwordError").textContent = "Password is required"
      return
    }

    // Show loading state
    loginBtn.disabled = true
    loader.style.display = "inline-block"

    try {
      console.log("[v0] Calling login with email:", email)
      const result = await window.unifiedAuth.login(email, password)

      if (result.success) {
        console.log("[v0] Login successful, redirecting to index...")
        // Redirect to home page
        setTimeout(() => {
          window.location.href = "../index.html"
        }, 500)
      } else {
        console.error("[v0] Login failed:", result.error)
        // Show error message
        if (result.code === "auth/user-not-found") {
          document.getElementById("emailError").textContent = "Email not found. Please sign up first."
        } else if (result.code === "auth/wrong-password") {
          document.getElementById("passwordError").textContent = "Incorrect password"
        } else if (result.code === "auth/invalid-email") {
          document.getElementById("emailError").textContent = "Invalid email address"
        } else {
          document.getElementById("emailError").textContent = result.error || "Login failed"
        }
      }
    } catch (error) {
      console.error("[v0] Login error:", error)
      document.getElementById("emailError").textContent = error.message || "An error occurred"
    } finally {
      loginBtn.disabled = false
      loader.style.display = "none"
    }
  })
})
