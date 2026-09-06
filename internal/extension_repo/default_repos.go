package extension_repo

// Default extension repositories to be loaded on startup
// Note: Repositories must have an index in format: { "urls": ["manifest_uri1", "manifest_uri2", ...] }
// The Aniyomi format repos (Secozzi, Yuzono) return array format which is not compatible with our parser.
// Those would need a conversion step or should be handled by a separate mechanism.
var DefaultExtensionRepositories = []string{
// Add compatible repositories here
}

// LoadDefaultRepositories loads all default extension repositories
func (r *Repository) LoadDefaultRepositories() {
if len(DefaultExtensionRepositories) == 0 {
r.logger.Info().Msg("extensions: No default repositories configured")
return
}

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
