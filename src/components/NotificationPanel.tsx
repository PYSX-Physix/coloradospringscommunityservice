import React from "react";
import {
  Button, Badge, Popover, PopoverTrigger, PopoverSurface,
  Text, Divider
} from "@fluentui/react-components";
import { Alert20Regular, CheckmarkCircle20Regular } from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { useSession } from "../lib/auth-client";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  read: number;
  created_at: number;
}

export default function NotificationPanel() {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const {data: session} = useSession();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if(!session) return;
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [session]);

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notificationId }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ markAll: true }),
      });
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
      setOpen(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={(_, data) => setOpen(data.open)}>
      <PopoverTrigger disableButtonEnhancement>
        <Button
          appearance="subtle"
          icon={<Alert20Regular />}
          style={{ position: 'relative', minWidth: '32px' }}
        >
          {unreadCount > 0 && (
            <Badge
              appearance="filled"
              color="important"
              size="small"
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                minWidth: '18px',
                height: '18px',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverSurface style={{ width: '400px', maxHeight: '500px', overflow: 'auto' }}>
        <div style={{ padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Text weight="bold" size={400}>Notifications</Text>
            {unreadCount > 0 && (
              <Button
                appearance="subtle"
                size="small"
                onClick={markAllAsRead}
                icon={<CheckmarkCircle20Regular />}
              >
                Mark all read
              </Button>
            )}
          </div>

          <Divider />

          {loading && notifications.length === 0 ? (
            <Text style={{ display: 'block', padding: '16px', textAlign: 'center' }}>
              Loading notifications...
            </Text>
          ) : notifications.length === 0 ? (
            <Text style={{ display: 'block', padding: '16px', textAlign: 'center' }}>
              No notifications yet
            </Text>
          ) : (
            <div style={{ marginTop: '8px' }}>
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '12px',
                    marginBottom: '8px',
                    borderRadius: '4px',
                    cursor: notification.link ? 'pointer' : 'default',
                    backgroundColor: notification.read ? 'transparent' : 'transparent',
                    border: '1px solid #ddd',
                    transition: 'background-color 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (notification.link) {
                      e.currentTarget.style.backgroundColor = '#292929ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = notification.read ? 'transparent' : '#1f1f1fff';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div style={{ flex: 1 }}>
                      <Text weight="semibold" style={{ display: 'block', marginBottom: '4px' }}>
                        {notification.title}
                      </Text>
                      <Text size={200} style={{ display: 'block', marginBottom: '4px' }}>
                        {notification.message}
                      </Text>
                      <Text size={100}>
                        {formatTime(notification.created_at)}
                      </Text>
                    </div>
                    {!notification.read && (
                      <Badge
                        appearance="filled"
                        color="important"
                        size="tiny"
                        style={{ marginLeft: '8px' }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverSurface>
    </Popover>
  );
}