import { Outlet, Link } from "react-router-dom";
import { MdMenuBook } from "../icons";
import { ModeToggle } from "@/components/mode-toggle";

export default function Layout() {
  return (
    <main className="container flex flex-col flex-1">
      <div className="flex justify-between items-center my-2">
        <Link
          to="/"
          className="text-2xl p-2 font-semibold text-center flex items-center justify-center"
        >
          DEFTER &nbsp;
          <MdMenuBook />
        </Link>
        <ModeToggle />

      </div>
      <Outlet />
    </main>
  );
}
