import { useState } from "react";

export function useSelection<T, K = number>(items: T[], getId: (t: T) => K) {
  const [active, setActive] = useState(false);
  const [ids, setIds] = useState<Set<K>>(new Set());

  const allIds = items.map(getId);
  const all = allIds.length > 0 && allIds.every((id) => ids.has(id));

  function toggle(id: K) {
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setIds(all ? new Set() : new Set(allIds));
  }

  function start() {
    setActive(true);
    setIds(new Set());
  }

  function cancel() {
    setActive(false);
    setIds(new Set());
  }

  const selected = items.filter((i) => ids.has(getId(i)));

  return {
    active,
    ids,
    all,
    count: ids.size,
    toggle,
    toggleAll,
    start,
    cancel,
    selected,
  };
}
