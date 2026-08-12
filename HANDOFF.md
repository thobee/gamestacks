# Gamestacks Handoff Summary
> Continue from this file if switching models/agents.

## Brand / Design baseline (Kinetic Noir)
- Light storefront: `#111` black, white, `#FDD835` yellow accent, `#e5e5e5` borders
- Offset shadows: `4px 4px 0px rgba(0,0,0,0.04)`
- Typography: Hanken Grotesk, `font-black`, uppercase micro-labels
- Max width: `max-w-[1440px] mx-auto px-4 md:px-16`
- Homepage + games listing + game detail already use this language
- Do **not** revert to old dark GameHub purple/slate skins on storefront

## What was already completed (roadmap phases)

### Phase 1–2: Genre/category sync + filters
- Shared catalog: [`lib/catalog.ts`](lib/catalog.ts)
- Admin, games page filters, navbar all import from catalog
- `useGames` passes `genre` + `collection` to API
- Games page uses server-side genre (not client filter)
- Sort values aligned with API: `rating`, `newest`, `price`, `best-sellers`
- Shared [`Footer.tsx`](components/Footer.tsx) on games page (duplicate SiteFooter removed)

### Phase 3: Download gating
- Detail page shows Download only for `game` | `game-key` | `disc`
- Hidden for `console` | `gamepad` | `accessory`
- Helpers: `isDigitalItemType` / `isPhysicalOnlyItemType` in catalog

### Phase 4: UI unify (partial)
- Game detail restyled to Kinetic Noir
- Checkout restyled to Kinetic Noir
- Auth redirect fixed: `/auth/login` (not `/auth/signin`)
- Download + home-delivery modals upgraded visually
- Download modal is WhatsApp-only contact

### Phase 5: Payment + game-key fulfillment (done)
- Checkout auth gate (must sign in)
- Cart cleared **after** Paystack URL received
- Sale price used in cart total + checkout summary
- Home delivery shows address/city/state fields
- Payment verification persists game keys into `UserGame.licenseKey` for `game-key` items, marks them delivered, and includes the key in the order payload for the owner
- Key-delivery email via Resend (`lib/purchase-key-alerts.ts`) on successful fulfillment
- Protected **My Library** API + page for viewing stored keys later
- Payment success / order page prioritizes the key, copy action, and CTA to My Library
- **My Library** linked in `UserDashboardNav`

**Current purchase flow:**
1. User pays
2. Payment is verified
3. `game-key` items get a key stored on the user’s library entry
4. Key shown on success page (owner only)
5. Key available later in My Library
6. Email sent when key delivery is issued

**Key caveat:** keys are currently copied from `Game.downloadLink` for `game-key` items — not generated uniquely per purchase.

## Taxonomy source of truth
File: [`lib/catalog.ts`](lib/catalog.ts)

**Genres:** Action, Adventure, Fighting, Racing, Sports, Shooter, Simulation, First Person, Third Person, Arcade, Cars, Action RPG, Driving, Soccer, Role Playing, Offline Multiplayer, Horror, Stealth, Open World

**Categories:** PC Offline, PC Online, Game Keys Online, Consoles, Gamepads, Accessories, PlayStation, Xbox, Nintendo Switch, Other

**itemType:** game | console | gamepad | disc | game-key | accessory

## Key files
| Area | Path |
|------|------|
| Catalog | `lib/catalog.ts` |
| Homepage | `app/page.tsx` |
| Games library | `app/games/page.tsx` |
| Game detail | `app/games/[slug]/page.tsx` |
| Checkout | `app/checkout/page.tsx` |
| Order success | `app/orders/[id]/page.tsx` |
| My Library | `app/library/page.tsx` |
| Library API | `app/api/library/route.ts` |
| Payment verify | `app/api/payments/verify/route.ts` |
| Key email helper | `lib/purchase-key-alerts.ts` |
| Admin games | `app/admin/games/page.tsx` |
| Admin layout | `app/admin/layout.tsx` |
| User dashboard shell | `components/UserDashboardNav.tsx` |
| Navbar | `components/Navbar.tsx` |
| Games API | `app/api/games/route.ts` |
| Payments | `app/api/payments/*` |

## Design mockups provided by user (assets)
- Signup split-screen (black brand / white form)
- Login split-screen with gaming setup image
- Checkout: Payment Method + Billing Details + order summary
- Admin “Add New Product” modal (black header bar, monochrome)

## Remaining / next work
1. **Decide key model:** Should `licenseKey` be unique per purchase, or is reusing `Game.downloadLink` intentional? If per-order keys are required, add key inventory/assignment and update verify to pull from that pool instead of `downloadLink`.
2. Auth pages (`/auth/login`, `/auth/signup`) → match split-screen mockups (brand GAMESTACKS not GameHubNG)
3. Finish admin add-product modal to match mockup
4. Order page verify fallback (reference vs orderId) — confirm still needed after Phase 5

## Do not
- Edit the plan file itself
- Invent purple/indigo themes
- Mix genre into `?category=` (genres use `?genre=`)
