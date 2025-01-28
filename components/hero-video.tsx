export function HeroVideo() {
  return (
    <section
      id="program-section"
      className="flex animate-fade-in flex-col gap-y-5 md:container"
    >
      <video id="video-background" autoPlay loop muted playsInline>
        <source
          src="/video/hero-vid.mp4"
          type="video/mp4"
          media="(min-width: 768px)"
        />
        <source src="/video/hero-vid.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
}
