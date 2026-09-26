import userModel from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/auth.utils.js";

//controller for user registration
const userRegisterController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check if user already exists
    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
      return res.status(400).json({
        message: "User already exists",
        errors: [
          {
            path: "email",
            msg: "Email already registered",
          },
        ],
      });
    }

    //hash password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    //create user
    const user = await userModel.create({
      name,
      email,
      passwordHash: hashedPassword,
    });

    //generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });
    const refreshToken = generateRefreshToken({
      userId: user._id,
      role: user.role,
    });

    //hash refresh token
    const refreshTokenHash = await bcryptjs.hash(refreshToken, salt);

    //update user with refresh token hash
    await userModel.findByIdAndUpdate(user._id, {
      refreshTokenHash,
    });

    //set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days in milliseconds
    });

    return res.status(201).json({
      message: "User registered successfully",
      data: {
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
        },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while registering user",
      error: error.message,
    });
  }
};

//controller for user login
const userLoginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    //check if user exists
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
        errors: [
          {
            path: "email",
            msg: "Invalid email or password",
          },
        ],
      });
    }

    //validate password
    const isPasswordValid = await bcryptjs.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid email or password",
        errors: [
          {
            path: "password",
            msg: "Invalid email or password",
          },
        ],
      });
    }

    //generate tokens
    const accessToken = generateAccessToken({
      userId: user._id,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id,
      role: user.role,
    });

    //hash refresh token
    const salt = await bcryptjs.genSalt(10);
    const refreshTokenHash = await bcryptjs.hash(refreshToken, salt);

    //update user with refresh token hash
    await userModel.findByIdAndUpdate(user._id, {
      refreshTokenHash,
    });

    //set refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "User logged in successfully",
      data: {
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
        },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while logging in user",
      error: error.message,
    });
  }
};

//controller for user refresh token
const userRefreshTokenController = async (req, res) => {
  //get refresh token from cookie
  const refreshToken = req.cookies.refreshToken;

  //check if refresh token exists
  if (!refreshToken) {
    return res.status(401).json({
      message: "Refresh token is required",
    });
  }
  try {
    //verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    const { userId, role } = decoded;

    //check if user exists
    const user = await userModel.findById(userId);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    //check if refresh token hash matches
    const isRefreshTokenHashValid = await bcryptjs.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenHashValid) {
      await userModel.findByIdAndUpdate(user._id, {
        refreshTokenHash: null, //logout the user if refresh token is stolen
      });

      return res.status(401).json({
        message: "Refresh token mismatch",
      });
    }

    //generate new tokens
    const accessToken = generateAccessToken({
      userId,
      role,
    });

    const newRefreshToken = generateRefreshToken({
      userId,
      role,
    });

    //hash new refresh token
    const salt = await bcryptjs.genSalt(10);
    const refreshTokenHash = await bcryptjs.hash(newRefreshToken, salt);

    //update user with new refresh token hash
    await userModel.findByIdAndUpdate(user._id, {
      refreshTokenHash,
    });

    //set new refresh token in cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Refresh token generated successfully",
      data: {
        user: {
          email: user.email,
          name: user.name,
          id: user._id,
        },
        accessToken,
      },
    });
  } catch (error) {
    return res.status(400).json({
      message: "Invalid refresh token",
      error: error.message,
    });
  }
};

//controller for user details
const getUserController = async (req, res) => {
  const { userId, role } = req.user;

  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  return res.status(200).json({
    message: "User fetched successfully",
    data: {
      user: {
        email: user.email,
        name: user.name,
        id: user._id,
      },
    },
  });
};

//controller for user logout
const logoutUserController = async (req, res) => {
  try {
    //get refresh token from cookie
    const refreshToken = req.cookies.refreshToken;

    //check if refresh token exists
    if (!refreshToken) {
      return res.status(401).json({
        message: "Refresh token is required",
      });
    }

    //verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    const { userId, role } = decoded;

    //check if user exists
    const user = await userModel.findById(userId);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        message: "Invalid refresh token",
      });
    }

    //check if refresh token hash matches
    const isRefreshTokenHashValid = await bcryptjs.compare(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isRefreshTokenHashValid) {
      await userModel.findByIdAndUpdate(user._id, {
        refreshTokenHash: null,
      });

      return res.status(401).json({
        message: "Refresh token mismatch",
      });
    }
    //remove refresh token hash from user
    await userModel.findByIdAndUpdate(user._id, {
      refreshTokenHash: null,
    });

    //clear refresh token cookie
    res.clearCookie("refreshToken");

    return res.status(200).json({
      message: "User logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error while logging out user",
      error: error.message,
    });
  }
};

export {
  userRegisterController,
  userLoginController,
  userRefreshTokenController,
  getUserController,
  logoutUserController,
};
