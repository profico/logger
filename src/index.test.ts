import { LogLevel, Logger } from "./index";

describe("Test logger", () => {
  let logger = {} as Logger;

  beforeEach(() => {
    logger = Logger.getInstance;
    logger.sendSlackMessage = jest.fn();

    jest.useFakeTimers().setSystemTime(new Date("2020-01-01"));
  });

  it("Should log", async () => {
    const logger = Logger.getInstance;
    logger.sendSlackMessage = jest.fn();

    await logger.log("Test log");

    expect(logger.sendSlackMessage).toBeCalled();
  });

  it("Should log with level", async () => {
    const logger = Logger.getInstance;

    await logger.log("Test log", 1);

    expect(logger.sendSlackMessage).toBeCalled();
    expect(logger.sendSlackMessage).toBeCalledWith(
      "[WARNING-1/1/2020, 1:00:00 AM] Test log"
    );
  });

  it("Should not call slack message if disabled", () => {
    const logger = Logger.getInstance;
    logger.setConfig(1, true);

    logger.log("Test log");

    expect(logger.sendSlackMessage).not.toBeCalled();
  });

  it("Should correctly determine log level", () => {
    const logger = Logger.getInstance;

    logger.setConfig(LogLevel.ERROR, false);

    // When set to error should log only errors
    logger.log("Test log", LogLevel.ERROR);
    expect(logger.sendSlackMessage).toBeCalledTimes(1);

    logger.log("Test log", LogLevel.WARNING);
    expect(logger.sendSlackMessage).toBeCalledTimes(1);

    logger.log("Test log", LogLevel.INFO);
    expect(logger.sendSlackMessage).toBeCalledTimes(1);

    logger.setConfig(LogLevel.WARNING, false);
    // Clear mock calls
    // @ts-expect-error
    logger.sendSlackMessage.mockClear();

    // When set to warning should log only errors and warnings
    logger.log("Test log", LogLevel.ERROR);
    expect(logger.sendSlackMessage).toBeCalledTimes(1);

    logger.log("Test log", LogLevel.WARNING);
    expect(logger.sendSlackMessage).toBeCalledTimes(2);

    logger.log("Test log", LogLevel.INFO);
    expect(logger.sendSlackMessage).toBeCalledTimes(2);

    logger.setConfig(LogLevel.INFO, false);
    // Clear mock calls
    // @ts-expect-error
    logger.sendSlackMessage.mockClear();

    // When set to info should log all
    logger.log("Test log", LogLevel.ERROR);
    expect(logger.sendSlackMessage).toBeCalledTimes(1);

    logger.log("Test log", LogLevel.WARNING);
    expect(logger.sendSlackMessage).toBeCalledTimes(2);

    logger.log("Test log", LogLevel.INFO);
    expect(logger.sendSlackMessage).toBeCalledTimes(3);
  });
});
