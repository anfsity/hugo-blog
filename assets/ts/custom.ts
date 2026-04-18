/* ===========================================================
   1) Table of Contents (TOC) open/close management
   =========================================================== */
function initTocHide() {
    const toc = document.querySelector(".widget--toc");
    if (!toc) return;

    const links = toc.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href')?.substring(1);
            if (!targetId) return;
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.replaceState(null, '', `#${targetId}`);
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
   2) Back-to-top button and progress indicator
   =========================================================== */
function initBackToTop() {
    const totopBtn = document.getElementById('back-to-top');
    if (!totopBtn) return;

    if ((window as any)._backTopScrollHandler) {
        window.removeEventListener('scroll', (window as any)._backTopScrollHandler);
    }

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
   3) Code block "more" toggle
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
            window.dispatchEvent(new Event('resize'));
        });

        codeMoreBtn.appendChild(img);
        codeMoreBox.appendChild(codeMoreBtn);
        codeBlock.appendChild(codeMoreBox);
    });
}

/* ===========================================================
   4) Horizontal scroll: convert vertical wheel -> horizontal
   =========================================================== */
function initHorizontalScroll() {
    const scrollArea = document.querySelector('.subsection-list');
    if (!scrollArea) return;

    if (scrollArea.getAttribute('data-h-scroll') === 'true') return;
    scrollArea.setAttribute('data-h-scroll', 'true');

    scrollArea.addEventListener('wheel', (e: Event) => {
        const event = e as WheelEvent;
        if (event.deltaY !== 0) {
            event.preventDefault();
            scrollArea.scrollLeft += event.deltaY;
        }
    }, { passive: false });
}

/* ===========================================================
   5) Music Player Toggle Logic & Meting Fetch
   =========================================================== */

interface ParsedUrl {
    server: string;
    type: string;
    id: string;
}

const URL_RULES: [RegExp, string, string][] = [
    [/music\.163\.com.*song.*id=(\d+)/, 'netease', 'song'],
    [/music\.163\.com.*album.*id=(\d+)/, 'netease', 'album'],
    [/music\.163\.com.*playlist.*id=(\d+)/, 'netease', 'playlist'],
    [/music\.163\.com.*discover\/toplist.*id=(\d+)/, 'netease', 'playlist'],
    [/y\.qq\.com.*song\/(\w+)/, 'tencent', 'song'],
    [/y\.qq\.com.*album\/(\w+)/, 'tencent', 'album'],
    [/y\.qq\.com.*playsquare\/(\w+)/, 'tencent', 'playlist'],
    [/y\.qq\.com.*playlist\/(\w+)/, 'tencent', 'playlist'],
];

function parseMusicUrl(url: string): ParsedUrl | null {
    for (const [regex, server, type] of URL_RULES) {
        const match = url.match(regex);
        if (match?.[1]) {
            return { server, type, id: match[1] };
        }
    }
    return null;
}

async function fetchMeting(server: string, type: string, id: string, apiUrl: string): Promise<any[]> {
    const url = new URL(apiUrl);
    const params = new URLSearchParams({ server, type, id });
    url.search = params.toString();
    
    try {
        const res = await fetch(url);
        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

async function initMusicPlayer() {
    const musicBtn = document.getElementById('music-player-widget');
    const musicPanel = document.getElementById('music-panel');
    const aplayerContainer = document.getElementById('aplayer-container');
    
    if (!musicBtn || !musicPanel || !aplayerContainer) return;
    
    if (musicBtn.dataset.bound === 'true') return;
    musicBtn.dataset.bound = 'true';

    musicBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        musicPanel.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!musicBtn.contains(e.target as Node) && !musicPanel.contains(e.target as Node)) {
            musicPanel.classList.remove('show');
        }
    });

    const config = (window as any).MusicConfig;
    if (!config || !config.urls || !Array.isArray(config.urls)) return;

    const urls: string[] = config.urls;
    const apiUrl = config.api || 'https://api.injahow.cn/meting/';

    const allSongsArrays = await Promise.all(
        urls.map((url) => {
            const parsed = parseMusicUrl(url);
            if (!parsed) return Promise.resolve([]);
            return fetchMeting(parsed.server, parsed.type, parsed.id, apiUrl);
        })
    );

    const audioList = allSongsArrays.flat().filter(song => song && song.url);

    if (audioList.length > 0 && typeof (window as any).APlayer !== 'undefined') {
        const ap = new (window as any).APlayer({
            container: aplayerContainer,
            audio: audioList,
            theme: config.theme || '#2980b9',
            autoplay: config.autoPlay || false,
            loop: 'all',
            order: 'list',
            preload: 'auto',
            mutex: true,
            listFolded: true
        });

        ap.on('play', () => musicBtn.setAttribute('data-play', 'true'));
        ap.on('pause', () => musicBtn.removeAttribute('data-play'));
    }
}

/* ===========================================================
   6) Swup V4 SPA Navigation
   =========================================================== */
function initSwup() {
    if (typeof (window as any).Swup === 'undefined') return;

    // Check if we already have swup running
    if ((window as any)._swup_instance) return;

    console.log("Starting Swup init...");
    try {
        const plugins = [];
        if (typeof (window as any).SwupScriptsPlugin !== 'undefined') {
            plugins.push(new (window as any).SwupScriptsPlugin({
                head: true,
                body: true,
                optin: false
            }));
        } else {
            console.error("SwupScriptsPlugin is not defined on window!");
        }

        if (typeof (window as any).SwupBodyClassPlugin !== 'undefined') {
            plugins.push(new (window as any).SwupBodyClassPlugin());
        }

        if (typeof (window as any).SwupHeadPlugin !== 'undefined') {
            plugins.push(new (window as any).SwupHeadPlugin());
        }

        // Fallback or guarantee body class and title syncing
        const manualSync = (visit: any) => {
            if (visit.to && visit.to.document && visit.to.document.body) {
                document.body.className = visit.to.document.body.className;
                document.title = visit.to.document.title;
            }
        };
        const swup = new (window as any).Swup({
            containers: ["#swup"],
            plugins: plugins
        });

        (window as any)._swup_instance = swup;

        swup.hooks.on('content:replace', manualSync);

        swup.hooks.on('page:view', () => {
            // Re-initialize Stack theme
            if ((window as any).Stack && typeof (window as any).Stack.init === 'function') {
                (window as any).Stack.init(); 
            }
            
            // Re-initialize our custom scripts
            initTocHide();
            initCodeMoreBox();
            initBackToTop();
            initHorizontalScroll();

            // Re-initialize KaTeX (Math typesetting)
            if (typeof (window as any).renderMathInElement === 'function') {
                const articleContent = document.querySelector('.article-content');
                if (articleContent) {
                    (window as any).renderMathInElement(articleContent, {
                        delimiters: [
                            { left: "$$", right: "$$", display: true },
                            { left: "$", right: "$", display: false },
                            { left: "\\(", right: "\\)", display: false },
                            { left: "\\[", right: "\\]", display: true }
                        ]
                    });
                }
            }
        });
    } catch (err) {
        console.error('Swup init failed:', err);
    }
}

/* ===========================================================
   Main entry
   =========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    try {
        initTocHide();
        initCodeMoreBox();
        initBackToTop();
        initHorizontalScroll();
        initMusicPlayer();
        initSwup();
    } catch (e) {
        console.error(e);
    }
});
console.log("Custom script loaded!");
