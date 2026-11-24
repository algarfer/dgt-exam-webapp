import { Link } from "react-router";
import { Figure } from "@/components/ui/Figure";
import { Heading } from "@/components/ui/Heading";

export function NotFound() {
  return (
    <section className="py-run">
      <Figure size="lead" className="block text-temporary">
        404
      </Figure>
      <Heading className="mt-gap">Esta página no existe</Heading>
      <p className="mt-gap max-w-[65ch] text-[var(--ink-dim)]">Ups, no hay nada que ver aquí.</p>
      <Link to="/" className="mt-interval inline-block underline">
        Volver al inicio
      </Link>
    </section>
  );
}
