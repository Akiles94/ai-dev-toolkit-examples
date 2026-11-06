<!--
  Template for .aidt/structure.md: the structure this project follows. Written once with the
  developer (new project) or after an audit (existing project), committed, and read by the planner,
  builder and reviewer. Project rules in AGENTS.md still win. Remove these comments when filled.
-->
# Project structure

| | |
|---|---|
| Level | conventional / modular / architecture |
| Preset | <stack preset in .aidt/structure/presets/, or "own"> |
| Origin | new project / existing, kept as is / existing, improved / existing, migrating to <level> |

## Layout

<!-- The tree of the source folders with one line per folder: what goes in it. -->

```
src/
```

## Naming

<!-- Casing and suffix per kind of file. Point to the preset's table and list only the differences. -->

## Boundaries

<!-- What may import what, and the command that checks it (e.g. npx depcruise src). -->

## Exceptions

<!-- Deliberate deviations from .aidt/structure/rules.md, each with its reason. The audit skips them.
     Example: "src/legacy/** keeps its own layout until the migration reaches it." -->

## Migration

<!-- Existing projects only. Target, current status and the workflow task that moves each part.
     New code follows the target from day one; old code moves in reviewed sections. -->
