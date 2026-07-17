import { cn } from "@/lib/utils";

export default function DashedColumn({
  position = "right",
  className,
  assetBaseUrl,
  isDark = false,
  ...props
}) {
  const image = isDark
    ? `${assetBaseUrl}/assets/images/dashed-vertical-dark.svg`
    : `${assetBaseUrl}/assets/images/dashed-vertical-light.svg`;

  return (
    <div
      className={cn("w-[1px] h-full", className)}
      style={{
        backgroundImage: `url(${image})`,
        backgroundRepeat: "repeat-y",
        backgroundPosition: position === "left" ? "0 0" : "100% 0",
      }}
      {...props}
    />
  );
}
