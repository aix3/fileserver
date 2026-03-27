import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import {useMemo} from "react";

export interface BreadcrumbProps {
    currentPath: string
}

interface Crumb {
    label: string
    href: string
}

/** Trim trailing slashes (same as original). Root `/` becomes `""`. */
function trimPath(path: string): string {
    let p = path || "/"
    while (p.endsWith("/")) {
        p = p.slice(0, p.lastIndexOf("/"))
    }
    return p
}

function buildCrumbs(pathTrimmed: string): Crumb[] {
    const segments = pathTrimmed.split("/")

    // Root (`/`): current is already shown as "Index" — do not add a second "Index" link
    if (pathTrimmed === "") {
        return []
    }

    let pathname = window.location.pathname
    if (!pathname.endsWith("/")) {
        pathname += "/"
    }

    const bs: Crumb[] = []
    for (let i = segments.length - 2; i >= 1; i--) {
        bs.push({
            label: segments[i],
            href: pathname.concat("../".repeat(segments.length - i - 1)),
        })
    }
    bs.push({
        label: "Index",
        href: pathname.concat("../".repeat(segments.length - 1)),
    })
    return bs.reverse()
}

function currentDirName(pathTrimmed: string): string {
    if (pathTrimmed === "" || pathTrimmed === "/") {
        return "Index"
    }
    const segments = pathTrimmed.split("/")
    const last = segments[segments.length - 1]
    return last || "Index"
}

export default function Breadcrumb(props: BreadcrumbProps) {
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"))

    const {crumbs, currentLabel} = useMemo(() => {
        const pathTrimmed = trimPath(props.currentPath)
        return {
            crumbs: buildCrumbs(pathTrimmed),
            currentLabel: currentDirName(pathTrimmed),
        }
    }, [props.currentPath])

    return (
        <Box
            sx={{
                width: "100%",
                maxWidth: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                WebkitOverflowScrolling: "touch",
                pb: 0.5,
                touchAction: "pan-x",
            }}
        >
            <Breadcrumbs
                maxItems={isMobile ? 4 : 12}
                itemsBeforeCollapse={isMobile ? 1 : 2}
                itemsAfterCollapse={isMobile ? 1 : 2}
                sx={{
                    /* One row: scroll horizontally instead of wrapping (wrapping caused overlap on WebKit) */
                    flexWrap: "nowrap",
                    alignItems: "center",
                    "& .MuiBreadcrumbs-ol": {
                        flexWrap: "nowrap",
                        alignItems: "center",
                    },
                    /* Do not shrink crumbs — minWidth:0 + maxWidth was collapsing items on top of each other */
                    "& .MuiBreadcrumbs-li": {
                        flexShrink: 0,
                        display: "inline-flex",
                        alignItems: "center",
                        maxWidth: "none",
                    },
                    "& .MuiBreadcrumbs-separator": {
                        flexShrink: 0,
                    },
                }}
            >
                {crumbs.map((c) => (
                    <Link
                        key={c.href}
                        underline="hover"
                        color="inherit"
                        href={c.href}
                        sx={{
                            whiteSpace: "nowrap",
                            display: "inline-block",
                            maxWidth: isMobile ? "45vw" : "none",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            verticalAlign: "bottom",
                        }}
                    >
                        {c.label}
                    </Link>
                ))}
                <Typography
                    color="text.primary"
                    component="span"
                    sx={{
                        whiteSpace: "nowrap",
                        maxWidth: isMobile ? "45vw" : "none",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        fontWeight: 600,
                    }}
                >
                    {currentLabel}
                </Typography>
            </Breadcrumbs>
        </Box>
    )
}
