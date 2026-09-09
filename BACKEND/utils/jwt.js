import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sudhaarx_jwt_secret_production_key_2026";
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "sudhaarx_refresh_secret_key_2026";

/**
 * Generate Access Token (short-lived, e.g. 1 day or 15 mins)
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      username: user.username,
      userType: user.userType,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

/**
 * Generate Refresh Token (longer-lived)
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: "30d" }
  );
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET);
};
