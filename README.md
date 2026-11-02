# Enchant Order

[![CI](https://github.com/haseebn19/enchant-order/actions/workflows/ci.yml/badge.svg)](https://github.com/haseebn19/enchant-order/actions/workflows/ci.yml)

<img src="public/images/book.gif" alt="Enchant Order" width="192">

Web tool that finds the best order for combining enchantment books in Minecraft, for the lowest XP cost or prior work penalty.

## Features

- **Optimal Merge Order**: Finds the order with the lowest total XP levels or prior work penalty
- **Item and Enchantment Picker**: Choose an item and select enchantments with level pills
- **Quick Loadouts**: Preset enchantment sets for each item, such as Fortune or Silk Touch for tools
- **Languages and Themes**: Many languages (JSON files in `public/languages/`) and a system, light, or dark theme
- **Responsive**: Works on desktop and mobile

## Prerequisites

- Node.js 20.19+ or 22.12+
- npm

## Installation

```bash
git clone https://github.com/haseebn19/enchant-order.git
cd enchant-order
npm ci
```

## Usage

```bash
npm run dev
```

1. Choose an item to enchant.
2. Select enchantments, or start from a quick loadout.
3. Choose **Least XP/Levels** or **Least Prior Work Penalty**.
4. Click **Calculate** and follow the steps in the result panel.

## Development

### Testing

```bash
npm run test
```

With coverage:

```bash
npm run test:coverage
```

### Linting and Formatting

```bash
npm run lint
npm run format:check
```

`npm run format` applies the Prettier style. The language files in `public/languages` are left in the format they are synced from upstream in.

## Building

```bash
npm run build
```

Output: `dist/`

## Project Structure

```text
enchant-order/
+-- src/
|   +-- components/   Item picker, loadouts, enchantment grid, and result panel
|   +-- data/         Enchantments, item categories, and loadouts
|   +-- hooks/        Language and theme hooks
|   +-- lib/          Anvil calculator, number formatting, wiki links, and saved settings
|   +-- types/        TypeScript types
|   +-- App.tsx       Page layout and calculation
|   +-- main.tsx      Entry point
+-- public/           Language files and item images
+-- scripts/          Upstream language sync
+-- .github/workflows/
    +-- ci.yml                   Lint, test, build, and deploy to GitHub Pages
    +-- validate-lang-json.yml   Language file checks
```

Tests sit next to the code they cover, as `*.test.ts` and `*.test.tsx` files.

## Adding a Language

1. Add `public/languages/<code>.json` (see existing files for shape).
2. Add the language to `LANGUAGES` in `src/constants.ts`.

## Updating Enchantment Data

Edit `src/data/enchantData.ts` to add or change enchantments, item compatibility, and weights. Use the same shape as existing entries (levelMax, weight, incompatible list, items list).

## Credits

- [iamcal/enchant-order](https://github.com/iamcal/enchant-order) - Original tool by Cal Henderson
- [React](https://react.dev) - UI framework
- [Vite](https://vite.dev) - Build tooling
- [TypeScript](https://www.typescriptlang.org) - Language

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).

It is based on [iamcal/enchant-order](https://github.com/iamcal/enchant-order) by Cal Henderson, which is licensed under the MIT License. The original copyright and permission notice is in [LICENSE-UPSTREAM](LICENSE-UPSTREAM).

The item images are from Minecraft and belong to Mojang. Enchant Order is not an official Minecraft product, and is not approved by or associated with Mojang or Microsoft.
