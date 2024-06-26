import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import {
  createNote,
  deleteNoteById,
  getNote,
  updateNote,
} from "./controllers/note_controllers";
import {
  createFlow,
  deleteFlow,
  getFlow,
  getFlowsByUserId,
  updateFlow,
  updateFlowName,
} from "./controllers/flow_controllers";
import {
  getLoggedInUser,
  login,
  logout,
  signup,
} from "./controllers/user_controllers";
import session from "express-session";
import MongoStore from "connect-mongo";
import HttpError from "./utils/HttpError";
import { checkAuthentication } from "./middleware/auth";
import path from "path";

dotenv.config();

const app = express();

app.use(express.json({ limit: "5mb" }));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000,
      httpOnly: false, // true
    },
    rolling: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
    }),
  })
);

// User routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/logout", logout);

app.use(checkAuthentication);

app.get("/user", getLoggedInUser);

// Flows routes
app.get("/flows", getFlowsByUserId);
app.get("/flows/:id", getFlow);
app.post("/flows", createFlow);
app.put("/flows/update_name", updateFlowName);
app.put("/flows/:id", updateFlow);
app.delete("/flows", deleteFlow);

// Notes routes
app.get("/notes/:id", getNote);
app.post("/notes", createNote);
app.put("/notes/:id", updateNote);
app.delete("/notes", deleteNoteById);

app.use((req, res, next) => {
  next(new HttpError(404, "Page Not Found"));
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/build")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../frontend/build/index.html"));
  });
}

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;

  if (error instanceof HttpError) {
    errorMessage = error.message;
    statusCode = error.statusCode;
  }

  res.status(statusCode).json({ message: errorMessage });
});

export default app;
