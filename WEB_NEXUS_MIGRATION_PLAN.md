# Web-Nexus Migration Plan

## Overview
This document outlines the strategy to merge `web-nexus` (pure HTML landing page) into `web` (React app) while:
- Removing all NoFx branding
- Replacing marketing/landing pages with Nexus content
- Applying Nexus theme to dashboard (keeping functionality)
- Minimizing conflicts when pulling upstream updates

## Strategy: Layered Approach

### Layer 1: Theme System (Low Conflict Risk)
**Location**: `web/src/index.css`
- Extract Nexus colors from `web-nexus/index.html`
- Add CSS variables for Nexus theme
- Keep legacy variables for backward compatibility
- **Conflict Risk**: LOW - CSS variables are isolated

**Status**: ✅ COMPLETED

### Layer 2: Assets (No Conflict Risk)
**Location**: `web/public/images/nexus/`
- Copy all images from `web-nexus/images/` to `web/public/images/nexus/`
- Update image references in components
- **Conflict Risk**: NONE - New directory

**Status**: ✅ COMPLETED

### Layer 3: Landing Page Components (Medium Conflict Risk)
**Location**: `web/src/components/landing/*` and `web/src/pages/LandingPage.tsx`

**Files to Replace/Update**:
1. `HeroSection.tsx` - Replace with Nexus hero content
2. `AboutSection.tsx` - Replace with Nexus about content  
3. `FeaturesSection.tsx` - Replace with Nexus features
4. `FooterSection.tsx` - Update with Nexus branding
5. `HeaderBar.tsx` - Update logo and branding
6. `LandingPage.tsx` - Update structure to match web-nexus

**Strategy**:
- Keep React component structure
- Replace content with Nexus HTML structure (converted to JSX)
- Use CSS classes from web-nexus (convert inline styles)
- Extract animations from web-nexus JS

**Conflict Risk**: MEDIUM - Structure changes, but isolated to landing components

### Layer 4: Translations (Medium Conflict Risk)
**Location**: `web/src/i18n/translations.ts`

**Changes**:
- Remove all "NoFx" references
- Add Nexus-specific content
- Keep translation structure intact

**Strategy**:
- Replace content, keep keys
- Document custom keys vs upstream keys

**Conflict Risk**: MEDIUM - Content changes, structure preserved

### Layer 5: Dashboard Theme (High Conflict Risk)
**Location**: `web/src/App.tsx` and dashboard components

**Strategy**:
- Apply Nexus theme via CSS classes only
- NO structural changes to dashboard
- Use CSS variables for colors
- Keep all functionality intact

**Conflict Risk**: HIGH - Dashboard components may change upstream
**Mitigation**: Theme via CSS only, avoid structural changes

### Layer 6: Branding Removal (Low-Medium Conflict Risk)
**Files to Update**:
- `web/src/App.tsx` - Footer, loading screen
- `web/src/components/Header.tsx` - Logo
- `web/src/components/LoginPage.tsx` - Logo
- `web/src/components/RegisterPage.tsx` - Logo
- `web/src/components/EquityChart.tsx` - Watermark
- `web/src/components/ComparisonChart.tsx` - Watermark

**Strategy**:
- Replace logo references
- Update text content
- Keep component structure

**Conflict Risk**: LOW-MEDIUM - Simple replacements

## Implementation Order

1. ✅ Theme System (CSS variables)
2. ✅ Assets (images)
3. ⏳ Landing Page Components
4. ⏳ Translations
5. ⏳ Dashboard Theme
6. ⏳ Branding Removal

## Conflict Resolution Strategy

### When Pulling Upstream Updates

1. **CSS Variables** (`index.css`):
   - Upstream changes likely won't touch our Nexus variables
   - If conflicts occur, keep Nexus variables, merge upstream base styles

2. **Landing Components**:
   - If upstream changes landing page structure:
     - Prefer keeping Nexus version
     - Manually merge any new features
   - Document custom sections

3. **Translations**:
   - Merge upstream translation keys
   - Keep Nexus-specific content
   - Use git merge tools

4. **Dashboard Components**:
   - Prefer upstream structure
   - Reapply theme after merge
   - Use CSS-only changes where possible

5. **Branding**:
   - Simple search/replace during merge
   - Keep Nexus branding

## File Structure

```
web/
├── src/
│   ├── index.css              [MODIFIED] - Nexus theme variables
│   ├── App.tsx                 [MODIFIED] - Footer, branding
│   ├── pages/
│   │   └── LandingPage.tsx    [MODIFIED] - Nexus landing page
│   ├── components/
│   │   ├── landing/            [MODIFIED] - All landing components
│   │   ├── Header.tsx          [MODIFIED] - Logo
│   │   ├── LoginPage.tsx       [MODIFIED] - Logo
│   │   ├── RegisterPage.tsx    [MODIFIED] - Logo
│   │   ├── EquityChart.tsx     [MODIFIED] - Watermark
│   │   └── ComparisonChart.tsx [MODIFIED] - Watermark
│   └── i18n/
│       └── translations.ts    [MODIFIED] - Remove NoFx, add Nexus
├── public/
│   └── images/
│       └── nexus/              [NEW] - Nexus assets
└── MIGRATION_GUIDE.md          [NEW] - Migration documentation
```

## Testing Checklist

- [ ] Landing page displays Nexus content correctly
- [ ] Dashboard functionality works (all features intact)
- [ ] Theme colors match web-nexus
- [ ] No broken image references
- [ ] All NoFx branding removed
- [ ] Responsive design works on mobile
- [ ] Translations load correctly
- [ ] Navigation works between pages
- [ ] Login/Register pages work
- [ ] Dashboard charts display correctly

## Maintenance Notes

### After Upstream Updates

1. Run `npm install` to update dependencies
2. Check for conflicts in:
   - `src/index.css` - Merge theme variables
   - `src/components/landing/*` - Keep Nexus versions
   - `src/App.tsx` - Reapply theme classes
3. Test dashboard functionality
4. Verify theme consistency

### Theme Updates

To update Nexus theme colors:
- Edit `src/index.css` CSS variables
- All components will auto-update
- No component code changes needed

## Key Decisions

1. **Keep React Structure**: Convert HTML to React components, don't embed HTML
2. **CSS Variables**: Use CSS variables for easy theme updates
3. **Isolated Components**: Landing page components are self-contained
4. **Dashboard Functionality**: Preserve all dashboard features
5. **Upstream Compatibility**: Structure changes to minimize merge conflicts

## Next Steps

1. Complete landing page component migration
2. Update translations
3. Apply theme to dashboard
4. Remove all NoFx branding
5. Test thoroughly
6. Document any custom modifications

