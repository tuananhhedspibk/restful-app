import * as log4js from 'log4js';
import { config } from '@config/logger';

class Logger {
  public default: log4js.Logger;
  public system: log4js.Logger;
  public api: log4js.Logger;
  public access_req: log4js.Logger;
  public access_res: log4js.Logger;
  public sql: log4js.Logger;
  public auth: log4js.Logger;

  public fatal: log4js.Logger;
  public error: log4js.Logger;
  public warn: log4js.Logger;
  public info: log4js.Logger;
  public debug: log4js.Logger;
  public trace: log4js.Logger;

  constructor() {
    log4js.configure(config);

    this.system = log4js.getLogger('system');
    this.api = log4js.getLogger('api');
    this.access_req = log4js.getLogger('access_req');
    this.access_res = log4js.getLogger('access_res');
    this.sql = log4js.getLogger('sql');
    this.auth = log4js.getLogger('auth');

    this.fatal = log4js.getLogger('fatal');
    this.fatal.level = log4js.levels.FATAL;

    this.error = log4js.getLogger('error');
    this.error.level = log4js.levels.ERROR;

    this.warn = log4js.getLogger('warn');
    this.warn.level = log4js.levels.WARN;

    this.info = log4js.getLogger('info');
    this.info.level = log4js.levels.INFO;

    this.debug = log4js.getLogger('debug');
    this.debug.level = log4js.levels.DEBUG;

    this.trace = log4js.getLogger('trace');
    this.trace.level = log4js.levels.TRACE;
  }
}

export default new Logger();
