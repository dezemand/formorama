export function isFormParentOf(parent: string | null, child: string | null): boolean {
  return child !== null && (parent === null || child.startsWith(parent));
}
