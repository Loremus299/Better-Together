"use client";

import dynamic from "next/dynamic";

const StreakCalClientComp = dynamic(() => import("./streakCalClientComp"), {
  ssr: false,
});

export default function StreakCalClient({
  data,
}: {
  data: { timeStamp: string }[];
}) {
  return <StreakCalClientComp data={data} />;
}
