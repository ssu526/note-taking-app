import { InferSchemaType, Schema, model } from "mongoose";

const noteSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    flowId: {
      type: Schema.Types.ObjectId,
      ref: "Flow",
    },
    content: {
      type: JSON,
    },
  },
  { timestamps: true }
);

export type Note = InferSchemaType<typeof noteSchema>;

const NoteModel = model<Note>("Note", noteSchema);

export default NoteModel;
