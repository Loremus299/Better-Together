/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/refs */
import { ComponentProps, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";
import { Button } from "../ui/button";

type Props = Omit<Omit<ComponentProps<typeof Input>, "accept">, "className"> & {
  accepts?: string[];
  className?: string;
};

export default function ImageInput({
  accepts = ["image/png", "image/jpeg", "image/gif"],
  className,
  onChange = () => null,
  ...props
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [refresh, setRefresh] = useState(true);

  const currentFiles = inputRef.current?.files
    ? Array.from(inputRef.current.files)
    : [];

  useEffect(() => {
    return () => {
      const objectUrls = currentFiles.map((file) => URL.createObjectURL(file));
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [refresh]);
  return (
    <div className="grid gap-2 ">
      <div
        className={cn(
          "p-3 rounded-md border text-xs border-dashed cursor-crosshair bg-muted tracking-wide",
          className,
        )}
        tabIndex={0}
        onPaste={(e) => {
          e.preventDefault();
          const input = inputRef.current!;
          const prev = Array.from(input.files ?? []);

          const item = Array.from(e.clipboardData.items).find(
            (item) => item.kind === "file" && accepts.includes(item.type),
          );

          const file = item?.getAsFile();
          if (!file) return;

          const dt = new DataTransfer();
          prev.forEach((file) => dt.items.add(file));
          dt.items.add(file);

          input.files = dt.files;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }}
        onDrop={(e) => {
          e.preventDefault();
          const input = inputRef.current!;
          const prev = Array.from(input.files ?? []);
          const files = Array.from(e.dataTransfer.items)
            .filter(
              (item) => item.kind === "file" && accepts.includes(item.type),
            )
            .map((item) => item.getAsFile())
            .filter((file): file is File => file !== null);

          if (files.length === 0) return;

          const dt = new DataTransfer();
          prev.forEach((file) => dt.items.add(file));
          files.forEach((file) => dt.items.add(file));

          input.files = dt.files;
          input.dispatchEvent(new Event("change", { bubbles: true }));
        }}
        onDragOver={(e) => {
          e.preventDefault();
        }}
      >
        <div className="flex justify-between">
          <div>
            <button
              type="button"
              className="underline cursor-pointer"
              onClick={() => inputRef.current!.click()}
            >
              Choose an image
            </button>{" "}
            <span>or drag, paste here.</span>
          </div>
          <div>{currentFiles.length == 0 ? "" : currentFiles.length}</div>
        </div>
        <Input
          ref={inputRef}
          type="file"
          accept={accepts.join(",")}
          className="hidden"
          onChange={(e) => {
            setRefresh(!refresh);
            onChange(e);
          }}
          {...props}
        />
      </div>
      <Carousel className="w-fit">
        {currentFiles.length !== 0 && <CarouselPrevious />}
        <CarouselContent>
          {currentFiles.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative">
                <Button
                  className={"absolute top-2 right-2"}
                  variant={"destructive"}
                  onClick={() => {
                    const input = inputRef.current!;
                    const prev = Array.from(input.files ?? []);
                    const fix = prev.filter((_, i) => i !== index);

                    const dt = new DataTransfer();
                    fix.forEach((file) => dt.items.add(file));

                    input.files = dt.files;
                    input.dispatchEvent(new Event("change", { bubbles: true }));
                  }}
                >
                  X
                </Button>
                <div className="aspect-video overflow-y-scroll border rounded-md border-dashed">
                  <img
                    alt={item.name}
                    src={URL.createObjectURL(item)}
                    className="rounded-md border w-full"
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {currentFiles.length !== 0 && <CarouselNext />}
      </Carousel>
    </div>
  );
}
