import type { AdminAccessStatus } from "@/lib/auth/policy";

type DashboardSummary = {
  overdueTasks: number;
  pendingTasks: number;
  summary: {
    balance: string;
    expense: string;
    income: string;
  };
};

type SummaryResponseDependencies = {
  getAccessStatus: () => Promise<AdminAccessStatus>;
  getDashboardData: (month: string) => Promise<DashboardSummary>;
  month: string;
  rethrow: (error: unknown) => void;
};

export async function createAdminSummaryResponse({
  getAccessStatus,
  getDashboardData,
  month,
  rethrow,
}: SummaryResponseDependencies): Promise<Response> {
  const status = await getAccessStatus();
  if (status === "unauthenticated") {
    return Response.json({ error: "Não autenticado." }, { status: 401 });
  }
  if (status === "forbidden") {
    return Response.json({ error: "Acesso negado." }, { status: 403 });
  }

  try {
    const data = await getDashboardData(month);
    return Response.json({
      balance: data.summary.balance,
      income: data.summary.income,
      expense: data.summary.expense,
      pendingTasks: data.pendingTasks,
      overdueTasks: data.overdueTasks,
    });
  } catch (error) {
    rethrow(error);
    return Response.json({ error: "Erro interno inesperado." }, { status: 500 });
  }
}
