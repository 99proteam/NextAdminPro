# Contributing to NextAdminPro

Thanks for helping make NextAdminPro better! Bug reports, feature ideas, new pages and docs fixes are all welcome.

## Getting started

```bash
git clone https://github.com/99proteam/NextAdminPro.git
cd NextAdminPro
npm install
npm run dev
```

Open http://localhost:3000.

## Before you open a pull request

```bash
npm run lint
npm run typecheck
npm run build
```

All three must pass.

## Guidelines

- **Keep components reusable.** Generic UI goes in `src/components/ui`, page-specific UI in `src/components/<feature>`.
- **Use the design tokens.** Colors come from CSS variables in `src/app/globals.css` (`bg-card`, `text-muted-foreground`, `bg-primary`…). Don't hard-code hex values in components.
- **Support both themes.** Check every change in light and dark mode.
- **Accessibility matters.** Give icon-only buttons an `aria-label`, keep everything keyboard-reachable, and never use color as the only signal (status badges pair color with an icon and a label).
- **Mock data lives in `src/lib/data`.** New pages should read from there so they're easy to wire up to a real backend.
- **Small, focused PRs** are much easier to review than large ones.

## Reporting bugs

Open an issue with steps to reproduce, what you expected, what happened, and your browser and OS.
