# UI Changes — Branch: `ui/teammate-feedback`

> Changes made based on teammate feedback. All modifications are UI/frontend only — no database, API, or backend logic was touched.

---

## 1. Landing Page Footer
**File:** `app/src/app/page.tsx`

**Before:** A single-line footer with just the logo and a support email.

**After:** Full 4-column professional footer with:
- **Brand column** — logo, tagline, and a framed content disclaimer box explaining that articles are sourced from third-party platforms
- **Product column** — Get started, Features, How it works, Email digests
- **Content Sources column** — Hacker News, Reddit, Dev.to, Custom RSS (with real external links)
- **Support column** — support email, GitHub, Terms of Service, Privacy Policy
- **Bottom bar** — copyright line + Terms / Privacy / Contact links
- Fully responsive: 4-col → 2-col (tablet) → 1-col (mobile)

---

## 2. Login Page — Logo Size Fix
**File:** `app/src/app/auth/page.tsx`

**Before:** Logo icon was 30×30px on desktop, 28×28px on mobile — too small.

**After:**
- Desktop left panel icon: `30×30` → `44×44`, name font `16px` → `18px`
- Mobile icon: `28×28` → `36×36`, name font `16px` → `17px`

---

## 3. Admin Panel
**File:** `app/src/components/AdminClient.tsx`

### Full-Width Layout
**Before:** Navbar, tabs bar, and page container all had `max-width: 1100px` and were center-aligned.

**After:** All three are now full-width with `32px` padding on each side — content fills the entire screen.

### Redirect to Dashboard on Login
Already working — the auth page redirects admin users to `/admin` which defaults to the `dashboard` tab on load. No change needed.

### New: Quick Actions Card
Added a Quick Actions card on the dashboard with 4 buttons:
- **Review Open Reports** — shows live count of open reports, clicks through to Reports tab
- **Manage Users** — shows total user count, clicks through to Users tab
- **Moderate Content** — clicks through to Content tab
- **Send Announcement** — clicks through to dashboard announcements section

### New: Content by Source Breakdown
Added a source breakdown panel in the Analytics section showing article counts per source (Reddit, HN, Dev.to, RSS) when data is available.

---

## 4. User Module — Footer & Disclaimer
**New File:** `app/src/components/UserFooter.tsx`

Created a reusable footer component added to all user-facing pages:
- Content disclaimer: clearly states that articles are aggregated from Reddit, Hacker News, Dev.to, and RSS feeds, and that Distilled does not own third-party content
- Copyright line
- Links to Terms of Service, Privacy Policy, and Support
- Works in both light and dark mode (uses CSS variables)

**Added to:**
- `app/src/components/FeedClient.tsx`
- `app/src/components/SavedClient.tsx`
- `app/src/components/HistoryClient.tsx`
- `app/src/components/ProfileClient.tsx`
- `app/src/components/PreferencesForm.tsx`

---

## 5. Full-Width Layout Fixes
**Before:** Most pages were center-aligned with a max-width cap, leaving large empty margins on wide screens.

**After:** All user-facing and admin pages now stretch to fill the full viewport width.

| File | What Changed |
|---|---|
| `app/src/components/NavBar.tsx` | Removed `max-width: 1200px`, padding `24px` → `32px` |
| `app/src/components/FeedClient.tsx` | Removed `max-width: 1200px` on feed container |
| `app/src/components/SavedClient.tsx` | Removed centering `max-width` |
| `app/src/components/HistoryClient.tsx` | Removed `max-width: 900px` |
| `app/src/components/ProfileClient.tsx` | Removed centering `max-width` |
| `app/src/components/PreferencesForm.tsx` | Changed `align-items: center` → `align-items: flex-start` |
| `app/src/components/AdminClient.tsx` | Navbar, tabs, and container all made full-width |

---

## 6. New Pages — Terms of Service & Privacy Policy
**New Files:**
- `app/src/app/terms/page.tsx` → accessible at `/terms`
- `app/src/app/privacy/page.tsx` → accessible at `/privacy`

Both pages are full-width (no centering) and include:
- Sticky branded navbar with back-to-home link
- Proper section headings and readable body text
- Footer bar with cross-links
- Responsive layout for mobile

### Terms of Service covers:
Acceptance of terms, description of service, third-party content disclaimer, user accounts, acceptable use, email digests & notifications, intellectual property, limitation of liability, termination, contact.

### Privacy Policy covers:
What data we collect, how it's used, data storage & security, third-party services (Resend, Groq, Google OAuth, Railway), your rights & controls (export, deletion, opt-out), cookies & sessions, children's privacy, policy changes, contact.

---

## Files Changed Summary

| File | Status |
|---|---|
| `app/src/app/page.tsx` | Modified |
| `app/src/app/auth/page.tsx` | Modified |
| `app/src/app/terms/page.tsx` | **New** |
| `app/src/app/privacy/page.tsx` | **New** |
| `app/src/components/AdminClient.tsx` | Modified |
| `app/src/components/NavBar.tsx` | Modified |
| `app/src/components/FeedClient.tsx` | Modified |
| `app/src/components/SavedClient.tsx` | Modified |
| `app/src/components/HistoryClient.tsx` | Modified |
| `app/src/components/ProfileClient.tsx` | Modified |
| `app/src/components/PreferencesForm.tsx` | Modified |
| `app/src/components/UserFooter.tsx` | **New** |

**No backend, API, database, or config files were modified.**
