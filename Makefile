build_web:
	@yarn && yarn build

build_server:
	@go build -o ./tmp/fileserver .

build: build_web build_server

dev:
	go install github.com/cosmtrek/air@latest
	air -c .air.toml