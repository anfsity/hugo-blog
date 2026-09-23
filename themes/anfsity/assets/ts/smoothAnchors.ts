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

function setupSmoothAnchors() {
    document.querySelectorAll(anchorLinksQuery).forEach(aElement => {
        const href = aElement.getAttribute("href");
        if (!href || href[0] !== "#") {
            return;
        }
        aElement.addEventListener("click", clickEvent => {
            clickEvent.preventDefault();

            const targetId = decodeURI(href.substring(1)),
                target = document.getElementById(targetId) as HTMLElement,
                offset = target.getBoundingClientRect().top - document.documentElement.getBoundingClientRect().top;

            // Turbo Drive stores metadata in history.state. Overwriting it (e.g. with {}) can break back/forward.
            const currentState = window.history.state;
            const nextState = currentState && typeof currentState === 'object' ? { ...currentState } : currentState;
            // Use replaceState for in-page hash updates to avoid polluting history and duplicating Turbo metadata.
            window.history.replaceState(nextState, "", href);

            scrollTo({
                top: offset,
                behavior: "smooth"
            });
        });
    });
}

export { setupSmoothAnchors };
