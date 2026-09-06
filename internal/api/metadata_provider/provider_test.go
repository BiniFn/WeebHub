package metadata_provider

import (
	"weebhub/internal/api/metadata"
	"os"
	"strconv"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestProvider(t *testing.T) {
	if os.Getenv("WEEBHUB_RUN_LIVE_TESTS") != "1" {
		t.Skip("set WEEBHUB_RUN_LIVE_TESTS=1 to run live metadata-provider verification")
	}

	metadataProvider := NewTestProvider(t, nil)

	tests := []struct {
		platform         metadata.Platform
		mediaId          int
		expectedEpisodes int
	}{
		{platform: metadata.AnilistPlatform, mediaId: 1, expectedEpisodes: 26},
	}

	for _, tt := range tests {
		t.Run(strconv.Itoa(tt.mediaId), func(t *testing.T) {
			res, err := metadataProvider.GetAnimeMetadata(tt.platform, tt.mediaId)
			if assert.NoError(t, err) {
				t.Logf("Titles: %v", res.Titles)
				t.Logf("\tEpisode count: %d", len(res.Episodes))
				for id, ep := range res.Episodes {
					t.Logf("\t\tEp(%s): %s", id, ep.Title)
					t.Logf("\t\t\tEpisode: %s", ep.Episode)
					t.Logf("\t\t\tNumber: %d", ep.EpisodeNumber)
					t.Logf("\t\t\tAbsolute: %d", ep.AbsoluteEpisodeNumber)
					t.Logf("\t\t\tSeason: %d", ep.SeasonNumber)
				}
				assert.Equal(t, tt.expectedEpisodes, len(res.Episodes))
			}
		})
	}
}
