import { Draft07, draft07Config, JsonValidator } from "json-schema-library";

export const getTemplate = (schema: Record<string, any>, data = {}) => {
    const copy = JSON.parse(JSON.stringify(schema));
    if (!copy.type) copy.type = "object"; // Default
    const jsonSchema = new Draft07(copy);
    return jsonSchema.getTemplate(data);
}

export const resolveSchema = (
    schema: Record<string, any>,
    data: Record<string, any>
) => {
    const copy = JSON.parse(JSON.stringify(schema));
    if (!copy.type) copy.type = "object"; // Default

    const jsonSchema = new Draft07({ type: "array", items: copy });
  
    const resolved = jsonSchema.getSchema({
      pointer: "/0",
      data: [ data ],
    });
  
    return resolved
};