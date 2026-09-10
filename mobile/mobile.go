package mobile

import (
	"embed"
	"fmt"
	"os"
	"weebhub/internal/server"
)

//go:embed web
var dummyWebFS embed.FS

//go:embed logo.png
var dummyLogo []byte

// StartWeebHub starts the WeebHub server natively on mobile.
// It is exposed to Android via gomobile.
func StartWeebHub(dataDir string, cacheDir string, port int) {
	// Mock os.Args for the flag parser
	os.Args = []string{
		"weebhub",
		"--datadir", dataDir,
		"--port", fmt.Sprintf("%d", port),
		"--host", "127.0.0.1",
	}

	// Start server in a non-blocking goroutine so the Android UI thread isn't blocked.
	go server.StartServer(dummyWebFS, dummyLogo)
}

// StartServer provides backward compatibility for mobile callers expecting StartServer.
func StartServer(dataDir string, cacheDir string, port int) {
	StartWeebHub(dataDir, cacheDir, port)
}
