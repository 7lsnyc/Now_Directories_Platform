# Now Directories – UX Sitemap

**Date:** 2025-03-25  
**Version:** 1.0

---

## 1. Overview
Each directory (e.g., NotaryFinderNow) shares the same general structure:
- Homepage
- Search
- Profile Pages
- Provider Authentication & Dashboard

---

## 2. Sitemap Structure

### 2.1 Directory Homepage
- Introduction to the directory (hero banner, search bar)
- CTA: “Search by City/ZIP”

### 2.2 Search
- Search field for city, ZIP, or geolocation
- Displays results in a list or grid
- Links to individual profile pages

### 2.3 Profile Pages
- Public view of listing details (name, hours, contact info)
- “Claim this listing” button if unclaimed (shown if user is logged in)

### 2.4 Provider Flow
- **Sign Up / Log In**: Email & Password
- **Claim Listing**:
  - If logged in, user can claim listing → sets `owner_id`
- **Edit Profile**:
  - Only owner can edit → opens a form or page
  - Save changes to Supabase

### 2.5 Provider Dashboard / My Account
- List of claimed listings
- Edit profile forms
- Account settings (change password, etc.)

### 2.6 Post-MVP & Platform-Level
- **Featured Listings** / Payment flow
- **Analytics** (views, clicks)
- **Admin Tools** (new directory creation, builder UI)

---

## 3. Visual Outline (Text Tree)

