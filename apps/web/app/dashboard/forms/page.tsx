"use client";

import { AlertCircle, CalendarDays, FileText, Loader2, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Textarea } from "~/components/ui/textarea";
import { trpc } from "~/trpc/client";

const initialValues = {
  title: "",
  description: "",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

function formatDate(value: Date | string | null) {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return dateFormatter.format(date);
}

export default function FormsPage() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // yaha pe humne backend call ki hai
  const utils = trpc.useUtils();
  const formsQuery = trpc.form.listForms.useQuery();
  const forms = formsQuery.data ?? [];

  const createForm = trpc.form.createForm.useMutation({
    onSuccess: async () => {
      setValues(initialValues);
      setErrors({});
      setOpen(false);
      toast.success("Form created");
      await utils.form.listForms.invalidate();
    },
    onError: (error) => {
      setErrors((currentErrors) => ({ ...currentErrors, root: error.message }));
      toast.error(error.message);
    },
  });

  function set(field: keyof typeof values) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      setErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[field];
        delete nextErrors.root;
        return nextErrors;
      });
    };
  }

  function validate(v: typeof values) {
    const nextErrors: Record<string, string> = {};
    const title = v.title.trim();
    const description = v.description.trim();

    if (!title) nextErrors.title = "Title is required";
    if (title.length > 50) nextErrors.title = "Title must be 50 characters or less";
    if (description.length > 150) {
      nextErrors.description = "Description must be 150 characters or less";
    }

    return nextErrors;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const description = values.description.trim();

    createForm.mutate({
      title: values.title.trim(),
      description: description ? description : undefined,
    });
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen && !createForm.isPending) {
      setValues(initialValues);
      setErrors({});
    }
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-semibold">Forms</h1>
                <p className="text-sm text-muted-foreground">Create and manage your forms.</p>
              </div>
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                Create form
              </Button>
            </div>

            {formsQuery.isPending ? (
              <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center">
                <Loader2 className="size-10 animate-spin text-muted-foreground" />
                <div className="space-y-1">
                  <h2 className="text-base font-medium">Loading forms</h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Fetching your created forms.
                  </p>
                </div>
              </div>
            ) : formsQuery.isError ? (
              <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center">
                <AlertCircle className="size-10 text-destructive" />
                <div className="space-y-1">
                  <h2 className="text-base font-medium">Unable to load forms</h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {formsQuery.error.message}
                  </p>
                </div>
                <Button type="button" variant="outline" onClick={() => void formsQuery.refetch()}>
                  <RefreshCw className="size-4" />
                  Retry
                </Button>
              </div>
            ) : forms.length === 0 ? (
              <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center">
                <FileText className="size-10 text-muted-foreground" />
                <div className="space-y-1">
                  <h2 className="text-base font-medium">No forms yet</h2>
                  <p className="max-w-md text-sm text-muted-foreground">
                    Create your first form to see it here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {forms.map((form) => (
                  <Link key={form.id} href={`/dashboard/forms/${form.id}`} className="block">
                    <Card className="h-full gap-4 rounded-md transition-colors hover:border-primary/40 hover:bg-muted/30">
                      <CardHeader className="gap-3">
                        <div className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <FileText className="size-5" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="line-clamp-2 text-base leading-6">
                            {form.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {form.description || "No description"}
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDays className="size-4" />
                        <span>Created {formatDate(form.createdAt)}</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create form</DialogTitle>
              <DialogDescription>Add the form title and optional description.</DialogDescription>
            </DialogHeader>

            <form className="space-y-5" onSubmit={submit}>
              <FieldGroup className="gap-4">
                <Field data-invalid={!!errors.title}>
                  <FieldLabel htmlFor="form-title">Title</FieldLabel>
                  <Input
                    id="form-title"
                    value={values.title}
                    onChange={set("title")}
                    placeholder="Customer feedback"
                    maxLength={50}
                    disabled={createForm.isPending}
                    aria-invalid={!!errors.title}
                  />
                  <FieldDescription>{values.title.trim().length}/50 characters</FieldDescription>
                  {errors.title && <FieldError>{errors.title}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="form-description">Description</FieldLabel>
                  <Textarea
                    id="form-description"
                    value={values.description}
                    onChange={set("description")}
                    placeholder="Collect feedback after onboarding."
                    maxLength={150}
                    disabled={createForm.isPending}
                    aria-invalid={!!errors.description}
                  />
                  <FieldDescription>
                    {values.description.trim().length}/150 characters
                  </FieldDescription>
                  {errors.description && <FieldError>{errors.description}</FieldError>}
                </Field>

                {errors.root && <FieldError>{errors.root}</FieldError>}
              </FieldGroup>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={createForm.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createForm.isPending}>
                  {createForm.isPending && <Loader2 className="size-4 animate-spin" />}
                  Create form
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
