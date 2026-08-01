"use client";

import { useEffect, useState } from "react";
import { PageShell } from "@/components/ui/page-shell";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { AddButton } from "@/components/ui/button";
import { ExportButton } from "@/components/ui/export-button";
import { cx, initials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ProcessModal } from "@/components/entity-modals";
import { type Column, type PipelineCard } from "@/lib/data";
import { downloadExcel } from "@/lib/export";
import { api } from "@/lib/api-client";

type DropTarget = { stage: string; beforeId: number | null };

export default function PipelinePage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [dragged, setDragged] = useState<{ id: number; from: string } | null>(
    null,
  );
  const [drop, setDrop] = useState<DropTarget | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<{
    card: PipelineCard;
    stage: string;
  } | null>(null);

  useEffect(() => {
    api
      .get<Column[]>("/api/pipeline")
      .then(setColumns)
      .finally(() => setLoading(false));
  }, []);

  const stages = columns.map((c) => c.stage);
  const q = query.trim().toLowerCase();
  const visibleColumns = q
    ? columns.map((c) => ({
        ...c,
        cards: c.cards.filter((x) =>
          [x.name, x.job, x.company].some((v) => v.toLowerCase().includes(q)),
        ),
      }))
    : columns;

  function reset() {
    setDragged(null);
    setDrop(null);
  }

  function persist(cols: Column[], affectedStages: string[]) {
    const affected = cols.filter((c) => affectedStages.includes(c.stage));
    void Promise.all(
      affected.flatMap((col) =>
        col.cards.map((card, i) =>
          api.put(`/api/pipeline/${card.id}`, {
            stage: col.stage,
            position: i,
          }),
        ),
      ),
    );
  }

  function moveCard() {
    if (!dragged || !drop) return reset();

    let card: PipelineCard | undefined;
    const without = columns.map((col) => {
      const idx = col.cards.findIndex((c) => c.id === dragged.id);
      if (idx === -1) return col;
      card = col.cards[idx];
      return { ...col, cards: col.cards.filter((c) => c.id !== dragged.id) };
    });
    if (!card) return reset();

    const moved = card;
    const next = without.map((col) => {
      if (col.stage !== drop.stage) return col;
      const cards = [...col.cards];
      const at =
        drop.beforeId == null
          ? cards.length
          : cards.findIndex((c) => c.id === drop.beforeId);
      cards.splice(at === -1 ? cards.length : at, 0, moved);
      return { ...col, cards };
    });

    setColumns(next);
    persist(next, [...new Set([dragged.from, drop.stage])]);
    reset();
  }

  async function save(card: PipelineCard, stage: string) {
    if (card.id === 0) {
      await api.post("/api/pipeline", {
        name: card.name,
        job: card.job,
        company: card.company,
        stage,
      });
    } else {
      await api.put(`/api/pipeline/${card.id}`, {
        name: card.name,
        job: card.job,
        company: card.company,
        stage,
      });
    }
    const cols = await api.get<Column[]>("/api/pipeline");
    setColumns(cols);
  }

  function exportAll() {
    downloadExcel(
      "processos",
      [
        { key: "name", label: "Candidato" },
        { key: "job", label: "Vaga" },
        { key: "company", label: "Empresa" },
        { key: "stage", label: "Etapa" },
      ],
      columns.flatMap((c) =>
        c.cards.map((x) => ({
          name: x.name,
          job: x.job,
          company: x.company,
          stage: c.stage,
        })),
      ),
    );
  }

  return (
    <PageShell
      action={
        <>
          <ExportButton onClick={exportAll} />
          <AddButton onClick={() => setAddOpen(true)}>Novo processo</AddButton>
        </>
      }
      searchPlaceholder="Buscar processos..."
      searchValue={query}
      onSearchChange={setQuery}
    >
      {loading ? (
        <div className="scroll-thin flex gap-2.5 overflow-x-auto pb-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex min-w-56 flex-1 flex-col gap-2.5 rounded-lg border border-border bg-surface p-2.5"
            >
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-6" />
              </div>
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="flex flex-col gap-2.5 rounded-lg border border-border bg-surface-2 p-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="scroll-thin flex gap-2.5 overflow-x-auto pb-2.5">
          {visibleColumns.map((col) => (
            <Card key={col.stage} className="flex min-w-56 flex-1 flex-col">
              <CardHeader
                title={col.stage}
                action={
                  <span className="rounded-lg bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
                    {col.cards.length}
                  </span>
                }
              />
              <CardBody
                onDragOver={(e) => {
                  e.preventDefault();
                  setDrop({ stage: col.stage, beforeId: null });
                }}
                onDrop={moveCard}
                className="flex min-h-24 flex-1 flex-col gap-2.5"
              >
                {col.cards.map((c) => (
                  <div key={c.id}>
                    {drop?.stage === col.stage && drop.beforeId === c.id && (
                      <div className="mb-2.5 h-0.5 rounded-lg bg-foreground" />
                    )}
                    <div
                      draggable
                      onDragStart={() =>
                        setDragged({ id: c.id, from: col.stage })
                      }
                      onDragEnd={reset}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const rect = e.currentTarget.getBoundingClientRect();
                        const before = e.clientY < rect.top + rect.height / 2;
                        const idx = col.cards.findIndex((x) => x.id === c.id);
                        const beforeId = before
                          ? c.id
                          : (col.cards[idx + 1]?.id ?? null);
                        setDrop({ stage: col.stage, beforeId });
                      }}
                      onClick={() => setEditing({ card: c, stage: col.stage })}
                      className={cx(
                        "cursor-grab rounded-lg border border-border bg-surface-2 p-2.5 transition-colors hover:border-white/40 active:cursor-grabbing",
                        dragged?.id === c.id && "opacity-40",
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar>{initials(c.name)}</Avatar>
                        <p className="min-w-0 truncate text-sm font-medium text-foreground">
                          {c.name}
                        </p>
                      </div>
                      <p className="mt-2.5 text-xs text-foreground">{c.job}</p>
                      <p className="text-xs text-muted">{c.company}</p>
                    </div>
                  </div>
                ))}
                {drop?.stage === col.stage && drop.beforeId === null && (
                  <div className="h-0.5 rounded-lg bg-foreground" />
                )}
                {col.cards.length === 0 && !drop && (
                  <p className="flex flex-1 items-center justify-center py-2.5 text-center text-xs text-muted">
                    Solte um candidato aqui
                  </p>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      <ProcessModal
        key={addOpen ? "add-open" : "add-closed"}
        open={addOpen}
        stages={stages}
        onClose={() => setAddOpen(false)}
        onSave={save}
      />
      <ProcessModal
        key={editing?.card.id ?? "edit"}
        open={!!editing}
        card={editing?.card}
        currentStage={editing?.stage}
        stages={stages}
        onClose={() => setEditing(null)}
        onSave={save}
      />
    </PageShell>
  );
}
