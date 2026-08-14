/* eslint-disable @next/next/no-img-element */
"use client";
import { mediaOps } from "@/app/api/ops/media";
import { Logger } from "@/lib/logger";
import { useEffect, useState } from "react";

export default function ImageById({ id, css }: { id: string; css?: string }) {
  const [src, setSrc] = useState<null | string>(null);
  const [alt, setAlt] = useState("Fetching image...");

  useEffect(() => {
    const x = async () => {
      const req = await mediaOps.readFile({ id, log: new Logger() });
      req.match(
        (t) => {
          setSrc(t);
        },
        (e) => {
          setAlt(e);
        },
      );
    };
    x();
  }, [id]);

  if (src) {
    return <img src={src} alt={alt} className={css} />;
  }
  return <img alt={alt} className={css} />;
}
