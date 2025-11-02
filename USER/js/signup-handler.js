// ========================================
// SIGNUP FORM HANDLER
// ========================================

document.addEventListener("DOMContentLoaded", async () => {
  const signupForm = document.getElementById("signupForm")
  if (!signupForm) return

  // Wait for auth to initialize
  await window.unifiedAuth.waitForInit()

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

  const toggleConfirmPassword = document.getElementById("toggleConfirmPassword")
  const confirmPasswordInput = document.getElementById("confirmPassword")

  if (toggleConfirmPassword && confirmPasswordInput) {
    toggleConfirmPassword.addEventListener("click", () => {
      const type = confirmPasswordInput.type === "password" ? "text" : "password"
      confirmPasswordInput.type = type
      toggleConfirmPassword.querySelector("i").classList.toggle("fa-eye")
      toggleConfirmPassword.querySelector("i").classList.toggle("fa-eye-slash")
    })
  }

  // Form submission
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const fullName = document.getElementById("fullName").value.trim()
    const email = document.getElementById("email").value.trim()
    const phone = document.getElementById("phone").value.trim()
    const password = document.getElementById("password").value
    const confirmPassword = document.getElementById("confirmPassword").value
    const agreeTerms = document.getElementById("agreeTerms").checked
    const signupBtn = signupForm.querySelector(".btn-submit")
    const loader = document.getElementById("signupLoader")

    // Clear previous errors
    document.getElementById("nameError").textContent = ""
    document.getElementById("emailError").textContent = ""
    document.getElementById("phoneError").textContent = ""
    document.getElementById("passwordError").textContent = ""
    document.getElementById("confirmPasswordError").textContent = ""

    // Validate
    if (!fullName) {
      document.getElementById("nameError").textContent = "Full name is required"
      return
    }

    if (!email) {
      document.getElementById("emailError").textContent = "Email is required"
      return
    }

    if (!phone) {
      document.getElementById("phoneError").textContent = "Phone number is required"
      return
    }

    if (!password || password.length < 6) {
      document.getElementById("passwordError").textContent = "Password must be at least 6 characters"
      return
    }

    if (password !== confirmPassword) {
      document.getElementById("confirmPasswordError").textContent = "Passwords do not match"
      return
    }

    if (!agreeTerms) {
      alert("Please agree to the terms and conditions")
      return
    }

    // Show loading state
    signupBtn.disabled = true
    loader.style.display = "inline-block"

    try {
      console.log("[v0] Signing up user:", email)
      const result = await window.unifiedAuth.signup(email, password, fullName, phone)

      if (result.success) {
        console.log("[v0] Signup successful, redirecting...")
        // Redirect to home page
        window.location.href = "../index.html"
      } else {
        console.error("[v0] Signup failed:", result.error)
        // Show error message
        if (result.error.includes("email-already-in-use")) {
          document.getElementById("emailError").textContent = "Email already in use"
        } else if (result.error.includes("weak-password")) {
          document.getElementById("passwordError").textContent = "Password is too weak"
        } else {
          document.getElementById("emailError").textContent = result.error
        }
      }
    } catch (error) {
      console.error("[v0] Signup error:", error)
      document.getElementById("emailError").textContent = error.message
    } finally {
      signupBtn.disabled = false
      loader.style.display = "none"
    }
  })
})
