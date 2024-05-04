"use client";
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useCompletion } from "ai/react";
import { toast } from "@/components/ui/use-toast";
import { ApiResponse } from "@/types/ApiResponse";
import { Loader2 } from "lucide-react";
import { messageSchema } from "@/schemas/messageSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";

function Page({ params }: { params: { username: string } }) {
  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      content: "",
    },
  });

  const username = params.username;
  const initialMessages =
    "What's your favorite movie?||Do you have any pets?||What's your dream job?";

  const [messages, setMessages] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const { completion, isLoading, complete } = useCompletion({
    api: "/api/suggest-messages",
    initialCompletion: initialMessages,
  });

  React.useEffect(() => {
    setMessages(completion?.split("||"));
  }, [completion]);

  async function fetchSuggestedMessages() {
    try {
      complete("");
    } catch (error) {
      console.log(error);
    }
  }

  async function handleSubmit(data: z.infer<typeof messageSchema>) {
    setLoading(true);
    try {
      const response = await axios.post("/api/send-message", {
        username,
        content: data.content,
      });
      toast({
        title: "Success",
        description: response.data.message,
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message || "Error sending message",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  function setMessage(message: string) {
    form.setValue("content", message);
  }

  return (
    <div className="flex flex-col flex-grow items-center justify-start px-4 md:px-24 py-12">
      <h1 className="text-4xl md:text-5xl tracking-tight font-bold">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-8 w-full my-8 items-center justify-center px-10 sm:px-20 md:px-32"
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Send anonymous messages to @{username}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your anonymous message here"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            <Button type="submit" disabled={loading}>
              {loading ? (<div className="flex gap-1"><Loader2 className="animate-spin" /> Please wait</div>) : "Send it"}
            </Button>
          </div>
        </form>
      </Form>

      <div className="my-4 flex flex-col items-start justify-start space-y-4 w-full py-4 px-10 sm:px-20 md:px-32">
        <Button size="lg" disabled={isLoading} onClick={fetchSuggestedMessages}>
          Suggest Messages
        </Button>
        <div className="ring-1 ring-gray-200 rounded-md w-full h-fit mx-auto py-4 px-10 sm:px-20 space-y-3 flex flex-col ">
          <span className="font-bold text-xl">Messages</span>
          {messages.length > 0 ? (
            messages.map((message, index) => (
              <Button
                variant="outline"
                onClick={() => setMessage(message)}
                className="text-wrap h-fit"
                key={index}
              >
                {message}
              </Button>
            ))
          ) : (
            <Button variant="outline" disabled>
              No messages
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
