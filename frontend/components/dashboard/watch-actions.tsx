"use client";

import { useTransition } from "react";
import { Loader2, Pause, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLocale } from "@/components/site/locale-provider";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteWatch, toggleWatch } from "@/app/actions/watches";

interface WatchActionsProps {
  id: string;
  isActive: boolean;
}

export function WatchActions({ id, isActive }: WatchActionsProps) {
  const { t } = useLocale();
  const td = t.watchDetail;
  const [pending, startTransition] = useTransition();
  const [deleting, startDelete] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const next = !isActive;
      const res = await toggleWatch(id, next);
      if (res.ok) {
        toast.success(next ? td.reactivated : td.pausedToast);
      } else {
        toast.error(td.actionFailed);
      }
    });
  }

  function handleDelete() {
    startDelete(async () => {
      try {
        await deleteWatch(id);
      } catch {
        // redirect throws by design — silence
      }
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={pending}
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isActive ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {isActive ? td.pause : td.reactivate}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            {td.delete}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{td.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {td.deleteDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button type="button" variant="outline">
                {td.cancel}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                type="button"
                variant="destructive"
                disabled={deleting}
                onClick={handleDelete}
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {td.deleteForever}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
