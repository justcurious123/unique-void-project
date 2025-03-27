export interface NewGoal {
  title: string;
  description: string;
  target_date?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  target_date?: string;
  completed: boolean;
  task_summary?: string;
  user_id: string;
  created_at: string;
  image_url: string | null;
  image_loading?: boolean;
  image_error?: boolean;
  image_refresh?: boolean; // Add new property for force refresh
}
