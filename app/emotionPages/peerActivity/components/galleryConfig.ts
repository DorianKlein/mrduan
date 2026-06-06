import { StaticImageData } from "next/image";
import { images as folder1 } from "./1";
import { images as folder2 } from "./2";
import { images as folder3 } from "./3";
import { images as folder4 } from "./4";
import { images as folder5 } from "./5";
import { images as folder6 } from "./6";
import { images as folder7 } from "./7";
import { images as folder8 } from "./8";

export const galleryConfig: Record<number, (StaticImageData | string)[]> = {
  1: folder1,
  2: folder2,
  3: folder3,
  4: folder4,
  5: folder5,
  6: folder6,
  7: folder7,
  8: folder8,
};