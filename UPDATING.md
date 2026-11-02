# Updating from iamcal/enchant-order

This project is a React rewrite. Do not use standard `git pull`.

The commands below expect the original repository as a remote named `upstream`:

```bash
git remote add upstream https://github.com/iamcal/enchant-order.git
```

## Sync Git History

To keep the fork's history clean without overwriting local changes:

```bash
npm run sync:history
```

This runs `git merge -X ours` and ensures root files (`style.css`, `script.js`, `langs.html`, etc.) stay deleted.

## Sync Translations

To bring upstream translation changes into `public/languages/`. Upstream values replace local ones for the same key, and keys that only exist locally are kept:

```bash
npm run sync:upstream
```

## Review Upstream Changes

To see what logic or CSS has changed in the original repo (excluding languages):

```bash
git fetch upstream
git log -p HEAD..upstream/main -- . ":(exclude)languages"
```
