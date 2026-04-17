// Helper function to create a notification
export async function createNotification(
  db: D1Database,
  userId: string,
  type: string,
  title: string,
  message: string,
  link?: string
) {
  const notificationId = crypto.randomUUID();
  
  await db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, message, link, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  ).bind(notificationId, userId, type, title, message, link || null, Date.now()).run();
  
  return notificationId;
}