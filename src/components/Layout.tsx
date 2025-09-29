// Layout.tsx
import type { PropsWithChildren } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="page">
      {/* <Navbar /> */}
      <main className="content">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
