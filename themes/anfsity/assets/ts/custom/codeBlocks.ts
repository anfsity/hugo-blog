export function initCodeBlockToggles(): void {
  const blocks = document.querySelectorAll<HTMLElement>(".highlight");
  const script = document.getElementById("custom-scripts");
  const moreIcon = script?.dataset.moreIconSrc;
  const lessIcon = script?.dataset.lessIconSrc;
  if (!moreIcon || !lessIcon) return;

  blocks.forEach((block) => {
    if (block.scrollHeight <= block.offsetHeight || block.querySelector(".code-more-box")) return;

    const box = document.createElement("div");
    box.className = "code-more-box";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-more-btn";
    button.setAttribute("aria-label", "Expand code block");

    const image = document.createElement("img");
    image.className = "code-more-img";
    image.src = moreIcon;
    image.alt = "";

    button.addEventListener("click", () => {
      const expanded = block.classList.toggle("code-show");
      image.src = expanded ? lessIcon : moreIcon;
      button.setAttribute("aria-label", expanded ? "Collapse code block" : "Expand code block");
      button.setAttribute("aria-expanded", String(expanded));
      window.dispatchEvent(new Event("resize"));
    });

    button.appendChild(image);
    box.appendChild(button);
    block.appendChild(box);
  });
}
