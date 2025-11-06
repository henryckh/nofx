# Git Merge Strategy for Nexus Fork

## Problem
You maintain a local Nexus-branded version that never pushes upstream, but you want to pull updates from the original repository.

## Solution: Git Strategy Options

### Option 1: Separate Branch Strategy (RECOMMENDED)

**Setup**:
```bash
# Create a nexus branch from your current state
git checkout -b nexus-branding

# Set upstream tracking
git branch --set-upstream-to=origin/main-ola nexus-branding

# Your main working branch is now nexus-branding
```

**Workflow**:
```bash
# Always work on nexus-branding branch
git checkout nexus-branding

# When pulling upstream updates:
git fetch origin
git merge origin/main-ola  # or origin/main, depending on their default branch

# Resolve conflicts prioritizing Nexus branding
# Push only to your fork (never push to upstream)
git push origin nexus-branding
```

**Benefits**:
- Clear separation of custom branding
- Easy to see what's custom vs upstream
- Can create PRs from this branch if needed

### Option 2: Merge Strategy Configuration

**Setup merge strategy for specific files**:
```bash
# Create .gitattributes to handle merge conflicts
cat > .gitattributes << EOF
# Nexus branding files - always prefer ours
web/src/components/landing/* merge=ours
web/src/i18n/translations.ts merge=union
web/src/index.css merge=union
web/public/images/nexus/* merge=ours
EOF

# Configure merge driver
git config merge.ours.driver true
```

**Benefits**:
- Automatic conflict resolution for branding files
- Less manual work during merges

### Option 3: Rebase Strategy (Advanced)

**Setup**:
```bash
# Create a rebase branch
git checkout -b nexus-rebase

# Rebase on upstream periodically
git fetch upstream  # if you set upstream remote
git rebase upstream/main
```

**Benefits**:
- Cleaner history
- More complex conflict resolution

## Recommended Approach: Hybrid

### Step 1: Branch Structure
```
main-ola (upstream) ──┐
                      │
nexus-branding ───────┴─ (your custom branch)
```

### Step 2: Merge Workflow Script

Create `scripts/merge-upstream.sh`:
```bash
#!/bin/bash
# Merge upstream changes while preserving Nexus branding

set -e

echo "🔄 Fetching upstream changes..."
git fetch origin

echo "📦 Merging upstream/main-ola..."
git merge origin/main-ola --no-edit

echo "✅ Merge complete!"
echo "⚠️  Check for conflicts in:"
echo "   - web/src/components/landing/* (prefer Nexus)"
echo "   - web/src/index.css (merge CSS variables)"
echo "   - web/src/App.tsx (keep Nexus footer)"
```

### Step 3: Conflict Resolution Priority

When conflicts occur, use this priority:

1. **Landing Page Components** (`web/src/components/landing/*`)
   - **Strategy**: Keep Nexus version
   - **Command**: `git checkout --ours web/src/components/landing/*`

2. **CSS Theme** (`web/src/index.css`)
   - **Strategy**: Merge both - keep Nexus variables, add upstream changes
   - **Manual**: Merge CSS variables section, keep Nexus colors

3. **Translations** (`web/src/i18n/translations.ts`)
   - **Strategy**: Union merge - keep Nexus content, add new upstream keys
   - **Manual**: Review new keys, translate to Nexus context

4. **Dashboard Components** (`web/src/App.tsx`, dashboard components)
   - **Strategy**: Accept upstream structure, reapply theme
   - **Manual**: Take upstream version, add Nexus CSS classes

5. **Assets** (`web/public/images/nexus/*`)
   - **Strategy**: Keep Nexus assets
   - **Command**: `git checkout --ours web/public/images/nexus/*`

### Step 4: Automated Merge Script

Create `scripts/smart-merge.sh`:
```bash
#!/bin/bash

BRANCH="nexus-branding"
UPSTREAM="origin/main-ola"

echo "🔄 Switching to $BRANCH..."
git checkout $BRANCH

echo "📥 Fetching upstream..."
git fetch origin

echo "🔀 Merging $UPSTREAM into $BRANCH..."
git merge $UPSTREAM --no-edit || {
    echo "⚠️  Conflicts detected!"
    
    # Auto-resolve Nexus branding files
    echo "🔧 Resolving Nexus branding conflicts..."
    git checkout --ours web/src/components/landing/*
    git checkout --ours web/public/images/nexus/*
    
    # Add files
    git add web/src/components/landing/* web/public/images/nexus/*
    
    echo "✅ Auto-resolved. Review remaining conflicts:"
    git status
    
    echo "📝 Complete merge manually:"
    echo "   git commit -m 'Merge upstream: preserve Nexus branding'"
}
```

## Conflict Resolution Guide

### Common Conflict Scenarios

#### Scenario 1: Upstream Updates Landing Page
```bash
# Conflict in LandingPage.tsx
# Solution: Keep Nexus version
git checkout --ours web/src/pages/LandingPage.tsx
git add web/src/pages/LandingPage.tsx
```

#### Scenario 2: Upstream Adds New CSS Variables
```bash
# Conflict in index.css
# Solution: Manual merge - keep Nexus colors, add new variables
# Edit index.css manually:
# - Keep Nexus variables (--nexus-*)
# - Add new upstream variables
# - Keep both sets
```

#### Scenario 3: Upstream Updates Dashboard Component
```bash
# Conflict in App.tsx
# Solution: Accept upstream, reapply theme
git checkout --theirs web/src/App.tsx
# Then manually add Nexus theme classes
```

#### Scenario 4: Upstream Adds New Translation Keys
```bash
# Conflict in translations.ts
# Solution: Union merge
git checkout --ours web/src/i18n/translations.ts
# Then manually add new keys with Nexus translations
```

## Best Practices

### 1. Regular Merges
- Merge upstream frequently (weekly/bi-weekly)
- Smaller merges = fewer conflicts
- Don't let branches diverge too much

### 2. Commit Strategy
- Keep Nexus commits separate from upstream merges
- Use clear commit messages:
  ```
  Merge upstream: preserve Nexus branding
  ```

### 3. Backup Before Merging
```bash
# Create backup branch before merging
git branch backup-before-merge-$(date +%Y%m%d)
git checkout nexus-branding
```

### 4. Test After Merge
```bash
# Always test after merge
npm install  # Update dependencies
npm run build  # Check for build errors
npm run dev  # Test locally
```

## Quick Reference Commands

```bash
# Setup
git checkout -b nexus-branding
git branch --set-upstream-to=origin/main-ola nexus-branding

# Regular merge
git fetch origin
git merge origin/main-ola

# Resolve conflicts (prefer Nexus)
git checkout --ours web/src/components/landing/*
git add web/src/components/landing/*
git commit -m "Merge upstream: preserve Nexus branding"

# Resolve conflicts (prefer upstream)
git checkout --theirs web/src/App.tsx
# Then manually reapply Nexus theme
git add web/src/App.tsx
git commit -m "Merge upstream: reapply Nexus theme"
```

## Troubleshooting

### Problem: Too many conflicts
**Solution**: Merge more frequently, keep branches closer

### Problem: Lost Nexus changes after merge
**Solution**: Use `git reflog` to find lost commits, cherry-pick them

### Problem: Upstream changes break Nexus theme
**Solution**: Create wrapper components or CSS overrides

## Recommended Workflow

1. **Daily**: Work on `nexus-branding` branch
2. **Weekly**: Merge upstream changes
3. **Before merge**: Create backup branch
4. **After merge**: Test thoroughly
5. **Never**: Push to upstream repository

This strategy keeps your Nexus branding while staying up-to-date with upstream improvements!

