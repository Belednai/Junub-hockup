import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';

export class NotificationService {
  private static instance: NotificationService;
  private isInitialized = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Request permission for push notifications
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        // Register for push notifications
        await PushNotifications.register();
        
        // Listen for registration token
        PushNotifications.addListener('registration', async (token) => {
          console.log('Push registration success, token: ' + token.value);
          await this.savePushToken(token.value);
        });

        // Listen for registration errors
        PushNotifications.addListener('registrationError', (error) => {
          console.error('Error on registration: ' + JSON.stringify(error));
        });

        // Listen for push notifications received
        PushNotifications.addListener('pushNotificationReceived', (notification) => {
          console.log('Push notification received: ', notification);
          this.showLocalNotification(notification.title || 'New notification', notification.body || '');
        });

        // Listen for push notification actions
        PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          console.log('Push notification action performed', notification.actionId, notification.inputValue);
        });
      }

      // Request permission for local notifications
      await LocalNotifications.requestPermissions();

      this.isInitialized = true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
    }
  }

  private async savePushToken(token: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Save the push token to the user's profile or a separate table
        const { error } = await supabase
          .from('profiles')
          .update({ push_token: token })
          .eq('user_id', user.id);

        if (error) {
          console.error('Error saving push token:', error);
        }
      }
    } catch (error) {
      console.error('Error saving push token:', error);
    }
  }

  async showLocalNotification(title: string, body: string) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }, // Show after 1 second
            sound: 'beep.wav',
            attachments: undefined,
            actionTypeId: '',
            extra: null
          }
        ]
      });
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }

  async sendPostNotification(postAuthor: string, postContent: string) {
    try {
      // Get all users except the post author
      const { data: users, error } = await supabase
        .from('profiles')
        .select('user_id, push_token')
        .neq('user_id', postAuthor)
        .not('push_token', 'is', null);

      if (error) {
        console.error('Error fetching users for notification:', error);
        return;
      }

      // In a real app, you would send these to your backend to handle push notifications
      // For now, we'll just log them
      console.log('Would send push notifications to:', users?.length, 'users');
      console.log('Notification content:', {
        title: 'New Post',
        body: `${postAuthor} shared: ${postContent.substring(0, 50)}...`
      });

      // Show local notification for demo purposes
      await this.showLocalNotification(
        'New Post',
        `Someone shared: ${postContent.substring(0, 50)}...`
      );
    } catch (error) {
      console.error('Error sending post notification:', error);
    }
  }

  async sendMessageNotification(senderName: string, message: string, receiverId: string) {
    try {
      // Get the receiver's push token
      const { data: receiver, error } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('user_id', receiverId)
        .single();

      if (error || !receiver?.push_token) {
        console.error('Error fetching receiver push token:', error);
        return;
      }

      // In a real app, you would send this to your backend to handle push notifications
      console.log('Would send message notification to:', receiverId);
      console.log('Notification content:', {
        title: 'New Message',
        body: `${senderName}: ${message.substring(0, 50)}...`
      });

      // Show local notification for demo purposes
      await this.showLocalNotification(
        'New Message',
        `${senderName}: ${message.substring(0, 50)}...`
      );
    } catch (error) {
      console.error('Error sending message notification:', error);
    }
  }
}

export const notificationService = NotificationService.getInstance();
