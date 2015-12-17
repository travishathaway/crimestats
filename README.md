# Crime Stats

Welcome to the Crime Stats web app.  This application is a combination of an AngularJS and Flask app.  This app was primarily developed to work with datasets of reported crimes occurring in Portland, Oregon, but could concieveably be used for any city/region so long as the data is stored in the database accordingly.

The web application currently has no active URL (sorry).

## Installation
To install the required dependencies you will need Python, NPM and Bower installed on your host machine.

### Bower Dependencies
To instal bower dependencies run the following command from the `frontend` directory:
```bash
bower install
```

### NPM Dependencies
To instal NPM dependencies run the following command from the `frontend` directory:
```bash
npm install
```

### Python Dependencies
It is highly recommended that you use [miniconda](http://conda.pydata.org/miniconda.html) in order to install python dependencies.  When miniconda is installed, run the following two commands to install dependencies from the root of the repository:
```bash
pip install -r requirements.txt
conda install --file conda_requirements.txt
```

If you do not have miniconda installed you may attempt to install the contents of `conda_requirements.txt` with pip, but be warned, `pandas` takes a while to install via pip and you need the required development libraries and files.

## Running in Development
In order to run the application in development, follow these steps:

- Set up your database.  From the root of the repository, run the following in the Python command prompt (be sure to set the necessary environment variables for the database connection in `develop.env`):
```python
from crimestats.app import db
db.create_all()
```

- Run the flask server:
```bash
python run.py
```

- Run the grunt server from the `frontend` directory:
```bash
grunt serve
```
