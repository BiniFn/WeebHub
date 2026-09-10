package handlers

import "github.com/labstack/echo/v4"

// HandleStreamerNowPlaying returns presentation-safe metadata for local
// streamer tools. It deliberately omits file paths, account data, and player
// controls. The route still uses the normal API authentication middleware.
//
//	@summary Returns the currently tracked playback state for streamer overlays.
//	@route /api/v1/streamer/now-playing [GET]
func (h *Handler) HandleStreamerNowPlaying(c echo.Context) error {
	type response struct {
		AnimeTitle    string  `json:"animeTitle"`
		Episode       int     `json:"episode"`
		CoverArtURL   string  `json:"coverArtUrl"`
		PlaybackState string  `json:"playbackState"`
		PositionSec   float64 `json:"positionSec"`
		DurationSec   float64 `json:"durationSec"`
		CanPlayNext   bool    `json:"canPlayNext"`
		Connection    string  `json:"connection"`
	}

	state, status, ok := h.App.PlaybackManager.PullCurrentState()
	if !ok {
		return h.RespondWithData(c, response{
			PlaybackState: "stopped",
			Connection:    "no-player",
		})
	}

	playbackState := "paused"
	if status.Playing {
		playbackState = "playing"
	}

	return h.RespondWithData(c, response{
		AnimeTitle:    state.MediaTitle,
		Episode:       state.EpisodeNumber,
		CoverArtURL:   state.MediaCoverImage,
		PlaybackState: playbackState,
		PositionSec:   status.CurrentTimeInSeconds,
		DurationSec:   status.DurationInSeconds,
		CanPlayNext:   state.CanPlayNext,
		Connection:    "connected",
	})
}
