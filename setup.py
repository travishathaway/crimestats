from setuptools import setup

setup(
    name='crimestats',
    author='Travis Hathaway',
    author_email='travis.j.hathaway@gmail.com',
    version='0.1',
    packages=[
        'crimestats',
    ],
    url='https://github.com/travishathaway/crimestats',
    license='MIT License',
    description='Flask and SQLAlchemy powered app for browsing Portland, Oregon Crime Statistics',
    long_description=open('README.md').read(),
)
