import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
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
    allowDelete: boolean
}

function FileList(props: FileListProp) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [mkdirOpen, setMkdirOpen] = useState(false)
    const theme = useTheme()
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

    const handleUploadSuccess = function () {
        setDialogOpen(false)
        window.location.reload()
    }

    const handleMkdirSuccess = function () {
        setMkdirOpen(false)
        window.location.reload()
    }

    const actionButtons = (
        <>
            <Button
                fullWidth={isMobile}
                variant="outlined"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<CreateNewFolderIcon/>}
                onClick={() => setMkdirOpen(true)}
                sx={{whiteSpace: 'nowrap'}}
            >
                New folder
            </Button>
            <Button
                fullWidth={isMobile}
                variant="contained"
                size={isMobile ? 'large' : 'medium'}
                startIcon={<AddIcon/>}
                onClick={() => setDialogOpen(true)}
                sx={{whiteSpace: 'nowrap'}}
            >
                Upload
            </Button>
        </>
    )

    return (
        <Stack spacing={isMobile ? 1.5 : 2} sx={{p: {xs: 1.5, sm: 2.5}}}>
            <Stack
                spacing={1.5}
                direction={isMobile ? "column" : "row"}
                justifyContent="space-between"
                alignItems={isMobile ? "stretch" : "flex-start"}
                sx={isMobile ? undefined : {flexWrap: 'nowrap'}}
            >
                <Box sx={{minWidth: 0, flex: 1, pr: isMobile ? 0 : 2}}>
                    <Breadcrumb currentPath={props.currentPath}/>
                </Box>
                <Stack
                    direction={isMobile ? 'column' : 'row'}
                    spacing={1}
                    sx={{
                        width: isMobile ? '100%' : 'auto',
                        flexShrink: 0,
                        alignItems: 'stretch',
                    }}
                >
                    {actionButtons}
                </Stack>
            </Stack>
            {dialogOpen && (
                <UploadDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}
            {mkdirOpen && (
                <CreateDirDialog
                    open={mkdirOpen}
                    onClose={() => setMkdirOpen(false)}
                    onSuccess={handleMkdirSuccess}
                />
            )}
            <FileListTable files={props.files} allowDelete={props.allowDelete}/>
        </Stack>
    )
}

export default FileList
