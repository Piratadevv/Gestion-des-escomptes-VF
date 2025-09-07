# Banking Management Design System


## Color Palette

### Primary Banking Colors
- **Banking Blue**: `banking-500` (#0ea5e9) - Main brand color
- **Trust Blue**: `trust-700` (#334155) - Secondary actions, text
- **Deep Security**: `banking-900` (#0c4a6e) - Headers, important elements

### Semantic Colors
- **Financial Success**: `financial-600` (#16a34a) - Positive transactions, gains
- **Alert/Warning**: `alert-500` (#f59e0b) - Warnings, pending actions
- **Risk/Danger**: `risk-600` (#dc2626) - Errors, negative transactions
- **Neutral**: `neutral-600` (#525252) - Body text, secondary information

### Usage Guidelines

#### Backgrounds
- **Primary Background**: `neutral-50` (#fafafa)
- **Card Background**: `white` with `shadow-banking`
- **Header Background**: `banking-800` (#075985)
- **Sidebar Background**: `trust-900` (#0f172a)

#### Text Colors
- **Primary Text**: `trust-900` (#0f172a)
- **Secondary Text**: `neutral-600` (#525252)
- **Muted Text**: `neutral-400` (#a3a3a3)
- **Inverse Text**: `white` (on dark backgrounds)

#### Interactive Elements
- **Primary Button**: `banking-600` background, `white` text
- **Secondary Button**: `trust-200` background, `trust-800` text
- **Danger Button**: `risk-600` background, `white` text
- **Success Button**: `financial-600` background, `white` text

## Typography

### Font Family
- **Primary**: Inter (banking, display, body)
- **Fallback**: system-ui, sans-serif

### Font Sizes & Usage
- **Headings**:
  - H1: `text-3xl` (1.875rem) - Page titles
  - H2: `text-2xl` (1.5rem) - Section headers
  - H3: `text-xl` (1.25rem) - Subsection headers
  - H4: `text-lg` (1.125rem) - Card titles

- **Body Text**:
  - Large: `text-base` (1rem) - Primary content
  - Regular: `text-sm` (0.875rem) - Secondary content
  - Small: `text-xs` (0.75rem) - Captions, metadata

### Font Weights
- **Bold**: `font-semibold` (600) - Headings, important data
- **Medium**: `font-medium` (500) - Subheadings, labels
- **Regular**: `font-normal` (400) - Body text

## Spacing & Layout

### Container Widths
- **Full Width**: `w-full` - Dashboard, tables
- **Constrained**: `max-w-7xl mx-auto` - Main content areas
- **Cards**: `max-w-sm`, `max-w-md`, `max-w-lg` based on content

### Padding & Margins
- **Section Padding**: `p-6` or `p-8`
- **Card Padding**: `p-4` or `p-6`
- **Button Padding**: `px-4 py-2` (small), `px-6 py-3` (medium)
- **Form Elements**: `p-3`

### Grid Systems
- **Dashboard Grid**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`
- **Card Grid**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Table Grid**: Responsive with horizontal scroll

## Components

### Cards
```css
.banking-card {
  @apply bg-white rounded-banking shadow-banking border border-neutral-200;
  @apply p-6 transition-shadow duration-200;
  @apply hover:shadow-banking-md;
}
```

### Buttons
```css
.btn-primary {
  @apply bg-banking-900 hover:bg-trust-900 text-white;
  @apply px-6 py-3 rounded-banking font-medium;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-banking-800 focus:ring-offset-2;
}

.btn-secondary {
  @apply bg-trust-100 hover:bg-trust-200 text-trust-800;
  @apply px-6 py-3 rounded-banking font-medium;
  @apply transition-colors duration-200;
  @apply focus:outline-none focus:ring-2 focus:ring-trust-500 focus:ring-offset-2;
}
```

### Form Elements
```css
.form-input {
  @apply w-full px-3 py-2 border border-neutral-300 rounded-banking;
  @apply focus:outline-none focus:ring-2 focus:ring-banking-500 focus:border-banking-500;
  @apply transition-colors duration-200;
}

.form-label {
  @apply block text-sm font-medium text-trust-700 mb-2;
}
```

### Navigation
```css
.nav-item {
  @apply flex items-center px-4 py-2 text-sm font-medium rounded-banking;
  @apply text-neutral-600 hover:text-trust-900 hover:bg-neutral-100;
  @apply transition-colors duration-200;
}

.nav-item-active {
  @apply bg-banking-100 text-banking-800 border-r-2 border-banking-600;
}
```

## Shadows & Elevation

### Shadow Hierarchy
- **Level 1**: `shadow-banking` - Cards, form elements
- **Level 2**: `shadow-banking-md` - Hover states, dropdowns
- **Level 3**: `shadow-banking-lg` - Modals, overlays
- **Level 4**: `shadow-banking-xl` - Major overlays, notifications

## Animations & Interactions

### Micro-interactions
- **Fade In**: `animate-fade-in` - Page transitions
- **Slide Up**: `animate-slide-up` - Modal appearances
- **Pulse Subtle**: `animate-pulse-subtle` - Loading states

### Hover Effects
- **Cards**: Subtle shadow increase
- **Buttons**: Color darkening (100-200 shade difference)
- **Links**: Underline appearance
- **Icons**: Scale increase (scale-105)

## Responsive Design

### Breakpoints
- **Mobile**: `< 640px` - Single column, stacked navigation
- **Tablet**: `640px - 1024px` - Two columns, collapsible sidebar
- **Desktop**: `1024px - 1280px` - Three columns, full sidebar
- **Large**: `> 1280px` - Four columns, expanded layout

### Mobile-First Approach
- Start with mobile layout
- Progressive enhancement for larger screens
- Touch-friendly interactive elements (min 44px)
- Readable text sizes (min 16px on mobile)

## Accessibility

### Color Contrast
- **AA Compliance**: Minimum 4.5:1 ratio for normal text
- **AAA Compliance**: 7:1 ratio for important content
- **Focus States**: Visible focus rings on all interactive elements

### Keyboard Navigation
- **Tab Order**: Logical flow through interface
- **Skip Links**: For main content areas
- **ARIA Labels**: For complex components

## Banking-Specific Patterns

### Financial Data Display
- **Currency**: Right-aligned, consistent decimal places
- **Positive Values**: `text-banking-900`
- **Negative Values**: `text-risk-600`
- **Large Numbers**: Formatted with separators

### Security Indicators
- **Secure Actions**: Lock icons, `text-banking-900`
- **Verification**: Checkmark icons, `text-banking-900`
- **Warnings**: Alert icons, `text-alert-500`

### Status Indicators
- **Active**: Green dot, `bg-financial-500`
- **Pending**: Yellow dot, `bg-alert-500`
- **Inactive**: Gray dot, `bg-neutral-400`
- **Error**: Red dot, `bg-risk-500`

## Implementation Guidelines

### CSS Architecture
1. Use Tailwind utility classes primarily
2. Create component classes for repeated patterns
3. Maintain consistent naming conventions
4. Document custom utilities

### Component Structure
1. Atomic design principles
2. Reusable, composable components
3. Consistent prop interfaces
4. TypeScript for type safety

### Performance
1. Optimize for Core Web Vitals
2. Lazy load non-critical components
3. Minimize layout shifts
4. Progressive image loading

This design system ensures a cohesive, professional, and trustworthy banking application that meets modern web standards and user expectations.