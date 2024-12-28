import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Select,
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
  const [currentTask, setCurrentTask] = useState(null); // Task being edited
  const [filter, setFilter] = useState(null);
  const [sortMethod, setSortMethod] = useState(null);

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
      state: taskState.current,
      deadline: taskDeadline.current.value,
    };

    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks, newTask];
      saveTasks(updatedTasks);
      return updatedTasks;
    });

    // Clear inputs
    taskTitle.current.value = "";
    taskSummary.current.value = "";
    taskState.current = "Not done";
    taskDeadline.current.value = "";
  }

  function deleteTask(index) {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.filter((_, taskIndex) => taskIndex !== index);
      saveTasks(updatedTasks);
      return updatedTasks;
    });
  }

  function editTask(index) {
    setCurrentTask({ ...tasks[index], index });
    setEditOpened(true);
  }

  function saveEditedTask() {
    if (currentTask !== null) {
      const updatedTasks = tasks.map((task, index) =>
        index === currentTask.index ? currentTask : task
      );
      setTasks(updatedTasks);
      saveTasks(updatedTasks);
      setEditOpened(false);
      setCurrentTask(null);
    }
  }

  function loadTasks() {
    const loadedTasks = localStorage.getItem("tasks");
    const tasks = JSON.parse(loadedTasks);
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

  const filteredTasks = filter
    ? tasks.filter((task) => task.state === filter)
    : tasks;

  const sortedTasks = sortMethod
    ? [...filteredTasks].sort((a, b) => {
        if (sortMethod === "state") {
          const order = ["Done", "Doing right now", "Not done"];
          return order.indexOf(a.state) - order.indexOf(b.state);
        }
        if (sortMethod === "deadline") {
          return new Date(a.deadline) - new Date(b.deadline);
        }
        return 0;
      })
    : filteredTasks;

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
            <Select
              mt={"md"}
              label="State"
              placeholder="Select state"
              defaultValue="Not done"
              data={["Done", "Not done", "Doing right now"]}
              onChange={(value) => (taskState.current = value)}
            />
            <TextInput
              mt={"md"}
              type="date"
              label="Deadline"
              ref={taskDeadline}
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
                }}
              >
                Add Task
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
            {currentTask && (
              <>
                <TextInput
                  mt={"md"}
                  value={currentTask.title}
                  onChange={(e) =>
                    setCurrentTask((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder={"Task Title"}
                  required
                  label={"Title"}
                />
                <TextInput
                  mt={"md"}
                  value={currentTask.summary}
                  onChange={(e) =>
                    setCurrentTask((prev) => ({ ...prev, summary: e.target.value }))
                  }
                  placeholder={"Task Summary"}
                  label={"Summary"}
                />
                <Select
                  mt={"md"}
                  label="State"
                  placeholder="Select state"
                  value={currentTask.state}
                  data={["Done", "Not done", "Doing right now"]}
                  onChange={(value) =>
                    setCurrentTask((prev) => ({ ...prev, state: value }))
                  }
                />
                <TextInput
                  mt={"md"}
                  type="date"
                  value={currentTask.deadline}
                  onChange={(e) =>
                    setCurrentTask((prev) => ({ ...prev, deadline: e.target.value }))
                  }
                  label="Deadline"
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
                      saveEditedTask();
                    }}
                  >
                    Save Changes
                  </Button>
                </Group>
              </>
            )}
          </Modal>

          {/* Main Content */}
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
              <Button onClick={() => setSortMethod("state")}>
                Sort by State
              </Button>
              <Button onClick={() => setSortMethod("deadline")}>
                Sort by Deadline
              </Button>
              <Button onClick={() => setFilter(null)}>Clear Filter</Button>
              <Button onClick={() => setFilter("Done")}>Show Done</Button>
              <Button onClick={() => setFilter("Not done")}>
                Show Not Done
              </Button>
              <Button onClick={() => setFilter("Doing right now")}>
                Show Doing
              </Button>
            </Group>
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group>
                      <ActionIcon
                        onClick={() => {
                          editTask(index);
                        }}
                        color={"blue"}
                        variant={"transparent"}
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
                  </Group>
                  <Text color={"dimmed"} size={"md"} mt={"sm"}>
                    {task.summary
                      ? task.summary
                      : "No summary was provided for this task"}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    State: {task.state}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"sm"}>
                    Deadline: {task.deadline || "No deadline set"}
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
