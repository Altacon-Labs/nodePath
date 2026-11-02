# NodePath design system

## Typography and assets

Manrope is the only interface typeface, including buttons, inputs, navigation, charts and notifications. The demo requests Latin Manrope weights 400, 600 and 700 from the version-pinned @fontsource/manrope CDN assets. Font loading requires network access; there is no intentional fallback family. For additional languages add the appropriate Manrope subsets and test glyph coverage. Figma files must use the same family and weights.

Icons must come from @phosphor-icons/web. The demo redirects an allowlisted asset map to the package's original regular wallet and x SVGs on the version-pinned jsDelivr CDN. Never use emoji, Unicode symbols or another icon library as UI icons. Decorative icons have empty alternative text; icon-only buttons require descriptive accessible labels.

## Figma and implementation tokens

Use an 8-point layout grid in Figma, Auto Layout and shared variables. Map spacing variables directly to CSS: space/1 = 8, space/2 = 16, space/3 = 24, space/4 = 32, space/5 = 40, space/6 = 48, space/8 = 64 pixels. Use these for gaps, margins and padding. Use 24/32 pixel icons and controls at least 48 pixels high. Focus outlines may use 2 pixels and a 4 pixel offset; these are optical/accessibility details rather than layout spacing.

Text styles: body 16/regular, label 16/semibold, section 24/bold, title 48/bold (32 on small screens), metric 40/bold. Create matching reusable Figma components for button, metric card, empty state and toast. No Figma file has been supplied or edited; these are the implementation-aligned Figma setup rules.

## Surfaces and components

Cards are borderless, using background contrast for grouping and an 8 pixel radius. Do not introduce pills, badges or capsule status labels. Status is plain text. Preserve consistent padding and gaps across all cards and empty states.

Reusable browser factories: metricCard(label,value), emptyState({title,description,actionLabel,onAction}), createToasts(region), icon(name). Extend these centrally instead of copying markup. UI values must use textContent, not interpolated HTML.

## States and feedback

Keep loading status visible and use aria-busy. Empty states need a clear title, useful explanation and a relevant action where available. API failures replace metrics with a retry state. Refresh success and failures produce dismissible toasts. Toasts use status/alert roles, are capped at three, expire after eight seconds and pause on hover/focus. Do not rely on toasts alone for critical or persistent errors. Preserve keyboard focus and visible focus indicators.


## Analytics workspace refinement

Use a warm neutral canvas, white borderless panels, charcoal text and a restrained terracotta chart accent. Keep a compact workspace sidebar, clear page hierarchy, tabular numeric alignment and quiet contextual labels. Charts and tables take priority over decoration. The activity chart and cohort table are reusable component factories with explicit illustrative data labels. Chart SVGs are data visualizations, not icons; UI icons remain Phosphor only. The period selector changes the plotted sample window and CSV export downloads the displayed cohort fixture.
