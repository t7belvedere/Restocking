import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { registerForPushNotifications } from "@/lib/notifications";

export function PushRegistration() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      registerForPushNotifications(user.id);
    }
  }, [user]);

  return null;
}
