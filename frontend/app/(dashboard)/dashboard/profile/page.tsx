import { redirect } from "next/navigation";
import { PreferencesForm } from "@/components/dashboard/preferences-form";
import { getCurrentUser } from "@/lib/data/watches";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <PreferencesForm
      initial={{
        first_name: (user.user_metadata.first_name as string) ?? "",
        phone: (user.user_metadata.phone as string) ?? "",
        phone_verified: (user.user_metadata.phone_verified as boolean) ?? false,
        preferred_size: (user.user_metadata.preferred_size as string) ?? null,
        preferred_brands: (user.user_metadata.preferred_brands as string[]) ?? [],
      }}
    />
  );
}
