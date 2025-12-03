// Helper to ensure code runs only after DOM is ready
function onDOMReady(fn: () => void) {
    if (document.readyState !== 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
}

onDOMReady(function () {

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
        if (!toc) return;

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
        }, { passive: true });
    }

    /* ══════════════════════════════════════════════════════════ */
    /* Feature 2: Back to Top Button (With Progress %)            */
    /* ══════════════════════════════════════════════════════════ */
    function initBackToTop() {
        const totopBtn = document.getElementById('back-to-top');
        if (!totopBtn) return;

        const progressNum = totopBtn.querySelector('.progress-num') as HTMLElement;

        function backToTop(event: Event) {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function updateState() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;

            const validHeight = scrollHeight - clientHeight;
            let percent = 0;

            if (validHeight > 0) {
                percent = Math.round((scrollTop / validHeight) * 100);
            }
            if (percent > 100) percent = 100;
            if (percent < 0) percent = 0;

            if (progressNum) {
                progressNum.innerText = `${percent}%`;
            }

            if (scrollTop > 100) {
                totopBtn?.classList.add('show');
            } else {
                totopBtn?.classList.remove('show');
            }
        }

        totopBtn.addEventListener('click', backToTop, false);

        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateState();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });

        updateState();
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

        if (!moreIconSrc || !lessIconSrc) return;

        codeBlocks.forEach(codeBlock => {
            // Skip blocks that fit within height limit
            if (codeBlock.scrollHeight <= codeBlock.offsetHeight) return;

            const codeMoreBox = document.createElement('div');
            codeMoreBox.classList.add('code-more-box');

            const codeMoreBtn = document.createElement('span');
            codeMoreBtn.classList.add('code-more-btn');

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

                img.src = isShown ? lessIconSrc : moreIconSrc;
                img.setAttribute('alt', isShown ? 'Collapse code block' : 'Expand code block');

                window.dispatchEvent(new Event('resize'));
            });

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
                event.preventDefault();
                scrollArea.scrollLeft += event.deltaY;
            }
        }, { passive: false });
    }

    /* ══════════════════════════════════════════════════════════ */
    /* Feature 5: Music Player & Lyrics Auto-Scroll               */
    /* ══════════════════════════════════════════════════════════ */
    /**
     * Initializes the NyxPlayer and handles dynamic lyrics scrolling
     * - Dynamically imports the player module
     * - Sets up a safe MutationObserver to detect long lyrics
     * - Toggles .is-long class to trigger CSS scrolling animation
     */
    function initMusicPlayer() {
        const playerMount = document.getElementById('nyx-player-mount');
        if (!playerMount) return;

        // --- Fix: Prevent Double Initialization ---
        // Check if player root already exists or if we are currently initializing
        if (document.getElementById('MusicPlayerRoot') || (window as any)._nyxPlayerInitializing) {
            console.warn('NyxPlayer: Already initialized or initializing. Skipping.');
            return;
        }
        
        // Set global flag
        (window as any)._nyxPlayerInitializing = true;

        console.log('NyxPlayer: Initializing...');
        
        // @ts-ignore
        import('/lib/nyx-player.js').then(module => {
            const { initPlayer } = module;

            initPlayer(
                '#nyx-player-mount',
                '#music-btn',
                [
                    {
                        name: '我喜欢',
                        url: 'https://music.163.com/#/my/m/music/playlist?id=2921261234',
                    }
                ],
                null,
                'html[data-scheme="dark"]'
            );

            const observeLyrics = () => {
                const lrcContainer = document.querySelector('#MusicPlayerRoot .lrc');
                if (!lrcContainer) return;

                const checkCurrentLine = () => {
                    const current = lrcContainer.querySelector('p.current');
                    if (!current) return;

                    const isOverflow = Math.ceil(current.scrollWidth) > Math.ceil(current.clientWidth);
                    
                    if (isOverflow && !current.classList.contains('is-long')) {
                        current.classList.add('is-long');
                    } else if (!isOverflow && current.classList.contains('is-long')) {
                        current.classList.remove('is-long');
                    }
                };

                const observer = new MutationObserver((mutations) => {
                    let shouldCheck = false;
                    for (const mutation of mutations) {
                        if (mutation.attributeName === 'class') {
                            shouldCheck = true;
                            break; 
                        }
                    }

                    if (shouldCheck) {
                        observer.disconnect();
                        checkCurrentLine();
                        observer.observe(lrcContainer, {
                            attributes: true,
                            subtree: true,
                            attributeFilter: ['class']
                        });
                    }
                });

                observer.observe(lrcContainer, {
                    attributes: true,
                    subtree: true,
                    attributeFilter: ['class']
                });
            };

            const checkPlayerTimer = setInterval(() => {
                if (document.querySelector('#MusicPlayerRoot .lrc')) {
                    clearInterval(checkPlayerTimer);
                    observeLyrics();
                }
            }, 1000);

        }).catch(error => {
            console.error('NyxPlayer Init Failed:', error);
            // Reset flag on error so we can retry if needed (though usually page reload is better)
            (window as any)._nyxPlayerInitializing = false;
        });
    }

    /* ══════════════════════════════════════════════════════════ */
    /*                    Initialize All Features                  */
    /* ══════════════════════════════════════════════════════════ */
    try {
        initTocHide();
        initBackToTop();
        initCodeMoreBox();
        initHorizontalScroll();
        initMusicPlayer();
    } catch (e) {
        console.error("Error initializing custom scripts:", e);
    }
});