# Web-Nexus Migration Guide

This document outlines the migration strategy from NoFx branding to Nexus branding and theme integration.

## Migration Strategy

### 1. Theme Integration
- **Location**: `src/index.css` - CSS variables updated with Nexus colors
- **Assets**: Images copied from `web-nexus/images/` to `web/public/images/nexus/`
- **Approach**: CSS variables for easy theme updates, minimal conflicts with upstream

### 2. Landing Page Replacement
- **Old**: `src/pages/LandingPage.tsx` and `src/components/landing/*`
- **New**: Components updated with Nexus content and styling
- **Strategy**: Replace marketing content while keeping React structure

### 3. Branding Removal
- **Files to update**:
  - `src/i18n/translations.ts` - Remove all "NoFx" references
  - `src/components/landing/*` - Update branding
  - `src/components/Header.tsx` - Update logo and title
  - `src/App.tsx` - Update footer and references

### 4. Dashboard Theme Application
- **Keep**: All dashboard functionality intact
- **Update**: Apply Nexus theme colors to dashboard components
- **Files**: `src/App.tsx`, `src/components/*` (dashboard components)

### 5. Minimizing Merge Conflicts

#### File Organization Strategy:
1. **Theme files** (low conflict): `src/index.css` - CSS variables only
2. **Landing components** (medium conflict): `src/components/landing/*` - Replace entire files
3. **Dashboard components** (high conflict risk): Apply theme via CSS classes, avoid structural changes
4. **Translations** (medium conflict): Update content, keep structure

#### Best Practices:
- Use CSS variables for colors (easy to update)
- Keep component structure identical
- Use Tailwind classes where possible
- Document custom changes in comments

### 6. Upstream Update Workflow

When pulling upstream updates:

1. **Theme conflicts**: Usually none (separate CSS variables)
2. **Landing page conflicts**: Resolve by keeping Nexus branding
3. **Dashboard conflicts**: Prefer upstream structure, reapply theme
4. **Translation conflicts**: Merge Nexus content with upstream updates

### Files Modified in This Migration

- `src/index.css` - Theme variables
- `src/pages/LandingPage.tsx` - Landing page wrapper
- `src/components/landing/*` - All landing components
- `src/components/landing/HeaderBar.tsx` - Header with Nexus branding
- `src/components/landing/FooterSection.tsx` - Footer with Nexus branding
- `src/i18n/translations.ts` - Remove NoFx, add Nexus content
- `src/App.tsx` - Footer and branding updates
- `public/images/nexus/` - Nexus assets

### Testing Checklist

- [ ] Landing page displays Nexus content
- [ ] Dashboard functionality works
- [ ] Theme colors match web-nexus
- [ ] No broken image references
- [ ] All NoFx branding removed
- [ ] Responsive design works
- [ ] Translations updated

