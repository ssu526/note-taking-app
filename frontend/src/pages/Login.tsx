import React, { useContext, useEffect, useState } from "react";
import { NoteContext } from "../context/NoteProvider";
import { Link, useNavigate } from "react-router-dom";
import { SvgSpinners3DotsBounce } from "../components/svg/Spinner1";
import { useGetUser, useLogin } from "../hooks/useApi";
import styles from "../styles/Auth.module.css";

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(NoteContext);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const {
    action: login,
    isLoading: isLoggingIn,
    loadingError: loginError,
  } = useLogin();

  const {
    action: getUser,
    isLoading: isFetchingUser,
    loadingError: fetchingUserError,
  } = useGetUser();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email.trim() === "" || formData.password.trim() === "") {
      setError("All fields are required");
    } else {
      try {
        const data = await login(formData);
        setUser(data);
        navigate("/");
      } catch (err: any) {
        setError(err.message || "Login failed");
        console.log(err);
      }
    }
  };

  useEffect(() => {
    if (user) {
      navigate("/");
    } else {
      getUser()
        .then((data) => {
          setUser(data);
          navigate("/");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, []);

  return (
    <div className={`${styles["container"]}`}>
      <div className={`${styles["auth-container"]}`}>
        <img src="./home-img.PNG" alt="" />

        <div className={`${styles["auth-form-container"]}`}>
          <div className={`${styles["auth-form-title"]}`}>Log In</div>
          <form onSubmit={handleFormSubmission}>
            <input
              type="email"
              value={formData.email}
              name="email"
              placeholder="Email"
              onChange={handleInputChange}
            />
            <input
              type="password"
              value={formData.password}
              name="password"
              placeholder="Password"
              onChange={handleInputChange}
            />
            <button type="submit">Log In</button>
          </form>
          <div className={`${styles["tips"]}`}>
            Don't have an account? <Link to="/signup">Sign Up</Link>!
          </div>

          <div
            className={`${styles["error"]} ${error ? "" : styles["hidden"]}`}
          >
            {error}
          </div>

          <div className={`${isLoggingIn ? "" : styles["hidden"]}`}>
            <SvgSpinners3DotsBounce />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
