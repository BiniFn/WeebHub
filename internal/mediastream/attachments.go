package mediastream

import (
	"errors"
	"net/url"
	"path/filepath"
	"weebhub/internal/events"
	"weebhub/internal/mediastream/videofile"
	"weebhub/internal/util"

	"github.com/labstack/echo/v4"
)

func (r *Repository) ServeEchoExtractedSubtitles(c echo.Context) error {

	if !r.IsInitialized() {
		r.wsEventManager.SendEvent(events.MediastreamShutdownStream, "Module not initialized")
		return errors.New("module not initialized")
	}

	if !r.TranscoderIsInitialized() {
		r.wsEventManager.SendEvent(events.MediastreamShutdownStream, "Transcoder not initialized")
		return errors.New("transcoder not initialized")
	}

	// Get the parameter group
	subFilePath := c.Param("*")

	// Get current media
	mediaContainer, found := r.playbackManager.currentMediaContainer.Get()
	if !found {
		return errors.New("no file has been loaded")
	}

	retPath := videofile.GetFileSubsCacheDir(r.cacheDir, mediaContainer.Hash)

	if retPath == "" {
		return errors.New("could not find subtitles")
	}

	targetPath := filepath.Join(retPath, subFilePath)
	if !util.IsFileUnderDir(targetPath, retPath) {
		return errors.New("invalid path")
	}

	r.logger.Trace().Msgf("mediastream: Serving subtitles from %s", targetPath)

	return c.File(targetPath)
}

func (r *Repository) ServeEchoExtractedAttachments(c echo.Context) error {
	if !r.IsInitialized() {
		r.wsEventManager.SendEvent(events.MediastreamShutdownStream, "Module not initialized")
		return errors.New("module not initialized")
	}

	if !r.TranscoderIsInitialized() {
		r.wsEventManager.SendEvent(events.MediastreamShutdownStream, "Transcoder not initialized")
		return errors.New("transcoder not initialized")
	}

	// Get the parameter group
	subFilePath := c.Param("*")

	// Get current media
	mediaContainer, found := r.playbackManager.currentMediaContainer.Get()
	if !found {
		return errors.New("no file has been loaded")
	}

	retPath := videofile.GetFileAttCacheDir(r.cacheDir, mediaContainer.Hash)

	if retPath == "" {
		return errors.New("could not find subtitles")
	}

	subFilePath, _ = url.PathUnescape(subFilePath)

	targetPath := filepath.Join(retPath, subFilePath)
	if !util.IsFileUnderDir(targetPath, retPath) {
		return errors.New("invalid path")
	}

	return c.File(targetPath)
}
