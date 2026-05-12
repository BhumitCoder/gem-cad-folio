import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QuotationEditor } from "@/components/QuotationEditor";
import { getById, type Quotation } from "@/lib/quotations";
import { toast } from "sonner";

export const Route = createFileRoute("/quotation/$id")({
  component: EditQuotation,
});

function EditQuotation() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const [q, setQ] = useState<Quotation | null>(null);

  useEffect(() => {
    const found = getById(id);
    if (!found) {
      toast.error("Quotation not found");
      navigate({ to: "/" });
      return;
    }
    setQ(found);
  }, [id, navigate]);

  if (!q) return null;
  return <QuotationEditor initial={q} />;
}
