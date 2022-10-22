export type GrabParams = Omit<RequestInit, "method" | "body"> & {
  method?: string;
  body?: any;
  query?: Record<string, any>;
};

export type GrabFunction = (url: string, params?: GrabParams) => Promise<any>;
export type FetchFunction = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

export type LogMethod = (message: string, ...args: any[]) => void;

type GrabSetupOptions = {
  //fetch implementation to use. If not provided, globalThis.fetch will be used
  fetch?: any;
  //if true, detailed errors will be logged to console. Alternatively, you can provide your own logging function
  //(see logError)
  console?: boolean;
  //if set, detailed errors will be logged with this function. If not provided, console.error will be used
  logError?: LogMethod;
};

export type Grab = {
  (url: string, params?: GrabParams): Promise<any>;
  setup: (opts: GrabSetupOptions) => void;
  __globalOpts?: GrabSetupOptions;
};

function getErrorMessage(e: any) {
  return e?.message || "unknown error";
}

function getFetchImpl(): FetchFunction {
  const fetchImpl = grab.__globalOpts?.fetch || globalThis.fetch;
  if (!fetchImpl) {
    throw new Error(
      "No fetch implementation found. If you're using grab in node environment Please call grab.setup({ fetch })"
    );
  }
  return fetchImpl;
}

async function parseJsonResponse(result: Response, method: string, url: string, logError: LogMethod | undefined) {
  const text = await result.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    const message = `Error parsing JSON (len=${text.length}) from ${method} ${url}: ${getErrorMessage(e)}`;
    if (logError) {
      logError(`${message}. Full response: `, text);
    }
    throw new Error(`${message}${logError ? ". See full response in console" : ""}`);
  }
}

export class GrabResponseError extends Error {
  public response: object;
  public request: object;

  constructor(message: string, response: object, request: object) {
    super(message);
    this.response = response;
    this.request = request;
  }
}

export function tryJson(res: any) {
  if (typeof res === "string") {
    try {
      return JSON.parse(res);
    } catch (e) {
      return res;
    }
  }
  return res;
}

function notEmpty(param): boolean {
  return param !== undefined && param !== null && Object.keys(param).length > 0;
}

function withLowerCaseKeys(headers: Record<string, any>) {
  return Object.entries(headers).reduce((acc, [key, value]) => ({ ...acc, [key.toLowerCase()]: value }), {});
}

function urlWithQueryString(url: string, query: Record<string, any>) {
  return `${url}?${Object.entries(query)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join("&")}`;
}

const grabImpl: GrabFunction = async (url: string, { body, headers: _headers = {}, ...rest }: GrabParams = {}) => {
  const fetch = getFetchImpl();
  const logError: LogMethod | undefined =
    grab.__globalOpts?.logError || (grab.__globalOpts?.console ? console.error : undefined);
  const urlWithQuery = notEmpty(rest?.query) ? urlWithQueryString(url, rest?.query || {}) : url;
  const method = rest.method || (body ? "POST" : "GET");
  let result: Response;
  const headers = withLowerCaseKeys(_headers);
  if (!headers["content-type"] && body) {
    headers["content-type"] = "application/json";
  }
  if (!headers["accept"]) {
    headers["accept"] = "application/json";
  }
  if (!headers["user-agent"]) {
    headers["user-agent"] = "https://github.com/vklimontovich/json-grab";
  }
  const requestParams = {
    method: method,
    body: body ? JSON.stringify(body) : undefined,
    headers,
    ...rest,
  };
  try {
    result = await fetch(urlWithQuery, requestParams);
  } catch (e) {
    throw new Error(`Error calling ${method} ${url}: ${getErrorMessage(e)}`);
  }

  const getErrorText = async (result: Response) => {
    try {
      return await result.text();
    } catch (e) {
      return "Unknown error";
    }
  };

  if (!result.ok) {
    let errorText = await getErrorText(result);
    const errorJson = tryJson(errorText);
    const message = `Error ${result.status} on ${method} ${url}`;
    throw typeof errorJson === "string"
      ? new Error(`${message}: ${errorJson}`)
      : new GrabResponseError(message, errorJson, {
          url: urlWithQuery,
          ...requestParams,
          body: body || undefined,
        });
  }
  return await parseJsonResponse(result, method, url, logError);
};

const grab: Grab = grabImpl as any as Grab;

grab.setup = (opts: GrabSetupOptions) => {
  grab.__globalOpts = { ...(grab.__globalOpts || {}), ...opts };
};

export { grab };

export default grab;
