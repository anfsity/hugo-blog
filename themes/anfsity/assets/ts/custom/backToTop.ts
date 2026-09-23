function updateBackToTop(): void {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const validHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = button.querySelector<HTMLElement>(".progress-num");

  if (progress && validHeight > 0) {
    const percent = Math.min(100, Math.max(0, Math.round((scrollTop / validHeight) * 100)));
    progress.textContent = percent + "%";
  }

  button.classList.toggle("show", scrollTop > 100);
}

let scrollListenerInstalled = false;

export function initBackToTop(): void {
  const button = document.getElementById("back-to-top");
  if (!button) return;

  button.onclick = (event) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!scrollListenerInstalled) {
    scrollListenerInstalled = true;
    window.addEventListener("scroll", updateBackToTop, { passive: true });
  }

  updateBackToTop();
}
