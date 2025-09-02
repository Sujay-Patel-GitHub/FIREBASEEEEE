import { cn } from "@/lib/utils";
import Image from "next/image";
import type { ComponentProps } from 'react';

export function Logo(props: ComponentProps<"div">) {
  return (
    <div
      className={cn("relative", props.className)}
      {...props}
    >
      <Image
        src="https://i.ibb.co/BvzgcGf/Green-Simple-Nature-Beauty-Care-Initials-Logo.png"
        alt="HARITRAKSHAK Logo"
        width={200}
        height={200}
        priority
      />
    </div>
  );
}
