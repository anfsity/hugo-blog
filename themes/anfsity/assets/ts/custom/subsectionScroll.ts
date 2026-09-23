const initializedAreas = new WeakSet<HTMLElement>();

export function initSubsectionScroll(): void {
  const area = document.querySelector<HTMLElement>(".subsection-list");
  if (!area || initializedAreas.has(area)) return;

  initializedAreas.add(area);
  area.addEventListener("wheel", (event: WheelEvent) => {
    if (event.deltaY === 0) return;
    event.preventDefault();
    area.scrollLeft += event.deltaY;
  }, { passive: false });
}
