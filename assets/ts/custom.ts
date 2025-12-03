// @ts-ignore
import { createApp } from 'vue';

/* ===========================================================
   1) Rebind/repair theme UI that Turbo navigation breaks
      - Dark mode toggle, mobile menu toggle
      - Trigger theme scripts (search, LaTeX) after DOM swap
   =========================================================== */
function fixStackTheme() {
    // Rebind dark mode toggle: replace node to remove stale listeners,
    // then attach a concise handler that updates data-scheme and notifies listeners.
    const toggleBtn = document.getElementById('dark-mode-toggle');
    if (toggleBtn) {
        const newBtn = toggleBtn.cloneNode(true);
        toggleBtn.parentNode?.replaceChild(newBtn, toggleBtn);

        newBtn.addEventListener('click', () => {
            const html = document.documentElement;
            const current = html.dataset.scheme;
            const target = current === 'dark' ? 'light' : 'dark';
            html.dataset.scheme = target;
            localStorage.setItem('scheme', target);
            // Notify other subsystems (player, widgets) of scheme change.
            window.dispatchEvent(new Event('colorSchemeChange'));
        });
    }

    // Rebind mobile menu toggle in an idempotent way.
    const menu = document.getElementById('main-menu');
    const menuToggle = document.getElementById('toggle-menu');
    if (menu && menuToggle) {
        const newToggle = menuToggle.cloneNode(true);
        menuToggle.parentNode?.replaceChild(newToggle, menuToggle);

        (newToggle as HTMLElement).addEventListener('click', () => {
            menu.classList.toggle('is-active');
            (newToggle as HTMLElement).classList.toggle('is-active');
        });
    }

    // Ensure theme-related initialization runs again after Turbo body swap.
    // Small timeout to allow DOM replacement to settle, then dispatch events
    // and rerun LaTeX renderer if available.
    setTimeout(() => {
        window.dispatchEvent(new Event('DOMContentLoaded'));
        window.dispatchEvent(new Event('load'));

        if ((window as any).renderMathInElement) {
            (window as any).renderMathInElement(document.body);
        }
    }, 50);
}

/* ===========================================================
   2) Table of Contents (TOC) open/close management
   =========================================================== */
function initTocHide() {
    const toc = document.querySelector(".widget--toc");
    if (!toc) return;

    const links = toc.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.setAttribute('data-turbo', 'false');
        
        const newLink = link.cloneNode(true) as HTMLElement;
        link.parentNode?.replaceChild(newLink, link);
        
        newLink.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = newLink.getAttribute('href')?.substring(1);
            const targetElement = document.getElementById(targetId || '');
            
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, '', `#${targetId}`);
            }
        });
    });

    if ((window as any)._tocScrollHandler) {
        window.removeEventListener('scroll', (window as any)._tocScrollHandler);
    }

    const scrollHandler = () => {
        const openUls = document.querySelectorAll("#TableOfContents .open");
        openUls.forEach(ul => ul.classList.remove("open"));

        const currentLi = document.querySelector("#TableOfContents .active-class");
        if (!currentLi) return;

        if (currentLi.children.length > 1 && currentLi.children[1].matches('ul, ol')) {
            currentLi.children[1].classList.add("open");
        }

        let parentUl = currentLi.parentElement;
        while (parentUl && parentUl.closest('#TableOfContents')) {
            if (parentUl.matches('ul, ol')) parentUl.classList.add("open");
            parentUl = parentUl.parentElement?.parentElement || null;
        }
    };

    (window as any)._tocScrollHandler = scrollHandler;
    window.addEventListener('scroll', scrollHandler, { passive: true });
}

/* ===========================================================
   3) Back-to-top button and progress indicator
      - Idempotent binding and scroll handler replacement.
   =========================================================== */
function initBackToTop() {
    const totopBtn = document.getElementById('back-to-top');
    if (!totopBtn) return;

    if ((window as any)._backTopScrollHandler) {
        window.removeEventListener('scroll', (window as any)._backTopScrollHandler);
    }

    // Rebind click to scroll to top smoothly.
    totopBtn.onclick = (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const progressNum = totopBtn.querySelector('.progress-num') as HTMLElement;
    const scrollHandler = () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        const validHeight = scrollHeight - clientHeight;

        if (progressNum && validHeight > 0) {
            let percent = Math.round((scrollTop / validHeight) * 100);
            percent = Math.min(100, Math.max(0, percent));
            progressNum.innerText = `${percent}%`;
        }

        if (scrollTop > 100) totopBtn.classList.add('show');
        else totopBtn.classList.remove('show');
    };

    (window as any)._backTopScrollHandler = scrollHandler;
    window.addEventListener('scroll', scrollHandler, { passive: true });
    scrollHandler();
}

/* ===========================================================
   4) Code block "more" toggle
      - Insert a toggle control for long code blocks.
      - Prevent duplicate insertion on repeated runs.
   =========================================================== */
function initCodeMoreBox() {
    const codeBlocks = document.querySelectorAll(".highlight");
    const scriptTag = document.getElementById('custom-scripts');
    if (!codeBlocks.length || !scriptTag) return;

    const moreIconSrc = scriptTag.dataset.moreIconSrc;
    const lessIconSrc = scriptTag.dataset.lessIconSrc;
    if (!moreIconSrc || !lessIconSrc) return;

    codeBlocks.forEach(block => {
        const codeBlock = block as HTMLElement;

        // Skip if content fits or control already exists.
        if (codeBlock.scrollHeight <= codeBlock.offsetHeight) return;
        if (codeBlock.querySelector('.code-more-box')) return;

        const codeMoreBox = document.createElement('div');
        codeMoreBox.classList.add('code-more-box');
        const codeMoreBtn = document.createElement('span');
        codeMoreBtn.classList.add('code-more-btn');
        const img = document.createElement('img');
        img.classList.add('code-more-img');
        img.src = moreIconSrc;

        codeMoreBtn.addEventListener('click', () => {
            codeBlock.classList.toggle('code-show');
            const isShown = codeBlock.classList.contains('code-show');
            img.src = isShown ? lessIconSrc : moreIconSrc;
            // Notify layout changes.
            window.dispatchEvent(new Event('resize'));
        });

        codeMoreBtn.appendChild(img);
        codeMoreBox.appendChild(codeMoreBtn);
        codeBlock.appendChild(codeMoreBox);
    });
}

/* ===========================================================
   5) Horizontal scroll: convert vertical wheel -> horizontal
   =========================================================== */
function initHorizontalScroll() {
    const scrollArea = document.querySelector('.subsection-list');
    if (!scrollArea) return;

    scrollArea.addEventListener('wheel', function (event: any) {
        if (event.deltaY !== 0) {
            event.preventDefault();
            scrollArea.scrollLeft += event.deltaY;
        }
    }, { passive: false });
}

/* ===========================================================
   6) Music player initialization with Turbo guards
      - Dynamically imports player script and initializes once.
      - If player DOM already exists (Turbo preserved), skip init.
      - Protects against concurrent init attempts.
   =========================================================== */
function initMusicPlayer() {
    // If player root exists, Turbo preserved the instance — do nothing.
    if (document.getElementById('MusicPlayerRoot')) {
        console.log('NyxPlayer: Persistent instance detected. Skipping init.');
        return;
    }

    if ((window as any)._nyxPlayerInitializing) return;
    (window as any)._nyxPlayerInitializing = true;

    // Dynamically import and initialize the player.
    // @ts-ignore
    import('/lib/nyx-player.js').then(module => {
        const { initPlayer } = module;
        initPlayer(
            '#nyx-player-mount',
            '#music-btn',
            [{ name: '我喜欢', url: 'https://music.163.com/#/my/m/music/playlist?id=2921261234' }],
            null,
            'html[data-scheme="dark"]'
        );

        const checkTimer = setInterval(() => {
            if (document.querySelector('#MusicPlayerRoot')) {
                clearInterval(checkTimer);
                (window as any)._nyxPlayerInitializing = false;
            }
        }, 4);
    }).catch(() => { (window as any)._nyxPlayerInitializing = false; });
}

/* ===========================================================
   Main entry:
   - Run initializers on first load.
   - Re-run safe, idempotent initializers on turbo:load.
   =========================================================== */
try {
    initTocHide();
    initCodeMoreBox();
    initBackToTop();
    initHorizontalScroll();
    initMusicPlayer();
    fixStackTheme();
} catch (e) { console.error(e); }

document.addEventListener('turbo:load', () => {
    try {
        initTocHide();
        initCodeMoreBox();
        initBackToTop();
        initHorizontalScroll();
        initMusicPlayer();
        fixStackTheme();
    } catch (e) { console.error(e); }
});