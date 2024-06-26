import React, { useCallback, useContext, useEffect, useRef } from "react";
import styles from "../../styles/Flow.module.css";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  EdgeChange,
  MiniMap,
  NodeChange,
  OnConnectEnd,
  OnConnectStart,
  OnConnectStartParams,
  OnNodesDelete,
  Panel,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "reactflow";
import TopicNode from "./TopicNode";
import { v4 as uuid } from "uuid";
import "reactflow/dist/style.css";
import { NoteContext } from "../../context/NoteProvider";
import { useDeleteNote, useGetFlow, useUpdateFlow } from "../../hooks/useApi";
import { SvgSpinners3DotsBounce } from "../svg/Spinner1";

const nodeTypes = { topicNode: TopicNode };

const Flow = () => {
  const { setViewport, getViewport, toObject } = useReactFlow();
  const reactFlowWrapper = useRef(null);
  const connectingNodeId = useRef<string | null>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { currentFlowId, currentNoteId, setCurrentNoteId } =
    useContext(NoteContext);

  // APIs
  const {
    action: getFlow,
    isLoading: isLoadingFlow,
    loadingError: flowLoadingError,
  } = useGetFlow(currentFlowId ? currentFlowId : "");

  const {
    action: saveFlow,
    isLoading: isSavingFlow,
    loadingError: savingFlowError,
  } = useUpdateFlow(currentFlowId ? currentFlowId : "");

  const {
    action: deleteNote,
    isLoading: isDeletingFlow,
    loadingError: deleteNoteError,
  } = useDeleteNote();

  // useEffect
  useEffect(() => {
    if (currentFlowId) {
      getFlow()
        .then((data) => {
          setNodes(data.flow.nodes);
          setEdges(data.flow.edges);
          setViewport(data.flow.viewport);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [currentFlowId]);

  useEffect(() => {
    if (currentFlowId) {
      saveFlow({ flowchart: toObject() }).catch((err) => {
        console.log(err);
      });
    }
  }, [nodes]);

  // ReactFlow events
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onConnectStart: OnConnectStart = useCallback(
    (
      e: React.MouseEvent<Element> | React.TouchEvent<Element>,
      { nodeId }: OnConnectStartParams
    ) => {
      connectingNodeId.current = nodeId;
    },
    []
  );

  const onConnectEnd: OnConnectEnd = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!connectingNodeId.current) return;

      const targetIsPane: boolean = (
        e.target as HTMLElement
      ).classList.contains("react-flow__pane");

      const newNodeId: string = uuid();

      let x, y;
      if (e instanceof MouseEvent) {
        x = e.clientX;
        y = e.clientY;
      } else {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      }

      if (targetIsPane) {
        const newNode = {
          id: newNodeId,
          type: "topicNode",
          data: {
            label: "",
            noteId: "",
          },
          position: screenToFlowPosition({ x, y }),
          origin: [0.5, 0.0],
        };

        setNodes((nds) => nds.concat(newNode));

        const newEdgeId: string = uuid();
        setEdges((eds) =>
          eds.concat({
            id: newEdgeId!,
            source: connectingNodeId.current!,
            target: newNodeId,
          })
        );
      }
    },
    [screenToFlowPosition]
  );

  const onNodeDelete: OnNodesDelete = async (deleted) => {
    const noteId = deleted[0].data.noteId;

    if (noteId) {
      try {
        await deleteNote({ noteId: noteId });
        if (noteId === currentNoteId) {
          setCurrentNoteId("");
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  if (currentNoteId) {
    setViewport({ ...getViewport(), zoom: 1 });
  } else {
    setViewport({ ...getViewport(), zoom: 2 });
  }

  return (
    <>
      {currentFlowId ? (
        <div className={`${styles["container"]}`} ref={reactFlowWrapper}>
          {isLoadingFlow ? (
            <div className={`${styles["spinner"]}`}>
              <SvgSpinners3DotsBounce />
            </div>
          ) : (
            <ReactFlow
              nodeTypes={nodeTypes}
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onConnectStart={onConnectStart}
              onConnectEnd={onConnectEnd}
              onNodesDelete={onNodeDelete}
              fitView
            >
              <Controls />
              <Background variant={BackgroundVariant.Dots} />
            </ReactFlow>
          )}
        </div>
      ) : (
        <div className={`${styles["no-flow-selected-text"]}`}>
          <p>No flowchart selected</p>
        </div>
      )}
    </>
  );
};

export default Flow;
