import POSLayout from "@/components/POSLayout";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <POSLayout>{children}</POSLayout>;
}
