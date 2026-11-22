import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#components/ui/select";
import { useGroupGetManyQuery } from "../group-api";

interface Props {
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

/// Group picker with a "no group" option, represented by the empty string.
export default function GroupSelect({
  value,
  onValueChange,
  placeholder = "انتخاب گروه",
  disabled,
  id,
}: Props) {
  const { data: groupsRes } = useGroupGetManyQuery({ pageSize: 1000 });
  const groups = groupsRes?.items ?? [];

  return (
    <Select value={value ?? ""} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">بدون گروه</SelectItem>
        {groups.map((group) => (
          <SelectItem key={group.id} value={String(group.id)}>
            {group.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
