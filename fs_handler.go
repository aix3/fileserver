package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"
)

const (
	defaultMaxMemory = 32 << 20 // 32 MB
)

type fsHandler struct {
	basedir string
}

func (h *fsHandler) accept(r *http.Request) bool {
	return true
}

func (h *fsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	code, err := h.serve(w, r)
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

type fileInfo struct {
	Name    string    `json:"name"`
	Size    int64     `json:"size"`
	ModTime time.Time `json:"mod_time"`
	IsDir   bool      `json:"is_dir"`
}

func (h *fsHandler) serveGet(w http.ResponseWriter, r *http.Request) (int, error) {
	target := r.URL.Path
	file, info, err := h.stat(target)
	if err != nil {
		return http.StatusNotFound, err
	}

	if info.IsDir() {
		infos, err := h.readDir(target)
		if err != nil {
			return http.StatusInternalServerError, err
		}
		bytes, _ := json.Marshal(infos)
		_, _ = w.Write(bytes)
	} else {
		http.ServeContent(w, r, target, info.ModTime(), file)
	}
	return http.StatusOK, nil
}

func (h *fsHandler) readDir(target string) ([]fileInfo, error) {
	entries, err := os.ReadDir(h.join(target))
	if err != nil {
		return nil, err
	}
	infos := make([]fileInfo, len(entries))
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			log.Printf("Read %q info error %v", entry.Name(), err)
			continue
		}
		infos = append(infos, fileInfo{
			Name:    info.Name(),
			Size:    info.Size(),
			ModTime: info.ModTime(),
			IsDir:   info.IsDir(),
		})
	}
	return infos, nil
}

func (h *fsHandler) stat(path string) (io.ReadSeeker, fs.FileInfo, error) {
	f, err := http.FS(os.DirFS(h.basedir)).Open(path)
	if err != nil {
		return nil, nil, err
	}

	stat, err := f.Stat()
	if err != nil {
		return nil, nil, err
	}
	return f, stat, nil
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
