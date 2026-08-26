import { unstable_rethrow } from "next/navigation";

import { getDashboardData } from "@/lib/admin/queries";
import { createAdminSummaryResponse } from "@/lib/admin/summary-response";
import { getAdminAccessState } from "@/lib/auth/authorization";
import { currentMonthInBrazil } from "@/lib/date";

export async function GET() {
  return createAdminSummaryResponse({
    getAccessStatus: async () => (await getAdminAccessState()).status,
    getDashboardData,
    month: currentMonthInBrazil(),
    rethrow: unstable_rethrow,
  });
}
