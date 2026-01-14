# Code Formatting and Linting Setup

This project is configured with **Prettier** and **ESLint** for automatic code formatting and linting.

## Configuration Files

- `.prettierrc.json` - Prettier configuration
- `.prettierignore` - Files to ignore during formatting
- `eslint.config.js` - ESLint configuration (ESLint 9 flat config)

## Available Scripts

### Formatting

- `npm run format` - Format all files in the `src` directory
- `npm run format:check` - Check if files are formatted (without modifying them)
- `npm run format:watch` - Watch for file changes and format automatically

### Linting

- `npm run lint` - Check for linting errors
- `npm run lint:fix` - Fix auto-fixable linting errors
- `npm run lint:watch` - Watch for file changes and lint automatically

### Combined

- `npm run fix` - Format and fix all files at once
- `npm run watch` - Watch for file changes and automatically format + lint files

## Automatic Formatting on Save

To enable automatic formatting when you save files (without IDE configuration):

1. **Run the watch script in a separate terminal:**

   ```bash
   npm run watch
   ```

   This will automatically format and lint files whenever you save them.

2. **Or run format and lint watchers separately:**

   ```bash
   # Terminal 1: Format on save
   npm run format:watch

   # Terminal 2: Lint on save
   npm run lint:watch
   ```

The watcher will automatically format/lint files in the `src` directory whenever they are saved.

## Manual Formatting

If you prefer to format manually:

```bash
# Format all files
npm run format

# Check formatting
npm run format:check

# Fix linting issues
npm run lint:fix

# Format and lint everything
npm run fix
```

## Notes

- The formatter watches for changes in `src/**/*.{ts,js,json}` files
- Files in `node_modules`, `dist`, and other ignored directories are not formatted
- Some ESLint errors may require manual fixes (e.g., unused variables, type issues)
