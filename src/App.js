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
import { useState, useEffect } from "react";
import { MoonStars, Sun, Trash, Edit } from "tabler-icons-react";

import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [editOpened, setEditOpened] = useState(false); 
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
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskState, setTaskState] = useState("Not done"); 
  const [currentTaskIndex, setCurrentTaskIndex] = useState(null); 

  //3.1
  const taskStates = ["Done", "Not done", "Doing right now"];

  //task1
  function createTask() {
    const newTask = {
      title: taskTitle,
      summary: taskSummary,
      state: taskState,
      deadline: taskDeadline,
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  }
  //task2
  function deleteTask(index) {
    const updatedTasks = tasks.filter((_, taskIndex) => taskIndex !== index);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
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

  const sortTasks = (state) => {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (state === "Done") {
        return a.state === "Done" ? -1 : 1;
      }
      if (state === "Doing right now") {
        return a.state === "Doing right now" ? -1 : 1;
      }
      if (state === "Not done") {
        return a.state === "Not done" ? -1 : 1;
      }
      return 0;
    });
    setTasks(sortedTasks);
  };

  const filterTasks = (state) => {
    const filteredTasks = tasks.filter((task) => task.state === state);
    setTasks(filteredTasks);
  };

  const sortByDeadline = () => {
    const sortedByDeadline = [...tasks].sort((a, b) => {
      if (!a.deadline || !b.deadline) return 0;
      return new Date(a.deadline) - new Date(b.deadline);
    });
    setTasks(sortedByDeadline);
  };

  const editTask = (index) => {
    const task = tasks[index];
    setTaskTitle(task.title);
    setTaskSummary(task.summary);
    setTaskState(task.state);
    setTaskDeadline(task.deadline);

    setCurrentTaskIndex(index);
    setEditOpened(true);  
  };

  const updateTask = () => {
    const updatedTask = {
      title: taskTitle,
      summary: taskSummary,
      state: taskState,
      deadline: taskDeadline,
    };
    const updatedTasks = [...tasks];
    updatedTasks[currentTaskIndex] = updatedTask;
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
    setEditOpened(false);
  };

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
              mt="md"
              label="State"
              placeholder="Select state"
              data={taskStates}
              value={taskState}
              onChange={(value) => setTaskState(value)}
            />
            <TextInput
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              mt={"md"}
              label={"Deadline"}
              type="date"
              placeholder="Select a deadline"
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
                Create Task
              </Button>
            </Group>
          </Modal>

          {/* Edit Task Modal */}
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
              mt="md"
              label="State"
              placeholder="Select state"
              data={taskStates}
              value={taskState}
              onChange={(value) => setTaskState(value)}
            />
            <TextInput
              value={taskDeadline}
              onChange={(e) => setTaskDeadline(e.target.value)}
              mt={"md"}
              label={"Deadline"}
              type="date"
              placeholder="Select a deadline"
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
                onClick={updateTask}
              >
                Update Task
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

            {/* Sorting and Filtering Buttons */}
            <Group position={"apart"} mt="md">
              <Button onClick={() => sortTasks("Done")}>Show 'Done' first</Button>
              <Button onClick={() => sortTasks("Doing right now")}>Show 'Doing' first</Button>
              <Button onClick={() => sortTasks("Not done")}>Show 'Not done' first</Button>
            </Group>
            <Group position={"apart"} mt="md">
              <Button onClick={() => filterTasks("Done")}>Show only 'Done'</Button>
              <Button onClick={() => filterTasks("Not done")}>Show only 'Not done'</Button>
              <Button onClick={() => filterTasks("Doing right now")}>Show only 'Doing'</Button>
            </Group>
            <Button onClick={sortByDeadline} mt="md">
              Sort by deadline
            </Button>

            {/* Tasks List */}
            {tasks.length > 0 ? (
              tasks.map((task, index) => {
                if (task.title) {
                  return (
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
                      <Text size={"sm"} mt={"sm"}>
                        Deadline: {task.deadline || "No deadline set"}
                      </Text>
                    </Card>
                  );
                }
              })
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