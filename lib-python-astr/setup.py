from setuptools import setup, find_packages

setup(

    # Rent-A-Bot Package General Information

    name='libastr',

    version='1.0.0',

    description='ASTR Python tools library.',

    url='https://gitlab.aldebaran.lan/hardware-test/astr',

    keywords='astr python',

    packages=find_packages(exclude=['tests']),

    # Run time Requirements
    install_requires=['requests',
                      'daiquiri'],

)
