// schema-loader.ts
import appSchema from "./schemas/app-schema.json";

export async function loadPageSchema(pageKey: string): Promise<any | null> {
  const pageEntry = appSchema.pages.find((p: any) => p.path.includes(pageKey));

  if (!pageEntry) return null;

  if (pageEntry.src) {
    // Dynamic import of external JSON schema
    const external = await import(`./schemas/${pageEntry.src}`);
    return external.default.pages?.[0] || external.default;
  }

  return pageEntry;
}

export function listAllPages(): any[] {
  return appSchema.pages.map((p) => ({
    path: p.path,
    title: p.title,
    src: p.src || null
  }));
}
