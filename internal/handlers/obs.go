package handlers

import (
	"io"
	"net/http"
	"sync"

	"github.com/labstack/echo/v4"
)

// obsNowPlaying is an in-memory store for the current playback state.
var (
	obsNowPlayingMu   sync.RWMutex
	obsNowPlayingData []byte // raw JSON sent by the main app
)

// HandleObsGetNowPlaying returns the current "now playing" state for the OBS overlay.
// GET /api/v1/obs/now-playing
func (h *Handler) HandleObsGetNowPlaying(c echo.Context) error {
	obsNowPlayingMu.RLock()
	data := obsNowPlayingData
	obsNowPlayingMu.RUnlock()

	if data == nil {
		return c.JSON(http.StatusOK, map[string]any{"playing": false})
	}

	c.Response().Header().Set(echo.HeaderContentType, echo.MIMEApplicationJSONCharsetUTF8)
	return c.JSONBlob(http.StatusOK, data)
}

// HandleObsSetNowPlaying stores the current playback info sent by the main WeebHub tab.
// POST /api/v1/obs/now-playing
func (h *Handler) HandleObsSetNowPlaying(c echo.Context) error {
	body, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "could not read body")
	}

	obsNowPlayingMu.Lock()
	if len(body) == 0 {
		obsNowPlayingData = nil
	} else {
		obsNowPlayingData = body
	}
	obsNowPlayingMu.Unlock()

	return c.NoContent(http.StatusNoContent)
}
