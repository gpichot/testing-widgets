import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Vitest runs without `globals`, so RTL's auto-cleanup is not registered.
// Unmount between tests to avoid duplicate ids leaking across renders.
afterEach(cleanup);
