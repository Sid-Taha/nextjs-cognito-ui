"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  useRouter().push("/sign-in")

  return (
    <>
    </>
  );
}
