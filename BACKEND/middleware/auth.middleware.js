import { verifyAccessToken } from "../utils/jwt.js";
import { errorResponse } from "../utils/response.js";
import User from "../models/userModel.js";

/**
 * Middleware to authenticate requests using JWT Bearer token.
 */
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, 401, "Authentication token required.", "UNAUTHORIZED");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, 401, "Authentication token required.", "UNAUTHORIZED");
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 401, "User account associated with token no longer exists.", "USER_NOT_FOUND");
    }

    if (user.isBanned) {
      return errorResponse(res, 403, "Your account has been suspended.", "ACCOUNT_BANNED");
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Session expired. Please log in again.", "TOKEN_EXPIRED");
    }
    return errorResponse(res, 401, "Invalid authentication token.", "INVALID_TOKEN");
  }
};
