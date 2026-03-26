import Fab from "@mui/material/Fab";
import Stack from "@mui/material/Stack";
import AddIcon from '@mui/icons-material/Add';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';

import {useState} from "react";
import Breadcrumb from "./Breadcrumb";
import UploadDialog from "./UploadDialog";
import CreateDirDialog from "./CreateDirDialog";
import FileListTable, {FileInfo} from "./FileListTable";

export interface FileListProp {
    files: FileInfo[]
    currentPath: string
}

function FileList(props: FileListProp) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [mkdirOpen, setMkdirOpen] = useState(false)

    const handleUploadSuccess = function () {
        setDialogOpen(false)
        window.location.reload()
    }

    const handleMkdirSuccess = function () {
        setMkdirOpen(false)
        window.location.reload()
    }

    return (
        <Stack spacing={2} justifyContent="center">
            <Stack spacing={2} direction="row" justifyContent="space-between" alignItems="center">
                <Breadcrumb currentPath={props.currentPath}/>
                <Stack direction="row" spacing={1}>
                    <Fab color="default" variant="extended" size="small" onClick={() => setMkdirOpen(true)}>
                        <CreateNewFolderIcon sx={{mr: 0.5}}/>
                        New Folder
                    </Fab>
                    <Fab color="primary" variant="extended" size="small" onClick={() => setDialogOpen(true)}>
                        <AddIcon/>
                        Upload
                    </Fab>
                </Stack>
                {dialogOpen &&
                    <UploadDialog
                        open={dialogOpen}
                        onClose={() => setDialogOpen(false)}
                        onSuccess={handleUploadSuccess}
                    />
                }
                {mkdirOpen &&
                    <CreateDirDialog
                        open={mkdirOpen}
                        onClose={() => setMkdirOpen(false)}
                        onSuccess={handleMkdirSuccess}
                    />
                }
            </Stack>
            <FileListTable files={props.files}/>
        </Stack>
    )
}

export default FileList