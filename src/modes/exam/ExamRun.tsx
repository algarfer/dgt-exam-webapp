import { useMemo, useState } from "react";
import { Link, type LoaderFunctionArgs, useLoaderData, useSearchParams } from "react-router";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { QuestionCard } from "@/components/QuestionCard";
import { ScoreSummary } from "@/components/ScoreSummary";
import { Stopwatch } from "@/components/Stopwatch";
import { Button } from "@/components/ui/Button";
import { Figure } from "@/components/ui/Figure";
import { examUrl, fetchExam, fetchManifest } from "@/data/repository";
import type { Exam } from "@/data/types";
import {
  ADVANCE_KEYS,
  ANSWER_KEYS,
  NEXT_KEYS,
  PREVIOUS_KEYS,
  useKeybinds,
} from "@/hooks/useKeybinds";
import { useRecordAnswer } from "@/hooks/useRecordAnswer";
import { useStopwatch } from "@/hooks/useStopwatch";
import { allowedErrors, hasPassed } from "@/lib/dgt-rules";
import { manifestId } from "@/lib/manifest-id";
import { prepareExam } from "@/lib/prepare";
import { randomSeed } from "@/lib/shuffle";
import { activeManifestUrl, useStore } from "@/store/store";

type ExamRunData = {
  exam: Exam;
  manifestUrl: string;
  examHref: string;
};

export async function examRunLoader({ params }: LoaderFunctionArgs): Promise<ExamRunData> {
  const manifestUrl = activeManifestUrl(useStore.getState());
  const manifest = await fetchManifest(manifestUrl);
  const number = Number(params.number);

  const entry = manifest.exams.find((candidate) => candidate.number === number);
  if (!entry) {
    throw new Response(`El examen ${params.number} no está en este manifiesto`, { status: 404 });
  }

  return {
    exam: await fetchExam(manifestUrl, entry.path),
    manifestUrl,
    examHref: examUrl(manifestId(manifestUrl), entry.path),
  };
}

export function ExamRun() {
  const { exam, manifestUrl, examHref } = useLoaderData() as ExamRunData;
  const [params] = useSearchParams();
  const studying = params.get("mode") !== "exam";

  const recordAnswer = useRecordAnswer();
  const recordAttempt = useStore((state) => state.recordAttempt);

  const [seed] = useState(randomSeed);
  const questions = useMemo(
    () => prepareExam(exam, { manifestId: manifestId(manifestUrl), examUrl: examHref }, seed),
    [exam, manifestUrl, examHref, seed],
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [askingSubmit, setAskingSubmit] = useState(false);

  const seconds = useStopwatch(!studying && !submitted);
  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const missing = questions.length - answeredCount;

  const selected = answers[index] ?? null;
  const revealed = studying ? selected !== null : submitted;

  const correctCount = questions.reduce(
    (total, candidate, position) =>
      answers[position] === candidate.correctIndex ? total + 1 : total,
    0,
  );

  const select = (answerIndex: number) => {
    if (revealed || !question) return;
    setAnswers((current) => ({ ...current, [index]: answerIndex }));

    if (studying) {
      recordAnswer(question, answerIndex === question.correctIndex);
    }
  };

  const finish = () => {
    setAskingSubmit(false);
    setSubmitted(true);

    for (const [position, candidate] of questions.entries()) {
      const given = answers[position];
      // An unanswered question counts as failed: it goes to the backlog too.
      recordAnswer(candidate, given === candidate.correctIndex);
    }

    recordAttempt(manifestId(manifestUrl), exam.number, {
      at: new Date().toISOString(),
      correct: correctCount,
      total: questions.length,
      seconds,
      passed: hasPassed(questions.length - correctCount, questions.length),
    });
  };

  const goNext = () => setIndex((current) => Math.min(current + 1, questions.length - 1));
  const goPrevious = () => setIndex((current) => Math.max(current - 1, 0));

  useKeybinds([
    ...ANSWER_KEYS.map((key, position) => ({
      keys: [key],
      // Bounded by the answers this question actually has.
      when: !revealed && position < (question?.answers.length ?? 0),
      run: () => select(position),
    })),
    {
      keys: ADVANCE_KEYS,
      when: !studying && !submitted,
      run: () => (missing > 0 ? setAskingSubmit(true) : finish()),
    },
    { keys: ADVANCE_KEYS, run: goNext },
    { keys: NEXT_KEYS, run: goNext },
    { keys: PREVIOUS_KEYS, when: !studying, run: goPrevious },
  ]);

  if (!question) return null;

  return (
    <section className="pt-run">
      <div className="flex flex-wrap items-baseline justify-between gap-gap">
        <p className="text-xs uppercase tracking-[0.12em] text-[var(--ink-dim)]">
          {studying ? "Modo estudio" : "Modo examen"} · {exam.title}
        </p>
        <Link to="/exams" className="text-sm underline">
          Salir del test
        </Link>
      </div>

      {studying ? null : (
        <div className="mt-gap">
          <Stopwatch
            seconds={seconds}
            answered={answeredCount}
            total={questions.length}
            allowed={allowedErrors(questions.length)}
          />
        </div>
      )}

      {submitted ? (
        <div className="mt-interval">
          <ScoreSummary
            correct={correctCount}
            total={questions.length}
            seconds={seconds}
            passed={hasPassed(questions.length - correctCount, questions.length)}
          />
        </div>
      ) : null}

      <div className="mt-run">
        <QuestionCard
          question={question}
          selected={selected}
          revealed={revealed}
          onSelect={select}
          position={`Pregunta ${index + 1} de ${questions.length}`}
        />
      </div>

      <nav className="mt-run flex flex-wrap items-center gap-gap border-t border-[var(--seam-color)] pt-gap">
        <Button variant="secondary" onClick={goPrevious} disabled={index === 0}>
          Anterior
        </Button>

        <Button onClick={goNext} disabled={index >= questions.length - 1}>
          Siguiente
        </Button>

        {!studying && !submitted ? (
          <Button
            variant="secondary"
            onClick={() => (missing > 0 ? setAskingSubmit(true) : finish())}
          >
            Enviar
          </Button>
        ) : null}

        <span className="ms-auto text-sm text-[var(--ink-dim)]">
          <Figure>
            {index + 1}/{questions.length}
          </Figure>
        </span>
      </nav>

      <ConfirmDialog
        open={askingSubmit}
        title="Te quedan preguntas sin responder"
        body={`Hay ${missing} ${missing === 1 ? "pregunta" : "preguntas"} sin responder de ${questions.length}. Si entregas ahora ${missing === 1 ? "contará" : "contarán"} como falladas.`}
        confirmLabel="Enviar de todas formas"
        cancelLabel="Seguir respondiendo"
        onConfirm={finish}
        onCancel={() => setAskingSubmit(false)}
      />
    </section>
  );
}
