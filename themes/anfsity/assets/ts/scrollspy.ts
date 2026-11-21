// Implements a scroll spy system for the ToC, displaying the current section with an indicator and scrolling to it when needed.

// Inspired from https://gomakethings.com/debouncing-your-javascript-events/
function debounced(func: Function) {
    let timeout;
    return () => {
        if (timeout) {
            window.cancelAnimationFrame(timeout);
        }

        timeout = window.requestAnimationFrame(() => func());
    }
}

const headersQuery = ".article-content h1[id], .article-content h2[id], .article-content h3[id], .article-content h4[id], .article-content h5[id], .article-content h6[id]";
const tocQuery = "#TableOfContents";
const navigationQuery = "#TableOfContents li";
const activeClass = "active-class";

function scrollToTocElement(tocElement: HTMLElement, scrollableNavigation: HTMLElement) {
    let textHeight = tocElement.querySelector("a").offsetHeight;
    let scrollTop = tocElement.offsetTop - scrollableNavigation.offsetHeight / 2 + textHeight / 2 - scrollableNavigation.offsetTop;
    if (scrollTop < 0) {
        scrollTop = 0;
    }
    scrollableNavigation.scrollTo({ top: scrollTop, behavior: "smooth" });
}

type IdToElementMap = { [key: string]: HTMLElement };

function buildIdToNavigationElementMap(navigation: NodeListOf<Element>): IdToElementMap {
    const sectionLinkRef: IdToElementMap = {};
    navigation.forEach((navigationElement: HTMLElement) => {
        const link = navigationElement.querySelector("a");
        if (link) {
            const href = link.getAttribute("href");
            if (href.startsWith("#")) {
                sectionLinkRef[href.slice(1)] = navigationElement;
            }
        }
    });

    return sectionLinkRef;
}

function computeOffsets(headers: NodeListOf<Element>) {
    let sectionsOffsets = [];
    headers.forEach((header: HTMLElement) => { sectionsOffsets.push({ id: header.id, offset: header.offsetTop }) });
    sectionsOffsets.sort((a, b) => a.offset - b.offset);
    return sectionsOffsets;
}

let activeCleanup: (() => void) | null = null;

function cleanupScrollspy() {
    if (activeCleanup) {
        activeCleanup();
        activeCleanup = null;
    }
}

function setupScrollspy() {
    cleanupScrollspy();

    let headers = document.querySelectorAll(headersQuery);
    if (!headers.length) {
        return;
    }

    let scrollableNavigation = document.querySelector(tocQuery) as HTMLElement | undefined;
    if (!scrollableNavigation) {
        return;
    }

    let navigation = document.querySelectorAll(navigationQuery);
    if (!navigation.length) {
        return;
    }

    let sectionsOffsets = computeOffsets(headers);

    // We need to avoid scrolling when the user is actively interacting with the ToC. Otherwise, if the user clicks on a link in the ToC,
    // we would scroll their view, which is not optimal usability-wise.
    let tocHovered: boolean = false;
    const onTocEnter = debounced(() => tocHovered = true);
    const onTocLeave = debounced(() => tocHovered = false);
    scrollableNavigation.addEventListener("mouseenter", onTocEnter);
    scrollableNavigation.addEventListener("mouseleave", onTocLeave);

    let activeSectionLink: Element;

    let idToNavigationElement: IdToElementMap = buildIdToNavigationElementMap(navigation);

    function scrollHandler() {
        let scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;

        let newActiveSection: HTMLElement | undefined;

        // Find the section that is currently active.
        // It is possible for no section to be active, so newActiveSection may be undefined.
        sectionsOffsets.forEach((section) => {
            if (scrollPosition >= section.offset - 20) {
                newActiveSection = document.getElementById(section.id);
            }
        });

        // Find the link for the active section. Once again, there are a few edge cases:
        // - No active section = no link => undefined
        // - No active section but the link does not exist in toc (e.g. because it is outside of the applicable ToC levels) => undefined
        let newActiveSectionLink: HTMLElement | undefined
        if (newActiveSection) {
            newActiveSectionLink = idToNavigationElement[newActiveSection.id];
        }

        if (newActiveSection && !newActiveSectionLink) {
            // The active section does not have a link in the ToC, so we can't scroll to it.
            console.debug("No link found for section", newActiveSection);
        } else if (newActiveSectionLink !== activeSectionLink) {
            if (activeSectionLink)
                activeSectionLink.classList.remove(activeClass);
            if (newActiveSectionLink) {
                newActiveSectionLink.classList.add(activeClass);
                if (!tocHovered) {
                    // Scroll so that newActiveSectionLink is in the middle of scrollableNavigation, except when it's from a manual click (hence the tocHovered check)
                    scrollToTocElement(newActiveSectionLink, scrollableNavigation);
                }
            }
            activeSectionLink = newActiveSectionLink;
        }
    }

    const debouncedScroll = debounced(scrollHandler);
    window.addEventListener("scroll", debouncedScroll, { passive: true });
    
    // Resizing may cause the offset values to change: recompute them.
    function resizeHandler() {
        sectionsOffsets = computeOffsets(headers);
        scrollHandler();
    }

    const debouncedResize = debounced(resizeHandler);

    // Use ResizeObserver to detect changes in the size of .article-content
    let resizeObserver: ResizeObserver | null = null;
    const articleContent = document.querySelector(".article-content");
    if (articleContent) {
        resizeObserver = new ResizeObserver(debouncedResize);
        resizeObserver.observe(articleContent);
    }

    window.addEventListener("resize", debouncedResize);

    activeCleanup = () => {
        window.removeEventListener("scroll", debouncedScroll);
        window.removeEventListener("resize", debouncedResize);
        scrollableNavigation.removeEventListener("mouseenter", onTocEnter);
        scrollableNavigation.removeEventListener("mouseleave", onTocLeave);
        resizeObserver?.disconnect();
    };
}

export { setupScrollspy, cleanupScrollspy };
