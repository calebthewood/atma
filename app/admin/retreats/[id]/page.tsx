import { RetreatForm } from "../retreat-form";

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <RetreatForm />
    </div>
  );
}
