export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-20 overflow-hidden bg-ink">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/hero-reception.jpg')" }}
      />
      {/* Lighter overlay — enough for white text to stay readable without
          crushing the photo down to near-black */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/0" />
    </div>
  );
}