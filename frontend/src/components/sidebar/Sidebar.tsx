import React, { useContext, useEffect, useState } from "react";
import styles from "../../styles/Sidebar.module.css";
import { Flow, NoteContext } from "../../context/NoteProvider";
import { useNavigate } from "react-router-dom";
import { useReactFlow } from "reactflow";
import {
  useAddFlow,
  useGetFlows,
  useLogout,
  useUpdateFlow,
} from "../../hooks/useApi";
import EditTopic from "./EditTopic";
import DeleteFlow from "./DeleteFlow";
import { SvgSpinners3DotsBounce } from "../svg/Spinner1";

const Sidebar = () => {
  const navigate = useNavigate();
  const { toObject } = useReactFlow();
  const [editingId, setEditingId] = useState("");
  const [deleteFlowId, setDeleteFlowId] = useState("");
  const {
    user,
    setUser,
    currentFlowId,
    setCurrentFlowId,
    setCurrentNoteId,
    flowcharts,
    setFlowcharts,
  } = useContext(NoteContext);

  /****************************** APIs ********************************/
  const { action: getFlows, isLoading, loadingError } = useGetFlows();

  const {
    action: updateFlow,
    isLoading: isUpdatingFlow,
    loadingError: updateFlowError,
  } = useUpdateFlow(currentFlowId ? currentFlowId : "");

  const {
    action: addFlow,
    isLoading: isAddingFlow,
    loadingError: addFlowError,
  } = useAddFlow();

  const {
    action: logout,
    isLoading: isLoggingOut,
    loadingError: logoutError,
  } = useLogout();

  /***************** INITIAL DATA LOADING & EVENT HANDLERS ******************/
  useEffect(() => {
    getFlows()
      .then((data) => {
        setFlowcharts(data);
      })
      .catch((err) => console.log(err));
  }, []);

  const handleAddFlow = () => {
    addFlow()
      .then((data) => {
        setFlowcharts((prev) => [
          ...prev,
          { flowId: data.flowId, topic: data.topic },
        ]);
      })
      .catch((err) => console.log(err));
  };

  const handleLogout = () => {
    logout()
      .catch((err) => console.log(err))
      .finally(() => {
        setUser(null);
        navigate("/login");
      });
  };

  const handleClicks = async (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    flowId: string | null
  ) => {
    if (currentFlowId) {
      await updateFlow({ flowchart: toObject() });
    }
    setCurrentFlowId(flowId);
    setCurrentNoteId(null);
  };

  return (
    <div className={`${styles["container"]}`}>
      <div className={`${styles["user-name-container"]}`}>
        <p className={`${styles["user-name"]}`}>{user?.username}</p>
        <button className={`${styles["btn-logout"]}`} onClick={handleLogout}>
          Log out
        </button>
      </div>

      <div className={`${styles["wrapper"]}`}>
        <button
          className={`${styles["btn-add-topic"]}`}
          onClick={handleAddFlow}
        >
          + New Topic
        </button>

        {isLoading && (
          <div className={`${styles["spinner"]}`}>
            <SvgSpinners3DotsBounce />
          </div>
        )}

        {loadingError && <div>Failed to load flowcharts</div>}

        {!isLoading && !loadingError && !flowcharts && (
          <div>
            <p>No charts found.</p>
            <p>Create one!</p>
          </div>
        )}

        {!isLoading &&
          !loadingError &&
          flowcharts &&
          flowcharts.map((flow: Flow) => (
            <div
              key={flow.flowId}
              className={`${styles["topic-container"]} ${
                flow.flowId === currentFlowId ? styles["selected-topic"] : ""
              }`}
            >
              <p
                className={`${styles["topic-name-container"]}`}
                onClick={(e) => handleClicks(e, flow.flowId)}
              >
                🗒 {flow.topic}
              </p>
              <div className={`${styles["topic-edit-container"]}`}>
                <span
                  onClick={(e) => {
                    setEditingId(flow.flowId);
                    setDeleteFlowId("");
                  }}
                >
                  ✎
                </span>
                <span
                  onClick={(e) => {
                    setDeleteFlowId(flow.flowId);
                    setEditingId("");
                  }}
                >
                  🗑️
                </span>
              </div>

              {editingId === flow.flowId && (
                <EditTopic
                  flowId={flow.flowId}
                  topic={flow.topic}
                  setEditingId={setEditingId}
                />
              )}

              {deleteFlowId === flow.flowId && (
                <DeleteFlow
                  flowId={flow.flowId}
                  topic={flow.topic}
                  setFlowcharts={setFlowcharts}
                  setDeleteFlowId={setDeleteFlowId}
                />
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Sidebar;
