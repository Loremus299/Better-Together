"use server"

import { habitService } from "@/app/api/habit/service"
import { auth } from "@/lib/auth"
import { useLogger, withEvlog } from "@/lib/evlog"
import { isError, isOk, Result } from "@/lib/result"
import { headers } from "next/headers"
import { FormValues } from "./common"


export const createNewHabitAction = withEvlog(async (values: FormValues): Promise<Result<string, string>> => {
  const log = useLogger()
  const header = await headers()
  const session = await auth.api.getSession({ headers: header })

  if (!session) {
    log.error("No Login.");
    return isError("Please login before creating new habit.")
  }
  log.set({ userId: session.user.id })

  const req = await habitService.createNewHabit({ name: values.name, description: values.description, userId: session.user.id })

  if (!req.success) {
    log.error(req.error)
    return isError(req.error)
  }

  log.set({ habitId: req.data })
  return isOk(req.data)
})