"use client";

import {
  AlertCircle,
  ArrowLeft,
  FileInput,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { AppSidebar } from "~/components/app-sidebar";
import { SiteHeader } from "~/components/site-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
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
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { SidebarInset, SidebarProvider } from "~/components/ui/sidebar";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { trpc } from "~/trpc/client";

const FIELD_TYPES = [
  { value: "TEXT", label: "Text" },
  { value: "NUMBER", label: "Number" },
  { value: "EMAIL", label: "Email" },
  { value: "YES_NO", label: "Yes / No" },
  { value: "PASSWORD", label: "Password" },
] as const;

type FieldType = (typeof FIELD_TYPES)[number]["value"];

type FieldValues = {
  label: string;
  description: string;
  type: FieldType;
  placeholder: string;
  isRequired: boolean;
};

type EditableField = FieldValues & {
  id: string;
};

const initialValues: FieldValues = {
  label: "",
  description: "",
  type: "TEXT",
  placeholder: "",
  isRequired: false,
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function PreviewInput({
  fieldId,
  type,
  placeholder,
}: {
  fieldId: string;
  type: FieldType;
  placeholder: string | null;
}) {
  if (type === "YES_NO") {
    return (
      <RadioGroup className="flex gap-6" aria-label="Select yes or no">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id={`${fieldId}-yes`} />
          <Label htmlFor={`${fieldId}-yes`}>Yes</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id={`${fieldId}-no`} />
          <Label htmlFor={`${fieldId}-no`}>No</Label>
        </div>
      </RadioGroup>
    );
  }

  if (type === "TEXT") {
    return (
      <Textarea
        id={fieldId}
        placeholder={placeholder || undefined}
        className="min-h-28 resize-y"
      />
    );
  }

  return (
    <Input
      id={fieldId}
      type={type.toLowerCase()}
      placeholder={placeholder || undefined}
      autoComplete="off"
    />
  );
}

function QueryState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/20 px-4 py-10 text-center">
      {icon}
      <div className="space-y-1">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function FormFieldsPage({ formId }: { formId: string }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [deletingField, setDeletingField] = useState<{ id: string; label: string } | null>(null);

  const utils = trpc.useUtils();
  const hasValidFormId = uuidPattern.test(formId);
  const formsQuery = trpc.form.listForms.useQuery(undefined, {
    enabled: hasValidFormId,
  });
  const form = formsQuery.data?.find((currentForm) => currentForm.id === formId);
  const fieldsQuery = trpc.form.getFields.useQuery(
    { formId },
    {
      enabled: hasValidFormId && formsQuery.isSuccess && !!form,
    },
  );
  const fields = fieldsQuery.data ?? [];

  const createField = trpc.form.createField.useMutation({
    onSuccess: async () => {
      setValues(initialValues);
      setErrors({});
      setEditingFieldId(null);
      setOpen(false);
      toast.success("Field created");
      await utils.form.getFields.invalidate({ formId });
    },
    onError: (error) => {
      setErrors((currentErrors) => ({ ...currentErrors, root: error.message }));
      toast.error(error.message);
    },
  });

  const updateField = trpc.form.updateField.useMutation({
    onSuccess: async () => {
      setValues(initialValues);
      setErrors({});
      setEditingFieldId(null);
      setOpen(false);
      toast.success("Field updated");
      await utils.form.getFields.invalidate({ formId });
    },
    onError: (error) => {
      setErrors((currentErrors) => ({ ...currentErrors, root: error.message }));
      toast.error(error.message);
    },
  });

  const deleteField = trpc.form.deleteField.useMutation({
    onSuccess: async () => {
      setDeletingField(null);
      toast.success("Field deleted");
      await utils.form.getFields.invalidate({ formId });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const isSaving = createField.isPending || updateField.isPending;

  function set(field: "label" | "description" | "placeholder") {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((currentValues) => ({
        ...currentValues,
        [field]: event.target.value,
      }));
      clearError(field);
    };
  }

  function clearError(field: string) {
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      delete nextErrors.root;
      return nextErrors;
    });
  }

  function validate(v: typeof values) {
    const nextErrors: Record<string, string> = {};
    const label = v.label.trim();
    const description = v.description.trim();
    const placeholder = v.placeholder.trim();

    if (!label) nextErrors.label = "Label is required";
    if (label.length > 100) nextErrors.label = "Label must be 100 characters or less";
    if (description.length > 100) {
      nextErrors.description = "Description must be 100 characters or less";
    }
    if (placeholder.length > 50) {
      nextErrors.placeholder = "Placeholder must be 50 characters or less";
    }

    return nextErrors;
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    const description = values.description.trim();
    const placeholder = values.placeholder.trim();

    if (editingFieldId) {
      updateField.mutate({
        fieldId: editingFieldId,
        label: values.label.trim(),
        description: description || null,
        placeholder: placeholder || null,
        type: values.type,
        isRequired: values.isRequired,
      });
    } else {
      createField.mutate({
        formId,
        label: values.label.trim(),
        description: description || undefined,
        placeholder: placeholder || undefined,
        type: values.type,
        isRequired: values.isRequired,
      });
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) return;

    setOpen(nextOpen);

    if (!nextOpen) {
      setValues(initialValues);
      setErrors({});
      setEditingFieldId(null);
    }
  }

  function openCreateDialog() {
    setValues(initialValues);
    setErrors({});
    setEditingFieldId(null);
    setOpen(true);
  }

  function openEditDialog(field: EditableField) {
    setValues({
      label: field.label,
      description: field.description,
      type: field.type,
      placeholder: field.placeholder,
      isRequired: field.isRequired,
    });
    setErrors({});
    setEditingFieldId(field.id);
    setOpen(true);
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-3">
                <Button variant="ghost" size="sm" asChild className="-ml-2">
                  <Link href="/dashboard/forms">
                    <ArrowLeft className="size-4" />
                    Back to forms
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold">{form?.title ?? "Form fields"}</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {form?.description || "Add and manage the fields shown in this form."}
                  </p>
                </div>
              </div>
              <Button onClick={openCreateDialog} disabled={!form}>
                <Plus className="size-4" />
                Add field
              </Button>
            </div>

            {!hasValidFormId ? (
              <QueryState
                icon={<AlertCircle className="size-10 text-destructive" />}
                title="Invalid form link"
                description="This form link is not valid. Return to your forms and open it again."
              />
            ) : formsQuery.isPending ? (
              <QueryState
                icon={<Loader2 className="size-10 animate-spin text-muted-foreground" />}
                title="Loading form"
                description="Fetching the selected form."
              />
            ) : formsQuery.isError ? (
              <QueryState
                icon={<AlertCircle className="size-10 text-destructive" />}
                title="Unable to load form"
                description={formsQuery.error.message}
                action={
                  <Button type="button" variant="outline" onClick={() => void formsQuery.refetch()}>
                    <RefreshCw className="size-4" />
                    Retry
                  </Button>
                }
              />
            ) : !form ? (
              <QueryState
                icon={<AlertCircle className="size-10 text-destructive" />}
                title="Form not found"
                description="This form does not exist or is not available in your account."
              />
            ) : fieldsQuery.isPending ? (
              <QueryState
                icon={<Loader2 className="size-10 animate-spin text-muted-foreground" />}
                title="Loading fields"
                description="Fetching the fields added to this form."
              />
            ) : fieldsQuery.isError ? (
              <QueryState
                icon={<AlertCircle className="size-10 text-destructive" />}
                title="Unable to load fields"
                description={fieldsQuery.error.message}
                action={
                  <Button type="button" variant="outline" onClick={() => void fieldsQuery.refetch()}>
                    <RefreshCw className="size-4" />
                    Retry
                  </Button>
                }
              />
            ) : fields.length === 0 ? (
              <QueryState
                icon={<FileInput className="size-10 text-muted-foreground" />}
                title="No fields yet"
                description="Add your first field to start building this form."
                action={
                  <Button type="button" onClick={openCreateDialog}>
                    <Plus className="size-4" />
                    Add field
                  </Button>
                }
              />
            ) : (
              <Card className="mx-auto w-full max-w-2xl gap-0 rounded-md">
                <CardHeader className="border-b pb-6">
                  <CardTitle className="text-xl">{form.title}</CardTitle>
                  {form.description && <CardDescription>{form.description}</CardDescription>}
                </CardHeader>
                <CardContent className="pt-6">
                  <form className="space-y-6" onSubmit={(event) => event.preventDefault()}>
                    {fields.map((field) => (
                      <Field
                        key={field.id}
                        className="rounded-md border border-transparent p-3 transition-colors hover:border-border hover:bg-muted/20"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <FieldLabel htmlFor={field.id}>
                            {field.label}
                            {field.isRequired && <span className="text-destructive">*</span>}
                          </FieldLabel>
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Edit ${field.label}`}
                              title={`Edit ${field.label}`}
                              onClick={() =>
                                openEditDialog({
                                  id: field.id,
                                  label: field.label,
                                  description: field.description ?? "",
                                  type: field.type,
                                  placeholder: field.placeholder ?? "",
                                  isRequired: field.isRequired,
                                })
                              }
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Delete ${field.label}`}
                              title={`Delete ${field.label}`}
                              onClick={() => setDeletingField({ id: field.id, label: field.label })}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </div>
                        <PreviewInput
                          fieldId={field.id}
                          type={field.type}
                          placeholder={field.placeholder}
                        />
                        {field.description && <FieldDescription>{field.description}</FieldDescription>}
                      </Field>
                    ))}
                    <Button type="submit">Submit response</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingFieldId ? "Edit field" : "Add field"}</DialogTitle>
              <DialogDescription>
                {editingFieldId
                  ? `Update this field in ${form?.title ?? "this form"}.`
                  : `Create a new field for ${form?.title ?? "this form"}.`}
              </DialogDescription>
            </DialogHeader>

            <form className="space-y-5" onSubmit={submit}>
              <FieldGroup className="gap-4">
                <Field data-invalid={!!errors.label}>
                  <FieldLabel htmlFor="field-label">Label</FieldLabel>
                  <Input
                    id="field-label"
                    value={values.label}
                    onChange={set("label")}
                    placeholder="Email address"
                    maxLength={100}
                    disabled={isSaving}
                    aria-invalid={!!errors.label}
                  />
                  <FieldDescription>{values.label.trim().length}/100 characters</FieldDescription>
                  {errors.label && <FieldError>{errors.label}</FieldError>}
                </Field>

                <Field>
                  <FieldLabel htmlFor="field-type">Field type</FieldLabel>
                  <Select
                    value={values.type}
                    onValueChange={(type: FieldType) => {
                      setValues((currentValues) => ({ ...currentValues, type }));
                      clearError("type");
                    }}
                    disabled={isSaving}
                  >
                    <SelectTrigger id="field-type" className="w-full">
                      <SelectValue placeholder="Select a field type" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_TYPES.map((fieldType) => (
                        <SelectItem key={fieldType.value} value={fieldType.value}>
                          {fieldType.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field data-invalid={!!errors.placeholder}>
                  <FieldLabel htmlFor="field-placeholder">Placeholder</FieldLabel>
                  <Input
                    id="field-placeholder"
                    value={values.placeholder}
                    onChange={set("placeholder")}
                    placeholder="name@example.com"
                    maxLength={50}
                    disabled={isSaving}
                    aria-invalid={!!errors.placeholder}
                  />
                  <FieldDescription>
                    Optional text shown inside the empty field. {values.placeholder.trim().length}/50
                    characters
                  </FieldDescription>
                  {errors.placeholder && <FieldError>{errors.placeholder}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.description}>
                  <FieldLabel htmlFor="field-description">Description</FieldLabel>
                  <Textarea
                    id="field-description"
                    value={values.description}
                    onChange={set("description")}
                    placeholder="We will only use this to contact you."
                    maxLength={100}
                    disabled={isSaving}
                    aria-invalid={!!errors.description}
                  />
                  <FieldDescription>
                    Optional helper text shown below the field. {values.description.trim().length}/100
                    characters
                  </FieldDescription>
                  {errors.description && <FieldError>{errors.description}</FieldError>}
                </Field>

                <Field
                  orientation="horizontal"
                  className="rounded-md border p-4"
                  data-disabled={isSaving}
                >
                  <div className="space-y-1">
                    <FieldLabel htmlFor="field-required">Required field</FieldLabel>
                    <FieldDescription>Users must answer this field before submitting.</FieldDescription>
                  </div>
                  <Switch
                    id="field-required"
                    checked={values.isRequired}
                    onCheckedChange={(isRequired) =>
                      setValues((currentValues) => ({ ...currentValues, isRequired }))
                    }
                    disabled={isSaving}
                  />
                </Field>

                {errors.root && <FieldError>{errors.root}</FieldError>}
              </FieldGroup>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {editingFieldId ? "Save changes" : "Create field"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={!!deletingField}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !deleteField.isPending) setDeletingField(null);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete field?</AlertDialogTitle>
              <AlertDialogDescription>
                {deletingField
                  ? `"${deletingField.label}" will be removed from this form. This action cannot be undone.`
                  : "This field will be removed from the form."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleteField.isPending}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-white hover:bg-destructive/90"
                disabled={deleteField.isPending}
                onClick={(event) => {
                  event.preventDefault();
                  if (deletingField) deleteField.mutate({ fieldId: deletingField.id });
                }}
              >
                {deleteField.isPending && <Loader2 className="size-4 animate-spin" />}
                Delete field
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
