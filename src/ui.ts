import {
  WorkerActionTypes,
  WorkerAction,
  BoardProps,
  AlertType,
  ListProps,
  UIAction,
  UIActionTypes,
} from './types';
const TRELLO_API_KEY = '3dfb8976cc500db09441d2236f4a22c5';

import './ui.css';

const $form = document.querySelector('#form');
const $authCode = document.getElementById('auth-code') as HTMLInputElement;
const $boardName = document.getElementById('board-name') as HTMLInputElement;
const $authLink = document.getElementById('auth-link') as HTMLAnchorElement;
const $banner = document.getElementById('banner');
const $bannerMsg = document.getElementById('banner-msg');
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
    }
  };
}

const fetchBoardsByUserToken = async () => {
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

const fetchListsByBoardId = async (boardId: string) => {
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

const fetchCardsByListId = async (listId: string) => {
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
};

const hideAlert = () => {
  if (!$banner || !$bannerMsg) {
    return;
  }

  $bannerMsg.innerHTML = '';

  $banner.classList.add('hidden');
};

const setup = () => {
  $authLink.href = `https://trello.com/1/authorize?expiration=1hour&name=Trello%20For%20Figma&scope=read&response_type=token&key=${TRELLO_API_KEY}`;

  $form?.addEventListener('submit', async (e) => {
    hideAlert();
    try {
      e.preventDefault();
      userAuthCode = $authCode.value;
      const boardName = $boardName.value;

      if (!userAuthCode) {
        throw new Error(
          'No authorisation code. Use the link above to authorise your Trello account and copy the code into the field.',
        );
      }

      if (!boardName) {
        throw new Error('No board name. Input the name of the Trello board you want to import.');
      }

      showAlert('Loading your board', AlertType.INFO_LOADING);

      const usersBoards = await fetchBoardsByUserToken();
      if (!usersBoards) {
        throw new Error(
          "Couldn't find your account. Are you sure your authorisation code is correct?",
        );
      }

      const foundBoard = usersBoards.find((board: BoardProps) => board.name === boardName);
      if (!foundBoard) {
        throw new Error("Couldn't find your board. Are you sure you spelt it correctly?");
      }

      const board: BoardProps = { id: foundBoard.id, name: foundBoard.name, lists: [] };

      const boardsLists: ListProps[] = await fetchListsByBoardId(board.id);

      board.lists = boardsLists.map((list) => {
        return {
          id: list.id,
          name: list.name,
          cards: [],
        };
      });

      for (const list of board.lists) {
        const cardData = await fetchCardsByListId(list.id);

        for (const card of cardData) {
          list.cards.push({
            id: card.id,
            name: card.name,
          });
        }
      }

      postMessage({ type: UIActionTypes.CREATE_BOARD, payload: board });

      hideAlert();
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
