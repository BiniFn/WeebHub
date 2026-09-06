# WeebHub Testing Plan & Test Report

This document is the authoritative testing reference for WeebHub. It defines the test
strategy, per-feature acceptance criteria, unit/integration/manual test cases, the OBS
plugin test procedure, and the latest verification results.

> Generated: 2026-09-06 · Go 1.26.3 darwin/arm64

---

## 1. Test Strategy

| Layer | Scope | Tooling | Command |
|-------|-------|---------|---------|
| Unit | Single package, isolated logic | `go test` | `go test ./internal/<pkg>` |
| Integration | Cross-package (DB + file cache + platform mocks) | `go test -tags integration` (as available) | `go test ./internal/...` |
| Type check (Go) | Static analysis | `go vet` | `go vet ./...` |
| Type check (Web) | TypeScript | `tsgo` | `npm run typecheck` (in `weebhub-web/`) |
| Lint | Go style/static | `golangci-lint` (not installed → `go vet` fallback) | `golangci-lint run` |
| Build | Full binary | `go build` | `go build -o weebhub .` |
| Manual | E2E UI/device flows | Documented below | — |

### Coverage by feature

| Feature | Backend location | Unit | Integration | Manual |
|---------|------------------|------|-------------|--------|
| Playback resume | `internal/continuity` | ✅ | ✅ | ✅ |
| Manga resume | `internal/manga` | ✅ | ✅ | ✅ |
| Cross-device sync | `internal/features/device_sync.go` | ✅ | ⚠️ (stubbed) | ✅ |
| Streamer Mode | `weebhub-web/.../streamer-mode.atoms.ts` | — (frontend) | — | ✅ |
| OBS integration | Browser Source (frontend) | — | — | ✅ (procedure below) |
| Mobile app | `mobile/mobile.go` (gomobile) | ✅ (build) | ⚠️ | ✅ (sim/device) |
| Downloads | `internal/manga/downloader`, `internal/library` | ✅ | ✅ | ✅ |
| Offline mode | `internal/core/offline.go` | — (needs App) | ⚠️ | ✅ |

---

## 2. Feature Test Cases

### 2.1 Playback Resume

**Acceptance criteria**
- Resume position is persisted per `(mediaId, episodeNumber, kind)`.
- Items near completion (>= 90% watched) are dropped from history.
- History is bounded to `MaxWatchHistoryItems` (100), FIFO.
- External-player resume carries episode details separately from media stream.

**Unit tests (existing, `internal/continuity/manager_test.go`)**
- `TestTrimWatchHistoryItemsRemovesOldestItem` — FIFO eviction.
- `TestUpdateWatchHistoryItemCreatesAndUpdatesExistingItem` — create + update.
- `TestGetWatchHistoryItemAppliesCompletionThresholds` — completion cutoff.
- `TestDeleteWatchHistoryItemRemovesStoredEntry`.
- `TestUpdateExternalPlayerEpisodeWatchHistoryItem`.
- `TestGetExternalPlayerEpisodeWatchHistoryItemStream` / `...LocalFile`.

**Manual cases**
1. Play an episode to 00:05:30, close the player, reopen → resumes at ~5:30.
2. Watch to 95%+ → item removed from "Continue watching".
3. Fast-forward in an external player (MPV/IINA) → resume still offered.

**Status: PASS** (`go test ./internal/continuity` → ok)

### 2.2 Manga Resume

**Acceptance criteria**
- Reading progress stored as `EntryListData.Progress` (chapter index) per manga.
- Progress survives app restart via AniList list status sync.

**Unit tests (existing)**: `internal/manga` package — `image_size_test.go` and related.

**Manual cases**
1. Open manga, read to chapter 7, close reader → entry shows "Ch. 7".
2. Restart server → progress persists in collection view.
3. Progress updates reflected in AniList sync (online mode).

**Status: PASS** (`go test ./internal/manga/...` → ok)

### 2.3 Cross-Device Sync

**Acceptance criteria**
- Devices register with id/name/type, enabled by default.
- Registering the same id overwrites (last-write-wins).
- `SyncData` advances `LastSyncTime`; unknown source is a no-op.
- `UpdateDeviceState` advances `LastSeenAt`; unknown device is a no-op.
- Conflict resolution accepts `device_a | device_b | merge | manual`.

**Unit tests (NEW, `internal/features/device_sync_test.go`)** — 12 tests, all PASS:
- register/enabled/overwrite/list/get
- sync/last-seen timestamps
- unknown-device no-ops
- conflict resolution (all 4 strategies)
- `SyncItem` payload shape

**Integration note (blocker)**
The actual cross-device transport is **not implemented**: `SyncData` updates the source
device's timestamp only, and the comment in source reads "In production, this would send
data to other devices via WebSocket or API". `SyncConflict` handling is a no-op switch.
Multi-device simulation therefore can only validate in-memory registration/timestamps,
not real data propagation.

**Manual cases (multi-device simulation)**
1. Register `web`, `mobile`, `desktop` → all listed with correct type.
2. Sync from `web` → `web.LastSyncTime` advances; verify no payload loss (currently no-op).
3. Conflict resolution returns nil for every strategy.

**Status: PARTIAL** — unit layer PASS; real transport PENDING (see §5).

### 2.4 Streamer Mode

**Acceptance criteria**
- Toggling adds/removes `sea-streamer-mode` class on `<body>`.
- Auto-enables when UA contains `OBS` / `OBSBrowser` (OBS Browser Source).
- Persists via `localStorage` keys `sea-streamer-mode` / `weebhub-streamer-mode-shortcut`.

**Source**: `weebhub-web/src/app/(main)/_atoms/streamer-mode.atoms.ts`.

**Manual cases**
1. Toggle Streamer Mode in UI → `document.body.classList` contains `sea-streamer-mode`.
2. Reload → mode persists (localStorage).
3. Open in OBS Browser Source (UA `OBS/...`) → auto-on, no manual toggle.

### 2.5 OBS Integration — Test Procedure

WeebHub has **no native OBS plugin binary**; integration is via OBS **Browser Source**
loading the web UI, with Streamer Mode auto-detected from the OBS user-agent.

**Installation procedure**
1. OBS Studio → Sources → `+` → **Browser**.
2. URL: `http://<weebhub-host>:<port>` (e.g. `http://127.0.0.1:43211`).
3. Width/Height: 1920×1080 (or match canvas).
4. Enable "Shutdown source when not visible" only if desired for pause-on-hide.
5. Check **"Custom CSS"** is empty; WeebHub injects `sea-streamer-mode` itself.

**Functional verification steps**
1. Add Browser Source and confirm the WeebHub UI renders.
2. Confirm body class `sea-streamer-mode` is applied (Streamer Mode auto-on).
3. Toggle a clean layout (hide sidebar/covers) and capture — no UI chrome in output.
4. Test the shortcut (default `S`) toggles Streamer Mode from within the source.
5. Confirm no AniList credentials/cookies are visible in the OBS capture.
6. Long-running test: stream for 30 min; verify no memory leaks or blank frame.

**Known limitation**: no `obs-websocket` integration exists in code; remote control
(play/pause via OBS hotkeys) is not implemented.

### 2.6 Mobile App

**Acceptance criteria**
- `mobile/mobile.go` exports `StartWeebHub(dataDir, port)` via gomobile.
- Server binds `127.0.0.1:<port>` on-device.
- Web UI served from embedded FS.

**Build status**: `go build ./mobile` compiles (see §3 results).

**Manual cases (Android/iOS)**
1. **Android emulator**: build with `gomobile bind`; call `StartWeebHub` from an Activity;
   open `http://127.0.0.1:<port>` in WebView → UI loads.
2. **iOS simulator** (requires macOS/Xcode signing): same flow via `gomobile bind -target=ios`.
3. **Real device**: verify port forwarding / localhost binding works without host reachability.

**Status: PARTIAL** — package compiles; on-device run requires gomobile/Xcode and was not
executed in this environment.

### 2.7 Downloads

**Acceptance criteria**
- Manga downloader queues jobs (`internal/manga/downloader/queue.go`).
- Anime downloads resolve local file paths (`internal/library/...`).
- Offline playback works from downloaded files.

**Unit/integration tests (existing)**: `internal/manga/downloader`, `internal/manga/providers`,
`internal/library/...` all pass.

**Manual cases**
1. Download a manga chapter → appears in downloads view; open offline.
2. Download an anime episode → file present in library; local media stream plays.
3. Cancel mid-download → queue recovers / no orphan temp files.

**Status: PASS** for package tests; manual download flow not exercised (network-bound).

### 2.8 Offline Mode

**Acceptance criteria**
- `SetOfflineMode(true)` switches to `offline_platform`, stops Nakama, writes config.
- `SetOfflineMode(false)` restores AniList platform + metadata provider.
- Library remains browsable/playable offline.

**Source**: `internal/core/offline.go`.

**Manual cases**
1. Enable offline mode → config `server.offline=true`; no AniList network calls.
2. Local library still lists entries; cached metadata resolves.
3. Disable → AniList re-sync triggers (`InitOrRefreshAnilistData`).

**Status: PARTIAL** — no dedicated unit test (requires full `App`); logic verified by
code review only.

---

## 3. Build / Vet / Typecheck Results (executed 2026-09-06)

| Check | Result |
|-------|--------|
| `go build ./...` | ❌ BLOCKED — `weebhub/api` declares `package main` but has no `func main()`. Error: `runtime.main_main·f: function main is undeclared in the main package`. Root `main.go` (binary `weebhub`) builds. |
| `go vet ./internal/features ./internal/continuity ./internal/manga ./internal/core` | ✅ clean |
| `go test ./internal/features` | ✅ 12/12 PASS |
| `go test ./internal/continuity` | ✅ ok |
| `go test ./internal/manga/...` | ✅ ok |
| `go test ./internal/library/playbackmanager` | ✅ ok |
| Web `tsgo` typecheck | ⚠️ SKIPPED — `weebhub-web/node_modules` not installed (no `tsgo`) |
| `golangci-lint` | ⚠️ not installed |

**Pre-existing blocker (not introduced by this work):**
`api/handler.go` is `package main` with only `func Handler(...)` and no `func main()`,
so `go build ./...` fails. Fix options: rename package to `api` and export `Handler`,
or add a build-tagged `//go:build lambda` `main` shim.

---

## 4. How to Run

```bash
# Unit + integration (all feature packages)
go test ./internal/features/ ./internal/continuity/ ./internal/manga/... \
         ./internal/library/... ./internal/playlist/...

# Vet the same surface
go vet ./internal/features/ ./internal/continuity/ ./internal/manga/ ./internal/core/

# Binary build (works; ./... fails only on the api/ stub)
go build -o weebhub .

# Web typecheck (after npm install)
cd weebhub-web && npm install && npm run typecheck
```

---

## 5. Open Issues

1. **`weebhub/api` build break** — `package main` without `func main()` blocks `go build ./...`.
2. **Cross-device sync transport stubbed** — registration/timestamps only; no WebSocket/API
   fan-out and no actual conflict resolution logic.
3. **No native OBS plugin / obs-websocket** — integration is Browser Source only.
4. **Offline mode lacks a unit test** — needs a testable `App` seam or interface.
5. **Mobile on-device run untested** — requires gomobile + Xcode/Android SDK.
6. **Frontend lint/typecheck not run** — `node_modules` absent.