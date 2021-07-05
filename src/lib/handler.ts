import { Request } from "hapi";

const handler = (req: Request) => {
  console.log(req);
  return {
    openapi: "3.0.0",
  };
};

export default handler;
