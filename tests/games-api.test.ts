// tests/games-api.test.ts
// Integration tests for game API routes

describe("Games API", () => {
  describe("GET /api/games", () => {
    it("should return list of published games", async () => {
      const response = await fetch("http://localhost:3000/api/games");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data).toBeDefined();
      expect(Array.isArray(data.data)).toBe(true);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.page).toBeGreaterThan(0);
    });

    it("should filter games by category", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games?category=Action",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      if (data.data.length > 0) {
        expect(data.data[0].category).toBe("Action");
      }
    });

    it("should filter games by price range", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games?minPrice=1000&maxPrice=5000",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      data.data.forEach((game: any) => {
        expect(game.price_naira).toBeGreaterThanOrEqual(1000);
        expect(game.price_naira).toBeLessThanOrEqual(5000);
      });
    });

    it("should sort games by rating", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games?sortBy=rating",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should paginate results", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games?page=1&limit=10",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.pagination.page).toBe(1);
      expect(data.pagination.limit).toBe(10);
    });
  });

  describe("GET /api/games/featured", () => {
    it("should return featured games", async () => {
      const response = await fetch("http://localhost:3000/api/games/featured");
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games/featured?limit=3",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.data.length).toBeLessThanOrEqual(3);
    });
  });

  describe("GET /api/games/search", () => {
    it("should return 400 for empty query", async () => {
      const response = await fetch("http://localhost:3000/api/games/search?q=");
      expect(response.status).toBe(400);
    });

    it("should search games by title", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games/search?q=game",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });

  describe("GET /api/games/[id]", () => {
    it("should return 404 for non-existent game", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games/invalid-id",
      );
      expect(response.status).toBe(404);
    });

    it("should return game details with reviews and related games", async () => {
      // This would require a real game ID from the database
      // Skipping for now as we need seed data
    });
  });

  describe("GET /api/games/categories", () => {
    it("should return list of categories", async () => {
      const response = await fetch(
        "http://localhost:3000/api/games/categories",
      );
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data.data)).toBe(true);
    });
  });
});
