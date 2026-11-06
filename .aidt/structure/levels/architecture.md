<!--
  Structure level 3 of 3: architecture. Bounded contexts per user flow with domain / application /
  infra layers (DDD + hexagonal), adapted from a real project's conventions. The examples are
  TypeScript; each stack preset in ../presets/ maps the same layers to its own conventions.
  The common rules in ../rules.md apply on top. Edit freely.
-->
# Level 3 · Architecture

**Choose it when** the product has real business rules that change often, several user flows
that must not break each other, or a team that wants boundaries checked by a tool. It costs more
files and more names; for a CRUD app or a small team, level 2 (`modular.md`) is usually enough.

**Rule of thumb: whoever opens a folder or a file for the first time knows what it contains by
its name.**

## One bounded context per flow

A **flow** is one goal of the user, from start to finish: *pay and get in*, *invite a host*,
*sign in to the back office*. Not a screen, not an entity, not a technical layer.

```
src/
  shared/          what is truly one: technical base, the core engine, UI components
  <flow>/          everything the flow needs, inside it
    domain/        its own model of the entities and its rules
    application/   use cases and ports
    infra/         adapters: its own queries, external services
    http/          its routes; dto/ with one file per endpoint
    queue/         what it handles from the queue, one file per message
    web/           its screens and hooks (or cli/, backoffice/…)
  delivery/        starts the app and wires everything; registers routes and handlers
```

Rules:

1. **Each flow has its own model.** `checkout` sees an order as an amount and some buyers;
   `documents` sees it as a list of files. No shared `Order` entity; each flow reads only what it
   needs, with its own queries.
2. **Each piece of data has one writer.** Only one flow writes it, so the rules protecting it live
   in one place. Others only read.
3. **A flow does not call another.** When something must happen elsewhere (payment confirmed →
   order active → invoice → email), it leaves a message on a queue and the owning flow handles it.
4. **`shared` holds only what belongs to no flow:** the technical base (results, ids, money,
   dates, database access), the core engine of the product, and UI components.
5. **Boundaries are checked by a tool, not by memory:** a flow cannot import another flow; the UI
   imports only its flow's DTOs and shared UI. Use `dependency-cruiser` (JS/TS), `import-linter`
   (Python) or `depguard` (Go) in the project's check command.

Small codebases (a CLI, a library) keep the slicing by flow and the naming, and drop the layers
they do not need: a 100-line flow does not need `domain/application/infra`.

## File names say what they are: `<what>.<role>.ts`

The suffix tells the role; only two kinds of file have no suffix because their name already says
it: **domain** files (`order.ts`) and **adapters** (`stripe-payment-gateway.ts`: technology +
port).

| Piece | File | Name | Rule |
|---|---|---|---|
| Entity or value | `domain/order.ts` | `Order` | Noun of the flow, singular, no suffix. Its functions are verbs (`confirmPayment`); those that validate start with `parse` and return a `Result`. |
| Errors | `domain/checkout.errors.ts` | `CheckoutErrorCode` | `<Flow>ErrorCode`. Codes in UPPER_SNAKE English that say what happened (`ORDER_NOT_FOUND`). |
| Port | `application/ports/payment-gateway.port.ts` | `PaymentGateway` | The role, never the technology. `Repository` (stores our data), `Gateway` (external service we talk to), `Issuer` / `Sender` / `Reader` (does one thing outside). |
| Use case | `application/use-cases/start-checkout.use-case.ts` | `StartCheckoutUseCase` | Verb + intent of the user + `UseCase`. One per file. |
| Application DTO | in the use case file | `StartCheckoutInput` / `StartCheckoutOutput` | Only data, next to the only code that uses it. |
| API DTO | `http/dto/start-checkout.dto.ts` | `startCheckoutEndpoint`, `startCheckoutRequest` (schema), `StartCheckoutRequest` (type) | One file per endpoint: method, path and request/response schemas. Used by routes and UI. |
| Adapter | `infra/stripe-payment-gateway.ts` | `StripePaymentGateway` | `<technology>-<port>`, no suffix. Test doubles: `InMemory…` (stores in memory), `Fake…` (imitates an external service). |
| Database row | `infra/order.row.ts` | `OrderRow`, `toOrder()` | The table's shape and its conversion. Never leaves `infra`. |
| Queue message | `shared/queue/messages/payment-confirmed.message.ts` | `PaymentConfirmedMessage`, `"payments.payment-confirmed"` | `<emitting-flow>.<fact-in-past-tense>`. One per file, with its data schema. |
| Queue handler | `queue/payment-confirmed.handler.ts` | `handlePaymentConfirmed` | One per message, in the flow that owns the data it changes. Translates the message and calls one use case; safe to run twice. |
| Routes | `http/checkout.routes.ts` | `POST /checkout/orders` | One routes file per flow. Flow prefix, plural resources, `kebab-case`. |
| HTTP status map | `http/error-status.ts` | `errorStatus` | `<Flow>ErrorCode` → HTTP status, exhaustive. |
| Screen | `web/pay.screen.tsx` | `PayScreen` | `<what>.screen.tsx`, only renders. |
| Hook | `web/start-checkout.hook.ts` | `useStartCheckout` | `<use-case>.hook.ts`, `use<UseCase>`. |
| CLI command | `cli/start-checkout.command.ts` | `startCheckoutCommand` | `<what>.command.ts`: parses arguments, calls the use case, prints. |
| Tests | `order.test.ts`, `order.row.db.test.ts` | `it("rejects a payment already confirmed")` | Next to the file, with its name, in business language. |

**Three kinds of DTO, each in its layer.** `StartCheckoutRequest` (HTTP) becomes
`StartCheckoutInput` in the routes; the use case hands validated data to the domain; `OrderRow`
(database) becomes `Order` in `infra`. The domain knows none of the three.

## Review checklist

- [ ] New code lives in the flow that owns the user goal; `shared` only got what belongs to no flow.
- [ ] No flow imports another; cross-flow effects go through a message.
- [ ] Each piece of data written by one flow only.
- [ ] Every file name tells its role (`.use-case.ts`, `.port.ts`, `.dto.ts`, `.handler.ts`…); ports named by role, adapters by technology + port.
- [ ] DTOs stay in their layer; rows never leave `infra`; the domain imports none of them.
- [ ] Tests sit next to the file they test.
