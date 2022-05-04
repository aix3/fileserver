package main

import (
	"flag"
	"fmt"
	"github.com/aix3/fileserver/server"
	"net/http"
	"runtime/debug"
)

type config struct {
	port     int
	basedir  string
	certFile string
	keyFile  string
}

var defaultConfig = config{
	port:     8880,
	basedir:  ".",
	certFile: "",
	keyFile:  "",
}

func init() {
	flag.IntVar(&defaultConfig.port, "port", defaultConfig.port, "which port to listen on")
	flag.StringVar(&defaultConfig.basedir, "basedir", defaultConfig.basedir, "which directory to serve on")
	flag.StringVar(&defaultConfig.certFile, "tls-cert", defaultConfig.certFile, "TLS cert file location")
	flag.StringVar(&defaultConfig.keyFile, "tls-key", defaultConfig.keyFile, "TLS key file location")
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

	mux.Handle("/", server.NewCompHandler(ui, fs))

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
