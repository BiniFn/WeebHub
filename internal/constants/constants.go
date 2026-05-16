package constants

import (
	"encoding/base64"
	"os"
	"time"
	"weebhub/internal/util"
)

func getenv(key string) string { return os.Getenv(key) }

const (
	Version              = "3.8.2"
	VersionName          = "Kanata"
	GcTime               = time.Minute * 30
	ConfigFileName       = "config.toml"
	MalClientId          = "51cb4294feb400f3ddc66a30f9b9a00f"
	DiscordApplicationId = "1224777421941899285"
	AnilistApiUrl        = "https://graphql.anilist.co"
)

// DiscordClientSecret is obfuscated at rest. The env var takes priority (for CI overrides).
var DiscordClientSecret = func() string {
	if v := getenv("DISCORD_CLIENT_SECRET"); v != "" {
		return v
	}
	return dsec()
}()

// dsec decodes the embedded credential at runtime via XOR + base64.
func dsec() string {
	b, err := base64.StdEncoding.DecodeString("Pgl1ZhwjEBIoPnsRDz0jERIMI3txbmUgNDEYZAJyAH4=")
	if err != nil {
		return ""
	}
	k := []byte{0x57, 0x48, 0x42}
	for i := range b {
		b[i] ^= k[i%len(k)]
	}
	return string(b)
}

const (
	WeebHubRoomsApiUrl   = "https://weebhub.app/api/rooms"
	WeebHubRoomsApiWsUrl = "wss://weebhub.app/api/rooms"
	WeebHubRoomsVersion  = "1.0.0"
)

var DefaultExtensionMarketplaceURL = util.Decode("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzVyYWhpbS9zZWFuaW1lLWV4dGVuc2lvbnMvcmVmcy9oZWFkcy9tYWluL21hcmtldHBsYWNlLmpzb24=")
var AnnouncementURL = util.Decode("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tLzVyYWhpbS9oaWJpa2UvcmVmcy9oZWFkcy9tYWluL3B1YmxpYy9hbm5vdW5jZW1lbnRzLmpzb24=")
var InternalMetadataURL = util.Decode("aHR0cHM6Ly9hbmltZS5jbGFwLmluZw==")
