# Farm Admin

A desktop admin app for the farm owner — one place to track crops, livestock, sales/orders, expenses, staff, and tasks. All data is stored locally on your computer (no cloud, no account needed).

## What's included

- **Dashboard** — revenue/expenses/profit this month, low stock alerts, upcoming tasks, recent orders
- **Crops** — plots, planting/harvest dates, quantities, low-stock alert threshold
- **Livestock** — type, tag/group ID, count, health status
- **Customers** — contact list used when creating orders
- **Orders** — line items with quantity/price, auto-calculated totals, status tracking
- **Expenses** — categorized costs with amounts and payment method
- **Staff** — roster with pay rate/type
- **Tasks** — assign to staff, due dates, priority, status

## Requirements

- [Node.js](https://nodejs.org) version 18 or newer (includes `npm`). Download the "LTS" installer for Mac and run it — this is a one-time setup.

## Running the app

Open Terminal, go to this folder, and run:

```bash
npm install
npm start
```

The first `npm install` downloads what the app needs (takes a minute or two). `npm start` builds and launches the app in its own window. After that, you can just run `npm start` any time you want to open it.

## Your data

All records are saved locally in a JSON file on your computer at:

```
~/Library/Application Support/farm-admin/farm-data.json
```

Nothing is sent over the internet. To back up your data, just copy that file somewhere safe. To reset the app, delete it.

## Building a standalone app (optional)

If you want an installer you can double-click without opening Terminal each time:

```bash
npm run dist
```

This uses `electron-builder` to produce a packaged app in the `dist-electron` folder, built for whatever OS you run the command on (run it on your Mac to get a Mac app).

## Project structure

```
electron/       Electron main process, preload script, and local JSON data layer
src/            React frontend (pages, components, styles)
```

Feel free to ask for changes — new fields, reports, additional modules, etc.
