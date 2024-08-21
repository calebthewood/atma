import Image from "next/image";
import { BedSingle, NotepadText, Navigation, User, LucideIcon } from "lucide-react";
import { getRetreatById } from "@/actions/retreat-actions";
import { retreats } from "@/app/data/albums";
import { OpenBooking } from "@/components/booking/open-booking";
import { FixedBooking } from "@/components/booking/fixed-booking";
import { FlexibleBooking } from "@/components/booking/flexible-booking";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { FakeImageGallery } from "@/components/image-gallery";
import { LoadingSpinner } from "@/components/loading-spinner";

export default async function Page({ params }: { params: { id: string; }; }) {
    const retreat = await getRetreatById(params.id);

    const details = [
        { name: 'Room Type', icon: <BedSingle />, detail: '' },
        { name: 'Excursions', icon: <NotepadText />, detail: '' },
        { name: 'Transportation', icon: <Navigation />, detail: 'Car & Boat' },
        { name: 'Tour Guide', icon: <User />, detail: 'Not Included' },
    ];

    function RenderBookingType({ type }: { type: string; }) {

        switch (type) {
            case "open":
                return <OpenBooking retreat={retreat} events={retreat.RetreatInstance} />;
            case "fixed_range":
                return <FixedBooking retreat={retreat} event={retreat.RetreatInstance[0]} />;
            case "flexible_range":
                return <FlexibleBooking retreat={retreat} events={retreat.RetreatInstance} />;
            default:
                return null;
        }
    }


    if (!retreat) {
        return <><LoadingSpinner /> Loading</>;
    }
    // move this default to a general config? maybe not needed even.
    const coverImgPath = retreat?.coverImg || retreat.images[0].filePath || '/img/iStock-1490140364.jpg'
    return (
        <div className="h-auto min-h-screen">
            <div className="relative h-3/4 min-h-[500px] flex flex-col justify-end bg-muted p-10 text-white dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Image
                    priority
                    alt="resort cover photo"
                    src={coverImgPath}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    fill={true}
                />
                <div className="relative z-20 bg-primary/10 w-min pl-20 -left-20 pr-4 backdrop-blur-sm rounded-r">

                <div className="flex items-center text-lg font-medium">
                    {retreat.description}
                </div>
                <div className=" w-min text-nowrap">
                    <blockquote className="space-y-2">
                        <p className="font-serif text-5xl">
                            {retreat.name}
                        </p>
                    </blockquote>
                </div>
                </div>
            </div>
            <div className="container">
                <div className="flex justify-center gap-6 py-12">
                    {details.map((d, i) => <RetreatDescCard key={d.name} desc={d} />)}
                </div>
                <div>
                    <FakeImageGallery />
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-start-2 col-span-4 text-lg">
                        <p className="my-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga iste, repudiandae ipsam exercitationem reiciendis ea cumque corporis magni ipsum architecto nobis? Nihil libero rem cum dolorem quas ratione a fuga.</p>
                        <p className="my-4">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga iste, repudiandae ipsam exercitationem reiciendis ea cumque corporis magni ipsum architecto nobis? Nihil libero rem cum dolorem quas ratione a fuga.</p>
                    </div>
                    <div className="col-start-7 col-span-5 mb-16">
                        <RenderBookingType type={retreat.bookingType} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function RetreatDescCard({ desc }: { desc: { name: string; icon: any; detail: string; }; }) {
    return (
        <Card className="w-56">
            <CardHeader>
                <CardDescription className="mx-auto p-4">{desc.icon}</CardDescription>
                <CardTitle className="mx-auto font-light">{desc.name}</CardTitle>
            </CardHeader>
            <CardContent>
            </CardContent>
            <CardFooter className="justify-center">
                <p className="text-center">{desc.detail}</p>
            </CardFooter>
        </Card>
    );
}

