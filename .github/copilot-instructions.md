# Copilot instructions

Project context Copilot should apply to every session in this repository.

## Stack

- Framework: Astro (static output).
- Language: TypeScript.
- Styling: plain CSS in the base layout.

## Conventions

- Keep components small and focused.
- Prefer semantic HTML and accessible markup.
- Do not close, or add closing keywords for, the exercise walkthrough issue (issue #1) in any pull request. The exercise's GitHub Actions workflows manage that issue. When you open a pull request for app work, link only the specific app work-item issue you are implementing.

## Persistence and hydration rules

- Persist bookmarks in browser localStorage under the `mona-bookmarks` key; validate stored data before using it.
- Run browser-only code behind a `client:load` boundary (or Astro's client `<script>`); never access localStorage or other browser APIs during SSR or the static build.
