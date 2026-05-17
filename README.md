<p align="center">
  <a href="https://binifn.github.io/WeebHub/">
    <img src="web/weebhub-logo-v2.png" alt="WeebHub logo" width="72" />
  </a>
</p>

<h1 align="center">WeebHub</h1>

<p align="center">
  A local anime and manga media server with a browser-based web app.
</p>

<p align="center">
  <a href="https://binifn.github.io/WeebHub/">Docs</a> |
  <a href="https://binifn.github.io/WeebHub/download">Download</a> |
  <a href="https://github.com/BiniFn/WeebHub/releases">Releases</a>
</p>

---

## Credits & Attribution

WeebHub is a modified fork of [Seanime](https://github.com/5rahim/seanime) and is based on the original work created by the developers behind [Seanime](https://seanime.app/).

This project exists as a personal fork focused on experimentation, improvements, bug fixes, and additional features. Several issues from the original repository have been fixed alongside various UI and quality-of-life improvements.

A dedicated mobile app is currently in development. In the meantime, Android users can already run WeebHub locally through Termux, similar to running the application on a PC using a local server setup.

Full credit for the original foundation, architecture, and core functionality belongs to the Seanime developers and contributors. Please support the original project and check out their work.

---

## What is WeebHub?

WeebHub lets you run a media server on your own computer and use it directly from your browser. It is designed for managing local anime and manga libraries, streaming media, reading manga, and organizing your collection in one place.

WeebHub does not provide, host, or distribute media. Users are responsible for their own legally obtained files and compliance with local laws.

---

## Download

Desktop installers are available through GitHub Releases:

- Windows
- macOS
- Linux

You can also run WeebHub directly as a local web app from your terminal.

### Releases

https://github.com/BiniFn/WeebHub/releases

---

## Run WeebHub Locally

You need [Go](https://go.dev/doc/install) installed.

Clone the repository:

```bash
git clone https://github.com/BiniFn/WeebHub.git
cd WeebHub
```

Start the server:

```bash
go run main.go
```

Open this in your browser:

```text
http://127.0.0.1:43211
```

If you already downloaded the source code, simply open a terminal inside the WeebHub folder and run:

```bash
go run main.go
```

---

## First Setup

1. Start the server with `go run main.go`
2. Open `http://127.0.0.1:43211`
3. Choose the folder containing your anime or manga files
4. Scan your library
5. Start watching or reading from the web app

---

## Open From Android

You do not need an APK to use WeebHub from Android.

Make sure your phone and computer are connected to the same Wi-Fi network.

Start WeebHub with LAN access enabled:

```bash
go run main.go --host 0.0.0.0
```

Find your computer's local IP address:

```text
macOS: ipconfig getifaddr en0
Windows: ipconfig
Linux: hostname -I
```

Open this on Android:

```text
http://YOUR-COMPUTER-IP:43211
```

Example:

```text
http://192.168.1.10:43211
```

If Android cannot connect:

- Allow WeebHub through your firewall
- Make sure both devices are on the same network

---

## Run WeebHub On Android With Termux

Install dependencies:

```bash
pkg update && pkg upgrade
pkg install git golang
```

Clone the repository:

```bash
git clone https://github.com/BiniFn/WeebHub.git
cd WeebHub
```

Run the server:

```bash
go run main.go
```

Open:

```text
http://127.0.0.1:43211
```

---

## Discord Rich Presence

1. Install the Discord desktop application
2. Sign in to your Discord account
3. Keep Discord running in the background
4. Start WeebHub with `go run main.go`
5. Open `http://127.0.0.1:43211`
6. Navigate to `Settings > Discord`
7. Enable Rich Presence for Anime and Manga
8. Leave `Hide GitHub Repo Button` disabled if you want Discord to display the repository link

Browser-only Discord does not support Rich Presence.

If Discord does not detect WeebHub:

- Fully quit Discord
- Reopen Discord
- Restart WeebHub

---

## Main Features

- Local anime and manga library management
- Browser-based web app
- Anime streaming from local files
- Manga reader
- AniList integration
- Offline library access
- Torrent and debrid integrations
- Discord Rich Presence
- Custom themes and UI settings
- Cross-device local network access

---

## Build From Source

To manually build the web interface and server, see:

https://github.com/BiniFn/WeebHub/blob/main/DEVELOPMENT_AND_BUILD.md

---

## GitHub Pages

The documentation site deploys to the `gh-pages` branch.

If GitHub Pages shows a 404:

1. Open repository Settings
2. Open Pages
3. Set Source to `Deploy from a branch`
4. Select:
   - Branch: `gh-pages`
   - Folder: `/ root`
5. Save and wait a minute

This repository also includes a fallback root website. If you want a simpler setup, use:

- Branch: `main`
- Folder: `/ root`

---

## Desktop Release Notes

The desktop release workflow builds Windows, macOS, and Linux applications from checked-in or public dependencies.

Push a tag formatted like this to start a release build:

```text
desktop-v1.0.0
```

---

## Roadmap

- Dedicated mobile app
- Better Android support
- Improved media scanning
- More UI customization
- Better metadata handling
- Plugin and extension improvements

---

## Links

- Website: https://binifn.github.io/WeebHub/
- Docs: https://binifn.github.io/WeebHub/
- Download Page: https://binifn.github.io/WeebHub/
- Releases: https://github.com/BiniFn/WeebHub/releases
- GitHub: https://github.com/BiniFn/WeebHub

---

## Disclaimer

WeebHub is intended for personal media management only.

This project does not host, distribute, or provide copyrighted content, illegal downloads, or streaming services.

Users are responsible for complying with their local laws and regulations.

---

## License

This project follows the licensing of the original Seanime project unless otherwise specified.

Please review the original repository license before redistribution.
