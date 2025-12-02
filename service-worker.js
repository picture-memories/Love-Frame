// Handle Push Notification
self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data.json();  // NOW WORKS
    } catch (e) {
        console.warn("Could not parse push JSON:", e);
    }

    event.waitUntil(
        self.registration.showNotification(
            data.title || "Love Frame <3",
            {
                body: data.body || "Someone sent you love!",
                icon: "/icon.png",
                data: { mediaUrl: data.mediaUrl || null }
            }
        )
    );
});

// Notification Click
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
        .then(windowClients => {
            for (let client of windowClients) {
                // Focus existing tab
                if ("focus" in client) {
                    client.focus();
                    // Tell tab to show media
                    client.postMessage({ mediaUrl });
                    return;
                }
            }

            // No open tab → open new one
            if (clients.openWindow) {
                if (mediaUrl) {
                    return clients.openWindow(`/?media=${encodeURIComponent(mediaUrl)}`);
                }
                return clients.openWindow("/");
            }
        })
    );
});

// Ensure SW controls all pages immediately
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
