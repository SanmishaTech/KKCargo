import { useForm, SubmitHandler, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Input } from "./custominput";
import { Button } from "@/components/ui/customButton";

type SchemaFieldType =
  | "email"
  | "string"
  | "number"
  | "date"
  | "boolean"
  | "array"
  | "object"
  | "any"
  | "unknown";

interface SchemaField {
  type: SchemaFieldType;
  required?: boolean;
  message?: string;
  shape?: CustomSchema;
  arrayType?: SchemaFieldType;
  className?: string;
  componentProps?: Record<string, any>;
  defaultValue?: Record<string, any>;
  validation?: {
    required?: boolean;
    message?: string;
    type?: SchemaFieldType;
  };
  onSubmit?: (data: Record<string, any> | undefined) => void;
}

interface CustomSchema {
  [key: string]: SchemaField;
}

const buildZodSchema = (schema: CustomSchema) => {
  const schemaObject: Record<string, any> = {};

  const zodTypeMapping: Record<string, any> = {
    email: () => z.string().email(),
    string: () => z.string(),
    number: () => z.number(),
    date: () => z.date(),
    boolean: () => z.boolean(),
    array: (type) =>
      type ? z.array(zodTypeMapping[type]()) : z.array(z.any()),
    object: (shape) => (shape ? z.object(buildZodSchema(shape)) : z.object({})),
    any: () => z.any(),
    unknown: () => z.unknown(),
  };

  Object.entries(schema).forEach(([key, value]) => {
    if (zodTypeMapping[value.type]) {
      let zodType;
      if (value.type === "array" && value.arrayType) {
        zodType = zodTypeMapping.array(value.arrayType);
      } else if (value.type === "object" && value.shape) {
        zodType = zodTypeMapping.object(value.shape);
      } else {
        zodType = zodTypeMapping[value.type];
      }
      console.log(value.message);
      schemaObject[key] = value.required
        ? zodType().min(1, value.message ?? "This field is required")
        : zodType().optional();
    } else {
      console.warn(`Unknown type: ${value.type} for key ${key}.`);
    }
  });

  return z.object(schemaObject);
};

// Main component
const UseFormHook = <T extends z.ZodTypeAny>(schema: CustomSchema) => {
  const zodSchema = buildZodSchema(schema.schema);
  console.log("This is the default values", schema.defaultValues);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<T>({
    resolver: zodResolver(zodSchema),
    defaultValues: schema.defaultValues,
  });
  const onSubmit: SubmitHandler<T> = (data) => {
    console.log(data);
    // Optionally handle onSubmit data here
  };

  const Submit = schema.onSubmit ?? onSubmit;
  const password = "password";
  function capitalizeFirstLetter(str) {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  return (
    <form onSubmit={handleSubmit(Submit)}>
      <div className="flex flex-col gap-2">
        {Object.entries(schema.schema).map(([key, value]) => (
          <div key={key} className="flex min-h-[80px] flex-col items-start">
            <label htmlFor={key} className="text-sm font-bold mb-1">
              {capitalizeFirstLetter(key)}
            </label>

            <Controller
              name={key as any}
              control={control}
              render={({ field }) => (
                <Input
                  type={value.componentProps?.type}
                  placeholder={value.componentProps?.placeholder}
                  className={
                    errors[`${key}`]?.message
                      ? `border-red-500 border-2`
                      : value.className
                  }
                  {...field}
                  // {...value.componentProps}
                />
              )}
            />
            {console.log(errors[`${key}`]?.message)}
            {errors[key] && (
              <span className="text-red-500 text-xs mt-1 h-1">
                {(errors[key] as any)?.message}
              </span>
            )}
          </div>
        ))}
      </div>
      <Button
        className="w-full flex gap-2 justify-center items-center"
        type="submit"
        variant="outline"
      >
        Submit
      </Button>
    </form>
  );
};

export { UseFormHook };
