"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AddWatchForm } from "@/components/dashboard/add-watch-form";
import { useLocale } from "@/components/site/locale-provider";

export function AddWatchCard() {
  const { t } = useLocale();
  const aw = t.addWatch;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {t.watchDetail.backToAlerts}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="font-display text-2xl">
            {aw.pageTitle}
          </CardTitle>
          <CardDescription>{aw.pageSub}</CardDescription>
        </CardHeader>
        <CardContent>
          <AddWatchForm />
        </CardContent>
      </Card>
    </div>
  );
}
