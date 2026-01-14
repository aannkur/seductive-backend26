import { Request, Response, NextFunction } from "express";

interface RequestWithStartTime extends Request {
  startTime?: number;
}

/**
 * Comprehensive logger middleware that logs every request and response
 * Includes: method, URL, host, headers, body, response status, response body, and duration
 */
export const loggerMiddleware = (
  req: RequestWithStartTime,
  res: Response,
  next: NextFunction
) => {
  req.startTime = Date.now();

  const originalSend = res.send;
  const originalJson = res.json;

  let responseBody: any = null;

  res.send = function (body: any) {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.json = function (body: any) {
    responseBody = body;
    return originalJson.call(this, body);
  };

  const requestLog = {
    timestamp: new Date().toISOString(),
    type: "REQUEST",
    method: req.method,
    url: req.originalUrl || req.url,
    host: req.get("host") || req.hostname,
    ip: req.ip || req.connection.remoteAddress,
    protocol: req.protocol,
    headers: {
      ...req.headers,
      authorization: req.headers.authorization ? "***REDACTED***" : undefined,
      cookie: req.headers.cookie ? "***REDACTED***" : undefined,
    },
    query: req.query,
    params: req.params,
    body: req.body && Object.keys(req.body).length > 0 ? req.body : undefined,
  };

  console.log("=".repeat(80));
  console.log(JSON.stringify(requestLog, null, 2));
  console.log("=".repeat(80));

  res.on("finish", () => {
    const duration = req.startTime ? Date.now() - req.startTime : 0;

    const responseLog = {
      timestamp: new Date().toISOString(),
      type: "RESPONSE",
      method: req.method,
      url: req.originalUrl || req.url,
      host: req.get("host") || req.hostname,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      duration: `${duration}ms`,
      headers: res.getHeaders(),
      body:
        responseBody && typeof responseBody === "object"
          ? responseBody
          : responseBody
            ? String(responseBody).substring(0, 500)
            : undefined,
    };

    console.log("=".repeat(80));
    console.log(JSON.stringify(responseLog, null, 2));
    console.log("=".repeat(80));
  });

  next();
};
