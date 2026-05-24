import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { getSubscription, getCurrentUser } from "@/lib/data/watches";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await getSubscription();

  return (
    <SettingsForm
      email={user.email ?? ""}
      phone={(user.user_metadata.phone as string) ?? ""}
      phoneVerified={(user.user_metadata.phone_verified as boolean) ?? false}
      plan={subscription.plan}
    />
  );
}
