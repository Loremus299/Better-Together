import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  UseFormReturn,
} from "react-hook-form";
import { Field, FieldError, FieldLabel } from "./ui/field";

export default function FormController<
  T extends FieldValues,
  K extends Path<T>,
>({
  form,
  name,
  label,
  placeholder,
  render,
}: {
  form: UseFormReturn<T>;
  name: K;
  label: string;
  placeholder: string;
  render: (args: {
    fieldState: ControllerFieldState;
    field: ControllerRenderProps<T, K>;
    placeholder: string;
  }) => React.ReactNode;
}) {
  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
          {render({
            placeholder,
            field,
            fieldState,
          })}
          <FieldError errors={[fieldState.error]} />
        </Field>
      )}
    />
  );
}
