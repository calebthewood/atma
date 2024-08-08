import Image from "next/image";
import { BedSingle, NotepadText, Navigation, User, LucideIcon } from "lucide-react";
import { getRetreatById } from "@/actions/retreat-actions";
import { retreats } from "@/app/data/albums";
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
    if (!retreat) {
        return <><LoadingSpinner /> Loading</>;
    }
    return (
        <div className="h-auto min-h-screen">
            <div className="relative h-3/4 min-h-[500px] flex flex-col justify-end bg-muted p-10 text-white dark:border-r">
                <div className="absolute inset-0 bg-zinc-900" />
                <Image
                    priority
                    alt="resort cover photo"
                    src={retreat?.coverImg || '/img/iStock-1490140364.jpg'}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    fill={true}
                />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    {retreat.description}
                </div>
                <div className="relative z-20">
                    <blockquote className="space-y-2">
                        <p className="font-serif text-5xl">
                            {retreat.name}
                        </p>
                    </blockquote>
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
                    <div className="col-start-3 col-span-3 text-lg">
                        <p className="my-4">    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga iste, repudiandae ipsam exercitationem reiciendis ea cumque corporis magni ipsum architecto nobis? Nihil libero rem cum dolorem quas ratione a fuga.</p>
                        <p className="my-4">    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fuga iste, repudiandae ipsam exercitationem reiciendis ea cumque corporis magni ipsum architecto nobis? Nihil libero rem cum dolorem quas ratione a fuga.</p>
                    </div>
                    <div className="col-start-7 col-span-4">
                        <Card>
                            <CardHeader>
                                header
                            </CardHeader>
                            <CardContent>
                                content
                            </CardContent>
                            <CardFooter>
                                foot
                            </CardFooter>
                        </Card>
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

