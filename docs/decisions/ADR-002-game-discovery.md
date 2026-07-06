# ADR-002: Game Discovery & Marketplace Architecture

**Status:** Accepted  
**Date:** 2026-06-22  
**Author:** Gamestacks Team

## Context

Gamestacks Phase 2 implements the core marketplace functionality for game discovery and browsing. Users need to:

- Search and filter games efficiently
- Browse by category/genre
- View detailed game information
- Add games to cart for later purchase
- See personalized recommendations (featured games)

Performance and user experience are critical for a gaming marketplace where users may browse 100+ games.

## Decision

We implement a **client-side filtered marketplace with server-side search** using the following architecture:

### 1. Game Listing Strategy

**API Routes:**

- `GET /api/games` - List with server-side filtering and pagination
- `GET /api/games/featured` - Featured games for homepage
- `GET /api/games/[id]` - Game detail page with reviews
- `GET /api/games/search` - Full-text search
- `GET /api/games/categories` - Available categories

**Filtering:**

- Server-side: Category, price range, sorting
- Pagination: 20 games per page (4 pages = ~80 requests for full library)
- Sorting: rating (default), price, downloads, newest

**Performance:**

- Database indexes on: category, is_published, price_naira, rating
- Lazy loading with pagination (not infinite scroll for performance)
- Search debounced 300ms client-side

### 2. State Management

**Cart State:** Zustand with localStorage persistence

- Prevents duplicates
- Persists across browser sessions
- Lightweight (no backend queries needed)
- Format: `{ gameId, game object, addedAt timestamp }`

**Page State:** React hooks with URL params

- Category, price filters, sort, pagination in URL
- Shareable links (e.g., `/games?category=Action&sortBy=rating`)
- SSR-compatible

### 3. Component Architecture

```
HomePage
├── GameCarousel (Featured)
├── CategoryGrid
└── GameGrid (featured games)

GamesPage
├── GameFilters (sidebar)
├── GameGrid (filtered results)
└── Pagination

GameCard (reusable)
├── Image with hover effect
├── Badges (New, Featured, Discount)
├── Rating & price
└── Add to cart button

SearchBar (with debounce)
└── useSearchGames hook
```

### 4. Database Schema Usage

**Games Table Queries:**

```sql
-- List with filters
SELECT * FROM games
WHERE is_published = true
  AND category = ?
  AND price_naira BETWEEN ? AND ?
ORDER BY rating DESC
LIMIT 20 OFFSET ?;

-- Search
SELECT id, title, price_naira, cover_image_url, rating
FROM games
WHERE is_published = true
  AND title ILIKE '%query%'
LIMIT 10;

-- Categories
SELECT DISTINCT category FROM games
WHERE is_published = true;
```

### 5. Cart Implementation

**Client-Side Only (Phase 2):**

- Zustand store with localStorage
- Prevents duplicate adds
- Totals computed locally
- No server calls needed

**Future (Phase 3):**

- Persist to `cart_items` table
- Server-side validation at checkout
- Abandoned cart recovery

## API Specification

### GET /api/games

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| category | string | null | Filter by category |
| minPrice | number | 0 | Minimum price in Naira |
| maxPrice | number | 999999 | Maximum price in Naira |
| sortBy | string | "rating" | rating\|price\|downloads\|newest |
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Game Title",
      "priceNaira": 2500,
      "rating": 4.5,
      "category": "Action",
      ...
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### GET /api/games/[id]

**Response:**

```json
{
  "data": {
    ...game details...,
    "reviews": [
      {
        "userId": "uuid",
        "rating": 5,
        "content": "Amazing game!"
      }
    ],
    "relatedGames": [
      {...}
    ]
  }
}
```

### GET /api/games/search

**Query Parameters:**

- `q` (required, min 2 chars): Search query
- `limit` (default 10): Max results

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Game Title",
      "priceNaira": 2500,
      "rating": 4.5
    }
  ],
  "query": "search term"
}
```

## Alternatives Considered

1. **Infinite Scroll**
   - ❌ Harder to implement pagination with filters
   - ❌ Poor for large datasets (100+ items)
   - ✅ Better UX (no pagination clicks)

2. **Server-Side State (Session)**
   - ❌ Requires session storage
   - ❌ Less scalable
   - ✅ Better for analytics

3. **GraphQL**
   - ❌ Over-engineered for initial phase
   - ✅ Better long-term flexibility

## Consequences

### Positive

- ✅ Fast client-side filtering (instant UX)
- ✅ Lightweight state management (Zustand)
- ✅ No backend cart queries needed
- ✅ Shareable URLs with filters
- ✅ Search works offline (except results)
- ✅ Scales to 1000s of games

### Negative

- ⚠️ Large game datasets need optimization (Phase 2+ work)
- ⚠️ Search only works on title (full-text in Phase 3)
- ⚠️ No real-time inventory (acceptable for MVP)

## Testing Strategy

**Unit Tests:**

- ✅ formatNaira() for prices
- ✅ useCart() add/remove logic
- ✅ Cart store persistence

**Integration Tests:**

- ✅ GET /api/games with filters
- ✅ GET /api/games/search
- ✅ GET /api/games/[id]
- ✅ GET /api/games/categories

**E2E Tests:**

- ✅ User can search for games
- ✅ User can filter by category
- ✅ User can add/remove items
- ✅ Cart persists across page reload
- ✅ Sort changes game order

## Performance Targets

| Metric           | Target  | Current |
| ---------------- | ------- | ------- |
| Homepage load    | < 2.5s  | TBD     |
| Games list load  | < 1.5s  | TBD     |
| Search response  | < 300ms | TBD     |
| Add to cart      | < 50ms  | TBD     |
| Cart persistence | Instant | ✅      |

## Related Decisions

- **ADR-001:** Authentication Strategy (required for user context)
- **ADR-003:** Payment Integration (depends on cart)
- **ADR-004:** Inventory Management (future optimization)
- **ADR-005:** Search Optimization (Elasticsearch/PostgreSQL FTS)

## Revision History

| Date       | Version | Change                 |
| ---------- | ------- | ---------------------- |
| 2026-06-22 | 1.0     | Phase 2 implementation |
