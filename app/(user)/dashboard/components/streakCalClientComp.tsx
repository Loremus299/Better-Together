"use client";

import { cn } from "@/lib/utils";

function numToCol(num: number) {
  if (num > 10) {
    return "bg-chart-1";
  }
  if (num > 7) {
    return "bg-chart-2";
  }
  if (num > 5) {
    return "bg-chart-3";
  }
  if (num > 2) {
    return "bg-chart-4";
  }

  if (num >= 1) {
    return "bg-chart-5";
  }
  return "bg-muted";
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function StreakCalClientComp({
  data,
}: {
  data: { timeStamp: string }[];
}) {
  const map: Map<string, number> = new Map<string, number>();
  const today = new Date();

  for (let fill = 364; fill >= 0; fill--) {
    const date = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - fill,
    );

    map.set(dateKey(date), 0);
  }

  for (const point of data) {
    const timestamp = Number(point.timeStamp);

    const date = new Date(timestamp * 1000);
    const key = dateKey(date);

    if (map.has(key)) {
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }

  return (
    <div className="w-full h-full @container overflow-x-scroll bg-card rounded-md">
      <div className="grid grid-flow-col grid-rows-7 gap-1 p-4">
        {[...map.entries()].map((item) => (
          <div
            key={item[0]}
            className={cn("size-3 rounded-xs", numToCol(item[1]))}
          />
        ))}
      </div>
    </div>
  );
}
