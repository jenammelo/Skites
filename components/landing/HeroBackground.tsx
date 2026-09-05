import Image from "next/image";

export function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-20 isolate overflow-hidden bg-ink">
      <Image
        src="/hero-reception.jpg"
        alt=""
        fill
        priority
        fetchPriority="high"
        quality={70}
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-black/0" />
    </div>
  );
}