import bodyParser from 'body-parser';
import errorhandler from 'errorhandler';
import express from 'express';
import { Express } from 'express-serve-static-core';
import morgan from 'morgan';
import morganBody from 'morgan-body';
import { ResponseError } from './models/ResponseError';
import { RootConfig } from './models/RootConfig';
import { logger } from './util/logger';

export default function addMiddelwareTo(app: Express, rootConfig: RootConfig): void {
  app.use(bodyParser.json());
  addLoggingMiddleware(app, rootConfig);
}
function addLoggingMiddleware(app: Express, rootConfig: RootConfig) {
  if (rootConfig.isProduction) {
    app.use(
      morgan(':method :url :status :response-time ms - :res[content-length]', {
        stream: logger.getStream(),
      })
    );
  } else {
    morganBody(app, { prettify: false, stream: logger.getStream() });
  }
}
export function addResponseMiddlewareTo(app: Express, rootConfig: RootConfig): void {
  if (rootConfig.isProduction == false) {
    app.use(errorhandler({ log: err => logger.error(err) }));
  }
  app.use(
    (
      err: ResponseError,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      if (err) {
        logger.warn(req.url);
        logger.error(err);
        res.status(err.status).json(err);
      } else {
        next;
      }
    }
  );
}
