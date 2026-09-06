package main

import (
	"net/http"
	"weebhub/internal/core"
	"weebhub/internal/handlers"
)

var echoApp *http.Handler

func init() {
	// Initialize the app
	app := core.NewApp(&core.ConfigOptions{
		Flags:        core.GetWeebHubFlags(),
		EmbeddedLogo: nil,
	}, nil)

	// Create the echo app instance (pass nil for embedded fs)
	e := core.NewEchoApp(app, nil)

	// Initialize the routes
	handlers.InitRoutes(app, e)

	// Convert echo.Echo to http.Handler
	h := http.Handler(e)
	echoApp = &h
}

func Handler(w http.ResponseWriter, r *http.Request) {
	if echoApp != nil {
		(*echoApp).ServeHTTP(w, r)
	} else {
		http.Error(w, "App not initialized", http.StatusInternalServerError)
	}
}



