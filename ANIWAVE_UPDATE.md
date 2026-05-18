# AniWave Extension Update

## Mobile Player Updates (v3.8.23)

Latest push includes mobile player UI revamp and fixes.

## AniWave Extension Status

The original AniWave platform permanently shut down in August 2024, meaning all existing open-source community extensions for it are broken and abandoned.

While the underlying configuration file (aniwaves.json) has been added to the extensions folder for the aniwaves.ru clone site, actually making it fetch episodes requires building a complex web scraper from scratch to bypass the clone's Cloudflare protections and decrypt its custom video players.

This is a very involved process that requires hours of dedicated reverse-engineering.

## Other Fixes in This Release

- VideoCore: Fixed audio selection
- VideoCore: Fixed auto next for local files
- VideoCore: Disallow miniplayer in fullscreen app mode
- VideoCore: Fixed torrent stream playback cancellation logic
- VideoCore: Refactored escape key handling
- Manga: Fixed incorrect progress updates on next chapter
- Schedule: Fixed incorrect timezone in modals
- Hide Spoilers: Fixed torrent selection modal handling
- Issue Recorder: Fixed query error serialization
- Torrent Search: Fixed runtime error causing fewer results
- Core: Disabled request body limits
- Denshi: Skip initial view transition on content load