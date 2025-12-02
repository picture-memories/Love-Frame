self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : {};

    event.waitUntil(
        self.registration.showNotification(data.title || "Love Frame <3", {
            body: data.body || "Someone sent you love!",
            icon: "/icon.png",
            data: { mediaUrl: data.mediaUrl || null }
        })
    );
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();

    const mediaUrl = event.notification.data.mediaUrl;

    if (mediaUrl) {
        event.waitUntil(clients.openWindow(mediaUrl));
    } else {
        event.waitUntil(clients.openWindow("/"));
    }
});
