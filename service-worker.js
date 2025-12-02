self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    const mediaUrl = event.notification.data?.mediaUrl;

    event.waitUntil(
        clients.openWindow(mediaUrl || "/")
    );
});
