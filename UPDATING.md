# Updating from iamcal/enchant-order

This project is a React rewrite. Do not use standard `git pull`.

## Sync Git History
To keep the fork's history clean without overwriting local changes:

```bash
npm run sync:history
```

This runs `git merge -X ours` and ensures root files (`style.css`, `script.js`, `langs.html`, etc.) stay deleted.

## Sync Translations
To merge new upstream keys into `public/languages/` while keeping local overrides:

```bash
npm run sync:upstream
```

## Review Upstream Changes
To see what logic or CSS has changed in the original repo (excluding languages):

```bash
git fetch upstream
git log -p HEAD..upstream/main -- . ":(exclude)languages"
```
