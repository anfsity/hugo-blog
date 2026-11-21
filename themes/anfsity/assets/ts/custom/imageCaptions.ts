/**
 * Wraps standalone captioned images (with data-caption) into <figure> + <figcaption>
 * so static and external images display visible captions without interfering with lightbox.
 */
export function initImageCaptions(): void {
  const container = document.querySelector<HTMLElement>(".article-content");
  if (!container) return;

  const images = container.querySelectorAll<HTMLImageElement>("img[data-caption]:not(.gallery-image)");
  for (const image of images) {
    const caption = image.dataset.caption?.trim();
    if (!caption || image.closest("figure")) continue;

    const paragraph = image.closest("p");
    if (paragraph && paragraph.textContent?.trim() !== "") continue;

    const target: HTMLElement = image.parentElement?.tagName === "A"
      ? image.parentElement
      : image;
    const parent = target.parentElement;
    if (!parent) continue;

    const figure = document.createElement("figure");
    figure.className = "image-caption";
    parent.insertBefore(figure, target);
    figure.appendChild(target);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = caption;
    figure.appendChild(figcaption);
  }
}
