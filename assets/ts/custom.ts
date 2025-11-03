// Wait for full DOM load before executing scripts
document.addEventListener("DOMContentLoaded", function () {

    /* ══════════════════════════════════════════════════════════ */
    /* Feature 1: Dynamic Table of Contents                       */
    /* ══════════════════════════════════════════════════════════ */
    /**
     * Automatically expands/collapses TOC sections based on scroll position
     * - Collapses inactive sections to reduce visual clutter
     * - Expands current section and all parent sections
     * - Uses passive event listener for better scroll performance
     */
    function initTocHide() {
        const toc = document.querySelector(".widget--toc");
        if (!toc) return; // Exit if no TOC widget exists

        window.addEventListener('scroll', function () {
            // Step 1: Collapse all currently open sections
            const openUls = document.querySelectorAll("#TableOfContents .open");
            openUls.forEach(ul => ul.classList.remove("open"));

            // Step 2: Find the currently active heading
            const currentLi = document.querySelector("#TableOfContents .active-class");
            if (!currentLi) return;

            // Step 3: Expand current section's children (if any)
            if (currentLi.children.length > 1 && currentLi.children[1].matches('ul, ol')) {
                currentLi.children[1].classList.add("open");
            }

            // Step 4: Expand all parent sections recursively
            let parentUl = currentLi.parentElement;
            while (parentUl && parentUl.closest('#TableOfContents')) {
                if (parentUl.matches('ul, ol')) {
                    parentUl.classList.add("open");
                }
                // Move up to next parent level
                if (parentUl.parentElement && parentUl.parentElement.tagName === 'LI') {
                    parentUl = parentUl.parentElement.parentElement;
                } else {
                    break;
                }
            }
        }, { passive: true }); // Passive listener improves scroll performance
    }

    /* ══════════════════════════════════════════════════════════ */
    /* Feature 2: Back to Top Button                              */
    /* ══════════════════════════════════════════════════════════ */
    /**
     * Floating button that scrolls page to top with smooth animation
     * - Auto-shows when user scrolls down > 200px
     * - Uses smooth scroll behavior for better UX
     * - Positioned in bottom-right corner
     */
    function initBackToTop() {
        const totopBtn = document.getElementById('back-to-top');
        if (!totopBtn) return; // Exit if button doesn't exist

        /**
         * Smooth scroll to page top
         * @param {Event} event - Click event object
         */
        function backToTop(event) {
            event.preventDefault(); // Prevent anchor jump
            window.scrollTo({
                top: 0,
                behavior: 'smooth' // Native smooth scroll
            });
        }

        /**
         * Show/hide button based on scroll position
         * Threshold: 200px from top
         */
        function toggleVisibility() {
            let scrollTop = window.scrollY || document.documentElement.scrollTop;
            totopBtn.style.display = scrollTop < 200 ? 'none' : 'inline';
        }

        // Bind event listeners
        totopBtn.addEventListener('click', backToTop, false);
        window.addEventListener('scroll', toggleVisibility, { passive: true });

        // Set initial state
        toggleVisibility();
    }

    /* ══════════════════════════════════════════════════════════ */
    /* Feature 3: Code Block Collapse/Expand                      */
    /* ══════════════════════════════════════════════════════════ */
    /**
     * Adds expand/collapse functionality to tall code blocks
     * - Only processes blocks taller than visible area
     * - Uses inline Base64 SVG icons to avoid network requests
     * - Toggles between "show more" and "show less" states
     * - Triggers window resize event for layout recalculation
     */
    function initCodeMoreBox() {
        const codeBlocks = document.querySelectorAll(".highlight");
        if (!codeBlocks.length) return;

        // Retrieve icon data from script tag attributes
        const scriptTag = document.getElementById('custom-scripts');
        const moreIconSrc = scriptTag.dataset.moreIconSrc || '';
        const lessIconSrc = scriptTag.dataset.lessIconSrc || '';

        // Exit if icons are missing (prevents broken functionality)
        if (!moreIconSrc || !lessIconSrc) return;

        codeBlocks.forEach(codeBlock => {
            // Skip blocks that fit within height limit
            if (codeBlock.scrollHeight <= codeBlock.offsetHeight) return;

            // Create container for fade overlay and button
            const codeMoreBox = document.createElement('div');
            codeMoreBox.classList.add('code-more-box');

            // Create expand/collapse button
            const codeMoreBtn = document.createElement('span');
            codeMoreBtn.classList.add('code-more-btn');

            // Create icon image element
            const img = document.createElement('img');
            img.classList.add('code-more-img');
            img.src = moreIconSrc;
            img.setAttribute('alt', 'Expand code block');

            /**
             * Toggle expanded/collapsed state
             * - Switches between caret-down and caret-up icons
             * - Updates accessibility attributes
             * - Dispatches resize event for other components
             */
            codeMoreBtn.addEventListener('click', () => {
                codeBlock.classList.toggle('code-show');
                const isShown = codeBlock.classList.contains('code-show');

                // Update icon and alt text
                img.src = isShown ? lessIconSrc : moreIconSrc;
                img.setAttribute('alt', isShown ? 'Collapse code block' : 'Expand code block');

                // Notify other components of layout change
                window.dispatchEvent(new Event('resize'));
            });

            // Assemble and append elements
            codeMoreBtn.appendChild(img);
            codeMoreBox.appendChild(codeMoreBtn);
            codeBlock.appendChild(codeMoreBox);
        });
    }

    /* ══════════════════════════════════════════════════════════ */
    /* Feature 4: Horizontal Scroll with Mouse Wheel              */
    /* ══════════════════════════════════════════════════════════ */
    /**
     * Converts vertical wheel scroll to horizontal scroll in specific areas
     * - Useful for wide content like timelines or image galleries
     * - Requires passive: false to call preventDefault()
     * - Only applies to elements with .subsection-list class
     */
    function initHorizontalScroll() {
        const scrollArea = document.querySelector('.subsection-list');
        if (!scrollArea) return;

        scrollArea.addEventListener('wheel', function (event) {
            if (event.deltaY !== 0) {
                // Prevent default vertical scroll
                event.preventDefault();
                // Apply vertical scroll delta to horizontal position
                scrollArea.scrollLeft += event.deltaY;
            }
        }, { passive: false }); // Must be false to use preventDefault()
    }

    /* ══════════════════════════════════════════════════════════ */
    /*                    Initialize All Features                  */
    /* ══════════════════════════════════════════════════════════ */
    // Wrap in try-catch to prevent one feature's error from breaking others
    try {
        initTocHide();
        initBackToTop();
        initCodeMoreBox();
        initHorizontalScroll();
    } catch (e) {
        console.error("Error initializing custom scripts:", e);
    }
});