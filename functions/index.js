const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { onSchedule } = require('firebase-functions/v2/scheduler');

admin.initializeApp();

exports.checkReminders = onSchedule('every 1 minutes', async (event) => {
  // Get current JST time
  const now = new Date();
  const jstNow = new Date(now.getTime() + (9 * 60 * 60 * 1000));
  const currentH = jstNow.getUTCHours().toString().padStart(2, '0');
  const currentM = jstNow.getUTCMinutes().toString().padStart(2, '0');
  const currentTime = `${currentH}:${currentM}`;
  const currentDay = jstNow.getUTCDay();

  const todayY = jstNow.getUTCFullYear();
  const todayM = (jstNow.getUTCMonth() + 1).toString().padStart(2, '0');
  const todayD = jstNow.getUTCDate().toString().padStart(2, '0');
  const todayStr = `${todayY}-${todayM}-${todayD}`;

  console.log(`Checking reminders for ${currentTime}, day: ${currentDay}`);

  const habitsRef = admin.firestore().collection('habits');
  
  const habitsToNotify = [];
  
  // 1. Habits matching the exact time
  const snapshotBase = await habitsRef.where('reminderTime', '==', currentTime).get();
  snapshotBase.docs.forEach(doc => habitsToNotify.push({ docId: doc.id, ...doc.data() }));

  // 2. If it's 20:00, also fetch habits with no reminder time (null or empty)
  if (currentTime === '20:00') {
    const snapshotNull = await habitsRef.where('reminderTime', '==', null).get();
    snapshotNull.docs.forEach(doc => {
      if (!habitsToNotify.find(h => h.docId === doc.id)) {
        habitsToNotify.push({ docId: doc.id, ...doc.data() });
      }
    });

    const snapshotEmpty = await habitsRef.where('reminderTime', '==', '').get();
    snapshotEmpty.docs.forEach(doc => {
      if (!habitsToNotify.find(h => h.docId === doc.id)) {
        habitsToNotify.push({ docId: doc.id, ...doc.data() });
      }
    });
  }

  if (habitsToNotify.length === 0) {
    return null;
  }

  const promises = [];

  for (const habit of habitsToNotify) {
    // Check if habit is deleted
    if (habit.deletedAt) {
      continue;
    }

    // Check if habit is set for today
    if (habit.daysOfWeek && !habit.daysOfWeek.includes(currentDay)) {
      continue;
    }

    // Check if habit is already completed today
    if (habit.completedDates && habit.completedDates.includes(todayStr)) {
      console.log(`Habit ${habit.title} already completed today, skipping reminder.`);
      continue;
    }

    // Get user's tokens
    const tokensSnapshot = await admin.firestore()
      .collection('users')
      .doc(habit.userId)
      .collection('fcmTokens')
      .get();
    
    if (tokensSnapshot.empty) {
      continue;
    }

    const tokenDocs = tokensSnapshot.docs;
    // Map existing tokens (some might be id, some might be in data.token)
    const tokens = tokenDocs.map(d => {
      const data = d.data();
      return data.token || d.id; // Support both old and new formats
    });

    if (tokens.length > 0) {
      const message = {
        notification: {
          title: '習慣の時間です！',
          body: `「${habit.title}」を記録しましょう。`,
        },
        data: {
          habitId: habit.docId,
          title: '習慣の時間です！',
          body: `「${habit.title}」を記録しましょう。`,
          url: 'https://habittracker-85b62.web.app/'
        },
        android: {
          priority: 'high',
        },
        webpush: {
          headers: {
            Urgency: 'high',
          },
          notification: {
            icon: '/icon.png',
            tag: 'habit-reminder',
            renotify: true
          }
        },
        tokens: tokens,
      };

      promises.push(
        admin.messaging().sendEachForMulticast(message)
          .then(async (response) => {
            console.log(`${response.successCount} messages were sent successfully`);
            
            // Cleanup invalid tokens
            if (response.failureCount > 0) {
              const cleanupPromises = [];
              response.responses.forEach((resp, idx) => {
                if (!resp.success) {
                  const error = resp.error;
                  if (error.code === 'messaging/registration-token-not-registered' || 
                      error.code === 'messaging/invalid-registration-token') {
                    console.log(`Cleaning up invalid token for document: ${tokenDocs[idx].id}`);
                    cleanupPromises.push(tokenDocs[idx].ref.delete());
                  }
                }
              });
              await Promise.all(cleanupPromises);
            }
          })
          .catch((error) => {
            console.error('Error sending message:', error);
          })
      );
    }
  }

  return Promise.all(promises);
});
