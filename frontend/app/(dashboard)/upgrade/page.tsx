import { UpgradePageClient } from "@/components/dashboard/upgrade-page-client";
import { getSubscription } from "@/lib/data/watches";

export default async function UpgradePage() {
  const subscription = await getSubscription();
  return <UpgradePageClient plan={subscription.plan} />;
}
