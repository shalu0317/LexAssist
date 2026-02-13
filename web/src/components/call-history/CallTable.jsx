import React, { useMemo } from "react";
import CallRow from "./CallRow";
import { Checkbox } from "@/components/ui/checkbox";

const CallTable = ({ calls, selectedCalls, onToggleCall, onToggleAll }) => {
  const allSelected = useMemo(() => calls.length > 0 && selectedCalls.length === calls.length, [calls.length, selectedCalls]);
  const partialSelected = useMemo(() => selectedCalls.length > 0 && selectedCalls.length < calls.length, [selectedCalls, calls.length]);

  return (
    <div className="border rounded-lg bg-card overflow-auto">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="w-12 p-4">
              <Checkbox checked={allSelected} indeterminate={partialSelected} onCheckedChange={onToggleAll} aria-label="Select all calls" />
            </th>
            <th className="text-left p-4 font-medium text-sm">User Name</th>
            <th className="text-left p-4 font-medium text-sm">Phone Number</th>
            <th className="text-left p-4 font-medium text-sm">Call Type</th>
            <th className="text-left p-4 font-medium text-sm">Duration</th>
            <th className="text-left p-4 font-medium text-sm">Date and Time</th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <CallRow key={call.id} call={call} checked={selectedCalls.includes(call.id)} onToggle={onToggleCall} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default React.memo(CallTable);
