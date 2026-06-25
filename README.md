# Workshop

Workshop is a personal platform for quickly turning ideas into working tools and experiments without rebuilding the same app shell, UI patterns, routing, imports, exports, and supporting infrastructure for every new idea.

This repository is Cycle 0. The goal of this cycle is a clean reusable application shell, not a finished product feature set.

Repository: https://github.com/winesett/workshop

## Foundation

Workshop is currently based on:

- Vite
- React
- TypeScript
- TanStack Router
- Tailwind
- shadcn/ui components

The responsive shell, sidebar behavior, header primitives, command menu, theme switching, global styles, and customized UI components are preserved as the application foundation.

## Commands

Install dependencies:

```sh
pnpm install
```

Run the development server:

```sh
pnpm dev
```

Build for production:

```sh
pnpm build
```

## Current Routes

- `/` redirects to `/workshop`
- `/workshop` shows Projects
- `/workshop/canvas` shows the temporary Canvas placeholder
- `/workshop/settings` shows appearance settings

## Cycle 0 Scope

Cycle 0 strips the starter demo product surface down to the core Workshop shell. It does not add tldraw, persistence, custom canvas objects, AI features, login systems, cloud services, databases, multiplayer, deployment infrastructure, or an experiment/plugin architecture.
