import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { QuotationEditor } from "@/components/QuotationEditor";
import { blankQuotation } from "@/lib/quotations";
import { getClient } from "@/lib/clients";
import { toast } from "sonner";

export const Route = createFileRoute("/quotation/new")({
  validateSearch: z.object({ clientId: z.string().optional() }),
  component: NewQuotation,
});

function NewQuotation() {
  const navigate = useNavigate();
  const { clientId } = Route.useSearch();
  const [ready, setReady] = useState(false);

  const initial = useMemo(() => {
    if (!clientId) return blankQuotation();
    const c = getClient(clientId);
    if (!c) return null;
    return blankQuotation({ id: c.id, name: c.name, email: c.email });
  }, [clientId]);

  useEffect(() => {
    if (clientId && !initial) {
      toast.error("Client not found");
      navigate({ to: "/" });
      return;
    }
    setReady(true);
  }, [clientId, initial, navigate]);

  if (!ready || !initial) return null;
  return <QuotationEditor initial={initial} />;
}
