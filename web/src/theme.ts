import {createTheme} from '@mui/material/styles';

/** Cohesive file-browser UI: calm neutrals, clear hierarchy, comfortable density. */
export const appTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1565c0',
            dark: '#0d47a1',
            light: '#42a5f5',
        },
        secondary: {
            main: '#455a64',
        },
        background: {
            default: '#eef1f5',
            paper: '#ffffff',
        },
        divider: 'rgba(15, 23, 42, 0.08)',
        text: {
            primary: '#0f172a',
            secondary: '#64748b',
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Roboto", "Segoe UI", system-ui, -apple-system, sans-serif',
        h5: {
            fontWeight: 600,
            letterSpacing: '-0.02em',
        },
        h6: {
            fontWeight: 600,
            letterSpacing: '-0.01em',
        },
        subtitle2: {
            fontWeight: 500,
        },
        caption: {
            color: '#64748b',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                html: {
                    overflowX: 'hidden',
                    WebkitOverflowScrolling: 'touch',
                },
                body: {
                    overflowX: 'hidden',
                    paddingLeft: 'env(safe-area-inset-left)',
                    paddingRight: 'env(safe-area-inset-right)',
                },
            },
        },
        MuiDialog: {
            defaultProps: {
                scroll: 'paper',
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    fontSize: '1.125rem',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 10,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: '#475569',
                    backgroundColor: '#f8fafc',
                    borderBottom: '1px solid',
                    borderColor: 'rgba(15, 23, 42, 0.08)',
                },
                body: {
                    fontSize: '0.875rem',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:last-child td': {
                        borderBottom: 0,
                    },
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    fontWeight: 500,
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: {
                    minWidth: 44,
                    minHeight: 44,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    borderRadius: 4,
                    height: 6,
                },
            },
        },
    },
});
