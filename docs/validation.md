# Validation at packaging

Validated on Windows with Node.js 24.12.0 and npm 11.7.0:

- npm ci: passed, six local workspace links installed.
- npm run check and npm run build: passed (syntax checks; no compilation step).
- npm test: four tests passed: API status/error handling, wallet validation, retention set logic, chain-event identity.
- Both worker commands: passed in fixture-only dry-run mode.
- Development launcher smoke check: web page loaded and /v1/overview proxy returned demo data using isolated local ports.
- Original README copied byte-for-byte from Git HEAD.
- Original .git files, commit and origin checked against the uploaded archive when packaging.

Not executed: Docker/PostgreSQL startup, hosted GitHub Actions, Node 22 runtime, live provider indexing or a browser visual review. Those are not claimed as validated. There are no live data or production adapters in this scaffold.

## Contribution and UI revision

Added contribution/community/security guides, issue/PR templates, EditorConfig, Git attributes and the design-system guide. Replaced inline UI with reusable modules, 8-point tokens, borderless cards, empty/retry states and dismissible action toasts. Fonts/icons use version-pinned CDN redirects because package downloads were blocked by the environment; no asset download or browser visual verification is claimed.
Revision checks: syntax check, four existing tests, development web/API smoke check, local UI module responses and all font/icon redirect routes passed. Remote CDN files and interactive toast behavior were not browser-tested.

Premium workspace revision: syntax checks, four tests, local web/API smoke check and local asset route checks passed. Added reusable SVG activity chart, cohort table, sample window selection and CSV download. Interactive controls and the visual layout have not been browser-verified in this environment.

Appearance revision: syntax check, four existing tests, local smoke/asset checks and isolated theme behavior checks passed (saved choice, system changes, tab synchronization, invalid preferences and blocked local storage). Theme logic was checked with a simulated browser environment; no visual browser verification is claimed.

Account preview revision: syntax checks, four existing tests, development smoke checks and account route/module checks passed. Isolated DOM simulations checked invalid input, signup password length, password visibility, and explicit demo completion for sign-up and login. No credentials are transmitted or persisted by these modules. Browser preview timed out; no visual or real-browser interaction verification is claimed.
