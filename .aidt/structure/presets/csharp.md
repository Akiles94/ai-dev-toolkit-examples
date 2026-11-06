<!-- Preset: C# / ASP.NET Core Web API. Edit freely. -->
# Preset · C# (.NET)

Sources:
- Common web application architectures: https://learn.microsoft.com/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures
  (single project, then Clean Architecture: `ApplicationCore`, `Infrastructure`, `Web`)
- Identifier names: https://learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/identifier-names
- Coding conventions: https://learn.microsoft.com/dotnet/csharp/fundamentals/coding-style/coding-conventions

## Level 1 · Conventional

The single-project layout of the ASP.NET Core template:

```
Shop.Api/
  Program.cs            host and wiring
  Controllers/          one per resource: OrdersController.cs
  Services/             one per resource: OrderService.cs
  Data/                 AppDbContext.cs, Configurations/, Migrations/
  Models/               entities and DTOs, grouped by resource once it grows: Models/Orders/
Shop.Api.Tests/         mirrors the project's folders
```

One type per file, file named after the type; folders match namespaces.

## Level 2 · Modular

Vertical slices by feature inside the same project:

```
Shop.Api/
  Program.cs
  Features/
    Orders/             CreateOrder.cs (endpoint + request + handler), GetOrder.cs, Order.cs
    Invoices/
  Shared/
    Persistence/  Auth/  one subject per folder
```

## Level 3 · Architecture

Clean Architecture as Microsoft's guide describes it, one project per layer:

```
Shop.Domain/            entities, value objects, domain errors; no references
Shop.Application/       use cases, ports (interfaces), DTOs; references Domain
Shop.Infrastructure/    EF Core, external services implementing the ports
Shop.Api/               controllers or minimal endpoints, composition root
```

Within each project, folders by bounded context (`Orders/`, `Invoices/`).

## Naming

| Kind | File | Name |
|---|---|---|
| Class, record | `Order.cs` | `PascalCase`, one per file |
| Interface | `IOrderRepository.cs` | `I` prefix |
| Controller | `OrdersController.cs` | plural resource + `Controller` |
| Use case | `CreateOrder.cs` | verb + noun (`CreateOrderHandler`) |
| Async method | | `GetOrderAsync` |
| Test | `OrderServiceTests.cs` in `*.Tests` | `Method_State_Result` |

## Boundaries

Project references enforce the layers at compile time; inside a project, NetArchTest or ArchUnitNET.
