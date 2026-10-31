// Backend-in JSON sahələri ilə eyni adlar məlumat çevirməsini sadələşdirir.
export interface Todo {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
}

export type TodoFilter = 'all' | 'active' | 'completed';
