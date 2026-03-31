const fs = require('fs');
let css = fs.readFileSync('assets/scss/custom.scss', 'utf8');

const regex = /\.article-list--timeline\s*\{[\s\S]*\}\n\}\n/m;
const newCssText = `.article-list--timeline {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 3rem;
  position: relative;
  padding-left: 3rem; /* Leave space for the timeline */

  /* Vertical timeline line */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 1.5rem; /* Line at 1.5rem */
    width: 2px;
    background: var(--body-background);
    transform: translateX(-50%);
    z-index: 0;
  }

  .timeline-item {
    position: relative;
    
    /* The node on the timeline */
    &::before {
      content: '';
      position: absolute;
      left: -1.5rem; /* Point sits exactly on the line: 3rem (padding) - 1.5rem = 1.5rem */
      top: 50%;
      transform: translate(-50%, -50%);
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: var(--accent-color);
      border: 3px solid var(--body-background);
      z-index: 2;
      transition: transform 0.3s ease, background 0.3s ease;
    }
    
    &:hover::before {
      background: var(--card-text-color-main);
      transform: translate(-50%, -50%) scale(1.2);
    }
    
    a.timeline-link {
      display: flex;
      flex-direction: column;
      text-decoration: none;
      padding: 2rem;
      background: var(--card-background);
      border-radius: var(--card-border-radius);
      box-shadow: var(--shadow-sm);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      position: relative;
      z-index: 1;

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
      }
    }

    .timeline-title {
      font-size: 2rem;
      margin: 0 0 0.8rem 0;
      color: var(--card-text-color-main);
      font-weight: 500;
      border-inline-start: none !important;
      padding-inline-start: 0 !important;
      margin-inline-start: 0 !important;
    }

    .timeline-meta {
      font-size: 1.4rem;
      color: var(--card-text-color-tertiary);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      
      time {
        font-family: var(--sys-font-code);
      }
    }
    
    .timeline-description {
      margin: 0;
      font-size: 1.5rem;
      color: var(--card-text-color-secondary);
      line-height: 1.6;
    }
  }
}
`;

css = css.replace(regex, newCssText);
fs.writeFileSync('assets/scss/custom.scss', css);
