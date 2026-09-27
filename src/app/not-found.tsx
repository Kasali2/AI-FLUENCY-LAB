import { ButtonLink } from "@/components/ui/Button";
import { Card, Pill } from "@/components/ui/Card";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl py-10">
      <Pill tone="amber">404</Pill>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-mist-100 text-balance">
        That page is not here
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-mist-300 text-pretty">
        The link may be out of date, or the activity may have been renamed.
      </p>

      <Card className="mt-6">
        <p className="text-sm text-mist-300">
          You could head back to the Lab, browse the learning modules, or start
          with the one-minute demo.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <ButtonLink href="/lab" size="md">
            Open the Lab
          </ButtonLink>
          <ButtonLink href="/learn" size="md" variant="secondary">
            Learning modules
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
