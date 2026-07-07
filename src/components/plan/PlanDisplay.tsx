import type { DaySchedule } from "../../types";
import { Card } from "../ui/Card";

function DayCard({ schedule }: { schedule: DaySchedule }) {
  return <Card></Card>;
}

interface PlanDisplayProps {
  weeklySchedule: DaySchedule[];
}

export function PlanDisplay({ weeklySchedule }: PlanDisplayProps) {
  return (
    <div>
      {weeklySchedule.map((schedule, key) => (
        <DayCard key={key} schedule={schedule} />
      ))}
    </div>
  );
}
