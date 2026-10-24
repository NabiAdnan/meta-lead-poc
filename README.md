# Meta Lead Ads PoC — Real-Time Lead Notifications

A Proof of Concept (PoC) that integrates Meta Lead Ads with a React Native mobile application. When a new lead is generated through Meta's Lead Ads Testing Tool, the backend receives a webhook notification, retrieves the lead details using the Meta Graph API, and pushes the lead to the mobile application in real time using Socket.IO.

## Features

- **Meta Webhook Integration:** Receives lead-generation notifications from Meta.
- **Graph API Integration:** Retrieves lead details, including lead ID, creation time, form ID, and submitted field data.
- **Real-Time Communication:** Uses Socket.IO to deliver new leads to connected mobile clients without manual refresh.
- **React Native Mobile App:** Displays incoming leads in a dashboard.
- **Connection Status:** Shows whether the mobile application is connected to the backend.
- **Duplicate Prevention:** Avoids processing duplicate lead IDs during the current server runtime.
- **Development Testing:** Includes a test endpoint for validating the real-time delivery flow.

## Tech Stack

| Component | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Real-time communication | Socket.IO |
| HTTP requests | Axios |
| Mobile application | React Native, Expo |
| Language | TypeScript, JavaScript |
| Lead data source | Meta Lead Ads Graph API |
| Configuration | Environment variables via dotenv |

## Architecture

```text
Meta Lead Ads
      |
      | Lead-generation webhook
      v
Node.js + Express Backend
      |
      | Validate and process webhook
      v
Meta Graph API
      |
      | Retrieve complete lead details
      v
In-memory Lead Store (Map)
      |
      | Socket.IO: new_lead
      v
React Native + Expo Mobile App
      |
      v
Live Lead Dashboard
```

### How It Works

1. A test lead is submitted through Meta's Lead Ads Testing Tool.
2. Meta sends a webhook notification to the backend's `POST /webhook` endpoint.
3. The backend acknowledges the webhook and processes the notification.
4. The backend extracts the lead ID and requests the lead details from the Meta Graph API.
5. The retrieved lead is stored in an in-memory `Map`.
6. The backend emits a Socket.IO event named `new_lead`.
7. The mobile application receives the event and updates its React state.
8. The new lead appears in the dashboard without requiring a manual refresh.

## Project Structure

```text
.
├── backend/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── mobile/
│   ├── src/
│   │   └── app/
│   │       └── index.tsx
│   ├── package.json
│   └── app.json
│
├── .gitignore
└── README.md
```

*The structure above is illustrative. Adjust the file paths to match the actual repository.*

## Prerequisites

- Node.js and npm
- Expo-compatible development environment
- Expo Go or an Android/iOS simulator
- A Meta developer application configured for Lead Ads webhooks
- A Facebook Page and lead form suitable for testing
- Appropriate Meta Graph API permissions and an access token
- A publicly reachable HTTPS webhook URL for Meta to send events to

For local development, a tunneling service can expose the backend to Meta. Configure the tunnel URL in the Meta webhook settings.

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd <YOUR_REPOSITORY_FOLDER>
```

### 2. Configure the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
META_VERIFY_TOKEN=your_webhook_verification_token
META_ACCESS_TOKEN=your_meta_access_token
META_GRAPH_VERSION=vXX.X
```

Replace the example values with your actual configuration. Use the Graph API version supported by your Meta application.

**Security:** Never commit the `.env` file, access tokens, app secrets, or other credentials to GitHub.

Start the backend:

```bash
node server.js
```

The backend listens on port `5000` by default.

Check that the server is running:

```text
GET http://localhost:5000/health
```

Expected response:

```json
{
  "status": "ok"
}
```

### 3. Configure the Meta Webhook

In the Meta developer dashboard:

1. Configure the application for the relevant Lead Ads integration.
2. Set the webhook callback URL to your publicly accessible backend URL followed by `/webhook`.
3. Configure the verification token to match `META_VERIFY_TOKEN`.
4. Complete webhook verification.
5. Subscribe the appropriate Page to the required lead-generation webhook events.
6. Ensure the access token and permissions allow the backend to retrieve lead details.

Exact permissions and subscription requirements depend on the Meta app configuration and the Page being used.

### 4. Configure the Mobile Application

Open a new terminal:

```bash
cd mobile
npm install
```

Configure the Socket.IO server URL in the mobile application's source code to point to the backend.

For example:

```typescript
const socket = io("http://YOUR_BACKEND_HOST:5000", {
  transports: ["websocket"],
});
```

Replace `YOUR_BACKEND_HOST` with the backend machine's reachable IP address or configured host.

**Important:** When using a physical phone, `localhost` refers to the phone itself, not your computer. Use your computer's reachable LAN IP address when testing on the same network, or use an appropriate deployed endpoint.

Start the Expo development server:

```bash
npx expo start
```

Open the application using Expo Go or a compatible simulator.

## Testing the Integration

1. Start the backend and open the mobile application.
2. Confirm that the mobile application shows a connected status.
3. Open Meta's Lead Ads Testing Tool.
4. Submit a test lead for the configured Page and form.
5. Observe the backend logs as the webhook is processed and the Graph API request is made.
6. Verify that the new lead appears in the mobile application's list without manually refreshing the screen.

The backend also provides these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Basic backend status |
| GET | `/health` | Health check |
| GET | `/webhook` | Meta webhook verification |
| POST | `/webhook` | Receives webhook notifications |
| GET | `/leads` | Returns leads held in memory |

## Assumptions and Limitations

- This project proves that lead delivery occurs in real-time.
- The webhook generated will signal updates to the backend, which can gather the full lead information using the Graph API instead.
- Meta credentials, Webhook setup, Page access, and permissions are all obligatory.
- Both backend and mobile app should be communicating over the specified network.
- All leads are kept in the memory Map and lost when backend restarts.
- The duplicate suppression works only for server session.
- Mobile application gets leads while the Socket.IO connection is operating. The implementation does not fetch previously fetched leads with `GET /leads` when the app is launched.
- Test endpoint is for development purposes, and it does not apply to production.
- For production deployment, persistent storage, better authentication and authorization, validated webhooks, CORS configuration and better error handling will be required.

## Future Improvements

- Persist lead records in a database.
- Load existing leads when the mobile application starts.
- Add authentication and role-based access controls.
- Improve retry handling and webhook signature validation.
- Add lead search, filtering, and pagination.
- Deploy the backend using HTTPS and configure production monitoring.

## Demo Videos

- **Live application demonstration:** https://drive.google.com/file/d/14h58fGCNxeBYeoLHnxNHd2DVlP20g5DI/view?usp=drive_link
- **Code and architecture walkthrough:** https://drive.google.com/file/d/1j2ablYeseZKtPSafeQtQ3rw_32n18RYk/view?usp=sharing

