"use client";

import { AlertCircle, FileText, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Field, FieldDescription, FieldError, FieldLabel } from "~/components/ui/field";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Textarea } from "~/components/ui/textarea";
import { trpc } from "~/trpc/client";

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
    <Card className="w-full max-w-2xl rounded-md">
      <CardContent className="flex min-h-[20rem] flex-col items-center justify-center gap-3 px-6 text-center">
        {icon}
        <div className="space-y-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          <p className="max-w-md text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

function PublicFieldInput({
  fieldId,
  type,
  placeholder,
  value,
  hasError,
  onChange,
}: {
  fieldId: string;
  type: FieldType;
  placeholder: string | null;
  value: string;
  hasError: boolean;
  onChange: (value: string) => void;
}) {
  if (type === "YES_NO") {
    return (
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex gap-6"
        aria-invalid={hasError}
        aria-label="Select yes or no"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id={`${fieldId}-yes`} aria-invalid={hasError} />
          <Label htmlFor={`${fieldId}-yes`}>Yes</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id={`${fieldId}-no`} aria-invalid={hasError} />
          <Label htmlFor={`${fieldId}-no`}>No</Label>
        </div>
      </RadioGroup>
    );
  }

  if (type === "TEXT") {
    return (
      <Textarea
        id={fieldId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || undefined}
        className="min-h-28 resize-y"
        aria-invalid={hasError}
      />
    );
  }

  return (
    <Input
      id={fieldId}
      type={type.toLowerCase()}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder || undefined}
      autoComplete="off"
      aria-invalid={hasError}
    />
  );
}

export function PublicFormPage({ formId }: { formId: string }) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const hasValidFormId = uuidPattern.test(formId);
  const formQuery = trpc.form.getPublicForm.useQuery(
    { formId },
    {
      enabled: hasValidFormId,
      retry: false,
    },
  );

  function setFieldValue(fieldId: string, value: string) {
    setValues((currentValues) => ({ ...currentValues, [fieldId]: value }));
    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!formQuery.data) return;

    const nextErrors: Record<string, string> = {};

    for (const field of formQuery.data.fields) {
      if (field.isRequired && !values[field.id]?.trim()) {
        nextErrors[field.id] = "This field is required";
      }
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please complete the required fields");
      return;
    }

    toast.info("Response saving will be connected next");
  }

  return (
    <main className="min-h-svh bg-muted/20 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div className="flex items-center gap-2 px-1">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <FileText className="size-4" />
          </div>
          <span className="text-base font-semibold">FormOra.</span>
        </div>

        {!hasValidFormId ? (
          <QueryState
            icon={<AlertCircle className="size-10 text-destructive" />}
            title="Invalid form link"
            description="This form link is not valid. Ask the sender for an updated link."
          />
        ) : formQuery.isPending ? (
          <QueryState
            icon={<Loader2 className="size-10 animate-spin text-muted-foreground" />}
            title="Loading form"
            description="Fetching the questions for this form."
          />
        ) : formQuery.isError ? (
          <QueryState
            icon={<AlertCircle className="size-10 text-destructive" />}
            title="Form unavailable"
            description="This form does not exist or is no longer available."
            action={
              <Button type="button" variant="outline" onClick={() => void formQuery.refetch()}>
                <RefreshCw className="size-4" />
                Retry
              </Button>
            }
          />
        ) : (
          <Card className="gap-0 rounded-md">
            <CardHeader className="border-b pb-6">
              <CardTitle className="text-2xl leading-tight">{formQuery.data.title}</CardTitle>
              {formQuery.data.description && (
                <CardDescription className="leading-6">{formQuery.data.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {formQuery.data.fields.length === 0 ? (
                <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
                  <FileText className="size-9 text-muted-foreground" />
                  <h2 className="font-medium">No questions added yet</h2>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    The owner is still preparing this form.
                  </p>
                </div>
              ) : (
                <form className="space-y-6" onSubmit={submit}>
                  {formQuery.data.fields.map((field) => (
                    <Field key={field.id} data-invalid={!!errors[field.id]}>
                      <FieldLabel htmlFor={field.id}>
                        {field.label}
                        {field.isRequired && <span className="text-destructive">*</span>}
                      </FieldLabel>
                      <PublicFieldInput
                        fieldId={field.id}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={values[field.id] ?? ""}
                        hasError={!!errors[field.id]}
                        onChange={(value) => setFieldValue(field.id, value)}
                      />
                      {field.description && <FieldDescription>{field.description}</FieldDescription>}
                      {errors[field.id] && <FieldError>{errors[field.id]}</FieldError>}
                    </Field>
                  ))}
                  <Button type="submit" className="w-full sm:w-auto">
                    Submit response
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        <p className="px-1 text-center text-xs text-muted-foreground">Powered by FormOra.</p>
      </div>
    </main>
  );
}
