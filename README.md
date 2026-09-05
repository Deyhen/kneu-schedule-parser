````md
# KNEU Schedule Sync

A lightweight Node.js application that:

- authenticates with KNEU,
- fetches the current university schedule,
- parses lessons from HTML,
- synchronizes them with Google Calendar.

## Requirements

- Node.js
- npm
- Google Cloud project
- Google Calendar API enabled

## Installation

Install dependencies:

```bash
npm install
````

## Environment Variables

### `USER_LOGIN`

KNEU account email.

### `USER_PASSWORD`

KNEU account password.

### `GOOGLE_CLIENT_ID`

OAuth Client ID from Google Cloud.

### `GOOGLE_CLIENT_SECRET_KEY`

OAuth Client Secret from Google Cloud.

### `GOOGLE_CALENDAR_ID`

ID of the Google Calendar used for schedule synchronization.

The Calendar ID can be found in:

**Google Calendar → Settings → Calendar → Integrate calendar → Calendar ID**

## Google Cloud Setup

1. Create a Google Cloud project.
2. Enable the **Google Calendar API**.
3. Configure the OAuth consent screen.
4. Create an OAuth Client of type **Desktop app**.
5. Add the generated Client ID and Client Secret to `.env`.

The application uses the following OAuth scope:

```text
https://www.googleapis.com/auth/calendar.events
```

## Development

Run the application in development mode:

```bash
npm run dev
```

On the first run, a browser window will open for Google authorization.
After successful authorization, the application creates:

```text
tokens.json
```

This file is reused on subsequent runs to avoid repeated authorization.

## Build

Compile the project:

```bash
npm run build
```

Run the compiled application:

```bash
npm start
```

## Windows Task Scheduler

The application can be executed periodically using Windows Task Scheduler.

Example configuration:

```text
Program:
"C:\Program Files\nodejs\node.exe"

Arguments:
dist/main.js

Start in:
D:\projects\kneu-schedule-parser
```

A synchronization interval of a few hours is usually sufficient.

```

```
```
