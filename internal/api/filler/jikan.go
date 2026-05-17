package filler

import (
	"fmt"
	"strconv"
	"time"
	"weebhub/internal/util"

	"github.com/imroc/req/v3"
	"github.com/rs/zerolog"
)

type Jikan struct {
	baseUrl string
	client  *req.Client
	logger  *zerolog.Logger
}

func NewJikan(logger *zerolog.Logger) *Jikan {
	return &Jikan{
		baseUrl: "https://api.jikan.moe/v4",
		client: req.C().
			SetTimeout(15 * time.Second),
		logger: logger,
	}
}

func (j *Jikan) FindFillerData(malId int) (ret *Data, err error) {
	defer util.HandlePanicInModuleWithError("api/metadata/filler/jikan/FindFillerEpisodes", &err)

	ret = &Data{
		FillerEpisodes: make([]string, 0),
	}

	page := 1
	hasNextPage := true

	for hasNextPage {
		var response struct {
			Data []struct {
				MalId  int  `json:"mal_id"`
				Filler bool `json:"filler"`
			} `json:"data"`
			Pagination struct {
				HasNextPage bool `json:"has_next_page"`
			} `json:"pagination"`
		}

		resp, reqErr := j.client.R().
			SetSuccessResult(&response).
			Get(fmt.Sprintf("%s/anime/%d/episodes?page=%d", j.baseUrl, malId, page))

		if reqErr != nil {
			return nil, reqErr
		}

		if resp.IsErrorState() {
			if resp.GetStatusCode() == 404 {
				// 404 means no episodes or anime not found, just return empty gracefully
				return ret, nil
			}
			return nil, fmt.Errorf("jikan api error: %s", resp.Status)
		}

		for _, ep := range response.Data {
			if ep.Filler {
				ret.FillerEpisodes = append(ret.FillerEpisodes, strconv.Itoa(ep.MalId))
			}
		}

		hasNextPage = response.Pagination.HasNextPage
		page++

		if hasNextPage {
			time.Sleep(500 * time.Millisecond) // Respect Jikan rate limits
		}
	}

	return ret, nil
}
