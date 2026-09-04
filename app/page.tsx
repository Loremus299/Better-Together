"use client";
import MaxWContainer from "@/components/maxWContainer";
import { buttonVariants } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import {
  IconArrowDown,
  IconArrowRight,
  IconBrandGithub,
  IconLicense,
  IconWorld,
} from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const session = useSession();
  const router = useRouter();

  if (session.data) {
    router.push("/dashboard");
  }

  return (
    <MaxWContainer>
      <div className="h-screen p-4 flex flex-col">
        <main className="bg-card rounded-md h-full flex flex-col">
          <div className="border-b-10 border-muted ">
            <div className="flex items-center p-2 pl-4 pr-4 justify-between">
              <div className="flex items-center gap-2">
                <Image
                  src={"/logo.png"}
                  width={500}
                  height={500}
                  alt="logo"
                  className="w-12 aspect-square"
                />
                <h1 className="-mt-1 text-lg tracking-tight font-semibold">
                  Better Together.
                </h1>
              </div>
              <div>
                <Link href={"/auth/login"} className={buttonVariants()}>
                  Get Started <IconArrowRight />
                </Link>
              </div>
            </div>
          </div>
          <div className="p-4.25 flex-1 flex flex-col justify-end items-start">
            <div>
              <div className="mb-3 grid gap-1">
                <h1 className="text-6xl tracking-tight font-bold">
                  Better Together
                </h1>
                <h2 className="italic text-lg text-muted-foreground tracking-tight pl-1">
                  A habit tracker for love birds.
                </h2>
              </div>
              <h4 className="text-md">
                Because the best version of you is the one you build alongside
                the person you love. <br /> stay accountable, cultivate of
                healthy routines together with{" "}
                <span className="text-secondary italic">Better Together.</span>
              </h4>
              <div className="mt-4 flex gap-2">
                <Link
                  href={"/auth/login"}
                  className={buttonVariants({ size: "lg" })}
                >
                  Get Started <IconArrowRight />
                </Link>
                <Link
                  href={"#features"}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "lg" }),
                    "underline text-muted-foreground",
                  )}
                >
                  Features <IconArrowDown />
                </Link>
              </div>
              <Image
                src={"/header.png"}
                width={2000}
                height={2000}
                alt="screenshot"
                className="w-1/2 mt-4 rounded-t-md"
              />
            </div>
          </div>
        </main>
      </div>
      <div className="h-screen p-4 flex flex-col" id="features">
        <main className="bg-card rounded-md h-full flex flex-col">
          <div className="border-b-10 border-muted p-4 flex-1">Hi</div>
          <div className="p-4 grid landscape:grid-cols-3 portrait:grid-rows-3 gap-4 justify-start items-start">
            <div>
              <div className="flex items-center gap-2">
                <Image
                  src={"/logo.png"}
                  width={500}
                  height={500}
                  alt="logo"
                  className="w-12 aspect-square"
                />
                <h1 className="-mt-1 text-lg tracking-tight font-semibold">
                  Better Together.
                </h1>
              </div>
              <h4 className="text-sm">
                Because the best version of you is the one you build alongside
                the person you love. Stay accountable, cultivate of healthy
                routines together with{" "}
                <span className="text-secondary italic">Better Together.</span>{" "}
                <br /> <br />
                Loremus 2026 <br />
                Be gay, do crimes.
              </h4>
            </div>
            <div />
            <div className="text-sm grid gap-2">
              <h4 className="text-primary mt-2 font-semibold tracking-tight text-lg">
                Links.
              </h4>
              <div className="grid gap-1">
                <Link
                  href={"https://gal.gay"}
                  className="flex gap-1 items-center"
                >
                  <IconLicense className="size-4" />
                  Gay Agenda License - 1.0
                </Link>
                <Link
                  href={"https://gal.gay"}
                  className="flex gap-1 items-center"
                >
                  <IconBrandGithub className="size-4" />
                  Github
                </Link>
                <Link
                  href={"https://better-together.loremus.gay"}
                  className="flex gap-1 items-center"
                >
                  <IconWorld className="size-4" />
                  Project
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </MaxWContainer>
  );
}
