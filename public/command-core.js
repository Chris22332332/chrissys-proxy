export function filterCommands(commands, query = '') {
  const q = String(query ?? '').trim().toLocaleLowerCase();
  if (!Array.isArray(commands)) return [];
  const safe = commands.filter((item) => item && typeof item.id === 'string' && typeof item.label === 'string');
  if (!q) return safe;
  return safe.filter((item) => `${item.label} ${item.detail || ''} ${item.keywords || ''}`.toLocaleLowerCase().includes(q));
}
