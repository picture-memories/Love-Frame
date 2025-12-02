// Listen for push events
self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        console.warn("Push event data could not be parsed:", e);
    }

    event.waitUntil(
        self.registration.showNotification(data.title || "Love Frame <3", {
            body: data.body || "Someone sent you love!",
            icon: "/icon.png",           // Make sure this exists
            data: { mediaUrl: data.mediaUrl || null }
        })
    );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then(windowClients => {
            for (let client of windowClients) {
                // Focus existing tab and send media URL
                if ('focus' in client) {
                    client.postMessage({ mediaUrl });
                    return client.focus();
                }
            }
            // Open new tab with media query param if no tab is open
            if (clients.openWindow) {
                return clients.openWindow(`/?media=${encodeURIComponent(mediaUrl)}`);
            }
        })
    );
});

// Activate and claim clients immediately
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
