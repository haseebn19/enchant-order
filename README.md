# Enchant Order

[![CI](https://github.com/haseebn19/enchant-order/actions/workflows/ci.yml/badge.svg)](https://github.com/haseebn19/enchant-order/actions/workflows/ci.yml)

<img src="public/images/book.gif" alt="Enchant Order" width="192">

Web tool to find the optimal order for combining enchantment books in Minecraft (minimize XP cost or prior work penalty).

## Features

- **Optimal merge order**: Tries combinations to minimize total XP levels or prior work penalty.
- **Item & enchantment picker**: Choose item type and select enchantments with level pills; incompatible groups shown.
- **Quick loadouts**: Preset enchant sets per item (e.g. Fortune / Silk Touch for tools).
- **i18n**: Multiple languages (JSON in `public/languages/`); theme (system / light / dark).
- **Responsive**: Works on desktop and mobile.

## Prerequisites

- Node.js 20.x or higher
- npm

## Installation

```bash
git clone https://github.com/haseebn19/enchant-order.git
cd enchant-order
npm install
```

## Usage

```bash
npm run dev
```

1. Choose an item to enchant.
2. Select enchantments (use quick loadouts or pick manually).
3. Choose “Least XP/levels” or “Least prior work”.
4. Click “Find optimal order” and follow the steps in the result panel.

## Development

### Setup

```bash
npm install
```

### Testing

```bash
npm run test
```

With coverage:

```bash
npm run test:coverage
```

### Linting

```bash
npm run lint
```

## Building

```bash
npm run build
```

Output: `dist/`

## Project Structure

```
enchant-order/
├── src/
│   ├── components/   # EnchantGrid, ItemPicker, LoadoutPicker, SolutionPanel, ItemIcon
│   ├── hooks/        # useLanguage, useTheme, useMatchMedia
│   ├── data/         # enchantData, loadouts, itemCategories, itemIcons
│   ├── lib/          # anvilCalculator, format
│   ├── test/         # Test setup (e.g. matchMedia mock)
│   ├── types/        # TypeScript types
│   ├── App.tsx, App.css
│   ├── main.tsx
│   ├── index.css
│   └── **/*.test.{ts,tsx}   # Tests colocated with source
├── public/           # Static assets (languages/*.json, images/*.gif)
├── index.html
├── vite.config.ts
├── vitest.config.ts
└── .github/workflows/
    ├── ci.yml             # Lint, test, build
    └── validate-lang-json.yml
```

## Adding a language

1. Add `public/languages/<code>.json` (see existing files for shape).
2. Add the language to `LANGUAGES` in `src/constants.ts`.

## Updating enchant data

Edit `src/data/enchantData.ts` to add or change enchantments, item compatibility, and weights. Use the same shape as existing entries (levelMax, weight, incompatible list, items list).

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Credits

- [iamcal/enchant-order](https://github.com/iamcal/enchant-order) - Original tool by Cal Henderson
- [React](https://react.dev) - UI framework
- [Vite](https://vite.dev) - Build tooling
- [TypeScript](https://www.typescriptlang.org) - Language

## License

This project is licensed under the [GNU Affero General Public License v3.0](LICENSE).
