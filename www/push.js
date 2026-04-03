document.addEventListener("DOMContentLoaded", async () => {
  // Only proceed if Capacitor is available (e.g. running on a mobile device)
  if (!window.Capacitor || !window.Capacitor.Plugins) {
    console.log("Capacitor is not available. Push notifications and AdMob won't work in standard browsers.");
    return;
  }

  const { LocalNotifications, AdMob } = window.Capacitor.Plugins;

  // 🔔 ONE SIGNAL PUSH PERMISSION & INITIALIZATION
  // Capacitor handles deviceready internally but cordova plugins often rely on window.plugins
  if (window.plugins && window.plugins.OneSignal) {
    // OneSignal App ID
    window.plugins.OneSignal.initialize("45cff460-992a-43dc-b975-f2d41e9d5ebc");

    // Request permission from the user
    window.plugins.OneSignal.Notifications.requestPermission(true).then((accepted) => {
      console.log("OneSignal push permission accepted: " + accepted);
    });

    // Listen for notification clicks
    window.plugins.OneSignal.Notifications.addEventListener('click', (event) => {
      console.log("OneSignal Notification clicked:", event);
      // Optional: Redirection logic like you had for FCM
    });
  } else {
    // Add event listener as fallback if plugins are not attached yet
    document.addEventListener("deviceready", () => {
      if (window.plugins && window.plugins.OneSignal) {
        window.plugins.OneSignal.initialize("45cff460-992a-43dc-b975-f2d41e9d5ebc");
        window.plugins.OneSignal.Notifications.requestPermission(true).then((accepted) => {
          console.log("OneSignal push permission accepted: " + accepted);
        });
      }
    }, false);
  }


  // 📅 LOCAL NOTIFICATION
  if (LocalNotifications) {
    try {
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display === 'granted') {

        // Define an array of appealing unique messages
        const messages = [
          "Ready to drop into some action? 🎮",
          "Your feed is waiting! Check out the latest viral gaming moments. ✨",
          "Got a cool clip? Share it with the Onyx community today! 🚀",
          "Don't miss out on what gamers are sharing right now. 👀",
          "Level up your day! See what's trending on Onyx. 🎯"
        ];

        // Pick a random message
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Cancel previous pending notification to avoid spam
        await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

        // Schedule new notification for exactly 24 hours from now
        await LocalNotifications.schedule({
          notifications: [{
            title: "Onyx 🔥",
            body: randomMessage,
            id: 1,
            schedule: {
              at: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
              allowWhileIdle: true
            }
          }]
        });
      }
    } catch (e) {
      console.log("Local Noti Error:", e);
    }
  }

  // 💰 ADMOB INIT
  // Setup a fallback so it doesn't crash on web browsers
  window.showInterstitialAd = async () => {
    console.log("Stub: showInterstitialAd called (Not on Mobile)");
  };

  if (AdMob) {
    try {
      await AdMob.initialize();
      console.log("AdMob Initialized successfully.");

      // Override the stub with actual implementation if on Mobile
      window.showInterstitialAd = async () => {
        try {
          // Actual Ad Unit ID
          const adId = 'ca-app-pub-2895577345632637/9703733579';
          await AdMob.prepareInterstitial({ adId });
          await AdMob.showInterstitial();
        } catch (err) {
          console.error("Ad show error:", err);
        }
      };
    } catch (e) {
      console.error("AdMob Error:", e);
    }
  }
});
