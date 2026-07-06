# Gamestacks Design System

**Gamestacks** is a game discovery and monetization platform for Nigeria, inspired by GameHubNG's design. This document defines the visual language, components, and patterns.

## Color Palette

### Primary Colors

- **Gold/Yellow**: `#FDD835` — Buttons, accents, highlights (CTA)
- **Dark Background**: `#0A0E27` — Main background
- **Dark Surface**: `#1A1F3A` — Cards, panels, surfaces
- **Border**: `#2D3748` — Dividers, borders

### Semantic Colors

- **Success**: `#4CAF50` — Published status, online
- **Warning**: `#FF9800` — Draft status, caution
- **Danger**: `#F44336` — Error, delete
- **Info**: `#2196F3` — Information

### Text Colors

- **Primary Text**: `#FFFFFF` — Main text
- **Secondary Text**: `#B0B7C3` — Subtitles, metadata
- **Disabled Text**: `#666B77` — Disabled states

## Typography

### Font Family

- **Primary**: Inter or system fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif)
- **Monospace**: "Courier New", monospace (for codes, prices)

### Scale

- **Display**: 40px / 1.2 line-height (Hero headings)
- **Heading 1**: 32px / 1.3 line-height (Page titles)
- **Heading 2**: 24px / 1.3 line-height (Section titles)
- **Heading 3**: 20px / 1.4 line-height (Subsection titles)
- **Body Large**: 16px / 1.5 line-height (Regular text)
- **Body**: 14px / 1.5 line-height (Smaller text)
- **Label**: 12px / 1.4 line-height (Labels, tags)
- **Price**: 24px / 1.2 (Always monospace, bold, cyan color)

## Spacing

### Scale (8px base)

- **xs**: 4px
- **sm**: 8px
- **md**: 16px
- **lg**: 24px
- **xl**: 32px
- **2xl**: 48px
- **3xl**: 64px

## Component Library

### Buttons

#### Primary Button

- Background: `#00D4FF` (Cyan)
- Text: `#000000` (Black)
- Padding: 12px 24px
- Border Radius: 24px
- Font Weight: 600
- States:
  - Hover: Brightness 110%
  - Active: Brightness 95%
  - Disabled: Opacity 50%

Example: "BUY NOW", "PLACE ORDER", "SAVE GAME"

#### Secondary Button

- Background: Transparent
- Border: 1px solid `#00D4FF`
- Text: `#00D4FF`
- Padding: 12px 24px
- Border Radius: 24px
- States:
  - Hover: Background `#00D4FF`, Text black
  - Active: Darker border

#### Ghost Button

- Background: Transparent
- Border: None
- Text: `#FFFFFF` or `#00D4FF`
- Padding: 8px 16px
- States:
  - Hover: Opacity 80%

### Cards

#### Game Card

```
┌─────────────────┐
│   Image         │ 16px padding, border-radius 8px
├─────────────────┤
│ Title           │ Body Large, white
│ Price: ₦2,500   │ Price style, gold
│ [ADD TO CART]   │ Primary button
└─────────────────┘
```

- Background: `#1A1F3A`
- Border: 1px solid `#2D3748`
- Border Radius: 8px
- Padding: 16px
- Hover: Border color → `#00D4FF`

#### Status Badge

- **Published**: Green background, white text, 8px padding, border-radius 4px
- **Draft**: Orange background, white text
- **Offline Verified**: Gold badge with icon

### Input Fields

- Background: `#0A0E27`
- Border: 1px solid `#2D3748`
- Text Color: `#FFFFFF`
- Placeholder: `#666B77`
- Border Radius: 6px
- Padding: 12px 16px
- Focus: Border → `#00D4FF`, Box-shadow with cyan glow

Example Input:

```
┌─────────────────────────┐
│ Enter your full name    │
└─────────────────────────┘
```

### Badges & Tags

#### Category Badge

- Background: Semi-transparent cyan
- Text: `#00D4FF`
- Padding: 4px 8px
- Border Radius: 4px
- Font: Label (12px)

Examples: "Sports", "Action", "Strategy", "PC Offline"

#### Status Label

- **Published**: Green with checkmark
- **Draft**: Orange with pencil
- **Offline Verified**: Cyan with shield

### Navigation

#### Navbar

- Background: `#0A0E27`
- Height: 64px
- Items: 16px spacing
- Logo: GameHubNG or Gamestacks (20px)
- Search: Input field, cyan border on focus
- Cart Icon: Shows item count badge

Navigation Items:

- Store
- Genres
- Pre-orders
- New Releases
- Admin Panel (if logged in as admin)

### Modals & Dialogs

#### Checkout Modal

- Background: `#1A1F3A` with overlay
- Width: 90vw max 800px
- Padding: 32px
- Border Radius: 12px
- Border: 1px solid `#2D3748`

#### Form Section

- Title: Heading 3, white
- Fields: Input field style
- Spacing: 16px between fields
- Divider: 1px solid `#2D3748`

## Layout Patterns

### Homepage Hero

```
┌──────────────────────────────────┐
│                                  │
│  [IMAGE] Text Overlay            │
│  - Game Title (Display)          │
│  - Description (Body)            │
│  - Price (Price style)           │
│  - [BUY NOW] (Primary)           │
│                                  │
└──────────────────────────────────┘
```

### Grid Layouts

#### 4-Column Grid (Desktop)

- Gap: 16px
- Min-width per column: 240px

#### 2-Column Grid (Tablet)

- Gap: 16px

#### 1-Column Grid (Mobile)

- Gap: 12px

### Feature Section

```
┌─────────────────────────────────────┐
│ Feature Icon | Title | Description  │
├─────────────────────────────────────┤
│ 5 features side-by-side (desktop)   │
│ 2-3 stacked (mobile)                │
└─────────────────────────────────────┘
```

## Icons

### Style

- Solid, 24px default size
- Color: `#FFFFFF` or `#FDD835`
- Stroke Weight: 2px

### Common Icons

- Shopping Cart: Add to cart
- Download: Direct download
- Shield: Security, verified
- Star: Rating
- User: Profile
- Settings: Admin
- Menu: Navigation

## Responsive Design

### Breakpoints

- **Mobile**: 0px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

### Adjustments

- Font sizes: Reduce by 2-4px on mobile
- Spacing: Reduce by 50% on mobile
- Grid columns: 1 col mobile, 2 col tablet, 4+ col desktop
- Navigation: Hamburger menu on mobile

## Accessibility

- All interactive elements: Minimum 44x44px touch target
- Color contrast: WCAG AA (4.5:1 for text)
- Focus states: Visible outline or border color change
- Alt text: All images must have descriptive alt text
- Labels: All inputs must have associated labels

## Dark Mode (Default)

Gamestacks uses dark theme by default:

- Background: `#0A0E27`
- Surface: `#1A1F3A`
- Text: `#FFFFFF`
- Accents: `#FDD835` (Gold)

All components follow this dark theme.

## Component Examples

### Game Card (Minimal)

```tsx
<div className="game-card">
  <img src="game.jpg" alt="Game title" />
  <div className="card-content">
    <h3>Game Title</h3>
    <p className="price">₦2,500</p>
    <button className="btn-primary">Add to Cart</button>
  </div>
</div>
```

### Price Display

```tsx
<div className="price-display">
  <span className="original-price">₦5,000</span>
  <span className="price">₦2,500</span>
  <span className="badge-discount">50%</span>
</div>
```

### Status Badge

```tsx
<span className="badge badge-published">Published</span>
<span className="badge badge-draft">Draft</span>
```

## Animation & Transitions

- All transitions: `200ms ease-out`
- Hover states: Smooth brightness/opacity change
- Button click: Subtle scale effect (0.98x)
- Card hover: Border color transition, slight shadow increase

## Usage Guidelines

1. **Color**: Always use cyan `#00D4FF` for CTAs
2. **Typography**: Use 24px monospace for prices
3. **Spacing**: Maintain 16px padding on cards
4. **Icons**: Keep solid style, consistent size
5. **Dark Theme**: Never use light backgrounds
6. **Accessibility**: Ensure sufficient contrast
7. **Responsiveness**: Always test on mobile
