import { getDatabaseCounts } from "@/actions/admin";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function Page() {
  const {
    userCount,
    hostCount,
    propertyCount,
    verifiedPropertyCount,
    retreatCount,
    verifiedRetreatCount,
    programCount,
    verifiedProgramCount,
  } = await getDatabaseCounts();
  return (
    <div className="flex flex-row flex-wrap gap-6">
      <CountCard
        title={"User Count"}
        desc={"Registered users and admins"}
        count={userCount}
      />
      <CountCard
        title={"Host Count"}
        desc={"Registered hosts or companies"}
        count={hostCount}
      />
      <CountCard
        title={"Property Count"}
        desc={"Registered properties"}
        count={propertyCount}
        verifiedCount={verifiedPropertyCount}
      />
      <CountCard
        title={"Retreat Count"}
        desc={"Registered retreats"}
        count={retreatCount}
        verifiedCount={verifiedRetreatCount}
      />
      <CountCard
        title={"Program Count"}
        desc={"Registered programs"}
        count={programCount}
        verifiedCount={verifiedProgramCount}
      />
    </div>
  );
}
interface CountCardProps {
  title: string;
  desc: string;
  count: number;
  verifiedCount?: number;
}
function CountCard({ title, desc, count, verifiedCount }: CountCardProps) {
  return (
    <Card className="w-56">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-5xl">{count}</p>
      </CardContent>
      <CardFooter>
        <p>
          {verifiedCount === undefined ? "--" : `${verifiedCount}/${count}`}
        </p>
      </CardFooter>
    </Card>
  );
}
