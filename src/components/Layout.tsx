import React from "react";
import Header from "./Header";

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  return (
    <div>
      <Header />
      <main className="max-w-4xl mx-auto mt-6 px-4">{children}</main>
    </div>
  );
};

export default Layout;
