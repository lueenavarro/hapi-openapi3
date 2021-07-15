import { RequestRoute } from "hapi";
import { Schema } from "joi";

export interface Info {
  title: string;
  version: string;
  description?: string;
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
  serversFn?: (host: string) => ServersURL[];
  jsonPath?: string;
  pathPrefixSize?: number;
  singleSchemaInParams?: boolean;
  pathFn?: (path: string) => string;
  includeFn: (route: RequestRoute) => boolean;
}

export interface RequestOptions {
  example?: any;
  examples?: Record<string, any>;
}

export interface ResponseOptions {
  header?: Schema;
  payload?: Schema;
  description?: string;
  example?: any;
  examples?: Record<string, any>;
}

export interface RoutePluginOptions {
  request: RequestOptions;
  response?: {
    headerSchema: Schema;
    schema?: ResponseOptions;
    status?: Record<string, ResponseOptions>;
  };
}
