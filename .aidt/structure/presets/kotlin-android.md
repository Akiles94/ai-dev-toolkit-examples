<!-- Preset: Android app in Kotlin (Jetpack Compose, Gradle). Edit freely. -->
# Preset · Kotlin (Android)

Sources:
- Guide to app architecture: https://developer.android.com/topic/architecture (UI layer, data layer,
  optional domain layer; unidirectional data flow)
- Guide to Android app modularization: https://developer.android.com/topic/modularization
  (`app`, `feature:*` and `core:*` modules)
- Kotlin coding conventions, directory structure and naming: https://kotlinlang.org/docs/coding-conventions.html

## Level 1 · Conventional

One `app` module, packages by layer as the architecture guide describes, grouped by feature inside:

```
app/src/main/java/com/acme/shop/
  MainActivity.kt
  ui/
    orders/            OrdersScreen.kt, OrdersViewModel.kt, OrdersUiState.kt
    theme/
  data/
    orders/            OrdersRepository.kt, OrdersRemoteDataSource.kt, OrderDto.kt
  di/                  dependency injection modules
app/src/test/  app/src/androidTest/   tests mirror the packages
```

## Level 2 · Modular

Gradle modules from the modularization guide:

```
app/                   navigation and wiring only
feature/
  orders/              screens, ViewModels; depends on core modules, never on another feature
  profile/
core/
  data/  network/  database/  designsystem/  model/   one subject per module
```

Features never depend on each other; navigation between them goes through `app`.

## Level 3 · Architecture

The guide's optional **domain layer** becomes mandatory: per feature or context, `domain`
(models and use cases: `GetOrdersUseCase`, plain Kotlin, no Android), `data` (repositories
implementing domain interfaces, data sources) and `ui`. ViewModels call use cases only.

## Naming

| Kind | File | Name |
|---|---|---|
| Source file | `OrdersRepository.kt` | named after its single class, `PascalCase` |
| Several top-level declarations | `OrderFormatting.kt` | what they have in common (never `Util`) |
| Composable screen | `OrdersScreen.kt` | `OrdersScreen` |
| ViewModel | `OrdersViewModel.kt` | screen + `ViewModel` |
| Use case | `GetOrdersUseCase.kt` | verb + noun + `UseCase` |
| Package | `com.acme.shop.orders` | lower case; folders follow packages, common root omitted |
| Test | `OrdersViewModelTest.kt` | |

## Boundaries

Gradle module dependencies enforce level 2 at build time; Konsist or ArchUnit for package rules inside
a module.
