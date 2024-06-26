import React, { memo, useContext } from "react";
import { Handle, Node, NodeProps, Position, useReactFlow } from "reactflow";
import styles from "../../styles/TopicNode.module.css";
import { NoteContext } from "../../context/NoteProvider";
import { useAddNote, useUpdateTopic } from "../../hooks/useApi";

export type NodeData = {
  label: string;
  noteId: string;
};

export type TopicNodeType = Node<NodeData>;

const TopicNode = ({ id, data }: NodeProps<NodeData>) => {
  const { setNodes } = useReactFlow();
  const { currentFlowId, setCurrentNoteId, flowcharts, setFlowcharts } =
    useContext(NoteContext);
  const {
    action: addNote,
    isLoading: isAddingNote,
    loadingError: addNoteError,
  } = useAddNote();
  const {
    action: updateTopic,
    isLoading: isUpdatingTopic,
    loadingError: updateTopicError,
  } = useUpdateTopic();

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNodes((nodes: Node<NodeData>[]) =>
      nodes.map((node) => {
        if (node.id === id) {
          if (node.id === "0") {
            const updatedFlowcharts = flowcharts.map((flow) =>
              flow.flowId === currentFlowId
                ? { ...flow, topic: e.target.value }
                : flow
            );
            setFlowcharts(updatedFlowcharts);
          }
          return {
            ...node,
            data: {
              ...node.data,
              label: e.target.value,
            },
          };
        } else {
          return node;
        }
      })
    );
  };

  const handleOnBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (id === "0") {
      updateTopic({ flowId: currentFlowId, topic: e.target.value }).catch(
        (e) => {
          console.log(e);
        }
      );
    }
  };

  const handleViewNote = () => {
    if (data.noteId) {
      setCurrentNoteId(data.noteId);
    } else {
      addNote({ flowId: currentFlowId })
        .then((data) => {
          setCurrentNoteId(data.id);
          setNodes((nodes: Node<NodeData>[]) =>
            nodes.map((node) => {
              if (node.id === id) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    noteId: data.id,
                  },
                };
              } else {
                return node;
              }
            })
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  return (
    <div className={`${styles["topic-node"]}`}>
      {id !== "0" && (
        <Handle
          className={`${styles["handler"]} ${styles["handler-top"]}`}
          type="target"
          position={Position.Top}
        />
      )}

      <div
        className={`${styles["node-container"]} ${
          id === "0" ? styles["root-node"] : ""
        }`}
      >
        <div className={`${styles["drag-handle"]}`}></div>
        <input
          id="text"
          name="text"
          value={data.label}
          onChange={(e) => handleOnChange(e)}
          className="nodrag"
          onBlur={(e) => handleOnBlur(e)}
        />
        <div className={`${styles["btn-note"]}`} onClick={handleViewNote}>
          🗒
        </div>
      </div>

      <Handle
        className={`${styles["handler"]} ${styles["handler-bottom"]}`}
        type="source"
        position={Position.Bottom}
      />
    </div>
  );
};

export default memo(TopicNode);
