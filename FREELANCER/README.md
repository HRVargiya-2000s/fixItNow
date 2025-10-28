# 👷 FREELANCER PORTAL - FixItNow Worker

## 📁 Overview

This is the **FREELANCER/WORKER portal** for FixItNow platform. Workers can view job requests from customers, accept jobs, track ongoing work, and manage their availability.

---

## ✨ Features Implemented

### 🏠 **Home Page**
- ✅ Quick stats dashboard (New Requests, Ongoing Jobs, Completed Jobs, Rating)
- ✅ Online/Offline status toggle
- ✅ Recent job requests preview
- ✅ Quick action cards
- ✅ Tips for success section

### 📬 **Job Requests Page**
- ✅ View all job requests from customers
- ✅ Filter by status (new, accepted)
- ✅ Filter by category (plumbing, electrical, vehicle, etc.)
- ✅ Filter by urgency (high, medium, low)
- ✅ Search by location or description
- ✅ Accept/Decline job requests
- ✅ Real-time notifications

### 🔧 **Ongoing Jobs Page**
- ✅ Track accepted jobs
- ✅ Start working on jobs
- ✅ Mark jobs as complete
- ✅ Contact customer directly
- ✅ View job details and customer info

### 🎨 **UI/UX Features**
- ✅ Modern, clean design (inspired by USER portal)
- ✅ Dark mode support
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Status badges (new, accepted, in-progress, completed)
- ✅ Urgency indicators (high, medium, low)
- ✅ Online/offline status toggle

---

## 🗂️ File Structure

```
FREELANCER/
├── index.html                      # Home page with stats
├── css/
│   ├── style.css                  # Base styles (from USER)
│   └── worker.css                 # Worker-specific styles
├── js/
│   ├── main.js                    # Main app logic (from USER)
│   ├── dashboard.js               # Homepage stats and features
│   ├── job-requests.js            # Job requests management
│   └── ongoing-jobs.js            # Ongoing jobs tracking
├── images/
│   ├── logo.svg                   # App logo
│   └── favicon.svg                # Browser favicon
└── pages/
    ├── job-requests.html          # View and respond to requests
    ├── ongoing-jobs.html          # Track active jobs
    ├── completed-jobs.html        # (To be created)
    └── profile.html               # (To be created)
```

---

## 🚀 How It Works

### **Worker Flow:**

```
Worker Dashboard
    ↓
1. Toggle Online Status → Become available for jobs
    ↓
2. View Job Requests → See requests from customers
    ↓
3. Accept Job → Job moves to Ongoing Jobs
    ↓
4. Start Working → Update status to "In Progress"
    ↓
5. Complete Job → Mark as completed
    ↓
6. Job moves to Completed Jobs
```

### **Job Request System:**

**From Customer (USER portal):**
- Customer submits issue via Report Issue page
- Issue details stored in localStorage

**From Worker (FREELANCER portal):**
- Worker sees request in Job Requests page
- Worker can accept or decline
- Accepted jobs appear in Ongoing Jobs
- Worker can start, track, and complete jobs

---

## 📊 Sample Data

The portal comes with 6 sample job requests:
1. **Leaking Kitchen Faucet** - Plumbing, High urgency
2. **Replace Light Fixtures** - Electrical, Medium urgency
3. **Car Oil Change** - Vehicle, Low urgency
4. **Fix Broken Cabinet Door** - Furniture, Medium urgency
5. **Refrigerator Not Cooling** - Appliance, High urgency
6. **AC Not Working** - HVAC, High urgency

---

## 🎯 Key Features

### **Online/Offline Toggle:**
- Green = Online (receiving requests)
- Red = Offline (not receiving requests)
- Status persists in localStorage
- Shows pulsing indicator

### **Job Filtering:**
- **Status:** All, New, Accepted
- **Category:** All categories or specific (plumbing, electrical, etc.)
- **Urgency:** All, High, Medium, Low
- **Search:** By location or description

### **Job Actions:**
- **Accept:** Move job to ongoing jobs
- **Decline:** Remove from worker's view
- **Start Working:** Update status to in-progress
- **Complete:** Mark job as done
- **Contact Customer:** Call customer directly

---

## 🎨 Design Highlights

### **Color Coding:**
- **High Urgency:** Red background
- **Medium Urgency:** Orange/yellow background
- **Low Urgency:** Green background
- **Accepted:** Blue status badge
- **In Progress:** Purple status badge
- **Completed:** Green status badge

### **Responsive Design:**
- Desktop: 3-4 cards per row
- Tablet: 2 cards per row
- Mobile: 1 card per row
- Collapsible navigation on mobile

---

## 💻 How to Run

### **Start Server:**
```bash
cd "d:\Design Engineering\DE-IIA (fixItNow)\Implementation\FREELANCER"
python -m http.server 8001
```

### **Access:**
Open browser: `http://localhost:8001`

---

## 🧪 Testing

### **Test Job Requests:**
1. Open FREELANCER portal
2. Click "Job Requests"
3. See 5 new requests
4. Filter by category/urgency
5. Click "Accept" on a job
6. Job moves to Ongoing Jobs

### **Test Ongoing Jobs:**
1. Accept a job from Job Requests
2. Go to "Ongoing Jobs"
3. Click "Start Working"
4. Status changes to "In Progress"
5. Click "Mark as Complete"
6. Job moves to Completed Jobs

### **Test Online Status:**
1. Click offline/online toggle
2. See notification
3. Status persists on page refresh

---

## 🔄 Data Flow Between Portals

### **USER → FREELANCER:**
- User submits issue in USER portal
- Issue saved to localStorage as `reportedIssues`
- FREELANCER portal reads from `jobRequests` (same data)
- Worker sees request in Job Requests

### **FREELANCER → USER:**
- Worker accepts job
- Status updated in localStorage
- USER can see job status in "My Issues"
- Worker completes job
- USER notified of completion

---

## 📝 Next Steps (Optional)

- [ ] Add Completed Jobs page
- [ ] Add Worker Profile page
- [ ] Add Authentication (login/signup)
- [ ] Add Earnings/Payment tracking
- [ ] Add Customer reviews and ratings
- [ ] Add Photo upload for progress updates
- [ ] Add Real-time notifications
- [ ] Add Chat/messaging with customers

---

## ✅ Current Status

**FULLY FUNCTIONAL!** 🎉

The FREELANCER portal is ready for demonstration with:
- ✅ Homepage with stats
- ✅ Job Requests page
- ✅ Ongoing Jobs page
- ✅ Accept/Decline functionality
- ✅ Start/Complete functionality
- ✅ Online/Offline status
- ✅ Filtering and search
- ✅ Dark mode support
- ✅ Responsive design

---

## 🌐 Ports

- **USER Portal:** `http://localhost:8000`
- **FREELANCER Portal:** `http://localhost:8001`

---

**Created:** October 9, 2025  
**Project:** Design Engineering - IIA  
**Platform:** FixItNow Worker Portal
