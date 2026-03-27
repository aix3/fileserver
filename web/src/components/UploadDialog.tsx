import DropzoneArea from "./DropzoneAreaBase";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import FilePreviewList from "./FilePreviewList";
import {useState, useRef, useCallback} from "react";
import axios, {CancelTokenSource} from "axios";
import {humanFileSize} from "../utils/humanize";

export interface UploaderDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

interface UploadState {
    progress: Map<number, number>
    uploading: boolean
    done: boolean
    successCount: number
    errorCount: number
}

export default function UploadDialog(props: UploaderDialogProps) {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [files, setFiles] = useState<File[]>([])
    const [state, setState] = useState<UploadState>({
        progress: new Map(),
        uploading: false,
        done: false,
        successCount: 0,
        errorCount: 0,
    })
    const cancelTokens = useRef<CancelTokenSource[]>([])

    const handleFileAdd = useCallback((newFiles: File[]) => {
        setFiles(prev => [...prev, ...newFiles])
    }, [])

    const handleFileRemove = useCallback((index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }, [])

    const handleClearAll = () => {
        setFiles([])
    }

    const updateProgress = (index: number, value: number) => {
        setState(prev => {
            const newProgress = new Map(prev.progress)
            newProgress.set(index, value)

            let successCount = 0
            let errorCount = 0
            newProgress.forEach(v => {
                if (v >= 100) successCount++
                if (v === -1) errorCount++
            })

            return {
                ...prev,
                progress: newProgress,
                successCount,
                errorCount,
                done: (successCount + errorCount) === newProgress.size,
            }
        })
    }

    const doUpload = (index: number, file: File) => {
        const data = new FormData()
        data.append('file', file)

        const source = axios.CancelToken.source()
        cancelTokens.current[index] = source

        axios.post(window.location.pathname, data, {
            cancelToken: source.token,
            onUploadProgress: (p) => {
                if (p.total) {
                    updateProgress(index, (p.loaded / p.total) * 100)
                }
            }
        }).then(() => {
            updateProgress(index, 100)
        }).catch(() => {
            updateProgress(index, -1)
        })
    }

    const handleSubmit = () => {
        const initialProgress = new Map<number, number>()
        files.forEach((_, i) => initialProgress.set(i, 0))

        setState({
            progress: initialProgress,
            uploading: true,
            done: false,
            successCount: 0,
            errorCount: 0,
        })

        files.forEach((file, i) => doUpload(i, file))
    }

    const handleClose = () => {
        cancelTokens.current.forEach(source => source?.cancel())
        props.onClose()
    }

    const totalSize = files.reduce((sum, f) => sum + f.size, 0)
    const overallProgress = state.progress.size > 0
        ? Array.from(state.progress.values()).reduce((sum, v) => sum + Math.max(v, 0), 0) / state.progress.size
        : 0

    return (
        <Dialog
            open={props.open}
            fullWidth
            maxWidth="sm"
            fullScreen={fullScreen}
            onClose={state.uploading ? undefined : handleClose}
            PaperProps={{
                sx: fullScreen
                    ? {
                        pt: 'max(12px, env(safe-area-inset-top))',
                        pb: 'max(12px, env(safe-area-inset-bottom))',
                    }
                    : undefined,
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                Upload files
            </DialogTitle>
            <DialogContent
                dividers={fullScreen}
                sx={{px: {xs: 2, sm: 3}}}
            >
                <Stack spacing={2}>
                    {!state.uploading && (
                        <DropzoneArea onAdd={handleFileAdd}/>
                    )}

                    {files.length > 0 && (
                        <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Typography variant="body2" color="text.secondary">
                                {files.length} file{files.length > 1 ? 's' : ''} ({humanFileSize(totalSize)})
                            </Typography>
                            {!state.uploading && (
                                <Button size="small" onClick={handleClearAll}>Clear all</Button>
                            )}
                        </Box>
                    )}

                    {state.uploading && (
                        <Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', mb: 0.5}}>
                                <Typography variant="caption" color="text.secondary">
                                    {state.done
                                        ? `Done: ${state.successCount} succeeded, ${state.errorCount} failed`
                                        : `Uploading... ${Math.round(overallProgress)}%`
                                    }
                                </Typography>
                            </Box>
                            <LinearProgress
                                variant="determinate"
                                value={overallProgress}
                                color={state.done && state.errorCount > 0 ? 'warning' : 'primary'}
                            />
                        </Box>
                    )}

                    <FilePreviewList
                        files={files}
                        progress={state.progress}
                        uploading={state.uploading}
                        onRemove={handleFileRemove}
                    />
                </Stack>
            </DialogContent>
            <DialogActions
                sx={{
                    px: {xs: 2, sm: 3},
                    pb: {xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2},
                    pt: 2,
                    flexDirection: {xs: 'column-reverse', sm: 'row'},
                    gap: 1,
                    flexWrap: 'wrap',
                    '& .MuiButton-root': {
                        marginLeft: '0 !important',
                    },
                }}
            >
                {state.uploading ? (
                    <Button fullWidth={fullScreen} onClick={props.onSuccess} disabled={!state.done} size="large">
                        Close
                    </Button>
                ) : (
                    <>
                        <Button fullWidth={fullScreen} onClick={handleClose} size="large">
                            Cancel
                        </Button>
                        <Button
                            fullWidth={fullScreen}
                            variant="contained"
                            disabled={files.length === 0}
                            onClick={handleSubmit}
                            size="large"
                        >
                            Upload{files.length > 0 ? ` (${files.length})` : ''}
                        </Button>
                    </>
                )}
            </DialogActions>
        </Dialog>
    )
}
