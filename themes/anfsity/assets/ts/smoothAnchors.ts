// Implements smooth scrolling when clicking on an anchor link.
// This is required instead of using modern CSS because Chromium does not currently support scrolling
// one element with scrollTo while another element is scrolled because of a click on a link. This would
// thus not work with the ToC scrollspy and e.g. footnotes.

// Here are additional links about this issue:
// - https://stackoverflow.com/questions/49318497/google-chrome-simultaneously-smooth-scrollintoview-with-more-elements-doesn
// - https://stackoverflow.com/questions/57214373/scrollintoview-using-smooth-function-on-multiple-elements-in-chrome
// - https://bugs.chromium.org/p/chromium/issues/detail?id=833617
// - https://bugs.chromium.org/p/chromium/issues/detail?id=1043933
// - https://bugs.chromium.org/p/chromium/issues/detail?id=1121151

const anchorLinksQuery = "a[href]";

function decodeHashTarget(raw: string): string {
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

function setupSmoothAnchors() {
    document.querySelectorAll<HTMLAnchorElement>(anchorLinksQuery).forEach(aElement => {
        if (aElement.dataset.smoothAnchorBound === "true") return;
        const href = aElement.getAttribute("href");
        if (!href || href[0] !== "#" || href.length === 1) {
            return;
        }
        aElement.dataset.smoothAnchorBound = "true";
        aElement.addEventListener("click", clickEvent => {
            const targetId = decodeHashTarget(href.substring(1));
            const target = document.getElementById(targetId) as HTMLElement | null;
            if (!target) return;

            clickEvent.preventDefault();
            const offset = target.getBoundingClientRect().top - document.documentElement.getBoundingClientRect().top;

            // Preserve Swup/history state metadata so back/forward navigation stays intact.
            const currentState = window.history.state;
            const nextState = currentState && typeof currentState === "object" ? { ...currentState } : currentState;
            window.history.replaceState(nextState, "", href);

            scrollTo({
                top: offset,
                behavior: "smooth"
            });
        });
    });
}

export { setupSmoothAnchors };
