# Visa Filter Panel (入境计划配对工具) - Complete Specification

> **Source**: https://www.hkengage.gov.hk/zh-HK/how-to-apply-for-a-visa
> **Generated**: 2026-05-15
> **Trigger**: Green floating button `#visa_filter_button` at bottom-left of page

---

## 1. Overview

The "filter panel" on this site is **not a modal or overlay**. It is an **inline Livewire + Alpine.js component** called "入境计划配对工具" (Visa Scheme Matching Tool) that is embedded in the page content. The green floating button `#visa_filter_button` triggers a Livewire state change (`wire:click="triggerOpen"`) that shows/hides this questionnaire section.

### Key Finding

The questionnaire is already rendered in the DOM. Clicking the button sends a Livewire update request (`POST /zh-HK/livewire/update`) which toggles the `opened` state of a Livewire component (`wire:id="pui7qq3CEKN2qrwYze5n"`), making the questionnaire visible.

---

## 2. Trigger Button

| Property | Value |
|----------|-------|
| **ID** | `visa_filter_button` |
| **Type** | `<button>` |
| **Text** | "寻找适合你的人才入境计划" (Find the talent immigration plan that suits you) |
| **Position** | Fixed, bottom-left corner of viewport |
| **Wire:click** | `triggerOpen` |
| **Behavior** | Triggers Livewire component to show the matching tool questionnaire |
| **Color** | Green (appears as a floating action button) |
| **Additional** | Has a small icon (appears to be a user/group icon) |

### Floating Button Container

The button sits inside a fixed-position container at the bottom of the page:

```html
<!-- Container: fixed bottom-0 left-0, z-40 -->
<div class="max-md:h-[480px] fixed bottom-0 left-0 | py-6 md:pt-9 md:pb-12 | w-full | z-40">
    <div class="mask-container | absolute inset-0 | size-full | bg-purple | bg-left-bottom bg-no-repeat">
        <!-- Purple background with mask pattern -->
    </div>
    <!-- Button sits here -->
</div>
```

**Container styles:**
- Position: `fixed`, bottom: 0, left: 0
- z-index: 40
- Background: Purple (`rgb(77, 45, 82)`)
- Has a background mask pattern image

---

## 3. Livewire Component Architecture

### Component ID
- **Livewire ID**: `pui7qq3CEKN2qrwYze5n`
- **Component path**: `zh-HK/how-to-apply-for-a-visa`

### State Variables
Based on the Livewire snapshot in the page:
- `opened` (boolean) - Controls visibility of the questionnaire
- `selected_choice` (string) - Stores user's selected region
- `question_1` through `question_5` - Store answers to each question
- `suitable_scheme` - Final recommended scheme after all questions

### Alpine.js Component: `visaApplication`

```javascript
Alpine.data('visaApplication', () => ({
    selectedChoice: '',
    modalOpened: false,

    init() {
        // Tab key navigation between button and close
        // Escape key triggers triggerOpen
        // Hash-based navigation: #tool opens the tool
    },

    updateSelectedChoice(value) {
        // Syncs with Livewire: sets 'selected_choice'
    },

    updateOpened() {
        // Opens the questionnaire
    },
}));
```

### Livewire Events
- `Livewire.on('updated_suitable_scheme', ...)` - Fired when scheme matching is complete, triggers scroll to schemes section
- `Livewire.on('question_submission', (q) => ...)` - Analytics tracking for each question
- `Livewire.on('triggerModal', (open) => ...)` - Opens/closes the questionnaire

---

## 4. Questionnaire Structure

### Section Container

```html
<section class="relative | bg-purple text-white" id="visa_tool">
    <!-- Purple background with mask pattern -->
    <div class="mask mask-n"></div>

    <div class="container mx-auto px-5 min-[1400px]:px-12 | py-16 lg:py-24">
        <h2 class="text-h2 font-bold">寻找适合你的人才入境计划</h2>
        <p class="mt-4">香港特别行政区政府为有意来港工作及定居的专业人才提供七项人才入境计划...</p>

        <!-- Livewire questionnaire component -->
        <div wire:id="pui7qq3CEKN2qrwYze5n" x-data="visaApplication">
            <!-- Questionnaire content -->
        </div>
    </div>
</section>
```

### Section Styles
| Property | Value |
|----------|-------|
| Background | Purple (`rgb(77, 45, 82)`) |
| Text color | White |
| Padding | `py-16 lg:py-24` (64px / 96px) |
| Container | Max-width 1440px, centered |
| Mask overlay | `mask mask-n` with background image `/assets/images/bg-n-mask.png` |

---

## 5. Question-by-Question Breakdown

### Question 1: 你来自哪个地区？ (Where are you from?)

**Type**: Radio button group (single select)
**Alpine.js state**: `x-model="selected"`

| Option | Value | ID | Label |
|--------|-------|----|----|
| 1 | `mainland` | `question_1mainland` | 中国内地 (Mainland China) |
| 2 | `taiwan_macao` | `question_1taiwan_macao` | 台湾 / 澳门特别行政区 (Taiwan / Macau SAR) |
| 3 | `other_country` | `question_1other_country` | 中国以外地区 (Outside China) |

**Radio Button Structure:**
```html
<label for="question_1mainland" class="radio-container | flex gap-x-2.5 lg:gap-x-3 items-center min-h-12 border rounded px-4 lg:px-5 py-2 bg-white cursor-pointer transition-all ease-in-out duration-200 border-[#545454]"
       :class="checkCurrent('mainland') ? 'border-blue' : 'border-[#545454]'">
    <span class="relative | block | w-5 h-5 min-w-5 min-h-5">
        <input class="hidden" type="radio" id="question_1mainland" name="question_1" value="mainland" x-model="selected">
        <span class="radio-container__box | relative inline-block size-full border-2 rounded-full transition-all ease-in-out duration-200 border-[#545454]"
              x-bind:class="`border-${checkCurrent('mainland') ? 'blue' : '[#545454]'}`">
            <span class="x-center y-center | inline-block h-2.5 w-2.5 rounded-full transition-all ease-in-out duration-200 bg-transparent"
                  x-bind:class="checkCurrent('mainland') ? 'bg-blue' : 'bg-transparent'"></span>
        </span>
    </span>
    <span x-bind:class="checkCurrent('mainland') ? 'text-blue' : 'text-[#545454] font-normal'" class="text-[#545454] font-normal">
        中国内地
    </span>
</label>
```

**Radio Button Styles:**
| State | Border | Text Color | Dot |
|-------|--------|------------|-----|
| Unselected | `#545454` (dark grey) | `#545454` font-normal | Transparent |
| Selected | `blue` (theme blue) | `text-blue` | Blue dot (h-2.5 w-2.5) |

**Container**: `flex flex-col lg:flex-row w-full min-w-[180px] gap-2 lg:gap-4`
- Mobile: stacked vertically
- Desktop: horizontal row
- Gap: 8px mobile / 16px desktop

**Next Button:**
```html
<button aria-label="下一步" wire:click="nextStep"
        class="group btn-text | w-full md:w-max block max-w-full | inline-block | break-words | pointer-events-none grayscale | transition-all ease-in-out duration-200">
    下一步 (Next)
</button>
```
- Disabled (`pointer-events-none grayscale`) until an option is selected
- Full width on mobile, auto width on desktop

---

### Question 2-5

Based on the extracted form elements, additional radio inputs exist:

| Question | Possible Values |
|----------|----------------|
| Q2 | Various options (age, education, experience related) |
| Q3 | Various options |
| Q4 | Various options |
| Q5 | Various options |

The exact text of Q2-Q5 is rendered dynamically by Livewire based on Q1's answer. Different paths lead to different follow-up questions.

---

## 6. Scheme Cards (Results Section)

Below the questionnaire, 7 scheme cards are displayed. Each card has:
- A number badge
- Scheme name (h4 heading)
- Eligibility criteria (申请资格)
- Expandable section with:
  - Stay duration (逗留期限)
  - Additional details

### Scheme Card Structure

```html
<div class="scheme | relative | rounded border border-light-grey-100 | py-8 px-5 lg:px-12"
     x-data="{expand: false}" wire:key="N">
    <div class="absolute inset-0 | size-full | bg-light-grey-25 | opacity-70 | -z-10"></div>
    <div class="relative">
        <div class="flex gap-x-6 lg:items-center | mb-4 lg:mb-10">
            <span class="text-h1-lg leading-none font-bold">N</span>
            <h3 class="text-h4 font-bold">Scheme Name</h3>
        </div>
        <div class="flex max-lg:flex-col gap-x-10 gap-y-6 | my-6 lg:my-10">
            <!-- Eligibility content -->
        </div>
        <!-- Expandable section -->
        <div class="grid transition-[grid-template-rows] transition-all ease-in-out duration-400 grid-rows-[0fr]"
             :class="expand ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'">
            <div class="overflow-hidden">
                <!-- Expanded content -->
            </div>
        </div>
    </div>
</div>
```

### Card Styles
| Property | Value |
|----------|-------|
| Border radius | `4px` (rounded) |
| Border | `1px solid light-grey-100` |
| Padding | `py-8 px-5 lg:px-12` (32px / 20px / 48px) |
| Background | `light-grey-25` with 70% opacity pseudo-element |
| Number badge | `text-h1-lg font-bold` |
| Title | `text-h4 font-bold` |
| Gap between items | `gap-x-6 lg:items-center` |

### The 7 Schemes

| # | Name (Chinese) | Name (English) |
|---|---------------|----------------|
| 1 | 高端人才通行证计划 | Top Talent Pass Scheme |
| 2 | 一般就业政策 (适用于非内地居民) | General Employment Policy (for non-Mainland residents) |
| 3 | 输入内地人才计划 (适用于内地居民) | Admission Scheme for Mainland Talents and Professionals |
| 4 | 非本地毕业生留港/回港就业安排 | Immigration Arrangements for Non-local Graduates |
| 5 | 资本投资者入境计划 | Capital Investor Entrant Scheme |
| 6 | 科技人才入境计划 | Technology Talent Admission Scheme |
| 7 | 输入中国籍香港永久性居民第二代计划 | Admission Scheme for Second Generation of Chinese Hong Kong Permanent Residents |

### Expand/Collapse Animation
```css
/* Uses CSS Grid row animation */
grid-rows-[0fr]  /* collapsed */
grid-rows-[1fr]  /* expanded */
transition: all ease-in-out 400ms
```

---

## 7. Full Page Context

### Livewire Components on Page
| Component | Wire ID | Role |
|-----------|---------|------|
| Header | `jD6SGlJzDpqhde1GbWHZ` | Navigation header |
| Unknown | `iEIqQGgpEEu1dPXahjLp` | Page content |
| **Visa Matching Tool** | `pui7qq3CEKN2qrwYze5n` | **The questionnaire/filter panel** |
| Footer | `uYWiUPOGVhaBeUnKyUDB` | Page footer with newsletter signup |

### Page Background
The purple questionnaire section has a mask overlay:
```html
<div class="mask mask-n" style="mix-blend-mode: soft-light; background-image: url('/assets/images/bg-n-mask.png')"></div>
```
- Mix blend mode: `soft-light`
- Background image: `/assets/images/bg-n-mask.png`
- Positioned absolutely to cover the section

---

## 8. Color Palette (Filter Panel Specific)

| Token | Value | Usage |
|-------|-------|-------|
| Purple background | `rgb(77, 45, 82)` | Questionnaire section background |
| Highlight orange | `rgb(240, 90, 48)` | Accent panels |
| Dark grey border | `#545454` | Unselected radio border |
| Blue (selected) | Theme blue | Selected radio border + dot |
| White | `#FFFFFF` | Card backgrounds, text on purple |
| Light grey | `light-grey-100` | Card borders |
| Light grey bg | `light-grey-25` | Card background fill |
| Dark grey text | `#545454` | Radio option text (unselected) |

---

## 9. Typography

| Element | Classes | Notes |
|---------|---------|-------|
| Section title | `text-h2 font-bold` | Main heading |
| Scheme title | `text-h4 font-bold` | Card headings |
| Number badge | `text-h1-lg leading-none font-bold` | Large numbers |
| Radio label | `text-base font-normal` | Option text |
| Content text | `text-justify` | Body text in cards |

---

## 10. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| `< 1024px` (mobile) | Radio options stack vertically, card content stacks vertically |
| `>= 1024px` (desktop) | Radio options in horizontal row, card content side-by-side |
| `>= 1400px` | Max container width 1440px, larger padding |

---

## 11. Interaction Patterns

### Questionnaire Flow
1. User clicks green floating button
2. Livewire sends `POST /livewire/update` to toggle `opened = true`
3. Page scrolls to questionnaire section
4. User selects region (Q1)
5. Livewire updates with follow-up questions (Q2-Q5)
6. After all questions, `updated_suitable_scheme` event fires
7. Page scrolls to matched scheme cards section
8. Relevant cards are highlighted

### Card Expansion
- Click "查看更多" (See More) button on each card
- Uses CSS Grid row animation (400ms ease-in-out)
- Only one section expands at a time per card

### Keyboard Navigation
- Tab: Moves between button and close button in modal
- Escape: Closes the questionnaire/modal
- Enter on radio labels: Triggers selection

---

## 12. Screenshots Reference

- **Before click**: `docs/design-references/filter-panel-before.png`
  - Shows the page with the questionnaire section visible (Q1 with 3 radio options)
  - Green floating button visible at bottom-left

- **After click**: `docs/design-references/filter-panel-after.png`
  - Shows the hero section of the page
  - Green floating button still visible at bottom-left

> **Note**: The Livewire update changes the page state. The questionnaire was already visible in the DOM before clicking - the button toggles its visibility state via Livewire.

---

## 13. Implementation Notes for Cloning

### What to Build
1. **Floating Action Button**: Fixed position, bottom-left, green, with icon and text
2. **Questionnaire Section**: Purple background section with mask overlay
3. **Radio Button Group**: Custom styled radio buttons with Alpine.js state management
4. **Multi-step Wizard**: Livewire-driven question flow (Q1 -> Q2-Q5 -> results)
5. **Scheme Cards**: 7 expandable cards with eligibility info
6. **Scroll Behavior**: Auto-scroll to relevant sections after interactions

### Key Technical Details
- **Framework**: Livewire 3.x + Alpine.js 3.x
- **CSS**: Tailwind CSS utility classes with custom theme tokens
- **Animation**: CSS Grid row transitions for expand/collapse
- **State**: Livewire component state (`opened`, `selected_choice`, question answers)
- **Analytics**: Google Tag Manager dataLayer events on question submission

### Simplified Implementation Approach
For a Next.js clone:
1. Use React state or server actions instead of Livewire
2. Keep the same visual design (purple section, custom radios, card layout)
3. Implement multi-step form with React state
4. Use CSS Grid or Framer Motion for expand animations
5. Maintain the same typography scale and color tokens
