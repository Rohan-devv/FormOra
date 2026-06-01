import { FormFieldsPage } from "~/components/form-fields-page";

type FormPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FormPage({ params }: FormPageProps) {
  const { id } = await params;

  return <FormFieldsPage formId={id} />;
}
