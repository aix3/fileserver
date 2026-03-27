import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {useCallback} from "react";
import {useDropzone} from "react-dropzone";

export interface DropzoneProps {
    onAdd: (files: File[]) => void
}

export default function DropzoneArea(props: DropzoneProps) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            props.onAdd(acceptedFiles)
        }
    }, [props.onAdd])

    const {getRootProps, getInputProps, isDragActive} = useDropzone({
        onDrop,
        multiple: true,
    })

    return (
        <Box
            {...getRootProps()}
            sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 2,
                bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, background-color 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: {xs: 160, sm: 200},
                py: {xs: 3, sm: 4},
                px: {xs: 1.5, sm: 2},
                '&:hover': {
                    borderColor: 'primary.light',
                    bgcolor: 'action.hover',
                },
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: 2,
                },
            }}
        >
            <input {...getInputProps()} />
            <CloudUploadIcon sx={{fontSize: {xs: 32, sm: 40}, color: 'text.secondary', mb: 1}}/>
            <Typography variant="body2" color="text.secondary" align="center">
                {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select'}
            </Typography>
        </Box>
    )
}
