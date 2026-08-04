/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useState } from "react";

export default function ImageById({ id, css }: { id: string; css: string }) {
  const [src, setSrc] = useState<null | string>(null);
  const [alt, setAlt] = useState("Fetching image...");

  useEffect(() => {
    const x = async () => {
      const req = await fetch(`/api/media?id=${encodeURIComponent(id)}`, {
        method: "GET",
      });

      const res = await req.json();
      if (req.ok) {
        setSrc(res.log);
      } else {
        setAlt(res.error);
      }
    };
    x();
  }, [id]);

  if (src) {
    return <img src={src} alt={alt} className={css} />;
  }
  return <img alt={alt} className={css} />;
}
