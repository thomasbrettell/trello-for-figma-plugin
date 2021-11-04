export enum UIActionTypes {
  CLOSE = 'CLOSE',
  NOTIFY = 'NOTIFY',
  CREATE_RECTANGLE = 'CREATE_RECTANGLE',
  CREATE_BOARD = 'CREATE_BOARD',
}

export interface UIAction {
  type: UIActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export enum WorkerActionTypes {
  CREATE_RECTANGLE_NOTIFY = 'CREATE_RECTANGLE_NOTIFY',
}

export interface WorkerAction {
  type: WorkerActionTypes;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any;
}

export interface CardProps {
  name: string;
  id: string;
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
