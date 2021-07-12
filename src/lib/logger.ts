const error = (type: string, message: string) => {
  console.error("HAPI_OPENAPI3_ERROR: ", {
    type,
    message: message,
  });
};

export default {
  error,
};
