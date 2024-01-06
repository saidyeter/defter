import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { DefterDb } from "../db";
import { Link } from "react-router-dom";
import { VList } from "virtua";
import { Input } from "@/components/ui/input";
import { buttonVariants } from "@/components/ui/button";
import { PersonIcon } from "@radix-ui/react-icons"


const db = new DefterDb();

function Entities() {
  const [searchKey, setSarchKey] = useState("");
  const entities = useLiveQuery(
    () =>
      db.entities
        .where("name")
        .startsWith(searchKey)
        .or("phoneNumber")
        .startsWith(searchKey)
        .toArray(),
    [searchKey]
  );

  return (
    <div className="w-full container">
      <Link
        to="/entities/new"
        className={buttonVariants({ variant: 'default', })}
      >
        Yeni Ekle
      </Link>
      <Input
        className="placeholder:text-muted mb-2"
        placeholder="Kişi Ara"
        onChange={(e) => setSarchKey(e.target.value.toString())}
      />

      <VList style={{ height: "60vh" }}>
        {entities ? (
          entities.map((c) => (
            <div
              key={c.id}
              className="mb-2 flex items-center space-x-4 rounded-md border p-4"
            >
              <PersonIcon />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">
                  {c.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {c.phoneNumber}
                </p>
              </div>
              <Link
                to={`/entities/${c.id}`}
                className={buttonVariants({ variant: 'default', })}
              >
                Detay
              </Link>
            </div>
          ))
        ) : (
          <>loading</>
        )}
      </VList>
    </div>
  );
}

export default Entities;
