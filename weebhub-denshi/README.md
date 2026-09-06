<p align="center">
<img src="../docs/images/weebhub-logo.png" alt="preview" width="70px"/>
</p>

<h2 align="center"><b>WeebHub Denshi</b></h2>

<p align="center">
Electron-based desktop client for WeebHub. Embeds server and web interface. Successor to WeebHub Desktop.
</p>

<p align="center">
<img src="https://weebhub.app/bucket/img-2025-10-29-17-13-15.webp?updatedAt=1761758012992" alt="preview" width="80%"/>
</p>

---

## Prerequisites

- Go 1.24+
- Node.js 20+ and npm

---

## Development

### Web Interface

```shell
# Working dir: ./weebhub-web
npm run dev:denshi
```
 
### Sidecar

1. Build the server

	```shell
	# Working dir: .
 
	# Windows
	go build -o weebhub.exe -trimpath -ldflags="-s -w" -tags=nosystray
 
	# Linux, macOS
	go build -o weebhub -trimpath -ldflags="-s -w"
	```
 
2. Move the binary to `./weebhub-denshi/binaries`

3. Rename the binary:

   - For Windows: `weebhub-server-windows.exe`
   - For macOS/Intel: `weebhub-server-darwin-amd64`
   - For macOS/ARM: `weebhub-server-darwin-arm64`
   - For Linux/x86_64: `weebhub-server-linux-amd64`
   - For Linux/ARM64: `weebhub-server-linux-arm64`

### Electron

1. Setup

	```shell
	# Working dir: ./weebhub-denshi
	npm install
	```

2. Run

    `TEST_DATADIR` can be used in development mode, it should point to a dummy data directory for testing purposes.

    ```shell
    # Working dir: ./weebhub-desktop
    TEST_DATADIR="/path/to/data/dir" npm run dev
   ```

---

## Build

### Web Interface
   
```shell
# Working dir: ./weebhub-web
npm run build
npm run build:denshi
```

Move the output `./weebhub-web/out` to `./web`
Move the output `./weebhub-web/out-denshi` to `./weebhub-denshi/web-denshi`

```shell
# UNIX command
mv ./weebhub-web/out ./web
mv ./weebhub-web/out-denshi ./weebhub-denshi/web-denshi
```

### Sidecar

1. Build the server

	```shell
	# Working dir: .
 
	# Windows
	go build -o weebhub.exe -trimpath -ldflags="-s -w" -tags=nosystray
 
	# Linux, macOS
	go build -o weebhub -trimpath -ldflags="-s -w"
	```
 
2. Move the binary to `./weebhub-denshi/binaries`

3. Rename the binary:

   - For Windows: `weebhub-server-windows.exe`
   - For macOS/Intel: `weebhub-server-darwin-amd64`
   - For macOS/ARM: `weebhub-server-darwin-arm64`
   - For Linux/x86_64: `weebhub-server-linux-amd64`
   - For Linux/ARM64: `weebhub-server-linux-arm64`

### Electron

To build the desktop client for all platforms:

```
npm run build
```

To build for specific platforms:

```
npm run build:mac
npm run build:win
npm run build:linux
```

Output is in `./weebhub-denshi/dist/...`
