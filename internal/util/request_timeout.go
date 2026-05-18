package util

import "time"

// RequestTimeouts defines timeout values for different request types
type RequestTimeouts struct {
Default    time.Duration // 30s
Streaming  time.Duration // 2m
Upload     time.Duration // 5m
Download   time.Duration // 30m
ShortPoll  time.Duration // 5s
LongPoll   time.Duration // 30s
}

func GetRequestTimeouts() RequestTimeouts {
return RequestTimeouts{
Default:    30 * time.Second,
Streaming:  2 * time.Minute,
Upload:     5 * time.Minute,
Download:   30 * time.Minute,
ShortPoll:  5 * time.Second,
LongPoll:   30 * time.Second,
}
}
