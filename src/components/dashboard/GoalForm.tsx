import React from "react";
import { Input } from "@/components/ui/input";
interface GoalFormProps {
  newGoal: {
    title: string;
    description: string;
    target_date: string;
  };
  setNewGoal: React.Dispatch<React.SetStateAction<{
    title: string;
    description: string;
    target_date: string;
  }>>;
}
const GoalForm: React.FC<GoalFormProps> = ({
  newGoal,
  setNewGoal
}) => {
  return <div className="grid gap-4 py-0">
      <div className="grid gap-2">
        <label htmlFor="title" className="text-sm font-medium">Title</label>
        <Input id="title" placeholder="e.g., Save for retirement" value={newGoal.title} onChange={e => setNewGoal({
        ...newGoal,
        title: e.target.value
      })} />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Input id="description" placeholder="Briefly describe your goal" value={newGoal.description} onChange={e => setNewGoal({
        ...newGoal,
        description: e.target.value
      })} />
      </div>
      
      <div className="grid gap-2">
        <label htmlFor="target_date" className="text-sm font-medium">Target Date</label>
        <Input id="target_date" type="date" value={newGoal.target_date} onChange={e => setNewGoal({
        ...newGoal,
        target_date: e.target.value
      })} />
      </div>
    </div>;
};
export default GoalForm;