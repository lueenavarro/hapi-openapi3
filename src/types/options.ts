import { RequestRoute } from "hapi";
import { Schema } from "joi";

export interface Info {
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

export interface ServersURL {
  url: string;
  description?: string;
}

export interface ServerPluginOptions {
  info?: Info;
  servers?: ServersURL[];
  jsonPath?: string;
  pathPrefixSize?: number;
  includeFn: (route: RequestRoute) => boolean;
}

export interface ResponseOptions {
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
