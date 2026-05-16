package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
	"weebhub/internal/constants"
	"weebhub/internal/database/models"

	"github.com/labstack/echo/v4"
)

const (
	discordOAuthTokenURL   = "https://discord.com/api/oauth2/token"
	discordAPIUserURL      = "https://discord.com/api/users/@me"
	discordOAuthScopes     = "identify"
	discordOAuthGrantType  = "authorization_code"
	discordRevokeURL       = "https://discord.com/api/oauth2/token/revoke"
)

type discordOAuthTokenResponse struct {
	AccessToken  string `json:"access_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int    `json:"expires_in"`
	RefreshToken string `json:"refresh_token"`
	Scope        string `json:"scope"`
}

type discordUserResponse struct {
	ID            string `json:"id"`
	Username      string `json:"username"`
	Discriminator string `json:"discriminator"`
	GlobalName    string `json:"global_name"`
	Avatar        string `json:"avatar"`
}

// HandleGetDiscordOAuthURL
//
//	@summary returns the Discord OAuth2 authorization URL for the user to visit.
//	@route /api/v1/discord/oauth/url [GET]
//	@returns string
func (h *Handler) HandleGetDiscordOAuthURL(c echo.Context) error {
	clientID := constants.DiscordApplicationId
	redirectURI := getDiscordRedirectURI(c)

	authURL := fmt.Sprintf(
		"https://discord.com/api/oauth2/authorize?client_id=%s&redirect_uri=%s&response_type=code&scope=%s",
		clientID,
		url.QueryEscape(redirectURI),
		discordOAuthScopes,
	)
	return h.RespondWithData(c, authURL)
}

// HandleDiscordOAuthCallback
//
//	@summary handles the Discord OAuth2 callback and saves the user info.
//	@route /api/v1/discord/oauth/callback [POST]
//	@returns bool
func (h *Handler) HandleDiscordOAuthCallback(c echo.Context) error {
	type body struct {
		Code        string `json:"code"`
		RedirectURI string `json:"redirectUri"`
	}

	var b body
	if err := c.Bind(&b); err != nil {
		return h.RespondWithError(c, err)
	}

	clientID := constants.DiscordApplicationId
	clientSecret := constants.DiscordClientSecret

	if clientSecret == "" {
		return h.RespondWithError(c, fmt.Errorf("discord client secret not configured on server"))
	}

	// Exchange code for token
	formData := url.Values{
		"client_id":     {clientID},
		"client_secret": {clientSecret},
		"grant_type":    {discordOAuthGrantType},
		"code":          {b.Code},
		"redirect_uri":  {b.RedirectURI},
	}

	resp, err := http.PostForm(discordOAuthTokenURL, formData)
	if err != nil {
		h.App.Logger.Error().Err(err).Msg("discord oauth: failed to exchange code for token")
		return h.RespondWithError(c, err)
	}
	defer resp.Body.Close()

	body2, _ := io.ReadAll(resp.Body)
	var tokenResp discordOAuthTokenResponse
	if err := json.Unmarshal(body2, &tokenResp); err != nil || tokenResp.AccessToken == "" {
		h.App.Logger.Error().Str("body", string(body2)).Msg("discord oauth: failed to parse token response")
		return h.RespondWithError(c, fmt.Errorf("failed to get access token from Discord"))
	}

	// Fetch user info
	req, _ := http.NewRequestWithContext(context.Background(), http.MethodGet, discordAPIUserURL, nil)
	req.Header.Set("Authorization", "Bearer "+tokenResp.AccessToken)
	userResp, err := http.DefaultClient.Do(req)
	if err != nil {
		return h.RespondWithError(c, err)
	}
	defer userResp.Body.Close()

	userBody, _ := io.ReadAll(userResp.Body)
	var discordUser discordUserResponse
	if err := json.Unmarshal(userBody, &discordUser); err != nil || discordUser.ID == "" {
		return h.RespondWithError(c, fmt.Errorf("failed to get user info from Discord"))
	}

	displayName := discordUser.GlobalName
	if displayName == "" {
		displayName = discordUser.Username
	}

	avatarURL := ""
	if discordUser.Avatar != "" {
		avatarURL = fmt.Sprintf("https://cdn.discordapp.com/avatars/%s/%s.png", discordUser.ID, discordUser.Avatar)
	}

	// Save to settings
	settings, err := h.App.Database.GetSettings()
	if err != nil {
		return h.RespondWithError(c, err)
	}

	if settings.Discord == nil {
		settings.Discord = &models.DiscordSettings{}
	}
	settings.Discord.DiscordOAuthAccessToken = tokenResp.AccessToken
	settings.Discord.DiscordOAuthRefreshToken = tokenResp.RefreshToken
	settings.Discord.DiscordUserId = discordUser.ID
	settings.Discord.DiscordUsername = displayName
	settings.Discord.DiscordAvatar = avatarURL

	if _, err := h.App.Database.UpsertSettings(settings); err != nil {
		return h.RespondWithError(c, err)
	}

	h.App.Logger.Info().Str("username", displayName).Msg("discord oauth: connected account")
	return h.RespondWithData(c, true)
}

// HandleGetDiscordAccount
//
//	@summary returns the connected Discord account info if any.
//	@route /api/v1/discord/oauth/account [GET]
//	@returns DiscordAccountInfo
func (h *Handler) HandleGetDiscordAccount(c echo.Context) error {
	settings, err := h.App.Database.GetSettings()
	if err != nil {
		return h.RespondWithError(c, err)
	}

	type DiscordAccountInfo struct {
		Connected bool   `json:"connected"`
		Username  string `json:"username"`
		Avatar    string `json:"avatar"`
		UserID    string `json:"userId"`
	}

	if settings.Discord == nil || settings.Discord.DiscordUserId == "" {
		return h.RespondWithData(c, DiscordAccountInfo{Connected: false})
	}

	return h.RespondWithData(c, DiscordAccountInfo{
		Connected: true,
		Username:  settings.Discord.DiscordUsername,
		Avatar:    settings.Discord.DiscordAvatar,
		UserID:    settings.Discord.DiscordUserId,
	})
}

// HandleDiscordOAuthDisconnect
//
//	@summary disconnects the Discord account.
//	@route /api/v1/discord/oauth/disconnect [POST]
//	@returns bool
func (h *Handler) HandleDiscordOAuthDisconnect(c echo.Context) error {
	settings, err := h.App.Database.GetSettings()
	if err != nil {
		return h.RespondWithError(c, err)
	}

	if settings.Discord != nil && settings.Discord.DiscordOAuthAccessToken != "" {
		// Revoke token with Discord
		clientSecret := constants.DiscordClientSecret
		if clientSecret != "" {
			formData := url.Values{
				"client_id":     {constants.DiscordApplicationId},
				"client_secret": {clientSecret},
				"token":         {settings.Discord.DiscordOAuthAccessToken},
			}
			resp, _ := http.Post(discordRevokeURL, "application/x-www-form-urlencoded", strings.NewReader(formData.Encode()))
			if resp != nil {
				resp.Body.Close()
			}
		}

		settings.Discord.DiscordOAuthAccessToken = ""
		settings.Discord.DiscordOAuthRefreshToken = ""
		settings.Discord.DiscordUserId = ""
		settings.Discord.DiscordUsername = ""
		settings.Discord.DiscordAvatar = ""

		if _, err := h.App.Database.UpsertSettings(settings); err != nil {
			return h.RespondWithError(c, err)
		}
	}

	h.App.Logger.Info().Msg("discord oauth: disconnected account")
	return h.RespondWithData(c, true)
}

func getDiscordRedirectURI(c echo.Context) string {
	scheme := "http"
	if c.Request().TLS != nil {
		scheme = "https"
	}
	host := c.Request().Host
	return fmt.Sprintf("%s://%s/discord-callback", scheme, host)
}
