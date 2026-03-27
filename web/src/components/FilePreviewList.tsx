import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import UploadProgress from "./UploadProgress";
import {humanFileSize} from "../utils/humanize";
import ClearIcon from "@mui/icons-material/Clear";

export interface FilePreviewListProps {
    files: File[]
    progress: Map<number, number>
    uploading: boolean
    onRemove: (index: number) => void
}

export default function FilePreviewList(props: FilePreviewListProps) {
    const {files, progress, uploading, onRemove} = props

    if (files.length === 0) {
        return (
            <Box sx={{py: 2, textAlign: 'center'}}>
                <Typography variant="body2" color="text.secondary">
                    No files selected
                </Typography>
            </Box>
        )
    }

    return (
        <List
            dense
            sx={{
                maxHeight: {xs: 'min(42vh, 260px)', sm: 300},
                overflow: 'auto',
                WebkitOverflowScrolling: 'touch',
            }}
        >
            {files.map((file, index) => (
                <ListItem
                    key={`${file.name}-${index}`}
                    secondaryAction={
                        uploading ? (
                            <UploadProgress value={progress.get(index) ?? 0}/>
                        ) : (
                            <IconButton edge="end" size="small" onClick={() => onRemove(index)}>
                                <ClearIcon fontSize="small"/>
                            </IconButton>
                        )
                    }
                    sx={{
                        bgcolor: uploading && progress.get(index) === -1 ? 'error.50' : 'transparent',
                        borderRadius: 1,
                    }}
                >
                    <ListItemText
                        primary={file.name}
                        secondary={humanFileSize(file.size)}
                        primaryTypographyProps={{
                            noWrap: true,
                            sx: {maxWidth: '80%'},
                            variant: 'body2',
                        }}
                        secondaryTypographyProps={{variant: 'caption'}}
                    />
                </ListItem>
            ))}
        </List>
    )
}
