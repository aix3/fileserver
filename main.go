package main

import (
	"flag"
	"fmt"
	"net/http"
	"runtime/debug"

	"github.com/aix3/fileserver/server"
)

type config struct {
	port     int
	basedir  string
	certFile string
	keyFile  string
	username string
	password string
}

var defaultConfig = config{
	port:     8880,
	basedir:  ".",
	certFile: "",
	keyFile:  "",
	username: "",
	password: "",
}

func init() {
	flag.IntVar(&defaultConfig.port, "port", defaultConfig.port, "which port to listen on")
	flag.StringVar(&defaultConfig.basedir, "basedir", defaultConfig.basedir, "which directory to serve on")
	flag.StringVar(&defaultConfig.certFile, "tls-cert", defaultConfig.certFile, "TLS cert file location")
	flag.StringVar(&defaultConfig.keyFile, "tls-key", defaultConfig.keyFile, "TLS key file location")
	flag.StringVar(&defaultConfig.username, "user", defaultConfig.username, "basic auth username")
	flag.StringVar(&defaultConfig.password, "pass", defaultConfig.password, "basic auth password")
}

func main() {
	flag.Parse()

	mux := http.NewServeMux()

	fs := &server.FSHandler{
		Basedir: defaultConfig.basedir,
	}
	ui := &server.UIHandler{
		Fs: fs,
	}

	handler := &server.BasicAuthHandler{
		Username: defaultConfig.username,
		Password: defaultConfig.password,
		Next:     server.NewCompHandler(ui, fs),
	}
	mux.Handle("/", handler)

	addr := fmt.Sprintf(":%d", defaultConfig.port)

	if info, ok := debug.ReadBuildInfo(); ok {
		fmt.Println("Build version:", info.Main.Version)
	}
	fmt.Println("Listen and serve on", addr)

	if len(defaultConfig.keyFile) == 0 || len(defaultConfig.certFile) == 0 {
		panic(http.ListenAndServe(addr, mux))
	} else {
		panic(http.ListenAndServeTLS(addr, defaultConfig.certFile, defaultConfig.keyFile, mux))
	}
}
