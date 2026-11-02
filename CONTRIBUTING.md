# Contributing to NodePath

Thanks for contributing. Start with README.md, docs/architecture.md and docs/roadmap.md. This is an early development scaffold with sample data, not a deployed analytics product.

## Set up and validate

Use Node.js 22+ and npm 10+. Fork the repository, clone your fork and create a focused branch. Run npm ci, then npm run dev. Before opening a pull request run npm run check and npm test. Run both worker commands when changing domain or worker behavior. Commit package-lock.json whenever dependencies change.

## Choosing work

Search existing issues and pull requests. For a bug, include reproduction steps, expected/actual behavior and your Node/OS versions. Discuss changes to API contracts, architecture or dependencies in an issue before building a large feature. Keep pull requests focused. Tests should cover meaningful behavior, especially authorization, replay, numeric precision and metric definitions as those features are added.

## Code and UI conventions

Use ES modules and named exports. Keep shared calculations in packages/domain and transport logic in packages/sdk. Keep reusable browser components in apps/web/public/components.mjs until a framework migration is agreed. Components must accept data/actions rather than read app globals. Avoid hidden coupling between frontend and storage.

Follow docs/design-system.md for every UI change. All text uses Manrope, all icons come from Phosphor, layout uses the 8-point spacing scale, cards have no borders, and pills/badges are prohibited. Include loading, empty, error and success behavior. Use toasts for action feedback with accessible announcements. Include screenshots and describe keyboard behavior in UI pull requests.

## Review and scope

Explain the problem, resulting behavior and checks actually run. Mark unfinished work as a draft. Reviewers should check product scope, accessibility, design consistency, test coverage and docs. No maintainer accounts, approval count or release policy is assumed by this scaffold; repository owners configure branch protection and assign maintainers on GitHub.

## Security and licensing

Never include keys, private user data or .env files. Follow SECURITY.md for sensitive reports. The uploaded repository did not include a license. Until its owners choose one, this scaffold does not grant an open-source license; a public repository alone does not provide one. Do not copy third-party code without compatible terms and attribution.

