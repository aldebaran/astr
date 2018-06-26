import sys
if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")
else:
    try:
        from .resources import Astr
    except ImportError as e:
        errmsg = "Can't import the library"
        raise Exception(errmsg).with_traceback(e.__traceback__)
