import "@testing-library/jest-dom/vitest";

class ResizeObserverMock implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = "0px";
  readonly thresholds = [];

  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
}

globalThis.ResizeObserver ??= ResizeObserverMock;
globalThis.IntersectionObserver ??= IntersectionObserverMock;

window.matchMedia ??= (query) => ({
  matches: query === "(min-width: 1024px)",
  media: query,
  onchange: null,
  addEventListener() {},
  removeEventListener() {},
  addListener() {},
  removeListener() {},
  dispatchEvent: () => false,
});

Object.defineProperty(Document.prototype, "getAnimations", {
  configurable: true,
  value: () => [],
});

Object.defineProperty(Element.prototype, "getAnimations", {
  configurable: true,
  value: () => [],
});

Object.defineProperty(Element.prototype, "animate", {
  configurable: true,
  value: () => ({ finished: Promise.resolve() }),
});
