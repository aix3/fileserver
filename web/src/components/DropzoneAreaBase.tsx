import {SvgIconComponent} from "@mui/icons-material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import {Box} from "@mui/material";
import {BoxProps} from "@mui/material/Box";
import Typography, {TypographyProps} from "@mui/material/Typography";
import clsx from "clsx";
import PropTypes from "prop-types";
import React, {ComponentProps, Fragment, HTMLProps, PureComponent,} from "react";
import Dropzone, {DropEvent, DropzoneProps} from "react-dropzone";
import {humanFileSize} from "../utils/humanize";

export type AlertType = "error" | "info" | "success" | "warning";

export type DropzoneAreaBaseClasses = {
    /** Material-UI class applied to the root Dropzone div */
    root: string;
    /** Material-UI class applied to the Dropzone when 'active' */
    active: string;
    /** Material-UI class applied to the Dropzone when 'invalid' */
    invalid: string;
    /** Material-UI class applied to the Dropzone text container div */
    textContainer: string;
    /** Material-UI class applied to the Dropzone text */
    text: string;
    /** Material-UI class applied to the Dropzone icon */
    icon: string;
};

export type DropzoneAreaBaseProps = {
    classes?: Partial<DropzoneAreaBaseClasses>;
    /** A list of file types to accept.
     *
     * @see See [here](https://react-dropzone.js.org/#section-accepting-specific-file-types) for more details.
     */
    acceptedFiles?: string[];
    /** Maximum number of files that can be loaded into the dropzone. */
    filesLimit?: number;
    /** Currently loaded files. */
    fileObjects: File[];
    /** Icon to be displayed inside the dropzone area. */
    Icon?: SvgIconComponent;
    /** Maximum file size (in bytes) that the dropzone will accept. */
    maxFileSize?: number;
    /** Text inside the dropzone. */
    dropzoneText?: string;
    /**
     * Props to pass to the Dropzone component.
     *
     * @see See [Dropzone props](https://react-dropzone.js.org/#src) for available values.
     */
    dropzoneProps?: DropzoneProps;
    /**
     * Attributes applied to the input element.
     *
     * @see See [MDN Input File attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/file#Additional_attributes) for available values.
     */
    inputProps?: HTMLProps<HTMLInputElement>;
    clearOnUnmount?: boolean;
    /** Custom CSS class name for dropzone container. */
    dropzoneClass?: string;
    /** Custom CSS class name for text inside the container. */
    dropzoneParagraphClass?: string;
    /** Disable feedback effect when dropping rejected files. */
    disableRejectionFeedback?: boolean;
    /**
     * Fired when new files are added to dropzone.
     *
     * @param {File[]} newFiles The new files added to the dropzone.
     */
    onAdd?: (newFiles: File[]) => void;
    /**
     * Fired when a file is deleted from the previews panel.
     *
     * @param {File} deletedFileObject The file that was removed.
     * @param {number} index The index of the removed file object.
     */
    onDelete?: (deletedFileObject: File, index: number) => void;
    /**
     * Fired when the user drops files into the dropzone.
     *
     * @param {File[]} droppedFiles All the files dropped into the dropzone.
     * @param {Event} event The react-dropzone drop event.
     */
    onDrop?: (droppedFiles: File[], event: DropEvent) => void;
    /**
     * Fired when a file is rejected because of wrong file type, size or goes beyond the filesLimit.
     *
     * @param {File[]} rejectedFiles All the rejected files.
     * @param {Event} event The react-dropzone drop event.
     */
    onDropRejected?: (rejectedFiles: File[], event: DropEvent) => void;
    /**
     * Fired when an alert is triggered.
     *
     * @param {string} message Alert message.
     * @param {string} variant One of "error", "info", "success".
     */
    onAlert?: (message: string, variant: AlertType) => void;
    /**
     * Get alert message to display when files limit is exceed.
     *
     * *Default*: "Maximum allowed number of files exceeded. Only ${filesLimit} allowed"
     *
     * @param {number} filesLimit The `filesLimit` currently set for the component.
     */
    getFileLimitExceedMessage?: (filesLimit: number) => string;
    /**
     * Get alert message to display when a new file is added.
     *
     * *Default*: "File ${fileName} successfully added."
     *
     * @param {string} fileName The newly added file name.
     */
    getFileAddedMessage?: (fileName: string) => string;
    /**
     * Get alert message to display when a file is removed.
     *
     * *Default*: "File ${fileName} removed."
     *
     * @param {string} fileName The name of the removed file.
     */
    getFileRemovedMessage?: (fileName: string) => string;
    /**
     * Get alert message to display when a file is rejected onDrop.
     *
     * *Default*: "File ${rejectedFile.name} was rejected."
     *
     * @param {Object} rejectedFile The file that got rejected
     * @param {string[]} acceptedFiles The `acceptedFiles` prop currently set for the component
     * @param {number} maxFileSize The `maxFileSize` prop currently set for the component
     */
    getDropRejectMessage?: (
        rejectedFile: File,
        acceptedFiles: string[],
        maxFileSize: number
    ) => string;
};

type DropzoneAreaBaseState = {
    openSnackBar: boolean;
    snackbarMessage: string;
    snackbarVariant: AlertType;
};

/**
 * This components creates a Material-UI Dropzone, with previews and snackbar notifications.
 */
class DropzoneAreaBase extends PureComponent<DropzoneAreaBaseProps,
    DropzoneAreaBaseState> {
    static propTypes = {
        classes: PropTypes.object,
        acceptedFiles: PropTypes.arrayOf(PropTypes.string),
        filesLimit: PropTypes.number,
        Icon: PropTypes.elementType,
        maxFileSize: PropTypes.number,
        dropzoneText: PropTypes.string,
        dropzoneClass: PropTypes.string,
        dropzoneParagraphClass: PropTypes.string,
        disableRejectionFeedback: PropTypes.bool,
        showPreviews: PropTypes.bool,
        showPreviewsInDropzone: PropTypes.bool,
        showFileNames: PropTypes.bool,
        showFileNamesInPreview: PropTypes.bool,
        useChipsForPreview: PropTypes.bool,
        previewChipProps: PropTypes.object,
        previewGridClasses: PropTypes.object,
        previewGridProps: PropTypes.object,
        previewText: PropTypes.string,
        showAlerts: PropTypes.oneOfType([
            PropTypes.bool,
            PropTypes.arrayOf(
                PropTypes.oneOf(["error", "success", "info", "warning"])
            ),
        ]),
        alertSnackbarProps: PropTypes.object,
        dropzoneProps: PropTypes.object,
        inputProps: PropTypes.object,
        getFileLimitExceedMessage: PropTypes.func,
        getFileAddedMessage: PropTypes.func,
        getFileRemovedMessage: PropTypes.func,
        getDropRejectMessage: PropTypes.func,
        getPreviewIcon: PropTypes.func,
        onAdd: PropTypes.func,
        onDelete: PropTypes.func,
        onDrop: PropTypes.func,
        onDropRejected: PropTypes.func,
        onAlert: PropTypes.func,
    };

    static defaultProps = {
        acceptedFiles: [],
        filesLimit: 3,
        fileObjects: [] as File[],
        maxFileSize: 3000000,
        dropzoneText: "Drag and drop a file here or click",
        previewText: "Preview:",
        disableRejectionFeedback: false,
        showPreviews: false, // By default previews show up under in the dialog and inside in the standalone
        showPreviewsInDropzone: true,
        showFileNames: false,
        showFileNamesInPreview: false,
        useChipsForPreview: false,
        previewChipProps: {},
        previewGridClasses: {},
        previewGridProps: {},
        showAlerts: true,
        alertSnackbarProps: {
            anchorOrigin: {
                horizontal: "left",
                vertical: "bottom",
            },
            autoHideDuration: 6000,
        },
        getFileLimitExceedMessage: ((filesLimit) =>
            `Maximum allowed number of files exceeded. Only ${filesLimit} allowed`) as NonNullable<DropzoneAreaBaseProps["getFileLimitExceedMessage"]>,
        getFileAddedMessage: ((fileName) =>
            `File ${fileName} successfully added.`) as NonNullable<DropzoneAreaBaseProps["getFileAddedMessage"]>,
        getFileRemovedMessage: ((fileName) =>
            `File ${fileName} removed.`) as NonNullable<DropzoneAreaBaseProps["getFileRemovedMessage"]>,
        getDropRejectMessage: ((rejectedFile, acceptedFiles, maxFileSize) => {
            let message = `File ${rejectedFile.name} was rejected. `;
            if (!acceptedFiles.includes(rejectedFile.type)) {
                message += "File type not supported. ";
            }
            if (rejectedFile.size > maxFileSize) {
                message +=
                    "File is too big. Size limit is " +
                    humanFileSize(maxFileSize) +
                    ". ";
            }
            return message;
        }) as NonNullable<DropzoneAreaBaseProps["getDropRejectMessage"]>,
    };

    state: DropzoneAreaBaseState = {
        openSnackBar: false,
        snackbarMessage: "",
        snackbarVariant: "success",
    };

    notifyAlert() {
        const {onAlert} = this.props;
        const {openSnackBar, snackbarMessage, snackbarVariant} = this.state;
        if (openSnackBar && onAlert) {
            onAlert(snackbarMessage, snackbarVariant);
        }
    }

    handleDropAccepted: DropzoneProps["onDropAccepted"] = async (
        acceptedFiles,
        evt
    ) => {
        const {
            fileObjects,
            filesLimit = DropzoneAreaBase.defaultProps.filesLimit,
            getFileAddedMessage = DropzoneAreaBase.defaultProps.getFileAddedMessage,
            getFileLimitExceedMessage = DropzoneAreaBase.defaultProps
                .getFileLimitExceedMessage,
            onAdd,
            onDrop,
        } = this.props;

        if (
            filesLimit > 1 &&
            fileObjects.length + acceptedFiles.length > filesLimit
        ) {
            this.setState(
                {
                    openSnackBar: true,
                    snackbarMessage: getFileLimitExceedMessage(filesLimit),
                    snackbarVariant: "error",
                },
                this.notifyAlert
            );
            return;
        }

        // Notify Drop event
        if (onDrop) {
            onDrop(acceptedFiles, evt);
        }

        // Notify added files
        if (onAdd) {
            onAdd(acceptedFiles);
        }

        // Display message
        const message = acceptedFiles.reduce(
            (msg, fileObj) => msg + getFileAddedMessage(fileObj.name),
            ""
        );
        this.setState(
            {
                openSnackBar: true,
                snackbarMessage: message,
                snackbarVariant: "success",
            },
            this.notifyAlert
        );
    };

    handleDropRejected: DropzoneProps["onDropRejected"] = (
        rejectedFiles,
        evt
    ) => {
        const {
            filesLimit = DropzoneAreaBase.defaultProps.filesLimit,
            fileObjects,
            getFileLimitExceedMessage = DropzoneAreaBase.defaultProps
                .getFileLimitExceedMessage,
        } = this.props;

        let message = "";
        if (fileObjects.length + rejectedFiles.length > filesLimit) {
            message = getFileLimitExceedMessage(filesLimit);
        }
        this.setState(
            {
                openSnackBar: true,
                snackbarMessage: message,
                snackbarVariant: "error",
            },
            this.notifyAlert
        );
    };

    handleCloseSnackbar = () => {
        this.setState({
            openSnackBar: false,
        });
    };

    defaultSx = {
        root: {
            "@keyframes progress": {
                "0%": {
                    backgroundPosition: "0 0",
                },
                "100%": {
                    backgroundPosition: "-70px 0",
                },
            },
            position: "relative",
            width: "100%",
            minHeight: "250px",
            backgroundColor: "background.paper",
            border: "dashed",
            borderColor: "divider",
            borderRadius: 1,
            boxSizing: "border-box",
            cursor: "pointer",
            overflow: "hidden",
        } as BoxProps["sx"],
        active: {
            animation: "$progress 2s linear infinite !important",
            // backgroundImage: `repeating-linear-gradient(-45deg, ${this.props.theme.palette.background.paper}, ${this.props.theme.palette.background.paper} 25px, ${this.props.theme.palette.divider} 25px, ${this.props.theme.palette.divider} 50px)`,
            backgroundSize: "150% 100%",
            border: "solid",
            borderColor: "primary.light",
        } as BoxProps["sx"],
        invalid: {
            // backgroundImage: `repeating-linear-gradient(-45deg, ${this.props.theme.palette.error.light}, ${this.props.theme.palette.error.light} 25px, ${this.props.theme.palette.error.dark} 25px, ${this.props.theme.palette.error.dark} 50px)`,
            borderColor: "error.main",
        } as BoxProps["sx"],
        textContainer: {
            textAlign: "center",
        } as BoxProps["sx"],
        text: {
            marginBottom: 3,
            marginTop: 3,
        } as TypographyProps["sx"],
        icon: {
            width: 51,
            height: 51,
            color: "text.primary",
        } as ComponentProps<SvgIconComponent>["sx"],
    };

    render() {
        const {
            acceptedFiles,
            classes = {},
            disableRejectionFeedback,
            dropzoneClass,
            dropzoneParagraphClass,
            dropzoneProps,
            dropzoneText,
            filesLimit = DropzoneAreaBase.defaultProps.filesLimit,
            Icon,
            inputProps,
            maxFileSize,
        } = this.props;

        const acceptFiles = acceptedFiles?.join(",");
        const isMultiple = filesLimit > 1;

        return (
            <Fragment>
                <Dropzone
                    {...dropzoneProps}
                    accept={acceptFiles}
                    onDropAccepted={this.handleDropAccepted}
                    onDropRejected={this.handleDropRejected}
                    maxSize={maxFileSize}
                    multiple={isMultiple}
                >
                    {({getRootProps, getInputProps, isDragActive, isDragReject}) => {
                        const isActive = isDragActive;
                        const isInvalid = !disableRejectionFeedback && isDragReject;

                        return (
                            <Box
                                sx={
                                    {
                                        ...this.defaultSx.root,
                                        ...(isActive ? this.defaultSx.active : {}),
                                        ...(isInvalid ? this.defaultSx.invalid : {}),
                                    } as BoxProps["sx"]
                                }
                                {...getRootProps({
                                    className: clsx(
                                        classes.root,
                                        dropzoneClass,
                                        isActive && classes.active,
                                        isInvalid && classes.invalid
                                    ),
                                })}
                            >
                                <input {...getInputProps(inputProps)} />

                                <Box
                                    sx={this.defaultSx.textContainer}
                                    className={classes.textContainer}
                                >
                                    <Typography
                                        variant="h5"
                                        component="p"
                                        sx={this.defaultSx.text}
                                        className={clsx(classes.text, dropzoneParagraphClass)}
                                    >
                                        {dropzoneText}
                                    </Typography>
                                    {Icon ? (
                                        <Icon sx={this.defaultSx.icon} className={classes.icon}/>
                                    ) : (
                                        <CloudUploadIcon
                                            sx={this.defaultSx.icon}
                                            className={classes.icon}
                                        />
                                    )}
                                </Box>
                            </Box>
                        );
                    }}
                </Dropzone>
            </Fragment>
        );
    }
}

export default DropzoneAreaBase;