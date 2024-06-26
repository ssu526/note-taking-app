import { RequestHandler } from "express";
import NoteModel, { Note } from "../models/Note";
import mongoose from "mongoose";
import HttpError from "../utils/HttpError";

/**
 * Create a new note associated with a specific flowchart for the authenticated user
 *
 * @param req
 * @param res
 * @param next
 */
export const createNote: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  const flowId = req.body.flowId;
  const initialContent = [
    {
      type: "heading",
      content: "Title",
    },
  ];

  const newNote = await NoteModel.create({
    userId: authenticatedUserId,
    flowId: flowId,
    content: initialContent,
  });

  res.status(201).json({
    id: newNote._id,
    updatedAt: newNote.updatedAt,
  });
};

/**
 * Retrieve a note for the authenticated user
 *
 * @param req
 * @param res
 * @param next
 */
export const getNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.id;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(noteId)) {
      throw new HttpError(400, "Note ID is not valid.");
    }

    const note = await NoteModel.findById(noteId);

    if (!note) {
      throw new HttpError(404, "Note not found.");
    }

    if (!note.userId!.equals(authenticatedUserId)) {
      throw new HttpError(403, "Unauthorized");
    }

    res.status(200).json({ updatedAt: note.updatedAt, content: note.content });
  } catch (err) {
    next(err);
  }
};

/**
 * Update a note for the authenticated user
 *
 * @param req
 * @param res
 * @param next
 */
export const updateNote: RequestHandler = async (req, res, next) => {
  const noteId = req.params.id;
  const noteContent = req.body.content;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(noteId)) {
      throw new HttpError(400, "Note ID is not valid.");
    }

    const note = await NoteModel.findById(noteId);

    if (!note) {
      throw new HttpError(404, "Note not found.");
    }

    if (!note.userId!.equals(authenticatedUserId)) {
      throw new HttpError(403, "Unauthorized");
    }

    const query = { _id: noteId };
    const update = { content: noteContent };

    try {
      await NoteModel.findOneAndUpdate(query, update);
      res.sendStatus(204);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Failed to update note." });
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a note for the authenticated user
 *
 * @param req
 * @param res
 * @param next
 */
export const deleteNoteById: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;
  const noteId = req.body.noteId;

  try {
    if (!mongoose.isValidObjectId(noteId)) {
      throw new HttpError(400, "Note ID is not valid.");
    }

    const note = await NoteModel.findById(noteId);

    if (!note) {
      throw new HttpError(404, "Note not found.");
    }

    if (!note.userId!.equals(authenticatedUserId)) {
      throw new HttpError(403, "Unauthorized");
    }

    await note.deleteOne();

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
