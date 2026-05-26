import { Plus } from "lucide-react";

import { Button } from "~/components/ui/button";

type FormPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-svh bg-background p-6">
      <div className="flex items-center justify-between gap-4">
        <p className="break-all text-sm text-muted-foreground">formId: {id}</p>
        <Button type="button">
          <Plus className="size-4" />
          Add field
        </Button>
      </div>
    </main>
  );
}
