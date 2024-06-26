import { Link, useNavigate, useParams } from "react-router-dom";
import { DefterDb, Entity, Transaction } from "../db";
import { useEffect, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { BsTelephoneOutbound, BsWhatsapp, MdOutlineTextsms } from "../icons";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Button, buttonVariants } from "@/components/ui/button"
import { TrashIcon } from "@radix-ui/react-icons";
import { round } from "@/lib/utils";

const db = new DefterDb();

export default function EntityDetail() {

  const [open, setOpen] = useState(false);

  const { entityId } = useParams();
  const navigate = useNavigate();

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

  const balance = round((totalCredit ?? 0) - (totalDebit ?? 0), 2);
  const normalizedPhoneNumber = normalizePhoneNumber(entity?.phoneNumber ?? "");
  const phoneNumberIsInvalid = normalizedPhoneNumber == "invalid";
  function handleRemove() {
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
              <DropdownMenuTrigger className={buttonVariants()}>
                İşlemler
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
                {balance < 0 ?
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Link
                        className="flex items-center gap-1"
                        to={`/entities/${entityId}/clear/${getAmountToClear(balance)}`}>
                        Borç kapama
                      </Link>
                    </DropdownMenuItem>
                  </>
                  : <></>
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
          <Status entityName={entity?.name ?? ''} balance={balance} />
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
        <span className="text-center w-full block p-1 mt-1 ">
          Detaylar
        </span>
        {(transactions && transactions.length > 0) ?
          transactions.map((t) => <Row key={t.id} entityId={entityId} t={t} />)
          : <>Hiç işlem yok</>}
      </div>
    </div>
  );
}

function getAmountToClear(balance: number) {
  const integerPart = Math.ceil(balance);
  let fraction = round(balance - integerPart, 2) * -1;
  while (fraction - Math.floor(fraction) > 0) {
    fraction *= 10
  }

  const amountToClear = `${integerPart * -1}_${fraction}`
  return amountToClear
}

interface StatusProps {
  balance: number,
  entityName: string
}

function Status({ balance, entityName }: StatusProps) {

  const positive = `${entityName} isimli kişinin ${balance} tl alacağı var`
  const noutral = `${entityName} isimli kişinin borcu yoktur`
  const negative = `${entityName} isimli kişinin ${balance * -1} tl borcu var`

  return (
    <div className="flex justify-center items-center">
      {(balance < 1 && balance > -1) ?
        <span className="text-muted-foreground bg-muted p-2 border-2 rounded-lg">{noutral}</span>
        : balance > 0 ?
          <span className="border-2 rounded-lg p-2" >{positive}</span>
          : <span className="text-destructive-foreground bg-destructive p-2 rounded">{negative}</span>
      }
    </div>
  )

}


interface RowProps {
  t: Transaction,
  entityId: string | undefined
}

function Row({ t, entityId }: RowProps) {
  const lblStr = typeof t.date === "string" ? t.date : getLocaleDate(t.date);

  const ttype = getType(t.type);
  const debit = ttype == "d";
  const credit = ttype == "c";
  const error = !debit && !credit;

  if (error) {
    console.log("error on transaction type for :", t.id);
  }

  const amountInfo = (<span className="w-full" style={{ color: debit ? "#F31559" : credit ? "#A8DF8E" : "hsl(var(--primary))" }}>
    {t.amount} tl
  </span>)

  return (
    <div className="mb-2 flex items-center justify-between rounded-md border p-4">
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">
          {lblStr}
        </p>
        <p className="text-sm text-muted-foreground">
          {t.note}
        </p>
        <p className="md:hidden">
          {amountInfo}
        </p>
      </div>
      <div className="hidden md:block">
        {amountInfo}
      </div>
      <div>
        <Link
          to={`/entities/${entityId}/${t.id}`}
          className={buttonVariants({ variant: 'default', })}
        >
          Detay
        </Link>
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