# Integrations

Reusable integration components for Canton MVP.

## api-client

Minimal API client for Node.js and browser. Use when building integrations, scripts, or external apps that call the Canton MVP API.

```ts
import { createApiClient } from "@canton-mvp/integration-api-client";

const api = createApiClient({ baseUrl: "http://localhost:8080/api/v1" });

// Login
const { userId } = await api.post<{ userId: string }>("/auth/login", {
  externalId: "my-user",
  email: "user@example.com",
});

// Use token
const authed = api.withToken(userId);
const holdings = await authed.get(`/tokens/holdings/${partyId}`);
```

See [examples](../examples/) for full flows that use the API directly (examples are dependency-free to maximize clarity).
