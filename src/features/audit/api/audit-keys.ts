export const auditKeys = {
  all: ['audit-logs'] as const,
  lists: () => [...auditKeys.all, 'list'] as const,
  list: (params: unknown) => [...auditKeys.lists(), params] as const,
}
