package features

import "time"

type WatchHistory struct {
ID        string    `json:"id"`
MediaID   int       `json:"mediaId"`
Episode   int       `json:"episode"`
Timestamp int64     `json:"timestamp"`
Duration  int64     `json:"duration"`
Progress  float64   `json:"progress"`
CreatedAt time.Time `json:"createdAt"`
UpdatedAt time.Time `json:"updatedAt"`
}

type ContinuityData struct {
MediaID         int       `json:"mediaId"`
EpisodeNumber   int       `json:"episodeNumber"`
WatchedDuration int64     `json:"watchedDuration"`
CurrentTime     int64     `json:"currentTime"`
UpdatedAt       time.Time `json:"updatedAt"`
}
