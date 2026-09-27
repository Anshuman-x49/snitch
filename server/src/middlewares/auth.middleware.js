import { verifyAccessToken } from "../utils/auth.utils.js";

const authenticationMiddleware = async (req, res, next) => {
  const accesstoken = req.headers.authorization?.split(" ")[1];

  if (!accesstoken) {
    return res.status(400).json({
      message: "Access token is required",
    });
  }
  try {
    const decoded = verifyAccessToken(accesstoken);

    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({
      message: "Invalid or expired access token",
    });
  }
};

const authorizationMiddleware = async (req, res, next) => {
  if (req.user.role !== "seller") {
    return res.status(403).json({
      message: "You are not authorized to do this action",
    });
  }
  next();
};

export { authenticationMiddleware, authorizationMiddleware };
