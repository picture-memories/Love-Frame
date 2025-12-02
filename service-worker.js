// Listen for push events
self.addEventListener("push", (event) => {
    let data = {};
    try {
        // Safely parse JSON data from the push event
        data = event.data.json();
    } catch (e) {
        console.warn("Push event has no data or invalid JSON", e);
    }

    event.waitUntil(
        self.registration.showNotification(data.title || "Love Frame <3", {
            body: data.body || "Someone sent you love!",
            icon: "/icon.png",
            data: { mediaUrl: data.mediaUrl || null }
        })
    );
});

// Handle clicks on notifications
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const mediaUrl = event.notification.data?.mediaUrl;

    // Open the media URL if it exists, otherwise open home page
    event.waitUntil(clients.openWindow(mediaUrl || "/"));
});
