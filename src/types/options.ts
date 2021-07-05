import { RequestRoute } from "hapi";

interface Info {
  title: string;
  description: string;
  version: string;
  termsOfService: string;
  contact: {
    name: string;
    url: string;
    email: string;
  };
  license: {
    name: string;
    url: string;
  };
}

interface Server {
  url: string;
  description: string;
}

export default interface Options {
  info: Info;
  servers: Server[];
  jsonPath: string;
  pathPrefixSize: number;
  includeFn: (route: RequestRoute) => boolean;
}
