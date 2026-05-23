import { Suspense } from "react";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Suspense fallback={<LoginFormSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="w-full max-w-sm space-y-6 animate-pulse">
      <div className="text-center space-y-2">
        <div className="h-5 w-32 bg-muted rounded mx-auto" />
        <div className="h-8 w-24 bg-muted rounded mx-auto" />
      </div>
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="space-y-4">
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  );
}
