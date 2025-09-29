// Layout.tsx
import type { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="page">
      {/* <Navbar /> */}
      <main className="content">{children}</main>
      {/* <Footer /> */}
    </div>
  );
}
