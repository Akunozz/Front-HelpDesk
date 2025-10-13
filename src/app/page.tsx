import { AuthTabs } from "@/components/auth-tabs";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 p-4">
      <AuthTabs />
    </div>
  );
}
