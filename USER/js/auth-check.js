// auth-check.js
// Enforce authentication on USER pages. If not authenticated, redirect to the login page.
(function () {
  // Pages that should NOT be protected (login/signup and static assets)
  const publicFiles = ['login.html', 'signup.html']

  const pathname = window.location.pathname || ''
  const currentFile = pathname.substring(pathname.lastIndexOf('/') + 1)

  // If this is a public page, do nothing
  if (!currentFile || publicFiles.includes(currentFile)) return

  function redirectToLogin() {
    // Choose relative path so redirection works from both root and pages/ folders
    const target = pathname.includes('/pages/') ? 'login.html' : 'pages/login.html'
    window.location.replace(target)
  }

  // If unifiedAuth is available, wait for it and check auth
  async function checkAuth() {
    try {
      if (window.unifiedAuth) {
        // Wait for unifiedAuth to initialize (if it exposes waitForInit)
        if (typeof window.unifiedAuth.waitForInit === 'function') {
          await window.unifiedAuth.waitForInit()
        }

        const isAuth = typeof window.unifiedAuth.isAuthenticated === 'function'
          ? window.unifiedAuth.isAuthenticated()
          : !!window.unifiedAuth.getUser && !!window.unifiedAuth.getUser()

        if (!isAuth) {
          redirectToLogin()
        }
      } else {
        // If unifiedAuth isn't present yet, poll for a short time before redirecting
        const start = Date.now()
        const timeout = 3000 // ms

        while (Date.now() - start < timeout) {
          if (window.unifiedAuth) return checkAuth()
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => setTimeout(r, 200))
        }

        // Fallback: no auth system found => require login
        redirectToLogin()
      }
    } catch (e) {
      // On any error, redirect to login to be safe
      console.error('Auth check error:', e)
      redirectToLogin()
    }
  }

  // Run check as early as practical
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth)
  } else {
    checkAuth()
  }
})()
