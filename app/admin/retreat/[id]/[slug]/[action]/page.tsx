import { RetreatInstanceForm } from "../../../instance-form";

interface PageProps {
  params: Promise<{ id: string; slug: string; action: string }>;
}

export default async function Page({ params }: PageProps) {
  return <RetreatInstanceForm />;
}
