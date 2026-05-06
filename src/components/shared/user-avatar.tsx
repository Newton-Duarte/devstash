import Image from "next/image";

import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string | null;
  email: string | null;
  image: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-base",
};

function getAvatarInitials(name: string | null, email: string | null) {
  const normalizedName = name?.trim();

  if (normalizedName) {
    return normalizedName
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const emailName = email?.split("@")[0]?.trim();

  return emailName?.slice(0, 2).toUpperCase() || "DS";
}

export function UserAvatar({
  name,
  email,
  image,
  size = "md",
  className,
}: UserAvatarProps) {
  const label = name?.trim() || email || "User";

  return (
    <div
      aria-label={label}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#e5e7eb] font-semibold text-slate-900",
        sizeClasses[size],
        className
      )}
    >
      {image ? (
        <Image
          alt={label}
          className="object-cover"
          fill
          sizes={size === "lg" ? "64px" : size === "md" ? "44px" : "36px"}
          src={image}
        />
      ) : (
        <span>{getAvatarInitials(name, email)}</span>
      )}
    </div>
  );
}
