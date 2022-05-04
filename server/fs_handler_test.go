package server

import (
	"bytes"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"
)

func Test_fsHandler_serveGetFile(t *testing.T) {
	h := FSHandler{
		Basedir: "testdata",
	}

	r := httptest.NewRequest(http.MethodGet, "http://localhost/a.txt", nil)
	w := httptest.NewRecorder()

	code, err := h.serveGet(w, r)
	if err != nil {
		t.Errorf("get file error %v", err)
	}
	if w.Code != 200 {
		t.Errorf("get file error, code %v", w.Code)
	}

	data, _ := ioutil.ReadAll(w.Body)
	t.Logf("get file content %s", data)
	t.Logf("get file code %d", code)
}

func Test_fsHandler_serveGetFile_Head(t *testing.T) {
	h := FSHandler{
		Basedir: "testdata",
	}

	r := httptest.NewRequest(http.MethodHead, "http://localhost/a.txt", nil)
	w := httptest.NewRecorder()

	code, err := h.serveGet(w, r)
	if err != nil {
		t.Errorf("get file error %v", err)
	}
	if w.Code != 200 {
		t.Errorf("get file error, code %v", w.Code)
	}

	data, _ := ioutil.ReadAll(w.Body)
	t.Logf("get file content %s", data)
	t.Logf("get file code %d", code)
}

func Test_fsHandler_serveCreateFile(t *testing.T) {
	h := FSHandler{
		Basedir: "testdata",
	}

	var b bytes.Buffer
	m := multipart.NewWriter(&b)
	f, _ := m.CreateFormFile("file", "b.txt")
	f.Write([]byte("bcd"))
	m.Close()

	r := httptest.NewRequest(http.MethodPost, "http://localhost/b.txt", bytes.NewReader(b.Bytes()))
	r.Header.Set("Content-Type", m.FormDataContentType())
	w := httptest.NewRecorder()

	code, err := h.serveCreate(w, r, true)
	if err != nil {
		t.Errorf("post file error %v", err)
	}
	if w.Code != 201 {
		t.Errorf("post file error, code %v", w.Code)
	}

	data, _ := ioutil.ReadAll(w.Body)
	t.Logf("post file content %s", data)
	t.Logf("post file code %d", code)
}

func Test_fsHandler_serveCreateFile_Dir(t *testing.T) {
	h := FSHandler{
		Basedir: "testdata",
	}

	var b bytes.Buffer
	m := multipart.NewWriter(&b)
	f, _ := m.CreateFormFile("file", "b.txt")
	f.Write([]byte("bcd"))
	m.Close()

	r := httptest.NewRequest(http.MethodPost, "http://localhost/c/d/e/", bytes.NewReader(b.Bytes()))
	r.Header.Set("Content-Type", m.FormDataContentType())
	w := httptest.NewRecorder()

	code, err := h.serveCreate(w, r, true)
	if err != nil {
		t.Errorf("post file error %v", err)
	}
	if w.Code != 201 {
		t.Errorf("post file error, code %v", w.Code)
	}

	data, _ := ioutil.ReadAll(w.Body)
	t.Logf("post file content %s", data)
	t.Logf("post file code %d", code)
}
