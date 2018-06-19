from __future__ import unicode_literals

import logging
import daiquiri
import daiquiri.formatter

LOG_FORMAT = "%(color)s%(asctime)s - %(name)s.%(funcName)s - %(message)s%(color_stop)s"


def set_level(level):
    """Set log level

    Args:
        level (unicode): log level (debug, info, warning, error, critical)

    """
    level = level.lower()

    if level == 'debug':
        level = logging.DEBUG
    elif level == 'info':
        level = logging.INFO
    elif level == 'warning':
        level = logging.WARNING
    elif level == 'error':
        level = logging.ERROR
    elif level == 'critical':
        level = logging.CRITICAL
    else:
        raise ValueError("Log level unknown : {}".format(level))

    daiquiri.setup(
        level=level,
        outputs=(
            daiquiri.output.Stream(formatter=daiquiri.formatter.ColorFormatter(fmt=LOG_FORMAT)),
        )
    )


def get_logger(name, **kwargs):
    """Return a logger object configured to print in stdout

    Args:
        name (str): Logger name

    Returns:
        A logger object
    """
    # instantiate the logger object
    return daiquiri.getLogger(name, **kwargs)
