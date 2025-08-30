// Service worker registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful');
      })
      .catch(err => {
        console.error('ServiceWorker registration failed:', err);
      });
  });
}

// Push notification subscription
async function subscribeToPushNotifications() {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check permission
    let permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.VITE_VAPID_PUBLIC_KEY
    });

    // Send subscription to backend
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}
