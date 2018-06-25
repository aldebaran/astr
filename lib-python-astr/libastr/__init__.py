import sys
if sys.version_info[0] < 3:
    raise Exception("Must be using Python 3")
else:
    try:
        from .resources import Astr
    except ImportError:
        print("Can't import the library")
        print("You are running Python {}, try 3.5".format(sys.version_info[:2]))
