import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://www.hkengage.gov.hk/zh-HK/how-to-apply-for-a-visa';
const BASE_DIR = path.resolve(__dirname, '..');
const RESEARCH_DIR = path.join(BASE_DIR, 'docs', 'research');
const DESIGN_REF_DIR = path.join(BASE_DIR, 'docs', 'design-references');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-HK',
  });
  const page = await context.newPage();

  console.log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(5000);

  // === Screenshots ===
  console.log('Taking desktop screenshot...');
  await page.screenshot({ path: path.join(DESIGN_REF_DIR, 'desktop-fullpage.png'), fullPage: true });

  console.log('Taking mobile screenshot (390px)...');
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(2000);
  await page.screenshot({ path: path.join(DESIGN_REF_DIR, 'mobile-fullpage.png'), fullPage: true });

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });
  await sleep(1000);

  // === Page Topology - Extract all sections ===
  console.log('Extracting page topology...');
  const topology = await page.evaluate(() => {
    const sections = [];
    const allElements = document.querySelectorAll('body > *, body > div > *, main > *, main > div > *');
    // Get top-level sections
    const body = document.body;
    const children = [...body.children];

    // Try to find the main content area
    const selectors = ['main', '#main', '[role="main"]', 'div[class*="content"]', 'div[class*="page"]'];
    let mainContainer = null;
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) { mainContainer = el; break; }
    }

    if (!mainContainer) mainContainer = body;

    function getElementInfo(el) {
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id,
        classes: el.className?.toString ? el.className.toString().split(' ').slice(0, 10).join(' ') : '',
        textPreview: el.textContent?.trim().slice(0, 200),
        childCount: el.children.length,
        computedStyles: {
          display: cs.display,
          position: cs.position,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          padding: cs.padding,
          margin: cs.margin,
          width: cs.width,
          height: cs.height,
        }
      };
    }

    const topLevel = [...mainContainer.children].filter(el => {
      const cs = getComputedStyle(el);
      return cs.display !== 'none' && cs.visibility !== 'hidden';
    });

    return {
      mainContainer: {
        tag: mainContainer.tagName.toLowerCase(),
        id: mainContainer.id,
        classes: mainContainer.className?.toString()
      },
      sections: topLevel.map(el => getElementInfo(el)),
      totalSections: topLevel.length,
      url: window.location.href,
      title: document.title,
    };
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'PAGE_TOPOLOGY.json'),
    JSON.stringify(topology, null, 2)
  );
  console.log('Page topology saved');

  // === Global Font Extraction ===
  console.log('Extracting fonts...');
  const fonts = await page.evaluate(() => {
    const fonts = new Set();
    const elements = document.querySelectorAll('*');
    let count = 0;
    for (const el of elements) {
      if (count > 500) break;
      const cs = getComputedStyle(el);
      if (cs.display !== 'none') {
        fonts.add(cs.fontFamily);
        count++;
      }
    }
    return [...fonts];
  });
  console.log('Fonts found:', fonts);

  // === Asset Discovery ===
  console.log('Discovering assets...');
  const assets = await page.evaluate(() => {
    const images = [...document.querySelectorAll('img')].map(img => ({
      src: img.src || img.currentSrc,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      parentClasses: img.parentElement?.className?.toString()?.slice(0, 200),
      position: getComputedStyle(img).position,
      zIndex: getComputedStyle(img).zIndex,
    }));

    const backgroundImages = [...document.querySelectorAll('*')].filter(el => {
      const bg = getComputedStyle(el).backgroundImage;
      return bg && bg !== 'none' && bg.includes('url');
    }).map(el => ({
      url: getComputedStyle(el).backgroundImage,
      elementTag: el.tagName,
      elementClasses: el.className?.toString()?.slice(0, 200),
      elementId: el.id,
    }));

    const svgs = [...document.querySelectorAll('svg')].map((svg, i) => ({
      index: i,
      parentClasses: svg.parentElement?.className?.toString()?.slice(0, 200),
      width: svg.getAttribute('width') || svg.getAttribute('viewBox'),
      height: svg.getAttribute('height'),
      // Try to get the outer HTML
      outerHTML: svg.outerHTML?.slice(0, 2000),
    }));

    const links = [...document.querySelectorAll('link[rel*="icon"], link[rel="apple-touch-icon"]')].map(l => ({
      href: l.href,
      rel: l.rel,
      sizes: l.sizes,
      type: l.type,
    }));

    const videos = [...document.querySelectorAll('video')].map(v => ({
      src: v.src || v.querySelector('source')?.src,
      poster: v.poster,
      autoplay: v.autoplay,
      loop: v.loop,
      muted: v.muted,
    }));

    return { images, backgroundImages, svgs, links, videos };
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'ASSETS.json'),
    JSON.stringify(assets, null, 2)
  );
  console.log(`Found: ${assets.images.length} images, ${assets.backgroundImages.length} background images, ${assets.svgs.length} SVGs, ${assets.links.length} favicons`);

  // === Global Styles & CSS Variables ===
  console.log('Extracting global styles...');
  const globalStyles = await page.evaluate(() => {
    const root = document.documentElement;
    const cs = getComputedStyle(root);

    // Extract all CSS custom properties
    const customProps = {};
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            for (const prop of rule.style) {
              if (prop.startsWith('--')) {
                customProps[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    }

    return {
      rootStyles: {
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        fontFamily: cs.fontFamily,
        fontSize: cs.fontSize,
        lineHeight: cs.lineHeight,
      },
      cssVariables: customProps,
      // Check for smooth scroll
      scrollBehavior: cs.scrollBehavior,
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
    };
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'GLOBAL_STYLES.json'),
    JSON.stringify(globalStyles, null, 2)
  );
  console.log('Global styles saved');

  // === Full CSS dump of the page ===
  console.log('Extracting all stylesheet rules...');
  const allCSS = await page.evaluate(() => {
    let css = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          css += rule.cssText + '\n\n';
        }
      } catch (e) {
        const href = sheet.href;
        if (href) css += `/* Cross-origin stylesheet: ${href} */\n\n`;
      }
    }
    return css;
  });

  fs.writeFileSync(path.join(RESEARCH_DIR, 'ALL_CSS.css'), allCSS);
  console.log(`Extracted ${allCSS.length} chars of CSS`);

  // === Color Palette Extraction ===
  console.log('Extracting color palette...');
  const colors = await page.evaluate(() => {
    const colorSet = new Set();
    const elements = document.querySelectorAll('*');
    let count = 0;
    for (const el of elements) {
      if (count > 1000) break;
      const cs = getComputedStyle(el);
      if (cs.display === 'none') continue;

      const addColor = (c) => {
        if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent' && c !== 'currentColor') {
          colorSet.add(c);
        }
      };

      addColor(cs.color);
      addColor(cs.backgroundColor);
      addColor(cs.borderTopColor);
      addColor(cs.boxShadow);
      count++;
    }
    return [...colorSet];
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'COLOR_PALETTE.json'),
    JSON.stringify(colors, null, 2)
  );
  console.log(`Found ${colors.length} unique colors`);

  // === Table (viewport width) responsive screenshots ===
  console.log('Taking tablet screenshot (768px)...');
  await page.setViewportSize({ width: 768, height: 1024 });
  await sleep(2000);
  await page.screenshot({ path: path.join(DESIGN_REF_DIR, 'tablet-fullpage.png'), fullPage: true });

  // === Save raw HTML ===
  console.log('Saving raw HTML...');
  const html = await page.content();
  fs.writeFileSync(path.join(RESEARCH_DIR, 'RAW_HTML.html'), html);

  console.log('\n=== Reconnaissance Complete ===');
  console.log(`Files saved to: ${RESEARCH_DIR}`);
  console.log(`Design references saved to: ${DESIGN_REF_DIR}`);

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
