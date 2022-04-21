import DropzoneAreaBase from "./DropzoneAreaBase";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FilePreviewList from "./FilePreviewList";
import React, {useCallback, useState} from "react";
import axios from "axios";

export interface UploaderDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function UploadDialog(props: UploaderDialogProps) {
    const [files, setFiles] = useState<File[]>([])
    const [uploading, setUploading] = useState<boolean>(false)

    const handleFileChange = useCallback((files: File[]) => {
        setFiles(files)
    }, [])

    const handleFileAdd = (newFiles: File[]) => {
        setFiles(files.concat(newFiles))
    }

    const handleSubmit = () => {
        setUploading(true)
        uploadFiles(files)
    }

    const [progressMap, setProgressMap] = useState<Map<number, number>>(new Map())
    const [_, setTrigger] = useState<number>(1)

    let handleGetProgress = useCallback((key: number): number => {
        return progressMap.get(key) || 0
    }, [])

    function doUpload(index: number, file: File) {
        const data = new FormData();
        data.append('file', file);

        axios.request({
            method: "post",
            url: window.location.toString(),
            data: data,
            onUploadProgress: (p) => {
                progressMap.set(index, (p.loaded / p.total) * 100)
                setTrigger(t => t + 1)
            }
        }).then(data => {
            console.log(index + " finish")
            progressMap.set(index, 100)
        }).catch(err => {
            console.log(index + " error")
            progressMap.set(index, -1)
        })
    }

    const [closeDisabled, setCloseDisabled] = useState(true)

    const uploadFiles = function (files: File[]) {
        const interval = setInterval(() => {
            let done = true
            progressMap.forEach(value => {
                done &&= (value == 100 || value == -1)
            })

            if (done) {
                clearInterval(interval)
                setCloseDisabled(false)
            }
        }, 800)

        for (let i = 0; i < files.length; i++) {
            progressMap.set(i, 0)
            doUpload(i, files[i])
        }
    }
    return (
        <Dialog
            open={props.open}
            fullWidth={true}
        >
            <DialogTitle id="alert-dialog-title">
                Upload files
            </DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {uploading ?
                        <>
                            <FilePreviewList
                                value={files}
                                onChange={handleFileChange}
                                getProgress={handleGetProgress}
                                uploading={uploading}
                            />
                        </>
                        :
                        <>
                            <DropzoneAreaBase
                                fileObjects={[]}
                                showPreviews={true}
                                filesLimit={1000}
                                maxFileSize={9999999999}
                                onAdd={handleFileAdd}
                            />
                            <FilePreviewList
                                value={files}
                                onChange={handleFileChange}
                                getProgress={handleGetProgress}
                                uploading={uploading}
                            />
                        </>
                    }
                </Stack>
            </DialogContent>
            <DialogActions>
                {uploading ?
                    <>
                        <Button onClick={props.onSuccess} disabled={closeDisabled}>CLOSE</Button>
                    </>
                    :
                    <>
                        <Button onClick={props.onClose}>CANCEL</Button>
                        <Button disabled={files.length == 0} onClick={handleSubmit}>SUBMIT</Button>
                    </>
                }
            </DialogActions>
        </Dialog>
    );
}