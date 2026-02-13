import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PhoneIncoming, PhoneOutgoing } from "lucide-react";

const CallRow = React.memo(({ call, checked, onToggle }) => {
  return (
    <tr className="border-b last:border-0 hover:bg-muted/50 transition-colors">
      <td className="p-4">
        <Checkbox checked={checked} onCheckedChange={(v) => onToggle(call.id, v)} aria-label={`Select call ${call.name}`} />
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={call.avatar} alt={call.name} />
            <AvatarFallback className="text-xs bg-primary/10">
              {call.name.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium">{call.name}</span>
        </div>
      </td>
      <td className="p-4 text-muted-foreground">{call.phone}</td>
      <td className="p-4">
        <Badge variant="outline" className={call.type === "incoming" ? "text-green-600 border-green-600" : "text-orange-600 border-orange-600"}>
          {call?.type === "incoming" ? <PhoneIncoming className="h-3 w-3 mr-1" /> : <PhoneOutgoing className="h-3 w-3 mr-1" />}
          {call?.type?.charAt(0).toUpperCase() + call?.type?.slice(1)}
        </Badge>
      </td>
      <td className="p-4 text-muted-foreground">{call.duration}</td>
      <td className="p-4 text-muted-foreground">{call.dateTime}</td>
    </tr>
  );
});

CallRow.displayName = "CallRow";
export default CallRow;
