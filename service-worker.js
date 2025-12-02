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
            icon: "/icon.png",           // Make sure this icon exists in /static
            data: { mediaUrl: data.mediaUrl || null }
        })
    );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const mediaUrl = event.notification.data?.mediaUrl;

    // Open the media if it exists, else open home page
    media_url = f"/view/{filename}"
    );
});

// Optional: activate and claim clients immediately
self.addEventListener("activate", (event) => {
    event.waitUntil(self.clients.claim());
});
