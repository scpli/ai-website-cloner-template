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
    fonts: [], // Skip font loading
  });
  const page = await context.newPage();

  console.log('Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for content to render - look for common indicators
  console.log('Waiting for JS content to render...');
  await sleep(10000); // Wait 10 seconds for JS to render

  // Check if we can find any content sections now
  const contentCheck = await page.evaluate(() => {
    const allText = document.body.textContent;
    const sections = document.querySelectorAll('section, article, main, .content, .page, [class*="section"], [class*="content"], [class*="page"]');
    const divs = document.querySelectorAll('div');

    return {
      bodyTextLength: allText.length,
      bodyTextPreview: allText.slice(0, 500),
      sectionCount: sections.length,
      divCount: divs.length,
      hasMainContent: !!document.querySelector('main'),
      bodyHTML: document.body.innerHTML.slice(0, 5000),
    };
  });

  console.log('Content check:', contentCheck.bodyTextPreview);
  console.log('Section count:', contentCheck.sectionCount);

  // Try to scroll to bottom to trigger any lazy loading
  console.log('Scrolling to bottom to trigger lazy load...');
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 200;
      const timer = setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve(true);
        }
      }, 100);
    });
  });
  await sleep(3000);

  // Now extract everything
  console.log('Extracting full page content after scroll...');

  // === Full page screenshot ===
  await page.screenshot({
    path: path.join(DESIGN_REF_DIR, 'desktop-after-js-fullpage.png'),
    fullPage: true,
    animations: 'disabled',
  });

  // === Extract complete page structure ===
  const fullStructure = await page.evaluate(() => {
    // Find the main content wrapper - look for the largest content div
    const allDivs = [...document.querySelectorAll('div')];
    const contentDivs = allDivs.filter(div => {
      const text = div.textContent?.trim();
      return text && text.length > 100;
    });

    // Sort by text length to find the main content area
    contentDivs.sort((a, b) => b.textContent.length - a.textContent.length);

    const mainContent = contentDivs[0];
    if (!mainContent) return { error: 'No main content found' };

    function extractTree(element, maxDepth = 8, currentDepth = 0) {
      if (currentDepth > maxDepth) return null;
      const cs = getComputedStyle(element);
      if (cs.display === 'none' || cs.visibility === 'hidden') return null;

      const children = [];
      for (const child of element.children) {
        const extracted = extractTree(child, maxDepth, currentDepth + 1);
        if (extracted) children.push(extracted);
      }

      return {
        tag: element.tagName.toLowerCase(),
        id: element.id,
        classes: element.className?.toString?.()?.split(' ').slice(0, 8).join(' '),
        text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3
          ? element.textContent.trim().slice(0, 300)
          : null,
        styles: {
          display: cs.display,
          position: cs.position,
          backgroundColor: cs.backgroundColor,
          color: cs.color,
          fontFamily: cs.fontFamily,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          lineHeight: cs.lineHeight,
          padding: cs.padding,
          margin: cs.margin,
          width: cs.width,
          height: cs.height,
          borderRadius: cs.borderRadius,
          boxShadow: cs.boxShadow,
          gap: cs.gap,
          flexDirection: cs.flexDirection,
          justifyContent: cs.justifyContent,
          alignItems: cs.alignItems,
          zIndex: cs.zIndex,
        },
        children: children.length > 0 ? children : undefined,
        childCount: element.children.length,
      };
    }

    return {
      url: window.location.href,
      title: document.title,
      mainContent: extractTree(mainContent),
      totalTextLength: document.body.textContent.length,
    };
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'FULL_STRUCTURE.json'),
    JSON.stringify(fullStructure, null, 2)
  );

  // === Extract all text ===
  const allText = await page.evaluate(() => {
    return document.body.textContent.trim();
  });

  fs.writeFileSync(path.join(RESEARCH_DIR, 'FULL_TEXT.txt'), allText);
  console.log('Full text length:', allText.length);

  // === Extract all images ===
  const allImages = await page.evaluate(() => {
    return [...document.querySelectorAll('img')].map(img => ({
      src: img.src || img.currentSrc,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
    })).filter(img => img.src && !img.src.includes('data:'));
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'ALL_IMAGES.json'),
    JSON.stringify(allImages, null, 2)
  );
  console.log(`Found ${allImages.length} images`);

  // === Extract all SVGs ===
  const allSVGs = await page.evaluate(() => {
    return [...document.querySelectorAll('svg')].map((svg, i) => ({
      index: i,
      parentInfo: svg.parentElement?.tagName + '.' + svg.parentElement?.className?.toString()?.slice(0, 100),
      viewBox: svg.getAttribute('viewBox'),
      outerHTML: svg.outerHTML?.slice(0, 1500),
    }));
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'ALL_SVGS.json'),
    JSON.stringify(allSVGs, null, 2)
  );
  console.log(`Found ${allSVGs.length} SVGs`);

  // === Extract background images ===
  const bgImages = await page.evaluate(() => {
    return [...document.querySelectorAll('*')].filter(el => {
      const bg = getComputedStyle(el).backgroundImage;
      return bg && bg !== 'none' && bg.includes('url');
    }).map(el => ({
      url: getComputedStyle(el).backgroundImage,
      tag: el.tagName,
      classes: el.className?.toString()?.slice(0, 200),
      id: el.id,
    }));
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'BACKGROUND_IMAGES.json'),
    JSON.stringify(bgImages, null, 2)
  );
  console.log(`Found ${bgImages.length} background images`);

  // === Extract navigation ===
  const navData = await page.evaluate(() => {
    const navs = document.querySelectorAll('nav, .nav, [role="navigation"], header');
    const navItems = [];
    navs.forEach(nav => {
      const links = [...nav.querySelectorAll('a')];
      links.forEach(link => {
        navItems.push({
          text: link.textContent?.trim(),
          href: link.href,
          classes: link.className,
        });
      });
    });
    return navItems;
  });

  fs.writeFileSync(
    path.join(RESEARCH_DIR, 'NAV_ITEMS.json'),
    JSON.stringify(navData, null, 2)
  );

  // === Take mobile screenshot ===
  console.log('Taking mobile screenshots...');
  await page.setViewportSize({ width: 390, height: 844 });
  await sleep(3000);
  await page.screenshot({
    path: path.join(DESIGN_REF_DIR, 'mobile-after-js-fullpage.png'),
    fullPage: true,
    animations: 'disabled',
  });

  // Tablet
  await page.setViewportSize({ width: 768, height: 1024 });
  await sleep(2000);
  await page.screenshot({
    path: path.join(DESIGN_REF_DIR, 'tablet-after-js-fullpage.png'),
    fullPage: true,
    animations: 'disabled',
  });

  // Reset to desktop
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('\n=== Full Reconnaissance Complete ===');
  console.log('Files generated:');
  console.log('- FULL_STRUCTURE.json: Complete page DOM tree');
  console.log('- FULL_TEXT.txt: All page text content');
  console.log('- ALL_IMAGES.json: All image assets');
  console.log('- ALL_SVGS.json: All SVG icons');
  console.log('- BACKGROUND_IMAGES.json: CSS background images');
  console.log('- NAV_ITEMS.json: Navigation items');

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
