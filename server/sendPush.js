const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = JSON.parse(fs.readFileSync('./serviceAccountKey.json', 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function sendNotifications(title = "New Post!", body = "Someone just uploaded a new image.") {
  try {
    const tokensSnapshot = await db.collection('fcmTokens').get();
    const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

    if (!tokens.length) {
      console.log("No FCM tokens found.");
      return;
    }

    const response = await admin.messaging().sendMulticast({
      tokens: tokens,
      notification: { title, body }
    });

    console.log(`Push sent: Success=${response.successCount}, Failed=${response.failureCount}`);
    if (response.failureCount > 0) {
      response.responses.forEach((r, i) => {
        if (!r.success) console.log(`Token failed: ${tokens[i]} | Error: ${r.error}`);
      });
    }
  } catch (err) {
    console.error("Error sending push:", err);
  }
}

// Watch for new posts
db.collection('ugc_posts').onSnapshot(snapshot => {
  snapshot.docChanges().forEach(change => {
    // Only send notification for totally new posts, ignore modifications
    if (change.type === 'added') {
      const data = change.doc.data();
      const now = admin.firestore.Timestamp.now();
      const createdAt = data.createdAt || now;
      const durationInSeconds = now.seconds - createdAt.seconds;

      // Only send if the post was created less than 2 minutes ago
      // This prevents bursting notifications for old posts on cold starts
      if (durationInSeconds < 120) {
        const userName = data.user ? (data.user.name || 'A Gamer') : 'Someone';
        const title = "New Drop on Onyx! 🔥";
        let body = `${userName} just posted something new. Check it out!`;
        if (data.caption) {
          body = `${userName}: "${data.caption}"`;
        }

        console.log(`New post from ${userName} detected, sending notifications...`);
        sendNotifications(title, body);
      }
    }
  });
});

console.log("Backend started. Listening for new posts on 'ugc_posts'...");

// Export function for other files if needed
module.exports = { sendNotifications };