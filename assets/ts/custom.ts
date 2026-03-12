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

    scrollArea.addEventListener('wheel', (event: WheelEvent) => {
        if (event.deltaY !== 0) {
            event.preventDefault();
            scrollArea.scrollLeft += event.deltaY;
        }
    }, { passive: false });
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
    } catch (e) {
        console.error(e);
    }
});
