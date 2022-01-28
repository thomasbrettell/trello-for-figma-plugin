import {
  WorkerActionTypes,
  WorkerAction,
  CardProps,
  BoardProps,
  AlertType,
  ListProps,
  UIAction,
  UIActionTypes,
} from './types';

const TRELLO_API_KEY = '3dfb8976cc500db09441d2236f4a22c5';

import './ui.css';

const $form = document.querySelector('#form') as HTMLFormElement;
const $authCode = document.getElementById('auth-code') as HTMLInputElement;
const $boardName = document.getElementById('board-name') as HTMLSelectElement;
const $listName = document.getElementById('list-name') as HTMLSelectElement;
const $cardName = document.getElementById('card-name') as HTMLSelectElement;
const $authLink = document.getElementById('auth-link') as HTMLAnchorElement;
const $loadBoards = document.getElementById('load-boards') as HTMLButtonElement;
const $run = document.getElementById('run') as HTMLButtonElement;
const $banner = document.getElementById('banner');
const $bannerMsg = document.getElementById('banner-msg');
const $loadChecklist = document.getElementById('load-checklist') as HTMLInputElement;
let userAuthCode: string;

const postMessage = ({ type, payload }: UIAction): void => {
  parent.postMessage({ pluginMessage: { type, payload } }, '*');
};

// Listen to messages received from the plugin worker (src/plugin/plugin.ts)
function listenToPluginMessages(): void {
  window.onmessage = function (event: MessageEvent): void {
    const pluginMessage = event.data.pluginMessage as WorkerAction;
    const { type, payload } = pluginMessage;

    switch (type) {
      case WorkerActionTypes.CREATE_RECTANGLE_NOTIFY:
        payload && alert(payload);
        break;
      case WorkerActionTypes.READ_TOKEN:
        $authCode.value = payload ? (payload as string) : '';
        break;
    }
  };
}

const fetchBoardsByUserToken = async (): Promise<BoardProps[] | null> => {
  const response = await fetch(
    `https://api.trello.com/1/members/me/boards?key=${TRELLO_API_KEY}&token=${userAuthCode}`,
  );

  if (!response || response.status !== 200) {
    console.error(response);
    return null;
  }

  const json = response.json();
  return json;
};

const fetchCardById = async (id: string): Promise<CardProps | null> => {
  const response = await fetch(
    `https://api.trello.com/1/card/${id}?fields=all&checklists=all&key=${TRELLO_API_KEY}&token=${userAuthCode}`,
  );

  if (!response || response.status !== 200) {
    console.error(response);
    return null;
  }

  const json = response.json();
  return json;
};

const fetchListsByBoardId = async (boardId: string): Promise<ListProps[] | null> => {
  const response = await fetch(
    `https://api.trello.com/1/boards/${boardId}/lists?key=${TRELLO_API_KEY}&token=${userAuthCode}`,
  );

  if (!response || response.status !== 200) {
    console.error(response);
    return null;
  }

  const json = response.json();
  return json;
};

const fetchCardsByListId = async (listId: string): Promise<CardProps[] | null> => {
  const response = await fetch(
    `https://api.trello.com/1/lists/${listId}/cards?key=${TRELLO_API_KEY}&token=${userAuthCode}`,
  );

  if (!response || response.status !== 200) {
    console.error(response);
    return null;
  }

  const json = response.json();
  return json;
};

const showAlert = (msg: string, variant: AlertType = AlertType.INFO): void => {
  if (!$banner || !$bannerMsg) {
    return;
  }

  if (variant === AlertType.ERROR) {
    $banner.classList.add('error');
  } else {
    $banner.classList.remove('error');
  }

  $bannerMsg.innerHTML = msg;

  $banner.classList.remove('hidden');
  $banner.scrollIntoView();
};

const hideAlert = () => {
  if (!$banner || !$bannerMsg) {
    return;
  }

  $bannerMsg.innerHTML = '';

  $banner.classList.add('hidden');
};

const setup = () => {
  $authLink.href = `https://trello.com/1/authorize?expiration=1hour&name=Trello%20for%20Figma&scope=read&response_type=token&key=${TRELLO_API_KEY}`;
  postMessage({ type: UIActionTypes.READ_TOKEN });

  window.addEventListener('error', (e) => {
    showAlert(e.message || 'Error', AlertType.ERROR);
  });

  window.addEventListener('unhandledrejection', (e) => {
    showAlert(e.reason?.message || 'Error', AlertType.ERROR);
  });

  $form.addEventListener('submit', (e) => {
    e.preventDefault();
  });

  $loadBoards.addEventListener('click', async () => {
    userAuthCode = $authCode.value;
    postMessage({ type: UIActionTypes.SAVE_TOKEN, payload: userAuthCode });
    showAlert('Loading boards', AlertType.INFO_LOADING);
    fetchBoardsByUserToken().then((usersBoards) => {
      if (!usersBoards) {
        throw new Error('Cannot load boards');
      }
      $boardName.options.length = 0;
      const option = document.createElement('option');
      option.value = '';
      option.text = '- Select board -';
      option.label = '- Select board -';
      $boardName.add(option);
      usersBoards?.forEach((board) => {
        const option = document.createElement('option');
        option.value = board.id;
        option.text = board.name;
        option.label = board.name;
        $boardName.add(option);
      });
      $boardName.selectedIndex = 0;
    });
  });

  $boardName.addEventListener('change', async () => {
    $listName.options.length = 0;
    if ($boardName.value === '') {
      const option = document.createElement('option');
      option.value = '';
      option.text = '- Select board -';
      option.label = '- Select board -';
      $listName.add(option);
    } else {
      const option = document.createElement('option');
      option.value = '';
      option.text = '- Load all lists -';
      option.label = '- Load all lists -';
      $listName.add(option);
      showAlert('Loading lists', AlertType.INFO_LOADING);
      const lists = await fetchListsByBoardId($boardName.value);
      lists?.forEach((list) => {
        const option = document.createElement('option');
        option.value = list.id;
        option.text = list.name;
        option.label = list.name;
        $listName.add(option);
      });
    }
  });

  $listName.addEventListener('change', async () => {
    $cardName.options.length = 0;
    if ($listName.value === '') {
      const option = document.createElement('option');
      option.value = '';
      option.text = '- Select list -';
      option.label = '- Select list -';
      $cardName.add(option);
    } else {
      const option = document.createElement('option');
      option.value = '';
      option.text = '- Load all cards -';
      option.label = '- Load all cards -';
      $cardName.add(option);
      showAlert('Loading cards', AlertType.INFO_LOADING);
      const cards = await fetchCardsByListId($listName.value);
      cards?.forEach((card) => {
        const option = document.createElement('option');
        option.value = card.id;
        option.text = card.name;
        option.label = card.name;
        $cardName.add(option);
      });
    }
  });

  $run.addEventListener('click', async (e) => {
    hideAlert();
    try {
      e.preventDefault();
      userAuthCode = $authCode.value;
      postMessage({ type: UIActionTypes.SAVE_TOKEN, payload: userAuthCode });

      if (!userAuthCode) {
        throw new Error(
          'No authorisation token. Use the link above to authorise your Trello account and copy the token into the field.',
        );
      }

      showAlert('Loading boards', AlertType.INFO_LOADING);

      const usersBoards = await fetchBoardsByUserToken();
      if (!usersBoards) {
        throw new Error(
          "Couldn't find your account. Are you sure your authorisation token is correct?",
        );
      }

      const foundBoard = usersBoards.find((b) => b.id === $boardName.value);
      if (!foundBoard) {
        throw new Error('No board found with id ' + $boardName.value);
      }

      showAlert('Loading lists', AlertType.INFO_LOADING);

      const board: BoardProps = { id: foundBoard.id, name: foundBoard.name, lists: [] };
      const boardsLists = await fetchListsByBoardId(board.id);

      if (!boardsLists) {
        throw new Error('Cannot load board lists ' + board.id);
      }

      const listId = $listName.value;

      board.lists = boardsLists
        .filter((list) => (listId ? list.id === listId : true))
        .map((list) => {
          return {
            id: list.id,
            name: list.name,
            cards: [],
          };
        });

      showAlert('Loading cards', AlertType.INFO_LOADING);

      const cardId = $cardName.value;
      const card = cardId ? await fetchCardById(cardId) : null;

      if (card) {
        for (const list of board.lists) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const checklists = (card as any).checklists as {
            checkItems: { id: string; name: string; state: 'complete' | 'incomplete' }[];
          }[];

          const checklist = $loadChecklist.checked
            ? checklists.map((c) => c.checkItems).flat(1)
            : undefined;

          list.cards = [
            {
              id: card.id,
              name: card.name,
              idList: card.idList,
              idBoard: card.idBoard,
              checklist,
            },
          ];
        }
      } else {
        for (const list of board.lists) {
          const cards = await fetchCardsByListId(list.id);
          if (cards) {
            list.cards = cards.map((card) => ({
              id: card.id,
              name: card.name,
              idList: card.idList,
              idBoard: card.idBoard,
            }));
          }
        }
      }

      showAlert('Creating cards', AlertType.INFO_LOADING);
      postMessage({ type: UIActionTypes.CREATE_BOARD, payload: board });
    } catch (error) {
      if (error instanceof Error) {
        showAlert(error.message, AlertType.ERROR);
      }
    }
  });
};

// Initialize all the things
listenToPluginMessages();
setup();
