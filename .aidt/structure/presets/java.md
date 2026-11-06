<!-- Preset: Java service with Spring Boot (Maven or Gradle). Edit freely. -->
# Preset · Java (Spring Boot)

Sources:
- Maven standard directory layout: https://maven.apache.org/guides/introduction/introduction-to-the-standard-directory-layout.html
- Spring Boot, structuring your code: https://docs.spring.io/spring-boot/reference/using/structuring-your-code.html
  (no default package; main class in a root package above the others)
- Spring Modulith, application modules: https://docs.spring.io/spring-modulith/reference/fundamentals.html
- Google Java Style Guide, naming: https://google.github.io/styleguide/javaguide.html#s5-naming

## Level 1 · Conventional

```
src/main/java/com/acme/shop/
  ShopApplication.java  main class in the root package
  order/                one package per resource, as Spring's guide shows
    OrderController.java  OrderService.java  OrderRepository.java  Order.java
  invoice/
src/main/resources/      application.yml, db/migration/
src/test/java/com/acme/shop/order/   tests mirror the packages
```

Avoid packages by kind for the whole app (`controllers/`, `services/`) once there are more than a
few resources.

## Level 2 · Modular

Spring Modulith's application modules: each direct subpackage of the root package is a module; only
its top-level package is its API, subpackages (`order.internal`) are private.

```
com/acme/shop/
  order/               OrderManagement.java (API), OrderCompleted.java (event)
    internal/          OrderRepository.java, OrderMapper.java
  invoice/
```

Modules talk through their API or through application events.

## Level 3 · Architecture

Per bounded context: `order/domain` (entities, value objects, rules; no Spring), `order/application`
(use cases, ports), `order/adapter/in/web` and `order/adapter/out/persistence`. Spring annotations live
in adapters and configuration only.

## Naming

| Kind | File | Name |
|---|---|---|
| Package | `com.acme.shop.order` | lower case, no underscores |
| Class | `OrderService.java` | `UpperCamelCase`, one top-level class per file |
| Controller | `OrderController.java` | resource + `Controller` |
| Repository | `OrderRepository.java` | resource + `Repository` |
| Method, field | | `lowerCamelCase` |
| Test | `OrderServiceTest.java`, same package under `src/test/java` | |

## Boundaries

`ApplicationModules.of(ShopApplication.class).verify()` (Spring Modulith) for level 2; ArchUnit rules
for level 3.
