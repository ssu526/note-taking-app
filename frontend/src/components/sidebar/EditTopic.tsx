import React, { useContext, useEffect, useRef, useState } from "react";
import { NoteContext } from "../../context/NoteProvider";
import { useUpdateTopic } from "../../hooks/useApi";
import { Node, useReactFlow } from "reactflow";
import { NodeData } from "../flow/TopicNode";
import styles from "../../styles/EditTopic.module.css";

interface EditTopicProps {
  flowId: string;
  topic: string;
  setEditingId: React.Dispatch<React.SetStateAction<string>>;
}

const EditTopic = ({ flowId, topic, setEditingId }: EditTopicProps) => {
  const [inputText, setInputText] = useState(topic);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [originalTopic, setOriginalTopic] = useState(topic);
  const { setNodes } = useReactFlow();
  const { currentFlowId, flowcharts, setFlowcharts } = useContext(NoteContext);
  const {
    action: updateTopic,
    isLoading: isUpatingTopic,
    loadingError: updateTopicError,
  } = useUpdateTopic();

  const adjustTextAreaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextAreaHeight();
  }, [inputText]);

  const handleOnBlur = (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
    if (
      !inputText ||
      inputText.trim().length === 0 ||
      inputText === originalTopic
    ) {
      setInputText(originalTopic);
      setEditingId("");
      return;
    }

    updateTopic({ flowId: flowId, topic: inputText })
      .then(() => {
        const updatedFlowcharts = flowcharts.map((flow) =>
          flow.flowId === flowId ? { ...flow, topic: inputText } : flow
        );
        setFlowcharts(updatedFlowcharts);
        setOriginalTopic(inputText);

        if (flowId === currentFlowId) {
          setNodes((nodes: Node<NodeData>[]) => {
            const updatedNodes = [...nodes];
            for (let i = 0; i < updatedNodes.length; i++) {
              if (updatedNodes[i].id === "0") {
                updatedNodes[i] = {
                  ...updatedNodes[i],
                  data: {
                    ...updatedNodes[i].data,
                    label: inputText,
                  },
                };
                break;
              }
            }
            return updatedNodes;
          });
        }
      })
      .catch((err) => {
        const updatedFlowcharts = flowcharts.map((flow) =>
          flow.flowId === flowId ? { ...flow, topic: originalTopic } : flow
        );
        setFlowcharts(updatedFlowcharts);
      })
      .finally(() => {
        setEditingId("");
      });
  };

  return (
    <div className={`${styles["rename-flow-container"]}`}>
      <textarea
        ref={textareaRef}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onBlur={(e) => handleOnBlur(e)}
        autoFocus
      />
    </div>
  );
};

export default EditTopic;
