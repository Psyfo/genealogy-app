import { NdebeleBand } from './ndebele-band';

export function SiteFooter() {
  return (
    <footer className="mt-24">
      <NdebeleBand height={10} offset={2} />
      <div className="border-t-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="font-display text-base font-bold uppercase tracking-tight text-ink">
            Mahlangu
          </p>
          <p className="max-w-md text-pretty">
            A living record of the family, drawn in the geometry of Ndebele art.
            The names shown are illustrative sample data — replace them with your own.
          </p>
        </div>
      </div>
    </footer>
  );
}
