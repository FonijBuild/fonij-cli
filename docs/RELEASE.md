# v1 release checklist

Before `npm publish`:

1. Run `pnpm install` and commit the generated `pnpm-lock.yaml`.
2. Run `pnpm check`.
3. Run `pnpm pack:check` and inspect the tarball contents.
4. Create and publish `FonijBuild/fonij-catalog`.
5. Add `.fonij/starter.json` to every official starter.
6. Tag stable starter versions and pin catalog `ref` values to those tags instead of `main`.
7. Smoke-test at least:
   - web-only create
   - web + api monorepo create
   - mobile + api create
   - browser-extension create
   - `fonij init` on an existing Vite app
   - `fonij add api --dry-run` and real migration
   - `fonij agent prepare`
8. Verify CI on Linux, macOS and Windows.
9. Confirm the npm scope/package name is owned by you. Change only `package.json.name` if necessary; keep the `fonij` bin name.
10. Publish with `npm publish --access public` or `pnpm publish --access public`.
