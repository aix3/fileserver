import Box, {BoxProps} from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import {useMemo} from "react";
import UploadProgress from "./UploadProgress";

export interface FilePreviewListProps {
    value: File[];
    getProgress: (key: number) => number
    onChange: (files: File[]) => void
    uploading: boolean
}

function FilePreviewList(props: FilePreviewListProps) {
    const {
        value,
        getProgress,
        onChange,
        uploading
    } = props;

    const sxGridContainer = useMemo<BoxProps["sx"]>(
        () => ({
            display: "flex",
            flexWrap: "wrap",
            width: "100%",
            gap: 1,
        }),
        []
    );

    type chipProp = { file: File, index: number }

    const ProgressChip = ({file, index}: chipProp) => {
        const createUpdateProgressHandler = (key: number) => () => {
            return getProgress(key)
        }

        return <Chip
            variant="outlined"
            label={file.name}
            onDelete={() => {
                let _ = null
            }}
            deleteIcon={<UploadProgress valueFn={createUpdateProgressHandler(index)}/>}
        />;
    }

    const DeleteChip = ({file, index}: chipProp) => {
        const createDeleteHandler = (index: number) => () => {
            onChange(value.filter((_, i) => i !== index))
        }
        return <Chip
            variant="outlined"
            label={file.name}
            onDelete={createDeleteHandler(index)}
        />;
    }

    return (
        <Box sx={sxGridContainer}>
            {value.map((file, i) => {
                return (
                    <Box key={i}>
                        {uploading ? <ProgressChip file={file} index={i}/> : <DeleteChip file={file} index={i}/>}
                    </Box>
                );
            })}
        </Box>
    );
}

export default FilePreviewList;