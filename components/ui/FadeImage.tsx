import Image from "next/image";

type FadeImageProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
};

export function FadeImage({
  src,
  alt,
  className = "",
  imageClassName = "",
  priority = false,
}: FadeImageProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-[48px] border border-white/10 bg-white/[0.035] ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={`object-cover grayscale transition duration-700 hover:scale-105 hover:grayscale-0 ${imageClassName}`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#030608]/75 via-transparent to-transparent" />
    </div>
  );
}