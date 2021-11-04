import { UIActionTypes, UIAction, WorkerActionTypes, WorkerAction, BoardProps } from './types';

// Listen to messages received from the plugin UI (src/ui/ui.ts)
figma.ui.onmessage = function ({ type, payload }: UIAction): void {
  switch (type) {
    case UIActionTypes.CLOSE:
      figma.closePlugin();
      break;
    case UIActionTypes.NOTIFY:
      payload && figma.notify(payload.toString());
      break;
    case UIActionTypes.CREATE_RECTANGLE:
      createRectangle();
      break;
    case UIActionTypes.CREATE_BOARD:
      payload && createBoard(payload);
      break;
  }
};

const createBoard = async (boardData: BoardProps) => {
  console.log(boardData);

  const nodes: SceneNode[] = [];

  await figma.loadFontAsync({ family: 'Roboto', style: 'Regular' });
  await figma.loadFontAsync({ family: 'Roboto', style: 'Medium' });

  boardData.lists.forEach((list, i) => {
    const listFrame = figma.createFrame();
    listFrame.name = `List (${list.name})`;
    listFrame.cornerRadius = 3;
    listFrame.resize(272, 30);
    listFrame.x = i * (listFrame.width + 8);
    listFrame.fills = [{ type: 'SOLID', color: { r: 0.92, g: 0.93, b: 0.94 } }];
    listFrame.layoutMode = 'VERTICAL';
    listFrame.paddingBottom = 14;
    listFrame.paddingTop = 14;
    listFrame.paddingRight = 16;
    listFrame.paddingLeft = 16;
    listFrame.itemSpacing = 8;

    const listTitle = figma.createText();
    listTitle.fontName = { family: 'Roboto', style: 'Medium' };
    listTitle.characters = list.name;
    listTitle.fontSize = 20;
    listFrame.appendChild(listTitle);

    list.cards.forEach((card) => {
      const cardFrame = figma.createFrame();
      cardFrame.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 } }];
      cardFrame.cornerRadius = 3;
      cardFrame.layoutMode = 'HORIZONTAL';
      cardFrame.layoutAlign = 'STRETCH';
      cardFrame.resize(240, 50);
      cardFrame.counterAxisSizingMode = 'AUTO';
      cardFrame.paddingBottom = 6;
      cardFrame.paddingTop = 6;
      cardFrame.paddingLeft = 8;
      cardFrame.paddingRight = 8;
      cardFrame.effects = [
        {
          type: 'DROP_SHADOW',
          color: { r: 0.04, g: 0.12, b: 0.26, a: 0.25 },
          blendMode: 'NORMAL',
          radius: 0,
          visible: true,
          offset: { x: 0, y: 1 },
        },
      ];

      const cardTitle = figma.createText();
      cardTitle.characters = card.name;
      cardTitle.layoutGrow = 1;
      cardTitle.fontSize = 14;
      cardTitle.textAutoResize = 'HEIGHT';

      cardFrame.appendChild(cardTitle);
      listFrame.appendChild(cardFrame);
    });

    figma.currentPage.appendChild(listFrame);
    nodes.push(listFrame);
  });
  figma.currentPage.selection = nodes;
  figma.viewport.scrollAndZoomIntoView(nodes);
};

// Sends a message to the plugin UI
function postMessage({ type, payload }: WorkerAction): void {
  figma.ui.postMessage({ type, payload });
}

// Creates a rectangle (demo purposes)
function createRectangle(): void {
  const rect = figma.createRectangle();
  const width = 100;
  const height = 100;

  rect.resize(width, height);
  rect.x = figma.viewport.center.x - Math.round(width / 2);
  rect.y = figma.viewport.center.y - Math.round(height / 2);
  figma.currentPage.appendChild(rect);
  figma.currentPage.selection = [rect];
  figma.viewport.scrollAndZoomIntoView([rect]);

  postMessage({ type: WorkerActionTypes.CREATE_RECTANGLE_NOTIFY, payload: 'Rectangle created 👍' });
}

// Show the plugin interface (https://www.figma.com/plugin-docs/creating-ui/)
// Remove this in case your plugin doesn't need a UI, make network requests, use browser APIs, etc.
// If you need to make network requests you need an invisible UI (https://www.figma.com/plugin-docs/making-network-requests/)
figma.showUI(__html__, { width: 350, height: 400 });
