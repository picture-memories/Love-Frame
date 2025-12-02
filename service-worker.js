// service-worker.js

self.addEventListener("push", (event) => {
    let data = {};
    try {
        data = event.data.json();
    } catch (e) {
        console.warn("Could not parse push JSON:", e);
    }

    const title = data.title || "Love Frame <3";
    const options = {
        body: data.body || "Someone sent you love!",
        icon: "/icon.png", // Make sure you actually have an icon.png in your folder!
        data: { mediaUrl: data.mediaUrl || null }
    };

    // FIX 1: Send message to open windows IMMEDIATELY upon receiving push
    // This makes the image appear instantly if they are looking at the app
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
        clients.forEach(client => {
            if (data.mediaUrl) {
                client.postMessage({ mediaUrl: data.mediaUrl });
            }
        });
    });

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
        .then(windowClients => {
            // Check if there is already a window open
            for (let client of windowClients) {
                // Focus the existing window
                if (client.url && "focus" in client) {
                    client.focus().then(() => {
                        // After focusing, tell it to show the media
                        if (mediaUrl) {
                            client.postMessage({ mediaUrl });
                        }
                    });
                    return; 
                }
            }

            // FIX 2: If no window is open, open a new one with the query param
            if (clients.openWindow) {
                if (mediaUrl) {
                    // Make sure the path is absolute
                    return clients.openWindow(`/?media=${encodeURIComponent(mediaUrl)}`);
                }
                return clients.openWindow("/");
            }
        })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
