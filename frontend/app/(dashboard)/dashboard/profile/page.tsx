import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { getSubscription, getCurrentUser } from "@/lib/data/watches";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const subscription = await getSubscription();

  return (
    <ProfileForm
      initial={{
        first_name: (user.user_metadata.first_name as string) ?? "",
        phone: (user.user_metadata.phone as string) ?? "",
        preferred_size: (user.user_metadata.preferred_size as string) ?? null,
        preferred_brands: (user.user_metadata.preferred_brands as string[]) ?? [],
      }}
      email={user.email ?? ""}
      plan={subscription.plan}
    />
  );
}
