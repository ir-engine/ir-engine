import { useCallback, useContext } from "react";
import ErrorDialog from "../dialogs/ErrorDialog";
import { ProgressDialog } from "../dialogs/ProgressDialog";
import { DialogContext } from "../contexts/DialogContext";
import { EditorContext } from "../contexts/EditorContext";
import { AllFileTypes } from "./fileTypes";

/**
 * [useUpload used to upload asset file]
 * @param  {object} options
 * @return {[type]}         [assets]
 */
export default function useUpload(options: any = {}) {

  // initializing editor using EditorContext
  const editor = useContext(EditorContext);

  // initializing showDialog, hideDialog using dialogContext
  const { showDialog, hideDialog } = useContext(DialogContext);

  // initializing multiple if options contains multiple.
  const multiple = options.multiple === undefined ? false : options.multiple;

  // initializing source if options contains source else use editor.defaultUploadSource
  const source = options.source || editor.defaultUploadSource;

  //initializing accepts options using options.accepts
  //if options.accepts is not empty else set all types
  const accepts = options.accepts || AllFileTypes;

  //function callback used when upload asset files.
  const onUpload = useCallback(

    //initailizing files by using assets files after upload.
    async files => {

      // initializing assets as an empty array
      let assets = [];
      try {

        //check if not multiple and files contains length greator
        if (!multiple && files.length > 1) {
          throw new Error("Input does not accept multiple files.");
        }

        //check if assets is not empty.
        if (accepts) {
          for (const file of files) {
            let accepted = false;
            for (const pattern of accepts) {
              if (pattern.startsWith(".")) {
                if (file.name.endsWith(pattern)) {
                  accepted = true;
                  break;
                }
              } else if (file.type.startsWith(pattern)) {
                accepted = true;
                break;
              }
            }
            if (!accepted) {
              throw new Error(
                `"${
                  file.name
                }" does not match the following mime types or extensions: ${accepts.join(
                  ", "
                )}`
              );
            }
          }
        }
        const abortController = new AbortController();
        showDialog(ProgressDialog, {
          title: "Uploading Files",
          message: `Uploading files 1 of ${files.length}: 0%`,
          cancelable: true,
          onCancel: () => {
            abortController.abort();
            hideDialog();
          }
        });

        //uploading files and showing ProgressDialog
        assets = await source.upload(
          files,
          (item, total, progress) => {
            showDialog(ProgressDialog, {
              title: "Uploading Files",
              message: `Uploading files: ${item} of ${total}: ${Math.round(
                progress * 100
              )}%`,
              cancelable: true,
              onCancel: () => {
                abortController.abort();
                hideDialog();
              }
            });
          },
          abortController.signal
        );
        hideDialog();
      } catch (error) {
        console.error(error);
        showDialog(ErrorDialog, {
          title: "Upload Error",
          message: `Error uploading file: ${error.message ||
            "There was an unknown error."}`,
          error
        });
        return null;
      }
      return assets;
    },
    [showDialog, hideDialog, source, multiple, accepts, editor]
  );
  return onUpload;
}
