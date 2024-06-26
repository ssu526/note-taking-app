import { InferSchemaType, Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      select: false,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    flows: {
      type: [
        {
          flowId: {
            type: Schema.Types.ObjectId,
            ref: "Flow",
          },
          topic: String,
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

type User = InferSchemaType<typeof userSchema>;

const UserModel = model<User>("User", userSchema);

export default UserModel;
