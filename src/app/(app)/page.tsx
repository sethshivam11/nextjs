"use client";
import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import messages from "@/messages.json";
import AutoPlay from "embla-carousel-autoplay";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

export default function Home() {
  return (
    <>
    <main className="flex flex-col flex-grow items-center justify-center px-4 md:px-24 py-12">
      <section className="text-center mb-8 md:md-12">
        <h1 className="text-3xl md:text-5xl font-bold">
          Dive into the World of Anonymous Conversations
        </h1>
        <p className="mt-3 md:mt-4 text-base md:text-lg">
          Explore Mystery Message - Where your identity remains a secret.
        </p>
      </section>
      <Carousel
        className="w-full max-w-xs"
        plugins={[AutoPlay({ delay: 2000 })]}
      >
        <CarouselContent>
          {messages.map(({ title, content, received }, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card>
                  <CardHeader>{title}</CardHeader>
                  <CardContent className="flex aspect-square items-center justify-center p-6">
                    <span className="text-lg font-semibold">{content}</span>
                  </CardContent>
                  <CardFooter className="text-sm">{received}</CardFooter>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </main>
      <footer className="text-center p-4 md:p-6">
        &copy;2023 Mystery Message. All rights reserved.
      </footer>
      </>
  );
}
