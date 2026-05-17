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

  // === Find and extract iframe content ===
  console.log('Looking for iframes...');
  const iframes = await page.evaluate(() => {
    return [...document.querySelectorAll('iframe')].map(iframe => ({
      src: iframe.src,
      id: iframe.id,
      className: iframe.className,
      width: iframe.width,
      height: iframe.height,
    }));
  });
  console.log('Found iframes:', JSON.stringify(iframes, null, 2));

  // === Extract page structure from the actual content ===
  // The page seems to load content via JavaScript, let's get all visible text
  console.log('Extracting visible page structure...');
  const pageStructure = await page.evaluate(() => {
    function getAllVisibleSections() {
      const sections = [];

      // Look for all section-like elements with significant content
      const candidates = [
        ...document.querySelectorAll('section, article, [role="region"], main, .page-content, .content, .container, .wrapper'),
        ...document.querySelectorAll('div[class*="section"], div[class*="block"], div[class*="content"], div[class*="page"]'),
      ];

      // Deduplicate by getting unique elements
      const unique = [...new Set(candidates)];

      for (const el of unique) {
        const cs = getComputedStyle(el);
        const text = el.textContent?.trim();
        if (!text || text.length < 20) continue;
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;

        sections.push({
          tag: el.tagName.toLowerCase(),
          id: el.id,
          classes: el.className?.toString?.()?.slice(0, 300),
          textPreview: text.slice(0, 500),
          children: [...el.children].map(c => ({
            tag: c.tagName.toLowerCase(),
            classes: c.className?.toString?.()?.slice(0, 200),
            textPreview: c.textContent?.trim()?.slice(0, 200),
          })),
        });
      }
      return sections;
    }

    return {
      sections: getAllVisibleSections(),
      url: window.location.href,
      title: document.title,
    };
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'PAGE_STRUCTURE.json'),
    JSON.stringify(pageStructure, null, 2)
  );

  // === Get ALL text content from the page ===
  console.log('Extracting all text content...');
  const allText = await page.evaluate(() => {
    // Get text from all visible elements, grouped by their containers
    const body = document.body;
    const textNodes = [];

    function walkText(element, depth = 0) {
      if (depth > 6) return;
      for (const child of element.childNodes) {
        if (child.nodeType === 3) { // Text node
          const text = child.textContent.trim();
          if (text) {
            textNodes.push({ text, depth });
          }
        } else if (child.nodeType === 1) { // Element node
          const cs = getComputedStyle(child);
          if (cs.display !== 'none' && cs.visibility !== 'hidden') {
            walkText(child, depth + 1);
          }
        }
      }
    }

    walkText(body);
    return textNodes.map(t => t.text).filter((v, i, a) => a.indexOf(v) === i); // unique
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'ALL_TEXT.json'),
    JSON.stringify(allText, null, 2)
  );
  console.log(`Found ${allText.length} unique text strings`);

  // === Try to get content from iframes directly ===
  for (const iframe of iframes) {
    console.log('Checking iframe:', iframe.src);
    if (iframe.src && iframe.src.startsWith('http')) {
      try {
        const frame = page.frame({ url: iframe.src });
        if (frame) {
          const content = await frame.content();
          fs.writeFileSync(
            path.join(RESEARCH_DIR, `IFRAME_${iframe.id || 'unknown'}.html`),
            content
          );
          console.log(`Saved iframe content for ${iframe.id || iframe.src}`);
        }
      } catch (e) {
        console.log('Could not access iframe:', e.message);
      }
    }
  }

  // === Get computed styles for specific elements ===
  console.log('Extracting computed styles for key elements...');
  const keyElements = await page.evaluate(() => {
    const elements = {};

    // Header/Nav
    const header = document.querySelector('header, nav, .header, .nav, [role="navigation"]');
    if (header) {
      elements.header = {
        html: header.outerHTML.slice(0, 3000),
        computed: Object.fromEntries(
          ['display', 'position', 'backgroundColor', 'color', 'fontFamily', 'fontSize', 'padding', 'margin', 'width', 'height', 'zIndex', 'boxShadow', 'borderBottom']
            .map(prop => [prop, getComputedStyle(header)[prop]])
        ),
      };
    }

    // Footer
    const footer = document.querySelector('footer, .footer, [role="contentinfo"]');
    if (footer) {
      elements.footer = {
        html: footer.outerHTML.slice(0, 3000),
        computed: Object.fromEntries(
          ['display', 'position', 'backgroundColor', 'color', 'fontFamily', 'fontSize', 'padding', 'margin', 'width']
            .map(prop => [prop, getComputedStyle(footer)[prop]])
        ),
      };
    }

    // Hero/banner section
    const hero = document.querySelector('.hero, .banner, [class*="hero"], [class*="banner"], header, section:first-of-type');
    if (hero) {
      elements.hero = {
        html: hero.outerHTML.slice(0, 3000),
        computed: Object.fromEntries(
          ['display', 'position', 'backgroundColor', 'backgroundImage', 'color', 'fontFamily', 'fontSize', 'padding', 'margin', 'minHeight', 'height']
            .map(prop => [prop, getComputedStyle(hero)[prop]])
        ),
      };
    }

    return elements;
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'KEY_ELEMENTS.json'),
    JSON.stringify(keyElements, null, 2)
  );

  // === Take focused screenshots ===
  console.log('Taking section-specific screenshots...');
  await page.setViewportSize({ width: 1440, height: 900 });
  await sleep(1000);

  // Hero section screenshot
  const heroEl = await page.$('.hero, .banner, [class*="hero"], [class*="banner"], header, section:first-of-type');
  if (heroEl) {
    await heroEl.screenshot({ path: path.join(DESIGN_REF_DIR, 'hero-section.png') });
    console.log('Hero screenshot saved');
  }

  // Footer screenshot
  const footerEl = await page.$('footer, .footer, [role="contentinfo"]');
  if (footerEl) {
    await footerEl.screenshot({ path: path.join(DESIGN_REF_DIR, 'footer-section.png') });
    console.log('Footer screenshot saved');
  }

  // === Extract navigation items ===
  console.log('Extracting navigation...');
  const navItems = await page.evaluate(() => {
    const nav = document.querySelector('nav, .nav, .navigation, [role="navigation"], header');
    if (!nav) return [];

    const links = [...nav.querySelectorAll('a')];
    return links.map(link => ({
      text: link.textContent?.trim(),
      href: link.href,
      classes: link.className,
    }));
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'NAVIGATION.json'),
    JSON.stringify(navItems, null, 2)
  );
  console.log(`Found ${navItems.length} nav items`);

  // === Get all CSS for key selectors ===
  console.log('Extracting specific CSS rules...');
  const specificCSS = await page.evaluate(() => {
    const selectors = [
      '.hkengage-header', '.header', 'header',
      '.hkengage-footer', '.footer', 'footer',
      '.hero', '.banner',
      '.nav', 'nav',
      '.container', '.wrapper',
      'body', 'html',
    ];

    let css = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (selectors.some(sel => rule.selectorText?.includes(sel))) {
            css += rule.cssText + '\n\n';
          }
        }
      } catch (e) {
        // Cross-origin, skip
      }
    }
    return css;
  });

  fs.writeFileSync(path.join(RESEARCH_DIR, 'SPECIFIC_CSS.css'), specificCSS);

  console.log('\n=== Extended Reconnaissance Complete ===');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
