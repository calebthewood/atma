
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { H2, Large, P, Small, Lead } from "../typography";
import { DatePicker } from "../ui/date-pickers";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { RetreatInstance, Retreat } from "@prisma/client";
import { format } from "date-fns";
import { toUSD } from "@/lib/utils";


const today = new Date();

interface BookingListProps {
    events: RetreatInstance[];
    retreat: Retreat;
}

export async function BookingList({ retreat, events }: BookingListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>$1,200 <Small>night</Small></CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4">
                    <Small>From</Small><br />
                    <DatePicker initialDate={today} />
                    <GuestSelect />
                </div>
            </CardContent>
            {events.map((r, i) => (
                <CardContent key={i} >
                    <BookingItem retreat={retreat} item={r} />
                </CardContent>
            ))}
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
        </Card>

    );
}

interface BookingItemProps {
    item: RetreatInstance;
    retreat: Retreat;
}

function BookingItem({ item, retreat }: BookingItemProps) {
    const start = format(item.startDate, 'EEE, MMM dd');
    const end = format(item.endDate, 'EEE, MMM dd');
    const price = toUSD(Number(retreat.price))
    return (
        <div>
            <Large>{retreat.name}</Large>
            <Lead className="text-sm">{start} to {end}</Lead>
            <p className="font-semibold text-sm">{price} <span className="font-normal">/ person</span></p>
            <Button className="my-1 w-full">Book Retreat</Button>
            <Separator className="my-4" />
        </div>
    );
}

function GuestSelect() {
    return (
        <Select>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Guests" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="light">1 Guest</SelectItem>
                <SelectItem value="dark">2 Guests</SelectItem>
                <SelectItem value="system">3 Guests</SelectItem>
            </SelectContent>
        </Select>
    );
}