package main

import (
	"errors"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
)

const (
	defaultMaxMemory = 32 << 20 // 32 MB
)

type fsHandler struct {
	basedir string
}

func newFsHandler(basedir string) *fsHandler {
	return &fsHandler{
		basedir: basedir,
	}
}

func (h *fsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	code, err := h.serve(w, r)
	if err != nil {
		w.WriteHeader(code)
		_, _ = w.Write([]byte(err.Error()))
	}

	log.Printf("%s %s - %d - %v", r.Method, r.URL.Path, code, err)
}

func (h *fsHandler) serve(w http.ResponseWriter, r *http.Request) (int, error) {
	switch r.Method {
	case http.MethodOptions:
		return h.serveOption(w, r)
	case http.MethodGet:
		return h.serveGet(w, r)
	case http.MethodHead:
		return h.serveGet(w, r)
	case http.MethodDelete:
		return h.serveDelete(w, r)
	case http.MethodPost:
		return h.serveCreate(w, r, true)
	case http.MethodPut:
		return h.serveCreate(w, r, true)
	default:
		return http.StatusMethodNotAllowed, errors.New("method not allowed")
	}
}

func (h *fsHandler) join(path ...string) string {
	e := make([]string, len(path)+1)
	e = append(e, h.basedir)
	e = append(e, path...)
	return filepath.Join(e...)
}

func (h *fsHandler) serveGet(w http.ResponseWriter, r *http.Request) (int, error) {
	target := r.URL.Path

	f, err := http.FS(os.DirFS(h.basedir)).Open(target)
	if err != nil {
		return http.StatusNotFound, err
	}
	defer f.Close()

	stat, err := f.Stat()
	if err != nil {
		return http.StatusInternalServerError, err
	}
	http.ServeContent(w, r, target, stat.ModTime(), f)
	return http.StatusOK, nil
}

func (h *fsHandler) serveCreate(w http.ResponseWriter, r *http.Request, override bool) (int, error) {
	urlPath := r.URL.Path

	var target string
	var file io.ReadCloser

	if r.MultipartForm == nil {
		_ = r.ParseMultipartForm(defaultMaxMemory)
	}
	if r.MultipartForm == nil {
		target = urlPath
		file = r.Body
	} else {
		mf, h, err := r.FormFile("file")
		if err != nil {
			return http.StatusBadRequest, err
		}
		if strings.HasSuffix(urlPath, "/") {
			target = path.Join(urlPath, h.Filename)
		} else {
			target = urlPath
		}
		file = mf
	}

	targetAbs := h.join(target)

	info, err := os.Stat(targetAbs)
	if err == nil {
		if info.IsDir() {
			return http.StatusConflict, fmt.Errorf("%q is a existing directory", target)
		}
		if info.Size() > 0 {
			if override {
				_ = os.Remove(targetAbs)
			} else {
				return http.StatusConflict, fmt.Errorf("%q already exist", target)
			}
		}
	}

	err = os.MkdirAll(path.Dir(targetAbs), os.ModePerm)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	dst, err := os.OpenFile(targetAbs, os.O_CREATE|os.O_RDWR, 0600)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		return http.StatusInternalServerError, err
	}
	w.WriteHeader(http.StatusCreated)
	return http.StatusCreated, nil
}

func (h *fsHandler) serveOption(w http.ResponseWriter, r *http.Request) (int, error) {
	return http.StatusNotImplemented, errors.New("not implemented")
}

func (h *fsHandler) serveDelete(w http.ResponseWriter, r *http.Request) (int, error) {
	return http.StatusNotImplemented, errors.New("not implemented")
}
