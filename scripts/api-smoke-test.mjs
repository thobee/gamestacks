const BASE = process.env.BASE_URL || "http://localhost:3000";

async function req(name, method, path, body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  try {
    const res = await fetch(`${BASE}${path}`, opts);
    const text = await res.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {}
    return {
      name,
      method,
      path,
      status: res.status,
      body: json ?? text.slice(0, 220),
    };
  } catch (e) {
    return { name, method, path, status: "ERR", body: String(e) };
  }
}

const results = [];

// Public games endpoints
results.push(await req("Games list", "GET", "/api/games?page=1&limit=5"));
results.push(await req("Featured games", "GET", "/api/games/featured?limit=3"));
results.push(await req("Categories", "GET", "/api/games/categories"));
results.push(await req("Games search", "GET", "/api/games/search?q=ea"));

// Use first published game id if available
let gameId = null;
const list = results[0];
if (list.status === 200 && list.body?.data?.length) {
  gameId = list.body.data[0].id;
}
if (gameId) {
  results.push(await req("Game by ID", "GET", `/api/games/${gameId}`));
}

// Auth endpoints
const unique = Date.now();
const email = `smoke${unique}@example.com`;
const password = "StrongPass123";
results.push(
  await req("Auth signup", "POST", "/api/auth/signup", {
    email,
    password,
    fullName: "Smoke Tester",
  }),
);
results.push(
  await req("Auth login", "POST", "/api/auth/login", {
    email,
    password,
  }),
);
results.push(await req("Auth logout", "POST", "/api/auth/logout"));

// Cart endpoint (needs userId + gameId)
const signup = results.find((r) => r.name === "Auth signup");
const userId = signup?.body?.user?.id;
if (userId && gameId) {
  results.push(
    await req("Cart add", "POST", "/api/cart/add", { userId, gameId }),
  );
} else {
  results.push({
    name: "Cart add",
    method: "POST",
    path: "/api/cart/add",
    status: "SKIP",
    body: "Missing userId or gameId",
  });
}

// Payment endpoints (expected behavior may vary)
if (gameId) {
  const init = await req(
    "Payment initialize",
    "POST",
    "/api/payments/initialize",
    {
      items: [{ gameId }],
      customerEmail: email,
      customerFullName: "Smoke Tester",
      customerWhatsapp: "+2348012345678",
      deliveryMethod: "digital",
    },
  );
  results.push(init);

  const ref = init?.body?.data?.reference;
  if (ref) {
    results.push(
      await req(
        "Payment verify",
        "GET",
        `/api/payments/verify?reference=${encodeURIComponent(ref)}`,
      ),
    );
  } else {
    results.push(
      await req(
        "Payment verify (bad ref)",
        "GET",
        "/api/payments/verify?reference=BAD_REF_TEST",
      ),
    );
  }
} else {
  results.push({
    name: "Payment initialize",
    method: "POST",
    path: "/api/payments/initialize",
    status: "SKIP",
    body: "Missing gameId",
  });
  results.push(
    await req(
      "Payment verify (bad ref)",
      "GET",
      "/api/payments/verify?reference=BAD_REF_TEST",
    ),
  );
}

results.push(
  await req("Payment webhook no signature", "POST", "/api/payments/webhook", {
    event: "charge.success",
    data: { reference: "TESTREF", metadata: { orderId: "x" } },
  }),
);

// Admin endpoints (likely 401 without admin cookie)
results.push(await req("Admin analytics", "GET", "/api/admin/analytics"));
results.push(
  await req("Admin games list", "GET", "/api/admin/games?page=1&limit=5"),
);
results.push(await req("Admin users list", "GET", "/api/admin/users"));
results.push(
  await req("Admin orders list", "GET", "/api/admin/orders?page=1&limit=5"),
);
results.push(
  await req("Admin game create", "POST", "/api/admin/games", {
    title: "Smoke Admin Game",
    description: "Created by smoke test",
    price_naira: 1000,
    category: "Action",
    is_published: false,
  }),
);
results.push(
  await req("Admin order patch", "PATCH", "/api/admin/orders", {
    orderId: "00000000-0000-0000-0000-000000000000",
    status: "completed",
  }),
);

console.log("=== API Smoke Test Results ===");
for (const r of results) {
  console.log(
    `${r.status}`.padEnd(5),
    `${r.method}`.padEnd(6),
    r.path.padEnd(40),
    "-",
    r.name,
  );
}

console.log("\n=== Sample Response Bodies (trimmed) ===");
for (const r of results) {
  if (typeof r.body === "string") {
    console.log(`\n[${r.name}]`, r.body.slice(0, 180));
  } else {
    console.log(`\n[${r.name}]`, JSON.stringify(r.body).slice(0, 260));
  }
}
