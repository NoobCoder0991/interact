self.addEventListener('push', function (event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: data.icon,
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close(); // Close the notification when clicked

    // Handle the click event
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(function (clientList) {
            if (clientList.length > 0) {
                // Focus on an open tab if one exists
                return clientList[0].focus();
            }
            // Otherwise, open a new tab
            return clients.openWindow('/');
        })
    );
});




