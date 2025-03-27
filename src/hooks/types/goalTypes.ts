
export interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  task_summary?: string;
  image_url?: string;
  image_loading?: boolean;
  image_error?: boolean;
}

export interface NewGoal {
  title: string;
  description: string;
  target_date: string;
}
