import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import {useState} from "react";
import axios from "axios";

export interface CreateDirDialogProps {
    open: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function CreateDirDialog(props: CreateDirDialogProps) {
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
        <Dialog open={props.open} fullWidth={true} maxWidth="sm">
            <DialogTitle>Create Directory</DialogTitle>
            <DialogContent>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Directory Name"
                    fullWidth
                    variant="outlined"
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
            <DialogActions>
                <Button onClick={props.onClose} disabled={loading}>CANCEL</Button>
                <Button onClick={handleSubmit} disabled={loading || !name.trim()}>CREATE</Button>
            </DialogActions>
        </Dialog>
    )
}
