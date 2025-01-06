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
import { MoonStars, Sun, Trash } from "tabler-icons-react";
import { MantineProvider, ColorSchemeProvider } from "@mantine/core";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import { Pencil } from "tabler-icons-react";

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [opened, setOpened] = useState(false);
  const [taskState, setTaskState] = useState("Not done");
  const [filterCriteria, setFilterCriteria] = useState("All tasks");
  const [deadline, setDeadline] = useState(null); 


  const [editOpened, setEditOpened] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSummary, setEditSummary] = useState("");
  const [editState, setEditState] = useState("");
  const [editDeadline, setEditDeadline] = useState("");

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

  function createTask() {
    const newTask = {
      title: taskTitle.current.value,
      summary: taskSummary.current.value,
      state: taskState,
      deadline: deadline,
    };

    if (newTask.title) {
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks, newTask];
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    }
  }

  function deleteTask(index) {
    const filteredTasks = tasks.filter((_, i) => i !== index);
    setTasks(filteredTasks);
    saveTasks(filteredTasks);
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

  function applyFilter(tasks) {
    if (filterCriteria === "All tasks") {
      return tasks;
    }
    return tasks.filter((task) => task.state === filterCriteria);
  }

  function sortTasks(criteria) {
    if (criteria === "deadline") {
      const sortedTasks = [...tasks].sort((a, b) => {
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline) - new Date(b.deadline);
      });
      setTasks(sortedTasks);
    }
    else{
      const sortedTasks = [...tasks].sort((a, b) =>
        a.state === criteria ? -1 : b.state === criteria ? 1 : 0
      );
      setTasks(sortedTasks);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = applyFilter(tasks);

  const formatDate = (dateString) => {
    if (!dateString) return "No deadline set";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  function openEditModal(task, index) {
    setEditingTask({ ...task, index });
    setEditTitle(task.title);
    setEditSummary(task.summary);
    setEditState(task.state);
    setEditDeadline(task.deadline || "");
    setEditOpened(true);
  }
  
  function updateTask() {
    const updatedTask = {
      title: editTitle,
      summary: editSummary,
      state: editState,
      deadline: editDeadline,
    };
  
    const updatedTasks = [...tasks];
    updatedTasks[editingTask.index] = updatedTask;
    setTasks(updatedTasks);
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
              label="State"
              placeholder="Select task state"
              data={["Done", "Not done", "Doing right now"]}
              value={taskState}
              onChange={setTaskState}
              mt="md"
            />

            <TextInput
              type="date"
              label="Deadline"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              mt="md"
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
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder={"Task Title"}
              required
              label={"Title"}
            />
            <TextInput
              mt={"md"}
              value={editSummary}
              onChange={(e) => setEditSummary(e.target.value)}
              placeholder={"Task Summary"}
              label={"Summary"}
            />
            <Select
              label="State"
              placeholder="Select task state"
              data={["Done", "Not done", "Doing right now"]}
              value={editState}
              onChange={setEditState}
              mt="md"
            />
            <TextInput
              type="date"
              label="Deadline"
              value={editDeadline}
              onChange={(e) => setEditDeadline(e.target.value)}
              mt="md"
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
                  updateTask();
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
            <Group mt={"md"} position={"center"}>
              <Button onClick={() => sortTasks("Done")}>Show 'Done' first</Button>
              <Button onClick={() => sortTasks("Doing right now")}>
                Show 'Doing' first
              </Button>
              <Button onClick={() => sortTasks("Not done")}>
                Show 'Not done' first
              </Button>
              <Button onClick={() => sortTasks("deadline")}>
                Sort by Deadline
              </Button>
            </Group>
          
            <Select
              label="Filter Tasks"
              placeholder="Select filter"
              data={[
                { value: "All tasks", label: "All tasks" },
                { value: "Done", label: "Only 'Done'" },
                { value: "Not done", label: "Only 'Not done'" },
                { value: "Doing right now", label: "Only 'Doing right now'" },
              ]}
              value={filterCriteria}
              onChange={setFilterCriteria}
              mt="md"
            />
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task, index) => (
                <Card withBorder key={index} mt={"sm"}>
                  <Group position={"apart"}>
                    <Text weight={"bold"}>{task.title}</Text>
                    <Group spacing={5}>
                      <ActionIcon
                        onClick={() => openEditModal(task, index)}
                        color={"blue"}
                        variant={"transparent"}
                      >
                        <Pencil size={16} />
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
                  <Text color={"blue"} size={"sm"} mt={"xs"}>
                    State: {task.state}
                  </Text>
                  <Text color={"dimmed"} size={"sm"} mt={"xs"}>
                    Deadline: {formatDate(task.deadline)}
                  </Text>
                </Card>
              ))
            ) : (
              <Text size={"lg"} mt={"md"} color={"dimmed"}>
                No tasks matching the criteria
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