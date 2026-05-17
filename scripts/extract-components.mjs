import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TARGET_URL = 'https://www.hkengage.gov.hk/zh-HK/how-to-apply-for-a-visa';
const BASE_DIR = path.resolve(__dirname, '..');
const RESEARCH_DIR = path.join(BASE_DIR, 'docs', 'research');
const COMPONENTS_DIR = path.join(RESEARCH_DIR, 'components');
const DESIGN_REF_DIR = path.join(BASE_DIR, 'docs', 'design-references');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function extractComputedStyles(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const cs = getComputedStyle(el);
    const props = [
      'display','position','backgroundColor','color','fontFamily','fontSize','fontWeight',
      'lineHeight','letterSpacing','padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
      'margin','marginTop','marginRight','marginBottom','marginLeft',
      'width','height','maxWidth','minHeight','borderRadius','border','boxShadow',
      'flexDirection','justifyContent','alignItems','gap','zIndex','opacity',
      'overflow','overflowX','overflowY','backgroundImage','textTransform',
      'textDecoration','cursor','whiteSpace','textOverflow',
    ];
    const styles = {};
    props.forEach(p => {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto') {
        styles[p] = v;
      }
    });
    return styles;
  }, selector);
}

async function extractElementTree(page, selector, maxDepth = 5) {
  return page.evaluate(({ sel, depth }) => {
    const el = document.querySelector(sel);
    if (!el) return null;

    function walk(element, currentDepth) {
      if (currentDepth > depth) return null;
      const cs = getComputedStyle(element);
      if (cs.display === 'none' || cs.visibility === 'hidden') return null;

      const keyProps = [
        'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
        'textTransform','textDecoration','backgroundColor','background',
        'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
        'margin','marginTop','marginRight','marginBottom','marginLeft',
        'width','height','maxWidth','minWidth','maxHeight','minHeight',
        'display','flexDirection','justifyContent','alignItems','gap',
        'gridTemplateColumns','gridTemplateRows',
        'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight',
        'boxShadow','overflow','overflowX','overflowY',
        'position','top','right','bottom','left','zIndex',
        'opacity','transform','transition','cursor',
      ];

      function extractStyles(elem) {
        const c = getComputedStyle(elem);
        const s = {};
        keyProps.forEach(p => {
          const v = c[p];
          if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') {
            s[p] = v;
          }
        });
        return s;
      }

      const children = [...element.children];
      return {
        tag: element.tagName.toLowerCase(),
        classes: element.className?.toString?.()?.split(' ').slice(0, 8).join(' '),
        text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3
          ? element.textContent.trim().slice(0, 200)
          : null,
        styles: extractStyles(element),
        images: element.tagName === 'IMG' ? {
          src: element.src || element.currentSrc,
          alt: element.alt,
          width: element.naturalWidth,
          height: element.naturalHeight,
        } : null,
        childCount: children.length,
        children: children.slice(0, 30).map(c => walk(c, currentDepth + 1)).filter(Boolean),
      };
    }

    return walk(el, 0);
  }, { sel: selector, depth: maxDepth });
}

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-HK',
  });
  const page = await context.newPage();

  console.log('Navigating...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await sleep(8000);

  // Scroll to trigger lazy loading
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
  await sleep(2000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await sleep(1000);

  // =====================================================
  // SECTION EXTRACTION
  // =====================================================

  // === 1. Header/Nav ===
  console.log('Extracting Header/Nav...');
  const headerTree = await extractElementTree(page, 'header, .header, [role="banner"], nav', 6);
  const headerStyles = await extractComputedStyles(page, 'header, .header, [role="banner"]');
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'header-tree.json'), JSON.stringify(headerTree, null, 2));
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'header-styles.json'), JSON.stringify(headerStyles, null, 2));

  // === 2. Hero Banner ===
  console.log('Extracting Hero Banner...');
  const heroTree = await extractElementTree(page, 'section:first-of-type, .hero, .banner, [class*="hero"]', 6);
  const heroStyles = await extractComputedStyles(page, 'section:first-of-type, .hero, .banner');
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'hero-tree.json'), JSON.stringify(heroTree, null, 2));
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'hero-styles.json'), JSON.stringify(heroStyles, null, 2));

  // Take hero screenshot
  const heroEl = await page.$('section:first-of-type, .hero, .banner, [class*="hero"]');
  if (heroEl) {
    await heroEl.screenshot({ path: path.join(DESIGN_REF_DIR, 'hero-crop.png'), animations: 'disabled' });
  }

  // === 3. Intro Section (blue with triangles) ===
  console.log('Extracting Intro Section...');
  // Find the section with the intro text
  const introTree = await extractElementTree(page, 'section:nth-of-type(2), [class*="intro"], [class*="talent"]', 6);
  const introStyles = await extractComputedStyles(page, 'section:nth-of-type(2)');
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'intro-tree.json'), JSON.stringify(introTree, null, 2));
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'intro-styles.json'), JSON.stringify(introStyles, null, 2));

  // === 4. Visa Cards Section (the 7 cards) ===
  console.log('Extracting Visa Cards Section...');
  // Find the section containing the 7 cards
  const cardsTree = await extractElementTree(page, 'section:nth-of-type(3), [class*="scheme"], [class*="card"]', 7);
  const cardsStyles = await extractComputedStyles(page, 'section:nth-of-type(3)');
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'cards-tree.json'), JSON.stringify(cardsTree, null, 2));
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'cards-styles.json'), JSON.stringify(cardsStyles, null, 2));

  // Take cards section screenshot
  const cardsEl = await page.$('section:nth-of-type(3), [class*="scheme"]');
  if (cardsEl) {
    await cardsEl.screenshot({ path: path.join(DESIGN_REF_DIR, 'cards-section.png'), animations: 'disabled' });
  }

  // === 5. Individual Card Extraction ===
  console.log('Extracting individual cards...');
  const allCards = await page.evaluate(() => {
    // Find all card-like elements - look for numbered cards
    const cards = [];
    // Try different selectors
    const selectors = [
      '[class*="scheme-card"]', '[class*="visa-card"]', '[class*="immigration-card"]',
      'section > div > div > div',
    ];

    for (const sel of selectors) {
      const els = [...document.querySelectorAll(sel)];
      for (const el of els) {
        const text = el.textContent?.trim();
        if (text && text.length > 100 && text.includes('申請資格')) {
          const cs = getComputedStyle(el);
          if (cs.display === 'none') continue;
          cards.push({
            selector: sel,
            classes: el.className?.toString(),
            textPreview: text.slice(0, 500),
            width: cs.width,
            height: cs.height,
          });
        }
      }
      if (cards.length > 0) break;
    }
    return cards;
  });

  fs.writeFileSync(path.join(COMPONENTS_DIR, 'all-cards-info.json'), JSON.stringify(allCards, null, 2));

  // === 6. Extension Section (紫色) ===
  console.log('Extracting Extension Section...');
  const extTree = await extractElementTree(page, '[class*="extension"], [class*="stay"], section:nth-of-type(4)', 5);
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'extension-tree.json'), JSON.stringify(extTree, null, 2));

  // === 7. Handbook Section ===
  console.log('Extracting Handbook Section...');
  const handbookTree = await extractElementTree(page, '[class*="handbook"], [class*="manual"], [class*="guide"], section:nth-of-type(5)', 5);
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'handbook-tree.json'), JSON.stringify(handbookTree, null, 2));

  // === 8. FAQ Section ===
  console.log('Extracting FAQ Section...');
  const faqTree = await extractElementTree(page, '[class*="faq"], [class*="question"], section:nth-of-type(6)', 5);
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'faq-tree.json'), JSON.stringify(faqTree, null, 2));

  // === 9. Footer ===
  console.log('Extracting Footer...');
  const footerTree = await extractElementTree(page, 'footer, .footer, [role="contentinfo"]', 6);
  const footerStyles = await extractComputedStyles(page, 'footer, .footer');
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'footer-tree.json'), JSON.stringify(footerTree, null, 2));
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'footer-styles.json'), JSON.stringify(footerStyles, null, 2));

  const footerEl = await page.$('footer, .footer, [role="contentinfo"]');
  if (footerEl) {
    await footerEl.screenshot({ path: path.join(DESIGN_REF_DIR, 'footer-crop.png'), animations: 'disabled' });
  }

  // === 10. Full CSS extraction for key classes ===
  console.log('Extracting full CSS...');
  const fullCSS = await page.evaluate(() => {
    let css = '';
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          css += rule.cssText + '\n';
        }
      } catch (e) {
        // cross-origin
      }
    }
    return css;
  });
  fs.writeFileSync(path.join(RESEARCH_DIR, 'FULL_CSS.css'), fullCSS);
  console.log(`Extracted ${fullCSS.length} chars of CSS`);

  // === 11. Extract color tokens from :root ===
  console.log('Extracting color tokens...');
  const rootVars = await page.evaluate(() => {
    const vars = {};
    const style = document.documentElement.style;
    // Get all computed styles from :root
    const cs = getComputedStyle(document.documentElement);

    // Try to get CSS variables from stylesheet
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          if (rule.selectorText === ':root' || rule.selectorText === 'html') {
            for (const prop of rule.style) {
              if (prop.startsWith('--')) {
                vars[prop] = rule.style.getPropertyValue(prop).trim();
              }
            }
          }
        }
      } catch (e) {}
    }
    return vars;
  });
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'root-vars.json'), JSON.stringify(rootVars, null, 2));

  // === 12. Extract background triangle pattern ===
  console.log('Extracting triangle pattern...');
  const triangleInfo = await page.evaluate(() => {
    // Find the triangle pattern background
    const els = [...document.querySelectorAll('*')].filter(el => {
      const bg = getComputedStyle(el).backgroundImage;
      return bg && bg.includes('url') && (bg.includes('triangle') || bg.includes('pattern'));
    });

    return els.map(el => ({
      url: getComputedStyle(el).backgroundImage,
      classes: el.className?.toString()?.slice(0, 200),
      tag: el.tagName,
      position: getComputedStyle(el).position,
    }));
  });
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'triangle-pattern.json'), JSON.stringify(triangleInfo, null, 2));

  // === 13. Extract all images with their contexts ===
  console.log('Extracting images with contexts...');
  const imagesWithContext = await page.evaluate(() => {
    return [...document.querySelectorAll('img')].map(img => {
      const parent = img.parentElement;
      const grandParent = parent?.parentElement;
      return {
        src: img.src || img.currentSrc,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        parentClasses: parent?.className?.toString()?.slice(0, 200),
        parentTag: parent?.tagName,
        grandParentClasses: grandParent?.className?.toString()?.slice(0, 200),
        computedStyle: {
          width: getComputedStyle(img).width,
          height: getComputedStyle(img).height,
          objectFit: getComputedStyle(img).objectFit,
          borderRadius: getComputedStyle(img).borderRadius,
          position: getComputedStyle(img).position,
        }
      };
    }).filter(img => img.src && !img.src.includes('data:'));
  });
  fs.writeFileSync(path.join(COMPONENTS_DIR, 'images-with-context.json'), JSON.stringify(imagesWithContext, null, 2));

  console.log('\n=== Detailed Extraction Complete ===');
  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
