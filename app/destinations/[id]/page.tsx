export default async function Page({ params }: { params: { id: string } }) {
  return <div className="">Destination: {params.id}</div>;
}
