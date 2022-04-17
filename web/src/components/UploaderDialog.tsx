import {DropzoneDialog} from "mui-file-dropzone";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import PreviewList from "./PreviewList";
import {useState} from "react";
import axios from "axios";

export interface UploaderDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function UploaderDialog(props: UploaderDialogProps) {
    const [files, setFiles] = useState<File[]>([])

    const [dropzoneOpen, setDropzoneOpen] = useState<boolean>(true)
    const [uploaderOpen, setUploaderOpen] = useState<boolean>(false)

    let handleUpload = function (files: File[]) {
        setUploaderOpen(true)
        setDropzoneOpen(false)
        setFiles(files)
        uploadFiles(files)
    }

    const [progressMap, setProgressMap] = useState<Map<number, number>>(new Map())

    let handleGetProgress = function (key: number): number {
        console.log("handle get progress", key, progressMap)
        return progressMap.get(key) || 0
    }

    function doUpload(index: number, file: File) {
        const data = new FormData();
        data.append('file', file);

        axios.request({
            method: "post",
            url: window.location.toString(),
            data: data,
            onUploadProgress: (p) => {
                console.log(index + " p.loaded / p.tota:" + ((p.loaded / p.total) * 100))
                progressMap.set(index, (p.loaded / p.total) * 100)
            }
        }).then(data => {
            console.log(index + " finish")
            progressMap.set(index, 100)
        }).catch(err => {
            console.log(index + " error")
            progressMap.set(index, -1)
        })
    }

    const [a, setA] = useState(1)
    const [closeDisabled, setCloseDisabled] = useState(true)

    const uploadFiles = function (files: File[]) {
        const interval = setInterval(function () {
            let done = true
            progressMap.forEach(value => {
                done &&= (value == 100 || value == -1)
            })

            setA(a + 1)

            if (done) {
                clearInterval(interval)
                setCloseDisabled(false)
            }
        }, 1000)

        for (let i = 0; i < files.length; i++) {
            progressMap.set(i, 0)
            doUpload(i, files[i])
        }
    }

    return (
        <>
            <DropzoneDialog
                fileObjects={[]}
                open={props.open && dropzoneOpen}
                onSave={(files) => handleUpload(files)}
                onClose={props.onClose}
                showPreviews={true}
                useChipsForPreview={true}
                showFileNamesInPreview={true}
                filesLimit={100}
                fullWidth={true}
                previewText={"Files:"}
                showAlerts={false}
            />
            <Dialog
                open={props.open && uploaderOpen}
                fullWidth={true}
            >
                <DialogTitle id="alert-dialog-title">
                    Upload files
                </DialogTitle>
                <DialogContent>
                    <PreviewList fileObjects={files} getProgress={handleGetProgress}/>
                </DialogContent>
                <DialogActions>
                    {/*<Button onClick={props.onClose}>CANCEL</Button>*/}
                    <Button disabled={closeDisabled} variant="contained" onClick={props.onSuccess}>
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}