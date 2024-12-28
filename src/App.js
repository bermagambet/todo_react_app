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
} from "@mantine/core";
import { useState, useRef, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false);
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
  const taskState = useRef("Not done");
  const taskDeadline = useRef("");
  const [editTask, setEditTask] = useState({});

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    saveTasks([...tasks, newTask]);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function editCurrentTask() {
    const updatedTask = {
      title: editTask.title,
      summary: editTask.summary,
      state: editTask.state,
      deadline: editTask.deadline,
    };
    const updatedTasks = tasks.map((task, i) => (i === editIndex ? updatedTask : task));
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditOpened(false);
  }

  function loadTasks() {
    let loadedTasks = localStorage.getItem("tasks");
    let tasks = JSON.parse(loadedTasks);
    if (tasks) {
      setTasks(tasks);
    }
  }

  function saveTasks(tasks) {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
 
  useEffect(() => {
    loadTasks();
  }, []);

  function sortTasks(state) {
    const sortedTasks = [...tasks].sort((a, b) => (a.state === state ? -1 : 1));
    setTasks(sortedTasks);
  }

  function filterTasks(state) {
    const filteredTasks = tasks.filter((task) => task.state === state);
    setTasks(filteredTasks);
  }

  function sortByDeadline() {
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    setTasks(sortedTasks);
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
            onClose={() => setOpened(false)}
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
            <select
              ref={taskState}
              defaultValue="Not done"
              style={{ marginTop: "1rem", width: "100%", padding: "0.5rem" }}
            >
              <option value="Done">Done</option>
              <option value="Not done">Not done</option>
              <option value="Doing right now">Doing right now</option>
            </select>
            <TextInput
              ref={taskDeadline}
              type="date"
              mt="md"
              label="Deadline"
              required
            />
            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  createTask();
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
            onClose={() => setEditOpened(false)}
            centered
          >
            <TextInput
              mt={"md"}
              value={editTask.title || ""}
              onChange={(e) =>
                setEditTask({ ...editTask, title: e.target.value })
              }
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              mt={"md"}
              value={editTask.summary || ""}
              onChange={(e) =>
                setEditTask({ ...editTask, summary: e.target.value })
              }
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <select
              value={editTask.state || "Not done"}
              onChange={(e) =>
                setEditTask({ ...editTask, state: e.target.value })
              }
              style={{ marginTop: "1rem", width: "100%", padding: "0.5rem" }}
            >
              <option value="done">done</option>
              <option value="not done">not done</option>
              <option value="doing right now">doing right now</option>
            </select>
            <TextInput
              type="date"
              mt="md"
              value={editTask.deadline || ""}
              onChange={(e) =>
                setEditTask({ ...editTask, deadline: e.target.value })
              }
              label="Deadline"
              required
            />
            <Group mt={"md"} position={"apart"}>
              <Button onClick={() => setEditOpened(false)} variant={"subtle"}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  editCurrentTask();
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
                {colorScheme === "dark" ? <Sun size={16} /> : <MoonStars size={16} />}
              </ActionIcon>
            </Group>
            <Group mt="md">
              <Button onClick={() => sortTasks("Done")}>sort by Done</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                sort by Doing
              </Button>
              <Button onClick={() => sortTasks("Not done")}>sort by Not done</Button>
              <Button onClick={sortByDeadline}>sort by Deadline</Button>
            </Group>
            <Group mt="md">
              <Button onClick={() => filterTasks("Done")}>show Done</Button>
              <Button onClick={() => filterTasks("Not done")}>
                show Not done
              </Button>
              <Button onClick={() => filterTasks("doing right now")}>
                show Doing
              </Button>
            </Group>
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <ActionIcon
                      onClick={() => {
                        setEditIndex(index);
                        setEditTask(task);
                        setEditOpened(true);
                      }}
                    >
                      <Edit />
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
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "no summary here :("}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    State: {task.state}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    Deadline: {task.deadline || "no deadline :)"}
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
