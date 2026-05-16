package habari

import (
	"path/filepath"
	"regexp"
	"strings"
)

type Metadata struct {
	SeasonNumber        []string `json:"season_number,omitempty"`
	PartNumber          []string `json:"part_number,omitempty"`
	Title               string   `json:"title,omitempty"`
	FormattedTitle      string   `json:"formatted_title,omitempty"`
	AnimeType           []string `json:"anime_type,omitempty"`
	Year                string   `json:"year,omitempty"`
	AudioTerm           []string `json:"audio_term,omitempty"`
	DeviceCompatibility []string `json:"device_compatibility,omitempty"`
	EpisodeNumber       []string `json:"episode_number,omitempty"`
	OtherEpisodeNumber  []string `json:"other_episode_number,omitempty"`
	EpisodeNumberAlt    []string `json:"episode_number_alt,omitempty"`
	EpisodeTitle        string   `json:"episode_title,omitempty"`
	FileChecksum        string   `json:"file_checksum,omitempty"`
	FileExtension       string   `json:"file_extension,omitempty"`
	FileName            string   `json:"file_name,omitempty"`
	Language            []string `json:"language,omitempty"`
	ReleaseGroup        string   `json:"release_group,omitempty"`
	ReleaseInformation  []string `json:"release_information,omitempty"`
	ReleaseVersion      []string `json:"release_version,omitempty"`
	Source              []string `json:"source,omitempty"`
	Subtitles           []string `json:"subtitles,omitempty"`
	VideoResolution     string   `json:"video_resolution,omitempty"`
	VideoTerm           []string `json:"video_term,omitempty"`
	VolumeNumber        []string `json:"volume_number,omitempty"`
}

var (
	releaseGroupPattern = regexp.MustCompile(`^\s*\[([^\]]+)\]`)
	resolutionPattern   = regexp.MustCompile(`(?i)\b(2160p|1080p|720p|480p|360p|4k)\b`)
	episodePattern      = regexp.MustCompile(`(?i)(?:\bS\d{1,2}E|(?:episode|ep)\s*)?(\d{1,4})(?:\s*[-~]\s*(\d{1,4}))?`)
	yearPattern         = regexp.MustCompile(`\b(19\d{2}|20\d{2})\b`)
)

func Parse(filename string) *Metadata {
	base := filepath.Base(filename)
	ext := filepath.Ext(base)
	name := strings.TrimSuffix(base, ext)
	cleaned := strings.NewReplacer(".", " ", "_", " ").Replace(name)

	metadata := &Metadata{
		FileName:      base,
		FileExtension: strings.TrimPrefix(ext, "."),
		Title:         strings.TrimSpace(cleaned),
		FormattedTitle: strings.TrimSpace(
			releaseGroupPattern.ReplaceAllString(cleaned, ""),
		),
	}

	if matches := releaseGroupPattern.FindStringSubmatch(cleaned); len(matches) > 1 {
		metadata.ReleaseGroup = strings.TrimSpace(matches[1])
	}
	if matches := resolutionPattern.FindStringSubmatch(cleaned); len(matches) > 1 {
		metadata.VideoResolution = strings.ToLower(matches[1])
	}
	if matches := yearPattern.FindStringSubmatch(cleaned); len(matches) > 1 {
		metadata.Year = matches[1]
	}
	if strings.Contains(strings.ToLower(cleaned), "web-dl") || strings.Contains(strings.ToLower(cleaned), "webdl") {
		metadata.Source = append(metadata.Source, "WEB-DL")
	}
	if strings.Contains(strings.ToLower(cleaned), "bluray") || strings.Contains(strings.ToLower(cleaned), "blu-ray") {
		metadata.Source = append(metadata.Source, "BluRay")
	}
	if strings.Contains(strings.ToLower(cleaned), "dual audio") || strings.Contains(strings.ToLower(cleaned), "dual-audio") {
		metadata.AudioTerm = append(metadata.AudioTerm, "Dual Audio")
	}
	if strings.Contains(strings.ToLower(cleaned), "multi") {
		metadata.Subtitles = append(metadata.Subtitles, "Multi")
	}

	if matches := episodePattern.FindStringSubmatch(cleaned); len(matches) > 1 {
		metadata.EpisodeNumber = append(metadata.EpisodeNumber, matches[1])
		if len(matches) > 2 && matches[2] != "" {
			metadata.EpisodeNumber = append(metadata.EpisodeNumber, matches[2])
		}
	}

	metadata.FormattedTitle = trimMetadataNoise(metadata.FormattedTitle)
	if metadata.FormattedTitle == "" {
		metadata.FormattedTitle = metadata.Title
	}

	return metadata
}

func trimMetadataNoise(s string) string {
	s = releaseGroupPattern.ReplaceAllString(s, "")
	s = resolutionPattern.ReplaceAllString(s, "")
	s = yearPattern.ReplaceAllString(s, "")
	s = strings.TrimSpace(regexp.MustCompile(`\[[^\]]+\]|\([^\)]+\)`).ReplaceAllString(s, " "))
	s = strings.Join(strings.Fields(s), " ")
	return s
}
