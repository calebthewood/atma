import { getHost } from "@/actions/host-actions";

import { HostForm } from "../../host-form";

export default async function Page(props: {
  params: Promise<{ id: string; slug: string }>;
}) {
  const { id } = await props.params;
  const result = await getHost(id);

  if (!result) {
    return <div>Error: {result}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Edit Host</h3>
        <p className="text-sm text-muted-foreground">
          Update host information and settings
        </p>
      </div>
      <HostForm host={result} />
    </div>
  );
}
