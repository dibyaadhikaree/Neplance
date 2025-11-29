# CSS Architecture

This folder contains modular, organized CSS files following a component-based approach.

## File Structure

- **variables.css** - CSS custom properties (colors, spacing, typography, transitions)
- **base.css** - Global reset and foundational styles
- **components.css** - Reusable component styles (buttons, inputs, cards, badges, tabs)
- **layout.css** - Layout utilities and container styles
- **typography.css** - Text, heading, and gradient styles
- **utilities.css** - Animation, spacing utilities, and responsive helpers

## CSS Variables

All values use CSS custom properties defined in `variables.css`:
- Colors: `--color-primary`, `--color-secondary`, `--color-tertiary`, `--color-bg`, `--color-border`
- Spacing: `--space-xs` through `--space-2xl`
- Typography: `--font-size-xs` through `--font-size-3xl`, font weights
- Transitions: `--transition-fast`, `--transition-normal`

## Adding New Styles

1. If it's a component style → add to `components.css`
2. If it's layout related → add to `layout.css`
3. If it's typography → add to `typography.css`
4. For utility/helper styles → add to `utilities.css`
5. Always use CSS variables instead of hardcoded values

## Light Mode

Add `.light` class to `html` element to enable light mode. All variables have light mode overrides.
