# Now Directories – Product Development Plan

**Document Date:** 2025-03-25  
**Version:** 1.0

---

## Overview

This **Product Development Plan** details the **phases** of building Now Directories from bootstrapping to a live MVP deployment. Each phase includes **numbered steps** for clarity and reference in your tasks or user stories.

---

## Phase 1: Bootstrapping & Config

**Goal:** Initialize the Next.js + Supabase project and implement config-driven theming.

1.1 **Initialize Project**  
- Create a new Next.js (App Router) project.  
- Add TypeScript and Tailwind CSS.  

1.2 **Add Config Files**  
- Place `/config/notary.json` (or additional JSON files as needed).  
- Include theme info, site title, and branding metadata.

1.3 **Implement `useDirectoryWithFallback`**  
- Function/hook to load config from Supabase, then fallback to local JSON.  
- Store in `lib/config/`.  

1.4 **Dynamic Theming**  
- Apply `<html className="{themeName}">` in `/app/layout.tsx` to load Tailwind theme.  

---

## Phase 2: Security Foundations

**Goal:** Set up a secure environment, focusing on row-level security (RLS) and basic Supabase architecture.

2.1 **Create `profiles` Table**  
- Fields: `id`, `directory_slug`, `owner_id` (nullable), plus listing data.  
- Ensure `directory_slug` is indexed.

2.2 **Enable RLS**  
- Turn on row-level security in Supabase for `profiles`.  
- Write policies so only listing owners can update their record, and only the correct `directory_slug` can be queried.

2.3 **Update Security Docs**  
- Document RLS policies and any relevant environment vars in `/docs/Security.md`.  
- Outline best practices (e.g., no secret keys in client code).

2.4 **Sanitize API Routes**  
- If using Next.js API routes or direct Supabase calls, validate/sanitize input.  
- Double-check that only `owner_id` can modify their row.

---

## Phase 3: Provider Auth & Claim Flow

**Goal:** Let providers sign up, claim their listing, and update it if they’re the owner.

3.1 **Provider Authentication**  
- Integrate Supabase Auth for email/password sign-up/login.  
- Basic UI for login and sign-up forms.

3.2 **Claim Profile**  
- “Claim this listing” button appears on unclaimed profiles.  
- Visibility limited to logged-in users only.  
- On click, set `owner_id` to the current user’s ID (or mark as pending if an approval flow is used).

3.3 **Edit Profile**  
- An edit form becomes accessible if `owner_id` = current user.  
- Prefill existing data; updates go to Supabase.  
- Confirmation or success message on save.

3.4 **Minimal Provider Dashboard**  
- “My Listings” page showing claimed profiles.  
- Optional account settings (change password, etc.).

---

## Phase 4: Search & Profile Viewing

**Goal:** Allow end users to search listings by location and view detailed profiles.

4.1 **Location-Based Search**  
- Input for city or ZIP code, optional geolocation button.  
- Query `profiles` table filtered by `directory_slug` and location.

4.2 **Search Results**  
- Display a list (or grid) of providers matching search criteria.  
- Implement pagination or “Load More” for large result sets.

4.3 **Profile Detail Page**  
- Show listing info: name, hours, contact info.  
- If unclaimed, show “Claim” button for logged-in providers.  
- Ensure RLS constraints apply (public can view, only owner can edit).

4.4 **SEO & Metadata**  
- Populate `<head>` with dynamic title and description.  
- Optional schema.org markup for local business listing.

---

## Phase 5: Deploy MVP Site

**Goal:** Launch the first production-ready directory (e.g., NotaryFinderNow.com) on Vercel.

5.1 **Set Environment Variables**  
- `NEXT_PUBLIC_DIRECTORY_SLUG="notary"` in Vercel project settings.  
- Supabase URL and anon/public keys (in `.env.production` or Vercel env vars).

5.2 **Seed Listings**  
- Bulk import from CSV or manual seeding for initial test listings.  
- Validate RLS with multiple entries.

5.3 **End-to-End Testing**  
- Verify the search → profile → claim → edit flow is working.  
- Confirm that non-owners cannot edit or claim the same profile.

5.4 **Go Live**  
- Map custom domain (e.g., `NotaryFinderNow.com`) to your Vercel project.  
- Conduct final QA check, then open for users.

---

## (Post-MVP) Platform Expansion

**Goal:** Enhance the directories into a fully automated platform.

- **Builder UI**: A graphical interface to create new directories, choose themes, set domain, etc.  
- **Stripe Integration**: Featured listings, subscription plans, or pay-per-lead.  
- **Analytics & Dashboards**: Track views, clicks, leads for each listing or directory.  
- **Multi-Language / Global**: If targeting international users, handle addresses and languages.  

---

## Summary of Phases & Steps

| **Phase** | **Steps**                                 | **Description**                                                            |
|-----------|-------------------------------------------|----------------------------------------------------------------------------|
| **1**     | 1.1 → 1.4                                 | Bootstrapping, config loading, theming                                     |
| **2**     | 2.1 → 2.4                                 | RLS security, table creation, input sanitization                           |
| **3**     | 3.1 → 3.4                                 | Auth, claim flow, edit profile, minimal provider dashboard                 |
| **4**     | 4.1 → 4.4                                 | Search, profile viewing, SEO metadata                                      |
| **5**     | 5.1 → 5.4                                 | Vercel deployment, seeding, final tests, domain mapping                    |
| *(Post-MVP)* | Builder UI, Payments, Analytics         | Future enhancements to automate directory creation & monetization          |

---

## How to Use This Document

1. **Reference** the phase and step numbers when creating tasks or user stories.  
2. **Check off** each step as you complete it to track progress.  
3. **Return** to this plan after MVP launch to prioritize Post-MVP features.  

---

**End of Document**
