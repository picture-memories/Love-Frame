// service-worker.js

const SW_VERSION = "3.0"; // Change this string whenever you update code to force a refresh!

// 1. FORCE THE NEW VERSION TO TAKE OVER IMMEDIATELY
self.addEventListener("install", (event) => {
    // This tells the browser: "Don't wait! Activate this new version ASAP."
    self.skipWaiting(); 
});

self.addEventListener("activate", (event) => {
    // This tells the browser: "Take control of all open tabs right now."
    event.waitUntil(self.clients.claim());
});

// 2. SETUP THE RADIO CHANNEL (For in-app updates)
const channel = new BroadcastChannel('love-channel');

self.addEventListener("push", (event) => {
    let data = {};
    try { data = event.data.json(); } catch (e) {}

    const title = data.title || "Love Frame <3";
    const mediaUrl = data.mediaUrl;

    // Broadcast to open window (if user is looking at the app)
    if (mediaUrl) {
        channel.postMessage({ type: 'MEDIA_UPDATE', url: mediaUrl });
    }

    const options = {
        body: data.body || "Someone sent you love!",
        icon: "/static/icon.png", // Verify this path exists!
        data: { mediaUrl: mediaUrl }
    };

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
            // A. If app is already open, focus it and update the picture
            for (let client of windowClients) {
                if (client.url && "focus" in client) {
                    return client.focus().then(() => {
                        if (mediaUrl) {
                            channel.postMessage({ type: 'MEDIA_UPDATE', url: mediaUrl });
                        }
                    });
                }
            }

            // B. If app is closed, open a new window
            if (clients.openWindow) {
                if (mediaUrl) {
                    // Use encoded URI to avoid "Blank Page" issues
                    const newUrl = `/?media=${encodeURIComponent(mediaUrl)}`;
                    return clients.openWindow(newUrl);
                }
                return clients.openWindow("/");
            }
        })
    );
});
