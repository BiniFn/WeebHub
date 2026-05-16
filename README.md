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
  <a href="https://weebhub.app/docs">Docs</a> |
  <a href="https://weebhub.app/download">Download</a> |
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

1. Open Discord on the same computer as WeebHub.
2. Start WeebHub with `go run main.go`.
3. Open `http://127.0.0.1:43211`.
4. Go to Settings, then Discord.
5. Turn on Rich Presence for Anime and Manga.
6. Leave `Hide GitHub Repo Button` turned off if you want Discord to show the WeebHub repo link.

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

- Website: [weebhub.app](https://weebhub.app)
- Docs: [weebhub.app/docs](https://weebhub.app/docs)
- Download page: [weebhub.app/download](https://weebhub.app/download)
- GitHub: [BiniFn/WeebHub](https://github.com/BiniFn/WeebHub)
