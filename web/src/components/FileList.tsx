import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import AddIcon from '@mui/icons-material/Add';

import {useState} from "react";
import Breadcrumb from "./Breadcrumb";
import UploadDialog from "./UploadDialog";
import FileListTable, {FileInfo} from "./FileListTable";

export interface FileListProp {
    files: FileInfo[]
    currentPath: string
}

function FileList(props: FileListProp) {
    const [dialogOpen, setDialogOpen] = useState(false)

    const handleUploadSuccess = function () {
        setDialogOpen(false)
        window.location.reload()
    }

    return (
        <Stack spacing={2} justifyContent="center">
            <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
                <Breadcrumb currentPath={props.currentPath}/>
                <Fab color="primary" variant="extended" size="small" onClick={() => setDialogOpen(true)}>
                    <AddIcon/>
                    Upload
                </Fab>
                <UploadDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSuccess={handleUploadSuccess}
                />
            </Stack>
            <FileListTable files={props.files}/>
        </Stack>
    )
}

export default FileList