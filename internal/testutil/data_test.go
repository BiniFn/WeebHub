package testutil

import (
	"os"
	"path/filepath"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestGetConfig(t *testing.T) {
	cfg := InitTestProvider(t)
	assert.NotEqual(t, Config{}, *cfg)
}

func TestLoadConfig_IsolatedInstances(t *testing.T) {
	configDir := t.TempDir()
	t.Setenv("TEST_CONFIG_PATH", configDir)
	require.NoError(t, os.WriteFile(filepath.Join(configDir, "config.toml"), []byte("[path]\ndataDir = \"/tmp/weebhub-test\"\n\n[database]\nname = \"weebhub-test\"\n"), 0600))

	first := LoadConfig(t)
	second := LoadConfig(t)

	assert.NotSame(t, first, second)
	assert.Equal(t, *first, *second)

	first.Path.DataDir = t.TempDir()
	assert.NotEqual(t, first.Path.DataDir, second.Path.DataDir)
}

func TestInitTestProvider_DefaultsWithoutConfig(t *testing.T) {
	t.Setenv("TEST_CONFIG_PATH", t.TempDir())

	cfg := InitTestProvider(t)

	assert.NotNil(t, cfg)
	assert.Equal(t, defaultTestDatabaseName, cfg.Database.Name)
	assert.Empty(t, cfg.Path.DataDir)
	assert.False(t, cfg.Flags.EnableAnilistTests)
}
