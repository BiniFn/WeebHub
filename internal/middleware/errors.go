package middleware

import (
"github.com/labstack/echo/v4"
"github.com/rs/zerolog"
)

// ErrorHandlerMiddleware handles all errors properly
func ErrorHandlerMiddleware(logger *zerolog.Logger) echo.MiddlewareFunc {
return func(next echo.HandlerFunc) echo.HandlerFunc {
return func(c echo.Context) error {
err := next(c)
if err == nil {
return nil
}

// Log the error
logger.Error().Err(err).Str("path", c.Request().RequestURI).Msg("request error")

// Don't expose internal errors
if he, ok := err.(*echo.HTTPError); ok {
return c.JSON(he.Code, map[string]string{
"error": he.Message.(string),
})
}

return c.JSON(500, map[string]string{
"error": "internal server error",
})
}
}
}
