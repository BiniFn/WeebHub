package extension_repo

// Default extension repositories to be loaded on startup
var DefaultExtensionRepositories = []string{
"https://raw.githubusercontent.com/Secozzi/aniyomi-extensions/refs/heads/repo/index.min.json",
"https://raw.githubusercontent.com/yuzono/anime-repo/repo/index.min.json",
}

// LoadDefaultRepositories loads all default extension repositories
func (r *Repository) LoadDefaultRepositories() {
r.logger.Info().Msg("extensions: Loading default repositories")

for _, repoURL := range DefaultExtensionRepositories {
r.logger.Debug().Str("url", repoURL).Msg("extensions: Installing default repository")

_, err := r.InstallExternalExtensions(repoURL, false)
if err != nil {
r.logger.Warn().Err(err).Str("url", repoURL).Msg("extensions: Failed to load default repository")
continue
}

r.logger.Debug().Str("url", repoURL).Msg("extensions: Successfully loaded default repository")
}
}
