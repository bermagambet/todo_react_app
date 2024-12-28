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
import { MoonStars, Sun, Trash, Edit as EditIcon } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]);

  const taskTitle = useRef("");
  const taskSummary = useRef("");
  const taskState = useRef("");
  const taskDeadline = useRef("");

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value,
    };

    if (editIndex !== null) {
      const updatedTasks = [...tasks];
      updatedTasks[editIndex] = newTask;
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setEditIndex(null);
    } else {
      setTasks((prevTasks) => [...prevTasks, newTask]);
      saveTasks([...tasks, newTask]);
    }

    setOpened(false);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
    const parsedTasks = JSON.parse(loadedTasks);

    if (parsedTasks) {
      setTasks(parsedTasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function sortTasks(state) {
    const sortedTasks = [...tasks].sort((a, b) => (a.state === state ? -1 : 1));
    setTasks(sortedTasks);
  }

  function filterTasks(state) {
    const filteredTasks = tasks.filter((task) => task.state === state);
    setTasks(filteredTasks);
  }

  function sortByDeadline() {
    const sortedTasks = [...tasks].sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );
    setTasks(sortedTasks);
  }

  function openEditModal(index) {
    setEditIndex(index);
    setOpened(true);
  }

  useEffect(() => {
    loadTasks();
  }, []);

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
            title={editIndex !== null ? "Edit Task" : "New Task"}
            withCloseButton={false}
            onClose={() => {
              setOpened(false);
            }}
            centered
          >
            <TextInput
              mt={"md"}
              ref={taskTitle}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              ref={taskSummary}
              mt={"md"}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              ref={taskState}
              mt={"md"}
              placeholder={"Select state"}
              label={"State"}
              data={[
                { value: "DONE", label: "Done" },
                { value: "NOT_DONE", label: "Not done" },
                { value: "DOING", label: "Doing right now" },
              ]}
            />
            <TextInput
              type="date"
              ref={taskDeadline}
              mt={"md"}
              placeholder={"Select deadline"}
              label={"Deadline"}
            />
            <Group mt={"md"} position={"apart"}>
              <Button
                onClick={() => {
                  setOpened(false);
                  setEditIndex(null);
                }}
                variant={"subtle"}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
                }}
              >
                {editIndex !== null ? "Update Task" : "Create Task"}
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
            <Group my={40}>
              <Button onClick={() => sortTasks("DONE")}>Show 'Done' first</Button>
              <Button onClick={() => sortTasks("DOING")}>Show 'Doing' first</Button>
              <Button onClick={() => sortTasks("NOT_DONE")}>
                Show 'Not done' first
              </Button>
            </Group>
            <Group my={40}>
              <Button onClick={() => filterTasks("DONE")}>Show only 'Done'</Button>
              <Button onClick={() => filterTasks("DOING")}>
                Show only 'Doing'
              </Button>
              <Button onClick={() => filterTasks("NOT_DONE")}>
                Show only 'Not done'
              </Button>
            </Group>
            <Button onClick={sortByDeadline} mb={"lg"}>
              Sort by Deadline
            </Button>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          openEditModal(index);
                        }}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <EditIcon />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => {
                          deleteTask(index);
                        }}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary provided for this task"}
                  </Text>
                  <Text>{task.state || "No state provided for this task"}</Text>
                  <Text>
                    {task.deadline
                      ? `Deadline: ${new Date(task.deadline).toLocaleDateString()}`
                      : "No deadline provided"}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                You have no tasks
              </Text>
            )}
            <Button
              onClick={() => {
                setOpened(true);
                setEditIndex(null);
              }}
              fullWidth
              mt={"md"}
            >
              New Task
            </Button>
          </Container>
        </div>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
