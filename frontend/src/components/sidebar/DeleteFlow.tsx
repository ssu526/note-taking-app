import React, { useContext } from "react";
import { Flow, NoteContext } from "../../context/NoteProvider";
import { useDeleteFlow } from "../../hooks/useApi";
import styles from "../../styles/DeleteFlow.module.css";

interface DeleteFlowProps {
  flowId: string;
  topic: string;
  setFlowcharts: React.Dispatch<React.SetStateAction<Flow[]>>;
  setDeleteFlowId: React.Dispatch<React.SetStateAction<string>>;
}

const DeleteFlow = ({
  flowId,
  topic,
  setFlowcharts,
  setDeleteFlowId,
}: DeleteFlowProps) => {
  const { currentFlowId, setCurrentFlowId, setCurrentNoteId } =
    useContext(NoteContext);

  const {
    action: deleteFlow,
    isLoading: isDeletingFlow,
    loadingError: deleteFlowError,
  } = useDeleteFlow();

  const handleDeleteFlow = () => {
    deleteFlow({ flowId })
      .then(() => {
        setDeleteFlowId("");
        setFlowcharts((prev) => prev.filter((flow) => flow.flowId !== flowId));

        if (flowId === currentFlowId) {
          setCurrentFlowId(null);
          setCurrentNoteId(null);
        }
      })
      .catch((err) => {
        setDeleteFlowId("");
        console.log(err);
      });
  };

  return (
    <div className={`${styles["delete-flow-container"]}`}>
      <p>Delete {topic}?</p>
      <div className={`${styles["buttons-container"]}`}>
        <button
          className={`${styles["btn-delete-confirm"]}`}
          onClick={handleDeleteFlow}
        >
          ✓
        </button>
        <button
          className={`${styles["btn-delete-cancel"]}`}
          onClick={() => setDeleteFlowId("")}
        >
          ✘
        </button>
      </div>
    </div>
  );
};

export default DeleteFlow;
