/**
 * Normalizes standalone static/external images into semantic <figure class="article-figure">
 * elements (replacing the wrapper <p>) so captioned and uncaptioned images share identical
 * horizontal bounds, alignment, and framing.
 */
export function initImageCaptions(): void {
  const container = document.querySelector<HTMLElement>(".article-content");
  if (!container) return;

  const paragraphs = Array.from(container.querySelectorAll<HTMLParagraphElement>("p"));
  for (const paragraph of paragraphs) {
    if (paragraph.textContent?.trim() !== "") continue;

    const images = Array.from(paragraph.querySelectorAll<HTMLImageElement>("img:not(.gallery-image)"));
    if (images.length === 0) continue;

    const targets: Array<{ image: HTMLImageElement; target: HTMLElement }> = [];
    for (const image of images) {
      if (image.closest("figure, .highlight, .chroma, button, nav")) continue;
      const target: HTMLElement = image.parentElement?.tagName === "A"
        ? image.parentElement
        : image;
      if (target.parentElement !== paragraph) continue;
      targets.push({ image, target });
    }

    if (targets.length === 0 || targets.length !== paragraph.children.length) continue;

    const figures = targets.map(({ image, target }) => {
      const figure = document.createElement("figure");
      figure.className = "article-figure";
      figure.appendChild(target);

      const caption = image.dataset.caption?.trim();
      if (caption) {
        const figcaption = document.createElement("figcaption");
        figcaption.textContent = caption;
        figure.appendChild(figcaption);
      }
      return figure;
    });

    if (figures.length === 1) {
      paragraph.replaceWith(figures[0]);
    } else {
      const gallery = document.createElement("div");
      gallery.className = "gallery";
      figures.forEach((figure) => gallery.appendChild(figure));
      paragraph.replaceWith(gallery);
    }
  }
}
