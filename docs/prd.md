# Now Directories – Product Requirements Document (PRD)

**Document Date:** 2025-03-25  
**Version:** 1.0

---

## 1. Purpose & Vision

### 1.1 Product Overview
Now Directories is a multi-tenant SaaS platform for location-based directories (e.g., NotaryFinderNow.com). Each directory:

- Uses a shared Next.js + Supabase codebase  
- Loads branding/config from JSON or Supabase  
- Enables providers to claim and edit their listings  
- Aims for easy replication to multiple verticals

### 1.2 Key Objectives
1. **Rapid Launch** of multiple niche directories  
2. **Scalable Architecture** (multi-tenant, config-driven)  
3. **Easy Claim & Edit Flow** for providers  
4. **Search & Discoverability** for end-users  
5. **Future Monetization** (featured listings, subscriptions)

### 1.3 Success Metrics
- Time to launch a new directory < 2 hours  
- 5 directories live within 3 months  
- Percentage of providers claiming their listing  
- Site reliability (uptime) & minimal support issues

---

## 2. Stakeholders
- **Product Owner/Founder**: Directs business strategy  
- **Designer**: Handles branding, theming, UX layout  
- **Technical Advisor**: (Optional) Provides code reviews, guidance  
- **End Users**:  
  - **Searcher**: Finds local services  
  - **Provider**: Claims & manages a listing

---

## 3. User Personas & Stories

### 3.1 Provider (P-series)
- **P001 – Provider Auth**: Sign up & log in  
- **P002 – Claim Profile**: Assert ownership of a listing  
- **P003 – Edit Profile**: Update claimed listing details

### 3.2 Searcher (S-series)
- **S001 – Search by Location**: City/ZIP or geolocation  
- **S003 – View Profile**: Detailed listing page

### 3.3 Admin / Platform (A-series)
- **A001 – Load Config**: Load branding/theme from JSON or Supabase  
- **A010 – Security Standards**: Enforce RLS & secure architecture

*(See individual story files in `/planr/stories/` for full acceptance criteria.)*

---

## 4. Scope & Features

### 4.1 Phase 1: Bootstrapping
- Next.js + Tailwind + TypeScript setup  
- Config load & theme application  
- Supabase RLS basics

### 4.2 Phase 2: Auth & Claim Flow
- Provider sign up & log in (P001)  
- Claim listing (P002)  
- Edit profile (P003)

### 4.3 Phase 3: Search & Discovery
- Location-based search (S001)  
- Profile pages w/ SEO (S003)

### 4.4 Phase 4: Go Live
- Deploy first directory (notary)  
- Full E2E test: search → claim → edit

---

## 5. Functional Requirements

1. **Multi-Tenant Config**  
2. **RLS Enforcement**  
3. **Auth**  
4. **Search & SEO**

---

## 6. Non-Functional Requirements

1. **Performance**: Quick page loads, up to 1k listings/directory  
2. **Security**: RLS, no exposed keys  
3. **Scalability**: Single codebase, multiple directories  
4. **Test Coverage**: ~80%+ on new features

---

## 7. User Flows (High-Level)

1. **Provider Flow**: Log in → Claim → Edit → Update listing  
2. **Searcher Flow**: Go to site → Search → View Profile → Contact

---

## 8. Timeline & Milestones

| Phase  | Features                       | Est. Completion |
|--------|--------------------------------|-----------------|
| Phase 1| Bootstrapping & Config         | Week 1-2        |
| Phase 2| Auth & Claim Flow              | Week 3-4        |
| Phase 3| Search & Discovery             | Week 5-6        |
| Phase 4| Launch MVP                     | Week 7-8        |

---

## 9. Open Questions
1. Payment flow integration (Stripe)  
2. Internationalization (ZIP/city for global markets?)  
3. Admin approval for claims vs. auto-approve

---

## 10. Approval
- **Product Owner**: TBD  
- **Designer**: TBD  
- **Tech Advisor**: TBD

---

**End of PRD**
