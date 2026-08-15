/* eslint-disable @next/next/no-img-element */
import { mediaOps } from "@/app/api/ops/media";
import { Logger } from "@/lib/logger";

export default async function ImageById({
  id,
  css,
}: {
  id: string;
  css?: string;
}) {
  const req = await mediaOps.readFile({ id, log: new Logger() });
  if (req.value.success) {
    return <img src={req.value.data} alt={req.value.data} className={css} />;
  }
  return <img alt={req.value.error} className={css} />;
}
