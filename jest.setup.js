import "@testing-library/jest-dom";

// Polyfill global fetch and Next.js request/response primitives for Jest environment
if (typeof global.Request === "undefined") {
  global.Request = globalThis.Request;
}
if (typeof global.Response === "undefined") {
  global.Response = globalThis.Response;
}
if (typeof global.Headers === "undefined") {
  global.Headers = globalThis.Headers;
}
if (typeof global.fetch === "undefined") {
  global.fetch = globalThis.fetch;
}
