package middleware

import (
"time"
"github.com/labstack/echo/v4"
)

func SecurityHeadersMiddleware() echo.MiddlewareFunc {
return func(next echo.HandlerFunc) echo.HandlerFunc {
return func(c echo.Context) error {
c.Response().Header().Set("X-Content-Type-Options", "nosniff")
c.Response().Header().Set("X-Frame-Options", "SAMEORIGIN")
c.Response().Header().Set("X-XSS-Protection", "1; mode=block")
c.Response().Header().Set("Strict-Transport-Security", "max-age=31536000")
return next(c)
}
}
}

func CORSMiddleware() echo.MiddlewareFunc {
return func(next echo.HandlerFunc) echo.HandlerFunc {
return func(c echo.Context) error {
origin := c.Request().Header.Get("Origin")
allowed := map[string]bool{
"http://localhost:3000": true,
"http://localhost:8080": true,
"http://127.0.0.1:3000": true,
"http://127.0.0.1:8080": true,
}
if allowed[origin] {
c.Response().Header().Set("Access-Control-Allow-Origin", origin)
c.Response().Header().Set("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS")
c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
}
if c.Request().Method == "OPTIONS" {
return c.NoContent(200)
}
return next(c)
}
}
}

func RateLimitMiddleware(rps int) echo.MiddlewareFunc {
limiter := make(chan struct{}, rps)
go func() {
ticker := time.NewTicker(time.Second / time.Duration(rps))
defer ticker.Stop()
for range ticker.C {
select {
case limiter <- struct{}{}:
default:
}
}
}()
return func(next echo.HandlerFunc) echo.HandlerFunc {
return func(c echo.Context) error {
select {
case <-limiter:
return next(c)
default:
return c.JSON(429, map[string]string{"error": "rate limit"})
}
}
}
}
