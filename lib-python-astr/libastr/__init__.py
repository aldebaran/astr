import sys
try:
    from .resources import Astr
except Exception:
    print("Can't import the library, probably because your python is too old!")
    print("You are running Python {}, try 3.5".format(sys.version_info[:2]))
