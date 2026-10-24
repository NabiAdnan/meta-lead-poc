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

1. The project showcases the validity of the idea behind real-time delivery of leads.
2. Meta's webhook gives notifications and the backend gets the data regarding the precise leads via Graph API.
3. It is necessary to have valid Meta credentials and configured webhook to access the Page.
4. Moreover, it is important to establish intercommunication between the backend and the mobile app via the established network.
5. Leads are viewed via in-memory Map, thus being lost when the backend is restarted.
6. It is to important to note that the current app only helps to avoid duplicates during the server run.
7. Leads sent while the Socket.IO connection is active will be available to the mobile app, however, leads obtained via GET /leads will not automatically appear on the app as it launches.
8. The test endpoint was created for the purpose of development and cannot be used for real operations.
9. The real version will require permanent storage, more complicated authorization, reliable verification of webhook, CORS setup, and high-quality error management.

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

- The project is a proof of concept demonstrating real-time lead delivery.
- Meta's webhook provides a notification; the backend retrieves the complete lead details separately through the Graph API.
- Valid Meta credentials, webhook configuration, Page access, and appropriate permissions are required.
- The backend and mobile application must be able to communicate over the configured network.
- Leads are stored in an in-memory `Map`; they are lost when the backend restarts.
- Duplicate prevention is limited to the current server runtime.
- The mobile application receives leads emitted while its Socket.IO connection is active. The current implementation does not automatically load previously stored leads from `GET /leads` when the app starts.
- The test endpoint is for development and is not intended for public production use.
- Production deployment would require persistent storage, stronger authentication and authorization, secure webhook validation, appropriate CORS configuration, and more robust error handling.

## Future Improvements

- Persist lead records in a database.
- Load existing leads when the mobile application starts.
- Add authentication and role-based access controls.
- Improve retry handling and webhook signature validation.
- Add lead search, filtering, and pagination.
- Deploy the backend using HTTPS and configure production monitoring.

## Demo Videos

- **Live application demonstration:** https://drive.google.com/file/d/14h58fGCNxeBYeoLHnxNHd2DVlP20g5DI/view?usp=sharing
- **Code and architecture walkthrough:** https://drive.google.com/file/d/1j2ablYeseZKtPSafeQtQ3rw_32n18RYk/view?usp=sharing


