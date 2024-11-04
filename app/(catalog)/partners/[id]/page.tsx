export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <div className="">Partner: {params.id}</div>;
}
