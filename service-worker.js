// service-worker.js

// 1. FORCE THE NEW VERSION TO TAKE OVER IMMEDIATELY
self.addEventListener("install", (event) => {
    self.skipWaiting(); 
});

self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});

// 2. SETUP THE RADIO CHANNEL (For in-app updates)
const channel = new BroadcastChannel('love-channel');

self.addEventListener("push", (event) => {
    let data = {};
    try { data = event.data.json(); } catch (e) {
        console.warn("Could not parse push JSON:", e);
    }

    const title = data.title || "Love Frame <3";
    const mediaUrl = data.mediaUrl;

    // Broadcast to open window (solves the "doesn't open while being in the app" issue)
    if (mediaUrl) {
        channel.postMessage({ type: 'MEDIA_UPDATE', url: mediaUrl });
    }

    const options = {
        body: data.body || "Someone sent you love!",
        icon: "/icon.png", 
        data: { mediaUrl: mediaUrl }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 3. HANDLE NOTIFICATION CLICKS (Fix for "Blank Page")
self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true })
        .then(windowClients => {
            // Find existing window to focus
            for (let client of windowClients) {
                if (client.url && "focus" in client) {
                    return client.focus().then(() => {
                        if (mediaUrl) {
                            // Send message to the now-focused tab to show the media
                            channel.postMessage({ type: 'MEDIA_UPDATE', url: mediaUrl });
                        }
                    });
                }
            }

            // If no window is open, open a new one directly to the Flask view route
            if (clients.openWindow) {
                if (mediaUrl) {
                    // 1. Get just the filename (e.g., "my_photo.jpg")
                    const filename = mediaUrl.replace(/^\/uploads\//, ''); 
                    
                    // 2. Build the ABSOLUTE URL for the dedicated /view/ route
                    const domain = "https://love-frame.onrender.com"; // <-- VERIFY THIS IS YOUR EXACT DOMAIN
                    const newUrl = `${domain}/view/${filename}`;
                    
                    return clients.openWindow(newUrl);
                }
                return clients.openWindow("/"); 
            }
        })
    );
});
