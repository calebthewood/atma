export const SectionHeader = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => {
  return (
    <>
      <p className="w-full text-center text-xs font-semibold uppercase tracking-widest text-foreground/70">
        {subtitle}
      </p>
      <h2 className="mb-5 w-full text-center text-4xl font-semibold capitalize">
        {title}
      </h2>
    </>
  );
};
