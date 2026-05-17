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

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  console.log('=== Filter Panel Investigation Script ===\n');

  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: 'zh-HK',
  });
  const page = await context.newPage();

  // Track network requests to detect AJAX/fetch calls after clicking
  const networkRequests = [];
  page.on('request', (req) => {
    networkRequests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      timestamp: Date.now(),
    });
  });

  console.log('1. Navigating to', TARGET_URL);
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('   Waiting for initial page stabilization...');
  await sleep(5000);

  // === Step 1: Find the filter button ===
  console.log('\n2. Looking for the green filter button...');
  const networkBeforeClick = networkRequests.length;

  // Try multiple selectors
  const selectors = [
    '#visa_filter_button',
    'button:has-text("尋找適合你的入境計劃")',
    '[id*="filter"]',
    'a:has-text("尋找適合你的入境計劃")',
    'button:has-text("filter")',
    '[wire\\:click*="triggerOpen"]',
    'button[class*="filter"]',
  ];

  let filterButton = null;
  let usedSelector = null;

  for (const sel of selectors) {
    try {
      filterButton = await page.$(sel);
      if (filterButton) {
        usedSelector = sel;
        console.log(`   Found button with selector: ${sel}`);
        break;
      }
    } catch (e) {
      // Skip invalid selectors
    }
  }

  if (!filterButton) {
    // Try to find any element containing the text
    console.log('   Searching for any element containing the button text...');
    const textElement = await page.locator('*:has-text("尋找適合你的入境計劃")').first();
    const count = await textElement.count();
    if (count > 0) {
      filterButton = textElement;
      usedSelector = '*:has-text("尋找適合你的入境計劃")';
      console.log('   Found element by text content');
    }
  }

  // If still not found, dump all buttons and links for debugging
  if (!filterButton) {
    console.log('   Button not found directly. Dumping all buttons and clickable elements...');
    const clickableElements = await page.evaluate(() => {
      const elements = [...document.querySelectorAll('button, a, [role="button"], [onclick], [wire\\:click]')];
      return elements.filter(el => {
        const text = el.textContent?.trim() || '';
        return text.length > 0 && text.length < 200;
      }).map(el => ({
        tag: el.tagName,
        id: el.id,
        classes: el.className?.toString()?.slice(0, 150),
        text: el.textContent?.trim()?.slice(0, 100),
        wireClick: el.getAttribute('wire:click'),
        onclick: el.getAttribute('onclick'),
      }));
    });
    console.log('   Clickable elements found:', clickableElements.length);
    console.log('   Elements with interesting text (containing "filter", "入境", "計劃"):');
    clickableElements
      .filter(el =>
        el.text?.includes('filter') ||
        el.text?.includes('入境') ||
        el.text?.includes('計劃') ||
        el.text?.includes('適合')
      )
      .forEach(el => console.log('   -', JSON.stringify(el)));
  }

  // === Step 2: Take before screenshot ===
  console.log('\n3. Taking before-click screenshot...');
  await page.screenshot({
    path: path.join(DESIGN_REF_DIR, 'filter-panel-before.png'),
    fullPage: false,
  });
  console.log('   Saved to docs/design-references/filter-panel-before.png');

  // === Step 3: Click the button ===
  if (filterButton) {
    console.log('\n4. Clicking the filter button...');
    try {
      // Wait for any network activity to settle first
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Clear network log to track post-click requests
      networkRequests.length = 0;

      // Click with force option in case of Livewire interference
      await filterButton.click({ force: true });
      console.log('   Button clicked successfully');
    } catch (e) {
      console.log('   Error clicking button:', e.message);
      // Try JavaScript click as fallback
      try {
        await filterButton.evaluate(el => el.click());
        console.log('   Fallback JS click succeeded');
      } catch (e2) {
        console.log('   Fallback click also failed:', e2.message);
      }
    }

    // === Step 4: Wait for animations and network ===
    console.log('\n5. Waiting for animations/network to settle (3 seconds)...');
    await sleep(3000);

    // Also wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
      console.log('   Note: networkidle timeout reached (some requests still loading)');
    });

    // Track what network requests happened after click
    console.log(`   Network requests after click: ${networkRequests.length}`);
    const ajaxRequests = networkRequests.filter(r =>
      r.resourceType === 'xhr' || r.resourceType === 'fetch' || r.resourceType === 'websocket'
    );
    if (ajaxRequests.length > 0) {
      console.log('   AJAX/Fetch requests detected:');
      ajaxRequests.forEach(r => console.log(`     - ${r.method} ${r.url}`));
    }

    // === Step 5: Take after screenshot ===
    console.log('\n6. Taking after-click screenshot...');
    await page.screenshot({
      path: path.join(DESIGN_REF_DIR, 'filter-panel-after.png'),
      fullPage: false,
    });
    console.log('   Saved to docs/design-references/filter-panel-after.png');

    // === Step 6: Find the filter panel/modal ===
    console.log('\n7. Searching for filter panel/modal/overlay...');

    // Look for common panel/modal patterns
    const panelInfo = await page.evaluate(() => {
      const results = {
        modals: [],
        overlays: [],
        drawers: [],
        dropdowns: [],
        filterPanels: [],
        newlyVisibleElements: [],
        livewireComponents: [],
      };

      // Check for elements that might be the filter panel
      const checkSelectors = [
        '[id*="filter"]',
        '[id*="modal"]',
        '[id*="overlay"]',
        '[id*="panel"]',
        '[id*="dialog"]',
        '[id*="drawer"]',
        '[class*="modal"]',
        '[class*="overlay"]',
        '[class*="panel"]',
        '[class*="dialog"]',
        '[class*="drawer"]',
        '[class*="filter"]',
        '[role="dialog"]',
        '[role="modal"]',
        '[wire\\:ignore.self]',
        '[x-data]', // Alpine.js
      ];

      for (const sel of checkSelectors) {
        try {
          const elements = [...document.querySelectorAll(sel)];
          for (const el of elements) {
            const cs = getComputedStyle(el);
            if (cs.display !== 'none' && cs.visibility !== 'hidden') {
              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                results.newlyVisibleElements.push({
                  selector: sel,
                  tag: el.tagName,
                  id: el.id,
                  classes: el.className?.toString()?.slice(0, 200),
                  rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                  computedStyles: {
                    display: cs.display,
                    position: cs.position,
                    top: cs.top,
                    right: cs.right,
                    bottom: cs.bottom,
                    left: cs.left,
                    width: cs.width,
                    height: cs.height,
                    zIndex: cs.zIndex,
                    backgroundColor: cs.backgroundColor,
                    opacity: cs.opacity,
                    transform: cs.transform,
                    boxShadow: cs.boxShadow,
                    borderRadius: cs.borderRadius,
                    overflow: cs.overflow,
                  },
                  outerHTML: el.outerHTML?.slice(0, 5000),
                  textContent: el.textContent?.trim()?.slice(0, 2000),
                });
              }
            }
          }
        } catch (e) { /* skip */ }
      }

      // Check for Livewire components
      const livewireEls = [...document.querySelectorAll('[wire\\:id], [livewire]')];
      results.livewireComponents = livewireEls.map(el => ({
        tag: el.tagName,
        id: el.id,
        wireId: el.getAttribute('wire:id'),
        classes: el.className?.toString()?.slice(0, 200),
      }));

      // Check for any element with fixed/absolute position that is now visible
      const allElements = [...document.querySelectorAll('*')];
      const floatingElements = [];
      let checked = 0;
      for (const el of allElements) {
        if (checked > 2000) break;
        checked++;
        try {
          const cs = getComputedStyle(el);
          if ((cs.position === 'fixed' || cs.position === 'absolute') &&
              cs.display !== 'none' && cs.visibility !== 'hidden') {
            const rect = el.getBoundingClientRect();
            if (rect.width > 100 && rect.height > 100) {
              floatingElements.push({
                tag: el.tagName,
                id: el.id,
                classes: el.className?.toString()?.slice(0, 200),
                position: cs.position,
                zIndex: cs.zIndex,
                rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
                backgroundColor: cs.backgroundColor,
              });
            }
          }
        } catch (e) { /* skip */ }
      }
      results.floatingElements = floatingElements;

      // Check for any open dropdowns/popovers
      const openPopovers = [...document.querySelectorAll('[popover], [data-state="open"], [aria-expanded="true"]')];
      results.openPopovers = openPopovers.map(el => ({
        tag: el.tagName,
        id: el.id,
        classes: el.className?.toString()?.slice(0, 200),
        ariaExpanded: el.getAttribute('aria-expanded'),
        dataState: el.getAttribute('data-state'),
      }));

      return results;
    });

    // === Step 7: Deep extraction of the filter panel ===
    let filterPanelHTML = null;
    let filterPanelStyles = null;
    let filterPanelText = null;
    let filterPanelFormElements = null;

    if (panelInfo.newlyVisibleElements.length > 0) {
      // The first matching element is likely the panel
      const panel = panelInfo.newlyVisibleElements[0];
      filterPanelHTML = panel.outerHTML;
      filterPanelStyles = panel.computedStyles;
      filterPanelText = panel.textContent;
    }

    // Extract form elements specifically
    if (filterPanelHTML) {
      filterPanelFormElements = await page.evaluate(() => {
        // Find the most specific container that looks like the filter panel
        const candidates = [...document.querySelectorAll('[id*="filter"], [id*="modal"], [class*="modal"], [class*="panel"], [class*="filter"]')];
        const visible = candidates.filter(el => {
          const cs = getComputedStyle(el);
          return cs.display !== 'none' && cs.visibility !== 'hidden';
        });
        const container = visible[0] || document.body;

        const forms = [...container.querySelectorAll('form, input, select, textarea, button, [role="checkbox"], [role="radio"], [role="slider"], [role="combobox"]')];
        return forms.map(el => ({
          tag: el.tagName.toLowerCase(),
          type: el.type || el.getAttribute('type'),
          name: el.name,
          id: el.id,
          value: el.value,
          placeholder: el.placeholder,
          checked: el.checked,
          disabled: el.disabled,
          required: el.required,
          ariaLabel: el.getAttribute('aria-label'),
          ariaExpanded: el.getAttribute('aria-expanded'),
          text: el.textContent?.trim()?.slice(0, 100),
          classes: el.className?.toString()?.slice(0, 200),
          wireModel: el.getAttribute('wire:model'),
          wireClick: el.getAttribute('wire:click'),
        }));
      });
    }

    // === Step 8: Also extract full DOM snapshot of anything filter-related ===
    console.log('\n8. Extracting full DOM snapshot of filter-related elements...');
    const fullFilterDOM = await page.evaluate(() => {
      // Get the body's child elements that are related to filters
      const bodyChildren = [...document.body.children];
      const relevant = [];

      for (const child of bodyChildren) {
        const html = child.outerHTML || '';
        if (html.includes('filter') || html.includes('Filter') || html.includes('visa') ||
            html.includes('modal') || html.includes('overlay') || html.includes('dialog')) {
          relevant.push({
            tagName: child.tagName,
            id: child.id,
            classes: child.className?.toString()?.slice(0, 200),
            htmlPreview: html.slice(0, 10000),
          });
        }
      }

      // Also check for elements appended directly to body (modals often do this)
      const bodyModals = [...document.querySelectorAll('body > div')].filter(el => {
        const cs = getComputedStyle(el);
        return (cs.position === 'fixed' || cs.zIndex === 'auto' || parseInt(cs.zIndex) > 100) &&
               cs.display !== 'none';
      });

      return {
        bodyChildrenWithFilterContent: relevant,
        directBodyModals: bodyModals.map(el => ({
          id: el.id,
          classes: el.className?.toString()?.slice(0, 200),
          position: getComputedStyle(el).position,
          zIndex: getComputedStyle(el).zIndex,
          html: el.outerHTML?.slice(0, 10000),
        })),
      };
    });

    // === Step 9: Compile results and save ===
    console.log('\n9. Saving findings...');

    const report = {
      timestamp: new Date().toISOString(),
      url: TARGET_URL,
      buttonDetection: {
        found: !!filterButton,
        usedSelector,
        selectorsTried: selectors,
      },
      networkActivity: {
        requestsAfterClick: networkRequests.length,
        ajaxRequests: ajaxRequests,
      },
      panelDetection: {
        newlyVisibleElements: panelInfo.newlyVisibleElements.length,
        floatingElements: panelInfo.floatingElements.length,
        openPopovers: panelInfo.openPopovers.length,
        livewireComponents: panelInfo.livewireComponents.length,
      },
      filterPanelHTML,
      filterPanelStyles,
      filterPanelText,
      filterPanelFormElements,
      fullFilterDOM,
      panelInfo,
    };

    // Save JSON data
    const jsonDataPath = path.join(COMPONENTS_DIR, 'visa-filter-panel.json');
    fs.writeFileSync(jsonDataPath, JSON.stringify(report, null, 2));
    console.log(`   JSON data saved to: ${jsonDataPath}`);

    // === Step 10: Generate the spec.md file ===
    const specContent = generateSpecMD(report);
    const specPath = path.join(COMPONENTS_DIR, 'visa-filter-panel.spec.md');
    fs.writeFileSync(specPath, specContent);
    console.log(`   Spec file saved to: ${specPath}`);

  } else {
    console.log('\n*** WARNING: Filter button was not found. Saving debug info. ***');

    // Still save what we found
    const debugInfo = await page.evaluate(() => {
      const allButtons = [...document.querySelectorAll('button')];
      const allLinks = [...document.querySelectorAll('a')];
      const allWithWireClick = [...document.querySelectorAll('[wire\\:click]')];

      return {
        buttons: allButtons.map(el => ({
          id: el.id,
          text: el.textContent?.trim()?.slice(0, 100),
          classes: el.className?.toString()?.slice(0, 200),
          wireClick: el.getAttribute('wire:click'),
        })),
        links: allLinks.map(el => ({
          id: el.id,
          href: el.href,
          text: el.textContent?.trim()?.slice(0, 100),
          classes: el.className?.toString()?.slice(0, 200),
        })),
        wireClickElements: allWithWireClick.map(el => ({
          tag: el.tagName,
          id: el.id,
          wireClick: el.getAttribute('wire:click'),
          text: el.textContent?.trim()?.slice(0, 100),
          classes: el.className?.toString()?.slice(0, 200),
        })),
        fullBodyHTML: document.body.outerHTML?.slice(0, 50000),
      };
    });

    const debugPath = path.join(COMPONENTS_DIR, 'visa-filter-panel-debug.json');
    fs.writeFileSync(debugPath, JSON.stringify(debugInfo, null, 2));
    console.log(`   Debug info saved to: ${debugPath}`);
  }

  console.log('\n=== Filter Panel Investigation Complete ===');
  await browser.close();
}

function generateSpecMD(report) {
  const sections = [];

  sections.push(`# Visa Filter Panel - Specification

Generated: ${report.timestamp}
Target URL: ${report.url}

## Button Detection

- **Found**: ${report.buttonDetection.found ? 'Yes' : 'No'}
- **Selector used**: \`${report.buttonDetection.usedSelector || 'N/A'}\`
- **Selectors attempted**:
${report.buttonDetection.selectorsTried.map(s => `  - \`${s}\``).join('\n')}

## Network Activity

- **Total requests after click**: ${report.networkActivity.requestsAfterClick}
- **AJAX/Fetch requests**: ${report.networkActivity.ajaxRequests.length}
${report.networkActivity.ajaxRequests.map(r => `  - ${r.method} ${r.url}`).join('\n') || '  (none detected)'}

## Panel Detection Summary

- **Newly visible elements matching filter selectors**: ${report.panelDetection.newlyVisibleElements}
- **Floating/fixed positioned elements**: ${report.panelDetection.floatingElements}
- **Open popovers/dialogs**: ${report.panelDetection.openPopovers}
- **Livewire components on page**: ${report.panelDetection.livewireComponents}
`);

  if (report.filterPanelHTML) {
    sections.push(`## Filter Panel HTML

\`\`\`html
${report.filterPanelHTML}
\`\`\`
`);
  }

  if (report.filterPanelStyles) {
    sections.push(`## Computed Styles

| Property | Value |
|----------|-------|
${Object.entries(report.filterPanelStyles).map(([k, v]) => `| ${k} | ${v} |`).join('\n')}
`);
  }

  if (report.filterPanelText) {
    sections.push(`## Text Content

\`\`\`
${report.filterPanelText}
\`\`\`
`);
  }

  if (report.filterPanelFormElements && report.filterPanelFormElements.length > 0) {
    sections.push(`## Form Elements

| Tag | Type | Name | ID | Placeholder | Aria-Label | Wire-Model | Classes |
|-----|------|------|----|-------------|------------|------------|---------|
${report.filterPanelFormElements.map(el =>
  `| ${el.tag} | ${el.type || '-'} | ${el.name || '-'} | ${el.id || '-'} | ${el.placeholder || '-'} | ${el.ariaLabel || '-'} | ${el.wireModel || '-'} | \`${el.classes?.slice(0, 50) || '-'}\``
).join('\n')}
`);
  }

  if (report.panelInfo?.newlyVisibleElements?.length > 0) {
    sections.push(`## All Newly Visible Elements (${report.panelInfo.newlyVisibleElements.length})

${report.panelInfo.newlyVisibleElements.map((el, i) => `### Element ${i + 1}

- **Selector**: \`${el.selector}\`
- **Tag**: ${el.tag}
- **ID**: ${el.id || '(none)'}
- **Classes**: \`${el.classes}\`
- **Bounding Rect**: x=${el.rect.x}, y=${el.rect.y}, w=${el.rect.width}, h=${el.rect.height}
- **Position**: ${el.computedStyles.position}
- **Z-Index**: ${el.computedStyles.zIndex}
- **Background**: ${el.computedStyles.backgroundColor}
- **Opacity**: ${el.computedStyles.opacity}
- **Transform**: ${el.computedStyles.transform}
- **Box Shadow**: ${el.computedStyles.boxShadow}
- **Border Radius**: ${el.computedStyles.borderRadius}

#### Full Computed Styles
\`\`\`json
${JSON.stringify(el.computedStyles, null, 2)}
\`\`\`

#### Text Content
\`\`\`
${el.textContent?.slice(0, 3000)}
\`\`\`
`).join('\n')}
`);
  }

  if (report.panelInfo?.floatingElements?.length > 0) {
    sections.push(`## Floating Elements (position: fixed/absolute)

${report.panelInfo.floatingElements.map((el, i) => `### Floating Element ${i + 1}
- **Tag**: ${el.tag}, **ID**: ${el.id || '(none)'}
- **Position**: ${el.position}, **Z-Index**: ${el.zIndex}
- **Rect**: x=${el.rect.x}, y=${el.rect.y}, w=${el.rect.width}, h=${el.rect.height}
- **Background**: ${el.backgroundColor}
- **Classes**: \`${el.classes}\`
`).join('\n')}
`);
  }

  if (report.panelInfo?.openPopovers?.length > 0) {
    sections.push(`## Open Popovers/Dialogs

${report.panelInfo.openPopovers.map((el, i) => `### Popover ${i + 1}
- **Tag**: ${el.tag}, **ID**: ${el.id || '(none)'}
- **aria-expanded**: ${el.ariaExpanded}
- **data-state**: ${el.dataState}
- **Classes**: \`${el.classes}\`
`).join('\n')}
`);
  }

  if (report.fullFilterDOM) {
    sections.push(`## Full DOM Context

### Body Children with Filter-Related Content
${report.fullFilterDOM.bodyChildrenWithFilterContent.map((el, i) => `
#### Body Child ${i + 1}: <${el.tagName}>
- **ID**: ${el.id || '(none)'}
- **Classes**: \`${el.classes}\`
\`\`\`html
${el.htmlPreview}
\`\`\`
`).join('\n')}

### Direct Body Modals
${report.fullFilterDOM.directBodyModals.map((el, i) => `
#### Modal ${i + 1}
- **ID**: ${el.id || '(none)'}
- **Position**: ${el.position}, **Z-Index**: ${el.zIndex}
- **Classes**: \`${el.classes}\`
\`\`\`html
${el.html?.slice(0, 5000)}
\`\`\`
`).join('\n') || '(none detected)'}
`);
  }

  if (!report.filterPanelHTML) {
    sections.push(`## No Filter Panel Detected

The filter panel was not detected after clicking the button. This could mean:
1. The panel uses Livewire dynamic rendering that wasn't captured
2. The panel loaded via JavaScript after a delay longer than our wait time
3. The button click didn't trigger the expected behavior in headless mode
4. The panel might be rendered inside an iframe or shadow DOM

Check the screenshots at:
- \`docs/design-references/filter-panel-before.png\`
- \`docs/design-references/filter-panel-after.png\`

Also check the debug JSON at:
- \`docs/research/components/visa-filter-panel-debug.json\` (if button not found)
- \`docs/research/components/visa-filter-panel.json\` (full data)
`);
  }

  return sections.join('\n---\n\n');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
