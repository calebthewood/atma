import { CreatePaymentForm } from "./create-payment-form";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


export default function Page() {
    return (
        <div className="">
            <h3 className="text-lg font-medium">Payments</h3>
            <p className="text-sm text-muted-foreground">
                For testing only, to be setup with Stripe
            </p>
            <Separator className="my-6"/>
            <Tabs defaultValue="form" className="w-[400px]">
                <TabsList>
                    <TabsTrigger value="form">Create Payment</TabsTrigger>
                    <TabsTrigger value="list">View Payments</TabsTrigger>
                </TabsList>
                <TabsContent value="form">


                    <CreatePaymentForm />
                </TabsContent>
                <TabsContent value="list">List Payments here</TabsContent>
            </Tabs>


        </div>
    );
}