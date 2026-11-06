<!--
  Structure level 2 of 3: modular by feature. The middle ground for teams that want code to scale
  without DDD or layers. Each stack preset in ../presets/ shows this layout in its own terms; the
  common rules in ../rules.md apply on top. Edit freely.
-->
# Level 2 · Modular by feature

**Choose it when** the app has several features that grow independently and you want each change to
touch one folder, without the cost of an architecture. Most product teams fit here.

## What it means

1. **Top level by feature, not by kind.** Everything a feature needs lives in its folder: its
   screens or endpoints, its API calls, its state, its types, its tests.

   ```
   src/
     app/               entry point, routing, wiring (framework files stay where it wants them)
     features/
       checkout/        components/, api/, hooks/ or services/, model/, checkout.test.*
       invoices/
     shared/
       ui/              design-system components used by several features
       http/            the API client (one), not the API calls
       money/           one subject per folder
   ```

2. **Kind folders only inside a feature**, and only when the feature has enough files to need them.
3. **Each feature has one public entry** (`index.ts`, an exported package, a public class). Other
   features import only that; the rest is private.
4. **`shared` is for what belongs to no feature**, one subject per folder, and never imports a
   feature. Something used by one feature stays in it, even if it "might be reused".
5. **A feature is a user goal or a business area** (`checkout`, `invoices`, `onboarding`), named in
   the domain's words; not a technical layer (`api`, `forms`) and not one screen.

## When to move up

- The same entity is written by several features and its rules drift apart → level 3 (one writer
  per piece of data, rules in a domain layer).
- Features need different models of the same thing (`order` for payment vs. for shipping) → level 3.

## Review checklist

- [ ] New code lives in the feature that owns the user goal; `shared` only got what belongs to none.
- [ ] Features import each other only through their public entry; `shared` imports no feature.
- [ ] Kind folders appear inside a feature only when it needs them.
- [ ] Feature names come from the domain, not from technology.
- [ ] The common rules' checklist (`../rules.md`) passes.
