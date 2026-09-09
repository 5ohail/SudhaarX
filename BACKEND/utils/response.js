/**
 * Standard Success API Response
 */
export const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
  const payload = {
    success: true,
    message,
  };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
};

/**
 * Standard Error API Response
 */
export const errorResponse = (res, statusCode = 400, message = "An error occurred", code = "BAD_REQUEST", details = null) => {
  const payload = {
    success: false,
    message,
    error: {
      code,
    },
  };
  if (details) {
    payload.error.details = details;
  }
  return res.status(statusCode).json(payload);
};
