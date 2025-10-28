# 👤 USER PORTAL - FixItNow

## 📁 Folder Contents

This folder contains the **complete USER portal** implementation for the FixItNow platform.

---

## 🗂️ Structure

```
USER/
├── index.html                              # Home page (protected)
├── google-auth-setup.html                  # Google OAuth setup guide
├── AUTHENTICATION_PROTECTION_COMPLETE.md   # Authentication documentation
├── README.md                               # This file
├── css/                                    # Stylesheets
│   ├── style.css                          # Main styles with dark mode
│   ├── auth.css                           # Login/Signup styles
│   ├── auth-guard.css                     # Authentication protection styles
│   ├── forms.css                          # Report Issue form styles
│   ├── quick-guides.css                   # Quick Guides page styles
│   ├── my-issues.css                      # My Issues page styles
│   └── workers.css                        # Find Workers page styles
├── js/                                     # JavaScript files
│   ├── main.js                            # Main app logic
│   ├── auth.js                            # Authentication logic
│   ├── auth-guard.js                      # Page protection middleware
│   ├── config.js                          # App configuration
│   ├── quick-guides.js                    # Quick Guides functionality
│   ├── report-issue.js                    # Report Issue form logic
│   └── find-workers.js                    # Find Workers functionality
├── images/                                 # Assets
│   ├── logo.svg                           # App logo
│   └── favicon.svg                        # Browser favicon
└── pages/                                  # App pages
    ├── login.html                         # Login page (public)
    ├── signup.html                        # Sign up page (public)
    ├── quick-guides.html                  # Quick DIY guides (protected)
    ├── report-issue.html                  # Report repair issue (protected)
    ├── find-workers.html                  # Find freelance workers (protected)
    ├── my-issues.html                     # Track user's issues (protected)
    ├── quick-guides-old-backup.html       # Backup file
    └── my-issues-old-backup.html          # Backup file
```

---

## ✨ Features Implemented

### 🔐 **Authentication System**
- ✅ Login & Signup functionality
- ✅ Google OAuth integration ready
- ✅ Session management with localStorage/sessionStorage
- ✅ "Remember Me" functionality
- ✅ Page protection middleware
- ✅ Auto-redirect to login for unauthenticated users
- ✅ Smart redirect back to intended page after login
- ✅ 24-hour session timeout
- ✅ User avatar and dropdown menu
- ✅ Logout functionality

### 📚 **Quick Guides**
- ✅ 28 real DIY repair resources
- ✅ 14 YouTube video tutorials with auto-fetched thumbnails
- ✅ 7 articles from trusted sources
- ✅ 4 helpful websites
- ✅ 3 step-by-step tutorials
- ✅ Filter by category, type, and difficulty
- ✅ Real-time search
- ✅ Video modal player
- ✅ Beautiful card design with animations

### 📝 **Report Issue**
- ✅ 4-step issue submission form
- ✅ GPS auto-fill location
- ✅ Auto-expanding textarea
- ✅ Category selection (Plumbing, Electrical, etc.)
- ✅ Urgency levels
- ✅ Photo upload support
- ✅ Contact preferences
- ✅ Form validation
- ✅ Save to localStorage

### 👷 **Find Workers**
- ✅ Browse freelance workers by category
- ✅ Filter by expertise, rating, location
- ✅ Worker cards with ratings and reviews
- ✅ Contact worker functionality
- ✅ View worker details
- ✅ Search by name/specialty

### 📋 **My Issues**
- ✅ Track all reported issues
- ✅ Status tracking (Pending, In Progress, Completed)
- ✅ View issue details
- ✅ Cancel issue functionality
- ✅ Statistics dashboard
- ✅ Filter by status

### 🎨 **UI/UX**
- ✅ Modern, clean design
- ✅ Dark mode support
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Smooth animations and transitions
- ✅ Glassmorphism navbar
- ✅ Gradient buttons and accents
- ✅ Professional color scheme
- ✅ Font Awesome icons

---

## 🚀 How to Run

### **Option 1: Python Server (Recommended)**
```bash
cd "d:\Design Engineering\DE-IIA (fixItNow)\Implementation\USER"
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### **Option 2: VS Code Live Server**
1. Right-click on `index.html`
2. Select "Open with Live Server"

---

## 🧪 Testing

### **Test Authentication:**
1. Visit `http://localhost:8000`
2. Should redirect to login page
3. Login with any email/password (6+ characters)
4. Should redirect back to home page
5. Click user avatar → See dropdown menu
6. Click "Logout" → Redirect to login

### **Test Quick Guides:**
1. Login to the app
2. Navigate to Quick Guides
3. Filter by category (e.g., Plumbing)
4. Click "Watch Now" on a video card
5. Video modal should open

### **Test Report Issue:**
1. Login to the app
2. Navigate to Report Issue
3. Fill out the 4-step form
4. Submit and check "My Issues" page

### **Test Dark Mode:**
1. Click moon icon in navbar
2. Theme switches to dark mode
3. All text should be visible
4. Click sun icon to switch back

---

## 📊 Key Statistics

- **Total Files**: 23+ files
- **Total Lines of Code**: ~3,500+ lines
- **CSS Files**: 7
- **JavaScript Files**: 7
- **HTML Pages**: 9
- **Features**: 25+
- **Resources in Quick Guides**: 28

---

## 🎯 User Flow

```
Visitor → Login/Signup → Home Page → Choose Action:
    ├── Report Issue → Fill Form → Submit → My Issues
    ├── Find Workers → Browse → Contact Worker
    ├── Quick Guides → Watch Videos/Read Articles
    ├── My Issues → Track Status → View Details
    └── Logout → Back to Login
```

---

## 🔒 Security Notes

**Current Implementation:**
- Client-side authentication using localStorage
- Good for: Demos, prototypes, learning
- Not suitable for: Production with sensitive data

**For Production:**
- Implement server-side authentication (JWT, OAuth)
- Use HTTPS
- Add CSRF protection
- Implement rate limiting
- Use secure password hashing
- Add two-factor authentication

---

## 📝 Documentation

See `AUTHENTICATION_PROTECTION_COMPLETE.md` for detailed authentication documentation.

---

## ✅ Status

**FULLY FUNCTIONAL AND READY TO USE!** 🎉

All features are implemented and tested. The USER portal is complete and ready for demonstration.

---

## 👨‍💻 Development Notes

- Built with vanilla JavaScript (no frameworks)
- Uses CSS custom properties for theming
- LocalStorage for data persistence
- Responsive design with mobile-first approach
- Modular code structure
- Clean, commented code

---

**Created**: October 2025  
**Project**: Design Engineering - IIA  
**Platform**: FixItNow - DIY Repair Guide  
**Portal**: User Portal
