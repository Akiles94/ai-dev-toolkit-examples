<!-- Preset: React Native with Expo Router. Layout and names per level. Edit freely. -->
# Preset · React Native (Expo)

Sources:
- Expo Router, `src` directory: https://docs.expo.dev/router/reference/src-directory/
- Expo, app folder structure best practices: https://expo.dev/blog/expo-app-folder-structure-best-practices
  (`src/app` only for routes, each route returns a screen; `components/`, `screens/`, `hooks/`,
  `server/`; kebab-case or PascalCase consistently; platform files `.ios.tsx` / `.android.tsx`)

The Expo article also lists a `utils/` folder; the common rules (`../rules.md`) replace it with subject
folders (`format/`, `storage/`).

## Level 1 · Conventional

```
src/
  app/                 routes only: (tabs)/, orders/[id].tsx, api/orders+api.ts
  screens/             one folder per complex screen: orders/index.tsx + its own components/
  components/          reusable UI; a complex one gets its folder with index.tsx
  hooks/
  server/              code shared by API routes (auth, database)
assets/
```

## Level 2 · Modular

```
src/
  app/                 route files import a screen from its feature and return it
  features/
    orders/            screens/, components/, hooks/, orders.api.ts, order.types.ts, index.ts
    profile/
  shared/
    ui/  http/  storage/  format/
```

## Level 3 · Architecture

Per feature: `domain/` (types and rules, no React Native), `application/` (use cases, ports),
`infra/` (HTTP, secure storage, device APIs as adapters), `ui/` (screens, components, hooks).
Device and platform APIs sit behind ports so use cases are tested without a device.

## Naming

| Kind | File | Name |
|---|---|---|
| Route | `app/orders/[id].tsx` | framework names |
| Screen | `orders-screen.tsx` | `OrdersScreen` |
| Component | `order-card.tsx` | `OrderCard` |
| Platform variant | `order-card.ios.tsx` next to `order-card.tsx` | |
| Hook | `use-orders.ts` | `useOrders` |
| Test | next to the file, or `__tests__/` | |

## Boundaries

`eslint-plugin-boundaries` or `dependency-cruiser`, as in the React preset.
