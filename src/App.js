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
  const [filteredTasks, setFilteredTasks] = useState(null); // State for filtered tasks
  const [opened, setOpened] = useState(false);
  const [openedEdit, setOpenedEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");

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

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState.current.value,
      deadline: taskDeadline.current.value,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }

  function editTask() {
    const updatedTasks = tasks.map((task, i) =>
      i === editIndex ? { ...task, title: editTitle, summary: editSummary } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setOpenedEdit(false);
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
    const sortedTasks = [...tasks].sort((a, b) =>
      a.state === state ? -1 : b.state === state ? 1 : 0
    );
    setTasks(sortedTasks);
  }

  function filterTasks(state) {
    const filtered = tasks.filter((task) => task.state === state);
    setFilteredTasks(filtered); // Set filtered tasks
  }

  function sortByDeadline() {
    const sortedTasks = [...tasks].sort(
      (a, b) => new Date(a.deadline) - new Date(b.deadline)
    );
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
            <select ref={taskState} defaultValue={"Not done"} style={{ marginTop: "16px", width: "100%" }}>
              <option value="Done">Done</option>
              <option value="Not done">Not done</option>
              <option value="Doing right now">Doing right now</option>
            </select>
            <TextInput
              type="date"
              ref={taskDeadline}
              mt={"md"}
              label={"Deadline"}
              placeholder={"Select deadline"}
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
            opened={openedEdit}
            size={"md"}
            title={"Edit Task"}
            onClose={() => setOpenedEdit(false)}
            centered
          >
            <TextInput
              mt="md"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              label="Title"
            />
            <TextInput
              mt="md"
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              label="Summary"
            />
            <Group mt="md" position="apart">
              <Button variant="subtle" onClick={() => setOpenedEdit(false)}>
                Cancel
              </Button>
              <Button onClick={editTask}>Save Changes</Button>
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

            <Group mt="md">
              <Button onClick={() => sortTasks("Done")}>Show Done first</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                Show Doing first
              </Button>
              <Button onClick={() => sortTasks("Not done")}>Show Not done first</Button>
              <Button onClick={sortByDeadline}>Sort by deadline</Button>
            </Group>
            <Group mt="md">
              <Button onClick={() => filterTasks("Done")}>Show only Done</Button>
              <Button onClick={() => filterTasks("Not done")}>Show only Not done</Button>
              <Button onClick={() => filterTasks("Doing right now")}>
                Show only Doing
              </Button>
              <Button onClick={() => setFilteredTasks(null)}>Show All</Button>
            </Group>

            {(filteredTasks || tasks).length > 0 ? (
              (filteredTasks || tasks).map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          setOpenedEdit(true);
                          setEditIndex(index);
                          setEditTitle(task.title);
                          setEditSummary(task.summary);
                        }}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <Edit />
                      </ActionIcon>
                      <ActionIcon
                        onClick={() => deleteTask(index)}
                        color={"red"}
                        variant={"transparent"}
                      >
                        <Trash />
                      </ActionIcon>
                    </Group>
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary || "No summary was provided for this task"}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    {task.deadline ? `Deadline: ${task.deadline}` : "No deadline set"}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    {`State: ${task.state}`}
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

