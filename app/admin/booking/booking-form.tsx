// "use client";

// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   BookingWithAllRelations,
//   createProgramBooking,
//   createRetreatBooking,
//   updateBooking,
// } from "@/actions/booking-actions";
// import { BookingFormData, bookingFormSchema } from "@/schemas/booking-schema";
// import { Host, Property } from "@prisma/client";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";

// import { cn } from "@/lib/utils";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { toast } from "@/components/ui/use-toast";
// import { useSession } from "next-auth/react";
// import { ProgramWithAllRelations } from "@/actions/program-actions";
// import { RetreatWithAllRelations } from "@/actions/retreat-actions";

// type BookingFormProps = {
//   booking?: BookingWithAllRelations;
//   // Add these props to pass in data
//   hosts: Host[];
//   properties: Property[];
//   programs: ProgramWithAllRelations[];
//   retreats: RetreatWithAllRelations[];
// };

// const formatDate = (date: Date) => {
//   return new Date(date).toISOString().split("T")[0];
// };

// export function BookingForm({ booking, hosts, properties, programs, retreats }: BookingFormProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const { data: session } = useSession();

//   // State for cascading selects
//   const [selectedHostId, setSelectedHostId] = useState<string>(booking?.hostId || "");
//   const [selectedPropertyId, setSelectedPropertyId] = useState<string>(booking?.propertyId || "");
//   const [bookingType, setBookingType] = useState<"program" | "retreat" | null>(
//     booking?.programInstanceId ? "program" : booking?.retreatInstanceId ? "retreat" : null
//   );

//   // Filter data based on selections
//   const filteredHosts = hosts.filter(host =>
//     session?.user?.role === "admin" || host.id === session?.user?.hostId
//   );

//   const filteredProperties = properties.filter(property =>
//     property.hostId === selectedHostId
//   );

//   const filteredPrograms = programs.filter(program =>
//     program.propertyId === selectedPropertyId
//   );

//   const filteredRetreats = retreats.filter(retreat =>
//     retreat.propertyId === selectedPropertyId
//   );

//   const form = useForm<BookingFormData>({
//     resolver: zodResolver(bookingFormSchema),
//     defaultValues: {
//       checkInDate: booking?.checkInDate ? formatDate(booking.checkInDate) : "",
//       checkOutDate: booking?.checkOutDate ? formatDate(booking.checkOutDate) : "",
//       guestCount: booking?.guestCount || 1,
//       propertyId: booking?.propertyId || "",
//       hostId: booking?.hostId || "",
//       retreatInstanceId: booking?.retreatInstanceId || "",
//       programInstanceId: booking?.programInstanceId || "",
//       status: booking?.status || "pending",
//       totalPrice: booking?.totalPrice || "",
//       userId: booking?.userId || session?.user?.id || "",
//     },
//   });

//   // Handle host selection
//   const handleHostChange = (hostId: string) => {
//     setSelectedHostId(hostId);
//     setSelectedPropertyId("");
//     form.setValue("hostId", hostId);
//     form.setValue("propertyId", "");
//     form.setValue("programInstanceId", "");
//     form.setValue("retreatInstanceId", "");
//   };

//   // Handle property selection
//   const handlePropertyChange = (propertyId: string) => {
//     setSelectedPropertyId(propertyId);
//     form.setValue("propertyId", propertyId);
//     form.setValue("programInstanceId", "");
//     form.setValue("retreatInstanceId", "");
//   };

//   // Handle type selection
//   const handleTypeChange = (type: "program" | "retreat") => {
//     setBookingType(type);
//     form.setValue("programInstanceId", "");
//     form.setValue("retreatInstanceId", "");
//   };

//   // Update fields on blur when editing
//   useEffect(() => {
//     if (!booking) return;

//     const subscription = form.watch(async (value, { name, type }) => {
//       if (name && form.formState.dirtyFields[name] && !form.formState.isSubmitting && type === "blur") {
//         try {
//           await handleFieldBlur(name as keyof BookingFormData);
//         } catch (error) {
//           console.log(`Error updating ${name}:`, error);
//         }
//       }
//     });

//     return () => subscription.unsubscribe();
//   }, [booking, form]);

//   const handleFieldBlur = async (fieldName: keyof BookingFormData) => {
//     if (!booking) return;

//     try {
//       const fieldValue = form.getValues(fieldName);
//       const result = await updateBooking(booking.id, {
//         [fieldName]: fieldValue,
//       });

//       if (!result.ok) throw new Error(result.message);

//       toast({
//         title: "Updated",
//         description: `${fieldName} has been updated.`,
//       });
//     } catch (error) {
//       console.log(`Error updating ${fieldName}:`, error);
//       toast({
//         title: "Error",
//         description: `Failed to update ${fieldName}. Please try again.`,
//         variant: "destructive",
//       });
//     }
//   };

//   async function onSubmit(values: BookingFormData) {
//     setIsLoading(true);
//     try {
//       if (booking) {
//         const result = await updateBooking(booking.id, values);
//         if (!result.ok) throw new Error(result.message);
//       } else {
//         const createFn = bookingType === "program" ? createProgramBooking : createRetreatBooking;
//         const result = await createFn(values);
//         if (!result.ok) throw new Error(result.message);
//       }

//       toast({
//         title: "Success",
//         description: `Booking ${booking ? "updated" : "created"} successfully.`,
//       });

//       router.push("/admin/bookings");
//     } catch (error) {
//       console.log("Error submitting booking:", error);
//       toast({
//         title: "Error",
//         description: error instanceof Error ? error.message : "Failed to save booking",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-xl space-y-8">
//         <Card>
//           <CardHeader>
//             <CardTitle>Booking Details</CardTitle>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Host Selection */}
//             <FormField
//               control={form.control}
//               name="hostId"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Host</FormLabel>
//                   <Select
//                     onValueChange={(value) => handleHostChange(value)}
//                     value={field.value}
//                   >
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select host" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       {filteredHosts.map((host) => (
//                         <SelectItem key={host.id} value={host.id}>
//                           {host.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Property Selection */}
//             {selectedHostId && (
//               <FormField
//                 control={form.control}
//                 name="propertyId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Property</FormLabel>
//                     <Select
//                       onValueChange={(value) => handlePropertyChange(value)}
//                       value={field.value}
//                     >
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select property" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {filteredProperties.map((property) => (
//                           <SelectItem key={property.id} value={property.id}>
//                             {property.name}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             {/* Booking Type Selection */}
//             {selectedPropertyId && (
//               <FormItem>
//                 <FormLabel>Booking Type</FormLabel>
//                 <Select
//                   onValueChange={(value: "program" | "retreat") => handleTypeChange(value)}
//                   value={bookingType || undefined}
//                 >
//                   <FormControl>
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select type" />
//                     </SelectTrigger>
//                   </FormControl>
//                   <SelectContent>
//                     <SelectItem value="program">Program</SelectItem>
//                     <SelectItem value="retreat">Retreat</SelectItem>
//                   </SelectContent>
//                 </Select>
//                 <FormMessage />
//               </FormItem>
//             )}

//             {/* Program/Retreat Instance Selection */}
//             {bookingType === "program" && (
//               <FormField
//                 control={form.control}
//                 name="programInstanceId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Program</FormLabel>
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select program" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {filteredPrograms.map((program) => (
//                           <SelectItem key={program.id} value={program.id}>
//                             {program.program.name} ({formatDate(program.startDate)} - {formatDate(program.endDate)})
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             {bookingType === "retreat" && (
//               <FormField
//                 control={form.control}
//                 name="retreatInstanceId"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormLabel>Retreat</FormLabel>
//                     <Select onValueChange={field.onChange} value={field.value}>
//                       <FormControl>
//                         <SelectTrigger>
//                           <SelectValue placeholder="Select retreat" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent>
//                         {filteredRetreats.map((retreat) => (
//                           <SelectItem key={retreat.id} value={retreat.id}>
//                             {retreat.retreat.name} ({formatDate(retreat.startDate)} - {formatDate(retreat.endDate)})
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             )}

//             {/* Common Booking Fields */}
//             <FormField
//               control={form.control}
//               name="checkInDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Check-in Date</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="checkOutDate"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Check-out Date</FormLabel>
//                   <FormControl>
//                     <Input type="date" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="guestCount"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Number of Guests</FormLabel>
//                   <FormControl>
//                     <Input type="number" min="1" {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="totalPrice"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Total Price</FormLabel>
//                   <FormControl>
//                     <Input {...field} />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             <FormField
//               control={form.control}
//               name="status"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel>Status</FormLabel>
//                   <Select onValueChange={field.onChange} value={field.value}>
//                     <FormControl>
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select status" />
//                       </SelectTrigger>
//                     </FormControl>
//                     <SelectContent>
//                       <SelectItem value="pending">Pending</SelectItem>
//                       <SelectItem value="confirmed">Confirmed</SelectItem>
//                       <SelectItem value="cancelled">Cancelled</SelectItem>
//                     </SelectContent>
//                   </Select>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />
//           </CardContent>
//         </Card>

//         <Button
//           type="submit"
//           disabled={isLoading}
//           className={cn({
//             "bg-yellow-500": isLoading,
//             "bg-green-500": form.formState.isSubmitSuccessful,
//           })}
//         >
//           {isLoading ? "Saving..." : booking ? "Update Booking" : "Create Booking"}
//         </Button>
//       </form>
//     </Form>
//   );
// }
