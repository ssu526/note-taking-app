import React, { useContext, useEffect } from "react";
import Sidebar from "../components/sidebar/Sidebar";
import Flow from "../components/flow/Flow";
import Editor from "../components/Editor";
import styles from "../styles/Home.module.css";
import { ReactFlowProvider } from "reactflow";
import { NoteContext } from "../context/NoteProvider";
import { useNavigate } from "react-router-dom";
import { useReactFlow } from "reactflow";
import { useGetUser, useUpdateFlow } from "../hooks/useApi";
import { SvgSpinners3DotsBounce } from "../components/svg/Spinner1";

const Home = () => {
  const { user, setUser, currentFlowId, currentNoteId } =
    useContext(NoteContext);
  const navigate = useNavigate();
  const { toObject } = useReactFlow();
  const {
    action: getUser,
    isLoading: isGettingUser,
    loadingError: getUserError,
  } = useGetUser();
  const {
    action: updateFlowInDB,
    isLoading: isUpdatingFlow,
    loadingError: updateFlowError,
  } = useUpdateFlow(currentFlowId ? currentFlowId : "");

  useEffect(() => {
    if (!user) {
      getUser()
        .then((data) => {
          setUser(data);
        })
        .catch((err) => {
          navigate("/login");
        });
    }
  }, [user]);

  useEffect(() => {
    const handleBeforeUnload = async () => {
      if (currentFlowId) {
        await updateFlowInDB({ flowchart: toObject() });
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  return (
    <div className={`${styles["home-container"]}`}>
      {isGettingUser && <SvgSpinners3DotsBounce />}
      {!isGettingUser && (
        <ReactFlowProvider>
          <Sidebar />
          {currentNoteId && <Editor />}
          <Flow />
        </ReactFlowProvider>
      )}
    </div>
  );
};

export default Home;
