# Tikki-App #

Tikki-App is the default frontend to the Tikki Platform based on Ionic + AngularJS.
The backend project can be found at <https://github.com/tikki-fi/tikki/>

## Developer's guide

To develop the application you need NodeJS 11 and NPM 6. Refer to the installation
instructions at <https://nodejs.org/en/>. Install Ionic by typing

```bash
npm install -g ionic
```

To install the dependencies run the following:

```bash
npm install
```

To start a development environment with live reload run the following command:

```bash
ionic serve -p 8000
```

When accessing the development environment via a browser at <http://localhost:8000>
the application communicates with the remote backend. Doing so doesn't require
running a local version of the Tikki backend. However, when accessing the frontend
at <http://127.0.0.1:8000> the application requires a local instance of the backend
running at <http://127.0.0.1:5000>.
