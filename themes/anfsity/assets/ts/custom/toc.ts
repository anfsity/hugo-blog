function updateOpenBranches(): void {
  const toc = document.getElementById("TableOfContents");
  if (!toc) return;

  toc.querySelectorAll(".open").forEach((list) => list.classList.remove("open"));

  const currentItem = toc.querySelector(".active-class");
  if (!currentItem) return;

  const childList = currentItem.children[1];
  if (childList?.matches("ul, ol")) childList.classList.add("open");

  let parent = currentItem.parentElement;
  while (parent && parent.closest("#TableOfContents")) {
    if (parent.matches("ul, ol")) parent.classList.add("open");
    parent = parent.parentElement?.parentElement ?? null;
  }
}

let scrollListenerInstalled = false;

export function initTableOfContents(): void {
  const toc = document.querySelector<HTMLElement>(".widget--toc");
  if (!toc) return;

  if (!scrollListenerInstalled) {
    scrollListenerInstalled = true;
    window.addEventListener("scroll", updateOpenBranches, { passive: true });
  }

  updateOpenBranches();
}
