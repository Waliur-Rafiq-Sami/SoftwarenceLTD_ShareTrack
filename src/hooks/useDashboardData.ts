// hooks/useDashboardData.ts
import { useQuery } from "@tanstack/react-query";

// আপনার আগের API রেসপন্সের টাইপগুলো এখানে বসবে
export const fetchDashboardData = async () => {
  const res = await fetch("/api/summary");
  if (!res.ok) throw new Error("Network response was not ok");
  return res.json();
};

export function useDashboardData() {
  return useQuery({
    queryKey: ["dashboardSummary"],
    queryFn: fetchDashboardData,
    refetchInterval: 60000, // প্রতি ১ মিনিটে অটো রিফেচ (অপশনাল)
    staleTime: 30000, // ৩০ সেকেন্ড পর্যন্ত ক্যাশ ফ্রেশ থাকবে
  });
}
