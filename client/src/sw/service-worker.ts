import { ExpirationPlugin } from "workbox-expiration";
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  matchPrecache,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

const manifest = (self as unknown as { __WB_MANIFEST: [] }).__WB_MANIFEST;
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ??
  `${import.meta.env.VITE_API_URL ?? "http://localhost:5000"}/api`;
const apiUrl = new URL(apiBaseUrl, self.location.origin);
const apiPath = apiUrl.pathname.replace(/\/$/, "");

precacheAndRoute(manifest);
cleanupOutdatedCaches();

registerRoute(
  new NavigationRoute(createHandlerBoundToURL("/index.html")),
);

registerRoute(
  ({ request, url }) =>
    request.method === "GET" &&
    url.origin === apiUrl.origin &&
    (url.pathname === apiPath || url.pathname.startsWith(`${apiPath}/`)) &&
    !url.pathname.startsWith(`${apiPath}/auth`) &&
    !url.pathname.startsWith(`${apiPath}/test-auth`) &&
    !url.pathname.startsWith(`${apiPath}/users`),
  new NetworkFirst({
    cacheName: "squadup-api-v1",
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60,
      }),
    ],
  }),
);

setCatchHandler(async ({ event }) => {
  if (event.request.mode === "navigate") {
    return (await matchPrecache("/offline.html")) ?? Response.error();
  }

  return Response.error();
});
