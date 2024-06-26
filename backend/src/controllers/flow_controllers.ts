import { RequestHandler } from "express";
import mongoose from "mongoose";
import HttpError from "../utils/HttpError";
import FlowModel from "../models/Flow";
import UserModel from "../models/User";
import NoteModel from "../models/Note";

const INITIAL_TOPIC_NAME = "New Topic";

const INITIAL_FLOW = {
  nodes: [
    {
      id: "0",
      type: "topicNode",
      position: {
        x: 0,
        y: 0,
      },
      deletable: false,
      data: {
        label: INITIAL_TOPIC_NAME,
        noteId: "",
      },
      width: 100,
      height: 27,
      selected: true,
      dragging: true,
    },
  ],
  edges: [],
  viewport: {
    x: 225.29,
    y: 1209.25,
    zoom: 1,
  },
};

/**
 * Retrieve a specific flowchart owned by the authenticated user.
 *
 * @param req
 * @param res
 * @param next
 */
export const getFlow: RequestHandler = async (req, res, next) => {
  const flowId = req.params.id;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flowchart ID is not valid.");
    }

    const flowchart = await FlowModel.findById(flowId);

    if (!flowchart) {
      throw new HttpError(404, "Flowchart not found");
    }

    if (!flowchart.userId.equals(authenticatedUserId)) {
      throw new HttpError(403, "Unauthorized");
    }

    res.status(200).json(flowchart);
  } catch (err) {
    next(err);
  }
};

/**
 * Retrive all flowcharts(ID and topic) for the authenticated user
 *
 * @param req
 * @param res
 * @param next
 */
export const getFlowsByUserId: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  try {
    const user = await UserModel.findById(authenticatedUserId);
    res.status(200).json(user?.flows);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new flowchart for the authenticated user.
 * Respond with the ID and topic of the newly creaated flowchart.
 *
 * @param req
 * @param res
 * @param next
 */
export const createFlow: RequestHandler = async (req, res, next) => {
  const authenticatedUserId = req.session.userId;

  const newFlowchart = {
    userId: authenticatedUserId,
    flow: INITIAL_FLOW,
  };

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const flowchartAdded = await FlowModel.create([newFlowchart], { session });

    await UserModel.updateOne(
      { _id: authenticatedUserId },
      {
        $push: {
          flows: { flowId: flowchartAdded[0]._id, topic: INITIAL_TOPIC_NAME },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res
      .status(201)
      .json({ flowId: flowchartAdded[0]._id, topic: INITIAL_TOPIC_NAME });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

/**
 * Update a specific flowchart for the authenticated user.
 * Respond with the updated flowchart.
 *
 * @param req
 * @param res
 * @param next
 */
export const updateFlow: RequestHandler = async (req, res, next) => {
  const flowId = req.params.id;
  const flowchart = req.body.flowchart;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flowchart ID is not valid.");
    }

    const existingFlowchart = await FlowModel.findById(flowId);

    if (!existingFlowchart) {
      throw new HttpError(404, "Flowchart not found.");
    }

    if (!existingFlowchart.userId.equals(authenticatedUserId)) {
      throw new HttpError(403, "Not Authorized");
    }

    existingFlowchart.flow = flowchart;

    const updatedFlow = await existingFlowchart.save();

    res.status(200).json(updatedFlow);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a specific flowchart owned by the authenticated user.
 * Also deletes all notes associate with the flowchart.
 *
 * @param req
 * @param res
 * @param next
 */
export const deleteFlow: RequestHandler = async (req, res, next) => {
  const flowId = req.body.flowId;
  const authenticatedUserId = req.session.userId;

  try {
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flowchart ID is not valid.");
    }

    const existingFlowchart = await FlowModel.findById(flowId);

    if (!existingFlowchart) {
      throw new HttpError(404, "Flowchart not found.");
    }

    if (!existingFlowchart.userId.equals(authenticatedUserId)) {
      throw new HttpError(403, "Not Authorized");
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await NoteModel.deleteMany({ flowId: flowId }).session(session);

      await existingFlowchart.deleteOne({ session });

      await UserModel.updateOne(
        { _id: authenticatedUserId },
        { $pull: { flows: { flowId: flowId } } },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.sendStatus(204);
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Update the name of a flowchart.
 *
 * @param req
 * @param res
 * @param next
 */
export const updateFlowName: RequestHandler = async (req, res, next) => {
  const flowId = req.body.flowId;
  const authenticatedUserId = req.session.userId;
  const newTopic = req.body.topic;

  try {
    if (!newTopic || newTopic.trim().length === 0) {
      throw new HttpError(400, "Topic is missing.");
    }
    if (!mongoose.isValidObjectId(flowId)) {
      throw new HttpError(400, "Flowchart ID is not valid.");
    }

    const existingFlowchart = await FlowModel.findById(flowId);

    if (!existingFlowchart) {
      throw new HttpError(404, "Flowchart not found.");
    }

    if (!existingFlowchart.userId.equals(authenticatedUserId)) {
      throw new HttpError(403, "Not Authorized");
    }

    await UserModel.findOneAndUpdate(
      { _id: authenticatedUserId, "flows.flowId": flowId },
      { $set: { "flows.$.topic": newTopic } },
      { new: true }
    );

    await FlowModel.findOneAndUpdate(
      { _id: flowId, "flow.nodes.id": "0" },
      { $set: { "flow.nodes.$.data.label": newTopic } }
    );

    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
