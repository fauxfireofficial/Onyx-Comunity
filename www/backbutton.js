document.addEventListener('DOMContentLoaded', () => {
    // Check if we are running in Capacitor and have the App plugin available
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        const { App } = window.Capacitor.Plugins;

        App.addListener('backButton', ({ canGoBack }) => {
            // Check if there is history in the webview

            // Or explicitly identify the 'home' page by URL
            const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
            const isLogin = window.location.pathname.endsWith('login.html');

            if (canGoBack && !isHome && !isLogin) {
                // If it can go back and we aren't on home step
                window.history.back();
            } else {
                // We're at the root of the app, exit
                App.exitApp();
            }
        });
    }
});
