import { Link } from "react-router-dom";
import { HiUsers, HiUserPlus, MdRestore, LuDatabaseBackup } from "../icons";
import { buttonVariants } from "@/components/ui/button";
import { } from '@radix-ui/react-icons'

export default function Home() {
  return (
    <div className="flex flex-wrap gap-1">
      <Link
        to="/entities"
        className={buttonVariants({ variant: 'default', })}
      >
        <HiUsers />&nbsp;Kişiler
      </Link>
      <Link
        to="/entities/new"
        className={buttonVariants({ variant: 'default', })}
      >
        <HiUserPlus />&nbsp;Yeni Kişi Ekle
      </Link>
      <Link
        to="/restore"
        className={buttonVariants({ variant: 'default', })}
      >
        <MdRestore />&nbsp;Yedekten Yükle
      </Link>
      <Link
        to="/backup"
        className={buttonVariants({ variant: 'default', })}
      >
        <LuDatabaseBackup />&nbsp;Yedekle
      </Link>
    </div>
  );
}
