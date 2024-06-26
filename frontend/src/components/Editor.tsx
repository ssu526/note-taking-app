import React, { useContext, useEffect, useMemo, useState } from "react";
import styles from "../styles/Editor.module.css";
import { NoteContext } from "../context/NoteProvider";
import "@blocknote/core/fonts/inter.css";
import { BlockNoteEditor, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import "@blocknote/core/fonts/inter.css";
import { useGetNote, useUpdateNote } from "../hooks/useApi";
import { SvgSpinners3DotsBounce } from "./svg/Spinner1";

const Editor = () => {
  const { currentNoteId } = useContext(NoteContext);

  const [initialContent, setInitialContent] = useState<
    PartialBlock[] | undefined | "loading"
  >("loading");

  const {
    action: updateBlock,
    isLoading: isUpdatingBlock,
    loadingError: updateBlockError,
  } = useUpdateNote(currentNoteId ? currentNoteId : "");

  const {
    action: getNote,
    isLoading: isGettingNote,
    loadingError: getNoteError,
  } = useGetNote(currentNoteId ? currentNoteId : "");

  useEffect(() => {
    if (currentNoteId) {
      getNote().then((data) => {
        const blocks = data.content as PartialBlock[];
        setInitialContent(blocks);
      });
    }
  }, [currentNoteId]);

  const editor = useMemo(() => {
    if (initialContent === "loading") {
      return undefined;
    }
    return BlockNoteEditor.create({ initialContent });
  }, [initialContent]);

  if (!currentNoteId) {
    return <div></div>;
  }
  if (editor === undefined) {
    return <div>Loading content...</div>;
  }

  const handleChange = () => {
    updateBlock({ content: editor.document }).catch((err) => {
      console.log(err);
    });
  };

  return (
    <div className={`${styles["container"]}`}>
      {isGettingNote ? (
        <div className={`${styles["container"]}`}>
          <SvgSpinners3DotsBounce />
        </div>
      ) : (
        <div className={`${styles["editor-container"]}`}>
          <BlockNoteView
            editor={editor}
            theme="light"
            onChange={handleChange}
          />
        </div>
      )}
    </div>
  );
};

export default Editor;
