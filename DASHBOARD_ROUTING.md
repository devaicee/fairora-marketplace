# Dashboard Routing Logic

## Overview
The Fairora marketplace now has intelligent dashboard routing that automatically directs users to the appropriate dashboard based on their role and creator status.

## Routing Rules

### 1. **Buyers** → `BuyerDashboard` (`/buyer-dashboard`)
- Users with no role (`role: undefined`)
- Users with `role: 'buyer'`
- **Features Available:**
  - Credit management (view balance, transfer credits)
  - Product browsing with search and filters
  - Referral program and earnings
  - Support center and issue reporting
  - Apply to become creator option

### 2. **Draft/Pending Creators** → `BuyerDashboard` (`/buyer-dashboard`)
- Users with `role: 'creator'` AND `creatorStatus: 'draft'`
- Users with `role: 'creator'` AND `creatorStatus: 'incomplete'`
- Users with `role: 'creator'` AND `creatorStatus: 'pending'`
- **Additional Features:**
  - Status alert showing creator application progress
  - "Creator Form" navigation item with status badge
  - Direct link to complete creator application
  - All buyer features remain available

### 3. **Approved Creators** → `ImprovedDashboard` (`/user-dashboard`)
- Users with `role: 'creator'` AND `creatorStatus: 'approved'`
- **Features Available:**
  - Full creator dashboard with product management
  - Sales analytics and creator tools
  - All buyer features plus creator-specific functionality

## Technical Implementation

### DashboardRouter Component
- **Location:** `src/components/DashboardRouter.jsx`
- **Purpose:** Automatically determines and redirects to correct dashboard
- **Used in:** Main `/dashboard` route

### User Profile Initialization
- **Location:** `src/utils/userSetup.js` 
- **Purpose:** Ensures all users have required buyer feature fields
- **Auto-initializes:**
  - Starting credits (100)
  - Referral code generation
  - Transaction/purchase history arrays
  - Referral tracking fields

### Route Configuration
```javascript
// Smart routing
/dashboard → DashboardRouter → redirects to appropriate dashboard

// Direct access (after redirect)
/buyer-dashboard → BuyerDashboard (buyers + draft/pending creators)
/user-dashboard → ImprovedDashboard (approved creators only)

// Additional buyer routes
/product/:productId → ProductDetail
/creator-application → CreatorApplication
```

## User Experience

### For New Buyers:
1. Sign up → Login → Navigate to `/dashboard`
2. DashboardRouter detects buyer role
3. Auto-redirect to `/buyer-dashboard`
4. Full buyer functionality available immediately

### For Draft/Pending Creators:
1. Login → Navigate to `/dashboard`
2. DashboardRouter detects creator with non-approved status
3. Auto-redirect to `/buyer-dashboard`
4. See status alert and "Complete Creator Form" prompts
5. Can use all buyer features while waiting for approval

### For Approved Creators:
1. Login → Navigate to `/dashboard`
2. DashboardRouter detects approved creator status
3. Auto-redirect to `/user-dashboard` 
4. Access full creator dashboard with selling capabilities

## Status Indicators

### Navigation Badges
- Draft/Incomplete: Red badge "Draft" or "Incomplete"
- Pending: Blue badge "Under Review"
- Approved: No badge (full access)

### Status Alerts
- Prominent alerts in overview section for non-approved creators
- Color-coded based on status (red, yellow, blue)
- Action buttons to complete application when needed

## Migration Path
1. **Existing Users:** Automatically get buyer features on next login
2. **New Signups:** Get buyer dashboard immediately
3. **Creator Applicants:** Stay in buyer dashboard until approved
4. **Approved Creators:** Seamlessly upgrade to full creator dashboard