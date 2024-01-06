import { useState } from "react";
import { DefterDb, Entity } from "../db";
import { Link, useNavigate } from "react-router-dom";
import { BsTelephoneOutbound, CiUser, MdOutlineStickyNote2 } from "../icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2, 'En az 2 karakter girmelisiniz'),
  phoneNumber: z.string(),
  note: z.string(),
})

const db = new DefterDb();

export default function NewEntity() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      note: '',
      phoneNumber: '',
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    const newCustomer: Entity = {
      name: values.name,
      phoneNumber: values.phoneNumber,
      note: values.note,
    };
    db.entities
      .add(newCustomer)
      .then(() => {
        navigate('/entities')
        toast(newCustomer.name + " isimli kişi eklendi")

        // Navigate({to:'/entities'})
      });
  }

  return (
    <div className="container ">
      <Card>
        <CardHeader>
          <CardTitle>Yeni Kişi Ekle</CardTitle>
          <CardDescription />
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

            <CardContent>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kişi Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Kişi Adı" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon Numarası</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefon Numarası" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="note"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Not</FormLabel>
                    <FormControl>
                      <Input placeholder="Not" {...field} />
                    </FormControl>
                    <FormDescription />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="submit">Kaydet</Button>
              <Link
                to={`/entities/`}
                className={buttonVariants({ variant: 'outline', })}
              >
                Geri
              </Link>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}