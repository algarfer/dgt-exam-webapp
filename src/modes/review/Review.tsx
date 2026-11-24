import { useMemo, useState } from "react";
import { Link } from "react-router";
import { QuestionCard } from "@/components/QuestionCard";
import { TurnControls } from "@/components/TurnControls";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";
import { useSingleTurn } from "@/hooks/useSingleTurn";
import { prepareSnapshot } from "@/lib/prepare";
import { randomSeed, shuffled } from "@/lib/shuffle";
import { useStore } from "@/store/store";

export function Review() {
  const failed = useStore((state) => state.failed);
  const setReveal = useStore((state) => state.setReveal);

  const [snapshots] = useState(() => ({ ...failed }));
  const [seed] = useState(randomSeed);
  const [queue, setQueue] = useState(() => shuffled(Object.keys(failed), seed));
  const [cleared, setCleared] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);

  const currentId = queue[0];
  const question = useMemo(() => {
    const entry = currentId ? snapshots[currentId] : undefined;
    return entry ? prepareSnapshot(entry, seed + turnIndex) : null;
  }, [currentId, snapshots, seed, turnIndex]);

  const turn = useSingleTurn(question, turnIndex);

  const advance = () => {
    if (!currentId) return;

    setTurnIndex((current) => current + 1);

    if (turn.revealed && turn.wasCorrect) {
      setQueue((current) => current.slice(1));
      setCleared((current) => current + 1);
      return;
    }

    setQueue((current) => (current.length > 1 ? [...current.slice(1), currentId] : current));
  };

  if (Object.keys(snapshots).length === 0) {
    return (
      <section className="py-run">
        <Heading>No tienes preguntas falladas</Heading>
        <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">
          Aquí aparecen las preguntas que falles en cualquier modo, y solo desaparecen cuando las
          aciertas.
        </p>
        <Link to="/exams" className="mt-interval inline-block underline">
          Ver los exámenes
        </Link>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="py-run">
        <Heading>Cola vacía</Heading>
        <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">
          Has acertado las <Figure>{cleared}</Figure> preguntas de la cola. Ya no te queda ninguna
          pendiente.
        </p>
        <Link to="/" className="mt-interval inline-block underline">
          Volver al inicio
        </Link>
      </section>
    );
  }

  return (
    <section className="pt-run">
      <div className="flex flex-wrap items-baseline justify-between gap-gap">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-dim)]">
          Repaso de preguntas
        </p>
        <p className="text-sm text-[var(--ink-dim)]">
          <Figure className="text-[var(--ink)]">{queue.length}</Figure> en cola ·{" "}
          <Figure className="text-[var(--ink)]">{cleared}</Figure> resueltas
        </p>
      </div>

      <div className="mt-run">
        <QuestionCard
          question={question}
          selected={turn.selected}
          revealed={turn.revealed}
          onSelect={turn.select}
        />
      </div>

      <TurnControls
        reveal={turn.reveal}
        revealed={turn.revealed}
        canSubmit={turn.selected !== null}
        onSubmit={turn.submit}
        onNext={advance}
        nextLabel={
          turn.revealed && !turn.wasCorrect ? "Siguiente, esta vuelve" : "Siguiente pregunta"
        }
        onToggleReveal={() => setReveal(turn.reveal === "select" ? "submit" : "select")}
      />
    </section>
  );
}
