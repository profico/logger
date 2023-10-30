export enum LogLevel {
  ERROR,
  WARNING,
  INFO,
}

const level = process.env.LOGGER_LOG_LEVEL
  ? Number(process.env.LOGGER_LOG_LEVEL)
  : LogLevel.INFO;
const disableSlack = process.env.LOGGER_DISABLE_SLACK
  ? Boolean(process.env.DISABLE_SLACK)
  : false;

const loggerSlackUrl = process.env.LOGGER_SLACK_WEBHOOK_URL;

export class Logger {
  private level: LogLevel;
  private disableSlack: boolean;
  private static instance: Logger;

  constructor(level: LogLevel, disableSlack = false) {
    this.level = level;
    this.disableSlack = disableSlack;
  }

  public setConfig(level: LogLevel, disableSlack = false) {
    this.level = level;
    this.disableSlack = disableSlack;
  }

  public static get getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger(level, disableSlack);
    }

    return Logger.instance;
  }

  async log(message: string, level: LogLevel = LogLevel.INFO) {
    if (this.level < level) {
      return;
    }

    // date in format of DD/MM/YYYY HH:MM:SS
    const timestamp = new Date().toLocaleString();
    const annotatedMessage = `[${LogLevel[level]}-${timestamp}] ${message}`;

    console.log(annotatedMessage);

    if (this.disableSlack) {
      return;
    }

    return this.sendSlackMessage(annotatedMessage);
  }

  public async sendSlackMessage(message: string) {
    if (!loggerSlackUrl) {
      throw new Error("SLACK_WEBHOOK_URL is not defined");
    }
    const response = await fetch(loggerSlackUrl, {
      method: "POST",
      body: JSON.stringify({ text: message }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to send slack message: ${response.statusText}`);
    }
  }
}
