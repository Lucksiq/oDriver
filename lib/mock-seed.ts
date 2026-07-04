/** Shape of a row in the real `goals` table, also used by the Goals UI. */
export interface GoalHistoryEntry {
  id: string;
  date: string;
  amount: number;
  achieved: boolean;
}
