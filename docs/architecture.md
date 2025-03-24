# Now Directories – Architecture Document

**Author:** (Your Name)  
**Date:** 2025-03-25  
**Version:** 1.0

---

## 1. Introduction
This document describes the multi-tenant architecture for Now Directories, using a single Next.js + Supabase codebase with theming and config-driven logic.

---

## 2. System Overview

- **Next.js Front-End**:
  - App Router + Tailwind
  - Dynamic routes by `directory_slug`
- **Supabase**:
  - Single project
  - Row-level security by `directory_slug`
  - Auth (Email/Password)
- **Config Files** (`/config/[slug].json`):
  - Fallback or optional override in Supabase `directories` table
- **Deployment**:
  - Multiple Vercel projects, each sets `NEXT_PUBLIC_DIRECTORY_SLUG`

---

## 3. Key Components

### 3.1 Next.js App
- **App Router** structure:
  - `/app/layout.tsx`
  - `/app/[slug]/page.tsx` (optional)
  - Theming via `<html className={themeName}>`

### 3.2 Supabase & RLS
- **profiles** table:
  - `id`, `directory_slug`, `owner_id`, etc.
- **Policy**:
  - Only `owner_id` can update or delete
  - Public can read if `directory_slug` matches
- **Auth**:
  - Providers sign up, claim listings

### 3.3 Config Loading
- **useDirectoryWithFallback.ts**:
  1. Check Supabase `directories` table
  2. If not found, load `/config/[slug].json`

### 3.4 Search & Profiles
- **Location-based search**:
  - Possibly store lat/long
  - Filter by `directory_slug`
- **Profile pages**:
  - Show listing info, claim button if unclaimed

---

## 4. Data Flow

1. **User visits** `NotaryFinderNow.com`
2. **Next.js** loads config (`slug = "notary"`)
3. **useDirectoryWithFallback** tries Supabase, falls back to JSON
4. **RLS** ensures data access restricted by `directory_slug`
5. **Users** can claim/edit (owner-only updates)

---

## 5. Deployment Model

- **One Codebase** in Git/GitHub
- **Multiple Vercel Projects** each has:
  - `NEXT_PUBLIC_DIRECTORY_SLUG="notary"` or similar
  - Custom domain attached (e.g., `NotaryFinderNow.com`)
- **Single Supabase** instance for all directories

---

## 6. Security & Compliance

- **Row-Level Security** on `profiles`
- **Auth** with Supabase tokens
- **Input Validation** for claim/edit flows
- **No secrets** exposed in front-end

---

## 7. Performance & Scalability

- **ISR** or SSR for profile pages
- **Indexes** on `directory_slug`, `owner_id`, `location`
- **Low overhead** to add new directories via config
- Future possibility of caching or read replicas

---

## 8. Implementation Phases
1. **Phase 1**: Bootstrapping
2. **Phase 2**: RLS & Security
3. **Phase 3**: Provider Auth & Claim
4. **Phase 4**: Search & Deploy
5. **(Post-MVP)**: Payment, Analytics, Builder UI

---

## 9. Open Questions
- Manual vs. auto claim approval
- Large-scale location search (geospatial indexing?)
- Stripe integration timeline

---

**End of Architecture Document**
