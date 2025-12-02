// Listen for push events
self.addEventListener("push", (event) => {
    let data = {};
    try {
        // Safely parse the incoming JSON payload
        data = event.data.json();
    } catch (e) {
        console.warn("Push event data could not be parsed:", e);
    }

    // Show a notification
    event.waitUntil(
        self.registration.showNotification(data.title || "Love Frame <3", {
            body: data.body || "Someone sent you love!",
            icon: "/icon.png",           // Make sure this exists in /static
            data: { mediaUrl: data.mediaUrl || "/" }
        })
    );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl || "/";

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                // If a tab is already open with this media, focus it
                if (client.url.includes(mediaUrl) && 'focus' in client) {
                    return client.focus();
                }
            }
            // Otherwise, open a new tab
            if (clients.openWindow) {
                return clients.openWindow(mediaUrl);
            }
        })
    );
});

// Optional: claim clients immediately
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
