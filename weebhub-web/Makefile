build-all:
	rm -rf ../web
	rm -rf ../web-denshi
	npm run build
	cp -r out ../web
	npm run build:denshi
	cp -r out-denshi ../web-denshi
	rm -rf ../weebhub-denshi/web-denshi
	cp -r ../web-denshi ../weebhub-denshi/web-denshi

build-web:
	rm -rf ../web
	npm run build
	cp -r out ../web

build-denshi:
	rm -rf ../web-denshi
	npm run build:denshi
	cp -r out-denshi ../web-denshi
	rm -rf ../weebhub-denshi/web-denshi
	cp -r ../web-denshi ../weebhub-denshi/web-denshi

build-denshi-and-sidecar-mac:
	rm -rf ../web-denshi
	npm run build:denshi
	cp -r out-denshi ../web-denshi
	rm -rf ../weebhub-denshi/web-denshi
	cp -r ../web-denshi ../weebhub-denshi/web-denshi
	go build -tags ncgo -o ../weebhub-denshi/binaries/weebhub-server-darwin-arm64 -trimpath -ldflags "-s -w" ../main.go


.PHONY: build-all build-web build-denshi build-denshi-and-sidecar-mac
