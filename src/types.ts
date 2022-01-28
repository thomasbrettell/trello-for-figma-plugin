export enum UIActionTypes {
  CLOSE = 'CLOSE',
  NOTIFY = 'NOTIFY',
  CREATE_RECTANGLE = 'CREATE_RECTANGLE',
  CREATE_BOARD = 'CREATE_BOARD',
  READ_TOKEN = 'READ_TOKEN',
  SAVE_TOKEN = 'SAVE_TOKEN',
}

export interface UIAction {
  type: UIActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export enum WorkerActionTypes {
  CREATE_RECTANGLE_NOTIFY = 'CREATE_RECTANGLE_NOTIFY',
  READ_TOKEN = 'READ_TOKEN',
}

export interface WorkerAction {
  type: WorkerActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export interface Checkmark {
  id: string;
  name: string;
  state: 'complete' | 'incomplete';
}
export interface CardProps {
  name: string;
  id: string;
  idBoard: string;
  idList: string;
  checklist?: Checkmark[];
}

export interface ListProps {
  name: string;
  id: string;
  cards: CardProps[];
}

export interface BoardProps {
  name: string;
  id: string;
  lists: ListProps[];
}

export enum AlertType {
  INFO = 'info',
  ERROR = 'error',
  INFO_LOADING = 'info-loading',
}
