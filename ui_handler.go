package main

import (
	"embed"
	_ "embed"
	"encoding/json"
	"io/fs"
	"net/http"
	"strings"
	"text/template"
)

//go:embed web/dist/*
var content embed.FS

var asset http.Handler
var index *template.Template

func init() {
	dist, err := fs.Sub(content, "web/dist")
	if err != nil {
		panic(err)
	}
	asset = http.FileServer(http.FS(dist))

	index = template.Must(template.ParseFS(dist, "index.html"))
}

type uiHandler struct {
	fs *fsHandler
}

func (h *uiHandler) accept(r *http.Request) bool {
	if strings.HasPrefix(r.URL.Path, "/_asset/") {
		return true
	}
	accepts := r.Header.Get("accept")
	for _, a := range strings.Split(accepts, ",") {
		if a == "text/html" {
			return true
		}
	}
	return false
}

func (h *uiHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		h.fs.ServeHTTP(w, r)
		return
	}

	if strings.HasPrefix(r.URL.Path, "/_asset/") {
		asset.ServeHTTP(w, r)
		return
	}

	_, info, err := h.fs.stat(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusNotFound)
		return
	}

	if !info.IsDir() {
		h.fs.ServeHTTP(w, r)
		return
	}

	infos, err := h.fs.readDir(r.URL.Path)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	bytes, _ := json.Marshal(infos)

	w.Header().Set("Content-Type", "text/html")

	err = index.ExecuteTemplate(w, "index.html", string(bytes))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
