// -------------------- SERVICE WORKER --------------------

// Install and activate immediately
self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Notify all open tabs
async function notifyClients(message) {
    const windowClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const client of windowClients) {
        try {
            client.postMessage(message);
        } catch (err) {
            console.warn("Failed to postMessage:", err);
        }
    }
}

// Handle push events
self.addEventListener("push", (event) => {
    let data = {};
    try { data = event.data.json(); } catch {}

    const mediaUrl = data.mediaUrl;

    event.waitUntil((async () => {
        // Notify open tabs
        if (mediaUrl) {
            await notifyClients({ type: "MEDIA_UPDATE", url: mediaUrl });
        }

        // Show notification
        const options = {
            body: data.body || "Someone sent you love!",
            icon: "/static/icon.png",  // Make sure this exists
            data: { mediaUrl }
        };

        await self.registration.showNotification(data.title || "Love Frame <3", options);
    })());
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil((async () => {
        const clientsList = await clients.matchAll({ type: "window", includeUncontrolled: true });

        // Focus existing tab if open
        if (clientsList.length > 0) {
            const client = clientsList[0];
            await client.focus();

            if (mediaUrl) {
                client.postMessage({ type: "MEDIA_UPDATE", url: mediaUrl });
            }
            return;
        }

        // Otherwise open a new tab
        if (clients.openWindow) {
            let openTo = mediaUrl || "/";
            if (openTo.startsWith("/")) {
                openTo = new URL(openTo, self.registration.scope).href;
            }
            await clients.openWindow(openTo);
        }
    })());
});
