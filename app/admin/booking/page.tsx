import { CreateBookingForm } from "./create-booking-form";
import { Separator } from "@/components/ui/separator";

export default function Page() {
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Create Booking</h3>
                <p className="text-sm text-muted-foreground">
                    This admin booking form is primarily for testing.
                </p>
            </div>
            <Separator />
            <CreateBookingForm />
        </div>
    );

}