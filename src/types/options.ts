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
