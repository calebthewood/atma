// "use client";

// import { useState } from "react";
// import { createUser } from "@/actions/user-actions"; // Adjust this import path as needed
// import { zodResolver } from "@hookform/resolvers/zod";
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

// const _MAX_UPLOAD_SIZE = 1024 * 1024 * 3; // 3MB
// const _ACCEPTED_FILE_TYPES = ["image/png", "image/jpg", "image/jpeg"];

// const formSchema = z.object({
//   fname: z
//     .string()
//     .min(2, { message: "First name must be at least 2 characters." }),
//   lname: z
//     .string()
//     .min(2, { message: "Last name must be at least 2 characters." }),
//   username: z
//     .string()
//     .min(3, { message: "Username must be at least 3 characters." }),
//   email: z
//     .string()
//     .email({ message: "Invalid email address." })
//     .optional()
//     .or(z.literal("")),
//   phone: z
//     .string()
//     .min(10, { message: "Phone number must be at least 10 digits." }),
//   role: z.enum(["user", "host", "admin"]).default("user"),
// });

// export function CreateUserForm() {
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       fname: "",
//       lname: "",
//       username: "",
//       email: "",
//       phone: "",
//       role: "user",
//     },
//   });

//   async function onSubmit(values: z.infer<typeof formSchema>) {
//     setIsSubmitting(true);
//     try {
//       const _user = await createUser({
//         ...values,
//       });
//       form.reset();
//     } catch (error) {
//       console.log("Error creating user:", error);
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
//           name="fname"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>First Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="John" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="lname"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Last Name</FormLabel>
//               <FormControl>
//                 <Input placeholder="Doe" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="username"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Username</FormLabel>
//               <FormControl>
//                 <Input placeholder="johndoe" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="email"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Email</FormLabel>
//               <FormControl>
//                 <Input type="email" placeholder="john@example.com" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="phone"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Phone</FormLabel>
//               <FormControl>
//                 <Input placeholder="1234567890" {...field} />
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <FormField
//           control={form.control}
//           name="role"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel>Role</FormLabel>
//               <Select onValueChange={field.onChange} defaultValue={field.value}>
//                 <FormControl>
//                   <SelectTrigger>
//                     <SelectValue placeholder="Select a role" />
//                   </SelectTrigger>
//                 </FormControl>
//                 <SelectContent>
//                   <SelectItem value="user">User</SelectItem>
//                   <SelectItem value="host">Host</SelectItem>
//                   <SelectItem value="admin">Admin</SelectItem>
//                 </SelectContent>
//               </Select>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//         <Button type="submit" disabled={isSubmitting}>
//           {isSubmitting ? "Creating..." : "Create User"}
//         </Button>
//       </form>
//     </Form>
//   );
// }
