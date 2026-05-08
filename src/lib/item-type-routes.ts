const TYPE_ROUTE_SEGMENTS: Record<string, string> = {
  snippet: "snippets",
  prompt: "prompts",
  command: "commands",
  note: "notes",
  file: "files",
  image: "images",
  link: "links",
};

const TYPE_ROUTE_NAMES = Object.fromEntries(
  Object.entries(TYPE_ROUTE_SEGMENTS).map(([name, segment]) => [segment, name])
);

export const ITEM_TYPE_DISPLAY_ORDER = Object.keys(TYPE_ROUTE_SEGMENTS);

export function getItemTypeRouteSegment(name: string) {
  return TYPE_ROUTE_SEGMENTS[name] ?? `${name}s`;
}

export function getItemTypeNameFromRouteSegment(segment: string) {
  return TYPE_ROUTE_NAMES[segment] ?? null;
}

export function getItemTypePluralLabel(name: string) {
  const segment = getItemTypeRouteSegment(name);
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}
