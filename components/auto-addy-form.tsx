'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Loader } from "@googlemaps/js-api-loader";
import { Map } from "lucide-react";
import { cn } from "@/lib/utils";


interface AutoAddressInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    showIcon?: boolean;
    updateAddress: (addy: string) => void;
}

const AutoAddressInput = React.forwardRef<HTMLInputElement, AutoAddressInputProps>(
    ({ className, type, updateAddress, showIcon = true, ...props }, ref) => {

        const autoCompleteRef = useRef<HTMLInputElement>(null);
        const [placesLibrary, setPlacesLibrary] = useState<google.maps.PlacesLibrary | null>(null);

        useEffect(() => {
            const loadPlacesLibrary = async () => {
                try {
                    const google = new Loader({
                        apiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY || "",
                        version: "weekly",
                        libraries: ["places"],
                    });
                    const places = await google.importLibrary('places');
                    setPlacesLibrary(places);
                } catch (error) {
                    console.error("Error loading Google Places library:", error);
                }
            };
            loadPlacesLibrary();
        }, []);

        useEffect(() => {
            if (!placesLibrary || !autoCompleteRef.current) return;

            const autoComplete = new placesLibrary.Autocomplete(autoCompleteRef.current, {
                // bounds: bounds.maui,
                componentRestrictions: { country: "us" },
                fields: ["address_components", "geometry", "name", "formatted_address"],
                strictBounds: true,
            });

            if (!autoComplete) return;
            const handlePlaceChanged = () => {
                const addressObject = autoComplete.getPlace();
                const address = addressObject.formatted_address || '';
                updateAddress(address);
            };
            autoComplete.addListener("place_changed", handlePlaceChanged);

            return () => {
                google.maps.event.clearInstanceListeners(autoComplete);
            };

        }, [placesLibrary]);


        return (
            <div className="relative w-full ">
                {showIcon && <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-2.5 text-gray-500 dark:text-gray-400">
                    <Map />
                </div>}
                <input
                    type={type}
                    className={cn(showIcon ? 'pr-2 ps-10' : 'px-3',
                        "flex  h-10 w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        className
                    )}
                    ref={(node) => { //@ts-ignore
                        autoCompleteRef.current = node;
                        if (typeof ref === 'function') {
                            ref(node);
                        } else if (ref) {
                            (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
                        }
                    }}
                    {...props}
                />
            </div>
        );
    }
);
AutoAddressInput.displayName = 'AutoAddressInput';
export default AutoAddressInput;