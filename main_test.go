package main

import "testing"

func Test_parseAuthPair(t *testing.T) {
	t.Parallel()
	cases := []struct {
		in       string
		wantUser string
		wantPass string
		wantErr  bool
	}{
		{"admin:secret", "admin", "secret", false},
		{"a:b:c:d", "a", "b:c:d", false},
		{"user:", "user", "", false},
		{"u", "", "", true},
	}
	for _, tc := range cases {
		u, p, err := parseAuthPair(tc.in)
		if tc.wantErr {
			if err == nil {
				t.Fatalf("parseAuthPair(%q): want error", tc.in)
			}
			continue
		}
		if err != nil {
			t.Fatalf("parseAuthPair(%q): %v", tc.in, err)
		}
		if u != tc.wantUser || p != tc.wantPass {
			t.Fatalf("parseAuthPair(%q) = (%q,%q), want (%q,%q)", tc.in, u, p, tc.wantUser, tc.wantPass)
		}
	}
}
