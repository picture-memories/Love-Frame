// service-worker.js

self.addEventListener("install", (event) => {
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// Send messages to all open tabs
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

self.addEventListener("push", (event) => {
    let data = {};
    try { data = event.data.json(); } 
    catch { }

    const mediaUrl = data.mediaUrl;

    // Tell open tabs (so they auto-show the picture)
    if (mediaUrl) {
        event.waitUntil(
            notifyClients({ type: "MEDIA_UPDATE", url: mediaUrl })
        );
    }

    const options = {
        body: data.body || "Someone sent you love!",
        icon: "/icon.png",
        data: { mediaUrl: mediaUrl }
    };

    event.waitUntil(
        self.registration.showNotification(data.title || "Love Frame <3", options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil((async () => {
        const clientsList = await clients.matchAll({
            type: "window",
            includeUncontrolled: true
        });

        // If a tab is open → focus and message it
        if (clientsList.length > 0) {
            const client = clientsList[0];
            await client.focus();

            if (mediaUrl) {
                client.postMessage({ type: "MEDIA_UPDATE", url: mediaUrl });
            }
            return;
        }

        // No tab open → open directly to mediaUrl (absolute)
        if (clients.openWindow) {
            let openTo = mediaUrl || "/";

            // Convert relative "/view/..." to absolute
            if (openTo.startsWith("/")) {
                openTo = new URL(openTo, self.registration.scope).href;
            }

            await clients.openWindow(openTo);
        }
    })());
});
