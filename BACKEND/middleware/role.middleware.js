import { errorResponse } from "../utils/response.js";

/**
 * Middleware to enforce role-based access control (RBAC)
 * @param  {...string} allowedRoles - Allowed roles e.g. "ADMIN", "OFFICER", "SUPER_ADMIN"
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required.", "UNAUTHORIZED");
    }

    const userRole = (req.user.userType || "CITIZEN").toUpperCase();
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());

    // Also support legacy roles like 'admin' / 'user'
    if (normalizedAllowed.includes(userRole) || (userRole === "ADMIN" && normalizedAllowed.includes("ADMIN"))) {
      return next();
    }

    return errorResponse(res, 403, "Access denied. Insufficient permissions.", "FORBIDDEN");
  };
};
