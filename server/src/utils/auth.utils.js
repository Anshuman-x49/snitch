import jwt from "jsonwebtoken";
import config from "../config/config.js";

const generateAccessToken = ({ userId, role }) => {
  return jwt.sign({ userId, role }, config.access_token_secret, {
    expiresIn: "15m",
  });
};

const generateRefreshToken = ({ userId, role }) => {
  return jwt.sign({ userId, role }, config.refresh_token_secret, {
    expiresIn: "7d",
  });
};

const verifyRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, config.refresh_token_secret);
};

const verifyAccessToken = (accessToken) => {
  return jwt.verify(accessToken, config.access_token_secret);
};

export {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
};
