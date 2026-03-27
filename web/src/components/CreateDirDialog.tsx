import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import useMediaQuery from "@mui/material/useMediaQuery";
import {useTheme} from "@mui/material/styles";
import {useState} from "react";
import axios from "axios";

export interface CreateDirDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateDirDialog(props: CreateDirDialogProps) {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const [name, setName] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = () => {
        if (!name.trim()) {
            setError("Directory name is required")
            return
        }
        setLoading(true)
        setError("")

        axios.post(`${window.location.pathname}?action=mkdir&name=${encodeURIComponent(name.trim())}`)
            .then(() => {
                props.onSuccess()
            })
            .catch((err) => {
                setError(err.response?.statusText || "Failed to create directory")
                setLoading(false)
            })
    }

    return (
        <Dialog
            open={props.open}
            fullWidth
            maxWidth="sm"
            fullScreen={fullScreen}
            PaperProps={{
                sx: fullScreen
                    ? {
                        pt: 'max(12px, env(safe-area-inset-top))',
                        pb: 'max(12px, env(safe-area-inset-bottom))',
                    }
                    : undefined,
            }}
        >
            <DialogTitle>New folder</DialogTitle>
            <DialogContent sx={{px: {xs: 2, sm: 3}}}>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Folder name"
                    fullWidth
                    variant="outlined"
                    size={fullScreen ? 'medium' : 'small'}
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setError("")
                    }}
                    error={!!error}
                    helperText={error}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSubmit()
                    }}
                />
            </DialogContent>
            <DialogActions
                sx={{
                    px: {xs: 2, sm: 3},
                    pb: {xs: 'max(16px, env(safe-area-inset-bottom))', sm: 2},
                    pt: 1,
                    flexDirection: {xs: 'column-reverse', sm: 'row'},
                    gap: 1,
                    '& .MuiButton-root': {marginLeft: '0 !important'},
                }}
            >
                <Button fullWidth={fullScreen} onClick={props.onClose} disabled={loading} size="large">
                    Cancel
                </Button>
                <Button
                    fullWidth={fullScreen}
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || !name.trim()}
                    size="large"
                >
                    Create
                </Button>
            </DialogActions>
        </Dialog>
    )
}
