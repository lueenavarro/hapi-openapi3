import { RequestRoute } from "hapi";
import { Schema } from "joi";

interface Info {
  title: string;
  description?: string;
  version?: string;
  termsOfService?: string;
  contact?: {
    name?: string;
    url?: string;
    email?: string;
  };
  license?: {
    name?: string;
    url?: string;
  };
}

interface Server {
  url: string;
  description?: string;
}

export interface ServerPluginOptions {
  info?: Info;
  servers?: Server[];
  jsonPath?: string;
  pathPrefixSize?: number;
  includeFn: (route: RequestRoute) => boolean;
}

interface ResponseOptions {
  schema?: Schema;
  description?: string;
  example?: any;
  examples?: Record<string, any>;
}

export interface RoutePluginOptions {
  responses?: {
    schema?: ResponseOptions;
    status?: Record<string, ResponseOptions>;
  };
}
