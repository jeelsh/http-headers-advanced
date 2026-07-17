import { cn } from "@/lib/utils";

export default function DashedLine({
  position = "bottom",
  className,
  assetBaseUrl,
  isDark = false,
  ...props
}) {
  const image = isDark
    ? `${assetBaseUrl}/assets/images/dashed-horizontal-dark.svg`
    : `${assetBaseUrl}/assets/images/dashed-horizontal-light.svg`;

  return (
    <div
      className={cn("w-full h-[1px]", className)}
      style={{
        backgroundImage: `url(${image})`,
        backgroundRepeat: "repeat-x",
        backgroundPosition: position === "top" ? "0 0" : "0 100%",
      }}
      {...props}
    />
  );
}
