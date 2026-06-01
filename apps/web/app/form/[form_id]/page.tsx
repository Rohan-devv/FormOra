import { PublicFormPage } from "~/components/public-form-page";

type PublicFormRouteProps = {
  params: Promise<{
    form_id: string;
  }>;
};

export default async function PublicFormRoute({ params }: PublicFormRouteProps) {
  const { form_id: formId } = await params;

  return <PublicFormPage formId={formId} />;
}
