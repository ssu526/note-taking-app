import { RequestHandler } from "express";
import UserModel from "../models/User";
import HttpError from "../utils/HttpError";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

interface SignUpBody {
  username?: string;
  email?: string;
  password?: string;
}

interface LoginBody {
  email?: string;
  password?: string;
}

/**
 * Get the currently logged-in user's information.
 *
 * Retrieves the user's information based on the user ID stored in the session.
 * If the user is found, respond with the user ID and username.
 *
 * @param req
 * @param res
 * @param next
 */
export const getLoggedInUser: RequestHandler = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.session.userId);

    if (!user) {
      throw new HttpError(404, "User not found.");
    }

    res.status(200).json({ id: user._id, username: user.username });
  } catch (err) {
    next(err);
  }
};

/**
 * Handle signup request.
 *
 * @param req
 * @param res
 * @param next
 */
export const signup: RequestHandler<
  unknown,
  unknown,
  SignUpBody,
  unknown
> = async (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const passwordRaw = req.body.password;

  try {
    if (!username) {
      throw new HttpError(400, "Username is missing.");
    }

    if (!email) {
      throw new HttpError(400, "Email is missing.");
    }

    if (!passwordRaw) {
      throw new HttpError(400, "Password is missing.");
    }

    const existingEmail = await UserModel.findOne({ email: email });

    if (existingEmail) {
      throw new HttpError(409, "Email already taken.");
    }

    const passwordHashed = await bcrypt.hash(passwordRaw, 10);

    const newUser = await UserModel.create({
      username: username,
      email: email,
      password: passwordHashed,
      flows: [],
    });

    req.session.userId = newUser._id;
    res.status(201).json({ id: newUser._id, username: newUser.username });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles login request
 *
 * @param req
 * @param res
 * @param next
 */
export const login: RequestHandler<
  unknown,
  unknown,
  LoginBody,
  unknown
> = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    if (!email) {
      throw new HttpError(400, "Email is missing.");
    }

    if (!password) {
      throw new HttpError(400, "Password is missing.");
    }

    const user = await UserModel.findOne({ email: email }).select("+password");

    if (!user) {
      throw new HttpError(401, "Invalid credentials");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new HttpError(401, "Invalid credentials");
    }

    req.session.userId = user._id;
    res.status(200).json({ id: user._id, username: user.username });
  } catch (err) {
    next(err);
  }
};

/**
 * Handles logout request
 *
 * @param req
 * @param res
 * @param next
 */
export const logout: RequestHandler = async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ message: "Failed to log out. Please try again." });
    } else {
      res.sendStatus(204);
    }
  });
};
