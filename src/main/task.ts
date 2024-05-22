import fs from 'fs';
import path from 'path';

interface Option {
  value: string;
  label: string;
}

interface Task {
  id: string;
  status: string;
  statusType: string;
  isRunning: boolean;
  site: Option;
  mode: Option;
  input: string;
  size: Option[];
  monitorDelay: string;
  retryDelay: string;
  productQuantity: string;
  minSizesLoaded: string;
  minPrice: string;
  maxPrice: string;
  profile: {
    group: Option;
    item: Option;
  };
  proxy: {
    monitor: Option;
    task: Option;
  };
}

interface TaskGroupData {
  id: string;
  name: string;
  tasks: Task[];
}

let taskFilePath = '';

function initializeTaskFilePath() {
  const os = process.platform;
  switch (os) {
    case 'win32': {
      // Windows: Use %APPDATA% environment variable

      if (!process.env.APPDATA) {
        throw Error('APPDATA environment variable not found');
      }

      taskFilePath = path.join(
        process.env.APPDATA,
        'dalphan-aio',
        'tasks.json',
      );

      break;
    }
    case 'darwin': {
      // MacOS: Use $HOME/Library/Application Support
      taskFilePath = `${process.env.HOME}/Library/Application Support/dalphan-aio/tasks.json`;

      break;
    }
    case 'linux': {
      // Linux: Use $HOME/.config
      taskFilePath = `${process.env.HOME}/.config/dalphan-aio/tasks.json`;

      break;
    }
    default:
      // Unsupported OS
      throw Error('Unsupported OS');
  }
}

export function checkTaskFile(filePath: string): string {
  // Check if the file does not exist
  if (!fs.existsSync(filePath)) {
    console.log('FILE DOES NOT EXIST!');

    // Create the file
    fs.writeFileSync(filePath, '{}');
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');

  // Key found. Return key value.
  return JSON.parse(fileContents);
}

export function createTaskGroup(taskGroupObject: TaskGroupData) {
  const fileContents = fs.readFileSync(taskFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  parsedData[taskGroupObject.id] = taskGroupObject;

  // Make sure we only ever write tasks with an idle status and a false isRunning value
  parsedData[taskGroupObject.id].tasks.forEach(
    (task: { status: string; isRunning: boolean }) => {
      task.status = 'Idle';
      task.isRunning = false;
    },
  );

  fs.writeFileSync(taskFilePath, JSON.stringify(parsedData));
}

export function removeTaskGroup(id: string) {
  const fileContents = fs.readFileSync(taskFilePath, 'utf8');

  const parsedData = JSON.parse(fileContents);

  delete parsedData[id];

  fs.writeFileSync(taskFilePath, JSON.stringify(parsedData));
}

export async function fetchTaskData() {
  console.log('fetching task data!');

  const taskData = checkTaskFile(taskFilePath);

  return taskData;
}

initializeTaskFilePath();
