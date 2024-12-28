import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Select,
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Pencil } from "tabler-icons-react";
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
  const [editTaskIndex, setEditTaskIndex] = useState(null);
  const [sortOrder, setSortOrder] = useState(null);
  const [filteredTasks, setFilteredTasks] = useState([]);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskSummary, setTaskSummary] = useState("");
  const [taskState, setTaskState] = useState("Not done");

  const [editTaskTitle, setEditTaskTitle] = useState("");
  const [editTaskSummary, setEditTaskSummary] = useState("");
  const [editTaskState, setEditTaskState] = useState("Not done");

  function createTask() {
    const newTask = {
      title: taskTitle,
      summary: taskSummary,
      state: taskState,
    };

    const updatedTasks = [...tasks, newTask];

    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, taskIndex) => taskIndex !== index);
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");

    let tasks = JSON.parse(loadedTasks);

    if (tasks) {
      setTasks(tasks);
      setFilteredTasks(tasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  useEffect(() => {
    loadTasks();
  }, []);

  function updateTaskState(index, state) {
    const updatedTasks = [...tasks];
    updatedTasks[index].state = state;
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function sortTasks(state) {
    const sortedTasks = [...filteredTasks].sort((a, b) => {
      if (a.state === state && b.state !== state) return -1;
      if (a.state !== state && b.state === state) return 1;
      return 0;
    });
    setFilteredTasks(sortedTasks);
  }

  function filterTasks(state) {
    const filtered = tasks.filter((task) => task.state === state);
    setFilteredTasks(filtered);
  }

  function openEditModal(index) {
    setEditTaskIndex(index);
    const task = tasks[index];
    setEditTaskTitle(task.title);
    setEditTaskSummary(task.summary);
    setEditTaskState(task.state);
    setEditOpened(true);
  }

  function editTask() {
    const updatedTasks = [...tasks];
    updatedTasks[editTaskIndex] = {
      title: editTaskTitle,
      summary: editTaskSummary,
      state: editTaskState,
    };
    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditOpened(false);
  }

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ colorScheme, defaultRadius: "md" }}
        withGlobalStyles
        withNormalizeCSS
      >
        <div className="App">
          <Modal
            opened={opened}
            size={"md"}
            title={"New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              value={taskSummary}
              onChange={(e) => setTaskSummary(e.target.value)}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              value={taskState}
              onChange={setTaskState}
              mt={"md"}
              label={"State"}
              placeholder="Select state"
              data={["Done", "Not done", "Doing right now"]}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                  setOpened(false);
                }}
              >
                Create Task
              </Button>
            </Group>
          </Modal>

          <Modal
            opened={editOpened}
            size={"md"}
            title={"Edit Task"}
            withCloseButton={false}
            onClose={() => {
              setEditOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              value={editTaskTitle}
              onChange={(e) => setEditTaskTitle(e.target.value)}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              value={editTaskSummary}
              onChange={(e) => setEditTaskSummary(e.target.value)}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              value={editTaskState}
              onChange={setEditTaskState}
              mt={"md"}
              label={"State"}
              placeholder="Select state"
              data={["Done", "Not done", "Doing right now"]}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setEditOpened(false);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  editTask();
                }}
              >
                Save Changes
              </Button>
            </Group>
          </Modal>

          <Container size={550} my={40}>
            <Group position={"apart"}>
              <Title
                sx={(theme) => ({
                  fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                  fontWeight: 900,
                })}
              >
                My Tasks
              </Title>
              <ActionIcon
                color={"blue"}
                onClick={() => toggleColorScheme()}
                size="lg"
              >
                {colorScheme === "dark" ? (
                  <Sun size={16} />
                ) : (
                  <MoonStars size={16} />
                )}
              </ActionIcon>
            </Group>

            <Group position="apart" my="md">
              <Button onClick={() => sortTasks("Done")}>Show 'Done' first</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                Show 'Doing' first
              </Button>
              <Button onClick={() => sortTasks("Not done")}>
                Show 'Not done' first
              </Button>
            </Group>
            <Group position="apart" my="md">
              <Button onClick={() => filterTasks("Done")}>Show only 'Done'</Button>
              <Button onClick={() => filterTasks("Doing right now")}>
                Show only 'Doing'
              </Button>
              <Button onClick={() => filterTasks("Not done")}>
                Show only 'Not done'
              </Button>
            </Group>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <Card shadow="sm" key={index} p="lg" radius="md" withBorder>
                  <Group position="apart">
                    <Text size="lg" weight={500}>
                      {task.title}
                    </Text>
                    <Group>
                      <ActionIcon
                        color="yellow"
                        onClick={() => openEditModal(index)}
                        title="Edit task"
                      >
                        <Pencil size={16} />
                      </ActionIcon>
                      <ActionIcon
                        color="red"
                        onClick={() => deleteTask(index)}
                        title="Delete task"
                      >
                        <Trash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text mt="md">{task.summary}</Text>
                  <Text mt="md" color="dimmed" size="sm">
                    State: {task.state}
                  </Text>
                </Card>
              ))
            ) : (
              <Text>No tasks available</Text>
            )}
            <Button onClick={() => setOpened(true)} my="md">
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
