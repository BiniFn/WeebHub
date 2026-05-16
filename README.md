<p align="center">
  <a href="https://weebhub.app/">
    <img src="docs/images/weebhub-logo.png" alt="WeebHub logo" width="72" />
  </a>
</p>

<h1 align="center">WeebHub</h1>

<p align="center">
  A local anime and manga media server with a browser-based web app.
</p>

<p align="center">
  <a href="https://binifn.github.io/WeebHub/docs">Docs</a> |
  <a href="https://binifn.github.io/WeebHub/download">Download</a> |
  <a href="https://github.com/BiniFn/WeebHub/releases">Releases</a>
</p>

## What is WeebHub?

WeebHub lets you run a media server on your own computer and use it from your browser. It is built for managing local anime and manga libraries, streaming media, reading manga, and keeping your collection organized.

WeebHub does not provide, host, or distribute media. You are responsible for using your own legally obtained files and following your local laws.

## Download

Desktop installers are coming soon:

- Windows app: Coming soon
- Mac app: Coming soon
- Linux app: Coming soon

For now, you can run WeebHub as a local web app from your terminal.

## Run WeebHub Locally

You need [Go](https://go.dev/doc/install) installed.

```bash
git clone https://github.com/BiniFn/WeebHub.git
cd WeebHub
go run main.go
```

Then open this in your browser:

```text
http://127.0.0.1:43211
```

If you already downloaded the source code, open a terminal inside the WeebHub folder and run:

```bash
go run main.go
```

## First Setup

1. Start the server with `go run main.go`.
2. Open `http://127.0.0.1:43211`.
3. Choose the folder where your anime or manga files are stored.
4. Scan your library.
5. Start watching or reading from the web app.

## Discord Rich Presence

1. Install the Discord desktop app.
2. Sign in to the Discord account you want WeebHub to use.
3. Keep Discord open in the background. Browser-only Discord will not connect to Rich Presence.
4. Start WeebHub with `go run main.go`.
5. Open `http://127.0.0.1:43211`.
6. Go to Settings, then Discord.
7. Turn on Rich Presence for Anime and Manga.
8. Leave `Hide GitHub Repo Button` turned off if you want Discord to show the WeebHub repo link.

If Discord does not show WeebHub, fully quit Discord, open it again, and restart WeebHub.

## Main Features

- Local anime and manga library management
- Browser-based web app
- Anime streaming from local files
- Manga reader
- AniList integration
- Torrent and debrid integrations through supported settings and extensions
- Offline library access
- Custom themes and UI settings

## Build From Source

To build the web interface and server manually, see [DEVELOPMENT_AND_BUILD.md](https://github.com/BiniFn/WeebHub/blob/main/DEVELOPMENT_AND_BUILD.md).

## Links

- Website: [binifn.github.io/WeebHub](https://binifn.github.io/WeebHub/)
- Docs: [binifn.github.io/WeebHub/docs](https://binifn.github.io/WeebHub/docs)
- Download page: [binifn.github.io/WeebHub/download](https://binifn.github.io/WeebHub/download)
- GitHub: [BiniFn/WeebHub](https://github.com/BiniFn/WeebHub)
