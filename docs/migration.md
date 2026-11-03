# Migration and Git alignment

## What changed

Input archive: nodePath.zip. It contained README.md plus a complete .git directory on main at d3e29db (Initial commit). There were no source files to relocate. The original README content was simply '# nodePath'; its exact bytes are saved in docs/README.original.md. The supplied product text is retained verbatim as product-spec-original.txt.

The scaffold adds workspaces, runtime examples, shared code, docs, local database config, tests and CI. The README is replaced by onboarding instructions. Git history, main branch, upstream tracking and origin git@github.com:Altacon-Labs/nodePath.git are retained. No commit, remote change or push was performed.

## Use the downloadable repository

Extract the ZIP into a new directory. The top-level nodePath folder includes .git, including the original history. Ensure your archive extractor preserves hidden files. Then:

~~~sh
cd nodePath
git status --short
git remote -v
git log -1 --oneline
npm ci
npm run check
npm test
npm run dev
~~~

New scaffold files appear as untracked; README.md appears modified. This is intentional so you can review before committing. The ZIP excludes node_modules; npm ci recreates workspace links.

## Apply to a newer existing clone

Do not overwrite another clone's .git directory. Create a branch in that clone, copy the scaffold working files except .git and node_modules, and merge README/package/config changes manually if that clone has evolved. This archive is based only on the uploaded initial commit, not the current remote state. Review git diff and git status before staging.

## Commit and push after review

~~~sh
git switch -c chore/monorepo-scaffold
git add .
git diff --cached --stat
git diff --cached
git commit -m "Scaffold NodePath monorepo"
git push -u origin chore/monorepo-scaffold
~~~

The push uses your own GitHub SSH access. No credentials are included or needed for the demo. Never stage .env. The optional database credentials in .env.example and compose.yaml are local development values only.

## Validation

See validation.md for checks actually run when packaging. Docker and external services are optional and not required by tests. npm run build validates syntax; this dependency-free JavaScript scaffold has no compilation or bundling step.


## Guided journey revision

The dashboard entry is now a welcome/setup journey instead of a fixed-metric page. No backend migration or database is required. Workspace data is versioned under nodepath-workspace-v1 in the current browser origin. Older appearance choices remain supported; there was no persisted analytics data in earlier scaffold versions. The optional account previews remain at /login and /sign-up. Git metadata, original history and remote are preserved.
