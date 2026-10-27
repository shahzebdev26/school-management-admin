export const adminKeys = {
  all: ['admins'] as const,
  lists: () => [...adminKeys.all, 'list'] as const,
  list: (params: unknown) => [...adminKeys.lists(), params] as const,
}
