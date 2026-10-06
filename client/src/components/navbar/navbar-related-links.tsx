import { Modal } from "#components/modals/modal";
import { useLinksGetManyQuery } from "../../features/link/link-api";
import { ExternalLink, Link2 } from "lucide-react";
import { cn } from "#lib/utils";

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => any;
}

export default function NavbarRelatedLinks({ isOpen, setIsOpen }: Props) {
  const { data: links, isLoading } = useLinksGetManyQuery(undefined, {
    skip: !isOpen,
  });

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen} title="لینک‌های مرتبط">
      <div className={cn("flex flex-col gap-2 py-4 px-[40px] min-h-40")}>
        {isLoading ? (
          <p className="text-sm text-content-tertiary py-8 text-center">
            در حال بارگذاری...
          </p>
        ) : links && links.length > 0 ? (
          links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex items-start gap-3 rounded-xl border border-neutral-100 bg-white p-3",
                "transition-colors hover:border-primary-500/50 hover:bg-primary-500/5",
              )}
            >
              <div className="mt-0.5 shrink-0 rounded-lg bg-primary-500/10 p-2">
                <Link2 className="size-4 text-primary-600" />
              </div>

              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="flex items-center gap-1.5 truncate text-sm font-medium text-content-primary group-hover:text-primary">
                  {link.title || link.url}
                  <ExternalLink className="size-3.5 shrink-0 text-content-tertiary" />
                </span>

                {link.description && (
                  <span className="text-xs leading-relaxed text-content-tertiary">
                    {link.description}
                  </span>
                )}
              </div>
            </a>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center text-content-tertiary">
            <Link2 className="size-10 mb-2 opacity-50" />
            <span className="text-sm">لینکی ثبت نشده است.</span>
          </div>
        )}
      </div>
    </Modal>
  );
}