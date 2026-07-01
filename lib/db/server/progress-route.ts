import type { ProgressDataInput, ProgressFilters, CrossFilterState } from "@/modules/progress-dashboard/types";
import { loadProgressInputFromServer, mergeProgressInput } from "./progress-input";

export function resolveProgressInput(body: {
  phone?: string;
  input?: ProgressDataInput;
}): ProgressDataInput | null {
  const clientInput = body.input;

  if (body.phone) {
    const serverInput = loadProgressInputFromServer(body.phone);
    if (serverInput) {
      return mergeProgressInput(serverInput, clientInput);
    }
  }

  if (clientInput?.dailyLogs) {
    return clientInput;
  }

  return null;
}

export function validateProgressRequest(
  input: ProgressDataInput | null,
  filters?: ProgressFilters
): string | null {
  if (!input?.dailyLogs) return "Missing wellness data";
  if (!filters?.dateRange) return "Missing date range filter";
  return null;
}

export type { CrossFilterState };