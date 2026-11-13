import type { ElementDetails } from '../../../shared/messaging/contracts';

const MAX_VALUE_LENGTH = 160;
const EXPOSED_ATTRIBUTES = new Set(['name', 'role', 'type', 'title', 'alt', 'for', 'href']);

export function extractElementDetails(element: Element): ElementDetails {
  const dataAttributes: Record<string, string> = {};
  const ariaAttributes: Record<string, string> = {};
  const attributes: Record<string, string> = {};

  for (const attribute of Array.from(element.attributes)) {
    const name = attribute.name.toLowerCase();
    if (name === 'id' || name === 'class' || name === 'value') continue;
    if (name.startsWith('data-')) dataAttributes[name] = limit(attribute.value);
    else if (name.startsWith('aria-')) ariaAttributes[name] = limit(attribute.value);
    else if (EXPOSED_ATTRIBUTES.has(name)) attributes[name] = limit(attribute.value);
  }

  return {
    id: element.id ? limit(element.id) : null,
    classes: Array.from(element.classList).slice(0, 30).map(limit),
    dataAttributes,
    ariaAttributes,
    attributes,
  };
}

function limit(value: string): string {
  return value.length > MAX_VALUE_LENGTH ? `${value.slice(0, MAX_VALUE_LENGTH - 1)}…` : value;
}
