# Gamestacks UI Reference

Based on GameHubNG design system and screenshots. All components follow the DESIGN.md specifications.

## Pages Overview

### 1. Homepage (`/`)

**Purpose**: Game discovery and featured game showcase

**Key Sections**:

- **Navigation Bar** (64px height)
  - Logo: "Gamestacks"
  - Nav items: Store, Genres, Pre-orders, New Releases
  - Search bar (right-aligned)
  - Cart icon with count badge
  - User profile/settings icon

- **Hero Section**
  - Full-width image carousel (featured games)
  - Text overlay: "TRENDING NOW" label
  - Game title (Display style)
  - Description (Body text)
  - Price display (gold, large)
  - "BUY NOW" primary button
  - Pagination dots for carousel

- **Most Purchased Section**
  - Section title: "Most Purchased"
  - Subtitle: "The current bestsellers in the Nigerian gaming community"
  - Category filter tabs: All, Sports, Action, RPG, Racing
  - 4-column game card grid
  - Hover state: Card border → gold, slight shadow

- **Game Cards** (Reusable component)
  - Game thumbnail image
  - Category badge (top-left)
  - Game title
  - Price in Naira (gold, bold)
  - Add to cart button (icon button)
  - Hover: Border color change to gold

- **Shop by Category Section**
  - 3-4 category cards
  - Icons for each category
  - Category name and description
  - "PC Offline", "PlayStation", "Gamepads", etc.

- **Mobile App Promotion Section**
  - Heading: "Gamestacks in Your Pocket"
  - Description text
  - App store download buttons
  - Phone mockup image (right side)

- **Footer**
  - Logo (left)
  - Quick Links column (Support, Terms of Service, etc.)
  - Policies column (Privacy Policy, Refund Policy)
  - Resources column
  - Copyright text

### 2. Game Detail Page (`/games/[id]`)

**Purpose**: View full game information and purchase

**Key Elements**:

- **Back Navigation**: "← Back to store" link
- **Status Label**: Badge (e.g., "PC OFFLINE")
- **Game Header**
  - Large game title (Heading 1)
  - Description text
  - Rating display (stars, count)
  - Download count, file size, genre

- **Price Section**
  - Original price (strikethrough)
  - Current price (gold, large, 24px)
  - Discount percentage badge
  - Action buttons:
    - "Add to Cart" (primary)
    - "Buy Now" (secondary)

- **What You Get Section**
  - Feature list with checkmarks
  - "Official/verified game access"
  - "Fast direct download links"
  - "Installation guide included"
  - etc.

- **Technical Specs Section**
  - CPU, RAM, GPU requirements
  - Storage space needed
  - Displayed in grid layout

- **Related Titles Section**
  - "Related Titles" heading with "View All" link
  - 4-column horizontal scroll
  - Same game card style as homepage

### 3. PC Offline Library (`/library/offline`)

**Purpose**: Browse offline games

**Key Elements**:

- **Status Label**: "OFFLINE VERIFIED"
- **Page Title**: "PC Offline"
- **Description**: "Official PC games for direct download and lifetime access..."

- **Filters Sidebar** (Left, sticky)
  - "Required VRAM" filter
  - "Storage Space" filter
  - "Category" filter
  - "Reset" button

- **Main Content**
  - Game count display: "Showing 128 Offline Games"
  - Sort dropdown: "Newest Releases"
  - 3-column game card grid
  - Pagination at bottom

- **Game Cards** with badges:
  - "PC OFFLINE" badge (green)
  - Game image
  - Title, category, price
  - Cart icon

### 4. Secure Checkout Page (`/checkout`)

**Purpose**: Complete purchase

**Layout**: Two-column (Left: Form, Right: Order Summary)

**Left Column - Customer Information**:

- Section title: "Customer Information"
- Form fields:
  - Full Name (input)
  - Email Address (input)
  - WhatsApp Number (input with country code)

**Left Column - Delivery Selection**:

- Section title: "Delivery Selection"
- Two options (radio buttons):
  - **Digital Instant**: "Delivered via Email/WhatsApp/Discord"
  - **Home Delivery**: "Physical copy (2-3 business days)"
- Selected option highlighted with gold border

**Left Column - Payment Method**:

- Section title: "Payment Method"
- Options (radio buttons):
  - **Paystack** (selected by default, gold border)
    - "Cards, USSD, Bank Transfer"
  - **Flutterwave**
    - "Global payment gateway"
  - **Bank Transfer**
    - "Manual confirmation required"

**Right Column - Order Summary**:

- **Product Card**:
  - Thumbnail image
  - Title: "Football Pro 26 PC"
  - Status badge: "IN STOCK"
  - Price: "$7.28" (large, gold)

- **Order Breakdown**:
  - Subtotal: "$7.28"
  - Transaction Fee: "$0.00"
  - Total: "$7.28" (gold, large)

- **CTA Button**:
  - "PLACE ORDER →" (primary button, full-width)

- **Trust Badges**:
  - "VERIFIED" with shield icon
  - "24/7 CARE" with support icon

### 5. Admin Panel (`/admin`)

**Purpose**: Manage games and inventory

**Navigation**: Same navbar with "Admin Panel" tab

**Main Layout**:

- **Left Section - Add New Game Form**:
  - Section title: "Add New Game"
  - Form inputs:
    - Game Title (text input)
    - Price (₦) (number input)
    - Category (dropdown)
    - Download Link (URL input)
  - "Save Game" button (primary, gold)

- **Right Section - Game Inventory Table**:
  - Section title: "Game Inventory"
  - Filter icon (top-right)
  - Column headers: Game Title, Price, Category, Status, Actions
  - Table rows with game data
  - Status badges (PUBLISHED green, DRAFT orange)
  - Edit action (pencil icon)
  - Pagination: "Showing 3 of 124 games"
  - Previous/Next buttons

- **Bottom - Dashboard Stats**:
  - 3 stat cards in row:
    - **Daily Revenue**: "₦245,000" (gold accent)
    - **Orders Today**: "42" (green accent)
    - **New Users**: "18" (purple accent)
  - Each card has icon + title + number

## Component Breakdown

### Navigation Bar

```html
<nav class="navbar">
  <div class="logo">Gamestacks</div>
  <div class="nav-items">
    <a href="/store">Store</a>
    <a href="/genres">Genres</a>
    <a href="/preorders">Pre-orders</a>
    <a href="/new">New Releases</a>
  </div>
  <div class="nav-actions">
    <input type="search" placeholder="Search games..." class="search-input" />
    <button class="icon-btn" aria-label="Cart">
      🛒 <span class="badge">0</span>
    </button>
    <button class="icon-btn" aria-label="Settings">⚙️</button>
  </div>
</nav>
```

### Game Card (Reusable)

```html
<div class="game-card">
  <div class="card-image">
    <img src="game.jpg" alt="Game title" />
    <span class="badge badge-category">Sports</span>
  </div>
  <div class="card-content">
    <h3>Game Title</h3>
    <div class="price-section">
      <span class="price">₦2,500</span>
      <button class="btn-icon" aria-label="Add to cart">🛒</button>
    </div>
  </div>
</div>
```

### Price Display

```html
<div class="price-display">
  <span class="original-price">₦5,000</span>
  <span class="current-price">₦2,500</span>
  <span class="discount-badge">50%</span>
</div>
```

### Form Input

```html
<div class="form-group">
  <label for="fullname">FULL NAME</label>
  <input
    type="text"
    id="fullname"
    placeholder="Enter your full name"
    class="form-input"
  />
</div>
```

### Status Badge

```html
<span class="badge badge-published">PUBLISHED</span>
<span class="badge badge-draft">DRAFT</span>
<span class="badge badge-offline">PC OFFLINE</span>
```

## Design Tokens (CSS Variables)

```css
/* Colors */
--color-primary: #fdd835;
--color-background: #0a0e27;
--color-surface: #1a1f3a;
--color-border: #2d3748;
--color-text: #ffffff;
--color-text-secondary: #b0b7c3;
--color-success: #4caf50;
--color-warning: #ff9800;
--color-danger: #f44336;

/* Spacing */
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;

/* Typography */
--font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-family-mono: "Courier New", monospace;
--font-size-display: 40px;
--font-size-h1: 32px;
--font-size-h2: 24px;
--font-size-body: 16px;
--font-size-small: 14px;
--font-size-label: 12px;

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.3);
--shadow-md: 0 4px 16px rgba(0, 0, 0, 0.4);
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);

/* Border Radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-full: 24px;

/* Transitions */
--transition-fast: 150ms ease-out;
--transition-normal: 200ms ease-out;
--transition-slow: 300ms ease-out;
```

## Screenshots Reference

See attached images for:

- Homepage with hero and game cards
- Admin panel with game management
- Checkout page with payment options
- Game detail page
- Offline games library
