## 1. Bookmark archiving

- [x] 1.1 Add the repository contract and persistence update for an owned active bookmark's archived state.
- [x] 1.2 Add and register a bookmark archiving use case that enforces ownership and reports unavailable bookmarks with the existing domain error.
- [x] 1.3 Add the authenticated `PATCH /api/bookmarks/:id/archive` controller and route, returning the bookmark ID and archived state.

## 2. Route and documentation cleanup

- [x] 2.1 Remove the duplicate `DELETE /:id` route declaration while preserving the existing delete behavior.
- [x] 2.2 Document the archive endpoint in OpenAPI and the README endpoint table.

## 3. Verification

- [x] 3.1 Verify the archive success, repeated archive, unavailable bookmark, and delete endpoint scenarios.
- [x] 3.2 Run `npm run build`, `npx tsc --noEmit -p tsconfig.json`, and `npx eslint src scripts`.
