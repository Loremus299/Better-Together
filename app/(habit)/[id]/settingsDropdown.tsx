import { Button } from "@/components/ui/button";
import {
  IconMail,
  IconPencil,
  IconPlus,
  IconSettings,
  IconTrash,
} from "@tabler/icons-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
export default function SettingsDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={"ghost"} className={"size-8"} />}
      >
        <IconSettings />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <IconMail />
            Add member
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconPlus />
            Add Task
          </DropdownMenuItem>
          <DropdownMenuItem>
            <IconPencil />
            Edit details
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem className={"text-destructive"}>
            <IconTrash />
            Delete Habit
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
