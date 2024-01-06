import { Link, useNavigate, useParams } from "react-router-dom";
import { DefterDb, Entity } from "../db";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { VList } from "virtua";
import { BsTelephoneOutbound, BsWhatsapp, CiUser, MdOutlineStickyNote2, MdOutlineTextsms } from "../icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"



import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button, buttonVariants } from "@/components/ui/button"
import { TrashIcon } from "@radix-ui/react-icons";

const db = new DefterDb();
export default function EntityDetail() {

  const [open, setOpen] = useState(false);

  const { entityId } = useParams();
  const navigate = useNavigate();
  const [removeRequested, setRemoveRequested] = useState(false);
  const [removeStarted, setRemoveStarted] = useState(false);

  const transactions = useLiveQuery(() => {
    if (
      entityId &&
      typeof entityId === "string" &&
      !Number.isNaN(parseInt(entityId))
    ) {
      return db.transactions
        .where("customerId")
        .equals(parseInt(entityId) ?? -1)
        .reverse()
        .sortBy("date");
    }
    return [];
  }, []);
  const [entity, setEntity] = useState(undefined as Entity | undefined);
  useEffect(() => {
    if (
      entityId &&
      typeof entityId === "string" &&
      !Number.isNaN(parseInt(entityId))
    ) {
      db.entities.get(parseInt(entityId)).then((rec) => {
        if (rec) {
          setEntity(rec);
        } else {
          navigate(`/entities`);
        }
      });
    } else {
      navigate(`/entities`);
    }
  }, [entityId]);

  const totalCredit = transactions
    ?.filter((c) => getType(c.type) == "c")
    .reduce(function (a, b) {
      return a + b.amount;
    }, 0);
  const totalDebit = transactions
    ?.filter((c) => getType(c.type) == "d")
    .reduce(function (a, b) {
      return a + b.amount;
    }, 0);
  const balance = (totalCredit ?? 0) - (totalDebit ?? 0);
  const normalizedPhoneNumber = normalizePhoneNumber(entity?.phoneNumber ?? "");
  const phoneNumberIsInvalid = normalizedPhoneNumber == "invalid";
  function handleRemove() {
    setRemoveStarted(true);
    proceedRemove().then(() => {
      navigate(`/entities`);
    });
  }
  async function proceedRemove() {
    await db.transactions.bulkDelete(
      transactions?.map((t) => t.id ?? -1) ?? []
    );
    await db.entities.delete(entity?.id ?? -1);
  }
  const status =
    balance > 0 ? `${entity?.name} isimli kişinin ${balance} tl alacağı var` :
      balance == 0 ? `${entity?.name} isimli kişinin borcu yoktur` :
        `${entity?.name} isimli kişinin ${balance * -1} tl borcu var`

  const msg =
    balance > 0 ? `Alacağınız%20${balance}%20tl` :
      balance == 0 ? `Borcunuz%20yoktur` :
        `Borcunuz%20${balance * -1}%20tl`

  return (
    <div className="w-full">

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Emin misiniz?</DialogTitle>
            <DialogDescription>Kişi ve kişi ile alakalı bilgiler silinecektir.Bu işlem geri alınamaz.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <div className="flex justify-between items-center flex-1">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Vazgeç
                </Button>
              </DialogClose>
              <DialogClose asChild>
                <Button type="button" onClick={handleRemove} variant="destructive">
                  Kişiyi Sil
                </Button>
              </DialogClose>

            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{entity?.name}</CardTitle>
              <CardDescription>
                {entity?.note}
                <br />
                {entity?.phoneNumber}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button>İşlemler</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {phoneNumberIsInvalid ? (
                  <DropdownMenuItem disabled>
                    Hatalı telefon numarası
                  </DropdownMenuItem>
                )
                  : (
                    <>
                      <DropdownMenuItem>
                        <a
                          className="flex items-center gap-1"
                          href={`tel:${normalizedPhoneNumber}`}>
                          <BsTelephoneOutbound />
                          Arama yap
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <a
                          target="_blank"
                          className="flex items-center gap-1"
                          href={`sms:${normalizedPhoneNumber}&body=${msg}`}
                        >
                          <MdOutlineTextsms /> Kısa mesaj
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <a
                          target="_blank"
                          className="flex items-center gap-1"
                          href={`https://wa.me/${normalizedPhoneNumber}?text=${msg}`}
                        >
                          <BsWhatsapp /> Whatsapp
                        </a>
                      </DropdownMenuItem>
                    </>
                  )
                }
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => { setOpen(true) }}>
                  <TrashIcon />
                  Kişiyi Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {status}
        </CardContent>
        <CardFooter className="flex justify-between">

          <Link
            to={`/entities/${entityId}/new`}
            className={buttonVariants()}
          >
            Yeni işlem ekle
          </Link>
          <Link
            to={`/entities`}
            className={buttonVariants({ variant: 'outline' })}
          >
            Geri
          </Link>

        </CardFooter>
      </Card>

      <div className="flex-1">
        <span className="text-center w-full block p-1 mt-1 border-t-2 border-b-2 border-white">
          Detaylar
        </span>
        <VList style={{ height: "50vh" }}>
          {transactions?.map((t) => {
            const ttype = getType(t.type);
            const debit = ttype == "d";
            const credit = ttype == "c";
            const error = !debit && !credit;
            if (error) {
              console.log("error on transaction type for :", t.id);
            }
            return (
              <Link
                key={t.id}
                to={`/entities/${entityId}/${t.id}`}
                className="w-full block "
              >
                <Row
                  label={t.date}
                  desc={t.note}
                  debit={debit ? t.amount : undefined}
                  credit={credit ? t.amount : undefined}
                />
              </Link>
            );
          })}
        </VList>
      </div>
    </div>
  );
}

type RowProps = {
  label: string | Date;
  desc: string | undefined;
  debit: number | undefined;
  credit: number | undefined;
};
function Row({ label, desc, debit, credit }: RowProps) {
  const lblStr = typeof label === "string" ? label : getLocaleDate(label);
  return (
    <div className="p-2 flex text-white  border-b-2 rounded-sm justify-between">
      <div className="w-1/2 md:w-1/3">
        <span>{lblStr}</span>
      </div>
      <div className="hidden md:block md:w-1/3">
        <span>{desc}</span>
      </div>
      <div className="w-1/2 md:w-1/3 flex justify-between">
        <div className="w-1/2 font-bold">
          {debit && (
            <span style={{ color: "#F31559", textAlign: "start" }}>
              {debit} tl
            </span>
          )}
        </div>
        <div className="w-1/2 font-bold">
          {credit && (
            <span style={{ color: "#A8DF8E", textAlign: "end" }}>
              {credit} tl
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizePhoneNumber(phoneNumber: string) {
  phoneNumber = phoneNumber.replaceAll(/\s/g, "");
  if (phoneNumber.startsWith("+9")) {
    phoneNumber = phoneNumber.replace(/\+/, "");
  } else if (phoneNumber.startsWith("0090")) {
    phoneNumber = phoneNumber.replace(/0090/, "90");
  } else if (phoneNumber.startsWith("5")) {
    phoneNumber = "90" + phoneNumber;
  } else {
    phoneNumber = "invalid";
  }

  if (phoneNumber.length < 10) {
    phoneNumber = "invalid";
  }

  return phoneNumber;
}
function getType(tType: string) {
  switch (tType.toLowerCase()) {
    case "a":
    case "alacak":
    case "c":
    case "credit":
      return "c";

    case "b":
    case "borc":
    case "d":
    case "debit":
      return "d";
  }
  return "";
}
function getLocaleDate(ms: Date | undefined) {
  return ms?.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    // dateStyle:'long'
  });
}
