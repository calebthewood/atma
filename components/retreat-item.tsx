import Image from "next/image";
import Link from "next/link";
import { Host, Property, Retreat } from "@prisma/client";
import { CirclePlus } from "lucide-react";

import { cn } from "@/lib/utils";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuSeparator,
    ContextMenuSub,
    ContextMenuSubContent,
    ContextMenuSubTrigger,
    ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { playlists } from "@/app/data/playlists";

const imagePaths = [
    "/img/iStock-1929812569.jpg",
    "/img/iStock-1812905796.jpg",
    "/img/iStock-1550112895.jpg",
    "/img/iStock-1507078404.jpg",
    "/img/iStock-1490140364.jpg",
    "/img/iStock-1291807006.jpg",
    "/img/iStock-1250509758.jpg",
    "/img/iStock-1439793956.jpg",
    "/img/empty-hallway-background.jpg",
    "/img/indoor-design-luxury-resort.jpg",
    "/img/people-exercising-practicing-sports-with-use-foam-roller.jpg",
    "/img/recovery-center-outside-lush-stunning-spa-nature-mauritiusisland.jpg",
    "/img/wellness-practices-self-care-world-health-day.jpg",
    "/img/woman-sits-pool-with-palm-trees-background.jpg",
];

interface RetreatCardProps extends React.HTMLAttributes<HTMLDivElement> {
    retreat: Retreat | Host | Property;
    aspectRatio?: "portrait" | "square";
    width?: number;
    height?: number;
    imgUrl: string | undefined;
    segment?: string;
}

export function RetreatItem({
    retreat,
    aspectRatio = "portrait",
    width,
    height,
    className,
    imgUrl,
    segment,
    ...props
}: RetreatCardProps) {
    console.log('images ', imgUrl);
    return (
        <div className={cn("space-y-3", className)} {...props}>
            <Link href={`/${segment}/${retreat.id}`}>
                <ContextMenu>
                    <ContextMenuTrigger>
                        <div className="overflow-hidden rounded-md">
                            <Image
                                src={
                                    imgUrl ??
                                    imagePaths[Math.floor(Math.random() * imagePaths.length)]
                                }
                                alt={retreat.name}
                                width={width}
                                height={height}
                                className={cn(
                                    "size-auto object-cover transition-all hover:scale-105",
                                    aspectRatio === "portrait" ? "aspect-[3/4]" : "aspect-square"
                                )}
                            />
                        </div>
                    </ContextMenuTrigger>
                    <ContextMenuContent className="w-40">
                        <ContextMenuItem>Add to Schedule</ContextMenuItem>
                        <ContextMenuSub>
                            <ContextMenuSubTrigger>Add to Wishlist</ContextMenuSubTrigger>
                            <ContextMenuSubContent className="w-48">
                                <ContextMenuItem>
                                    <CirclePlus className="mr-2 size-4" />
                                    New Item
                                </ContextMenuItem>
                                <ContextMenuSeparator />
                                {playlists.map((playlist) => (
                                    <ContextMenuItem key={playlist}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            className="mr-2 size-4"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M21 15V6M18.5 18a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM12 12H3M16 6H3M12 18H3" />
                                        </svg>
                                        {playlist}
                                    </ContextMenuItem>
                                ))}
                            </ContextMenuSubContent>
                        </ContextMenuSub>
                        <ContextMenuSeparator />
                        <ContextMenuItem>View Retreat</ContextMenuItem>
                        <ContextMenuItem>Visit Partner Page</ContextMenuItem>
                        <ContextMenuItem>View Similar</ContextMenuItem>
                        <ContextMenuSeparator />
                        <ContextMenuItem>Like</ContextMenuItem>
                        <ContextMenuItem>Share</ContextMenuItem>
                    </ContextMenuContent>
                </ContextMenu>
            </Link>
            <div className="space-y-1 text-sm">
                <h3 className="font-medium leading-none">{retreat.name}</h3>
                <p className="text-xs text-muted-foreground">{retreat.description}</p>
            </div>
        </div>
    );
}
