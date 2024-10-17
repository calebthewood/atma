// "use client";

// import { useEffect, useState } from "react";
// import { getHosts } from "@/actions/host-actions";
// import { getProperties } from "@/actions/property-actions";
// import { createRetreat } from "@/actions/retreat-actions";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Host, Property } from "@prisma/client";
// import { useForm } from "react-hook-form";
// import { z } from "zod";

// import { Button } from "@/components/ui/button";
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
// import { Textarea } from "@/components/ui/textarea";

// // type Host = { id: string; name: string };
// // type Property = { id: string; name: string };

// const formSchema = z.object({
//   name: z.string().min(2, { message: "Name must be at least 2 characters." }),
//   desc: z
//     .string()
//     .min(10, { message: "Description must be at least 10 characters." }),
//   duration: z.string().min(1, { message: "Duration is required." }),
//   date: z
//     .string()
//     .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date." }),
//   price: z.string().min(1, { message: "Price is required." }),
//   minGuests: z.number().min(1, { message: "Minimum guests is required." }),
//   maxGuests: z.number().min(1, { message: "Maximum guests is required." }),
//   hostId: z.string().min(1, { message: "Host ID is required." }),
//   propertyId: z.string().min(1, { message: "Property ID is required." }),
//   bookingType: z.enum(["Flexible", "Fixed", "Open"], {
//     required_error: "Booking type is required.",
//   }),
// });

// export function CreateRetreatForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [hosts, setHosts] = useState<Host[]>([]);
//   const [properties, setProperties] = useState<Property[]>([]);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const [fetchedHosts, fetchedProperties] = await Promise.all([
//           getHosts(),
//           getProperties(),
//         ]);
//         setHosts(fetchedHosts);
//         setProperties(fetchedProperties);
//       } catch (error) {
//         console.error("Error fetching data:", error);
//         // TODO: Handle error (e.g., show error message to user)
//       }
//     }

//     fetchData();
//   }, []);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: "",
//       desc: "",
//       duration: "",
//       date: "",
//       price: "",
//       minGuests: 1,
//       maxGuests: 1,
//       hostId: "",
//       propertyId: "",
//       bookingType: "Flexible",
//     },
//   });

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     setIsSubmitting(true);
//     try {
//       const retreat = await createRetreat({
//         ...values,
//         date: new Date(values.date),
//       });
//       console.log("Retreat created:", retreat);
//       form.reset();
//       // TODO: Add success message or redirect
//     } catch (error) {
//       console.error("Error creating retreat:", error);
//       // TODO: Add error message
//     } finally {
//       setIsSubmitting(false);
//     }
//   }

//   return (
//     <Form {...form}>
//       <form
//         onSubmit={form.handleSubmit(onSubmit)}
//         className="max-w-md space-y-8"
//       >
//         <FormField
//           control={form.control}
//           name="name"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Retreat Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Yoga Retreat" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="desc"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Description</FormLabel>
//               <FormControl>
//                 <Textarea placeholder="Describe the retreat..." {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="duration"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Duration</FormLabel>
//               <FormControl>
//                 <Input placeholder="3 days" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="date"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Date</FormLabel>
//               <FormControl>
//                 <Input type="date" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="price"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Price</FormLabel>
//               <FormControl>
//                 <Input placeholder="999.99" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="minGuests"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Minimum Guests</FormLabel>
//               <FormControl>
//                 <Input
//                   {...field}
//                   type="number"
//                   onChange={(e) => field.onChange(parseInt(e.target.value))}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="maxGuests"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Maximum Guests</FormLabel>
//               <FormControl>
//                 <Input
//                   {...field}
//                   type="number"
//                   onChange={(e) => field.onChange(parseInt(e.target.value))}
//                 />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="bookingType"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Booking Type</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select booking type" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   <SelectItem value="Flexible">Flexible</SelectItem>
//                   <SelectItem value="Fixed">Fixed</SelectItem>
//                   <SelectItem value="Open">Open</SelectItem>
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="hostId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Host</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a host" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {hosts.map((host) => (
//                     <SelectItem key={host.id} value={host.id}>
//                       {host.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="propertyId"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Property</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a property" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   {properties.map((property) => (
//                     <SelectItem key={property.id} value={property.id}>
//                       {property.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Creating..." : "Create Retreat"}
//         </Button>
//       </form>
//     </Form>
//   );
// }
