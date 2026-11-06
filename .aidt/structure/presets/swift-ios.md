<!-- Preset: iOS app in Swift (SwiftUI, Xcode, Swift packages). Edit freely. -->
# Preset · Swift (iOS)

Sources:
- Swift API Design Guidelines: https://www.swift.org/documentation/api-design-guidelines/
- Organizing your code with local packages: https://developer.apple.com/documentation/xcode/organizing-your-code-with-local-packages
- Swift Package Manager layout (`Sources/<Target>`, `Tests/<Target>Tests`): https://www.swift.org/getting-started/library-swiftpm/

Apple does not prescribe folders inside an app target; local Swift packages are its way to split code.

## Level 1 · Conventional

One app target, folders (Xcode groups) by feature:

```
Shop/
  ShopApp.swift          @main entry
  Orders/                OrdersView.swift, OrdersViewModel.swift, OrderRow.swift
  Profile/
  Services/              one file per external service: OrdersAPI.swift, KeychainStore.swift
  Resources/             Assets.xcassets, Localizable.xcstrings
ShopTests/               mirrors the app's folders
```

## Level 2 · Modular

Local Swift packages, one per feature, as Apple's guide shows:

```
Shop/                    app target: entry point and navigation only
Packages/
  OrdersFeature/         Sources/OrdersFeature/, Tests/OrdersFeatureTests/
  ProfileFeature/
  Networking/  DesignSystem/  Persistence/   one subject per package
```

A feature package depends on shared packages, never on another feature; `public` marks its API.

## Level 3 · Architecture

Per feature package, targets by layer: `OrdersDomain` (models, use cases, protocols for ports; no
SwiftUI or UIKit), `OrdersData` (implementations: URLSession, SwiftData, Keychain) and `OrdersUI`
(views and view models calling use cases). The app target wires the implementations in.

## Naming

| Kind | File | Name |
|---|---|---|
| Type | `OrdersViewModel.swift` | `UpperCamelCase`, file named after its main type |
| Extension | `Order+Formatting.swift` | `Type+Purpose` |
| View | `OrdersView.swift` | `…View` |
| Protocol (port) | `OrdersRepository.swift` | a noun for what it is, `-able`/`-ing` for a capability |
| Method, property | | `lowerCamelCase`, reads as an English phrase at the call site |
| Test | `OrdersViewModelTests.swift` | |

## Boundaries

Package dependencies in `Package.swift` enforce level 2 and 3 at build time; access control (`internal`
by default, `public` for the API) keeps the rest private.
