import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

class Breadcrumb {
    name: string;
    url: string;

    constructor(name: string, url: string) {
        this.name = name
        this.url = url
    }
}

export interface BreadcrumbProps {
    currentPath: string
}

export default function (props: BreadcrumbProps) {
    let path = props.currentPath

    let currentDir = function () {
        while (path.endsWith("/")) {
            path = path.substr(0, path.lastIndexOf("/"))
        }
        let segments = path.split("/");
        if (segments.length > 0) {
            return segments[segments.length - 1]
        }
        return "Index"
    }

    let currentBreadcrumbs = function () {
        while (path.endsWith("/")) {
            path = path.substr(0, path.lastIndexOf("/"))
        }
        let segments = path.split("/");

        let pathname = window.location.pathname;
        if (!pathname.endsWith("/")) {
            pathname += "/"
        }

        let bs = []
        for (let i = segments.length - 2; i >= 1; i--) {
            bs.push(new Breadcrumb(segments[i], pathname.concat("../".repeat(segments.length - i - 1))))
        }
        bs.push(new Breadcrumb("Index", pathname.concat("../".repeat(segments.length - 1))));
        return bs.reverse()
    }

    return (
        <Breadcrumbs>
            {currentBreadcrumbs().map(value => {
                return (
                    <Link underline="hover" color="inherit" href={value.url}>
                        {value.name}
                    </Link>
                )
            })}
            <Typography color="text.primary">
                {currentDir()}
            </Typography>
        </Breadcrumbs>
    )
}