import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { QuotationEditor } from "@/components/QuotationEditor";
import { blankQuotation } from "@/lib/quotations";

export const Route = createFileRoute("/quotation/new")({
  component: NewQuotation,
});

function NewQuotation() {
  const initial = useMemo(() => blankQuotation(), []);
  return <QuotationEditor initial={initial} />;
}