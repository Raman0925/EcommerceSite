import Image from "next/image";
import Link from "next/link";
import Menu from "./menu";
import { APP_NAME } from "@/lib/constants";
import Search from "./search";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start gap-4 items-center">
          <Link href="/" className="flex-start">
            <Image
              priority={true}
              src="/images/logo.svg"
              width={48}
              height={48}
              alt={`${APP_NAME} logo`}
            />
            <span className="hidden lg:block font-bold text-2xl ml-3">
              {APP_NAME}
            </span>
          </Link>
          <div className="hidden md:block">
            <Search />
          </div>
        </div>
        <Menu />
      </div>
    </header>
  );
};

export default Header;
