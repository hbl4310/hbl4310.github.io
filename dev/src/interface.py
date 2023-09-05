import logging
import sys
import argparse

def logger_setup(logger, level=logging.INFO):
    stdout = logging.StreamHandler(stream=sys.stdout)
    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(filename)s:%(lineno)s >> %(message)s")
    stdout.setFormatter(fmt)
    logger.addHandler(stdout)
    logger.setLevel(level)
    return logger

# https://docs.python.org/3/library/argparse.html#action
class LoggingAction(argparse.Action):
    levels = {"notset", "debug", "info", "warn", "error", "critical"}
    def __init__(self, option_strings, dest, nargs=None, **kwargs):
        if nargs is not None:
            raise ValueError("nargs not allowed")
        super().__init__(option_strings, dest, **kwargs)

    def __call__(self, parser, namespace, values, option_string=None):
        if values.isnumeric():
            v = float(values)
            l = min(max(int(v/10)*10, logging.NOTSET), logging.CRITICAL)
        else: 
            if values.lower() in self.levels: 
                l = getattr(logging, values.upper())
            else:
                raise ValueError(f"Logging level '{values}' not recognised.")
        setattr(namespace, self.dest, l)

def get_args():
    parser = argparse.ArgumentParser(
        prog="Static Site Builder",
        description="Builds Static Site"
    )
    parser.add_argument("-l", "--log-level", action=LoggingAction, default=logging.INFO, help="logging level; int or str")
    args = parser.parse_args()
    logger = logging.getLogger("builder")
    logger_setup(logger, args.log_level)
    return args, logger
