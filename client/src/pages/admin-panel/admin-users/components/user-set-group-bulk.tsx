import { useState } from "react";
import { Modal } from "#components/modals/modal";
import { Button } from "#components/ui/button";
import { Field, FieldLabel } from "#components/ui/field";
import { cn } from "#lib/utils";
import GroupSelect from "../../../../features/group/components/group-select";
import { useUserSetGroupBulkMutation } from "../../../../features/user/user-api";

interface Props {
  userIds: number[];
  onClose: () => void;
}

export default function UserSetGroupBulk({ userIds, onClose }: Props) {
  const [groupId, setGroupId] = useState<string | null>("");
  const [mutate, { isLoading }] = useUserSetGroupBulkMutation();

  const handleSubmit = async () => {
    const res = await mutate({ userIds, groupId: groupId ? Number(groupId) : null });
    if (!res.error) onClose();
  };

  return (
    <Modal open={userIds.length > 0} onOpenChange={(open) => !open && onClose()} title="تغییر گروه کاربران">
      <div className={cn("flex flex-col gap-4 py-4 px-[40px]")}>
        <Field>
          <FieldLabel htmlFor="bulk-group">گروه جدید</FieldLabel>
          <GroupSelect id="bulk-group" value={groupId} onValueChange={setGroupId} />
          <p className="text-xs text-gray-500">
            {userIds.length} کاربر انتخاب شده اند. انتخاب «بدون گروه» محدودیت گروهی را از آن ها برمیدارد.
          </p>
        </Field>

        <div className={cn("flex justify-end gap-1 pt-2")}>
          <Button variant="primary" size="lg" isLoading={isLoading} onClick={handleSubmit} className="rounded-[24px] min-w-[75px]">
            تایید
          </Button>
          <Button variant="secondary" size="lg" onClick={onClose} className="rounded-[24px] min-w-[75px]">
            انصراف
          </Button>
        </div>
      </div>
    </Modal>
  );
}
