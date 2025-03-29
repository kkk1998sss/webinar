// 'use client';

// import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
// import { z } from 'zod';

// import { helloAction } from '@/actions/hello-action';
// import { useToast } from '@/components/ui/use-toast';

// const formSchema = z.object({
//   name: z.string().min(3),
// });

// type FormSchema = z.infer<typeof formSchema>;

// export const HeroForm = () => {
//   const form = useForm<FormSchema>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       name: '',
//     },
//   });
//   const { toast } = useToast();

//   const onSubmit = async ({ name }: FormSchema) => {
//     const { message } = await helloAction(name);

//     toast({ description: message });
//   };

//   return <></>;
// };
