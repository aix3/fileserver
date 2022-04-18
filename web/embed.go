package web

import (
	"embed"
	"io/fs"
)

//go:embed dist/*
var content embed.FS

func Dist() fs.FS {
	dist, err := fs.Sub(content, "dist")
	if err != nil {
		panic(err)
	}
	return dist
}
