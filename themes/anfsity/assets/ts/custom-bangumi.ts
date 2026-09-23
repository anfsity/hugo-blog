import { initBangumi } from "./bangumi/app";

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBangumi, { once: true });
} else {
  initBangumi();
}
