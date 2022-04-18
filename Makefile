build-web:
	@yarn && yarn build web

build-server:
	@go build -o ./tmp/fileserver .

build: build-web build-server

dev:
	go install github.com/cosmtrek/air@latest
	air -c .air.toml